'use strict';
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var registry = commonServer.registry;
var userAdminService = registry.getModule('userAdmin');
var controller = {};
module.exports = controller;

controller.index = function (req, res) {
    var fields = {};
    var options = {};

    fields.name = req.query.name;
    options.sort = req.query.sort;
    options.skip = req.query.skip;
    options.top = req.query.top;
    options.withRoles = req.query.withRoles;

    userAdminService.getUsers(fields, options)
        .then(function (result) {
            res.status(200).json(result);
        })
        .catch(function (err) {
            res.status(500).json(new NormanError('Failed to retrieve Users', err));
        });
};

controller.setRole = function (req, res) {
    userAdminService.setRole(req.body.id, req.body.role, req.context)
        .then(function () {
            res.status(200).json({});
        })
        .catch(function (err) {
            res.status(500).json(new NormanError('Failed to set the user role', err));
        });
};

controller.delete = function (req, res) {
    userAdminService.delete(req)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
            }
            return res.status(204).end();
        }).catch(function (err) {
            res.status(500).json(new NormanError('Error deleting user', err));
        });
};
