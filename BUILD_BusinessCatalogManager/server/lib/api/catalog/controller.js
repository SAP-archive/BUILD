/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Catalogs              ->  index
 * POST    /Catalogs              ->  create
 * GET     /Catalogs/:id          ->  show
 * PUT     /Catalogs/:id          ->  update
 * DELETE  /Catalogs/:id          ->  destroy
 */

'use strict';

var registry = require('norman-common-server').registry;
var service = registry.getModule('BusinessCatalog');


function handleError(res, err) {
    return res.status(500).send(err);
}

function handleNotFoundError(res, err) {
    return res.status(404).send(err);
}

function handleSuccess(res, jsonBody) {
    if (jsonBody) {
        return res.status(200).json(jsonBody);
    }

    return res.status(204).end();
}

// Get list of Catalogs
exports.index = function (req, res) {
    service.getCatalogs().then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (err) {
            handleError(res, err);
        }
    );
};

// Get a single Catalog
exports.show = function (req, res) {
    if (req && req.params && req.params.id) {
        service.getCatalog(req.params.id).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleNotFoundError(res, err);
            }
        );
    }
    else {
        handleError(res, 'invalid argument');
    }
};

// Creates a new Catalog in the DB.
exports.create = function (req, res) {
    if (req && req.body) {
        service.createCatalog(req.body).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
    else {
        handleError(res, 'invalid argument');
    }
};

// Updates an existing Catalog in the DB.
exports.update = function (req, res) {
    if (req && req.params && req.params.id) {
        service.updateCatalog(req.params.id, req.body).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleNotFoundError(res, err);
            }
        );
    }
    else {
        handleError(res, 'invalid argument');
    }
};

// Deletes a Catalog from the DB.
exports.destroy = function (req, res) {
    if (req && req.params && req.params.id) {
        service.removeCatalog(req.params.id).then(
            function () {
                return handleSuccess(res);
            },
            function (err) {
                handleNotFoundError(res, err);
            }
        );
    }
    else {
        handleError(res, 'invalid argument');
    }
};

exports.import = function (req, res) {
    if (req && req.body) {
        service.import(req.body).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleNotFoundError(res, err);
            }
        );
    }
    else {
        handleError(res, 'invalid argument');
    }
};

exports.searchEntities = function (req, res) {
    if (req && req.body) {
        service.searchEntities(req.body).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleNotFoundError(res, err);
            }
        );
    }
    else {
        handleError(res, 'invalid argument');
    }
};

exports.getEntity = function (req, res) {
    try {
        if (req && req.params && req.params.entityId) {
            var entityId = req.params.entityId;
            service.getEntity(entityId).then(
                function (result) {
                    return handleSuccess(res, result);
                },
                function (err) {
                    handleError(res, err);
                }
            );
        }
        else {
            return handleError(res, 'Body is empty');
        }
    }
    catch (err) {
        handleError(res, err);
    }
};
