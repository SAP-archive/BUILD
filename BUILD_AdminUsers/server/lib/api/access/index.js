'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var router = new express.Router();

router.get('/', controller.index);
router.delete('/:domain', controller.deleteSecurityPolicy);
router.post('/securityPolicy', controller.setSecurityPolicy);
module.exports = router;
