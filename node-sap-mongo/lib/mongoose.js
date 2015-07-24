'use strict';

var util = require('util');
var mongoose = require('mongoose');
var db = require('./dbInit');

var Schema = mongoose.Schema;

mongoose.createSchema = function (connectionName, schemaDefinition, options) {
    var schema = new Schema(schemaDefinition, options);
    schema.connectionName = connectionName;
    return schema;
};


mongoose.createModel = function (name, schema, collection, options) {
    var modelConnection = db.connection.getMongooseConnection(schema.connectionName);
    var modelOptions = util._extend({connection: modelConnection}, options);
    return this.model(name, schema, collection, modelOptions);
};

module.exports = mongoose;
