/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var controller = require('./controller');
var authService = registry.getModule('AuthService');
var aclService = registry.getModule('AclService');
var utils = require('../../utils');
var validator = require('../../config/paramsValidate.json');
var serviceLogger = commonServer.logging.createLogger('user-research-proto');

var router = express.Router();

// Multipart middleware required for fileupload
var multipart = require('norman-common-server').upload;
var multipartMiddleware = multipart({
    inMemory: true,
    onError: function (err) {
        serviceLogger.error('<< UR prototype: ', err);
    }
});

router.post('/research/htmlPrototypes/', aclService.checkAllowed(3, authService.getUserId), multipartMiddleware, utils.validateParams(validator.prototype.uploadZip), controller.uploadZip);
router.post('/research/htmlPrototypes/thumbnail', aclService.checkAllowed(3, authService.getUserId), multipartMiddleware, utils.validateParams(validator.prototype.addThumbnail), controller.addThumbnail);

exports.getHandler = function () {
    return router;
};
