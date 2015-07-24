'use strict';
var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var accessService;

module.exports.hasAccess = function (req, res) {

    if (!accessService) {
        accessService = registry.lookupModule('AccessService');
        if (!accessService) {
            return res.status(500).json(new commonServer.CommonError('Access service not initialized'));
        }
    }

    if (!req.body || !req.body.email) {
        return res.status(400).end();
    }

    accessService.getPermissions(req.body.email, 'access')
        .then(function (permissions) {
            var hasAccess = permissions && permissions.length > 0;
            if (hasAccess) {
                return res.status(200).send('1');
            }
            return res.status(200).send('0');
        })
        .catch(function (err) {
            var error = new commonServer.CommonError('Failed to query user rights', err);
            res.status(500).json(error);
        });
};
