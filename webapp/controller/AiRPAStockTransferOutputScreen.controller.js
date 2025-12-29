sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAStockTransferOutputScreen", {

        onInit: function () {
            // Attach route matched
            debugger
            jQuery.sap.includeStyleSheet(
                        sap.ui.require.toUrl(
                            "haneya/view/AiRPAStockTransferOutputScreen.view.css"
                        )
            );
            this.getOwnerComponent()
                .getRouter()
                .getRoute("AiRPAStockTransferOutputScreen")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // 1️⃣ Get the model from Core (set by previous controller)
            var oResultModel = sap.ui.getCore().getModel("stockTransferResultModel");

            if (!oResultModel) {
                MessageToast.show("No data available to display");
                return;
            }

            // 2️⃣ Set it on this view
            this.getView().setModel(oResultModel, "tableModel");

            console.log("Data loaded for table:", oResultModel.getData());
        },

        onAiprocess: function () {
            
            MessageToast.show("Reprocess triggered");
        }

    });
});
