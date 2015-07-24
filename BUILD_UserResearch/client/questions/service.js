'use strict';
/**
 * When calling any of the following methods you need to ensure that updateOrder() is called in list/controller.js to
 * keep the ordinal/subOrdinal ins sync.
 *
 * @param $resource
 * @param $stateParams
 * @returns {*}
 */

var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($resource, $stateParams) {
    return $resource('/api/projects/:projectId/studies/:studyId/questions/:id/:action', {
        id: '@_id',
        studyId: function () {
            return $stateParams.studyId;
        },
        projectId: function () {
            return $stateParams.currentProject;
        }
    }, {
        update: {
            method: 'PUT',
            transformRequest: function (data) {
                return JSON.stringify(_.pick(data, ['name', 'allowMultipleAnswers', 'answerIsLimited', 'answerOptions', 'answerLimit', 'text', 'type']));
            }
        },
        updateOrdinals: {
            method: 'PUT'
        },
        delete: {
            method: 'DELETE'
        },
        bulkDelete: {
            method: 'DELETE',
            params: {
                action: 'bulk'
            }
        },
        saveAll: {
            method: 'POST',
            isArray: true
        }
    });
};
