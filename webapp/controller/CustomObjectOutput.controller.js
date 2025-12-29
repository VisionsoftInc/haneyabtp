sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("haneya.controller.CustomObjectOutput", {

        onInit: function () {
            debugger
            // Set OData model to view
          this.oModel = this.getOwnerComponent().getModel("CustObjConModel");
          

            // Flags to sync lifecycle
         

            // Cache SmartTable
            this.oSmartTable = this.byId("conflictsSmartTable");
             this.oModel.metadataLoaded().then(
                        function () {
                            this.oSmartTable.setModel(this.oModel);
                        }.bind(this)
                    );

            // Attach route
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("CustomObjectOutput")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            console.log("Route matched");
            var oArgs = oEvent.getParameter("arguments");
            var oQuery = oEvent.getParameter("query") || {};

            this.sProgram = oArgs.sProgram;
            this.sPackage = oQuery.sPackage;

           

            // Rebind only when SmartTable is ready
            if (this._bSmartTableReady && this.oSmartTable) {
                this.oSmartTable.rebindTable();
            }
        },

        // _onSmartTableInit: function () {
        //     console.log("SmartTable initialized");
        //     this._bSmartTableReady = true;

        //     // Rebind only when route is already matched
        //     if (this._bRouteMatched && this.oSmartTable) {
        //         this.oSmartTable.rebindTable();
        //     }
        // },

        onBeforeRebindTable: function (oEvent) {
            console.log("onBeforeRebindTable fired");
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.filters = oBindingParams.filters || [];

            // Filter: program_name
            if (this.sProgram) {
                oBindingParams.filters.push(
                    new Filter(
                        "program_name",
                        FilterOperator.EQ,
                        this.sProgram
                    )
                );
            }

            // Filter: Package (capital P)
            if (this.sPackage) {
                oBindingParams.filters.push(
                    new Filter(
                        "Package",
                        FilterOperator.EQ,
                        this.sPackage
                    )
                );
            }
        }

    });
});
