'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var router = new express.Router();
router.get('/', controller.index);
router.delete('/:id', controller.delete);
router.post('/role', controller.setRole);
module.exports = router;
