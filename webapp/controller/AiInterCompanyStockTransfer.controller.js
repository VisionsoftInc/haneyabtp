sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiInterCompanyStockTransfer", {

        onInit: function () {
            this.oUiModel= this.getOwnerComponent().getModel("UiLoadingStatus");
            // Load CSS
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiInterCompanyStockTransfer.view.css")
            );

            // Dynamic file path (display only)
            var oToday = new Date();
            var sFormattedDate =
                oToday.getFullYear().toString() +
                String(oToday.getMonth() + 1).padStart(2, "0") +
                String(oToday.getDate()).padStart(2, "0");

            this.getView().setModel(new JSONModel({
                filePath: "/tmp/Inter_company_stock_" + sFormattedDate + ".txt"
            }), "fileModel");

            // ✅ Unified Result Model (USED BY BOTH FLOWS)
            var oResultModel = new JSONModel({
                records: []
            });
            sap.ui.getCore().setModel(oResultModel, "stockTransferResultModel");

            // Metadata Debug
            var oODataModel = this.getOwnerComponent().getModel("stockTransferModel");
            if (!oODataModel) {
                console.error("stockTransferModel not found");
                return;
            }

            oODataModel.metadataLoaded().then(function () {
                var aFunctionImports =
                    oODataModel.getServiceMetadata()
                        .dataServices.schema[0].entityContainer[0].functionImport;

                console.log("Available Function Imports:",
                    aFunctionImports.map(f => f.name));
            });
        },

        // Radio Button Selection
        onSourceChange: function (oEvent) {
            var iIndex = oEvent.getSource().getSelectedIndex();
            this.byId("hbFilePath").setVisible(iIndex === 0);
            this.byId("hbUploadFile").setVisible(iIndex === 1);
        },

        // File Selection
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
        // Execute Button
        onExecutePress: function () {
            debugger

            var iIndex = this.byId("rbGroup1").getSelectedIndex();
            var oResultModel = sap.ui.getCore().getModel("stockTransferResultModel");

            // CASE 1: THIRD PARTY
            if (iIndex === 0) {

    var bSimulate = this.byId("simulateCheckBox")?.getSelected() || false;
    var oModel = this.getOwnerComponent().getModel("stockTransferModel");

    if (!(oModel instanceof sap.ui.model.odata.v2.ODataModel)) {
        MessageToast.show("OData model not found");
        return;
    }

    // ✅ Define backend input here
    var oFunctionInput = {
        Simulation: bSimulate
    };
     this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", true);
    oModel.metadataLoaded().then(function () {

        // ✅ Now this works
        console.log("Calling InterCompanySto with input:", oFunctionInput);

        oModel.callFunction("/InterCompanySto", {
            method: "GET",
            urlParameters: oFunctionInput,

            success: function (oResponse) {
                console.log("Third Party Response:", oResponse);
                
                this.oUiModel.setProperty("/busy", false);
                var aRecords = [];
                if (Array.isArray(oResponse?.results)) {
                    aRecords = oResponse.results;
                } else if (oResponse) {
                    aRecords = [oResponse];
                }

                oResultModel.setData({ records: aRecords });
                oResultModel.refresh(true);

                MessageToast.show("Third Party execution successful");

                var oRouter = this.getOwnerComponent().getRouter();
                if (oRouter) {
                    oRouter.navTo("AiRPAStockTransferOutputScreen");
                }
            }.bind(this),

            error: function (oError) {
                
            this.oUiModel.setProperty("/busy", true);
                console.error("Function Import Error:", oError);
                MessageToast.show("Third Party execution failed");
            }
        });

    }.bind(this));

    return;
}
            // CASE 2: LOCAL FILE UPLOAD
            if (iIndex === 1) {
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
