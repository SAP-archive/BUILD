'use strict';
var _ = require('norman-client-tp').lodash;
// @ngInject
module.exports = function (uiError) {
    return {
        /**
         * Validates that a supplied question is valid for use in a study.
          * @param ques the question to be validated.
         * @returns {boolean} true if the question is validate for use, false otherwise.
         */
        isValid: function (ques) {
            if (!ques) {
                return true;
            }
            if (ques.type === 'MultipleChoice') {
                if (ques.answerOptions[0] === '' || ques.answerOptions[1] === '') {
                    uiError.create({
                        content: 'Multiple choice questions must be given at least two answers',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                    return false;
                }
                else if (ques.text === '') {
                    uiError.create({
                        content: 'You must input question text for a multi-choice question',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                    return false;
                }
                else if (_.indexOf(ques.answerOptions, '') > -1) {
                    uiError.create({
                        content: 'Multiple choice answers must not be blank.',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                    return false;
                }
                else if ((_.uniq(ques.answerOptions)).length < ques.answerOptions.length) {
                    uiError.create({
                        content: 'Multiple choice answers must be unique.',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                    return false;
                }
                return true;
            }
            else if (ques.type === 'Freeform') {
                if (ques.text === '') {
                    uiError.create({
                        content: 'You must input question text for a free text question',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                    return false;
                }
                return true;
            }
            return true;
        }
    };
};
