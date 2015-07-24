var path = require("path");
var expect = require("chai").expect;

var commonServer = require("./common-server");
var singleton = commonServer.singleton;
var globalConfig = commonServer.config;

var simpleConfig = {
    "section": {
        "foo": "bar"
    }
};
var complexConfig = {
    firstSection: {
        foo: "bar"
    },
    secondSection: "test-config-section.json"
};

describe("Configuration", function () {

    it("should yield an empty configuration if not initialized", function () {
        var config = globalConfig.get();
        expect(config).to.be.an("object");
        expect(Object.keys(config).length).to.equal(1);
        expect(config.cwd).to.equal(process.cwd());
    });

    it("should support initialization with an object", function () {
        var config = globalConfig.initialize(simpleConfig);
        expect(config.section.foo).to.equal("bar");
    });

    it("should create a singleton config", function () {
        var config = globalConfig.initialize(simpleConfig);
        var singletonConfig = singleton.get("config");
        expect(singletonConfig).to.be.an("object");
        expect(singletonConfig.get()).to.equal(config);
    });

    it("should support initialization with a filename", function () {
        var config = globalConfig.initialize(path.join(__dirname, "test-config.json"));
        expect(config.firstSection.foo).to.equal("bar");
        expect(config.secondSection.prop).to.equal("value");
    });

    it ("should emit a configure event", function (done) {
        var notified = false;
        globalConfig.on('configure', function () {
            notified = true;
        });
        globalConfig.initialize(simpleConfig);
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

