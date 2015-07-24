/**
 * Annotation
 * @module /api/annotations
 */
 /**
 * Using Rails-like standard naming convention for endpoints.
 * <pre>
 * GET     /annotations              ->  index
 * POST    /annotations              ->  create
 * GET     /annotations/:id          ->  show
 * PUT     /annotations/:id          ->  update
 * DELETE  /annotations/:id          ->  destroy
 * </pre>
 */

'use strict';

var Study = require('../study/model').getModel();
var utils = require('../../utils');
var validate = require('./validate');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('annotation-ctrl');
var model = require('./model');
var Annotation = model.getModel();

/**
 * Create a new annotation in the DB
 * dev-note: need to enforce sentiment validation on ctrl as .save/.create is not called when creating an annotation
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.create = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> create()');

    req.body.createBy = req.user._id;
    var annotation = new Annotation(req.body);
    //  validate module
    annotation.validate(function (err1) {
        if (err1) {
            serviceLogger.warn('<< create() returning validation error', err1);
            return utils.sendError(res, 400, err1);
        }
    });

    if (!validate.isValid(req, res, serviceLogger)) {
        return;
    }

    Study.findOne({
        _id: req.params.studyId,
        status: 'published',
        deleted: false
    })
    .lean()
    .exec(function (err, study) {
        if (err) {
            serviceLogger.warn('<< create(), return err, ' + err);
            return utils.sendError(res, err);
        }

        if (!study) {
            serviceLogger.info('<< create(), cannot add annotations to a published study');
            return utils.sendError(res, 404);
        }

        var question = study.questions.filter(function (q) {
            return q._id.equals(req.body.questionId);
        });

        if (question.length === 0) {
            serviceLogger.info('<< create(), question not found');
            return utils.sendError(res, 404);
        }

        question = question[0];
        if (question.answerLimit) {
            var annotations = study.annotations.filter(function (a) {
            return a.questionId.equals(req.body.questionId) &&
                   a.createBy.equals(req.user._id);
            });
            if (annotations.length >= question.answerLimit) {
                serviceLogger.info('<< create(), annotations number exeded limit');
                return utils.sendError(res, 404);
            }
        }

        Study.findOneAndUpdate({
            _id: req.params.studyId,
            status: 'published',
            deleted: false
        },
        { $push: {annotations: annotation} })
        .lean()
        .exec(function (err1, study1) {
            if (err1) {
                serviceLogger.error('<< create(), return err, ' + err1);
                return utils.sendError(res, err1);
            }
            if (!study1) {
                serviceLogger.info('<< create(), cannot add annotations to a published study');
                return utils.sendError(res, 404);
            }
            serviceLogger.info('<< create(), return annotation');
            return res.status(201).json(study1.annotations.pop());
        });
    });
};

/**
 * Updates an existing annotation in the DB
 * dev-note: need to enforce sentiment validation on ctrl as .save/.create is not called when creating an annotation
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.update = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> update()');

    if (!validate.isValid(req, res, serviceLogger)) {
        return;
    }

    var updateFields = {
        'annotations.$.comment': req.body.comment || '',
        'annotations.$.absoluteX': req.body.absoluteX,
        'annotations.$.absoluteY': req.body.absoluteY
    };

    // If sentiment is set, then validate it
    if (req.body.sentiment !== undefined && req.body.sentiment !== null) {
        updateFields['annotations.$.sentiment'] = req.body.sentiment;
    }

    Study.findOneAndUpdate({
            _id: req.params.studyId,
            status: 'published',
            deleted: false,
            annotations: {
                $elemMatch: {
                    _id: req.params.id,
                    questionId: req.body.questionId,
                    createBy: req.user._id
                }
            }
        },
        {
            $set: updateFields
        }).lean().exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< update(), return err, ' + err);
                return utils.sendError(res, err);
            }
            if (!study) {
                serviceLogger.info('<< update(), return 404');
                return utils.sendError(res, 404);
            }
            serviceLogger.info('<< update(), return annotation');
            return res.status(204).json();
        });
};

/**
 * Deletes a annotation from the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.destroy = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> destroy()');

    Study.findOneAndUpdate({_id: req.params.studyId, deleted: false, status: 'published'}, {
        $pull: {
            annotations: {_id: req.params.id, createBy: req.user._id}
        }
    }).lean().exec(function (err, study) {

        if (err) {
            return utils.sendError(res, err);
        }

        if (!study) {
            return utils.sendError(res, 404);
        }

        return res.status(204).json();
    });
};

exports.checkSchema = function (done) {
    model.createIndexes(done);
};
