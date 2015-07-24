/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var auth = registry.getModule('AuthService');
var acl = registry.getModule('AclService');
var utils = require('../../utils');
var validator = require('../../config/paramsValidate.json');

var router = express.Router();

router.get('/studies/:studyId/tracking/', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.tracking.index), controller.index);
router.get('/studies/:studyId/tracking/:id', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.tracking.show), controller.show);

exports.getHandler = function () {
  return router;
};

exports.checkSchema = function (done) {
    controller.checkSchema(done);
};
