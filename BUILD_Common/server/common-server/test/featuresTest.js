var path = require('path');
var expect = require('chai').expect;
var commonServer = require('./common-server');
var utils = commonServer.utils;
var globalConfig = commonServer.config;
var configFile = require('./resources/features.json');
var registry = commonServer.registry;
var features = commonServer.features;

describe('features: should operate as normal when no features list has been loaded', function () {

    it('should return an empty list as no file was loaded into global config', function (done) {
        var userId = utils.shardkey();
        expect(userId.length).to.eq(24);

        var result = features.getFeatureList(userId);
        expect(result).to.be.empty;

        result = features.getFeatureList({});
        expect(result).to.be.empty;

        done();
    });

    it('should return true for all services as config was not loaded', function (done) {
        var userId = utils.shardkey();
        expect(userId.length).to.eq(24);

        expect(features.isEnabled('makeup-name', userId)).to.eq(false);
        expect(features.isEnabled('composer', userId)).to.eq(false);
        expect(features.isEnabled('Composer', userId)).to.eq(false);
        expect(features.isEnabled('assets', userId)).to.eq(false);
        done();
    });
});

describe('features: load and validate features feature list based on loaded config', function () {

    before('Initialize config file', function (done) {
        // this will trigger an event in the features service which will update the config
        globalConfig.initialize(configFile);
        done();
    });

    it('should return a list of features that are enabled/disabled', function (done) {
        var userId = utils.shardkey();
        expect(userId.length).to.eq(24);

        // Test with ID
        var result = features.getFeatureList(userId);
        expect(result).not.to.be.empty;
        expect(result.history.enabled).to.eq(false);
        expect(result.prototype.enabled).to.eq(false);
        expect(result.composer.enabled).to.eq(false);
        expect(result.team.enabled).to.eq(true);

        // Test with no ID
        result = features.getFeatureList({});
        expect(result).not.to.be.empty;
        expect(result.history.enabled).to.eq(false);
        expect(result.prototype.enabled).to.eq(false);
        expect(result.composer.enabled).to.eq(false);
        expect(result.team.enabled).to.eq(true);

        done();
    });

    it('should return true|false if service is enabled or not', function (done) {
        var userId = utils.shardkey();
        expect(userId.length).to.eq(24);

        // test with ID
        expect(features.isEnabled('makeup-name', userId)).to.eq(false);
        expect(features.isEnabled('composer', userId)).to.eq(false);
        expect(features.isEnabled('Composer', userId)).to.eq(false);
        expect(features.isEnabled('assets', userId)).to.eq(true);

        // Test with no ID
        expect(features.isEnabled('makeup-name')).to.eq(false);
        expect(features.isEnabled('composer')).to.eq(false);
        expect(features.isEnabled('Composer')).to.eq(false);
        expect(features.isEnabled('assets')).to.eq(true);

        done();
    });

    it('should return an error if params are incorrect', function () {
        var userId = utils.shardkey();
        expect(userId.length).to.eq(24);

        expect(function () {
            features.isEnabled({}, userId);
        }).to.throw(Error);
    });
});
