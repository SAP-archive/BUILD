/**
 * Question
 * @module /api/questions
 */
/**
 * Using Rails-like standard naming convention for endpoints.
 * </pre>
 * GET     /questions              ->  index
 * POST    /questions              ->  create
 * PUT     /questions              ->  updateOrder
 *
 * GET     /questions/:id          ->  show
 * PUT     /questions/:id          ->  update
 * DELETE  /questions/:id          ->  destroy
 * DELETE  /questions/:id          ->  bulkDestroy
 *
 * GET     /tasks                  ->  getTasks
 * POST    /tasks                  ->  createTask
 * GET     /tasks/:id              ->  getTaskById
 * PUT     /tasks/:id              ->  updateTask
 * DELETE  /tasks/:id              ->  deleteTask
 * </pre>
 */

'use strict';

var tp = require('norman-server-tp');
var _ = tp.lodash;
var Study = require('../study/model').getModel();
var model = require('./model');
var Question = model.getModel();
var sendError = require('../../utils').sendError;
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('question-ctrl');
var QuestionApi = require('./serviceApi');
var prototypeService = require('../prototype/service');
var utils = require('../../utils');
var validator = require('../../config/paramsValidate.json');

/**
 * Create (a) new question(s) in the DB - setting the position of the insert based on the ordinal value passed in
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.create = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> create()');

    if (!(req.body instanceof Array)) {
        req.body = [req.body];
    }

    // abstracted to serviceApi File for reuse
    QuestionApi
        .createQuestions(req.params.studyId, req.body)
        .then(function (questions) {
            if (!questions) {
                serviceLogger.info('<< create(), no questions found');
                return sendError(res, 404);
            }

            serviceLogger.info('<< create(), returning questions');
            return res.status(201).json(questions);
        })
        .catch(function (err) {
            serviceLogger.warn('<< create(), returning err, ' + err);
            return sendError(res, err);
        });
};

/**
 * Updates an existing question in the DB
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

    var updatedQuestion = {};
    if (req.body.text !== undefined && req.body.text !== null) {
        updatedQuestion['questions.$.text'] = req.body.text;
    }
    if (req.body.type) {
        updatedQuestion['questions.$.type'] = req.body.type;
    }
    if (req.body.answerOptions) {
        updatedQuestion['questions.$.answerOptions'] = req.body.answerOptions;
    }
    if (typeof req.body.answerIsLimited !== 'undefined') {
        updatedQuestion['questions.$.answerIsLimited'] = req.body.answerIsLimited;
    }
    if (req.body.answerLimit) {
        updatedQuestion['questions.$.answerLimit'] = req.body.answerLimit;
    }
    if (typeof req.body.allowMultipleAnswers !== 'undefined') {
        updatedQuestion['questions.$.allowMultipleAnswers'] = req.body.allowMultipleAnswers;
    }

    Study
        .findOneAndUpdate({
            _id: req.params.studyId,
            status: 'draft',
            questions: {
                $elemMatch: {
                    _id: req.params.id
                }
            }
        }, {
            $set: updatedQuestion
        })
        .lean()
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('update(), error updating question, ' + err);
                return sendError(res, err);
            }
            if (!study) return sendError(res, 404);
            return res.status(204).json();
        });
};

/**
 * Updates Order of Questions
 * both the ordinal and subOrdinal
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.updateOrder = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> updateOrder()');

    var updatedQuestions = req.body.questions;

    Study
        .findById(req.params.studyId, function (err, study) {
            if (err) {
                serviceLogger.warn('updateOrder(), error finding study, ' + err);
                return sendError(res, err);
            }

            var studyQuestions = study.questions;
            if (studyQuestions.length !== updatedQuestions.length) {
                serviceLogger.info('<< updateOrder(), list sizes dont match');
                return res.status(400).json({
                    error: 'List sizes are inconsistent'
                });
            }

            // loop through both arrays to update the ordinals to match new ordinals
            for (var old_i = 0, old_len = studyQuestions.length; old_i < old_len; old_i++) {
                for (var updated_i = 0, updated_len = updatedQuestions.length; updated_i < updated_len; updated_i++) {
                    if (studyQuestions[old_i]._id.toString() === updatedQuestions[updated_i]._id.toString()) {
                        if (!isNaN(updatedQuestions[updated_i].ordinal)) {
                            studyQuestions[old_i].ordinal = updatedQuestions[updated_i].ordinal;
                        }
                        if (!isNaN(updatedQuestions[updated_i].subOrdinal)) {
                            studyQuestions[old_i].subOrdinal = updatedQuestions[updated_i].subOrdinal;
                        }
                    }
                }
            }
            study.questions = studyQuestions;

            study.save(function (saveErr) {
                if (saveErr) {
                    serviceLogger.warn('<< updateOrder(), error updating question, ' + saveErr);
                    return sendError(res, saveErr);

                }
                serviceLogger.info('<< updateOrder(), order updated');
                return res.status(200).json();
            });
        });
};

/**
 * Deletes a question from the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.destroy = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> destroy()');

    Study
        .findOneAndUpdate({
            _id: req.params.studyId,
            status: 'draft'
        }, {
            $pull: {
                questions: {
                    _id: req.params.id
                }
            }
        })
        .lean()
        .exec(function (err, study) {
            if (err) serviceLogger.warn('destroy(), error deleting question, ' + err);
            if (!study) return sendError(res, 404);
            return res.status(204).json();
        });
};

/**
 * Deletes a question from the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.bulkDestroy = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> bulkDestroy()');

    Study
        .findOne({
            _id: req.params.studyId,
            status: 'draft'
        })
        .select('questions')
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< bulkDestroy(), error deleting question, ' + err);
                return sendError(res, err);
            }
            if (!study) {
                serviceLogger.warn('<< bulkDestroy(), no study found');
                return sendError(res, 404);
            }

            // Step 1. Find the ordinal for the question ID
            var ordinal = _.result(_.find(study.questions, function (question) {
                return question._id.toString() === req.params.id;
            }), 'ordinal');

            var updateList = [];
            // Step 2. Remove the questions with this ordinal
            _.each(study.questions, function (questionItem) {
                if (questionItem.ordinal !== parseInt(ordinal, 10)) {
                    updateList.push(questionItem);
                }
            });

            study.questions = updateList;

            // Step 3. Update study

            study.save(function (saveErr) {
                if (saveErr) {
                    serviceLogger.warn('<< bulkDestroy(), error removing question, ' + saveErr);
                    return sendError(res, saveErr);
                }

                serviceLogger.info('<< bulkDestroy(), returning 204');
                return res.status(204).json();
            });
        });
};

/**
 * Get a list of Tasks for a Study in the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.getTasks = function (req, res) {
    serviceLogger.info({
        query: req.query,
        user: req.user._id
    }, '>> getTask()');

    Study
        .find({
            _id: req.params.studyId,
            status: 'draft'
        }, {
            questions: {
                $elemMatch: {
                    type: 'Task'
                }
            }
        })
        .lean()
        .exec(function (err, study) {
            if (err) return sendError(res, err);
            if (!study) return sendError(res, 404);
            return res.status(200).json(study[0].questions);
        });
};


/**
 * Create a Task by Id in the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.getTaskById = function (req, res) {
    var task = {};
    task.url = req.body.url;
    task.type = 'Task';
    task.text = req.body.text;
    task.name = req.body.name;
    if (req.body.targetURL) task.targetURL = req.body.targetURL;

    serviceLogger.info({
        task: task,
        query: req.query,
        user: req.user._id
    }, '>> getTask()');

    Study
        .find({
            _id: req.params.studyId,
            status: 'draft'
        }, {
            questions: {
                $elemMatch: {
                    type: 'Task',
                    _id: req.params.taskId
                }
            }
        })
        .lean()
        .exec(function (err, study) {
            if (err) return sendError(res, err);
            if (!study || !study[0] || !study[0].questions || !study[0].questions[0]) return sendError(res, 404);
            return res.status(200).json(study[0].questions[0]);
        });
};


/**
 * Create a new Task in the DB
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.createTask = function (req, res) {
    serviceLogger.info({
        query: req.query,
        user: req.user._id
    }, '>> createTask()');

    if (!req.body.snapshotVersion || !req.body.name) {
        serviceLogger.info({
            error: 'Cannot create Task with out a name or a snapshotVersion',
            query: req.query,
            user: req.user._id
        }, '<< createTask()');
        return res.status(400).json({
            error: 'Cannot create Task with out a name or a snapshotVersion'
        });
    }

    var task = {
        url: req.body.url,
        type: 'Task',
        text: req.body.text,
        name: req.body.name || 'Task 1',
        interactive: true,
        snapshotVersion: req.body.snapshotVersion,
        snapshotUILang: req.body.snapshotUILang,
        snapshotId: req.body.snapshotId,
        ordinal: req.body.ordinal,
        subOrdinal: req.body.subOrdinal
    };
    if (req.body.thumbnail) task.thumbnail = req.body.thumbnail;
    if (req.body.targetURL) task.targetURL = req.body.targetURL;
    if (typeof req.body.isTargetable !== 'undefined') task.isTargetable = req.body.isTargetable;
    if (task.url && task.url.indexOf('smarterTemplate') !== -1) task.snapshotUILang = 'UI5';

    //  validate module
    var newTask = new Question(task);
    newTask.validate(function (err) {
        if (err) {
            serviceLogger.warn('<< createTask() returning validation error', err);
            return sendError(res, 400, err);
        }
    });

    Study
        .findOneAndUpdate({
            _id: req.params.studyId,
            status: 'draft'
        }, {
            $push: {
                questions: newTask
            }
        })
        .lean()
        .exec(function (err, study) {
            if (err) return sendError(res, err);
            if (!study) return sendError(res, 404);
            serviceLogger.info('<< createTask(), returning 201, task created');
            return res.status(201).json(study.questions.pop());
        });
};

/**
 * Updates an existing Task in the DB
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.updateTask = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> updateTask()');

    var updatedTask = {};
    if (typeof req.body.text !== 'undefined') updatedTask['questions.$.text'] = req.body.text;
    if (typeof req.body.url !== 'undefined') updatedTask['questions.$.url'] = req.body.url;
    if (typeof req.body.name !== 'undefined') updatedTask['questions.$.name'] = req.body.name;
    if (typeof req.body.targetURL !== 'undefined') updatedTask['questions.$.targetURL'] = req.body.targetURL;
    if (typeof req.body.thumbnail !== 'undefined') updatedTask['questions.$.thumbnail'] = req.body.thumbnail;

    Study
        .findOneAndUpdate({
            _id: req.params.studyId,
            status: 'draft',
            questions: {
                $elemMatch: {
                    type: 'Task',
                    _id: req.params.taskId
                }
            }
        }, {
            $set: updatedTask
        })
        .lean()
        .exec(function (updateErr) {
            if (updateErr) {
                serviceLogger.warn('<< update(), error updating task, ' + updateErr);
                return sendError(res, updateErr);
            }
            // Extra call to get updated document as findOneAndUpdate does not return the updated document
            // _id for new Task is incorrect in the returned study
            Study
                .findById(req.params.studyId, 'questions')
                .lean()
                .exec(function (err, questions) {
                    if (err) {
                        serviceLogger.warn('<< update(), get updated study err, ' + err);
                        return sendError(res, err);
                    }
                    if (!questions) return sendError(res, 404);
                    serviceLogger.info('<< updateTask(), returning 204, task updated');
                    // filters our any questions or tasks that are not the updated task
                    var updateTask = _.filter(questions, function (question) {
                        return question._id === req.params.taskId;
                    });
                    return res.status(204).json(updateTask[0]);
                });
        });
};

/**
 * Deletes Task of supplied task ID in the DB
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.deleteTask = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> updateTask()');

    Study
        .findOneAndUpdate({
            _id: req.params.studyId,
            status: 'draft'
        }, {
            $pull: {
                questions: {
                    type: 'Task',
                    _id: req.params.taskId
                }
            }
        })
        .lean()
        .exec(function (err, study) {
            if (err) return sendError(res, err);
            if (!study) return sendError(res, 404);
            serviceLogger.info('<< deleteTask(), returning 200, task deleted');
            return res.status(200).json();
        });
};


/**
 * Handle upload of thumbnail for html prototypes uploaded. Handled by the prototype service.
 * @param req the request
 * @param res the response
 */
