'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');
var router = express.Router();
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var auth = registry.getModule('AuthService');
var aclService = registry.getModule('AclService');

// GET requests
router.get('/:projId/:entityName', aclService.checkAllowed(3, auth.getUserId), controller.getEntityNavDataForProj);
router.get('/:projId', aclService.checkAllowed(3, auth.getUserId), controller.getSampleData);

// POST requests
router.put('/:projId', aclService.checkAllowed(3, auth.getUserId), controller.updateSampleData);

module.exports = router;
