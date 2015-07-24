'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;

/**
 * Catalog Schema
 */
var CatalogSchema = mongoose.createSchema('data-modeler', {
    _tenant_id: String,
    name: String,
    creationDatetime: Date,
    description: String,
    comment: String,
    odataServiceName: String,
    odataVersion: String,
    author: String,
    entities: [
        {
            name: String,
            nameSet: String,
            media: Boolean,
            isRoot: Boolean,
            creatable: Boolean,
            updatable: Boolean,
            deletable: Boolean,
            readable: Boolean,
            pageable: Boolean,
            addressable: Boolean,
            semantics: String,
            label: String,
            tags: [String],
            groups: [
                {
                    type: {type: String},
                    roles: [
                        {
                            id: String,
                            path: String
                        }
                    ]
                }
            ],
            properties: [
                {
                    name: String,
                    isKey: Boolean,
                    isNullable: Boolean,
                    isETag: Boolean,
                    default: String,
                    maxLength: Number,
                    precision: Number,
                    scale: Number,
                    tags: [String],
                    creatable: Boolean,
                    updatable: Boolean,
                    semantics: String,
                    unit: String,
                    'field-control': String,
                    label: String,
                    propertyType: String
                }
            ],
            navigationProperties: [
                {
                    name: String,
                    multiplicity: Boolean,
                    toEntity: String,
                    relationship: String,
                    relationshipSet: String,
                    FromRole: String,
                    ToRole: String,
                    creatable: Boolean,
                    updatable: Boolean,
                    deletable: Boolean,
                    referentialConstraints: [
                        {
                            roleName: String,
                            propertyRef: String
                        }
                    ]
                }
            ]
        }
    ],
    complexTypes: [
        {
            name: String,
            properties: [
                {
                    name: String,
                    creatable: Boolean,
                    updatable: Boolean,
                    propertyType: String,
                    isNullable: Boolean,
                    default: String,
                    maxLength: Number,
                    precision: Number,
                    scale: Number
                }
            ]
        }
    ],
    functions: [
        {
            name: String,
            isBound: Boolean,
            isComposable: Boolean,
            entitySetPath: String,
            httpMethod: String,
            parameters: [
                {
                    name: String,
                    mode: String,
                    propertyType: String,
                    maxLength: Number,
                    precision: Number,
                    scale: Number,
                    isNullable: Boolean,
                    srid: String
                }
            ],
            returnType: String
        }
    ],
    businessDomain: [
        {
            functionalDomain: String,
            businessLine: String
        }
    ]
});

CatalogSchema.set('autoIndex', false);      //index are created when starting server with --checkSchema
CatalogSchema.index({name: 1});

var Catalog;
function createModel() {
    var logger = commonServer.logging.createLogger('catalog-service');
    logger.debug('Creating model for business catalog');

    if (!Catalog) {
        Catalog = mongoose.createModel('catalog', CatalogSchema);
    }

    return { Catalog: Catalog };
}

function createIndexes(done) {
    var logger = commonServer.logging.createLogger('catalog-service');
    logger.debug('Checking model indexes');
    Catalog.ensureIndexes();
    Catalog.on('index', function (err) {
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
