sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAGLBalanceSS", {

        onInit: function () {
            // Busy model
            this.oUiModel = this.getOwnerComponent().getModel("UiLoadingStatus");

            // Load CSS if required
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiInterCompanyStockTransfer.view.css")
            );
        },

        /**
         * Fired when user selects a file
         */
        onFileSelected: function (oEvent) {
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || !aFiles.length) {
                return;
            }

            var oFile = aFiles[0];

            // Validate file extension
            if (!/\.xlsx$/i.test(oFile.name)) {
                MessageToast.show("Please select a valid Excel (.xlsx) file");
                return;
            }

            this._oSelectedFile = oFile;

            MessageToast.show("File selected: " + oFile.name);
            console.log("Selected File:", oFile);
        },

        /**
         * Execute button pressed
         */
        onExecutePress: function () {
            debugger
            if (!this._oSelectedFile) {
                MessageToast.show("Please select a file first");
                return;
            }

            var oODataModel = this.getOwnerComponent().getModel("GLBalanceSSModel");

            if (!(oODataModel instanceof sap.ui.model.odata.v2.ODataModel)) {
                MessageToast.show("OData model not found");
                return;
            }

            this.oUiModel.setProperty("/busy", true);

            var oReader = new FileReader();

            oReader.onload = function (oEvent) {
                try {
                    var aBinaryData = oEvent.target.result;

                    // Read Excel
                    var oWorkbook = XLSX.read(aBinaryData, { type: "array" });
                    var sSheetName = oWorkbook.SheetNames[0];
                    var oWorksheet = oWorkbook.Sheets[sSheetName];

                    // Convert to JSON
                    var aExcelData = XLSX.utils.sheet_to_json(oWorksheet, {
                        defval: "",
                        raw: true
                    });

                    if (!aExcelData.length) {
                        MessageToast.show("Excel file is empty");
                        this.oUiModel.setProperty("/busy", false);
                        return;
                    }

                    // Payload for backend
                    var oPayload = {
                        payload: JSON.stringify(aExcelData)
                    };

                    console.log("Payload sent to backend:", oPayload);

                    // Send to backend
                    oODataModel.create("/GL_BALANCESet", oPayload, {
                        success: function (oData, oResponse) {
                            MessageToast.show("Excel data uploaded successfully");

                            // If backend returns JSON as string
                            if (oResponse?.data?.payload) {
                                var aResult = JSON.parse(oResponse.data.payload);

                                var oResultModel = new sap.ui.model.json.JSONModel({
                                    records: aResult
                                });

                                sap.ui.getCore().setModel(
                                    oResultModel,
                                    "stockTransferResultModel"
                                );
                            }
                            this.getOwnerComponent().getRouter().navTo("AiRPAGLBalanceOutput");

                            this.oUiModel.setProperty("/busy", false);
                        }.bind(this),

                        error: function (oError) {
                            console.error("Upload failed:", oError);
                            MessageToast.show("Upload failed");
                            this.oUiModel.setProperty("/busy", false);
                        }.bind(this)
                    });

                } catch (e) {
                    console.error("Excel processing error:", e);
                    MessageToast.show("Error processing Excel file");
                    this.oUiModel.setProperty("/busy", false);
                }
            }.bind(this);

            oReader.onerror = function () {
                MessageToast.show("File read failed");
                this.oUiModel.setProperty("/busy", false);
            }.bind(this);

            oReader.readAsArrayBuffer(this._oSelectedFile);
        }
    });
});
