sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";
    
    return Controller.extend("haneya.controller.SubTiles", {
        onInit() {
              jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/HeadTiles.view.css"));
        },
        oncustomobjectsconflicts: function () {
           this.getOwnerComponent().getRouter().navTo("CustomObject");
        },
        
        OnHANACompatibility: function () {
           this.getOwnerComponent().getRouter().navTo("HANACompatibilitySS");
        },

        OnUpgConRemediation: function () {
           this.getOwnerComponent().getRouter().navTo("UpgConRemediationSS");
        },

        OnFunModRemediation: function () {
           this.getOwnerComponent().getRouter().navTo("FunModRemediationSS");
        },
    });
});