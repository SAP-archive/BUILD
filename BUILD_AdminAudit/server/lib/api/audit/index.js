'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var router = new express.Router();
router.get('/:startdate/:enddate', controller.downloadAudit);
module.exports = router;
