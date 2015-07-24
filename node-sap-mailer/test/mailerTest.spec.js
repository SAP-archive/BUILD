'use strict';

var expect = require('chai').expect;
var mailer = require('../index.js');
var messages = [];
var logger = {
    info: function (message) {
        messages.push(message);
    },
};

var config = {
    sender: 'do.not.reply2@example.com',
    smtp: {
        host: 'mail.example.com',
        port: 252,
        debug: true,
        tls: {
            rejectUnauthorized: false
        }
    }
};

describe('Mailer: basic test', function () {
    it('run', function (done) {
        expect(mailer).to.be.a('object');
        done();
    });

    it('get/set sender', function (done) {
        var sender = 'do.not.reply@test.com';
        mailer.sender = sender;

        expect(mailer.sender).to.equal(sender);

        done();
    });

    it('setLogger', function (done) {
        expect(mailer.setLogger).to.be.a('function');
        expect(mailer.getLogger).to.be.a('function');

        mailer.setLogger(undefined);

        expect(mailer.getLogger()).to.deep.equal(undefined);

        mailer.setLogger(logger);
        expect(mailer.getLogger()).to.deep.equal(logger);
        done();
    });

    it('setMailConfig', function (done) {
        expect(mailer.setMailConfig).to.be.a('function');
        mailer.setMailConfig(config);

        expect(mailer.sender).to.deep.equal(config.sender);
        expect(messages).to.include.members(['Mailer >> initialize()', '<< initialize(), finished']);

        done();
    });

    it('configure', function (done) {
        expect(mailer.configure).to.be.a('function');
        mailer.configure(config.smtp);

        done();
    });
});
