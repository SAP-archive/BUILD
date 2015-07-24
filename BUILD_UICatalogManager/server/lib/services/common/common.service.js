'use strict';

var commonServer = require('norman-common-server'),
    logger = commonServer.logging.createLogger('ui-catalog-manager'),
    Grid = require('gridfs-stream'),
    alphaNumeric = /^[a-z\d\-_\s]+$/i,
    version = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/,
    hexadecimal = /^[0-9a-fA-F]+$/;

/**
 * sendError handler for error
 * @res  {Object}
 * @err  {Object}
 * @return {Object}
 */
function sendError(res, err) {
    logger.error(err);
    if (err.stack) {
        logger.error(err.stack);
    }
    if (err && err.name === 'MongoError') {
        // Well formed but unable to execute
        res.status(422).json({
            name: 'MongoError',
            errorCode: err.code
        });
    } else {
        // Dont know how to handle it!!!
        res.status(500).json(err);
    }
}

/**
 * logError handler for logging error
 * @err  {Object}
 * @return {Object}
 */
function logError(err) {
    logger.error(err);
    if (err.stack) {
        logger.error(err.stack);
    }
}

/**
 * [sendResponse handler for sending response]
 * @res  {Object}
 * @statusCode  {String}
 * @retObject  {Object}
 * @return {Object}
 */
function sendResponse(res, statusCode, retObject) {
    res.status(statusCode).json(retObject || {});
}

/**
 * [getGridFs handler for fetching GridFS object]
 * @return {Object}
 */
function getGridFs() {
    var mongo = commonServer.db.mongoose.mongo,
        db = commonServer.db.connection.getDb('shared_ws'),
        gfs = new Grid(db, mongo);
    return gfs;
}

/**
 * [isValidId handler for checking if valid MongoID]
 * @id  {String}
 * @return {Boolean}
 */
function isValidId(id) {
    return commonServer.db.mongoose.Types.ObjectId.isValid(id);
}

/**
 * [toObjectId handler for checking if objectID]
 * @id  {String}
 * @return {Object}
 */
function toObjectId(id) {
    return commonServer.db.mongoose.Types.ObjectId(id);
}

/**
 * [isAlphaNumeric handler for checking alphanumeric string]
 * @str  {String}
 * @return {Boolean}
 */
function isAlphaNumeric(str) {
    return alphaNumeric.test(str);
}

/**
 * [isVersion handler for checking version string]
 * @str  {String}
 * @return {Boolean}
 */
function isVersion(str) {
    return version.test(str);
}

/**
 * [isMongoId handler for checking if MongoID]
 * @str  {String}
 * @return {Boolean}
 */
function isMongoId(str) {
    return hexadecimal.test(str) && str.length === 24;
}

exports.sendResponse = sendResponse;
exports.sendError = sendError;
exports.logError = logError;
exports.isValidId = isValidId;
exports.toObjectId = toObjectId;
exports.getGridFs = getGridFs;
exports.isAlphaNumeric = isAlphaNumeric;
exports.isVersion = isVersion;
exports.isMongoId = isMongoId;
