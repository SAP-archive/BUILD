/**
 * Annotation
 * @module /api/tracking
 */
/**
 * <pre>
 * POST      /tracking              ->  create
 * GET       /tracking              ->  index
 * GET       /tracking/:id          ->  show
 * DELETE    /tracking/:id          ->  destroy
 * </pre>
 */

'use strict';

var model = require('./model');
var Tracking = model.getModel();
var utils = require('../../utils');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('tracking-ctrl');

/**
 * Create a new tracking entry
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.create = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> create()');

    if (req.body.questionId && !utils.isMongoId(req.body.questionId)) {
        serviceLogger.warn('<< create(), question ID is not valid');
        return utils.sendError(res, 400, {
            error: 'Question ID is not set correctly'
        });
    }

    // Step 1. Configure tracking request
    var tracking = req.body;
    tracking.user = req.user._id;

    // Step 2. Setup DB query params
    var queryParams = {};

    // Step 3. Specific insert params based on whether request is an update or an insert
    var insertParams = {};

    // Update existing tracking request, only care about updated_at if _id is passed in i.e. this becomes an update flow
    if (tracking._id && tracking._id !== null) {
        queryParams._id = tracking._id;
        insertParams.$set = {
            'stats.updated_at': new Date()
        };
    }
    else {
        // Otherwise create a new one
        queryParams.studyId = tracking.studyId;
        queryParams.projectId = tracking.projectId;
        queryParams.questionId = tracking.questionId;
        queryParams.user = tracking.user;

        var date = new Date();
        tracking._id = commonServer.utils.shardkey();
        tracking.stats = {};
        tracking.stats.created_at = date;
        // Tracking some basic analytic data
        tracking.user_agent = req.headers['user-agent'] || '';
        // Browser language
        tracking.locale = req.headers['accept-language'] || '';
        tracking.timezone = tracking.timezone || '';
        tracking.timezoneOffset = tracking.offset || '';
        // iframeClick will never be called again, so set end date now
        if (tracking.eventType && tracking.eventType === 'iframeClick') {
            // Using same date as above as it its a single fire and forget
            tracking.stats.updated_at = date;
        }

        insertParams.$setOnInsert = tracking;
    }

    // Step 4. Each request will have an ID either generated or passed in
    queryParams._id = tracking._id;

    // Step 5. Clean up old PageView i.e. user is moving between pages so set updated_at field
    // Dev-note: if it cant find the _id then just continue, don't do an insert
    if (tracking.closeTrackId) {
        Tracking.findOneAndUpdate({
                _id: tracking.closeTrackId
            }, {
                'stats.updated_at': new Date()
            }, {
                upsert: false,
                new: true
            })
            .lean()
            .exec(function (err, trackItem) {
                if (err) {
                    serviceLogger.error('<< create(), Unable to create tracking item, ' + err);
                    return utils.sendError(res, err);
                }
                if (trackItem) {
                    serviceLogger.info('create(), set updated date for prev PageView' + trackItem._id);
                }
            });
    }

    // Step 6. Return _id to the user, no other document params should be returned here as they are not used on the UI
    Tracking.findOneAndUpdate(queryParams, insertParams, {
            upsert: true,
            new: true
        })
        .lean()
        .select('_id')
        .exec(function (err, trackingItem) {
            if (err) {
                serviceLogger.error('<< create(), Unable to create tracking item, ' + err);
                return utils.sendError(res, err);
            }

            serviceLogger.info('<< create(), tracking item created');
            return res.status(201).json(trackingItem);
        });
};

/**
 * Get a single tracking entry
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.show = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> show()');

    Tracking.findById(req.params.id).lean().exec(function (err, trackingItem) {
        if (err) {
            serviceLogger.error('Error getting tracking item');
            return utils.sendError(res, err);
        }

        if (!trackingItem) {
            serviceLogger.warn('Tracking item not found');
            return res.status(404).json();
        }

        serviceLogger.info('returning tracking item');
        return res.status(200).json(trackingItem);
    });

};

/**
 * Get all tracking entries
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.index = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> index()');

    Tracking.find().lean().exec(function (err, trackingItems) {
        if (err) {
            serviceLogger.error('Error getting tracking items');
            return utils.sendError(res, err);
        }

        serviceLogger.info('returning tracking items');
        return res.status(200).json(trackingItems);
    });

};

/**
 * Delete a tracking entries
 *
 * @param   {object}  req  request
 * @param   {object}  res  response
 */
exports.destroy = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> destroy()');

    Tracking.remove({
        _id: req.params.id
    }).exec(function (err, trackingItem) {
        if (err) {
            serviceLogger.error('Unable to delete tracking item');
            return utils.sendError(res, err);
        }

        if (!trackingItem) {
            serviceLogger.error('Tracking item not found');
            return res.status(404).json();
        }

        serviceLogger.info('Tracking item deleted');
        return res.status(204).json();
    });

};

exports.checkSchema = function (done) {
    model.createIndexes(done);
};
