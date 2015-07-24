'use strict';

var fs = require('fs');
var http = require('http');

var registry = require('norman-common-server').registry;
var service = registry.getModule('Model');
var Q = require('q');
var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('model-service');
var NormanError = commonServer.NormanError;
var FORBIDDEN_CHAR_IN_FILENAME = new RegExp('[!#$%&\'@^`~+,.;=)(]', 'g');

var controller = {};
module.exports = controller;

function _getSessionId(req) {
    return (!!req && !!req.context && !!req.context.session) ? req.context.session.id : undefined;
}

controller.getModel = function (req, res) {
    service.getModel(req.params.projectId)
        .then(function (data) {
            return controller.handleSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.updateModel = function (req, res) {
    service.updateModel(req.params.projectId, req.body, req.user, _getSessionId(req))
        .then(function () {
            controller.handleSuccess(res);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.importXL = function (req, res) {
    controller.readFile(req.files.file.path)
        .then(function (data) {
            return service.importXL(req.params.projectId, data, req.user, _getSessionId(req));
        })
        .then(function (data) {
            var oResult;

            if (data.success) {
                oResult = controller.handleCreatedSuccess(res, data);
            }
            else {
                oResult = controller.handleSuccess(res, data, 200);
            }
            return oResult;
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.updateXl = function (req, res) {
    controller.readFile(req.files.file.path)
        .then(function (data) {
            return service.updateXl(req.params.projectId, data, req.user, _getSessionId(req));
        })
        .then(function (data) {
            var oResult;

            if (data.success) {
                oResult = controller.handleCreatedSuccess(res, data);
            }
            else {
                oResult = controller.handleSuccess(res, data, 200);
            }

            return oResult;
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.exportXl = function (req, res) {

    var tableQueryString = req.query.table,
        useTable = tableQueryString ? tableQueryString.toLowerCase() === 'true' : false,
        binaryData;

    service.exportXl(req.params.projectId, useTable)
        .then(function (data) {
            binaryData = data.binaryData;
            return controller.getFileName(req.params.projectId, req.user, _getSessionId(req));
        })
        .then(function (projectName) {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader('Content-Disposition', 'attachment; filename=' + projectName + '.xlsx');
            res.end(binaryData, 'binary');
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

/**********************************************************************************************************************
 Catalog
 **********************************************************************************************************************/
controller.addEntityFromCatalog = function (req, res) {
    logger.debug('addEntityFromCatalog - params:' + JSON.stringify(req.params) + ' - query: ' + JSON.stringify(req.query));

    var navQueryString = req.query.nav;
    var withNavigation = navQueryString ? navQueryString.toLowerCase() === 'true' : false;
    var addPromise = withNavigation ?
        service.addEntityFromCatalogWithNavigation(req.params.projectId, req.params.catalogId, req.params.catalogEntityId, req.user, _getSessionId(req)) :
        service.addEntityFromCatalog(req.params.projectId, req.params.catalogId, req.params.catalogEntityId, req.user, _getSessionId(req));

    addPromise
        .then(function (data) {
            return controller.handleSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.addEntitiesFromCatalog = function (req, res) {
    service.addEntitiesFromCatalog(req.params.projectId, req.params.catalogId, req.user, _getSessionId(req))
        .then(function (data) {
            return controller.handleSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

/**********************************************************************************************************************
 Entity
 *********************************************************************************************************************/

controller.addEntity = function (req, res) {
    service.addEntity(req.params.projectId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            return controller.handleCreatedSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.updateEntity = function (req, res) {
    service.updateEntity(req.params.projectId, req.params.entityId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            controller.handleUpdateSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.removeEntity = function (req, res) {
    service.removeEntity(req.params.projectId, req.params.entityId, req.user, _getSessionId(req))
        .then(function (model) {
            return controller.handleDeletedSuccess(res, model);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.exportXlEntity = function (req, res) {
    var tableQueryString = req.query.table,
        useTable = tableQueryString ? tableQueryString.toLowerCase() === 'true' : false,
        binaryData;

    service.exportXlEntity(req.params.projectId, req.params.entityId, useTable)
        .then(function (data) {
            binaryData = data.binaryData;
            return controller.getFileName(req.params.projectId, req.user, _getSessionId(req));
        })
        .then(function (projectName) {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader('Content-Disposition', 'attachment; filename=' + projectName + '.xlsx');
            res.end(binaryData, 'binary');
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

/**********************************************************************************************************************
 Property
 *********************************************************************************************************************/

controller.addProperty = function (req, res) {
    service.addProperty(req.params.projectId, req.params.entityId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            return controller.handleCreatedSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.updateProperty = function (req, res) {
    service.updateProperty(req.params.projectId, req.params.entityId, req.params.propertyId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            controller.handleUpdateSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.removeProperty = function (req, res) {
    service.removeProperty(req.params.projectId, req.params.entityId, req.params.propertyId, req.user, _getSessionId(req))
        .then(function () {
            return controller.handleDeletedSuccess(res);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

/**********************************************************************************************************************
 Navigation Property
 *********************************************************************************************************************/

controller.addNavigationProperty = function (req, res) {
    service.addNavigationProperty(req.params.projectId, req.params.entityId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            return controller.handleCreatedSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.updateNavigationProperty = function (req, res) {
    service.updateNavigationProperty(req.params.projectId, req.params.entityId, req.params.navPropId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            controller.handleUpdateSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};


controller.removeNavigationProperty = function (req, res) {
    service.removeNavigationProperty(req.params.projectId, req.params.entityId, req.params.navigationPropertyId, req.user, _getSessionId(req))
        .then(function () {
            return controller.handleDeletedSuccess(res);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

/**********************************************************************************************************************
 Sample data
 *********************************************************************************************************************/

controller.addSampleData = function (req, res) {
    service.addSampleData(req.params.projectId, req.params.entityName, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            return controller.handleCreatedSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.getSampleData = function (req, res) {
    service.getSampleData(req.params.projectId, req.params.entityName)
        .then(function (data) {
            return controller.handleSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.getServiceDescription = function (req, res) {
    service.getServiceDescription(req.params.projectId)
        .then(function (data) {
            return controller.handleXmlSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.getMetadata = function (req, res) {
    service.getMetadata(req.params.projectId)
        .then(function (data) {
            return controller.handleXmlSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.getEntityData = function (req, res) {
    var entityName = req.params.entityName;

    if (entityName.lastIndexOf('.json') + '.json'.length === entityName.length) {
        entityName = entityName.replace('.json', '');
    }

    service.getEntityData(req.params.projectId, entityName)
        .then(function (data) {
            return controller.handleSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.getTypes = function (req, res) {
    service.getTypes(req.params.projectId)
        .then(function (result) {
            return controller.handleSuccess(res, result);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });

};

/**********************************************************************************************************************
 Group
 *********************************************************************************************************************/
controller.getStandardGroups = function (req, res) {
    service.getStandardGroups(req.params.projectId)
        .then(function (data) {
            return controller.handleSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.addGroup = function (req, res) {
    service.addGroup(req.params.projectId, req.params.entityId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            return controller.handleCreatedSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.updateGroup = function (req, res) {
    service.updateGroup(req.params.projectId, req.params.entityId, req.params.groupId, req.body, req.user, _getSessionId(req))
        .then(function (data) {
            controller.handleUpdateSuccess(res, data);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.removeGroup = function (req, res) {
    service.removeGroup(req.params.projectId, req.params.entityId, req.params.groupId, req.user, _getSessionId(req))
        .then(function () {
            return controller.handleDeletedSuccess(res);
        })
        .catch(function (err) {
            controller.handleError(res, err);
        });
};

controller.handleError = function (res, err) {
    logger.error(err);
    if (err.stack) {
        logger.error(err.stack);
    }

    if (err instanceof NormanError) {
        var json = err.toJSON(), code = json.error.code, oResult;

        if (!http.STATUS_CODES.hasOwnProperty(code.toString())) {
            code = 500;
        }

        oResult = res.status(code).send(json.error);
    }
    else {
        oResult = res.status(500).send(err);
    }
    return oResult;
};

controller.handleCreatedSuccess = function (res, jsonBody) {
    controller.handleSuccess(res, jsonBody, 201);
};

controller.handleUpdateSuccess = function (res, jsonBody) {
    controller.handleSuccess(res, jsonBody, 200);
};

controller.handleDeletedSuccess = function (res, jsonBody) {
    controller.handleSuccess(res, jsonBody, 200);
};

controller.handleSuccess = function (res, jsonBody, status) {
    if (jsonBody) {
        res.status(status || 200).json(jsonBody);
    }
    else {
        res.sendStatus(204);
    }
};

controller.handleXmlSuccess = function (res, data, status) {
    if (data) {
        res.writeHead(status || 200, {'Content-Type': 'application/xml'});
        res.write(data);
        res.end();
    }
    else {
        res.sendStatus(status || 204);
    }
};

controller.readFile = function (path) {
    return Q.nfcall(fs.readFile, path, {encoding: 'binary'});
};

var projectService;
controller.getFileName = function (projectId, user) {
    var deferred = Q.defer();
    if (!projectService) {
        projectService = registry.getModule('ProjectService');
    }

    if (projectService) {
        projectService.getProject(projectId, user._id, null, null, true).then(function (d) {
            // remove forbidden characters from the project name to be used as filename
            if (d.name) {
                d.name = d.name.replace(FORBIDDEN_CHAR_IN_FILENAME, '');
            }
            deferred.resolve(d.name || 'Export');
        }).catch(deferred.reject);
    }
    else {
        deferred.resolve('Export');
    }
    return deferred.promise;
};
