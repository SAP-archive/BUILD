'use strict';

var mongoose = require('norman-common-server').db.mongoose;
var config = require('../../../config/environment/development');
var Grid;
var gridSchema = mongoose.createSchema(config.mongo.db, {}, {
    strict: false
});

gridSchema.set('autoIndex', false);

/**
 * createModel andler for creating grid model
 * @return {Object}
 */
function createModel() {
    if (!Grid) {
        Grid = mongoose.createModel('UICatalogGrid', gridSchema, 'library.files');
    }
    return Grid;
}

function createIndexes(done) {
    Grid.ensureIndexes();
    done();
}

function destroy(done) {
    Grid = undefined;
    done();
}

module.exports = {
    create: createModel,
    createIndexes: createIndexes,
    destroy: destroy
};
