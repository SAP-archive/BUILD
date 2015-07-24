'use strict';

var validations = {
    status: function (study, newStudy, err) {
        // don't allow updates to name or description for published study
        if (study.status !== 'draft' && ((newStudy.name && study.name !== newStudy.name) || (newStudy.description && study.description !== newStudy.description))) {
            err.push('Unable to update name or description of a published study.');
        }
        /*
         * Ensures that the status can only be updates as follows:
         *  'draft' -> 'published'
         *  'published' -> 'paused'
         *  'paused' -> ('archived' | 'published')
         *  'archived' -> 'published'
         */
        else if (study.status !== newStudy.status) {
            var errMsg = 'Invalid update for study status.';
            switch (study.status) {
            case 'draft':
                return newStudy.status === 'published' ? true : err.push(errMsg);
            case 'published':
                return newStudy.status === 'paused' ? true : err.push(errMsg);
            case 'paused':
                return (newStudy.status === 'archived' || newStudy.status === 'published') ? true : err.push(errMsg);
            case 'archived':
                return newStudy.status === 'published' ? true : err.push(errMsg);
            default:
                err.push(errMsg);
            }
        }
    }
};

/**
 * Runs validations on the study and compare with the new version being passed in
 *
 * @param {object} study The existing version of the study
 * @param {object} newStudy The new version of the study with updates
 */
function isValid(study, newStudy) {
    var err = [];
    for (var validation in validations) {
        validations[validation](study, newStudy, err);
    }
    return err.length === 0 || err;
}


/**
 * Validate length of study name
 */
var studyNameValidator = [
    function (value) {
        return value.length > 0 && value.length <= 45;
    },
    'Study name should be between 1 and 45 characters'
];

/**
 * Validate lenegth of study description
 */
var studyDescriptionValidator = [
    function (value) {
        return value.length <= 300;
    },
    'Study description should have no more than 300 characters'
];

module.exports = {
    validations: validations,
    isValid: isValid,
    studyName: studyNameValidator,
    studyDescription: studyDescriptionValidator
};
