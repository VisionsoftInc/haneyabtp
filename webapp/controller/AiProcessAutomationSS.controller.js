sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";
    
    return Controller.extend("haneya.controller.AiProcessAutomationSS", {
        onInit() {
             jQuery.sap.includeStyleSheet(sap.ui.require.toUrl("haneya/view/AiProcessAutomationSS.view.css"));
        },
       
        OnExecute: function() {
            // Get the date range selection
            var oDateRange = this.byId("DRS1");
            var oStartDate = oDateRange.getDateValue();
            var oEndDate = oDateRange.getSecondDateValue();

            // Format dates as yyyyMMdd for OData
            var sStart = oStartDate ? this._formatDate(oStartDate) : "";
            var sEnd   = oEndDate ? this._formatDate(oEndDate) : "";

            // Get the selected radio button
            var oGroup = this.byId("rbGroup");  // Make sure your RadioButtonGroup has this ID
            var iSelected = oGroup.getSelectedIndex();
              console.log(iSelected)
            var sStatus = "ALL";           // Default
            if (iSelected === 0) sStatus = "SUCCESS";
            else if (iSelected === 1) sStatus = "FAILED";

            // Navigate to SmartTable view with ALL parameters
            this.getOwnerComponent().getRouter().navTo("AiRPAInterCompSalesEventBasedOutput", {
                startDate: sStart,
                endDate: sEnd,
                status: sStatus      // <-- Must include this
            });
        },

        _formatDate: function(oDate) {
            var y = oDate.getFullYear();
            var m = ("0" + (oDate.getMonth() + 1)).slice(-2);
            var d = ("0" + oDate.getDate()).slice(-2);
            return y + m + d;
        }
    });
});