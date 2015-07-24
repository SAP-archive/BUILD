'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The answered questions and tasks must be found by checking 'question's, 'annotation's and 'answer's
 */
// @ngInject
module.exports = function getProgress(currentStudy) {
    var answered = []; // List the questions that have been answered with annotations
    var taskStatus = {
        'completed correctly': 1,
        'completed incorrectly': 1,
        aborted: 1
    };


    for (var annotationIdx in currentStudy.annotations) {
        answered.push(currentStudy.annotations[annotationIdx].questionId);
    }

    for (var answerIdx in currentStudy.answers) {
        var answer = currentStudy.answers[answerIdx];
        if (answer.questionType === 'Task') {
            if (answer.status in taskStatus) answered.push(answer.questionId);
        }
        else answered.push(answer.questionId);
    }

    answered = _.uniq(answered);

    return {
        progress: (100 / currentStudy.questions.length) * answered.length,
        answered: answered
    };
};
