'use strict';

var commonServer = require('norman-common-server');
var constant = require('../common/constant.js');
var mongoose = commonServer.db.mongoose,
    Schema = mongoose.Schema;

// see http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part3-csdl/odata-v4.0-errata01-os-part3-csdl-complete.html#_SimpleIdentifier
var ODATA_IDENTIFIER = /^[a-zA-Z_]\w{0,127}$/;
var OBJECT_ID = /^[0-9a-fA-F]{24}$/;

function nameValidator(value) {
    return ODATA_IDENTIFIER.test(value);
}

function idValidator(value) {
    return OBJECT_ID.test(value);
}

var propertySchema = new Schema({
        _id: {type: String, validate: idValidator, required: true}, // replace default mongodb _id by our own _id corresponding to propertyId
        name: {type: String, validate: nameValidator, required: true},
        propertyType: {type: String, required: true},
        isReadOnly: {type: Boolean},
        isKey: {type: Boolean},
        isNullable: {type: Boolean},
        calculated: {
            calculation: String,
            inputProperties: [
                {
                    navPropId: {type: String},
                    entityId: {type: String},
                    propertyId: {type: String}
                }
            ]
        },
        tags: [
            {type: String}
        ],
        isETag: Boolean,                           // technical
        order: Number,                             // technical
        maxLength: Number,                         // technical
        precision: Number,                         // technical
        scale: Number,                             // technical
        readable: Boolean,                         // technical
        sortable: Boolean,                         // technical
        filterable: Boolean,                       // technical
        semantics: String,                         // technical
        unit: String,                              // technical
        'field-control': String,                   // technical
        label: String,                             // TODO
        default: String,                           // TODO
        isAsset: {type: Boolean},
        isForeignKey: {type: Boolean}
    }, {_id: false, versionKey: false}
);

var referentialConstraint = new Schema({
        entityId: {type: String, validate: idValidator, required: true},
        propertyRef: {type: String, validate: idValidator, required: true}
    }, {_id: false, versionKey: false}
);

var navigationPropertySchema = new Schema({
        _id: {type: String, validate: idValidator, required: true}, // replace default mongodb _id by our own _id corresponding to navPropId
        name: {type: String, validate: nameValidator, required: true},
        multiplicity: {type: Boolean, required: true},
        toEntityId: {type: String, validate: idValidator, required: true},
        isReadOnly: {type: Boolean},
        referentialConstraints: [referentialConstraint]
    }, {_id: false, versionKey: false}
);

var groupRoleSchema = new Schema({
        id: String,
        path: String,
        propertyId: String
    }, {_id: false, versionKey: false}
);

var groupSchema = new Schema({
        _id: {type: String, validate: idValidator, required: true}, // replace default mongodb _id by our own _id corresponding to groupId
        name: {type: String, required: true},
        type: {type: String},
        roles: [groupRoleSchema]
    }, {_id: false, versionKey: false}
);
var entitySchema = new Schema({
        _id: {type: String, validate: idValidator, required: true}, // replace default mongodb _id by our own _id corresponding to entityId
        name: {type: String, validate: nameValidator, required: true},
        isReadOnly: {type: Boolean},
        position: {                                        // UI
            left: Number,
            top: Number,
            width: Number,
            height: Number
        },
        nameSet: String,                                   // technical
        media: Boolean,                                    // technical
        readable: Boolean,                                 // technical
        pageable: Boolean,                                 // technical
        addressable: Boolean,                              // technical
        originalEntity: {type: String},                    // technical
        semantics: String,                                 // technical
        label: {type: String},
        properties: [propertySchema],
        navigationProperties: [navigationPropertySchema],
        tags: [String],
        groups: [groupSchema]
    }, {_id: false, versionKey: false}
);

var modelSchema = mongoose.createSchema('data-modeler', {
    projectId: {type: String, validate: idValidator, require: true}, // Project id
    version: {type: Number, default: 1},                             //
    layout: {type: String, default: 'U'},                            // UI
    catalog: {type: String, validate: idValidator},    // technical
    entities: [entitySchema]
});

modelSchema.set('autoIndex', false);
modelSchema.index({projectId: 1, version: 1}, {unique: true});

var Model;
function getModel() {
    return Model;
}

function createModel() {
    var logger = commonServer.logging.createLogger('model-service');
    logger.debug('Creating model');

    if (!Model) {
        Model = mongoose.createModel(constant.MODEL_NAME, modelSchema);
    }

    return { Model: Model };
}

function createIndexes(done) {
    var logger = commonServer.logging.createLogger('model-service');
    logger.debug('Checking model indexes');
    Model.ensureIndexes();
    Model.on('index', function (err) {
        if (err) {
            logger.error(err, 'Failed to create indexes for Model collection');
            done(err);
        }
        else {
            logger.debug('Model collection indexes verified');
            done();
        }
    });
}

module.exports.create = createModel;
module.exports.createIndexes = createIndexes;
module.exports.getModel = getModel;
module.exports.ODATA_IDENTIFIER = ODATA_IDENTIFIER;
