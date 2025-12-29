sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageToast",
        "sap/m/MessageBox"
    ],
    function (Controller, Filter, FilterOperator, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend(
            "haneya.controller.AiRPAInterCompSalesEventBasedOutput",
            {
                /* Field Label Mapping                                         */
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

                onInit: function () {
                    this.oUiModel =
                        this.getOwnerComponent().getModel("UiLoadingStatus");

                    jQuery.sap.includeStyleSheet(
                        sap.ui.require.toUrl(
                            "haneya/view/AiRPAInterCompSalesEventBasedOutput.view.css"
                        )
                    );

                    this._bSmartTableReady = false;

                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter
                        .getRoute("AiRPAInterCompSalesEventBasedOutput")
                        .attachPatternMatched(this._onRouteMatched, this);

                    this.oSmartTable = this.byId("smartTableAI");
                    this.oModel =
                        this.getOwnerComponent().getModel("aiprocess");

                    this.oSmartTable.attachInitialise(
                        function () {
                            this.oSmartTable.addStyleClass(
                                "coloredSmartTableHeader"
                            );
                            this._bSmartTableReady = true;

                            this._applyCustomColumnLabels();

                            var oTable =
                                this.oSmartTable.getTable();
                            if (oTable) {
                                oTable.attachCellClick(
                                    this.onCellClick.bind(this)
                                );
                                oTable.attachEventOnce(
                                    "rowsUpdated",
                                    this._applyRowColors.bind(this)
                                );
                                oTable.attachRowsUpdated(
                                    this._applyRowColors.bind(this)
                                );
                                oTable.attachRowSelectionChange(
                                    this.onRowSelectionChange.bind(this)
                                );
                                oTable.attachRowSelectionChange(
                                    this.onRowSelectionChangeSingle.bind(
                                        this
                                    )
                                );
                            }
                        }.bind(this)
                    );

                    this.oModel.metadataLoaded().then(
                        function () {
                            this.oSmartTable.setModel(this.oModel);
                        }.bind(this)
                    );
                },

                /* Routing                                                    */
                _onRouteMatched: function (oEvent) {
                    var oArgs = oEvent.getParameter("arguments");

                    this.startDate = oArgs.startDate;
                    this.endDate = oArgs.endDate;
                    this.status = oArgs.status;

                    this._aSavedFilters = [
                        new Filter(
                            "CREATED_ON",
                            FilterOperator.GE,
                            this.startDate
                        ),
                        new Filter(
                            "CREATED_ON",
                            FilterOperator.LE,
                            this.endDate
                        ),
                        new Filter(
                            "RB_STATUS",
                            FilterOperator.EQ,
                            this.status
                        )
                    ];

                    if (this._bSmartTableReady) {
                        this.oSmartTable.rebindTable(true);
                    } else {
                        this.oSmartTable.attachInitialise(
                            function () {
                                this.oSmartTable.rebindTable(true);
                            }.bind(this)
                        );
                    }
                },

                onBeforeRebindTable: function (oEvent) {
                    var mBindingParams =
                        oEvent.getParameter("bindingParams");

                    if (this._aSavedFilters?.length) {
                        mBindingParams.filters.push(
                            new Filter({
                                filters: this._aSavedFilters,
                                and: true
                            })
                        );
                    }

                    setTimeout(
                        function () {
                            this._applyCustomColumnLabels();
                        }.bind(this),
                        0
                    );
                },

                /* Table Helpers                                              */
                _applyCustomColumnLabels: function () {
                    var oTable = this.oSmartTable.getTable();
                    if (!oTable) {
                        return;
                    }

                    if (oTable.setFixedColumnCount) {
                        oTable.setFixedColumnCount(1);
                    }

                    if (oTable.setNavigationMode) {
                        oTable.setNavigationMode(
                            sap.ui.table.NavigationMode.Scrollbar
                        );
                    }

                    var aLabels = [
                        "Sales Order No",
                        "Sales Order Status",
                        "Purchase Request No",
                        "PR Status",
                        "Purchase Order No",
                        "PO Status",
                        "Inbound Delivery",
                        "Inbound Status",
                        "Goods Receipt No",
                        "GR Status",
                        "Intercompany Invoice",
                        "Intercompany Invoice Status",
                        "Outbound Delivery No",
                        "Outbound Status",
                        "PGI Document No",
                        "PGI Status",
                        "Customer Invoice",
                        "Customer Invoice Status",
                        "Created On",
                        "Remarks"
                    ];

                    oTable.getColumns().forEach(function (oColumn, i) {
                        if (aLabels[i]) {
                            oColumn.setLabel(
                                new sap.m.Label({ text: aLabels[i] })
                            );
                        }
                    });
                },

                _isRowComplete: function (oRowData) {
                    return Object.keys(this._labelMap).every(
                        function (key) {
                            return oRowData[key];
                        }
                    );
                },

                _applyRowColors: function () {
                    var oTable = this.oSmartTable.getTable();
                    if (!oTable) {
                        return;
                    }

                    oTable.getRows().forEach(
                        function (oRow) {
                            var oContext =
                                oRow.getBindingContext();
                            if (!oContext) {
                                return;
                            }

                            var oData = oContext.getObject();
                            oRow.removeStyleClass(
                                "rowGrey rowRed rowOrange"
                            );

                            if (this._isRowComplete(oData)) {
                                oRow.addStyleClass("rowGrey");
                            } else if (oData.PO_NUMBER) {
                                oRow.addStyleClass("rowOrange");
                            } else {
                                oRow.addStyleClass("rowRed");
                            }
                        }.bind(this)
                    );
                },

                /* Selection Handling                                         */
                onRowSelectionChangeSingle: function (oEvent) {
                    var oTable = oEvent.getSource();
                    var iSelectedIndex =
                        oEvent.getParameter("rowIndex");
                    var oContext =
                        oTable.getContextByIndex(iSelectedIndex);

                    if (
                        oContext &&
                        this._isRowComplete(oContext.getObject())
                    ) {
                        oTable.removeSelectionInterval(
                            iSelectedIndex,
                            iSelectedIndex
                        );
                        MessageToast.show(
                            "Completed rows cannot be selected."
                        );
                    }
                },

                onRowSelectionChange: function (oEvent) {
                    var oTable = oEvent.getSource();
                    var aRowIndices =
                        oEvent.getParameter("rowIndices");
                    var iSelectedIndex =
                        oEvent.getParameter("rowIndex");
                    var bIsSelected =
                        oEvent.getParameter("selected");

                    if (aRowIndices?.length > 1) {
                        aRowIndices.forEach(
                            function (iRowIndex) {
                                var oContext =
                                    oTable.getContextByIndex(
                                        iRowIndex
                                    );
                                if (
                                    oContext &&
                                    this._isRowComplete(
                                        oContext.getObject()
                                    )
                                ) {
                                    oTable.removeSelectionInterval(
                                        iRowIndex,
                                        iRowIndex
                                    );
                                }
                            }.bind(this)
                        );
                    } else if (bIsSelected) {
                        var oContextSingle =
                            oTable.getContextByIndex(
                                iSelectedIndex
                            );
                        if (
                            oContextSingle &&
                            this._isRowComplete(
                                oContextSingle.getObject()
                            )
                        ) {
                            oTable.removeSelectionInterval(
                                iSelectedIndex,
                                iSelectedIndex
                            );
                            MessageToast.show(
                                "Completed rows cannot be selected."
                            );
                        }
                    }
                },

                /* Cell Click                                                 */
                onCellClick: function (oEvent) {
                    var iColIndex =
                        oEvent.getParameter("columnIndex");
                    var iRowIndex =
                        oEvent.getParameter("rowIndex");
                    var oTable = oEvent.getSource();

                    if (iColIndex === "0") {
                        var oContext =
                            oTable.getContextByIndex(iRowIndex);
                        if (oContext) {
                            this._openRowDetailsDialog(
                                oContext.getObject()
                            );
                        }
                    }
                },

                _openRowDetailsDialog: function (oData) {
                    if (this._oDialog) {
                        this._oDialog.destroy();
                    }

                    var oDialogTable = new sap.m.Table({
                        columns: [
                            new sap.m.Column({
                                header: new sap.m.Text({
                                    text: "Field"
                                })
                            }),
                            new sap.m.Column({
                                header: new sap.m.Text({
                                    text: "Value"
                                })
                            })
                        ]
                    });

                    Object.keys(this._labelMap).forEach(
                        function (sField) {
                            oDialogTable.addItem(
                                new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({
                                            text: this._labelMap[
                                                sField
                                            ]
                                        }),
                                        new sap.m.Text({
                                            text:
                                                oData[sField] || "-"
                                        })
                                    ]
                                })
                            );
                        }.bind(this)
                    );

                    this._oDialog = new sap.m.Dialog({
                        title: "Sales Order Details",
                        contentWidth: "450px",
                        contentHeight: "350px",
                        content: [oDialogTable],
                        beginButton: new sap.m.Button({
                            text: "Close",
                            press: function () {
                                this._oDialog.close();
                            }.bind(this)
                        }),
                        afterClose: function () {
                            this._oDialog.destroy();
                            this._oDialog = null;
                        }.bind(this)
                    });

                    this._oDialog.addStyleClass(
                        "salesOrderDialog"
                    );
                    this._oDialog.open();
                },

                /* Reprocess                                                  */
                onReprocess: function () {
                    MessageBox.information(
                        "AI process is about to execute"
                    );

                    var oTable = this.oSmartTable.getTable();
                    var aSelected = oTable.getSelectedIndices();

                    var oModel = this.getOwnerComponent().getModel("aiprocess");

                    var oPayload = {
                        SO_NUMBER: " ",
                        NP_ON_SO: []
                    };

                    var aOriginalRows = [];

                    aSelected.forEach(
                        function (iIndex) {
                            var oContext =
                                oTable.getContextByIndex(
                                    iIndex
                                );
                            if (!oContext) {
                                return;
                            }

                            var oData =
                                oContext.getObject();
                            aOriginalRows.push(
                                JSON.parse(
                                    JSON.stringify(oData)
                                )
                            );
                            delete oData.__metadata;

                            oPayload.NP_ON_SO.push(
                                Object.assign({}, oData)
                            );
                        }
                    );

                    this.oUiModel.setProperty("/busy", true);

                    oModel.create(
                        "/Sales_orderSet",
                        oPayload,
                        {
                            success: function (data) {
                                this.oUiModel.setProperty(
                                    "/busy",
                                    false
                                );

                                var aNewRows =
                                    data.NP_ON_SO.results ||
                                    [];

                                var aCleanNewRows =
                                    aNewRows.map(function (
                                        r
                                    ) {
                                        var row = { ...r };
                                        delete row.__metadata;
                                        return row;
                                    });

                                var aCleanOriginalRows =
                                    aOriginalRows.map(function (
                                        r
                                    ) {
                                        var row = { ...r };
                                        delete row.__metadata;
                                        return row;
                                    });

                                function isRowSame(
                                    row1,
                                    row2
                                ) {
                                    return Object.keys(
                                        row1
                                    ).every(function (k) {
                                        var v1 =
                                            row1[k] == null
                                                ? ""
                                                : String(
                                                      row1[k]
                                                  ).trim();
                                        var v2 =
                                            row2[k] == null
                                                ? ""
                                                : String(
                                                      row2[k]
                                                  ).trim();
                                        return v1 === v2;
                                    });
                                }

                                var bSame =
                                    aCleanOriginalRows.length ===
                                        aCleanNewRows.length &&
                                    aCleanOriginalRows.every(
                                        function (r, i) {
                                            return isRowSame(
                                                r,
                                                aCleanNewRows[i]
                                            );
                                        }
                                    );

                                console.log(
                                    "Reprocess completed. Same result:",
                                    bSame
                                );
                            }.bind(this),

                            error: function (oError) {
                                this.oUiModel.setProperty(
                                    "/busy",
                                    false
                                );
                                console.error(oError);
                                MessageBox.error(
                                    "Error submitting deep entity"
                                );
                            }.bind(this)
                        }
                    );
                }
            }
        );
    }
);
