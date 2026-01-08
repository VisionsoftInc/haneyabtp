sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiInterCompanyStockTransfer", {

        onInit: function () {

            this.oUiModel = this.getOwnerComponent().getModel("UiLoadingStatus");

            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiInterCompanyStockTransfer.view.css")
            );

            var oDate = new Date();
    var sToday =
        oDate.getFullYear().toString() +
        String(oDate.getMonth() + 1).padStart(2, "0") +
        String(oDate.getDate()).padStart(2, "0");

    var sFilePath = "/tmp/Inter_company_stock_" + sToday + ".txt";

    // Model for file path
    var oFileModel = new sap.ui.model.json.JSONModel({
        filePath: sFilePath
    });

    this.getView().setModel(oFileModel, "fileModel");

    // Result model shared across controllers
    sap.ui.getCore().setModel(
        new sap.ui.model.json.JSONModel({
            fileId: "",
            records: []
        }),
        "stockTransferResultModel"
    );

            // Result model shared across controllers
            sap.ui.getCore().setModel(
                new JSONModel({
                    fileId: "",
                    records: []
                }),
                "stockTransferResultModel"
            );
        },
        onSourceChange: function (oEvent) {
    var iSelectedIndex = oEvent.getParameter("selectedIndex");

    var oFilePathBox = this.byId("hbFilePath");
    var oUploadBox = this.byId("hbUploadFile");

    // Case 1: Third Party
    if (iSelectedIndex === 0) {
        oFilePathBox.setVisible(true);
        oUploadBox.setVisible(false);

        // Match backend case 1 logic
        this._sourceType = "THIRD_PARTY";
    }

    // Case 2: Local File
    else if (iSelectedIndex === 1) {
        oFilePathBox.setVisible(false);
        oUploadBox.setVisible(true);

        // Match backend case 2 logic
        this._sourceType = "LOCAL_FILE";
    }
},
onFileSelected: function (oEvent) {
            var oFile = oEvent.getParameter("files")[0];

            if (!oFile.type.includes("spreadsheet") && !oFile.name.endsWith(".xlsx")) {
                MessageToast.show("Please select a valid Excel file");
                return;
            }

            // Store file reference for later use
            this._oSelectedFile = oFile;

            MessageToast.show("File selected: " + oFile.name);
            console.log("Selected file:", oFile);
        },
onExecutePress: function () {
    debugger;

    var iIndex = this.byId("rbGroup1").getSelectedIndex();
    var bSimulate = this.byId("simulateCheckBox").getSelected() || false;

    var oModel = this.getOwnerComponent().getModel("stockTransferModel");
    var oResultModel = sap.ui.getCore().getModel("stockTransferResultModel");

    if (!(oModel instanceof sap.ui.model.odata.v2.ODataModel)) {
        sap.m.MessageToast.show("OData model not found");
        return;
    }

    this.oUiModel.setProperty("/busy", true);

    /* ========================================================= */
    /* CASE 1 : THIRD PARTY (AL11 PATH)                           */
    /* ========================================================= */
    if (iIndex === 0) {

        var sFileId = Date.now().toString();

        var oPayload = {
            FileId: sFileId,
            SimulationMode: bSimulate,
            AIRPA: false,
            AL11Path: true,
            NavFile: [],
            NavStockTransDocuments: [],
            NavSimulationResp: [],
            NavStockTransToConvFile: []
        };

        oModel.create("/StockTransportInfoSet", oPayload, {
            success: function (oResponse) {
                this.oUiModel.setProperty("/busy", false);

                var aRecords = [];
                if (oResponse?.NavStockTransDocuments?.results) {
                    aRecords = oResponse.NavStockTransDocuments.results;
                }

                oResultModel.setData({
                    fileId: sFileId,
                    records: aRecords,
                    fullResponse: oResponse
                });
                oResultModel.refresh(true);

                sap.m.MessageToast.show("Third Party execution successful");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("AiRPAStockTransferOutputScreen");
            }.bind(this),

            error: function (oError) {
                this.oUiModel.setProperty("/busy", false);
                console.error(oError);
                sap.m.MessageToast.show("Third Party execution failed");
            }.bind(this)
        });

        return;
    }

    /* ========================================================= */
    /* CASE 2 : LOCAL FILE UPLOAD                                */
    /* ========================================================= */
    if (iIndex === 1) {
        debugger
    if (!this._oSelectedFile) {
        sap.m.MessageToast.show("Please select a file first");
        return;
    }

    let bSimulate = this.byId("simulateCheckBox").getSelected();
    var oReader = new FileReader();
    var oModel = this.getOwnerComponent().getModel("stockTransferModel");

    // this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", true);

    oReader.onload = function (oEvent) {
        var aBinaryData = oEvent.target.result;

        // Read Excel and convert directly to JSON
        var oWorkbook = XLSX.read(aBinaryData, { type: "array" });
        var sSheetName = oWorkbook.SheetNames[0];
        var oWorksheet = oWorkbook.Sheets[sSheetName];

        // Convert sheet to JSON directly
        var aExcelData = XLSX.utils.sheet_to_json(oWorksheet, {
            defval: "",   // empty cells become ""
            raw: true     // keep numbers as numbers
        });

        // if (!aExcelData.length) {
        //     sap.m.MessageToast.show("Excel file is empty");
        //     this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
        //     return;
        // }

        // Build payload like onSendJson()
        var payload = {
            payload: JSON.stringify(aExcelData),  // pure JSON as string
            Simulate: bSimulate ? "X" : ""
        };

        console.log("FINAL PAYLOAD:", payload);

        oModel.create("/FileSet", payload, {
            success: function (oData, response) {
                sap.m.MessageToast.show("Excel JSON sent successfully");

                // backend returning payload as string
                if (response?.data?.payload) {
                    var parsed = JSON.parse(response.data.payload);
                    var oResultModel = new sap.ui.model.json.JSONModel({
                        records: parsed
                    });
                    sap.ui.getCore().setModel(oResultModel, "stockTransferResultModel");
                }

                // this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
            }.bind(this),
            error: function (err) {
                this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
                sap.m.MessageToast.show("Upload failed");
            }.bind(this)
        });

    }.bind(this);

    oReader.onerror = function () {
        sap.m.MessageToast.show("File read failed");
        // this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
    }.bind(this);

    oReader.readAsArrayBuffer(this._oSelectedFile);
}

}

    });
});
