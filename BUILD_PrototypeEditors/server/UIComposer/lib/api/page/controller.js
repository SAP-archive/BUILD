'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('norman-ui-composer-server:page.controller');

var registry = commonServer.registry;
var pageMetadataService = registry.getModule('pageMetadataService');
var tp = commonServer.tp,
    _ = tp.lodash;

module.exports.createPage = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    serviceLogger.info({
        params: projectId
    }, '>> createPage()');
    // TODO inputValidation required
    // TODO after authentication - get Stats
    var userId = req.user._id.toString();
    req.body.createPage = {floorplans: req.body.floorplans, pageType: req.body.pageType};
    delete req.body.floorplans;
    //  pageMetadataService.createPage(projectId, req.body.floorplans, stats).then(function (result) {
    pageMetadataService.createPage(projectId, req, userId).then(function (result) {
        return res.status(200).json(result);
    }, function (error) {
        serviceLogger.error({
            params: error
        }, '>> pageMetadataService.createPage()');
        return res.sendStatus(500);
    });
};

module.exports.updatePage = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    serviceLogger.info({
        params: projectId
    }, '>> updatePage()');

    // TODO inputValidation required
    // TODO after authentication - get Stats
    var userId = req.user._id.toString();

    var files = req.files;
    var pages = JSON.parse(req.body.pages);
    req.body.updatePage = {pages: pages, files: files};
    if (_.isEmpty(pages) && _.isEmpty(files)) {
        res.sendStatus(200);
    }
    else {
        // pageMetadataService.updatePage(projectId, pages, stats, files).then(function (result) {
        pageMetadataService.updatePage(projectId, req, userId).then(function (result) {
            return res.status(200).json(result);
        }, function (error) {
            serviceLogger.error({
                params: error
            }, '>> pageMetadataService.updatePage()');
            res.status(500).json(error);
        });
    }


};

module.exports.deletePage = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];

    serviceLogger.info({
        params: req.params
    }, '>> deletePage()');

    var userId = req.user._id.toString();
    req.body.deletePage = {pageName: req.query.pageName};
    // pageMetadataService.deletePage(projectId, req.query.pageName, stats).then(function (result) {
    pageMetadataService.deletePage(projectId, req, userId).then(function (result) {
        res.status(200).json(result);
    }, function (error) {
        serviceLogger.error({
            params: error
        }, '>> pageMetadataService.deletePage()');
        res.status(500).json(error);
    });
};

module.exports.getPage = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    serviceLogger.info({
        params: projectId
    }, '>> getPage()');

    // TODO inputValidation required
    // TODO after authentication - get Stats
    var userId = req.user._id.toString();
    pageMetadataService.getPage(projectId, req.query.pageName, req.query.controlId, req.query.getName, userId).then(function (result) {
        res.status(200).json(result);
    }, function (error) {
        serviceLogger.error({
            params: error
        }, '>> pageMetadataService.getPage()');
        res.status(500).json(error);
    });
};

module.exports.getPossibleMainEntities = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];

    serviceLogger.info({params: projectId}, '>> getPossibleMainEntities()');

    pageMetadataService.getPossibleMainEntities(projectId, req.query.pageName)
        .then(function (result) {
            res.status(200).json(result);
        })
        .catch(function (error) {
            serviceLogger.error({params: error}, '>> pageMetadataService.getPossibleMainEntities()');
            res.status(500).json(error);
        });
};

module.exports.updateCoordinates = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    serviceLogger.info({
        params: projectId
    }, '>> updateCoordinates()');

    var userId = req.user._id.toString();
    req.body.updateCoordinates = {coordinatesArray: req.body.coordinatesArray};
    delete req.body.coordinatesArray;
    pageMetadataService.updateCoordinates(projectId, req, userId).then(function (result) {
        res.status(200).json(result);
    }, function (error) {
        serviceLogger.error({
            params: error
        }, '>> pageMetadataService.getPage()');
        res.status(500).json(error);
    });
};



