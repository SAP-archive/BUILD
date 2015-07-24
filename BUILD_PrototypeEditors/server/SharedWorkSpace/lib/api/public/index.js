'use strict';
var tp = require('norman-server-tp');
var path = require('path');
var express = tp.express;
var router = new express.Router();
var queryString = require('querystring');
module.exports = router;

router.use('/public/*', function (req, res) {
    var relativePath = req.baseUrl;
    var relativePathSplits = relativePath.split('/deploy');

    var projectId = relativePathSplits[1].split('/')[2];
    var snapshotVersion = relativePathSplits[1].split('/')[3];
    var pattern = '/' + snapshotVersion + '/';
    var search = relativePathSplits[1].search(pattern);
    var artifactPath = relativePathSplits[1].substring(search + pattern.length, relativePathSplits[1].length);
    artifactPath = queryString.unescape(artifactPath);

    var newUrl = '/api/projects/' + projectId + '/prototype/snapshot/' + snapshotVersion + '/' + artifactPath;
    var finalPath = path.join(relativePathSplits[0], newUrl);

    res.redirect(finalPath);
});
