'use strict';

var utils = require('../../utils');

/**
 * Validates that the sentiment range being passed in for an annotation is correct
 *
 * @param sentiment {Integer} The sentiment value that needs to be validated
 */
function isSentimentValid(sentiment) {
    var first = 0;
    var last = 3;

    // Is the value a number?
    if (isNaN(sentiment)) return false;

    // Yes, is it between the correct range?
    if (sentiment >= first && sentiment <= last) return true;
    return false;
}

/**
 * This validates the request parameters being used in an annotation create/update
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 * @param   {object}  serviceLogger This is the logging object used to output logging messages
 */
exports.isValid = function (req, res, serviceLogger) {
    // If sentiment is set, then validate it
    if (req.body.sentiment !== undefined && req.body.sentiment !== null) {
        serviceLogger.info({
            sentiment: req.body.sentiment
        }, '>> _isSentimentValid()');
        if (!isSentimentValid(req.body.sentiment)) {
            serviceLogger.info('<< update(), sentiment is not valid');
            utils.sendError(res, 400, new Error('Sentiment is not set correctly, ensure range is correct'));
            return false;
        }
    }

    // url can only be relative
    if (req.body.url && req.body.url.indexOf('://') > 0) {
        serviceLogger.info('<< update(), url is not valid');
        utils.sendError(res, 400, new Error('annotation url is not valid'));
        return false;
    }

    return true;
};
