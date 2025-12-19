sap.ui.define([
    "sap/ui/core/UIComponent",
    "haneya/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("haneya.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");

            // Global app model
            this.setModel(new JSONModel({
                selectedGroup: ""
            }), "appModel");
               var oExcelPayloadModel = new JSONModel({});
               this.setModel( oExcelPayloadModel, "ExcelPayloadModel");
                var oConsignmentPayloadModel = new JSONModel({});
               this.setModel( oConsignmentPayloadModel, "ConsignmentModel");
                var oUiLoadingStatus = new JSONModel({
                     busy: false
                });
               this.setModel( oUiLoadingStatus, "UiLoadingStatus");
               
            this.getRouter().initialize();
        }
    });
});
