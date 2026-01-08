sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/model/json/JSONModel",
    "sap/ui/table/Column",
    "sap/m/Label",
    "sap/m/Text"
], function (
    Controller,
    MessageBox,
    ValueHelpDialog,
    JSONModel,
    Column,
    Label,
    Text
) {
    "use strict";

    return Controller.extend("haneya.controller.MigrationSecRolRemSS", {

        onInit: function () {
            jQuery.sap.includeStyleSheet(
                sap.ui.require.toUrl("haneya/view/AiInterCompanyStockTransfer.view.css")
            );
        },

       OnExecute: function () {
        debugger
    var oView = this.getView();
    var oModel = this.getOwnerComponent().getModel("SecRoleRemediationModel");

    // Read values
    var sRoleFrom = oView.byId("Role1").getValue().trim(); // GE
    var sRoleTo   = oView.byId("Role2").getValue().trim(); // LE

    if (!sRoleFrom && !sRoleTo) {
        sap.m.MessageBox.warning("Please enter Transcation Code or Role");
        return;
    }

    // Backend expects space if empty
    var sGeValue = sRoleFrom ? sRoleFrom : " ";
    var sLeValue = sRoleTo   ? sRoleTo   : " ";

    // Build GE & LE filters
    var aFilters = [
        new sap.ui.model.Filter("Zagr_name", sap.ui.model.FilterOperator.GE, sGeValue),
        new sap.ui.model.Filter("Zagr_name", sap.ui.model.FilterOperator.LE, sLeValue)
    ];

    oView.setBusy(true);

    oModel.read("/Roles_RemediationSet", {
        filters: aFilters,
        success: function (oData) {
            oView.setBusy(false);

            if (oData.results && oData.results.length > 0) {

                // Store response for reuse
                var oResultModel = new sap.ui.model.json.JSONModel({
                    results: oData.results
                });
                oView.setModel(oResultModel, "ExecResultModel");

                // Open dialog
                oView.byId("helloDialog").open();

            } else {
                sap.m.MessageBox.information("No records found for given Role range");
            }
        },
        error: function () {
            oView.setBusy(false);
            sap.m.MessageBox.error("Error fetching data");
        }
    });
},

        handleClose: function () {
            this.getView().byId("helloDialog").close();
        },
        OnClear: function () {
            var oView = this.getView();

            oView.byId("Request").setValue("");

            oView.byId("Description").setValue("");
        },
        onAddNewTR: function () {
            var oView = this.getView();

            // Disable Request field
            oView.byId("Request").setEnabled(false);
            oView.byId("Request").setValue("");

            // Enable Description field
            oView.byId("Description").setEnabled(true);
            oView.byId("Description").setValue("");
        },

        onValueHelpRequest: function () {
            var oView = this.getView();
            var oODataModel = this.getOwnerComponent().getModel("SecRoleRemediationModel");

            // JSON model for Value Help
            var oVHModel = this.getOwnerComponent().getModel("SecRoleRemediationDataModel");
            if (!oVHModel) {
                oVHModel = new JSONModel();
                this.getOwnerComponent().setModel(oVHModel, "SecRoleRemediationDataModel");
            }

            oView.setBusy(true);

            // OData call
            oODataModel.read("/f4HelpForTrSet", {
                success: function (oData) {
                    oView.setBusy(false);
                    oVHModel.setData({
                        results: oData.results
                    });
                    this._openValueHelpDialog();
                }.bind(this),

                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Failed to load Transport Requests");
                }
            });
        },

        _openValueHelpDialog: function () {
    var oView = this.getView();
    var oRequestInput = oView.byId("Request");
    var oDescInput = oView.byId("Description");

    if (!this._oVHD) {
        // Create Value Help Dialog
        this._oVHD = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            title: "Transport Request",
            supportMultiselect: false,
            supportRanges: false,
            key: "Trkorr",
            descriptionKey: "As4text",

            ok: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");

                if (aTokens && aTokens.length > 0) {
                    var oToken = aTokens[0];
                    oRequestInput.setValue(oToken.getKey()); // TR number
                    oDescInput.setValue(oToken.getText());   // Description
                }

                this.close();
            },

            cancel: function () {
                this.close();
            }
        });

        // Get the internal table of VHD
        var oTable = this._oVHD.getTable();

        // Set model
        oTable.setModel(this.getOwnerComponent().getModel("SecRoleRemediationDataModel"));

        // Add columns (use sap.ui.table.Column, NOT sap.m.Column)
        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ text: "Transport Request" }),
            template: new sap.m.Text({ text: "{Trkorr}" }),
            sortProperty: "Trkorr",
            filterProperty: "Trkorr"
        }));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ text: "Description" }),
            template: new sap.m.Text({ text: "{As4text}" })
        }));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ text: "Owner" }),
            template: new sap.m.Text({ text: "{As4user}" })
        }));

        // Bind rows
        oTable.bindRows("/results");

        // Make VHD dependent on the view
        oView.addDependent(this._oVHD);
    }

    // ===== Apply filter on Trkorr based on user input =====
    var sValue = oRequestInput.getValue();
    if (sValue) {
        var oFilter = new sap.ui.model.Filter("Trkorr", sap.ui.model.FilterOperator.Contains, sValue);
        this._oVHD.getTable().getBinding("rows").filter([oFilter]);
    } else {
        // No filter if input is empty
        this._oVHD.getTable().getBinding("rows").filter([]);
    }

    // Open the Value Help Dialog
    this._oVHD.open();
},

        OnAddingTR: function () {
    var oView = this.getView();
    var oModel = this.getOwnerComponent().getModel("SecRoleRemediationModel");

    var sDescription = oView.byId("Description").getValue(); // already filled
    if (!sDescription) {
        sap.m.MessageBox.warning("Please provide a Description first.");
        return;
    }

    // Filter by Description only
    var aFilters = [
        new sap.ui.model.Filter("As4text", sap.ui.model.FilterOperator.EQ, sDescription)
    ];

    oView.setBusy(true);

    oModel.read("/Roles_RemediationSet", {
        filters: aFilters,
        success: function (oData) {
            oView.setBusy(false);

            if (oData.results && oData.results.length > 0) {
                // Take the first result
                var oFirstResult = oData.results[0];

                // Fill only the Request field
                oView.byId("Request").setValue(oFirstResult.Trkorr || "");
            } else {
                sap.m.MessageBox.information("No TR found for the given Description");
                oView.byId("Request").setValue(""); // clear if nothing found
            }
        },
        error: function () {
            oView.setBusy(false);
            sap.m.MessageBox.error("Error fetching data");
        }
    });
},
    OnGetData: function () {
        debugger
    var oView = this.getView();
    var oODataModel = this.getOwnerComponent().getModel("SecRoleRemediationModel");

    // 1️⃣ Get Request value
    var sRequest = oView.byId("Request").getValue().trim();

    if (!sRequest) {
        sap.m.MessageBox.warning("Please enter Request");
        return;
    }

    // 2️⃣ Get stored ExecResultModel
    var oExecModel = oView.getModel("ExecResultModel");

    if (!oExecModel) {
        sap.m.MessageBox.warning("No data available to send");
        return;
    }

    //var aReturnData = oExecModel.getProperty("/results");
    var oJsonData = oExecModel.getProperty("/results");
    var aReturnData = JSON.parse(JSON.stringify(oJsonData));
    
    if (!aReturnData || aReturnData.length === 0) {
        sap.m.MessageBox.information("No execution data found");
        return;
    }

    // 3️⃣ Build payload
    var oPayload = {
        Zrequest: sRequest,
        payload: aReturnData   // Full JSON response
    };

    // 4️⃣ Send POST request
    oView.setBusy(true);

    oODataModel.create("/Roles_RequestSet", oPayload, {
        success: function () {
            oView.setBusy(false);var oResponseModel = new sap.ui.model.json.JSONModel(oResponse);

            // Store at component level (so next view can access)
            this.getOwnerComponent().setModel(oResponseModel, "PostResponseModel");

            // 2️⃣ Navigate to Output view
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("MigrationSecRolRemOutputTable");

            sap.m.MessageBox.success("Data sent successfully");
        },
        error: function () {
            oView.setBusy(false);
            sap.m.MessageBox.error("Error while sending data");
        }
    });
},


        

    });
});
