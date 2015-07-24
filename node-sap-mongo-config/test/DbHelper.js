'use strict';
var mongodb = require('mongodb');
require('node-sap-promise');

function DbHelper(db) {
    this.db = db;
}
module.exports = DbHelper;

DbHelper.connect = function (url) {
    var options = {
        db: { w: 1 },
        server: {
            poolSize: 2,
            socketOptions: { keepAlive: 1 }
        }
    };
    return Promise.invoke(mongodb.MongoClient.connect, url, options)
        .then(function (db) {
            return new DbHelper(db);
        });
};

DbHelper.prototype.close = function () {
    if (this.db) {
        return Promise.invoke(this.db, 'close');
    }
    return Promise.resolve(false);
};

DbHelper.prototype.select = function (collectionName, key) {
    return Promise.invoke(this.db, 'collection', collectionName)
        .then(function (collection) {
            return Promise.invoke(collection, 'findOne', {_id: key});
        });
};

DbHelper.prototype.upsert = function (collectionName, key, value) {
    return Promise.invoke(this.db, 'collection', collectionName)
        .then(function (collection) {
            var update = {
                $set: {value: value}
            };
            var options = {
                upsert: true,
                new: false  // return old version of document for audit
            };
            return Promise.invoke(collection, 'findAndModify', {_id: key}, [['_id', 1]], update, options);
        });
};

DbHelper.prototype.delete = function (collectionName, key) {
    return Promise.invoke(this.db, 'collection', collectionName)
        .then(function (collection) {
            return Promise.invoke(collection, 'findAndRemove', {_id: key}, [['_id', 1]]);
        });
};

DbHelper.prototype.dropCollection = function (collectionName) {
    return Promise.invoke(this.db, 'dropCollection', collectionName);
};

DbHelper.prototype.dropDatabase = function () {
    return Promise.invoke(this.db, 'dropDatabase');
};
