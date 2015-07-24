'use strict';
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var serviceLogger = commonServer.logging.createLogger('appMetadata-model');
var Schema = mongoose.Schema;

var appMetadata;

var Page = new Schema({
    id: {type: Schema.Types.ObjectId, ref: 'pageMetadata'},
    type: String, // page, popup, ....
    name: String,
    displayName: String,
    routePattern: String,
    pageUrl: String,
    thumbnailUrl: String,
    coordinates: {
        x: {type: Number, default: -1},
        y: {type: Number, default: -1}
    }
});

var Navigation = new Schema({
    routeName: {type: String},
    sourcePageId: {type: String},
    targetPageId: {type: String},
    target: {type: String, default: 'pages'},
    pageFrom: {type: String},
    pageTo: {type: String}
});

var App = mongoose.createSchema('appMetadata', {
    catalogId: String, // the catalog from which the prototype has been created
    defaultPageName: String,
    appType: {type: String, default: 'App'}, // whether it is a TopDown or BottomUp app
    isSmartApp: {type: Boolean, default: false},
    uiLang: {type: String, default: 'UI5'},
    pages: [Page],
    navigations: [Navigation]
});

App.set('autoIndex', false);

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking appMetadata model indexes');
    appMetadata.ensureIndexes();
    done();
}

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy appMetadata model');
    appMetadata = undefined;
    done();
}

function createModel() {
    if (!appMetadata) {
        appMetadata = mongoose.createModel('appMetadata', App);
    }
    return {
        appMetadata: appMetadata
    };
}


module.exports = {
    create: createModel,
    createIndexes: createIndexes,
    destroy: destroy
};
