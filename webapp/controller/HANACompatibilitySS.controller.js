sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("haneya.controller.HANACompatibilitySS", {

        onInit: function () {
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/HANACompatibilitySS.view.css")
            );
        },

        // 
        OnPressExecute: function () {
    this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", true);

    const sProgram = this.byId("Program").getValue();
    const sPackage = this.byId("Package").getValue();

    this.getOwnerComponent().getRouter().navTo(
        "CustomObjectOutput",
        {
            sProgram: sProgram
        },
        {
            query: {
                sPackage: sPackage
            }
        }
    );

    this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", false);
},

    });
});
