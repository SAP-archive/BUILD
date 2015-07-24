'use strict';
var tp = require('norman-server-tp');
var express = tp.express;

var controller = require('./controller');
var router = new express.Router();
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var aclService = registry.getModule('AclService');
var authService = registry.getModule('AuthService');

var multipart = require('norman-common-server').upload;
var multipartMiddleware = multipart({inMemory: true});

/**
 *     POST    -->     /api/project/:projectId/prototype/page
 *     PUT     -->     /api/project/:projectId/prototype/page
 *     DELETE  -->     /api/project/:projectId/prototype/page
 *     GET     -->     /api/project/:projectId/prototype/page/?pageName=S0
 */
router.post('/*/prototype/page', aclService.checkAllowed(4, authService.getUserId), controller.createPage);
router.put('/*/prototype/page', aclService.checkAllowed(4, authService.getUserId), multipartMiddleware, controller.updatePage);
router.delete('/*/prototype/page', aclService.checkAllowed(4, authService.getUserId), controller.deletePage);
router.get('/*/prototype/page/mainEntities', aclService.checkAllowed(4, authService.getUserId), controller.getPossibleMainEntities);
router.get('/*/prototype/page', aclService.checkAllowed(4, authService.getUserId), controller.getPage);
router.post('/*/prototype/page/coordinates', aclService.checkAllowed(4, authService.getUserId), controller.updateCoordinates);


module.exports = router;
