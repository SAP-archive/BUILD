'use strict';

var tp = require('norman-server-tp');
var express = tp.express;
var controller = require('./controller');
var router = new express.Router();
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var aclService = registry.getModule('AclService');
var authService = registry.getModule('AuthService');

/**
 *     GET     -->     /api/project/:projectId/prototype/artifact/*
 */
router.get('/*/prototype/artifact/*', aclService.checkAllowed(4, authService.getUserId), controller.getArtifact);


module.exports = router;
