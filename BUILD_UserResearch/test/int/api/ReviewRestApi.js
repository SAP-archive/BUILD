'use strict';

var promise = require('norman-promise');
var resolver = require('./testerUtil').resolver;

function ReviewRestApi() {
}

ReviewRestApi.prototype.getStudyStats = function (userContext,projectId, studyId, httpCodeExpected){
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/projects/' + projectId + '/studies/' + studyId + '/review', httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

ReviewRestApi.prototype.getQuestionStats = function(userContext,projectId, studyId, questionId, httpCodeExpected){
    var deferred = promise.defer();
    userContext.normanTestRequester.reqGet('/api/projects/' + projectId + '/studies/' + studyId + '/review/' + questionId,
        httpCodeExpected, resolver(deferred));
    return deferred.promise;
}

module.exports = ReviewRestApi;
