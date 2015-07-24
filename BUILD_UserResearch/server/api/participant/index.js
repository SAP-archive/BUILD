/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var annotationController = require('../annotation/controller');
var answerController = require('../answer/controller');
var trackingController = require('../tracking/controller');
var auth = registry.getModule('AuthService');
var acl = registry.getModule('AclService');
var utils = require('../../utils');
var validator = require('../../config/paramsValidate.json');

var router = express.Router();

// Base URL /api/participant/studies
router.get('/studies/', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.participants.participate), controller.participate);
router.get('/prototype/:studyPrototypeId/render/*', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.participants.renderPrototype), controller.renderPrototype);

router.get('/:studyId', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.participants.show), controller.show);
router.get('/:studyId/document/:assetId/:versionId/render', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.participants.render), controller.render);

router.post('/:studyId/annotations/', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.annotations.create), annotationController.create);
router.put('/:studyId/annotations/:id', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.annotations.update), annotationController.update);
router.patch('/:studyId/annotations/:id', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.annotations.update), annotationController.update);
router.delete('/:studyId/annotations/:id', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.annotations.destroy), annotationController.destroy);

// Answers routes, base URL /api/participant/studies/:studyId/answers
router.put('/studies/:studyId/answers/', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.answers.create), answerController.create);
router.get('/studies/:studyId/answers/', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.answers.index), answerController.index);
router.get('/studies/:studyId/answers/:answerId', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.answers.show), answerController.show);
router.delete('/studies/:studyId/answers/:answerId', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.answers.destroy), answerController.destroy);

// tracking call for analytics
router.post('/studies/:studyId/tracking/', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.tracking.create), trackingController.create);

// Update user to be anonymous for a particular study
router.put('/studies/:studyId/anonymous', acl.checkAllowed(2, auth.getUserId), utils.validateParams(validator.participants.toggleAnonymous), controller.toggleAnonymous);

exports.getHandler = function () {
    return router;
};

