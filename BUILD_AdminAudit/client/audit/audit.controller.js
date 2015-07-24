'use strict';
// @ngInject
module.exports = ['$scope', '$rootScope', '$http', '$upload', 'AuditAdminService',
    function ($scope, $rootScope, $http, $upload, AuditAdminService) {

        // store the settings
        $scope.timeperiod = {selected: ''};
        $scope.warningInfo = {visible: false, message: 'No logs available for given dates'};
        $scope.dateControls = {disabled: true};


        /**
         * Download the audit logs
         */
        $scope.download = function () {
            var params = {
                startdate: $scope.timeperiod.start.getTime(),
                enddate: $scope.timeperiod.end.getTime()
            };
            $scope.warningInfo.visible = false;

            AuditAdminService.getAudit(params, function (response) {
                if (response && response.data) {
                    $scope.downloadData(response, 'audit_log.csv');
                }
                else {
                    $scope.warningInfo.visible = true;
                }
            });
        };

        /**
         * Save the file
         * @param response the server response
         */
        $scope.downloadData = function (response) {
            var link = document.createElement('a');
            var csvContent = 'data:text/csv;charset=utf-8,' + response.data;
            link.href = encodeURI(csvContent);
            link.download = response.filename;
            link.click();
            link.remove();
        };

        /**
         * Set the date range for today
         */
        $scope.setToday = function () {
            $scope.timeperiod.selected = 'today';
            $scope.timeperiod.start = $scope.setDateTime(new Date(), 0, 0);
            $scope.timeperiod.end = $scope.setDateTime(new Date(), 0, 0, +1);
            $scope.dateControls.disabled = true;
        };

        /**
         * Set the date range for the last 48 hours
         */
        $scope.setLast48 = function () {
            $scope.timeperiod.selected = 'last48';
            $scope.timeperiod.start = $scope.setDateTime(new Date(), 0, 0, -1);
            $scope.timeperiod.end = $scope.setDateTime(new Date(), 0, 0, +1);
            $scope.dateControls.disabled = true;
        };

        /**
         * Set the date range for 10 days ago
         */
        $scope.setDays = function () {
            $scope.timeperiod.selected = 'days';
            $scope.timeperiod.start = $scope.setDateTime(new Date(), 0, 0, -10);
            $scope.timeperiod.end = $scope.setDateTime(new Date(), 0, 0, +1);
            $scope.dateControls.disabled = true;
        };

        /**
         * Allow custom editing of date range
         */
        $scope.setCustom = function () {
            $scope.timeperiod.selected = 'custom';
            $scope.dateControls.disabled = false;
        };

        $scope.startDateChanged = function () {
        };

        $scope.endDateChanged = function () {
        };

        /**
         * Set the date
         */
        $scope.setDateTime = function (oDate, iHours, iMinutes, iDays) {
            oDate.setHours(iHours, iMinutes, 0, 0);

            if (iDays) {
                oDate.setDate(oDate.getDate() + iDays);
            }

            return oDate;
        };

        // setup view
        $scope.setToday();

    }

];
