sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.UpgConRemediationOutputTable", {

        onInit: function () {
            debugger
            // Load CSS
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/CustObjConOutputTable.view.css")
            );

            // Attach route
            this.getOwnerComponent()
                .getRouter()
                .getRoute("UpgConRemediationOutputTable")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sMode = oEvent.getParameter("arguments").mode;

            var oResultModel = this
                .getOwnerComponent()
                .getModel("UpgConRemediationDataModel");

            if (!oResultModel || !oResultModel.getData() || !oResultModel.getData().results) {
                MessageToast.show("No data available");
                return;
            }

            // Bind table model
            this.getView().setModel(oResultModel, "tableModel");

            // Toggle columns
            this._toggleColumns(sMode);
        },

        _toggleColumns: function (sMode) {
            var oTable = this.byId("UpgConRemTable");
            var aCols = oTable.getColumns();

            if (sMode === "REMEDIATE") {
                // Show Remediate columns
                aCols[0].setVisible(true);  // SL.NO
                aCols[1].setVisible(true);  // LINE NO
                aCols[2].setVisible(true);  // PROG
                aCols[3].setVisible(true);  // ERR_TYPE
                aCols[4].setVisible(true);  // KIND
                aCols[5].setVisible(true);  // ERROR_DESC
                aCols[6].setVisible(true);  // AUTO_MANUAL
                aCols[7].setVisible(false); // PRG
                aCols[8].setVisible(false); // DESC
            } else {
                // Hide Remediate columns
                aCols[0].setVisible(false);
                aCols[1].setVisible(false);
                aCols[2].setVisible(false);
                aCols[3].setVisible(false);
                aCols[4].setVisible(false);  
                aCols[5].setVisible(false);  
                aCols[6].setVisible(false);
                aCols[7].setVisible(true);
                aCols[8].setVisible(true);
            }

            oTable.invalidate();
        }
    });
});
