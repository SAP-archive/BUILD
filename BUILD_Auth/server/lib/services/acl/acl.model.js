'use strict';
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;

var AclSchema = mongoose.createSchema('auth', {
    _id: mongoose.Schema.Types.ObjectId,
    _bucketname: String,
    key: String
});

var AclModel;

AclSchema.set('autoIndex', false);
AclSchema.index({_bucketname: 1, key: 1}, { unique: true});

function createIndexes(done) {
    var logger = commonServer.logging.createLogger('acl-service');
    logger.debug('Checking ACL model indexes');
    if (!AclModel) {
        AclModel = mongoose.createModel('Acl', AclSchema, 'authACLresources');
    }

    AclModel.ensureIndexes();
    AclModel.on('index', function (err) {
        if (err) {
            logger.error(err, 'Failed to create indexes for ACL collection');
            done(err);
        }
        else {
            logger.debug('ACL collection indexes verified');
            done();
        }
    });
}

module.exports = {
    createIndexes: createIndexes
};
