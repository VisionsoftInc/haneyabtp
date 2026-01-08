sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAGLBalanceOutput", {

        onInit: function () {
            debugger

            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiRPAStockTransferOutputScreen.view.css")
            );
            
            // Get model created in upload controller
            var oGlobalResultModel = sap.ui.getCore().getModel("stockTransferResultModel");

            if (!oGlobalResultModel) {
                MessageToast.show("No output data available");
                return;
            }

            // Attach to this view with name expected by XML
            this.getView().setModel(oGlobalResultModel, "tableModel");

            console.log(
                "Output Table Records:",
                oGlobalResultModel.getProperty("/records")
            );
        },

        /**
         * AI Process button press
         */
        onAiprocess: function () {
            var oModel = this.getView().getModel("tableModel");

            if (!oModel || !oModel.getProperty("/records")?.length) {
                MessageToast.show("No data to process");
                return;
            }

            var aSelectedIndices = this.byId("GLBalancetable").getSelectedIndices();

            if (!aSelectedIndices.length) {
                MessageToast.show("Please select at least one row");
                return;
            }

            var aRecords = oModel.getProperty("/records");

            var aSelectedRecords = aSelectedIndices.map(function (iIndex) {
                return aRecords[iIndex];
            });

            console.log("Selected Records for AI Process:", aSelectedRecords);

            MessageToast.show(aSelectedRecords.length + " records sent for AI processing");
        }

    });
});
