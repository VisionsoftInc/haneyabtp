sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("haneya.controller.MigrationAuthObjRemSS", {

        onInit: function () {
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiInterCompanyStockTransfer.view.css")
            );
        },

        onExecutePress: function () {
    var oView = this.getView();
    var oODataModel = this.getOwnerComponent().getModel("AuthObjRemediationModel");

    // Ensure result model exists
    var oResultModel = this.getOwnerComponent().getModel("AuthObjRemediationDataModel");
    if (!oResultModel) {
        oResultModel = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent().setModel(oResultModel, "AuthObjRemediationDataModel");
    }

    var sFrom = this.byId("TransCodeFrom").getValue().trim();
    var sTo = this.byId("TransCodeTo").getValue().trim();

    if (!sFrom && !sTo) {
        MessageBox.warning("Please provide at least one Transaction Code");
        return;
    }

    oView.setBusy(true);

    var aFilters = [];
    if (sFrom) aFilters.push(new Filter("Zrtcode", FilterOperator.GE, sFrom));
    aFilters.push(new Filter("Zrtcode", FilterOperator.LE, sTo || " "));

    var oCombinedFilter = new Filter({
        filters: aFilters,
        and: true
    });

    // Store `this` and `oResultModel` so the callback can access them
    var that = this;

    oODataModel.read("/Object_RemediationSet", {
        filters: [oCombinedFilter],
        success: function (oData) {
            oView.setBusy(false);

            // Use the model captured outside
            var aResults = oData.results || (oData.d && oData.d.results) || [];
            console.log("Fetched results:", aResults);

            oResultModel.setData({ results: aResults });

            // Navigate AFTER model is populated
            that.getOwnerComponent().getRouter().navTo("MigrationAuthObjRemOutputTable");
        },
        error: function (oError) {
            oView.setBusy(false);
            MessageBox.error(
                "Backend error occurred.\n" + (oError.message || "Unknown error")
            );
        }
    });
}

    });
});
