/*eslint new-cap: 0*/
'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var auth = registry.getModule('AuthService');
var acl = registry.getModule('AclService');

var router = express.Router();

router.get('/studyprototypes/', acl.checkAllowed(3, auth.getUserId), controller.index);
router.get('/studyprototypes/pages', acl.checkAllowed(3, auth.getUserId), controller.getPrototypePages);
router.delete('/studyprototypes/:id', acl.checkAllowed(3, auth.getUserId), controller.destroy);

exports.getHandler = function () {
    return router;
};

exports.checkSchema = function (done) {
    controller.checkSchema(done);
};
