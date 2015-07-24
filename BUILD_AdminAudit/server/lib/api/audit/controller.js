'use strict';
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var registry = commonServer.registry;
var auditAdminService = registry.getModule('auditAdmin');
var controller = {};
module.exports = controller;

/**
 * Entry point for audit log export
 * @param req the request
 * @param res the response
 */
controller.downloadAudit = function (req, res) {

    // the date range should be in the request params
    var startDate = new Date(), endDate = new Date();
    startDate.setTime(req.params.startdate);
    endDate.setTime(req.params.enddate);

    // call the service
    auditAdminService.getAudit(startDate, endDate)
        .then(function (oAuditExport) {
            res.status(200).json(oAuditExport);
        })
        .catch(function (err) {
            res.status(500).json(new NormanError('Failed to retrieve Audit', err));
        });
};

