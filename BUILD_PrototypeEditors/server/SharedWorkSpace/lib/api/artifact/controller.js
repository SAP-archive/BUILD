'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('norman-sharedworkspace-server:artifact.controller');
var registry = commonServer.registry;
var artifactService = registry.getModule('ArtifactService');
var queryString = require('querystring');


/**
 * GetArtifact - Returns the Artifact for the given Project and Path
 *
 * @param {http.IncomingMessage}  req - http request
 * @param {http.ServerResponse}   res - http response
 * @returns {http.ServerResponse} res - http response
 */
module.exports.getArtifact = function (req, res) {
    serviceLogger.info({
        params: req.params
    }, '>> getArtifact()');

    var projectId = req.originalUrl.split('/')[3];

    artifactService.getArtifactByPath(projectId, extractPath(req))
        .then(
        function (data) {
            if (data && data.readStream) {
                res.header('Content-type', data.contentType);
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
                data.readStream.pipe(res);
            }
            else {
                res.status(404).json();
            }
        }, function (error) {
            serviceLogger.error({
                params: error
            }, '>> sharedworkspace.artifactController.getArtifact()');
            res.status(500).json(error);
        });
};

/**
 * Util to extract the path of artifact from requestURL
 * @param {http.IncomingMessage}  req - http request
 * @returns {string} artifactPath
 */
function extractPath(req) {
    var url = req.originalUrl.trim(),
        search = url.search('artifact/'),
        artifactPath = url.substring(search + 9, url.length);
    artifactPath = queryString.unescape(artifactPath);
    return artifactPath;
}
