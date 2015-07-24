/*eslint no-use-before-define: 0, new-cap: 0 */
'use strict';

var prototypeService = require('./service');

/**
 * Takes a zip file which is passed through the request, unzips it and saves all of the contents as assets.
 * Creates appMetadata where each of the html files in the zip are created as pages and then creates a studyprototype.
 *
 * @param  {object}  req The request object being used for the call
 * @param  {object}  res The response object used to send feedback and data back to the client
 */
exports.uploadZip = function (req, res) {
    prototypeService.uploadZip(req, res);
};

/**
 * Takes the thumbnails created for the html pages on the UI and saves them as assets.
 *
 * @param  {object}  req The request object being used for the call
 * @param  {object}  res The response object used to send feedback and data back to the client
 */
exports.addThumbnail = function (req, res) {
    prototypeService.addThumbnail(req, res);
};
