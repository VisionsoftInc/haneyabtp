sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
    "use strict";

    return Controller.extend("haneya.controller.CustomObject", {

        onInit: function () {
            debugger
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/CustomObject.view.css")
            );

            // Create shared JSON model (only once)
            if (!this.getOwnerComponent().getModel("CustObjDataModel")) {
                this.getOwnerComponent().setModel(
                    new JSONModel(),
                    "CustObjDataModel"
                );
            }
        },

        OnPressExecute: function () {
            debugger
    var oView = this.getView();
    var oODataModel = this.getOwnerComponent().getModel("CustObjConModel");
    var oJsonModel = this.getOwnerComponent().getModel("CustObjDataModel");

    // Read input values
    var sProgram = this.byId("programInput").getValue().trim();
    var sPackage = this.byId("packageInput").getValue().trim();

    // Validation (recommended)
    if (!sProgram && !sPackage) {
        sap.m.MessageBox.warning(
            "Please provide either Program Name or Package Name"
        );
        return;
    }

    oView.setBusy(true);

    var aFilters = [];

    // 🔹 Map UI values → OData property names
    if (sProgram) {
        aFilters.push(
            new sap.ui.model.Filter(
                "program_name",       // EXACT metadata name
                sap.ui.model.FilterOperator.EQ,
                sProgram
            )
        );
    }

    if (sPackage) {
        aFilters.push(
            new sap.ui.model.Filter(
                "Package",       // EXACT metadata name
                sap.ui.model.FilterOperator.EQ,
                sPackage
            )
        );
    }

    oODataModel.read("/Custom_Object_ConflictsSet", {
        filters: aFilters,

        success: function (oData) {
            oView.setBusy(false);
             // Busy OFF
            // this.getOwnerComponent()
            //     .getModel("UiLoadingStatus")
            //     .setProperty("/busy", false);

            oJsonModel.setData({
                results: oData?.results || []
            });

            this.getOwnerComponent()
                .getRouter()
                .navTo("CustObjConOutputTable");
        }.bind(this),

        error: function (oError) {
            // // Busy OFF
            // this.getOwnerComponent()
            //     .getModel("UiLoadingStatus")
            //     .setProperty("/busy", false);
            oView.setBusy(false);
    
            sap.m.MessageBox.error(
                "Backend error occurred"
            );
        },

        // complete: function () {
        //     oView.setBusy(false);
        // }
        

    });
}

    });
});
