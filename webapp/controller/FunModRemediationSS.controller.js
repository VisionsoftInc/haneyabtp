sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("haneya.controller.FunModRemediationSS", {

        onInit: function () {
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/UpgConRemediationSS.view.css")
            );
        },

        // 
        OnPressExecute: function () {
    this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", true);

    const sProgram = this.byId("InpProgram").getValue();
    const sPackage = this.byId("InpPackage").getValue();

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
