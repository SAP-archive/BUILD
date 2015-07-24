'use strict';
/**
 * Snapshot
 * @module /api/snapshots
 */
/**
 * Using Rails-like standard naming convention for endpoints.
 * <pre>
 * GET     /snapshots              ->  index
 * POST    /snapshots              ->  create
 * GET     /snapshots/:id          ->  show
 * PUT     /snapshots/:id          ->  update
 * DELETE  /snapshots/:id          ->  destroy
 * </pre>
 */

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var studyPrototypeService = require('./service');
var model = require('./model');
var StudyPrototype = model.getModel();
var serviceLogger = commonServer.logging.createLogger('study-proto-ctrl');
var sendError = require('../../utils').sendError;
var features = commonServer.features;
var utils = require('../../utils');
var updateSnapShotDeepLinks = utils.updateSnapShotDeepLinks;

/**
 * Get the list of prototypes available
 *
 * Firstly retrieve the list of all studyPrototypes created within the project
 * Then check if the snapshot service is available, if it is, get the list of available snapshots for the project
 *
 * Then return the list of studyPrototypes + snapshots as a single list
 *
 * @param   {object}  req           The request object being used for the call
 * @param   {object}  res           The response object used to send feedback and data back to the client
 * @return  {Array}   snapshotsList The array of all studyPrototypes + snapshots within the project
 */
module.exports.index = function (req, res) {
    serviceLogger.info({
        body: req.body
    }, '>> index()');

    var projectId = req.urlParams.projectId;

    StudyPrototype
        .find({
            projectId: projectId,
            deleted: false,
            thumbnailsCreated: true
        })
        .lean()
        .exec(function (err, studyPrototypes) {
            if (err) {
                serviceLogger.info('<< index(), returning err, ' + err);
                return res.status(500).json(err);
            }

            var snapshotsList = [];
            for (var i = 0; i < studyPrototypes.length; i++) {
                var snapshot = studyPrototypes[i].snapshot;
                snapshot.snapshotId = studyPrototypes[i]._id;
                snapshotsList.push(snapshot);
            }

            // If prototype is disable don't fetch any snapshot
            // Just return an empty array
            if (features.isEnabled('disable-prototype')) {
                serviceLogger.info('<< index(), returning study prototype');
                return res.status(200).json(snapshotsList);
            }

            var snapshotService = registry.lookupModule('SnapshotService');
            if (snapshotService !== undefined) {
                snapshotService.getSnapshots(projectId)
                    .then(function (snapShots) {
                        var mergeList = snapshotsList.concat(snapShots);
                        serviceLogger.info('<< index(), returning snapShots');
                        return res.status(200).json(mergeList);
                    })
                    .catch(function (snapshotErr) {
                        serviceLogger.warn('<< index(), returning error, ' + snapshotErr);
                        return res.status(500).json(err);
                    });
            }
            else {
                serviceLogger.info('<< index(), returning study prototype');
                return res.status(200).json(snapshotsList);
            }
        });
};


/**
 * This returns the snapshot object containing the list of pages as needed by the UI.
 *
 * This checks firstly based on the UI language in order to determine which service needs to be called.
 *
 * 1. If the language is 'html', then this is an uploaded prototype, therefore we need to use the studyPrototypeService
 * 2. If the language is something else, this will have been created by the UIComposer, as a result we need to use the SnapshotService
 *
 * @param   {object}  req                     The request object being used for the call
 * @param   {object}  res                     The response object used to send feedback and data back to the client
 * @return  {object}  studyPrototype.snapshot The snapshot object being returned which provides easy access to the prototype's pages
 */
module.exports.getPrototypePages = function (req, res) {
    serviceLogger.info({
        body: req.body,
        query: req.query,
        params: req.params
    }, '>> getPrototypePages()');

    var snapshotId = req.query.snapshotId;
    var snapshotLang = req.query.uiLang;
    var projectId = req.urlParams.projectId;
    var snapshotVersion = req.query.version;

    // 1. If the uiLang is 'html', then request from studyPrototypes
    if (snapshotLang === 'html') {
        studyPrototypeService.getStudyPrototype(snapshotId)
            .then(function (studyPrototype) {
                if (!studyPrototype) {
                    serviceLogger.info('<< getPrototypePages(), studyPrototype not found');
                    return res.status(404).json();
                }
                serviceLogger.info('<< getPrototypePages(), returning studyPrototype');
                return res.status(200).json([studyPrototype.snapshot]);
            })
            .catch(function (err) {
                serviceLogger.info('<< getPrototypePages(), return error ' + err);
                return res.status(500).json(err);
            });
    }
    else {
        // 2. If The UI language is anything else, then request the snapshot from the SnapshotService in sw
        var snapshotService = registry.lookupModule('SnapshotService');
        if (snapshotService !== undefined) {
            snapshotService.getSnapshot(projectId, snapshotVersion)
                .then(function (studyPrototype) {
                    if (!studyPrototype) {
                        serviceLogger.warn('<< getPrototypePages(), studyPrototype not found');
                        return res.status(404).json();
                    }
                    serviceLogger.info('<< getPrototypePages(), returning snapshots');
                    studyPrototype.deepLinks = updateSnapShotDeepLinks(studyPrototype.deepLinks, snapshotLang);
                    return res.status(200).json([studyPrototype]);
                })
                .catch(function (err) {
                    serviceLogger.info('<< getPrototypePages(), return error ' + err);
                    return res.status(500).json(err);
                });
        }
        else {
            serviceLogger.info('<< getPrototypePages(), returning empty snapshots');
            return res.status(200).json([]);
        }
    }
};

/**
 * Deletes a study prototype from the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.destroy = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> destroy() ');

    StudyPrototype
        .findById(req.params.id, function (err, studyPrototype) {
            if (err) return sendError(res, err);
            if (!studyPrototype) return res.status(404).json();

            studyPrototype.deleted = true;
            studyPrototype.save(function (er) {
                if (er) {
                    return sendError(res, er);
                }
                serviceLogger.info('<< destroy(), returning 204');
                return res.status(204).json();
            });
        });
};

exports.checkSchema = function (done) {
    model.createIndexes(done);
};
