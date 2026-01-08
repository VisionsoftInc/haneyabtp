sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.HANACompatibilityOutputTable", {

        onInit: function () {
            debugger
            // Load CSS
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl(
                    "haneya/view/CustObjConOutputTable.view.css"
                )
            );

            // Attach route matched
            this.getOwnerComponent()
                .getRouter()
                .getRoute("HANACompatibilityOutputTable")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Called when route is matched
         * Binds shared JSON model to table
         */
        _onRouteMatched: function () {
            var oResultModel = this
                .getOwnerComponent()
                .getModel("HANACompModel");

            // Safety check
            if (!oResultModel || !oResultModel.getData() || !oResultModel.getData().results) {
                MessageToast.show("No data available to display");
                return;
            }

            // Set model to view for table binding
            this.getView().setModel(oResultModel, "tableModel");

            // Debug log
            console.log(
                "Table data loaded:",
                oResultModel.getData().results
            );
        },

        /**
         * AI Process button handler
         */
        onAiprocess: function () {
            MessageToast.show("AI Process triggered");
        }

    });
});
