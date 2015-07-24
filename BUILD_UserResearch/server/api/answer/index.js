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

// Base URL /api/participant/studies/:studyId/answers
router.put('/studies/:studyId/answers/', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.answers.create), controller.create);
router.get('/studies/:studyId/answers/', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.answers.index), controller.index);
router.get('/studies/:studyId/answers/:answerId', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.answers.show), controller.show);
router.delete('/studies/:studyId/answers/:answerId', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.answers.destroy), controller.destroy);

exports.getHandler = function () {
    return router;
};

exports.checkSchema = function (done) {
    controller.checkSchema(done);
};

