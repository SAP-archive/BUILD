'use strict';

var controller = require('./controller');
var tp = require('norman-server-tp');
var express = tp.express;
var router = new express.Router();


router.post('/hasAccess', controller.hasAccess);

module.exports = router;
