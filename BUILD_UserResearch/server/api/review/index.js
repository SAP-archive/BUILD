/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var router = express.Router();

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var auth = registry.getModule('AuthService');
var acl = registry.getModule('AclService');

var utils = require('../../utils');
var validator = require('../../config/paramsValidate.json');

var reviewController = require('../review/controller');

router.get('/studies/:studyId/review', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.review.getStats), reviewController.getStats);
router.get('/studies/:studyId/review/:questionId', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.review.getQuestionStats), reviewController.getQuestionStats);

exports.getHandler = function () {
    return router;
};
