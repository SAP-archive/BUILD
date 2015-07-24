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
 *     GET      --> /api/project/:projectId/prototype
 *     POST     --> /api/project/:projectId/prototype
 */

router.get('/*/prototype/', aclService.checkAllowed(3, authService.getUserId), controller.getPrototype);
// this call should never happen and is not used anywhere - just for testing purpose
router.post('/*/prototype/', aclService.checkAllowed(3, authService.getUserId), controller.createPrototype);
router.put('/*/prototype/', aclService.checkAllowed(3, authService.getUserId), controller.updatePrototype);


module.exports = router;
