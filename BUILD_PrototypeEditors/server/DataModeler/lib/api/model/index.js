'use strict';

var commonServer = require('norman-common-server');
var controller = require('./controller');
var express = require('norman-server-tp').express;
var router = new express.Router();
var registry = commonServer.registry;
var auth = registry.getModule('AuthService');
var aclService = registry.getModule('AclService');

var multipart = require('norman-common-server').upload;
var multipartMiddleware = multipart({
    inMemory: false,
    mimetype: [ 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ]
});

/******************************************************************************
 *      CRUD services of Data Modeler
 *
 *     =========== Model ===========================
 *
 * GET     /api/models/:projectId          ->  getModel
 * PUT     /api/models/:projectId          ->  updateModel
 *
 * POST    /api/models/:projectId/importxl              ->  importXl
 * POST    /api/models/:projectId/updatexl              ->  updateXl
 * GET     /api/models/:projectId/exportXl?table=true   ->  exportXl
 *
 ******************************************************************************/

router.get('/:projectId', aclService.checkAllowed(3, auth.getUserId), controller.getModel);
router.put('/:projectId', aclService.checkAllowed(3, auth.getUserId), controller.updateModel);
router.post('/:projectId/importxl', aclService.checkAllowed(3, auth.getUserId), multipartMiddleware, controller.importXL);
router.post('/:projectId/updatexl', aclService.checkAllowed(3, auth.getUserId), multipartMiddleware, controller.updateXl);
router.get('/:projectId/exportXl', aclService.checkAllowed(3, auth.getUserId), controller.exportXl);

/******************************************************************************
 *     =========== Entity ===========================
 *
 * POST    /api/models/:projectId/entities                                              ->  addEntity
 * PUT     /api/models/:projectId/entities/:entityId                                    ->  updateEntity
 * DELETE  /api/models/:projectId/entities/:entityId                                    ->  removeEntity
 *
 * GET     /api/models/:projectId/entities/:entityId/exportXl?table=true                -> exportXlEntity
 *
 ******************************************************************************/

router.post('/:projectId/entities', aclService.checkAllowed(3, auth.getUserId), controller.addEntity);
router.put('/:projectId/entities/:entityId', aclService.checkAllowed(3, auth.getUserId), controller.updateEntity);
router.delete('/:projectId/entities/:entityId', aclService.checkAllowed(3, auth.getUserId), controller.removeEntity);

router.get('/:projectId/entities/:entityId/exportXl', aclService.checkAllowed(3, auth.getUserId), controller.exportXlEntity);

/******************************************************************************
 *     =========== Property ===========================
 *
 * POST    /api/models/:projectId/entities/:entityId/properties                 ->  addProperty
 * PUT     /api/models/:projectId/entities/:entityId/properties/:propertyId       ->  updateProperty
 * DELETE  /api/models/:projectId/entities/:entityId/properties/:propertyId     ->  removeProperty
 *
 ******************************************************************************/

router.post('/:projectId/entities/:entityId/properties', aclService.checkAllowed(3, auth.getUserId), controller.addProperty);
router.put('/:projectId/entities/:entityId/properties/:propertyId', aclService.checkAllowed(3, auth.getUserId), controller.updateProperty);
router.delete('/:projectId/entities/:entityId/properties/:propertyId', aclService.checkAllowed(3, auth.getUserId), controller.removeProperty);

/******************************************************************************
 *     =========== Navigation Property ===========================
 *
 * POST    /api/models/:projectId/entities/:entityId/navigationProperties                   ->  addNavigationProperty
 * PUT     /api/models/:projectId/entities/:entityId/navigationProperties/:navPropId      ->  updateNavigationProperty
 * DELETE  /api/models/:projectId/entities/:entityId/navigationProperties/:navPropertyId    ->  removeNavigationProperty
 *
 ******************************************************************************/

