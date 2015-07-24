'use strict';

var tp = require('norman-server-tp');
var express = tp.express;

var controller = require('./controller');
var router = new express.Router();
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var aclService = registry.getModule('AclService');
var authService = registry.getModule('AuthService');
module.exports = router;

/**
 *     GET      --> /api/project/:projectId/prototype/snapshot
 *     POST     --> /api/project/:projectId/prototype/snapshot
 */
router.get('/*/prototype/snapshot', aclService.checkAllowed(4, authService.getUserId), controller.show);
router.get('/*/prototype/snapshot/*/*', controller.getSnapshotArtifact);
router.post('/*/prototype/snapshot', aclService.checkAllowed(4, authService.getUserId), controller.create);
router.get('/*/prototype/zipsnapshot', aclService.checkAllowed(4, authService.getUserId), controller.retrieveZippedSnapshot);
