'use strict';

var express = require('norman-server-tp').express;
var controller = require('./controller');

var router = express.Router();

var registry = require('norman-common-server').registry;
var auth = registry.getModule('AuthService');
var aclService = registry.getModule('AclService');

/******************************************************************************
 *      CRUD services of Business Catalog
 *
 * GET     /api/catalogs              ->  index
 * POST    /api/catalogs              ->  create
 * GET     /api/catalogs/:id          ->  show
 * PUT     /api/catalogs/:id          ->  update
 * PATCH   /api/catalogs/:id          ->  update
 * DELETE  /api/catalogs/:id          ->  destroy
 ******************************************************************************/
router.get('/', aclService.checkAllowed(2, auth.getUserId), controller.index);
router.get('/:id', aclService.checkAllowed(2, auth.getUserId), controller.show);
router.post('/', aclService.checkAllowed(2, auth.getUserId), controller.create);
router.put('/:id', aclService.checkAllowed(2, auth.getUserId), controller.update);
router.patch('/:id', aclService.checkAllowed(2, auth.getUserId), controller.update);
router.delete('/:id', aclService.checkAllowed(2, auth.getUserId), controller.destroy);

/******************************************************************************
 *      Business services of Business Catalog
 *
 * POST    /api/catalogs/import                ->  import
 * POST    /api/catalogs/entities/search       ->  searchEntities
 * GET     /api/catalogs/entities/:entityId    ->  getEntity
 ******************************************************************************/
router.post('/import', aclService.checkAllowed(3, auth.getUserId), controller.import);
router.post('/entities/search', aclService.checkAllowed(3, auth.getUserId), controller.searchEntities);
router.get('/entities/:entityId', aclService.checkAllowed(2, auth.getUserId), controller.getEntity);

module.exports = router;
