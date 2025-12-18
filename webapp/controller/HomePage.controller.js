sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("haneya.controller.HomePage", {
        onInit() {
            var sPath = sap.ui.require.toUrl("haneya/images/Haneya_tool_btp.png");
            var oModel = new sap.ui.model.json.JSONModel({
                src: sPath
            });
            this.getView().setModel(oModel, "imageModel");

             
        },
        onheadtile: function () {
           this.getOwnerComponent().getRouter().navTo("HeadTiles");
        },
       onItemSelect:function(oEvent){
        const oItem = oEvent.getParameter("item");
        const sText = oItem.getText();
        const fullId = oItem.getId();
        const localId = fullId.split("--").pop(); 
        console.log(localId);

        // Parent MenuButton (Category)
        const oMenu = oEvent.getSource();
        const oMenuButton = oMenu.getParent(); // menu → MenuButton
        const sCategory = oMenuButton.getText();
 
        console.log("Clicked Category:", sCategory);
        console.log("Clicked Item:", sText);
 
   
        this.getOwnerComponent().getRouter().navTo("HeadTiles",{text:localId});

       },
        onAiProcessAutomation: function () {
           this.getOwnerComponent().getRouter().navTo("AiProcessAutomationHeadTile");
        },
    });
});