'use strict';

var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($resource, $stateParams) {

    return $resource('/api/projects/:projectId/studies/:studyId/tasks/:id', {
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
                return JSON.stringify(_.pick(data, ['name', 'text', 'targetURL', 'ordinal', 'subOrdinal', 'snapshotVersion', 'snapshotUILang', 'snapshotId', 'url', 'isTargetable']));
            }
        },
        getStudyPrototypes: {
            method: 'GET',
            params: {
                projectId: function () {
                    return $stateParams.currentProject;
                }
            },
            isArray: true,
            url: '/api/projects/:projectId/studyprototypes/'
        },
        getTaskPages: {
            method: 'GET',
            params: {
                projectId: function () {
                    return $stateParams.currentProject;
                }
            },
            isArray: true,
            url: '/api/projects/:projectId/studyprototypes/pages'
        },
        deleteStudyPrototype: {
            method: 'DELETE',
            params: {
                projectId: function () {
                    return $stateParams.currentProject;
                }
            },
            url: '/api/projects/:projectId/studyprototypes/:id'
        }
    });

};
