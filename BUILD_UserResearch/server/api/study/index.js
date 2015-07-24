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

// Base URL: /api/projects/:projectId/studies
router.get('/studies/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.index), controller.index);
router.get('/studies/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.show), controller.show);
router.post('/studies/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.create), controller.create);
router.post('/studies/create/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.create), controller.createWithQuestion);

router.post('/studies/:id/sendInvitee', acl.checkAllowed(3, auth.getUserId), utils.validateParams(validator.studies.sendInvitee), controller.sendInvitee);
router.put('/studies/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.update), controller.update);
router.patch('/studies/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.update), controller.update);
router.delete('/studies/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.studies.destroy), controller.destroy);

exports.getHandler = function () {
    return router;
};

exports.checkSchema = function (done) {
    controller.checkSchema(done);
};
