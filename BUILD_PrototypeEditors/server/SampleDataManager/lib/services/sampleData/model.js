'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var constant = require('../common/constant.js');

var Schema = mongoose.Schema;
var sampleDataSchema = new Schema({
    projectId: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    entities: [{
        _id: false,
        entityId: {
            type: String,
            required: true
        },
        entityName: {
            type: String,
            required: true
        },
        properties: [Schema.Types.Mixed]
    }],
    version: {
        type: Number,
        default: 1
    }
});

sampleDataSchema.set('autoIndex', false);
sampleDataSchema.index({
    dataModelId: 1
});

var SampleData = null;

function getModel() {
    if (!SampleData) {
        SampleData = mongoose.createModel(constant.SAMPLE_MODEL_NAME, sampleDataSchema);
    }
    return {
        SampleData: SampleData
    };
}

function createIndexes(done) {
    var logger = commonServer.logging.createLogger('sample-service');
    logger.debug('Checking model indexes');
    SampleData.ensureIndexes();
    SampleData.on('index', function (err) {
        if (err) {
            logger.error(err, 'Failed to create indexes for SampleData collection');
            done(err);
        }
        else {
            logger.debug('SampleData collection indexes verified');
            done();
        }
    });
}

module.exports.getModel = getModel;
module.exports.createIndexes = createIndexes;
