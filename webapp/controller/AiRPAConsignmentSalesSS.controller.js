sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
    
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAConsignmentSalesSS", {

        onInit: function () {
            jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/AiRPAConsignmentSalesSS.view.css"));
            this._excelData = []; // Store JSON here
              this.oModel = this.getOwnerComponent().getModel("aiprocess");
              // this.oModel_stocktransfer = this.getOwnerComponent().getModel("stockTransferModel");
              console.log(this.oModel.getServiceMetadata());
        },
        onSourceChange: function (oEvent) {
            var index = oEvent.getSource().getSelectedIndex();

            // Show File Path for "Third Party"
            this.byId("FilePath").setVisible(index === 0);

            // Show Upload section for "Local File"
            this.byId("UploadFile").setVisible(index === 1);
        },
        handleUploadComplete: function (oEvent) {
            var fileName = oEvent.getParameter("files")[0].name;
            sap.m.MessageToast.show("Uploaded: " + fileName);
        },
        onExecutePress: function () {
            var rbGroup = this.byId("rbGroup2");
            var selectedIndex = rbGroup.getSelectedIndex();
            console.log("Selected Index:", selectedIndex);

            // 0 = Third Party
            if (selectedIndex === 0) {
                this.getOwnerComponent().getRouter().navTo("AiRPAStockTransferOutputScreen");
            } else {
                sap.m.MessageToast.show("Please select Third Party to continue.");
            }
        },
        // STEP 1: File Picker
    onSelectExcel() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx";
 
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          sap.m.MessageToast.show("No file selected");
          return;
        }
 
        try {
          const json = await this._excelToJson(file);
          this._excelData = json;
 
          // sap.m.MessageToast.show("Excel converted to JSON");
 
          console.log("JSON DATA:", json);
 
        } catch (err) {
          console.error(err);
          sap.m.MessageToast.show("Error reading Excel");
        }
      };
 
      input.click();
    },
 
    // STEP 2: Convert Excel → JSON
    _excelToJson(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
     debugger
        reader.onload = (e) => {
          try {
            /* global XLSX */
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const firstSheet = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheet];
 
            const json = XLSX.utils.sheet_to_json(sheet, {
              defval: "" // fill empty cells
            });
 
            resolve(json);
 
          } catch (error) {
            reject(error);
          }
        };
 
        reader.onerror = reject;
 
        reader.readAsBinaryString(file);
      });
    },
 
    // STEP 3: Send JSON to Backend OData POST
    onSendJson() {
        debugger
         var oExcelPayload = this.getOwnerComponent().getModel("ExcelPayloadModel");
        let bSimulate = this.byId("chkSimulate").getSelected();  
      if (this._excelData.length === 0) {
        sap.m.MessageToast.show("Upload Excel first");
        return;
      }
 
      const payload1 = {
       payload: JSON.stringify(this._excelData), // send JSON as string
        Simulate: bSimulate ? "X" : "" 
      };
      oExcelPayload.setData({
        payload: JSON.stringify(this._excelData)
      })
 
    //   const oModel = this.getOwnerComponent().getModel("ConsignmentModel");
    //   this.oModel = this.getOwnerComponent().getModel("ConsignmentModel");
 
     this.oModel.create("/Sales_ConsignmentSet", payload1, {
          success: (oData, response) => {
            console.log("Success Data:", oData);
            console.log("Full Response:", response.data.payload);
            sap.m.MessageToast.show("JSON sent successfully");
            debugger
            var payload= JSON.parse(response.data.payload)
            var oConsignmentData=this.getOwnerComponent().getModel("ConsignmentModel")
                oConsignmentData.setData({ records:  payload || response})
            // var oResultModel = new JSONModel({
            //                     records:  payload || response
            //                 });

            //                 sap.ui.getCore().setModel(oResultModel, "ConsignmentResultModel");
            var oRouter = this.getOwnerComponent().getRouter();
                            if (oRouter) {
                                oRouter.navTo("AiRPAConsignmentSalesOutput");
                                console.log("Navigation triggered");
                            }
        },
        error: (err) => {
          //console.error(err);
          sap.m.MessageToast.show("Failed to send JSON");
        }
      });
    }
    });
});
