sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAStockTransferOutputScreen", {

        onInit: function () {
            debugger
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiRPAStockTransferOutputScreen.view.css")
            );

            this.getOwnerComponent()
                .getRouter()
                .getRoute("AiRPAStockTransferOutputScreen")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {

            var oResultModel = sap.ui.getCore().getModel("stockTransferResultModel");

            if (!oResultModel) {
                MessageToast.show("No data available");
                return;
            }

            this.getView().setModel(oResultModel, "tableModel");

            console.log("Loaded data:", oResultModel.getData());
        },
        formatArrowValue: function (sCode) {
    switch (sCode) {
        case "@0A@": return 20;   // Red
        case "@09@": return 50;   // Orange
        case "@08@": return 100;  // Green
        default:  return 0;
    }
},

        onAiprocess: function () {
            debugger
            var oTable = this.getView().byId("stocktransfertable");
            var aSelectedIndices = oTable.getSelectedIndices();

            if (aSelectedIndices.length === 0) {
                MessageToast.show("Select at least one row");
                return;
            }

            var oODataModel = this.getOwnerComponent().getModel("stockTransferModel");
            var oTableModel = this.getView().getModel("tableModel");

            /* ------------------------------------------------------- */
            /* Selected Rows → NavStockTransDocuments                  */
            /* ------------------------------------------------------- */
            var aAllIndices = oTable.getBinding("rows").getLength();
var aSelectedIndexMap = {};

aSelectedIndices.forEach(function (iIndex) {
    aSelectedIndexMap[iIndex] = true;
});

var aNavStockTransDocuments = [];

for (var i = 0; i < aAllIndices; i++) {
    var oContext = oTable.getContextByIndex(i);

    if (!oContext) {
        continue;
    }

    var oRow = Object.assign({}, oContext.getObject(), {
        Sel: aSelectedIndexMap[i] ? "X" : ""
    });

    aNavStockTransDocuments.push(oRow);
}


            /* ------------------------------------------------------- */
            /* FULL BACKEND RESPONSE → NavStockTransToConvFile          */
            /* (NO CHANGES AT ALL)                                     */
            /* ------------------------------------------------------- */

            // var aNavStockTransToConvFile =
            //     JSON.parse(JSON.stringify(oTableModel.getProperty("/results") || []));
            var aNavStockTransToConvFile =
                JSON.parse(JSON.stringify(oTableModel.getProperty("/fullResponse/NavStockTransToConvFile/results") || []));


            /* ------------------------------------------------------- */
            /* Payload                                                  */
            /* ------------------------------------------------------- */

            var oPayload = {
    FileId: oTableModel.getProperty("/fileId"),
    SimulationMode: false,
    AL11Path: false,
    AIRPA: true,
    NavFile: [],
    NavStockTransDocuments: aNavStockTransDocuments,
    NavSimulationResp: [],
    NavStockTransToConvFile: aNavStockTransToConvFile
};

            console.log("AI PAYLOAD:", oPayload);

            this.getOwnerComponent()
                .getModel("UiLoadingStatus")
                .setProperty("/busy", true);

            oODataModel.create("/StockTransportInfoSet", oPayload, {

                success: function (oResponse) {
                    
                    this.getOwnerComponent()
                        .getModel("UiLoadingStatus")
                        .setProperty("/busy", false);

                    MessageToast.show("AI processing successful");

                    if (oResponse?.NavStockTransDocuments?.results) {
                        oTableModel.setProperty(
                            "/records",
                            oResponse.NavStockTransDocuments.results
                        );
                        oTableModel.refresh(true);
                    }

                    oTable.clearSelection();

                }.bind(this),

                error: function (oError) {

                    this.getOwnerComponent()
                        .getModel("UiLoadingStatus")
                        .setProperty("/busy", false);

                    MessageBox.error("AI processing failed");
                    console.error(oError);
                }.bind(this)
            });
        }
    });
});
