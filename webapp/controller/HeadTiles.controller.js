sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("haneya.controller.HeadTiles", {
        onInit() {
           jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/HeadTiles.view.css"));
            this.getOwnerComponent().getRouter().getRoute("HeadTiles")
            .attachPatternMatched(this.__onRouteMatched,this);
        },
       __onRouteMatched:function(oEvent){
        debugger;
          this.byId("idoneU").setVisible(false)
            this.byId("idtwoU").setVisible(false)
        const stext=decodeURIComponent(oEvent.getParameter("arguments").text)
          const tile= this.byId(stext+"U");
          tile.setVisible(true);

       },

        onsubtile: function () {
           this.getOwnerComponent().getRouter().navTo("SubTiles");
        }
    });
});