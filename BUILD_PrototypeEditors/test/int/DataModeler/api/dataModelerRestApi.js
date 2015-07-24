'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');


function DataModelerRestApi() {
}

DataModelerRestApi.prototype.dbInitialize = function (callback) {
    NormanTestServer.initialize(path.join(__dirname, '../../config-dm.json')).then(function (server) {
        NormanTestServer.dropDB().then(function () {
            server.initSchema().then(
                callback()
            )
        });
    });
};

DataModelerRestApi.prototype.initialize = function (user, password) {
    var deferred = promise.defer(), self = this;
    NormanTestServer.initialize(path.join(__dirname, '../../config-dm.json')).then(function (server) {
        self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
    });
    return deferred.promise;
};

//Get User parameter for test connection
DataModelerRestApi.prototype.getUser = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/users/me', httpCodeExpected, fnCallBack);
};


DataModelerRestApi.prototype.lockProject = function (projectId) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/lock', 200, function () {
    }, {projectId: projectId});
};


/*     =========== Model =========================== */
DataModelerRestApi.prototype.createProject = function (fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects', 201, fnCallBack, {name: 'Data Modeler'});
};

DataModelerRestApi.prototype.createModel = function (httpCodeExpected, fnCallBack) {
    var that = this;
    this.createProject(function (err, res) {
        if (err) {
            fnCallBack(err, res);
        }
        else {
            that.lockProject(res.body._id);
            that.getModel(200, res.body._id, fnCallBack);
        }
    });
};

DataModelerRestApi.prototype.getModel = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID, httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.updateModel = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID, httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.updateModel2 = function (httpCodeExpected, projectID, model, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID, httpCodeExpected, fnCallBack, model);
};

///*     =========== Import XL =========================== */
DataModelerRestApi.prototype.importModel = function (httpCodeExpected, attachValue, fnCallBack) {
    var that = this;
    this.createProject(function (err, res) {
        var projectID = res.body._id;
        that.lockProject(projectID);
        that.normanTestRequester.contentType = 'multipart/form-data';
        that.normanTestRequester.reqPostAttach('/api/models/' + projectID + '/importxl', httpCodeExpected, fnCallBack, attachValue);
        that.normanTestRequester.contentType = null;
    });
};

DataModelerRestApi.prototype.addModelByXl = function (httpCodeExpected, projectID, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/models/' + projectID + '/importxl', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

DataModelerRestApi.prototype.updateModelByXL = function (httpCodeExpected, projectID, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/models/' + projectID + '/updatexl', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};
DataModelerRestApi.prototype.exportXl = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/exportXl', httpCodeExpected, fnCallBack);
};
DataModelerRestApi.prototype.exportXlEntity = function (httpCodeExpected, projectID, entityId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/entities/' + entityId + '/exportXl', httpCodeExpected, fnCallBack);
};

///*     =========== Entity =========================== */
DataModelerRestApi.prototype.createEntity = function (httpCodeExpected, projectID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/entities', httpCodeExpected, fnCallBack, sendValue);
};

DataModelerRestApi.prototype.updateEntity = function (httpCodeExpected, projectID, entityID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID + '/entities/' + entityID, httpCodeExpected, fnCallBack, sendValue);
};

DataModelerRestApi.prototype.deleteEntity = function (httpCodeExpected, projectID, entityID, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/models/' + projectID + '/entities/' + entityID, httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.addEntitiesFromCatalog = function (httpCodeExpected, projectID, catalogId, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/catalog/' + catalogId, httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.addEntityFromCatalog = function (httpCodeExpected, projectID, catalogId, originalEntityId, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/catalog/' + catalogId + '/catalogEntities/' + originalEntityId, httpCodeExpected, fnCallBack);
};

///*     =========== Property =========================== */
DataModelerRestApi.prototype.createProperty = function (httpCodeExpected, projectID, entityID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/entities/' + entityID + '/properties', httpCodeExpected, fnCallBack, sendValue);
};
DataModelerRestApi.prototype.updateProperty = function (httpCodeExpected, projectID, entityID, propertyID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID + '/entities/' + entityID + '/properties/' + propertyID, httpCodeExpected, fnCallBack, sendValue);
};
DataModelerRestApi.prototype.deleteProperty = function (httpCodeExpected, projectID, entityID, propertyID, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/models/' + projectID + '/entities/' + entityID + '/properties/' + propertyID, httpCodeExpected, fnCallBack);
};

///*     =========== Navigation Property ===========================*/
DataModelerRestApi.prototype.createNavigationProperty = function (httpCodeExpected, projectID, entityID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/entities/' + entityID + '/navigationProperties', httpCodeExpected, fnCallBack, sendValue);
};
DataModelerRestApi.prototype.updateNavigationProperty = function (httpCodeExpected, projectID, entityID, navPropertyID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID + '/entities/' + entityID + '/navigationProperties/' + navPropertyID, httpCodeExpected, fnCallBack, sendValue);
};
DataModelerRestApi.prototype.deleteNavigationProperty = function (httpCodeExpected, projectID, entityID, navPropertyID, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/models/' + projectID + '/entities/' + entityID + '/navigationProperties/' + navPropertyID, httpCodeExpected, fnCallBack);
};

///*     =========== Sample Data ===========================*/
DataModelerRestApi.prototype.addSampleData = function (httpCodeExpected, projectID, entityName, sendValue, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/entities/' + entityName + '/sampleData', httpCodeExpected, fnCallBack, sendValue);
};
DataModelerRestApi.prototype.getSampleDataXL = function (httpCodeExpected, projectID, entityName, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/entities/' + entityName + '/sampleData', httpCodeExpected, fnCallBack);
};

///*     =========== Group =========================== */
DataModelerRestApi.prototype.getStandardGroups = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/standardgroups', httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.createGroup = function (httpCodeExpected, projectID, entityID, sendValue, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models/' + projectID + '/entities/' + entityID + '/groups', httpCodeExpected, fnCallBack, sendValue);
};

DataModelerRestApi.prototype.updateGroup = function (httpCodeExpected, projectID, entityID, groupId, sendValue, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID + '/entities/' + entityID + '/groups/' + groupId, httpCodeExpected, fnCallBack, sendValue);
};

DataModelerRestApi.prototype.deleteGroup = function (httpCodeExpected, projectID, entityID, groupId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/models/' + projectID + '/entities/' + entityID + '/groups/' + groupId, httpCodeExpected, fnCallBack);
};

///*     =========== oData ===========================*/
DataModelerRestApi.prototype.getServiceDescription = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/oData', httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.getMetadata = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/oData/metadata.xml', httpCodeExpected, fnCallBack);
};

DataModelerRestApi.prototype.getEntityData = function (httpCodeExpected, projectID, entityName, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID + '/oData/' + entityName, httpCodeExpected, fnCallBack);
};

module.exports = DataModelerRestApi;
