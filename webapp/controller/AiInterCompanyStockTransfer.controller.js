sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast"
    ],
    function (Controller, JSONModel, MessageToast) {
        "use strict";

        return Controller.extend(
            "haneya.controller.AiInterCompanyStockTransfer",
            {
                /* =========================================================== */
                /* Lifecycle                                                  */
                /* =========================================================== */
                onInit: function () {
                    this.oUiModel =
                        this.getOwnerComponent().getModel("UiLoadingStatus");

                    // Load CSS
                    debugger;
                    jQuery.sap.includeStyleSheet(
                        sap.ui.require.toUrl(
                            "haneya/view/AiInterCompanyStockTransfer.view.css"
                        )
                    );

                    // Dynamic file path (display only)
                    var oToday = new Date();
                    var sFormattedDate =
                        oToday.getFullYear().toString() +
                        String(oToday.getMonth() + 1).padStart(2, "0") +
                        String(oToday.getDate()).padStart(2, "0");

                    this.getView().setModel(
                        new JSONModel({
                            filePath:
                                "/tmp/Inter_company_stock_" +
                                sFormattedDate +
                                ".txt"
                        }),
                        "fileModel"
                    );

                    // Unified Result Model (used by both flows)
                    var oResultModel = new JSONModel({
                        records: []
                    });
                    sap.ui
                        .getCore()
                        .setModel(
                            oResultModel,
                            "stockTransferResultModel"
                        );

                    // Metadata Debug
                    var oODataModel =
                        this.getOwnerComponent().getModel(
                            "stockTransferModel"
                        );

                    if (!oODataModel) {
                        console.error(
                            "stockTransferModel not found"
                        );
                        return;
                    }

                    oODataModel.metadataLoaded().then(
                        function () {
                            var aFunctionImports =
                                oODataModel
                                    .getServiceMetadata()
                                    .dataServices.schema[0]
                                    .entityContainer[0]
                                    .functionImport;

                            console.log(
                                "Available Function Imports:",
                                aFunctionImports.map(function (f) {
                                    return f.name;
                                })
                            );
                        }
                    );
                },

                /* =========================================================== */
                /* Radio Button Selection                                     */
                /* =========================================================== */
                onSourceChange: function (oEvent) {
                    var iIndex =
                        oEvent.getSource().getSelectedIndex();

                    this.byId("hbFilePath").setVisible(
                        iIndex === 0
                    );
                    this.byId("hbUploadFile").setVisible(
                        iIndex === 1
                    );
                },

                /* =========================================================== */
                /* File Selection                                             */
                /* =========================================================== */
                onFileSelected: function (oEvent) {
                    var oFile =
                        oEvent.getParameter("files")[0];

                    if (
                        !oFile.type.includes("spreadsheet") &&
                        !oFile.name.endsWith(".xlsx")
                    ) {
                        MessageToast.show(
                            "Please select a valid Excel file"
                        );
                        return;
                    }

                    // Store file reference
                    this._oSelectedFile = oFile;

                    MessageToast.show(
                        "File selected: " + oFile.name
                    );
                    console.log("Selected file:", oFile);
                },

                loadResults: function (sFileId) {
    var oModelLocal = this.getOwnerComponent().getModel("stockTransferModel");

    oModelLocal.read("/StockTransportInfoSet('" + sFileId + "')", {
      urlParameters: {
        "$expand": "NavStockTransDocuments,NavSimulationResp"
      },

      success: function (oData) {
        console.log("Expanded Read Result:", oData);

        var aDocs = [];

        if (oData.NavStockTransDocuments) {
          if (Array.isArray(oData.NavStockTransDocuments)) {
            aDocs = oData.NavStockTransDocuments;
          } else if (oData.NavStockTransDocuments.results) {
            aDocs = oData.NavStockTransDocuments.results;
          }
        }

        console.log("Extracted Docs:", aDocs);

        // var oTableModel = new sap.ui.model.json.JSONModel({
        //   records: aDocs
        // });

        // sap.ui.getCore().setModel(oTableModel, "stockTransferResultModel");
      },

      error: function (oError) {
        console.error("Read failed", oError);
      }
    });
  },
                onExecutePress: function () {
                    debugger;
                    // 🔹 Generate unique FileId (Option 1 – Timestamp)
                    var sFileId = Date.now().toString();
                    var iIndex =
                        this.byId("rbGroup1").getSelectedIndex();

                    var oResultModel =
                        sap.ui
                            .getCore()
                            .getModel(
                                "stockTransferResultModel"
                            );

                    /* ======================================================= */
                    /* CASE 1: THIRD PARTY                                     */
                    /* ======================================================= */
                    // if (iIndex === 0) {
                    //     var bSimulate =
                    //         this.byId("simulateCheckBox")
                    //             ?.getSelected() || false;

                    //     var oModel =
                    //         this.getOwnerComponent().getModel(
                    //             "stockTransferModel"
                    //         );

                    //     if (
                    //         !(
                    //             oModel instanceof
                    //             sap.ui.model.odata.v2
                    //                 .ODataModel
                    //         )
                    //     ) {
                    //         MessageToast.show(
                    //             "OData model not found"
                    //         );
                    //         return;
                    //     }

                    //     var oFunctionInput = {
                    //         Simulation: bSimulate
                    //     };

                    //     this.getOwnerComponent()
                    //         .getModel("UiLoadingStatus")
                    //         .setProperty("/busy", true);

                    //     oModel.metadataLoaded().then(
                    //         function () {
                    //             console.log(
                    //                 "Calling InterCompanySto with input:",
                    //                 oFunctionInput
                    //             );

                    //             oModel.callFunction(
                    //                 "/InterCompanySto",
                    //                 {
                    //                     method: "GET",
                    //                     urlParameters:
                    //                         oFunctionInput,

                    //                     success: function (
                    //                         oResponse
                    //                     ) {
                    //                         console.log(
                    //                             "Third Party Response:",
                    //                             oResponse
                    //                         );

                    //                         this.oUiModel.setProperty(
                    //                             "/busy",
                    //                             false
                    //                         );

                    //                         var aRecords = [];

                    //                         if (
                    //                             Array.isArray(
                    //                                 oResponse?.results
                    //                             )
                    //                         ) {
                    //                             aRecords =
                    //                                 oResponse.results;
                    //                         } else if (
                    //                             oResponse
                    //                         ) {
                    //                             aRecords = [
                    //                                 oResponse
                    //                             ];
                    //                         }

                    //                         oResultModel.setData(
                    //                             {
                    //                                 records:
                    //                                     aRecords
                    //                             }
                    //                         );
                    //                         oResultModel.refresh(
                    //                             true
                    //                         );

                    //                         MessageToast.show(
                    //                             "Third Party execution successful"
                    //                         );

                    //                         var oRouter =
                    //                             this.getOwnerComponent().getRouter();
                    //                         if (oRouter) {
                    //                             oRouter.navTo(
                    //                                 "AiRPAStockTransferOutputScreen"
                    //                             );
                    //                         }
                    //                     }.bind(this),

                    //                     error: function (
                    //                         oError
                    //                     ) {
                    //                         this.oUiModel.setProperty(
                    //                             "/busy",
                    //                             true
                    //                         );
                    //                         console.error(
                    //                             "Function Import Error:",
                    //                             oError
                    //                         );
                    //                         MessageToast.show(
                    //                             "Third Party execution failed"
                    //                         );
                    //                     }.bind(this)
                    //                 }
                    //             );
                    //         }.bind(this)
                    //     );

                    //     return;
                    // }
                    if (iIndex === 0) {

    // 🔹 Simulation checkbox value
    var bSimulate =
        this.byId("simulateCheckBox")?.getSelected() || false;

    // 🔹 OData Model
    var oModel = this.getOwnerComponent().getModel("stockTransferModel");

    if (!(oModel instanceof sap.ui.model.odata.v2.ODataModel)) {
        MessageToast.show("OData model not found");
        return;
    }

    // 🔹 Deep Entity Payload
    var oPayload = {
        FileId: sFileId,
        SimulationMode: bSimulate,
        AL11Path: true,
        NavFile: [],
        NavStockTransDocuments: [],
        NavSimulationResp: []
    };

    console.log("POST Deep Entity Payload:", oPayload);

    // 🔹 Busy ON
    this.getOwnerComponent()
        .getModel("UiLoadingStatus")
        .setProperty("/busy", true);

    // 🔹 POST Deep Entity
    // ⚠ Replace /StockTransferSet with your actual EntitySet name
    oModel.create("/StockTransportInfoSet", oPayload, {

        success: function (oResponse) {
            console.log("Deep Entity POST Response:", oResponse);

            // Busy OFF
            this.getOwnerComponent()
                .getModel("UiLoadingStatus")
                .setProperty("/busy", false);

            // 🔹 Extract response data
            var aRecords = [];

            if (oResponse?.NavStockTransDocuments?.results) {
                aRecords = oResponse.NavStockTransDocuments.results;
            } else {
                aRecords = [oResponse];
            }

            // 🔹 Set result model
            oResultModel.setData({
                records: aRecords,
                fileId: sFileId
            });
            oResultModel.refresh(true);

            MessageToast.show("Third Party execution successful");

            // 🔹 Navigate to output screen
            var oRouter = this.getOwnerComponent().getRouter();
            if (oRouter) {
                oRouter.navTo("AiRPAStockTransferOutputScreen");
            }
        }.bind(this),

        error: function (oError) {
            console.error("Deep Entity POST Error:", oError);

            // Busy OFF
            this.getOwnerComponent()
                .getModel("UiLoadingStatus")
                .setProperty("/busy", false);

            MessageToast.show("Third Party execution failed");
        }.bind(this)
    });

    return;
}


                    /* ======================================================= */
                    /* CASE 2: LOCAL FILE UPLOAD                                */
                    /* ======================================================= */
                    // if (iIndex === 1) {
                    //     if (!this._oSelectedFile) {
                    //         MessageToast.show(
                    //             "Please select a file first"
                    //         );
                    //         return;
                    //     }

                    //     var bSimulateLocal =
                    //         this.byId(
                    //             "simulateCheckBox"
                    //         ).getSelected();

                    //     var oReader = new FileReader();
                    //     var oModelLocal =
                    //         this.getOwnerComponent().getModel(
                    //             "stockTransferModel"
                    //         );

                    //     oReader.onload = function (
                    //         oEvent
                    //     ) {
                    //         var aBinaryData =
                    //             oEvent.target.result;

                    //         var oWorkbook =
                    //             XLSX.read(aBinaryData, {
                    //                 type: "array"
                    //             });

                    //         var sSheetName =
                    //             oWorkbook.SheetNames[0];
                    //         var oWorksheet =
                    //             oWorkbook.Sheets[
                    //                 sSheetName
                    //             ];

                    //         var aExcelData =
                    //             XLSX.utils.sheet_to_json(
                    //                 oWorksheet,
                    //                 {
                    //                     defval: "",
                    //                     raw: true
                    //                 }
                    //             );

                    //         var payload = {
                    //             payload:
                    //                 JSON.stringify(
                    //                     aExcelData
                    //                 ),
                    //             Simulate: bSimulateLocal
                    //                 ? "X"
                    //                 : ""
                    //         };

                    //         console.log(
                    //             "FINAL PAYLOAD:",
                    //             payload
                    //         );

                    //         oModelLocal.create(
                    //             "/FileSet",
                    //             payload,
                    //             {
                    //                 success: function (
                    //                     oData,
                    //                     response
                    //                 ) {
                    //                     MessageToast.show(
                    //                         "Excel JSON sent successfully"
                    //                     );

                    //                     if (
                    //                         response?.data
                    //                             ?.payload
                    //                     ) {
                    //                         var parsed =
                    //                             JSON.parse(
                    //                                 response
                    //                                     .data
                    //                                     .payload
                    //                             );

                    //                         var oResultModelNew =
                    //                             new JSONModel(
                    //                                 {
                    //                                     records:
                    //                                         parsed
                    //                                 }
                    //                             );

                    //                         sap.ui
                    //                             .getCore()
                    //                             .setModel(
                    //                                 oResultModelNew,
                    //                                 "stockTransferResultModel"
                    //                             );
                    //                     }
                    //                 }.bind(this),

                    //                 error: function (
                    //                     err
                    //                 ) {
                    //                     this.getOwnerComponent()
                    //                         .getModel(
                    //                             "UiLoadingStatus"
                    //                         )
                    //                         .setProperty(
                    //                             "/busy",
                    //                             false
                    //                         );
                    //                     MessageToast.show(
                    //                         "Upload failed"
                    //                     );
                    //                 }.bind(this)
                    //             }
                    //         );
                    //     }.bind(this);

                    //     oReader.onerror = function () {
                    //         MessageToast.show(
                    //             "File read failed"
                    //         );
                    //     }.bind(this);

                    //     oReader.readAsArrayBuffer(
                    //         this._oSelectedFile
                    //     );
                    // }
                    if (iIndex === 1) {

    if (!this._oSelectedFile) {
        MessageToast.show("Please select a file first");
        return;
    }

    // 🔹 Simulation checkbox
    var bSimulateLocal =
        this.byId("simulateCheckBox").getSelected();

    // 🔹 OData model
    var oModelLocal =
        this.getOwnerComponent().getModel("stockTransferModel");

    // // 🔹 Generate 3-digit FileId (same helper discussed earlier)
    // var sFileId = this.generate3DigitId(); // e.g. "725"

    var oReader = new FileReader();

    oReader.onload = function (oEvent) {

        var aBinaryData = oEvent.target.result;

        // 🔹 Read Excel
        var oWorkbook = XLSX.read(aBinaryData, {
            type: "array"
        });

        var sSheetName = oWorkbook.SheetNames[0];
        var oWorksheet = oWorkbook.Sheets[sSheetName];

        var aExcelData = XLSX.utils.sheet_to_json(oWorksheet, {
            defval: "",
            raw: true
        });

        // 🔹 Deep Entity Payload (AS REQUIRED)
        var oPayload = {
            FileId: sFileId,
            SimulationMode: bSimulateLocal,
            AL11Path: false,

            NavFile: [
                {
                    FileId: sFileId,
                    Value: JSON.stringify(aExcelData)
                }
            ],

            NavStockTransDocuments: [],
            NavSimulationResp: []
        };

        console.log("FINAL DEEP ENTITY PAYLOAD:", oPayload);

        // 🔹 Busy ON
        this.getOwnerComponent()
            .getModel("UiLoadingStatus")
            .setProperty("/busy", true);

        // 🔹 POST Deep Entity
        
        oModelLocal.create("/StockTransportInfoSet", oPayload, {

            // success: function (Response,status) {

            //     console.log("Deep Entity Response:", Response);
            //     console.log("Status",status);
            //     this.getOwnerComponent()
            //         .getModel("UiLoadingStatus")
            //         .setProperty("/busy", false);

            //     MessageToast.show("Excel uploaded successfully");

            //     // 🔹 If backend sends simulation / result data
            //     if (Response?.NavSimulationResp?.results) {
            //         var oResultModelNew = new sap.ui.model.json.JSONModel({
            //             records: Response.NavSimulationResp.results,
            //             fileId: sFileId
            //         });

            //         sap.ui.getCore().setModel(
            //             oResultModelNew,
            //             "stockTransferResultModel"
            //         );
            //     }
            //     // 🔹 Navigate to output screen
            // var oRouter = this.getOwnerComponent().getRouter();
            // if (oRouter) {
            //     oRouter.navTo("AiRPAStockTransferOutputScreen");
            // }
            // }.bind(this),
            success: function (Response) {
    console.log("Deep Entity Response:", Response);
    var sFileId = Response.FileId; // "725"
    this.loadResults(sFileId);

    this.getOwnerComponent()
        .getModel("UiLoadingStatus")
        .setProperty("/busy", false);

    MessageToast.show("Excel uploaded successfully");

    var aRecords = [];

    if (Response?.NavStockTransDocuments?.results) {
        aRecords = Response.NavStockTransDocuments.results;
    }

    var oResultModelNew = new sap.ui.model.json.JSONModel({
        records: aRecords
    });

    sap.ui.getCore().setModel(oResultModelNew, "stockTransferResultModel");

    // Navigate to output screen
    var oRouter = this.getOwnerComponent().getRouter();
    if (oRouter) {
        oRouter.navTo("AiRPAStockTransferOutputScreen");
    }
}.bind(this),
   

            error: function (oError) {

                console.error("Upload failed:", oError);

                this.getOwnerComponent()
                    .getModel("UiLoadingStatus")
                    .setProperty("/busy", false);

                MessageToast.show("Upload failed");
            }.bind(this)
        });

    }.bind(this);

    oReader.onerror = function () {
        MessageToast.show("File read failed");
    };

    oReader.readAsArrayBuffer(this._oSelectedFile);
}

                }
            }
        );
    }
);
