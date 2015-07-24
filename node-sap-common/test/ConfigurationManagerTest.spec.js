'use strict';

var path = require('path');
var expect = require('chai').expect;
var common = require('../index.js');

var simpleConfig = {
    section: {
        foo: 'bar'
    }
};

describe('Configuration', function () {
    it('run', function () {
        expect(common.ConfigurationManager).to.be.a('function');
    });

    it('should yield an empty configuration if not initialized', function () {
        var configMgr = new common.ConfigurationManager();
        var config = configMgr.get();
        expect(config).to.be.an('object');
        expect(Object.keys(config).length).to.equal(1);
        expect(config.cwd).to.equal(process.cwd());
    });

    it('should yield an bad configuration if there is am error', function () {
        var configMgr = new common.ConfigurationManager();
        try {
            configMgr.initialize(1);
        }
        catch(error) {
            expect(error.toString()).to.equal('TypeError: Invalid configuration');
        }
    });

    it('should support initialization with an object', function () {
        var configMgr = new common.ConfigurationManager();
        var config = configMgr.initialize(simpleConfig);
        expect(config.section.foo).to.equal('bar');
        var section = configMgr.get('section');
        expect(section.foo).to.equal('bar');
    });

    it('should support initialization with a filename', function () {
        var configMgr = new common.ConfigurationManager();
        var config = configMgr.initialize(path.join(__dirname, 'test-config.json'));
        expect(config.firstSection.foo).to.equal('bar');
        expect(config.secondSection.prop).to.equal('value');
    });

    it('should emit a configure event', function (done) {
        var configMgr = new common.ConfigurationManager();
        var notified = false;
        configMgr.on('configure', function () {
            notified = true;
        });
        configMgr.initialize(simpleConfig);
        setTimeout(function () {
            if (notified) {
                done();
            }
            else {
                done(new Error('configure event not received'));
            }
        }, 50);
    });
});