router.post('/:projectId/entities/:entityId/navigationProperties', aclService.checkAllowed(3, auth.getUserId), controller.addNavigationProperty);
router.put('/:projectId/entities/:entityId/navigationProperties/:navPropId', aclService.checkAllowed(3, auth.getUserId), controller.updateNavigationProperty);
router.delete('/:projectId/entities/:entityId/navigationProperties/:navigationPropertyId', aclService.checkAllowed(3, auth.getUserId), controller.removeNavigationProperty);

/******************************************************************************
 *      =========== Sample data ===========
 *
 * POST   /api/models/:projectId/entities/:entityName/sampleData   -> addSampleData
 * GET    /api/models/:projectId/entities/:entityName/sampleData   -> getSampleData
 ******************************************************************************/
router.post('/:projectId/entities/:entityName/sampleData', aclService.checkAllowed(3, auth.getUserId), controller.addSampleData);
router.get('/:projectId/entities/:entityName/sampleData', aclService.checkAllowed(3, auth.getUserId), controller.getSampleData);

/******************************************************************************
 *      Model oData
 *
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/models/:projectId/oData/                    ->  getServiceDescription
 * GET     /api/models/:projectId/oData/metadata.xml        ->  getMetadata
 * GET     /api/models/:projectId/oData/$metadata           ->  getMetadata
 * GET     /api/models/:projectId/oData/:entityName         ->  getEntity
 * GET     /api/models/:projectId/oData/:entityName.json    ->  getEntity
 *
 ******************************************************************************/
router.get('/:projectId/oData', aclService.checkAllowed(3, auth.getUserId), controller.getServiceDescription);
router.get('/:projectId/oData/metadata.xml', aclService.checkAllowed(3, auth.getUserId), controller.getMetadata);
router.get('/:projectId/oData/\$metadata', aclService.checkAllowed(3, auth.getUserId), controller.getMetadata);
router.get('/:projectId/oData/:entityName', aclService.checkAllowed(3, auth.getUserId), controller.getEntityData);

/******************************************************************************
 *     =========== Property Types ===========================
 *
 * GET    /api/models/:projectId/propertyTypes ->  getTypes
 ******************************************************************************/

router.get('/:projectId/propertyTypes', aclService.checkAllowed(3, auth.getUserId), controller.getTypes);

/******************************************************************************
 *     =========== Catalog ===========================
 * POST    /api/models/:projectId/catalog/:catalogId                                            ->  addEntitiesFromCatalog
 * POST    /api/models/:projectId/catalog/:catalogId/catalogEntities/:catalogEntityId?nav=true  ->  addEntityFromCatalog
 *
 ******************************************************************************/

router.post('/:projectId/catalog/:catalogId', aclService.checkAllowed(3, auth.getUserId), controller.addEntitiesFromCatalog);
router.post('/:projectId/catalog/:catalogId/catalogEntities/:catalogEntityId', aclService.checkAllowed(3, auth.getUserId), controller.addEntityFromCatalog);


/******************************************************************************
 *     =========== Group ===========================
 * GET    /api/models/:projectId/standardgroups/                     ->  getStandardGroups
 * POST   /api/models/:projectId/entities/:entityId/groups/          ->  addGroup
 * PUT    /api/models/:projectId/entities/:entityId/groups/:groupId  ->  updateGroup
 * DELETE /api/models/:projectId/entities/:entityId/groups/:groupId  ->  removeGroup
 *
 ******************************************************************************/

router.get('/:projectId/standardgroups', aclService.checkAllowed(3, auth.getUserId), controller.getStandardGroups);
router.post('/:projectId/entities/:entityId/groups', aclService.checkAllowed(3, auth.getUserId), controller.addGroup);
router.put('/:projectId/entities/:entityId/groups/:groupId', aclService.checkAllowed(3, auth.getUserId), controller.updateGroup);
router.delete('/:projectId/entities/:entityId/groups/:groupId', aclService.checkAllowed(3, auth.getUserId), controller.removeGroup);

module.exports = router;
