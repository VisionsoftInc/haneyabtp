sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";
    
    return Controller.extend("haneya.controller.CustomObject", {
        onInit() {
            jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/CustomObject.view.css"));
            this.getOwnerComponent().getRouter().getRoute("CustomObject")
            .attachPatternMatched(this.__onRouteMatched,this);
        }
    });
});