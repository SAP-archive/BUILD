'use strict';

var commonServer = require('norman-common-server');
var Promise = require('norman-promise');
var StudyPrototype = require('./model').getModel();
var serviceLogger = commonServer.logging.createLogger('study-proto-service');

/**
 * Create a StudyPrototype object based on the zip file that has been uploaded
 *
 * @param {string} projectId  The projectId against which the studyPrototype is being uploaded
 * @param {object} metadata   The metadata object used as the base for generating the studyPrototype (uiLang, pages etc.)
 * @param {string} created_by The userId of the user performing the zip upload
 * @returns {deferred.promise|*}
 */
module.exports.createStudyPrototype = function (projectId, metadata, created_by) {
    serviceLogger.info({
        projectId: projectId,
        metadata: metadata,
        created_by: created_by
    }, '>> createStudyPrototype()');

    var deferred = Promise.defer();

    var studyPrototype = {};
    studyPrototype._id = commonServer.utils.shardkey();
    studyPrototype.projectId = projectId;
    studyPrototype.appMetadata = metadata;
    studyPrototype.stats = {};
    studyPrototype.stats.created_by = created_by;
    studyPrototype.stats.created_at = new Date();
    studyPrototype.snapshot = {};
    studyPrototype.snapshot.deepLinks = [];

    // creating snapshot deeplinks
    for (var i = 0; i < metadata.model.pages.length; i++) {
        var newDeepLink = {};
        newDeepLink.thumbnail = encodeURI('/api/participant/prototype/' + studyPrototype._id + '/render' + metadata.model.pages[i].thumbnailUrl);
        newDeepLink.pageName = metadata.model.pages[i].displayName;
        newDeepLink.pageUrl = encodeURI('/api/participant/prototype/' + studyPrototype._id + '/render' + metadata.model.pages[i].pageUrl);
        studyPrototype.snapshot.deepLinks.push(newDeepLink);
    }

    StudyPrototype.create(studyPrototype, function (err, studyProto) {
        if (err) {
            serviceLogger.warn('<< createStudyPrototype(), returning error', err);
            deferred.reject(err);
        }
        serviceLogger.info('<< createStudyPrototype(), study prototype created');
        deferred.resolve(studyProto.toObject());
    });
    return deferred.promise;
};

/**
 * Get a single StudyPrototype
 * @param   {string}  studyPrototypeId  The id of the studyPrototype to be retrieved
 */
module.exports.getStudyPrototype = function (studyPrototypeId) {
    serviceLogger.info({
        studyPrototypeId: studyPrototypeId
    }, '>> getStudyPrototype()');

    var deferred = Promise.defer();

    StudyPrototype
        .findById(studyPrototypeId)
        .lean()
        .exec(function (err, studyPrototype) {
            if (err) {
                serviceLogger.warn('<< getStudyPrototype(), returning error ' + err);
                deferred.reject(err);
            }
            if (!studyPrototype) {
                serviceLogger.warn('<< getStudyPrototype(), studyPrototype not found');
                deferred.resolve();
            }
            else {
                serviceLogger.info('<< getStudyPrototype(), returning study prototype');
                deferred.resolve(studyPrototype);
            }
        });
    return deferred.promise;
};

/**
 * Update attributes of a specific StudyPrototype
 *
 * @param {object} studyPrototypeId - ID of the StudyPrototype to be updated
 * @param {object} updates - attributes and values to be updated for the StudyPrototype
 * @returns {deferred.promise|*}
 */
module.exports.updateStudyPrototype = function (studyPrototypeId, updates) {
    serviceLogger.info({
        studyPrototypeId: studyPrototypeId,
        updateFields: updates
    }, '>> updateStudyPrototype() ');

    var deferred = Promise.defer();

    var updateFields = {
        thumbnailsCreated: updates.thumbnailsCreated || false
    };

    StudyPrototype.findOneAndUpdate({
            _id: studyPrototypeId,
            deleted: false
        },
        {
            $set: updateFields
        }).lean().exec(function (err, studyPrototype) {
            if (err) {
                serviceLogger.warn('<< updateStudyPrototype(), return err, ' + err);
                deferred.reject(err);
            }
            if (!studyPrototype) {
                serviceLogger.info('<< updateStudyPrototype(), return 404');
                deferred.resolve();
            }
            serviceLogger.info('<< updateStudyPrototype(), return studyPrototype');
            deferred.resolve(studyPrototype);
        });
    return deferred.promise;
};
