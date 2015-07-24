'use strict';

var promise = require('norman-promise');
var resolver = require('./testerUtil').resolver;

function QuestionRestApi() {
}

QuestionRestApi.prototype.createQuestion = function (userContext, projectId, studyId, model, httpCodeExpected) {
    var deferred = promise.defer();
    userContext.normanTestRequester.reqPost('/api/projects/' + projectId + '/studies/' + studyId + '/questions/', httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

QuestionRestApi.prototype.updateQuestion = function(userContext, projectId, studyId, questionId, model, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 204;

    userContext.normanTestRequester.reqPut('/api/projects/' + projectId + '/studies/' + studyId + '/questions/' + questionId, httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

QuestionRestApi.prototype.updateMultipleQuestion = function(userContext, projectId, studyId, model, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 200;

    userContext.normanTestRequester.reqPut('/api/projects/' + projectId + '/studies/' + studyId + '/questions',
        httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

QuestionRestApi.prototype.deleteQuestion = function(userContext, projectId, studyId, questionId, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 204;

    userContext.normanTestRequester.reqDelete('/api/projects/' + projectId + '/studies/' + studyId + '/questions/' + questionId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

QuestionRestApi.prototype.deleteQuestionBulk = function(userContext, projectId, studyId, questionId, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 204;

    userContext.normanTestRequester.reqDelete('/api/projects/' + projectId + '/studies/' + studyId + '/questions/' + questionId + '/bulk', httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

QuestionRestApi.prototype.createTask = function (userContext, projectId, studyId, model, httpCodeExpected){

    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 201;
    userContext.normanTestRequester.reqPost('/api/projects/' + projectId + '/studies/' + studyId + '/tasks/', httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

QuestionRestApi.prototype.getTask = function(userContext, projectId, studyId, taskId, httpCodeExpected){
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 200;
    userContext.normanTestRequester.reqGet('/api/projects/' + projectId + '/studies/' + studyId + '/tasks/' + taskId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};

QuestionRestApi.prototype.getTasks = function(userContext, projectId, studyId, httpCodeExpected){
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 200;
    userContext.normanTestRequester.reqGet('/api/projects/' + projectId + '/studies/' + studyId + '/tasks', httpCodeExpected, resolver(deferred));
    return deferred.promise;
};


QuestionRestApi.prototype.updateTask = function(userContext, projectId, studyId, taskId, model, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 204;

    userContext.normanTestRequester.reqPut('/api/projects/' + projectId + '/studies/' + studyId + '/tasks/' + taskId, httpCodeExpected, resolver(deferred), model);
    return deferred.promise;
};

QuestionRestApi.prototype.deleteTask = function(userContext, projectId, studyId, taskId, httpCodeExpected) {
    var deferred = promise.defer();
    httpCodeExpected = httpCodeExpected || 204;

    userContext.normanTestRequester.reqDelete('/api/projects/' + projectId + '/studies/' + studyId + '/tasks/' + taskId, httpCodeExpected, resolver(deferred));
    return deferred.promise;
};


module.exports = QuestionRestApi;
