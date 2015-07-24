'use strict';

/**
 * Created by i311181 on 07 Apr 2015.
 */
var tp = require('norman-server-tp'),
    Study = require('../study/model').getModel(),
    sendError = require('../../utils').sendError,
    commonServer = require('norman-common-server'),
    _ = tp.lodash;
var serviceLogger = commonServer.logging.createLogger('review-ctrl');
var anonymousService = require('../tracking/anonymous.service');
var reviewUtil = require('./util');
var setParticipantOrAnonymousNames = require('../../utils').setParticipantOrAnonymousNames;

/**
 * gets the Statistics Overview for a Study and its
 * Questions & tasks
 *
 * @param req
 * @param res
 */
exports.getStats = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> getStats()');

    var data = {
        overview: {},
        questions: {}
    };

    var details;

    reviewUtil.getStudyAndOverviewStats(req.params.studyId)
        .then(function (stats) {
            if (!stats && !stats.study) {
                serviceLogger.error('<< getStats(), returning Error, Study is empty');
                return sendError(res, reviewUtil.logError('Study is empty'));
            }
            data.overview = stats.stats;
            return reviewUtil.getIndividualQuestionsWithStats(stats.study);
        })
        .then(function (questionsWithStats) {
            data.questions = questionsWithStats;
            return reviewUtil.getStudyDurationBreakdown(req.params.studyId);
        })
        .then(function (durationBreakdown) {
            details = durationBreakdown;
            return reviewUtil.getStudyBreakdown(req.params.studyId);
        })
        .then(function (studyBreakdown) {
            details = _.merge(details, studyBreakdown);
            return anonymousService.anonymousUsers(studyBreakdown.study);
        })
        .then(function (userDetails) {
            _.each(userDetails, function (user) {
                details.breakdown[user._id].name = user.name;
            });
            details.participantsCount = details.study.participants.length;
            delete details.study;
            serviceLogger.info('<< getStats(), returning Status');
            return res.status(200).json(_.merge(details, data));
        })
        .catch(function (err) {
            serviceLogger.error('<< getStats(), returning error', err);
            return sendError(res, reviewUtil.logError(err));
        });
};

/**
 * Gets the Statistics for a question or task including
 * overview and participant Breakdown
 *
 * @param req
 * @param res
 */
exports.getQuestionStats = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> getQuestionStats()');

    Study.findOne({
        _id: req.params.studyId
    }, {}).lean().exec(function (err, study) {
        if (err) {
            return sendError(res, reviewUtil.logError(err));
        }
        if (!study) {
            return sendError(res, 404);
        }

        var question = _.find(study.questions, function (quest) {
            return quest._id.toString() === req.params.questionId.toString();
        });

        var statsJSON = {};
        // Step 1. Get stats per user in the participants list
        reviewUtil.getIndividualQuestionWithStats(question, study.answers, study.annotations, study, true)
            .then(function (stats) {
                // Step 2. Return user details i.e. username or anonymous based on their status
                statsJSON = stats;
                return anonymousService.anonymousUsers(study);
            }).then(function (avatars) {
                // Step 3. Merge the breakdown with the avatar list
                setParticipantOrAnonymousNames(statsJSON.participantBreakdown, avatars, '_id');
                serviceLogger.info('<< getQuestionStats(), returning stats');
                return res.status(200).json({stats: statsJSON});
            })
            .catch(function (er) {
                serviceLogger.error('<< getStudyDurationBreakdown(), returning promise');
                return sendError(res, reviewUtil.logError(er));
            });
    });
};
