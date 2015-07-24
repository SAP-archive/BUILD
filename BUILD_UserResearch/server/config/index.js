'use strict';

var dbName = (process.env.NODE_ENV === 'test' ? 'norman-user-research-test' : 'norman'),

    config = {
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 9000,
        ip: process.env.IP || '127.0.0.1',
        root: './',

        // MongoDB connection options
        mongo: {
            database: dbName,
            strategy: 'single',
            uri: 'mongodb://localhost/' + dbName,
            options: {
                db: { safe: true }
            }
        }
    };


module.exports = config;
