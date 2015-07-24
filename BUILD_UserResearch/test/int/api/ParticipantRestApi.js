'use strict';

var promise = require('norman-promise');
var resolver = require('./testerUtil').resolver;

function ParticipantRestApi() {
}


/**
 * Gets a List of Studies the User Participated in
 * gets : /api/participant/studies
 *
 * @param userContext (the UserSession  created in the TestuserContext
 * @returns promise - response
 */
ParticipantRestApi.prototype.getStudiesIParticipatedIn = function (userContext, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/participant/studies', httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

ParticipantRestApi.prototype.render = function (userContext, studyId, assetId, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/participant/' + studyId + '/document/' + assetId + '/1/render', httpCodeExpected, resolver(deferred));
    return deferred.promise;
}

/**
 * Add's new Annotation
 * Post: '/api/participant/:studyId/annotations'
 *
 * @param userContext
 * @param httpCodeExpected
 * @param annotationModeld
 * @returns promise - response
 */
ParticipantRestApi.prototype.addAnnotation = function (userContext, studyId, annotationModel, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/participant/' + studyId + '/annotations', httpCodeExpected, resolver(deferred), annotationModel);
    return deferred.promise;
};

/**
 * Update an Annotation
 * put : '/api/participant/:studyId/annotations/:annotationId'
 *
 * @param userContext
 * @param studyId
 * @param annotationId
 * @param annotationModel
 * @param httpCodeExpected
 * @returns Promise - response
 */
ParticipantRestApi.prototype.updateAnnotation = function (userContext, studyId, annotationId, annotationModel, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPut('/api/participant/' + studyId + '/annotations/' + annotationId, httpCodeExpected, resolver(deferred), annotationModel);
    return deferred.promise;
};

/**
 * delete an annotation
 * delete: '/api/participant/:studyId/annotations/:annotationId'
 *
 * @param userContext
 * @param studyId
 * @param annotationId
 * @param httpCodeExpected
 * @returns Promise - response
 */
ParticipantRestApi.prototype.deleteAnnotation = function (userContext, studyId, annotationId, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqDelete('/api/participant/' + studyId + '/annotations/' + annotationId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

/**
 * Add a new Answer
 *
 * @param userContext
 * @param studyId
 * @param answerModel
 * @param httpCodeExpected
 * @returns Promise - response
 */
ParticipantRestApi.prototype.addAnswer = function (userContext, studyId, answerModel, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPut('/api/participant/studies/' + studyId + '/answers/', httpCodeExpected, resolver(deferred), answerModel);
    return deferred.promise;
};

ParticipantRestApi.prototype.setAnonymous = function (userContext, studyId, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 200;
    userContext.normanTestRequester.reqPut('/api/participant/studies/' + studyId + '/anonymous', httpCodeExpected, resolver(deferred))
    return deferred.promise;
}


/**
 * gets : /api/participant/:studyId
 *
 * @param userContext (the UserSession  created in the Test userContext
 * @param studyId
 * @returns promise - response
 */
ParticipantRestApi.prototype.getStudyToParticipatedIn = function (userContext, studyId, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/participant/' + studyId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

/**
 *
 * @param userContext
 * @param studyId
 * @param answerModel
 * @param httpCodeExpected
 * @returns Promise - response
 */
ParticipantRestApi.prototype.answerQuestion = function (userContext, studyId, answerModel, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPut('/api/participant/studies/' + studyId + '/answers/', httpCodeExpected, resolver(deferred), answerModel);
    return deferred.promise;
};

/**
 * Saves Tracking information
 *
 * @param userContext
 * @param studyId
 * @param trackingModel
 * @param httpCodeExpected
 * @returns promise- response
 */
ParticipantRestApi.prototype.track = function (userContext, studyId, trackingModel, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/participant/studies/' + studyId + '/tracking/', httpCodeExpected, resolver(deferred), trackingModel);
    return deferred.promise;
};

/**
 * Starts A Task in terms of starting and setting up tracking
 *
 * @param userContext
 * @param projectId
 * @param studyId
 * @param questionId
 * @param pathName
 * @param pageUrl
 * @param dateTime
 * @returns Promise - AnswerRes & TrackingRes data
 */
ParticipantRestApi.prototype.startTask = function (userContext, projectId, studyId, questionId, pathName, pageUrl, dateTime){
    var deferred = promise.defer();
    var that = this;
    var ans = {
        questionId: questionId,
        questionType: 'Task',
        status : 'in progress'
    };
    var response = {};
    var trackingData = {};
    trackingData.offset = trackingData.offset || -60;
    trackingData.eventType = 'navigation';
    trackingData.hash = '';
    trackingData.referrer = null;
    trackingData.studyId = studyId;
    trackingData.projectId = projectId;
    trackingData.questionId = questionId;
    trackingData.timezone = dateTime || new Date().toLocaleDateString();
    trackingData.pathName = pathName;
    trackingData.pageUrl = pathName;
    that.addAnswer(userContext, studyId, ans, 201)
        .then(function (ansRes) {
            response.answerRes = ansRes.body;
            return that.track(userContext, studyId, trackingData, 201);
        })
        .then( function (trackRes){
            response.trackingRes = trackRes.body;
            deferred.resolve(response);
        }).catch(deferred.reject);

    return deferred.promise;
}

module.exports = ParticipantRestApi;
