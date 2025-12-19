sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Filter, FilterOperator, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("haneya.controller.AiRPAInterCompSalesEventBasedOutput", {

        // Mapping field names to friendly labels
        _labelMap: {
            SO_NUMBER: "Sales Order No",
            SO_STATUS: "Sales Order Status",
            PR_NUMBER: "Purchase Requisition No",
            PR_STATUS: "Purchase Requisition Status",
            PO_NUMBER: "Purchase Order No",
            PO_STATUS: "Purchase Order Status",
            INB_DELIVERY: "Inbound Delivery",
            INB_STATUS: "Inbound Status",
            GR_NUMBER: "Goods Receipt No",
            GR_STATUS: "Goods Receipt Status",
            INTER_INVOICE: "Intercompany Invoice",
            INTER_INV_STS: "Intercompany Invoice Status",
            OUT_DELIVERY: "Outbound Delivery No",
            OUTBOND_STS: "Outbound Status",
            PGI_NUMBER: "Post Goods Issue Document No",
            PGI_STS: "Post Goods Issue Document Status",
            CUST_INVOICE: "Customer Invoice",
            CUST_INV_STS: "Customer Invoice Status",
            CREATED_ON: "Created On",
            REMARKS: "Remarks"
        },

        _applyCustomColumnLabels: function () {
            var oTable = this.oSmartTable.getTable();
            if (!oTable) return;

            if (oTable.setFixedColumnCount) {
                oTable.setFixedColumnCount(1); // freeze first column
            }
            if (oTable.setNavigationMode) {
                oTable.setNavigationMode(sap.ui.table.NavigationMode.Scrollbar);
            }
            var aLabels = [
                "Sales Order No", "Sales Order Status", "Purchase Request No", "PR Status",
                "Purchase Order No", "PO Status", "Inbound Delivery", "Inbound Status",
                "Goods Receipt No", "GR Status", "Intercompany Invoice", "Intercompany Invoice Status",
                "Outbound Delivery No", "Outbound Status", "PGI Document No", "PGI Status",
                "Customer Invoice", "Customer Invoice Status", "Created On", "Remarks"
            ];

            oTable.getColumns().forEach((oColumn, i) => {
                if (aLabels[i]) {
                    oColumn.setLabel(new sap.m.Label({ text: aLabels[i] }));
                }
            });
        },

        onInit: function () {
            this._labelMap = this._labelMap || {};
            this.oUiModel= this.getOwnerComponent().getModel("UiLoadingStatus");
            // Include CSS
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiRPAInterCompSalesEventBasedOutput.view.css")
            );

            this._bSmartTableReady = false;

            // Router
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("AiRPAInterCompSalesEventBasedOutput").attachPatternMatched(this._onRouteMatched, this);

            this.oSmartTable = this.byId("smartTableAI");
            this.oModel = this.getOwnerComponent().getModel("aiprocess");
            
            var oSmartTable = this.oSmartTable;

            // SmartTable initialization
            oSmartTable.attachInitialise(() => {
                oSmartTable.addStyleClass("coloredSmartTableHeader");
                this._bSmartTableReady = true;

                this._applyCustomColumnLabels();

                var oTable = oSmartTable.getTable();
                if (oTable) {
                    oTable.attachCellClick(this.onCellClick.bind(this));
                    oTable.attachEventOnce("rowsUpdated", this._applyRowColors.bind(this));
                    oTable.attachRowsUpdated(this._applyRowColors.bind(this));
                    oTable.attachRowSelectionChange(this.onRowSelectionChange.bind(this));
                    oTable.attachRowSelectionChange(this.onRowSelectionChangeSingle.bind(this));
                }
            });

            // Set model after metadata load
            this.oModel.metadataLoaded().then(() => {
                this.oSmartTable.setModel(this.oModel);
                console.log("Model attached:", this.oModel);
            });
            
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this.startDate = oArgs.startDate;
            this.endDate = oArgs.endDate;
            this.status = oArgs.status;

            this._aSavedFilters = [
                new Filter("CREATED_ON", FilterOperator.GE, this.startDate),
                new Filter("CREATED_ON", FilterOperator.LE, this.endDate),
                new Filter("RB_STATUS", FilterOperator.EQ, this.status)
            ];

            if (this._bSmartTableReady) {
                this.oSmartTable.rebindTable(true);
            } else {
                this.oSmartTable.attachInitialise(() => {
                    this.oSmartTable.rebindTable(true);
                });
            }
        },

        onBeforeRebindTable: function (oEvent) {
            const mBindingParams = oEvent.getParameter("bindingParams");
            if (this._aSavedFilters?.length) {
                mBindingParams.filters.push(new Filter({ filters: this._aSavedFilters, and: true }));
            }

            setTimeout(() => this._applyCustomColumnLabels(), 0);
        },

        _isRowComplete: function (oRowData) {
            return Object.keys(this._labelMap).every(key => oRowData[key]);
        },

        onRowSelectionChangeSingle: function (oEvent) {
            var oTable = oEvent.getSource();
            var iSelectedIndex = oEvent.getParameter("rowIndex");
            var oContext = oTable.getContextByIndex(iSelectedIndex);

            if (oContext && this._isRowComplete(oContext.getObject())) {
                oTable.removeSelectionInterval(iSelectedIndex, iSelectedIndex);
                MessageToast.show("Completed rows cannot be selected.");
            }
        },

        onRowSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var aRowIndices = oEvent.getParameter("rowIndices");
            var iSelectedIndex = oEvent.getParameter("rowIndex");
            var bIsSelected = oEvent.getParameter("selected");

            if (aRowIndices?.length > 1) {
                aRowIndices.forEach((iRowIndex) => {
                    var oContext = oTable.getContextByIndex(iRowIndex);
                    if (oContext && this._isRowComplete(oContext.getObject())) {
                        oTable.removeSelectionInterval(iRowIndex, iRowIndex);
                    }
                });
            } else if (bIsSelected) {
                var oContext = oTable.getContextByIndex(iSelectedIndex);
                if (oContext && this._isRowComplete(oContext.getObject())) {
                    oTable.removeSelectionInterval(iSelectedIndex, iSelectedIndex);
                    MessageToast.show("Completed rows cannot be selected.");
                }
            }
        },

        _applyRowColors: function () {
            var oTable = this.oSmartTable.getTable();
            if (!oTable) return;

            oTable.getRows().forEach((oRow) => {
                var oContext = oRow.getBindingContext();
                if (!oContext) return;

                var oData = oContext.getObject();
                oRow.removeStyleClass("rowGrey rowRed rowOrange");

                if (this._isRowComplete(oData)) {
                    oRow.addStyleClass("rowGrey");
                } else if (oData.PO_NUMBER) {
                    oRow.addStyleClass("rowOrange");
                } else {
                    oRow.addStyleClass("rowRed");
                }
            });
        },

        onCellClick: function (oEvent) {
            debugger
            var iColIndex = oEvent.getParameter("columnIndex");
            var iRowIndex = oEvent.getParameter("rowIndex");
            var oTable = oEvent.getSource();

            if (iColIndex === "0") {
                var oContext = oTable.getContextByIndex(iRowIndex);
                if (oContext) this._openRowDetailsDialog(oContext.getObject());
            }
        },

        _openRowDetailsDialog: function (oData) {
            if (this._oDialog) this._oDialog.destroy();

            var oDialogTable = new sap.m.Table({
                columns: [
                    new sap.m.Column({ header: new sap.m.Text({ text: "Field" }) }),
                    new sap.m.Column({ header: new sap.m.Text({ text: "Value" }) })
                ]
            });

            Object.keys(this._labelMap).forEach((sField) => {
                oDialogTable.addItem(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: this._labelMap[sField] }),
                        new sap.m.Text({ text: oData[sField] || "-" })
                    ]
                }));
            });

            this._oDialog = new sap.m.Dialog({
                title: "Sales Order Details",
                contentWidth: "450px",
                contentHeight: "350px",
                content: [oDialogTable],
                beginButton: new sap.m.Button({
                    text: "Close",
                    press: () => this._oDialog.close()
                }),
                afterClose: () => {
                    this._oDialog.destroy();
                    this._oDialog = null;
                }
            });

            this._oDialog.addStyleClass("salesOrderDialog");
            this._oDialog.open();
        },

        onReprocess: function () {

            MessageBox.information("AI process is about to execute");

            var oTable = this.oSmartTable.getTable();
            var aSelected = oTable.getSelectedIndices();

            // if (aSelected.length === 0) {
            //     MessageToast.show("Please select at least one incomplete row.");
            //     return;
            // }

            var oModel = this.getOwnerComponent().getModel("aiprocess");
            var oPayload = { SO_NUMBER: " ", NP_ON_SO: [] };
            var aOriginalRows = [];
            
            aSelected.forEach((iIndex) => {
                var oContext = oTable.getContextByIndex(iIndex);
                if (!oContext) return;

                var oData = oContext.getObject();
                aOriginalRows.push(JSON.parse(JSON.stringify(oData)));
                delete oData.__metadata;
                oPayload.NP_ON_SO.push(Object.assign({}, oData));
            });
            
            this.getOwnerComponent().getModel("UiLoadingStatus").setProperty("/busy", true);
            oModel.create("/Sales_orderSet", oPayload, {
                success: function (data) {
                    let aNewRows = data.NP_ON_SO.results || [];

                    let aCleanNewRows = aNewRows.map(r => { let row = { ...r }; delete row.__metadata; return row; });
                    let aCleanOriginalRows = aOriginalRows.map(r => { let row = { ...r }; delete row.__metadata; return row; });

                    function isRowSame(row1, row2) {
                        let keys = Object.keys(row1);
                        for (let k of keys) {
                            let val1 = row1[k] == null ? "" : String(row1[k]).trim();
                            let val2 = row2[k] == null ? "" : String(row2[k]).trim();
                            if (val1 !== val2) return false;
                        }
                        return true;
                    }

                    let bSame = aCleanOriginalRows.length === aCleanNewRows.length &&
                        aCleanOriginalRows.every((r, i) => isRowSame(r, aCleanNewRows[i]));
                    let soNumbers = aCleanOriginalRows.map(r => r.SO_NUMBER).join(", ");

                    // if (bSame) {
                    //     MessageBox.information(`Even after reprocess, the sales order ${soNumbers} status has not changed.`);
                    //     console.log(`INFO: No change after reprocess for SO(s): ${soNumbers}`);
                    //     return;
                    // }

                    const steps = [
                        "SO_NUMBER", "PR_NUMBER", "PO_NUMBER", "INB_DELIVERY", "GR_NUMBER",
                        "INTER_INVOICE", "OUT_DELIVERY", "PGI_NUMBER", "CUST_INVOICE"
                    ];

                    const fieldLabelMap = {
                        SO_NUMBER: "Sales Order No",
                        PR_NUMBER: "Purchase Requisition No",
                        PO_NUMBER: "Purchase Order No",
                        INB_DELIVERY: "Inbound Delivery",
                        GR_NUMBER: "Goods Receipt No",
                        INTER_INVOICE: "Intercompany Invoice",
                        OUT_DELIVERY: "Outbound Delivery No",
                        PGI_NUMBER: "Post Goods Issue Document No",
                        CUST_INVOICE: "Customer Invoice"
                    };

                    aCleanNewRows.forEach((row) => {
                        let lastCompleted = null;
                        for (let step of steps) {
                            if (!row[step] || row[step].trim() === "") break;
                            lastCompleted = step;
                        }

                        // if (!lastCompleted || lastCompleted === "CUST_INVOICE") {
                        //     MessageBox.information(`Sales order ${soNumber} have successfully completed.`);
                        //     console.log("SUCCESS: Sales completed.");
                        // } else {
                        //     MessageBox.information(`Sales order ${soNumber} has processed up to ${fieldLabelMap[lastCompleted]}.`);
                        //     console.log(`INFO: Sales processed up to ${lastCompleted}`);
                        // }
                    });
                },
                error: function (oError) {
                    console.error(oError);
                    MessageBox.error("Error submitting deep entity");
                }
            });
        }

    });
});
