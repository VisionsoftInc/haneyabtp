sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return Controller.extend("haneya.controller.HANACompatibilitySS", {

        onInit: function () {
            // Load custom CSS
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/HANACompatibilitySS.view.css")
            );

            // Create shared result model (only once)
            if (!this.getOwnerComponent().getModel("HANACompModel")) {
                this.getOwnerComponent().setModel(
                    new JSONModel({ results: [] }),
                    "HANACompModel"
                );
            }
        },

        OnPressExecute: function () {
            var oView = this.getView();
            var oODataModel = this.getOwnerComponent().getModel("HANACompatibilityModel");
            var oJsonModel = this.getOwnerComponent().getModel("HANACompModel");

            // Read inputs
            var sProgram = this.byId("Program").getValue().trim();
            var sPackage = this.byId("Package").getValue().trim();

            // Validation
            if (!sProgram && !sPackage) {
                MessageBox.warning(
                    "Please provide either Program Name or Package Name"
                );
                return;
            }

            // Busy ON
            oView.setBusy(true);

            // Build filters
            var aFilters = [];

            if (sProgram) {
                aFilters.push(
                    new Filter("LINE", FilterOperator.EQ, sProgram)
                );
            }

            if (sPackage) {
                aFilters.push(
                    new Filter("DEVCLASS", FilterOperator.EQ, sPackage)
                );
            }

            // OData read
            oODataModel.read("/HANA_CompSet", {
                filters: aFilters,

                success: function (oData) {
                    // Busy ON
                    oView.setBusy(false);
                    // Set results to JSON model
                    oJsonModel.setData({
                        results: oData && oData.results ? oData.results : []
                    });

                    // Navigate to output page
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("HANACompatibilityOutputTable");
                }.bind(this),

                error: function (oError) {
                    // Busy ON
                    oView.setBusy(false);

                    MessageBox.error("Backend error occurred");
                },
            });
        }
    });
});
