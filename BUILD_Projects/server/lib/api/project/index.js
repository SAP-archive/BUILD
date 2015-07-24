'use strict';

var tp = require('norman-server-tp');
var express = tp.express;

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var aclService = registry.getModule('AclService');
var authService = registry.getModule('AuthService');
var historyController = require('../history/history.controller');
var projectController = require('./project.controller');
var documentController = require('../document/document.controller');

// Dev-note: WARNING: Uploading very large files, or relatively small files in large numbers very quickly,
// can cause your application to run out of memory when inMemory is set to true.
// https://github.com/expressjs/multer
var multipart = require('norman-common-server').upload;
var multipartMiddleware = multipart({inMemory: true});

var router = express.Router();

// Handle Invite requests
// Dev-note: authentication is not required on all URl's
// 1. put/patch does not have ACL applied as the user will not be an owner/collaborator of the project
// 2. Delete, has no ACL either, same as point 1.
router.put('/:projectId/invite', projectController.acceptInvite);
router.patch('/:projectId/invite', projectController.acceptInvite);
router.post('/:projectId/invite', aclService.checkAllowed(3, authService.getUserId), projectController.createInvite);
router.delete('/:projectId/invite', projectController.rejectInvite);

// Handle Team requests
router.get('/:projectId/team', aclService.checkAllowed(3, authService.getUserId), projectController.getTeam);

// Handle Owner requests
router.put('/:projectId/owner', aclService.checkAllowed(4, authService.getUserId), projectController.changeOwner);

// Handle history requests
router.get('/:projectId/history', aclService.checkAllowed(3, authService.getUserId), historyController.getHistory);
router.post('/:projectId/history', aclService.checkAllowed(3, authService.getUserId), historyController.logHistory);

// Handle Project requests
router.get('/', projectController.index);
router.get('/:projectId', aclService.checkAllowed(3, authService.getUserId), projectController.show);
router.post('/', projectController.create);

// Lock down Project delete/update requests, ACL will manage access to these URLs
router.put('/:projectId/settings', aclService.checkAllowed(3, authService.getUserId), projectController.update);
router.patch('/:projectId/settings', aclService.checkAllowed(3, authService.getUserId), projectController.update);
router.delete('/:projectId/settings', aclService.checkAllowed(3, authService.getUserId), projectController.delete);

// Handle Asset requests
router.get('/:projectId/document', aclService.checkAllowed(3, authService.getUserId), documentController.index);
router.post('/:projectId/document/', aclService.checkAllowed(3, authService.getUserId), multipartMiddleware, documentController.upload);
router.post('/:projectId/document/upload', aclService.checkAllowed(3, authService.getUserId), multipartMiddleware, documentController.upload);
router.delete('/:projectId/document/:assetId', aclService.checkAllowed(4, authService.getUserId), documentController.delete);
router.get('/:projectId/document/:assetId', aclService.checkAllowed(3, authService.getUserId), documentController.getAsset);
router.get('/:projectId/document/:assetId/render', aclService.checkAllowed(3, authService.getUserId), documentController.render);
router.get('/:projectId/document/:assetId/:versionId/render', aclService.checkAllowed(3, authService.getUserId), documentController.render);
router.get('/:projectId/document/:assetId/:versionId', aclService.checkAllowed(3, authService.getUserId), documentController.getAsset);

module.exports = router;
