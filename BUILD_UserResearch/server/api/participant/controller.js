/**
 * Participant
 * @module /api/participant
 */
/**
 * Using Rails-like standard naming convention for endpoints.
 * <pre>
 * GET     /participant/:id          ->  show
 * </pre>
 */

'use strict';
var _ = require('norman-server-tp').lodash;
var Study = require('../study/model').getModel();
var utils = require('../../utils');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var assetService = registry.getModule('AssetService');
var cacheService = require('./service.js');
var serviceLogger = commonServer.logging.createLogger('research-participant-ctrl');

/**
 * Get a single study, filter annotations, answers and participants by the user ID.
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.show = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> show() ');

    var userId = req.user._id;

    var participantObj = {_id: userId, isAnonymous: false};

    // Add user to the participant list, but restrict access to other user profiles
    Study.findOne({
        _id: req.params.studyId,
        $and: [{$or: [{status: 'published'}, {status: 'paused'}, {status: 'archived'}]}], deleted: false
    })
        .select('name description createBy projectId createTime questions answers annotations participants deleted status')
        .lean(false)
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< show(), error found, ' + err);
                return utils.sendError(res, err);
            }

            if (!study) {
                serviceLogger.info('<< show(), no study found, returning a 404');
                return res.status(404).json();
            }

            if (study.status === 'paused' || study.status === 'archived') {
                serviceLogger.warn('<< show(), return study with a status of closed');
                return res.status(200).json({studyStatus: 'closed'});
            }

            // First need to add the user to the study!
            // Dev-note: not able to use to FindOneAndUpdate as it overwrites the existing values each time the page is refreshed
            var isFound = _.find(study.participants, function (participant) {
                if (participant._id.toString() === userId.toString()) {
                    participantObj = participant;
                    return true;
                }
            });

            // If user wasn't found, then add them
            if (!isFound) {
                serviceLogger.warn('show(), adding new user');
                study.participants.push(participantObj);
            }

            study.save(function (er) {
                if (er) {
                    serviceLogger.warn('<< show(), error updating study, ' + er);
                    return utils.sendError(res, er);
                }

                // Do some filtering, user should only see their activity
                study.answers = _.filter(study.answers, function (answer) {
                    return answer.stats.created_by.toString() === userId.toString();
                });
                study.annotations = _.filter(study.annotations, function (annotation) {
                    return annotation.createBy.toString() === userId.toString();
                });

                // Only return the details of the logged in participant, they are a participant so is not prevented from viewing other user detail
                study.participants = [participantObj];
                serviceLogger.info('<< show(), return study');
                return res.status(200).json(study);
            });
        });
};

/**
 * This toggles whether the user will be displayed as anonymous or not in the study review
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.toggleAnonymous = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> anonymous() ');

    var userId = req.user._id;

    // Find by study ID and user ID, then toggle isAnonymous flag
    // Dev-note: the filter params does not seem to be working, works in robomongo but same query her does not. Will update at a furthe date
    Study.findOne({
        _id: req.params.studyId,
        'participants._id': userId,
        deleted: false
    })
        .lean(false)
        .select('participants')
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< anonymous(), returning error, ' + err);
                return utils.sendError(res, err);
            }
            if (!study) {
                serviceLogger.info('<< anonymous(), nothing found, returning a 404');
                return res.status(404).json();
            }

            // Do some filtering, user should only see their own activity
            var jsonParticipant = {};
            _.each(study.participants, function (participant) {
                if (participant._id.toString() === userId.toString()) {
                    participant.isAnonymous = !participant.isAnonymous;
                    jsonParticipant = participant;
                }
            });

            study.save(function (er) {
                if (er) {
                    serviceLogger.warn('<< anonymous(), error updating study, ' + er);
                    return utils.sendError(res, er);
                }

                // Only return the details of the logged in participant
                study.participants = [jsonParticipant];

                serviceLogger.info('<< anonymous(), returning participant details');
                return res.status(200).json(study);
            });
        });
};

/**
 * Render an image for a study
 */
