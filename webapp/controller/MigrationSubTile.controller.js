sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("haneya.controller.MigrationSubTile", {
        onInit() {
           jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/HeadTiles.view.css"));

           // Attach route matched
            this.getOwnerComponent()
                .getRouter()
                .getRoute("MigrationSubTile")
                .attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            const oModel = this.getOwnerComponent().getModel("MigrationModel");
            const selectedGroup = oModel.getProperty("/selectedGroup");
            const selectedHeader = oModel.getProperty("/selectedHeader");
            const aItems = this.byId("Migration").getItems();

            aItems.forEach(item => {
                // Ignore non-tiles (like Text)
                if (!item.isA("sap.m.GenericTile")) {
                    return;
                }

            const tileGroup = item
                .getCustomData()
                .find(cd => cd.getKey() === "group")
                ?.getValue();

                item.setVisible(tileGroup === selectedGroup);
            });

            if (this.byId("SubTilepage")) {
                this.byId("SubTilepage").setTitle(
                    "Migration -> S/4 HANA 2021 to 2023 -> " + selectedHeader
                );
            }
        },
        OnAuthObjRemediation: function () {
           this.getOwnerComponent().getRouter().navTo("MigrationAuthObjRemSS");
        },
        OnPressSecRolRemediation: function () {
           this.getOwnerComponent().getRouter().navTo("MigrationSecRolRemSS");
        }

    });
});