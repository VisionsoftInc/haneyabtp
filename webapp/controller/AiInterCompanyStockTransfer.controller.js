sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiInterCompanyStockTransfer", {

        onInit: function () {

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

        onFileSelected: function (oEvent) {
    var oFile = oEvent.getParameter("files")[0];

    if (!oFile.type.includes("spreadsheet") && !oFile.name.endsWith(".xlsx")) {
        MessageToast.show("Please select a valid Excel file");
        return;
    }

    // ✅ Store file reference for later use
    this._oSelectedFile = oFile;

    MessageToast.show("File selected: " + oFile.name);
    console.log("Selected file:", oFile);
},
        // Execute Button
        onExecutePress: function () {

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

    oModel.metadataLoaded().then(function () {

        // ✅ Now this works
        console.log("Calling InterCompanySto with input:", oFunctionInput);

        oModel.callFunction("/InterCompanySto", {
            method: "GET",
            urlParameters: oFunctionInput,

            success: function (oResponse) {
                console.log("Third Party Response:", oResponse);

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
                console.error("Function Import Error:", oError);
                MessageToast.show("Third Party execution failed");
            }
        });

    }.bind(this));

    return;
}

            // CASE 2: LOCAL FILE UPLOAD
            if (iIndex === 1) { // Local File
    if (!this._oSelectedFile) {
        MessageToast.show("Please select a file first");
        return;
    }

    var oFile = this._oSelectedFile;
    var bSimulate = this.byId("simulateCheckBox").getSelected(); 
    var oReader = new FileReader();
    var oModel = this.getOwnerComponent().getModel("stockTransferModel");
    var oResultModel = sap.ui.getCore().getModel("stockTransferResultModel");

    oReader.onload = function (oEvent) {
        var aBinaryData = oEvent.target.result; // ArrayBuffer

        console.log("File Name:", oFile.name);
        console.log("Mime Type:", oFile.type);
        console.log("Binary Size:", aBinaryData.byteLength);
        console.log("Simulation flag:", bSimulate);

        // ✅ Parse Excel using SheetJS (XLSX)
        sap.ui.require(["my/app/lib/xlsx"], function (XLSX) {
            var oWorkbook = XLSX.read(aBinaryData, { type: "array" });

            // Read first sheet
            var sSheetName = oWorkbook.SheetNames[0];
            var oWorksheet = oWorkbook.Sheets[sSheetName];

            // Convert sheet to JSON
            var aExcelData = XLSX.utils.sheet_to_json(oWorksheet, {
                defval: "", // avoid undefined
                raw: false  // formatted values
            });

            console.log("Excel JSON Data:", aExcelData);

            if (!aExcelData.length) {
                MessageToast.show("Excel file is empty");
                return;
            }

            // ✅ Prepare payload for backend
            var oPayload = {
                FileName: oFile.name,
                Simulation: bSimulate,
                Records: aExcelData
            };

            console.log("Payload sent to FileSet:", oPayload);

            // ✅ Send JSON payload to backend
            oModel.create("/FileSet", oPayload, {
                success: function (oResponse) {
                    var aRecords = Array.isArray(oResponse?.results)
                        ? oResponse.results
                        : [oResponse];

                    oResultModel.setData({ records: aRecords });
                    oResultModel.refresh(true);

                    MessageToast.show("Excel processed successfully");
                },
                error: function (oError) {
                    console.error("Upload failed:", oError);
                    MessageToast.show("Upload failed");
                }
            });
        });
    }.bind(this);

    oReader.onerror = function () {
        MessageToast.show("File read failed");
    };

    // Read Excel as ArrayBuffer
    oReader.readAsArrayBuffer(oFile);
}

            MessageToast.show("Please select Third Party or Local File");
        }

    });
});
