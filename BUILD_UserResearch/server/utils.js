'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('user-research-util');
var hexadecimal = /^[0-9a-fA-F]+$/;
var _ = require('norman-server-tp').lodash;
var Study = require('./api/study/model').getModel();

var HASH_FORWARDSLASH = '#/';

exports.sendError = function (res) {
    try {
        if (arguments.length === 2) {
            if (isNaN(arguments[1])) {
                return res.status(500).json(arguments[1]);
            }
            return res.status(arguments[1]).json();
        }
        else if (arguments.length === 3) {
            if (isNaN(arguments[1])) {
                return res.status(arguments[2]).json(arguments[1]);
            }
            return res.status(arguments[1]).json(arguments[2]);
        }
        res.status(500).json();
    }
    catch (err) {
        serviceLogger.error('<< sendError(), error, ' + err);
    }
};

exports.getStudyAnswers = function (res, queryParams, filterParams) {
    Study.findOne(queryParams, filterParams)
        .lean(true)
        .select('answers')
        .exec(function (err, study) {
            if (err) {
                serviceLogger.warn('<< error returning answers', err);
                return exports.sendError(res, err);
            }

            if (!study) {
                serviceLogger.warn('<< answers not found');
                return res.status(404).json();
            }

            serviceLogger.info('<< returning answers');
            return res.status(200).json(study.answers);
        });
};


exports.update = function (obj, body, props) {
    props = props.split(' ');
    props.forEach(function (prop) {
        if (typeof body[prop] !== 'undefined') obj[prop] = body[prop];
    });
};

exports.isSentimentValid = function (sentiment) {
    serviceLogger.info({
        sentiment: sentiment
    }, '>> _isSentimentValid()');

    var first = 0;
    var last = 3;

    // Is the value a number?
    if (isNaN(sentiment)) return false;

    // Yes, is it between the correct range?
    if (sentiment >= first && sentiment <= last) return true;
    return false;
};

exports.isMongoId = function (str) {
    return hexadecimal.test(str) && str.length === 24;
};

/*
 Set order of questions if according to their ordinal so that they are saved in the correct order.
 */
exports.orderListByOrdinal = function (aQuestions) {
    if (_.isArray(aQuestions)) {
        return _.sortBy(aQuestions, 'ordinal');
    }
};

/**
 * Update the participant name to reflect the users status i.e. anonymous|deleted or active. Users who have specified
 * they want to be anonymous will be displayed as Participant N in the UI
 *
 * @param array1
 * @param array2
 * @param prop
 */
exports.setParticipantOrAnonymousNames = function (array1, array2, prop) {
    _.each(array1, function (arr1obj) {
        var arr2obj = _.find(array2, function (arr2o) {
            return arr1obj[prop].toString() === arr2o[prop].toString();
        });

        // If the object already exists extend it with the new values
        if (arr2obj) arr1obj.participant = arr2obj.name;
    });
};

exports.validateParams = function (action) {

    serviceLogger.info('<< validateParams(), params,', action.params);
    return function (req, res, next) {
        var isValid = true;
        _.forEach(action.params, function (_param) {
             if (!(req.param(_param))) {
                serviceLogger.error('<< validateParams(), error, cannot find param [' + _param + '] in req');
                isValid = false;
                return false;
            }
         });

        if (!isValid) {
           return res.status(400).json({ message: 'request missing required parameters.' });
        }
        next();
    };
};

/**
 * Updates deepLinks for a UI5 snapshot to replace the names with the Entity's or html page &
 * save the original name in a new 'view' property
 *
 * @param deepLinks
 * @param snapshotUILang
 * @returns Array
 */
exports.updateSnapShotDeepLinks = function (deepLinks, snapshotUILang) {
    serviceLogger.info('>> updateSnapShotDeepLinks()');
    if (snapshotUILang === 'UI5') {
        serviceLogger.info('>> updateSnapShotDeepLinks() snapshotUILang UI5');
        for (var i = 0, len = deepLinks.length; i < len; i++) {
            var context = getContextFromUrl(deepLinks[i].pageUrl, {snapshotUILang:snapshotUILang});

            deepLinks[i].view = deepLinks[i].pageName;
            deepLinks[i].pageName = context.entity || context.index;
            deepLinks[i].pageUrl = context.relativePath || deepLinks[i].pageUrl;
        }
    }
    serviceLogger.info('<< updateSnapShotDeepLinks()');
    return deepLinks;
};

exports.getContextFromUrl = getContextFromUrl;
/**
 * Gets the app templates context from a url
 *
 * @param {string} unparsedURI - e.g. /api/prototype/some/url/index.html#/SalesOrder('apples')
 * @param {object} task - the task object
 * @returns an Object containing a path
 *      (e.g. /api/prototype/some/url or http://domain.com:123/api/prototype/some/url if domain is contained in url)
 *      an index (or html page e.g. index.html),
 *      the entity (e.g. SalesOrder), and data (e.g. apples),
 *      and a relative path excluding the data (e.g. /api/prototype/some/url/index.html#/SalesOrder)
 */
function getContextFromUrl(unparsedURI, task) {
    var context = {};
    if (unparsedURI !== undefined && task.snapshotUILang === 'UI5') {
        var regex = /([\/\.:a-zA-Z0-9]{0,})\/([a-zA-Z0-9]{2,}[.]{1}[a-zA-Z0-9]{2,})#\/([A-Za-z0-9]{1,})\(\'([A-Za-z0-9]{1,})'\)/g;
        var groups = regex.exec(unparsedURI);
        if (groups && groups.length > 2) {
            context.path = groups[1];
            context.index = groups[2];
            context.entity = groups[3];
            context.data = groups[4];
            context.relativePath = context.path + '/' + context.index + HASH_FORWARDSLASH + context.entity;
        }
        else {
            // a better Regex could help replace this else block
            var splitUrl = unparsedURI.split('/');
            context.index = splitUrl[splitUrl.length - 1];
            context.relativePath = unparsedURI;
        }
    }
    else {
        context.index = unparsedURI;
        context.relativePath = context.index;

    }
    return context;
}
