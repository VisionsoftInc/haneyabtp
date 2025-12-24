sap.ui.define([
	"sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel"
], function(
	Controller,
    JSONModel
) {
	"use strict";

	return Controller.extend("haneya.controller.AiRPASelfCollect", {
       onInit:function(){
        
         jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/AiRPASelfCollect.view.css"));
		 this._excelData = [];
       },
	   onFileChange: function (oEvent) {
           const file = oEvent.getParameter("files")[0];
    if (!file) {
        sap.m.MessageToast.show("No file selecteed");
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        this._excelData = XLSX.utils.sheet_to_json(sheet, {
            defval: ""
        });

        console.log("Excel Data:", this._excelData);
        sap.m.MessageToast.show("Excel loaded");
    };

    reader.readAsBinaryString(file);
},
handleUploadPress: function () {

    if (!this._excelData || this._excelData.length === 0) {
        sap.m.MessageToast.show("Upload Exceeel first");
        return;
    }

    console.log("Using Excel Data:", this._excelData);

    const payload1 = {
       payload: JSON.stringify(this._excelData) // send JSON as string
       
      };
    debugger
    // Example: send to backend
    this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", true);

    this.getOwnerComponent().getModel("yourODataModel").create(
        "/YourEntitySet",
       payload1,
        {
            success: () => {
                this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
                sap.m.MessageToast.show("Processed successfully");
                 var oResultSelfCollect  = new sap.ui.model.json.JSONModel({
                        records: parsed
                    });
                    sap.ui.getCore().setModel(oResultSelfCollect, "selfCollectResultModel");
            },
            error: () => {
                this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
                sap.m.MessageToast.show("Failed");
            }
        }
    );
}



	});
});