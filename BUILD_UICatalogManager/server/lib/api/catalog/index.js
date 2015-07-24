/* no-unused-vars: 0 */
'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');
var router = express.Router();

// for file upload
var multipart = require('norman-common-server').upload;
var multipartMiddleware = multipart();
var multipartMiddlewareLib = multipart({
    inMemory: true
});
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var acl = registry.getModule('AclService');
var auth = registry.getModule('AuthService');

//POST requests
router.post('/catalogupload', acl.checkAllowed(2, auth.getUserId), multipartMiddleware, controller.upload);
router.post('/catalogupdate', acl.checkAllowed(2, auth.getUserId), multipartMiddleware, controller.updateCatalog);
router.post('/uilib/:libType/:libVersion/:isPrivate/uploaduilib', acl.checkAllowed(2, auth.getUserId), multipartMiddlewareLib, controller.uploadUILibrary);
router.post('/updateCustomCatalog', acl.checkAllowed(2, auth.getUserId),controller.updateCustomCatalog);
router.post('/deletecontrols', acl.checkAllowed(2, auth.getUserId),controller.deleteControls);

// GET requests
router.get('/getSampleTemplates', controller.getSampleTemplates);
router.get('/getcatalogs/:filter(*)', acl.checkAllowed(2, auth.getUserId), controller.getCatalogs);
router.get('/getCompatibleCatalogs/:catalogId', acl.checkAllowed(2, auth.getUserId), controller.getCompatibleCatalogs);

router.get('/downloadcatalog/libtype/:libType', acl.checkAllowed(2, auth.getUserId), controller.download);
router.get('/catalog/libraryType/:libraryType/getFloorPlans', acl.checkAllowed(2, auth.getUserId), controller.getFloorPlanByLibType);
router.get('/catalog/name/:name/catalogversion/:catalogVersion/actions', acl.checkAllowed(2, auth.getUserId), controller.getActions);
router.get('/catalog/name/:name/catalogversion/:catalogVersion', controller.getCatalog);
//router.get('/public/uilib/:type/:version/:pathFileName', acl.checkAllowed(2, auth.getUserId), controller.getLibraryFile);
router.get('/public/uilib/:type/:version/:pathFileName([a-zA-Z0-9./]*)', acl.checkAllowed(2, auth.getUserId), controller.getLibraryFile);
router.get('/catalog/catalogid/:catalogId', acl.checkAllowed(2, auth.getUserId), controller.getCatalogById);
router.get('/libtype/:libType/getuilibversions', acl.checkAllowed(2, auth.getUserId), controller.getAvailableVersions);

router.get('/private/uilib/:type/:version/:pathFileName([a-zA-Z0-9./]*)', acl.checkAllowed(2, auth.getUserId), controller.getPrivateLibraryFile);
router.get('/private/metadatagen/:libraryVersion/:isPrivate/:type/:version/:pathFileName([a-zA-Z0-9./]*)', acl.checkAllowed(2, auth.getUserId), controller.getMetadataGeneratorFiles);

// DELETE requests
router.delete('/catalog/name/:name/catalogversion/:catalogVersion/delete', acl.checkAllowed(2, auth.getUserId), controller.deleteCatalog);
module.exports = router;
