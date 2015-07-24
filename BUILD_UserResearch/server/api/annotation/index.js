/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');
var utils = require('../../utils');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var validator = require('../../config/paramsValidate.json');
var auth = registry.getModule('AuthService');
var acl = registry.getModule('AclService');

var router = express.Router();

router.post('/studies/:studyId/annotations/', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.annotations.create), controller.create);
router.put('/studies/:studyId/annotations/:id', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.annotations.update), controller.update);
router.patch('/studies/:studyId/annotations/:id', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.annotations.update), controller.update);
router.delete('/studies/:studyId/annotations/:id', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.annotations.destroy), controller.destroy);

exports.getHandler = function () {
    return router;
};

exports.checkSchema = function (done) {
    controller.checkSchema(done);
};