exports.uploadThumbnail = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> uploadThumbnail()');

    utils.validateParams(validator.prototype.addThumbnail)(req, res, function () {
        prototypeService.addThumbnail(req, res);
    });
};


/**
 * Handler for uploading zips and images to create questions.  Zips are handled by the prototype service where they are
 * uploaded and processed.  Images are redirected to projects service
 *
 * @param req the request
 * @param res the response
 */
exports.uploadFiles = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> uploadFiles()');

    // sometimes files are sent in an array (eg: image + thumbnail) and sometimes as an object, handle that appropriately
    if (req.files && req.files.file) {

        if (Array.isArray(req.files.file)) {
            _.each(req.files.file, function (file) {
                handleUploadForFile(req, res, file);
            });
        }
        else {
            handleUploadForFile(req, res, req.files.file);
        }
    }
    // no files
    else {
        serviceLogger.error('<< uploadFiles(), no files received in request', req.files.file.extension);
        return res.status(422).json({
            error: 'no files received in request'
        });
    }
};

function handleUploadForFile(req, res, file) {

    // set-up accepted file types extensions
    var fileTypes = {
        zip: 'zip',
        jpg: 'image',
        gif: 'image',
        png: 'image',
        tiff: 'image',
        tif: 'image',
        bmp: 'image',
        psp: 'image',
        eps: 'image',
        raw: 'image'
    };

    // determine the file type being uploaded - send zips to /html prototypes,
    if (fileTypes[file.extension.toLowerCase()] === 'zip') {
        serviceLogger.info('>> uploadFiles(), zip file detected.');
        utils.validateParams(validator.prototype.uploadZip)(req, res, function () {
            prototypeService.uploadZip(req, res);
        });
    }
    // images go to /document
    else if (fileTypes[file.extension.toLowerCase()] === 'image') {
        // res.redirect(307, req.baseUrl + '/document/?linkImage=true');
        handleImages(req, res);
    }
    // handle file type not supported
    else {
        serviceLogger.error('<< uploadFiles(), file extension not accepted', file.extension);
        var errorMsg = 'File extension "' + file.extension + '" is not accepted.';
        return res.status(422).json({
            error: errorMsg
        });
    }
}

