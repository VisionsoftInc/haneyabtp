sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("haneya.controller.AiProcessAutomationSubTile", {

        onInit() {
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiProcessAutomationSubTile.view.css")
            );

            // Attach route matched
            this.getOwnerComponent()
                .getRouter()
                .getRoute("AiProcessAutomationSubTile")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            let oModel = this.getOwnerComponent().getModel("appModel");
            let selectedGroup = oModel.getProperty("/selectedGroup");
            let selectedHeader = oModel.getProperty("/selectedHeader");

            // Show only tiles for selected group
            let tiles = this.byId("tileContainer").getItems();
            tiles.forEach(tile => {
                let tileGroup = tile.getCustomData()[0].getValue();
                tile.setVisible(tileGroup === selectedGroup);
            });

            // Update Page title
            if (this.byId("mainpage")) {
                this.byId("mainpage").setTitle(
                    "Business Automation -> AI Process Automation -> " + selectedHeader
                );
            }
        },

        onTilePress() {
            sap.m.MessageToast.show("No program available for this.");
        },
        
        OnProgram() {
            this.getOwnerComponent().getRouter().navTo("AiProcessAutomationSS");
        },
        OnInterCompStockTran() {
            this.getOwnerComponent().getRouter().navTo("AiInterCompanyStockTransfer");
        },
        OnConsignment() {
            this.getOwnerComponent().getRouter().navTo("AiRPAConsignmentSalesSS");
        },
        OnAiRPASelfCollect(){
            this.getOwnerComponent().getRouter().navTo("AiRPASelfCollect");
        },
        onAiRPAHireToRetire(){
             this.getOwnerComponent().getRouter().navTo("AiRPAHireToRetire");
        }

    });
});
