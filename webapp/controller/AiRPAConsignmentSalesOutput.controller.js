sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAConsignmentSalesOutput", {

        onInit: function () {
           this.oUisModel= this.getOwnerComponent().getModel("UiLoadingStatus");
          this.oModel=this.getOwnerComponent().getModel("aiprocess")
           var oModel = this.getOwnerComponent().getModel("ConsignmentModel");
   jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/AiRPAConsignmentSalesOutput.view.css"));
            debugger
       
            
        },
      onTableUpdateFinished: function (oEvent) {
    var oTable = oEvent.getSource();
    var aItems = oTable.getItems();

    aItems.forEach(function (oItem) {
        var oCtx = oItem.getBindingContext("ConsignmentModel");
        if (!oCtx) {
            return;
        }

        var sRemarks = oCtx.getProperty("REMARKS");

        // 🔥 clean first
        oItem.removeStyleClass("rowSuccess");
        oItem.removeStyleClass("rowError");

        if (sRemarks === "SUCCESS") {
            oItem.addStyleClass("rowSuccess");
        } else {
            oItem.addStyleClass("rowError");
        }
    });
},



//         onSelectionChange: function (oEvent) {

//     var oTable = oEvent.getSource();
//     var aChangedItems = oEvent.getParameter("listItems"); // changed rows

//     aChangedItems.forEach(function (oItem) {

//         var oRowData = oItem
//             .getBindingContext("ConsignmentModel")
//             .getObject();

//         // ❌ If BILLNO is NOT empty → prevent selection
//         if (oRowData.BILLNO && oRowData.BILLNO.trim() !== "") {
//             oTable.removeSelection(oItem);
//             sap.m.MessageToast.show("This row is already billed and cannot be reprocessed");
//         }
//     });
// }, 


//       onReprocessPress: function () {
//         debugger
//         var oExcelPayload = this.getOwnerComponent().getModel("ExcelPayloadModel");
//          console.log(oExcelPayload.oData.payload)

//     var oTable = this.byId("ConsignmentTable");

//     // Get selected items (ColumnListItem)
//     // var aSelectedItems = oTable.getSelectedItems();

//     // if (aSelectedItems.length === 0) {
//     //     sap.m.MessageToast.show("Please select at least one row.");
//     //     return;
//     // }
//     var oModel = this.getOwnerComponent().getModel("ConsignmentModel");
// var aAllRecords = oModel.getProperty("/records") || [];
// var aSelectedItemst = aAllRecords.filter(function(row) {
//     return row.selected === true;
// });
// aSelectedItemst.forEach(function (item) {
//     delete item.selected;
// });

// // if (aSelectedItems.length === 0) {
// //     sap.m.MessageToast.show("Please select at least one row.");
// //     return;
// // }
//     var oPayload = { MAIN_ID: oExcelPayload.oData.payload, NP_Consign: [] };
//     var aOriginalRows = [];


// aSelectedItemst.forEach(function (oRow) {
//     aOriginalRows.push(JSON.parse(JSON.stringify(oRow)));
//     var oPayloadRow = Object.assign({}, oRow);
//     delete oPayloadRow.selected;
//     delete oPayloadRow.__metadata;
//     oPayload.NP_Consign.push(oPayloadRow);
// });
//             // var aOriginalRows = [];
//             //  var aSelectedData = aSelectedItems.map(function(oItem) {
//             //   var oData= oItem.getBindingContext("ConsignmentModel").getObject();
//             //     aOriginalRows.push(JSON.parse(JSON.stringify(oData)));
//             //     delete oData.__metadata;
//             //     oPayload.NP_Consign.push(Object.assign({}, oData));
//                 //  oPayload.NP_Consign.push(Object.assign({}, aSelectedItems));
//             // });
//             //   oPayload.NP_Consign.push(Object.assign({}, aSelectedItemst));
//              this.oModel.create("/Consignment_ReproSet", oPayload, {
//                 success: function (data) {
//                       var aUpdatedRows = data.NP_Consign && data.NP_Consign.results
//             ? data.NP_Consign.results
//             : [];

//         if (!aUpdatedRows.length) {
//             sap.m.MessageToast.show("No updated records returned");
//             return;
//         }

