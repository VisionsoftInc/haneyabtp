sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("haneya.controller.AiProcessAutomationHeadTile", {

        onInit() {
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiProcessAutomationHeadTile.view.css")
            );
        },

        OnHeadTile: function (oEvent) {
            // Get group and header
            let group = oEvent.getSource().getCustomData()[0].getValue();
            let header = oEvent.getSource().getHeader();

            // Store in appModel
            let oModel = this.getOwnerComponent().getModel("appModel");
            oModel.setProperty("/selectedGroup", group);
            oModel.setProperty("/selectedHeader", header);

            // Navigate to sub-tile view
            this.getOwnerComponent().getRouter().navTo("AiProcessAutomationSubTile");
        }

    });
});
