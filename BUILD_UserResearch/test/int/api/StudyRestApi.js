'use strict';

var promise = require('norman-promise');
var resolver = require('./testerUtil').resolver;

function StudyRestApi() {
}

StudyRestApi.prototype.createProject = function (userContext, model, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/projects', httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

/**
 * Allow user to upload images and attach them to a project
 * POST: '/api/projects/:projectId/document'
 *
 * @param userContext
 * @param model
 * @param httpCodeExpected
 * @returns {deferred.promise|{then, always}|{then}|*|{then, catch, finally}}
 */
StudyRestApi.prototype.uploadProjectAsset = function (userContext, projectId, attachValue, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPostAttach('/api/projects/' + projectId + '/document', httpCodeExpected, resolver(deferred), attachValue);
    return deferred.promise;
};

/**
 * Gets a List of Studies for a project
 * GET: '/api/projects/:projectId/studies'
 *
 * @param userContext
 * @param projectId
 * @param httpCodeExpected
 * @returns Promise - response
 */
StudyRestApi.prototype.getStudies = function (userContext, projectId, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/projects/' + projectId + '/studies', httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

/**
 * Gets a Study
 * GET: '/api/projects/:projectId/studies/:studyId'
 *
 * @param userContext
 * @param projectId
 * @param studyId
 * @param httpCodeExpected
 * @returns
 */
StudyRestApi.prototype.getStudy = function (userContext, projectId, studyId, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/projects/' + projectId + '/studies/' + studyId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

/**
 * Creates a new Study
 * POST: '/api/projects/:projectId/studies/'
 *
 * @param userContext
 * @param projectId
 * @param model
 * @param httpCodeExpected
 * @returns Promise
 */
StudyRestApi.prototype.createStudy = function (userContext, projectId, model, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/projects/' + projectId + '/studies/', httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

/**
 * Creates a Study with a Question/Task
 * POST: '/api/projects/:projectId/studies/create'
 *
 * @param userContext
 * @param projectId
 * @param model
 * @param httpCodeExpected
 * @returns {deferred.promise|{then, always}|*|{then}|{then, catch, finally}}
 */
StudyRestApi.prototype.createStudyWithQuestion = function (userContext, projectId, model, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/projects/' + projectId + '/studies/create', httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};


/**
 * Updates Study
 * PUT: '/api/projects/:projectId/studies/:studyId'
 *
 * @param userContext
 * @param projectId
 * @param studyId
 * @param model
 * @param httpCodeExpected
 * @returns Promise - response
 */
StudyRestApi.prototype.updateStudy = function (userContext, projectId, studyId, model, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPut('/api/projects/' + projectId + '/studies/' + studyId, httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

/**
 * Updates Study to 'paused'
 * PUT: '/api/projects/:projectId/studies/:studyId'
 * data: {status: 'paused'};
 *
 * @param userContext
 * @param projectId
 * @param studyId
 * @param httpCodeExpected (optional) - default check for success '200'
 * @returns Promise - response
 */
StudyRestApi.prototype.pauseStudy = function (userContext, projectId, studyId, httpCodeExpected) {
    var data = {status: 'paused'};
    httpCodeExpected = httpCodeExpected || 200;
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPut('/api/projects/' + projectId + '/studies/' + studyId, httpCodeExpected, resolver(deferred), data);
    return deferred.promise;
};

/**
 * Updates Study to 'archived'
 * PUT: '/api/projects/:projectId/studies/:studyId'
 * data: {status: 'archived'}
 *
 * @param userContext
 * @param projectId
 * @param studyId
 * @param httpCodeExpected (optional) - default check for success '200'
 * @returns Promise - response
 */
StudyRestApi.prototype.archiveStudy = function (userContext, projectId, studyId, httpCodeExpected) {
    var data = {status: 'archived'};
    httpCodeExpected = httpCodeExpected || 200;
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPut('/api/projects/' + projectId + '/studies/' + studyId, httpCodeExpected, resolver(deferred), data);
    return deferred.promise;
};

/**
 * Deletes a Study
 * DELETE: '/api/projects/:projectId/studies/:studyId'
 *
 * @param userContext
 * @param projectId
 * @param studyId
 * @param httpCodeExpected
 * @returns {deferred.promise|{then, always}|*|{then}|{then, catch, finally}}
 */
StudyRestApi.prototype.deleteStudy = function (userContext, projectId, studyId, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqDelete('/api/projects/' + projectId + '/studies/' + studyId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};


StudyRestApi.prototype.uploadZip = function (userContext, projectId, attachValue, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.contentType = 'multipart/form-data';
    userContext.normanTestRequester.reqPostAttach('/api/projects/' + projectId + '/research/htmlPrototypes/', httpCodeExpected, resolver(deferred), attachValue);
    userContext.normanTestRequester.contentType = null;
    return deferred.promise;
};


/**
 * Invite user to Study
 * POST: '/api/projects/:projectId/studies/:studyId/sendInvitee'
 *
 * @param userContext
 * @param projectId
 * @param model
 * @param httpCodeExpected
 * @returns Promise
 */
StudyRestApi.prototype.sendInvitee = function (userContext, projectId, studyId, model, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/projects/' + projectId + '/studies/' + studyId + '/sendInvitee/', httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};


module.exports = StudyRestApi;