exports.render = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> render() ');

    var assetId = req.params.assetId;

    var versionId = (req.params.versionId === undefined || null) ? '' : req.params.versionId;
    var thumbOnly = (req.query.thumbOnly === undefined || null) ? 'false' : req.query.thumbOnly;

    serviceLogger.info('render(), query params[versionId: ' + versionId + ', thumbOnly: ' + thumbOnly + ']');

    Study.findById(req.params.studyId)
        .lean()
        .select('questions')
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< render(), err found, ' + err);
                return utils.sendError(res, err);
            }
            if (!study) {
                serviceLogger.info('<< render(), study not found');
                return res.status(404).json();
            }
            var foundDocument = false;
            var docId = req.params.assetId;
            study.questions.forEach(function (question) {
                if (question.documentId === docId) {
                    foundDocument = true;
                }
            });
            if (!foundDocument) {
                serviceLogger.info('<< render(), document not found in study');
                return res.status(404).json();
            }

            assetService.getAsset(assetId, versionId, (req.query.thumbOnly === 'true'))
                .then(function (asset) {
                    if (!asset) {
                        serviceLogger.info('<< render(), no asset found, returning a 404');
                        return res.status(404).json();
                    }
                    cacheService.cacheImageHandler(req, res, {asset: asset, versionId: versionId});
                }).catch(function (err) {
                    serviceLogger.warn('<< render(), returned error');
                    return utils.sendError(res, err);
                });
        });
};

/**
 * Render content belonging to a prototype i.e JS file, HTML file or CSS file
 */
exports.renderPrototype = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> renderPrototype() ');

    var studyPrototypeId = req.params.studyPrototypeId;
    var pathStr = req.params['0'];

    assetService.getPrototypeAsset(studyPrototypeId, pathStr)
        .then(function (asset) {
            if (!asset) {
                serviceLogger.info('<< renderPrototype(), no asset found, returning a 404');
                return res.status(404).json();
            }
            return cacheService.cacheImageHandler(req, res, {asset: asset, versionId: ''});
        }).catch(function (err) {
            serviceLogger.warn('<< renderPrototype(), returned error, ' + err);
            return utils.sendError(res, err);
        });
};

/**
 * Get list of studies the user is participating in with a status of published and paused
 *
 * The study list will return the following:
 * annotations - count of annotations dropped by user
 * thumbnail - the first thumbnail found in the first question
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.participate = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> participate()');

    var userId = req.user._id;

    Study.find({
        'participants._id': userId,
        deleted: false,
        $and: [{$or: [{status: 'published'}, {status: 'paused'}]}]
    })
        .select('name description createBy projectId createTime questions answers annotations participants deleted status')
        .lean()
        .exec(function (err, studies) {
            if (err) {
                serviceLogger.warn('<< participate(), returning error, ' + err);
                return utils.sendError(res, err);
            }

            serviceLogger.info('<< participate(), returning study list, size ' + studies.length);
            return res.status(200).json(studies.map(function (study) {
                // a study without questions cannot be published, so I don't check if the first question exists or not
                var firstQuestion = study.questions[0];
                if (firstQuestion.interactive) {
                    study.thumbnail = firstQuestion.thumbnail;
                }
                else {
                    study.thumbnail = '/api/participant/' + study._id + '/document/' + firstQuestion.documentId + '/' + firstQuestion.documentVersion + '/render/?thumbOnly=true';
                }
                var annotationCount = 0;
                study.comments = study.annotations.filter(function (annotation) {
                    if (annotation.createBy.toString() === userId.toString()) {
                        annotationCount++;
                        return !_.isEmpty(annotation.comment);
                    }
                    return false;
                }).length;

                var oParticipant = study.participants.filter(function (participant) {
                    if (participant._id.toString() === userId.toString()) {
                        return true;
                    }
                });
                study.participatedAt = oParticipant[0].created_at;
                study.questions = study.questions.length;
                study.annotations = annotationCount;
                study.answers = study.answers.filter(function (answer) {
                    return answer.stats.created_by.toString() === userId.toString();
                }).length;

                // We don't want participants to know who else took the study
                study.participants = undefined;
                return study;
            }));
        });
};