//         // 2️⃣ Get table model data
//         var oConsignmentModel = this.getOwnerComponent()
//             .getModel("ConsignmentModel");

//         var aExistingRows = oConsignmentModel.getProperty("/records") || [];

//         // 3️⃣ Update existing rows
//         aUpdatedRows.forEach(function (oUpdatedRow) {

//             // remove OData metadata
//             var oCleanRow = Object.assign({}, oUpdatedRow);
//             delete oCleanRow.__metadata;

//             var iIndex = aExistingRows.findIndex(function (oRow) {
//                 return oRow.MAIN_ID === oCleanRow.MAIN_ID;
//             });

//             if (iIndex !== -1) {
//                 aExistingRows[iIndex] = oCleanRow;
//             }
//         });

       
//         oConsignmentModel.setProperty("/records", aExistingRows);

//         sap.m.MessageToast.show("Reprocess completed successfully");

//         // Optional: clear selection
//         this.byId("ConsignmentTable").removeSelections(true);
//                     console.log(data,"success submitting reprocess");
//                 }.bind(this),
//               error: function(oError) {
//               console.log("Error submitting reprocess");
//         console.error(oError);
//     }
//             })

   
//         }


onReprocessPress: function () {
    debugger
    var oUIModel = this.getOwnerComponent().getModel("ConsignmentModel");
    var aRecords = oUIModel.getProperty("/records");
    
    // 1️⃣ Collect selected rows
    var aSelected = aRecords.filter(function (oRow) {
        return oRow.selected === true;
    });

    if (aSelected.length === 0) {
        sap.m.MessageToast.show("Select at least one failed record");
        return;
    }

    // 2️⃣ Build deep payload
    var oPayload = {
        SO_NUMBER: "",
        NP_Evt_Consign: aSelected.map(function (oRow) {
            return {
                SO_NUMBER: oRow.SO_NUMBER,
                SO_STATUS: oRow.SO_STATUS,
                OUT_DELIVERY: oRow.OUT_DELIVERY,
                OUTBOND_STS: oRow.OUTBOND_STS,
                PGI_NUMBER: oRow.PGI_NUMBER,
                PGI_STS: oRow.PGI_STS,
                CREATED_ON: oRow.CREATED_ON,
                REMARKS: oRow.REMARKS
            };
        })
    };
     this.getOwnerComponent()
             .getModel("UiLoadingStatus")
                     .setProperty("/busy", true);

    this._callReprocess(oPayload);
},
_callReprocess: function (oPayload) {
    var oODataModel = this.getOwnerComponent().getModel("aiprocess");

    oODataModel.create("/EVT_CONSIGN_REPROSet", oPayload, {
        success: function (oResponse) {
            debugger
             this.oUisModel.setProperty("/busy", false);
            this._mergeResponse(oResponse);
            sap.m.MessageToast.show("Reprocess completed");
        }.bind(this),

        error: function (oError) {
            this.oUisModel.setProperty("/busy", false);
            sap.m.MessageBox.error("Reprocess failed");
        }
    });
},
_mergeResponse: function (oResponse) {

    var oModel = this.getOwnerComponent().getModel("ConsignmentModel");
    var aRecords = oModel.getProperty("/records");

    if (!Array.isArray(aRecords)) {
        aRecords = [];
        oModel.setProperty("/records", aRecords);
    }

    var aUpdated =
        oResponse &&
        oResponse.NP_Evt_Consign &&
        oResponse.NP_Evt_Consign.results
            ? oResponse.NP_Evt_Consign.results
            : [];

    if (aUpdated.length === 0) {
        return;
    }

    aUpdated.forEach(function (oNewRow) {

        // find existing row by SO_NUMBER
        var oExistingRow = aRecords.find(function (oOldRow) {
            return oOldRow.SO_NUMBER === oNewRow.SO_NUMBER;
        });

        if (oExistingRow) {
            // UPDATE existing row (critical)
            Object.assign(oExistingRow, oNewRow);

            // reset UI-only flags
            oExistingRow.selected = false;
        } else {
            // APPEND new row if not found
            oNewRow.selected = false;
            aRecords.push(oNewRow);
        }
    });

    // Force UI refresh
    oModel.refresh(true);
}







    })
       
});

  
