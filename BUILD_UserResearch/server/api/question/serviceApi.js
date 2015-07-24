'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var Study = require('../study/model').getModel();
var Promise = require('norman-promise');
var serviceLogger = commonServer.logging.createLogger('question-service-api');

/**
 * Creates Question(s) for a Study
 *
 * @param studyId
 * @param questions (single of an array)
 * @returns questions (only the created questions)
 */
function createQuestions(studyId, questions) {
    var deferred = Promise.defer();
    serviceLogger.info({
        studyId: studyId,
        questions: questions
    }, '>> createQuestions()');

    if (!studyId || !questions) {
        var error = new NormanError('invalid arguments');
        serviceLogger.warn('<< createQuestions(), returning error', error);
        deferred.reject(error);
    }
    else {

        if (!(questions instanceof Array)) {
            questions = [questions];
        }

        Study
            .findOneAndUpdate({
                _id: studyId,
                status: 'draft'
            }, {
                $push: {
                    questions: {
                        $each: questions,
                        $position: questions[0].ordinal
                    }
                }
            })
            .lean()
            .exec(function (err, study) {
                if (err) {
                    var normanErr = new NormanError(err);
                    serviceLogger.warn('<< createQuestions(), returning error', normanErr);
                    deferred.reject(normanErr);
                }
                else if (!study) {
                    var emptyErr = new NormanError('Could not find study');
                    serviceLogger.info('<< createQuestions(), study not found');
                    deferred.reject(emptyErr);
                }
                else {

                    // these to lines select the last added questions to a study
                    var start = isNaN(questions[0].ordinal) ? (study.questions.length - questions.length) : questions[0].ordinal;
                    var ret = study.questions.slice(start, start + questions.length);
                    // selects a single question id only 1 exits or the array if more then 1
                    var createdQuestions = ret.length > 1 ? ret : ret[0];
                    serviceLogger.info('<< createQuestions(), returning question(s)');
                    deferred.resolve(createdQuestions);
                }
            });
    }
    return deferred.promise;
}

exports.createQuestions = createQuestions;
