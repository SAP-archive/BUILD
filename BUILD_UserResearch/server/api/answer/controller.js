'use strict';

/**
 * Answer
 * @module /api/participant/:studyId/answers
 */

/**
 * <pre>
 * GET     /answers              ->  index
 * GET     /answers/:id          ->  show
 * PUT     /answers              ->  create/update
 * DELETE  /answers              ->  delete
 * </pre>
 */

var tp = require('norman-server-tp');
var _ = tp.lodash;
var Study = require('../study/model').getModel();
var utils = require('../../utils');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('research-answer-ctrl');
var model = require('./model');
var Answer = model.getModel();

/**
 * Create a new answer in the DB, if one already exists then update it. ACL validates if user has access to the study
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.create = function (req, res) {
    serviceLogger.info({
        params: req.params,
        questionId: req.body.questionId,
        user: req.user._id
    }, '>> create()');

    // If sentiment is set, then validate it
    if (req.body.sentiment !== undefined && req.body.sentiment !== null) {
        if (!utils.isSentimentValid(req.body.sentiment)) {
            serviceLogger.info('<< create(), sentiment is not valid');
            return utils.sendError(res, 400, new Error('Sentiment is not set correctly, ensure range is correct'));
        }
    }

    var studyId = req.params.studyId;
    var userId = req.user._id;
    var questionId = req.body.questionId;

    if (!utils.isMongoId(questionId)) {
        serviceLogger.warn('<< create(), question ID is not valid');
        return utils.sendError(res, 400, new Error('Question ID is not set correctly'));
    }

    // Filter by the user answers, this will ensure that two users cant update the same answer
    var filterParams = {
        answers: {$elemMatch: {'stats.created_by': userId}}
    };

    // Find an active study and filter answers by the logged in user
    // Dev-note: only return answers, don't need any other fields
    Study.findOne({_id: studyId, status: 'published', deleted: false, 'questions._id': questionId}, filterParams)
        .select('answers')
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< create(), error creating answer, ' + err);
                return utils.sendError(res, err);
            }

            if (!study) {
                serviceLogger.warn('<< create(), no study found');
                return utils.sendError(res, 404, new Error('Study was not found'));
            }

            // Filter by question ID and user ID
            var index = _.findIndex(study.answers.toObject(), function (answer) {
                return answer.questionId.toString() === questionId && answer.stats.created_by.equals(userId);
            });

            // If an answer exists, then update it otherwise create it
            if (index !== -1) {
                serviceLogger.info('create(), answer already exists, updating');
                study.answers[index].answer = req.body.answer || '';
                study.answers[index].sentiment = req.body.sentiment;
                study.answers[index].stats.updated_by = userId;
                study.answers[index].stats.updated_at = new Date();
                if (req.body.status !== undefined) {
                    study.answers[index].status = req.body.status;
                }
            }
            else {
                serviceLogger.info('create(), no answer exists, creating new one');
                var newAnswer = new Answer(req.body);// _.merge({}, req.body);
                newAnswer.stats = {};
                newAnswer.stats.created_by = userId;
                newAnswer.stats.updated_by = userId;
                newAnswer.stats.updated_at = new Date();

                //  validate module
                newAnswer.validate(function (err1) {
                    if (err1) {
                        serviceLogger.warn('<< create() returning validation error', err1);
                        return utils.sendError(res, 400, err1);
                    }
                });

                study.answers.push(newAnswer);
            }

            // Save is required here to ensure validators are invoked during the creation/save process
            study.save(function (er) {
                if (er) {
                    serviceLogger.warn('<< create(), error while saving, er ' + er);
                    return utils.sendError(res, er);
                }
                var returnedAnswer = null;
                // make sure that the correct answer is being returned
                if (index !== -1) {
                    returnedAnswer = study.answers[index];
                }
                else {
                    returnedAnswer = study.answers.pop();
                }

                serviceLogger.info('<< create(), answer created/updated successfully');
                // Decide which status to return i.e. if created 201, if updated 200
                return res.status(index !== -1 ? 200 : 201).json(returnedAnswer);
            });
        });
};

/**
 * Delete an answer with a specific answerId and that is created by the user making the call
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.destroy = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> destroy()');

    Study.findOneAndUpdate({_id: req.params.studyId, status: 'published', deleted: false}, {
        $pull: {
            answers: {_id: req.params.answerId, created_by: req.user._id}
        }
    })
        .lean()
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< destroy(), answer could not be deleted');
                return utils.sendError(res, err);
            }

            if (!study) {
                serviceLogger.warn('<< destroy(), study not found for answer');
                return utils.sendError(res, 404);
            }
            serviceLogger.info('<< destroy(), answer deleted successfully');
            return res.status(204).json();
        });
};

/**
 * Get the list of answers for a study (or the list of answers for a question if the url param has been added)
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.index = function (req, res) {
    serviceLogger.info({
        params: req.params,
        questionId: req.query.questionId,
        user: req.user._id
    }, '>> index()');

    // Only show answers belonging to the user
    var filterParams = {
        answers: {
            $elemMatch: {
                'stats.created_by': req.user._id
            }
        }
    };
    // Default query params
    var queryParams = {_id: req.params.studyId, status: 'published', deleted: false};

    // If user specified a question ID, then use it in the query
    if (req.query && req.query.questionId) {
        if (!utils.isMongoId(req.query.questionId)) {
            serviceLogger.warn('<< index(), question ID is not valid');
            return utils.sendError(res, 400, new Error('Question ID is not set correctly'));
        }
        queryParams['answers.questionId'] = req.query.questionId;
    }

    utils.getStudyAnswers(res, queryParams, filterParams);
};

/**
 * Get an answer with a specific answer id
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.show = function (req, res) {
    serviceLogger.info({
        params: req.params,
        user: req.user._id
    }, '>> show()');

    if (!utils.isMongoId(req.params.answerId)) {
        serviceLogger.warn('<< show(), answer ID is not valid');
        return utils.sendError(res, 400, new Error('Answer ID is not set correctly'));
    }

    var queryParams = {
            _id: req.params.studyId,
            status: 'published',
            deleted: false,
            'answers._id': req.params.answerId
        },
        filterParams = {
            answer: {
                $elemMatch: { 'stats.created_by': req.user._id }
            }
        };

    utils.getStudyAnswers(res, queryParams, filterParams);
};

exports.checkSchema = function (done) {
    model.createIndexes(done);
};
