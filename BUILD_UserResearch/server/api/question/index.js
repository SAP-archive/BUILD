/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var auth = registry.getModule('AuthService');
var acl = registry.getModule('AclService');

var utils = require('../../utils');
var validator = require('../../config/paramsValidate.json');

var router = express.Router();

router.post('/studies/:studyId/questions/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.questions.create), controller.create);
router.put('/studies/:studyId/questions/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.questions.updateOrder), controller.updateOrder);
router.put('/studies/:studyId/questions/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.questions.update), controller.update);
router.patch('/studies/:studyId/questions/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.questions.update), controller.update);
router.delete('/studies/:studyId/questions/:id', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.questions.destroy), controller.destroy);
router.delete('/studies/:studyId/questions/:id/bulk', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.questions.destroy), controller.bulkDestroy);

/********************   Tasks   ****************************/

router.get('/studies/:studyId/tasks/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.tasks.getTasks), controller.getTasks);
router.post('/studies/:studyId/tasks/', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.tasks.create), controller.createTask);
router.get('/studies/:studyId/tasks/:taskId', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.tasks.getTaskById), controller.getTaskById);
router.put('/studies/:studyId/tasks/:taskId', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.tasks.update), controller.updateTask);
router.delete('/studies/:studyId/tasks/:taskId', acl.checkAllowed(4, auth.getUserId), utils.validateParams(validator.tasks.destroy), controller.deleteTask);



/*******************  Handlers for the service URLS used for adding files via drag and drop ******/

// Multipart middleware required for fileupload
var multipart = require('norman-common-server').upload;
var serviceLogger = commonServer.logging.createLogger('user-research-proto');
var multipartMiddleware = multipart({
    inMemory: true,
    onError: function (err) {
        serviceLogger.error('<< UR prototype: ', err);
    }
});

router.post('/research/uploadFiles/thumbnail', acl.checkAllowed(3, auth.getUserId), multipartMiddleware, controller.uploadThumbnail);
router.post('/research/uploadFiles/*', acl.checkAllowed(3, auth.getUserId), multipartMiddleware, controller.uploadFiles);


exports.getHandler = function () {
    return router;
};

exports.checkSchema = function (done) {
    controller.checkSchema(done);
};
