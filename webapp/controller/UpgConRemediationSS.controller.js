sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return Controller.extend("haneya.controller.UpgConRemediationSS", {

        onInit: function () {
            // Load CSS
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/UpgConRemediationSS.view.css")
            );

            // Shared result model (created once)
            if (!this.getOwnerComponent().getModel("UpgConRemediationDataModel")) {
                this.getOwnerComponent().setModel(
                    new JSONModel({ results: [] }),
                    "UpgConRemediationDataModel"
                );
            }
        },

        OnPressExecute: function () {
            debugger
            var oView = this.getView();
            var oODataModel = this.getOwnerComponent().getModel("UpgConRemediationModel");
            var oResultModel = this.getOwnerComponent().getModel("UpgConRemediationDataModel");

            var sProgram = this.byId("Programid").getValue().trim();
            var sMessageType = this.byId("Messageid").getValue().trim();

            var iSelectedIndex = this.byId("ActionGroup").getSelectedIndex();

            if (!sProgram && !sMessageType) {
                MessageBox.warning("Please provide either Program Name or Message Type");
                return;
            }

            if (iSelectedIndex === -1) {
                MessageBox.warning("Please select Remediate or Rollback");
                return;
            }

            var sMode = iSelectedIndex === 0 ? "REMEDIATE" : "ROLLBACK";

            oView.setBusy(true);

            var aFilters = [];

            if (sProgram) {
                aFilters.push(new Filter("PROG", FilterOperator.EQ, sProgram));
            }

            if (sMessageType) {
                aFilters.push(new Filter("ERR_TYPE", FilterOperator.EQ, sMessageType));
            }

            // Backend expects both flags
            aFilters.push(
                new Filter("REMEDIATION", FilterOperator.EQ, sMode === "REMEDIATE" ? "X" : "")
            );
            aFilters.push(
                new Filter("ROLLBACK", FilterOperator.EQ, sMode === "ROLLBACK" ? "X" : "")
            );

            oODataModel.read("/Upg_Con_RemediationSet", {
                filters: aFilters,

                success: function (oData) {
                    oView.setBusy(false);

                    oResultModel.setData({
                        results: oData && oData.results ? oData.results : []
                    });

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("UpgConRemediationOutputTable", {
                            mode: sMode
                        });
                }.bind(this),

                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Backend error occurred");
                }
            });
        }
    });
});