/**
 * handles the saving of images to assets
 */
function handleImages(req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> handleImages()');

    // required services
    var registry = commonServer.registry;
    var projectService = registry.getModule('ProjectService');
    var assetService = registry.getModule('AssetService');
    var commonProjectService = registry.getModule('ProjectCommonService');
    var historyService = registry.getModule('HistoryService');

    if (Object.keys(req.files).length === 0) {
        serviceLogger.error('<< handleImages(), no files found, returning error');
        return commonProjectService.sendResponse(res, 400, {error: 'No files attached'});
    }

    var projectId = req.urlParams.projectId;
    var userId = req.user._id;

    projectService.getProject(projectId, userId, {}, {}, true)
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< handleImages(), nothing found');
                return commonProjectService.sendResponse(res, 404, {});
            }

            // Delegate request to a handler that will return the details of the documents saved
            assetService.handleFileUpload(projectId, userId, {}, [].concat(req.files.file), (req.query.linkImage === 'true'))
                .then(function (assets) {

                    assets.forEach(function (asset) {
                        historyService.logHistory({
                            project_id: projectId,
                            user: asset.metadata.created_by,
                            description: 'New Document Uploaded',
                            resource_id: asset._id,
                            resource_name: asset.filename,
                            resource_type: asset.metadata.contentType,
                            thumbnail_url: '/api/projects/' + projectId + '/document/' + asset._id + '/render'
                        });
                    });

                    serviceLogger.info('<< handleImages(), returning new assets');
                    return commonProjectService.sendResponse(res, 201, assets);
                }).catch(function (err) {
                    serviceLogger.info('<< handleImages(), returning error');
                    return commonProjectService.sendError(res, err);
                });
        })
        .catch(function (err) {
            serviceLogger.info('<< handleImages(), returning error');
            return commonProjectService.sendError(res, err);
        })
        .finally(function () {
            serviceLogger.info('<< handleImages(), completed upload for project');
        });
}

exports.checkSchema = function (done) {
    model.createIndexes(done);
};
