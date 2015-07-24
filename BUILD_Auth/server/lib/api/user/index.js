'use strict';

// var express = require('express');
var controller = require('./user.controller');
var tp = require('norman-server-tp');
var express = tp.express;
var multipart = require('norman-common-server').upload;
var multipartMiddleware = multipart({inMemory: true});
var commonServer = require('norman-common-server');
var auth = commonServer.registry.getModule('AuthService');
var aclService = commonServer.registry.getModule('AclService');
var router = new express.Router();

// double check that this is not used and remove it in non-enterprise version
router.get('/', aclService.checkAllowed(2, auth.getUserId), controller.index);

router.post('/', aclService.checkAllowed(2, auth.getUserId), controller.create);

// Avatar Requests
router.post('/avatar', aclService.checkAllowed(3, auth.getUserId), multipartMiddleware, controller.showAvatarList);

router.get('/me', controller.me);

router.get('/me/preferences', controller.getPreferences);
router.put('/me/preferences', controller.updatePreferences);

// double check that this is not used and remove it in non-enterprise version
router.get('/:id', controller.show);
router.put('/:id/password', controller.checkUserId, controller.changePassword);

router.put('/:id/avatar', controller.checkUserId, multipartMiddleware, controller.changeAvatar);
router.delete('/:id/avatar', controller.checkUserId, multipartMiddleware, controller.removeAvatar);
router.get('/:id/avatar', multipartMiddleware, controller.picture);

router.put('/:id/profile', controller.checkUserId, controller.updateProfile);
router.get('/:id/verifyEmail', controller.verifyEmail);
router.get('/:id/resendVerificationEmail', controller.resendVerificationEmail);

// router.delete('/:id', controller.destroy);

module.exports = router;
