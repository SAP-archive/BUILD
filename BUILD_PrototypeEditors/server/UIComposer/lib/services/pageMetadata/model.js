'use strict';
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var pageMetadata;
var serviceLogger = commonServer.logging.createLogger('pageMetadata-model');
var Schema = mongoose.Schema;

var BindingPath = new Schema({
    entityId: String,
    propertyId: String
});

var ControlProperty = new Schema({
    name: String,
    value: String,
    type: String,
    binding: {
        entityId: String,
        propertyId: String,
        paths: [BindingPath],
        isRelative: Boolean,
        isValue: Boolean   // whether the 'value' property is an actual binding value
        // Additional properties might be added in the future for formatters
    }
});

var ControlGroup = new Schema({
    groupId: String,
    children: [String], // assume that the first child is the template in case of bindings,?
    binding: {
        paths: [BindingPath],
        isRelative: Boolean,
        sortOptions: [],
        filterOptions: [],
        ordering: String
        // Additional properties might be added in the future for factory
    }
});

var KeyValue = new Schema({
    key: String,
    value: String
});

var ControlEvent = new Schema({
    eventId: String,
    actionId: String, // to be searched in the root catalog
    params: [KeyValue]
});

var Control = new Schema({
    controlId: String,
    parentControlId: String,
    catalogId: String, // custom catalog id of reference
    catalogControlName: String, // the control in the custom catalog
    parentGroupId: String,
    parentGroupIndex: Number,
    properties: [ControlProperty],
    designProperties: [ControlProperty],
    floorplanProperties: [ControlProperty],
    groups: [ControlGroup],
    events: [ControlEvent]
});

var Page = mongoose.createSchema('pageMetadata', {
    name: String,
    floorplan: {type: String, default: 'ABSOLUTE'},
    pageType: String, // For UxRules Checks, maybe the same as floorplan or @ upper level
    mainEntity: String,
    rootControlId: String,
    controls: [Control]
});

Page.set('autoIndex', false);

function createModel() {
    if (!pageMetadata) {
        pageMetadata = mongoose.createModel('pageMetadata', Page);
    }
    return {
        pageMetadata: pageMetadata
    };
}

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking pageMetadata model indexes');
    pageMetadata.ensureIndexes();
    done();
}

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy pageMetadata model');
    pageMetadata = undefined;
    done();
}

module.exports = {
    create: createModel,
    createIndexes: createIndexes,
    destroy: destroy
};

