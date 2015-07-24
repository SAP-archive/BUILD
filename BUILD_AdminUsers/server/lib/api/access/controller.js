'use strict';
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var registry = commonServer.registry;
var accessAdminService = registry.getModule('accessAdmin');
var controller = {};
module.exports = controller;

controller.index = function (req, res) {
    var options = {};
    accessAdminService.getSecurityPolicies(options)
        .then(function (result) {
            res.status(200).json(result);
        })
        .catch(function (err) {
            res.status(500).json(new NormanError('Failed to retrieve Security Policies', err));
        });
};



controller.setSecurityPolicy = function (req, res) {
    accessAdminService.setSecurityPolicy(req.body.securityPolicy, req.context)
        .then(function () {
            res.status(200).json({});
        })
        .catch(function (err) {
            res.status(500).json(new NormanError('Failed to set the Security Policy', err));
        });
};

controller.deleteSecurityPolicy = function (req, res) {
    accessAdminService.deleteSecurityPolicy(req)
        .then(function (securityPolicy) {
            if (!securityPolicy) {
                res.status(404).json(new NormanError('Unable to find Security Policy'));
            }
            return res.status(204).end();
        }).catch(function (err) {
            res.status(500).json(new NormanError('Error deleting Security Policy', err));
        });
};
