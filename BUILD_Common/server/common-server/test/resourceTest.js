var path = require("path");
var expect = require("chai").expect;
var commonServer = require("./common-server");
var resource = commonServer.resource;

var resourceDir = path.join(__dirname, "resources");

function testPassed(done) {
    return function () {
        done();
    }
}
function testFailed(done) {
    return function (err) {
        done(err || new Error("Test failed"));
    }
}

describe("ResourceBundle", function () {
    describe("getText", function () {
        it("should return existing test resources", function () {
            var bundle = new resource.ResourceBundle("en", { foo: "bar" });
            expect(bundle.getText("foo")).to.equal("bar");
        });

        it("should fallback to its parent for missing resources", function () {
            var bundle = new resource.ResourceBundle("en", { foo: "bar" });
            var childBundle = new resource.ResourceBundle("en-US", {}, bundle);
            expect(childBundle.getText("foo")).to.equal("bar");
            expect(childBundle.getText("unknown")).to.be.undefined;
        });
    });
});

describe("ResourceManager", function () {
    describe("constructor", function () {
        it("should load default resources", function (done) {
            var rm = new resource.ResourceManager("test", resourceDir);
            expect(rm.bundles[""]).to.be.undefined;
            rm.initialized.then(function () {
                expect(rm.bundles[""]).to.be.instanceof(resource.ResourceBundle);
            }).then(testPassed(done), testFailed(done));
        });
    });

    describe("loadResourceBundle", function () {
        var rm = new resource.ResourceManager("test", resourceDir);
        it("should load a resource bundle", function (done) {
            rm.loadResourceBundle("en").then(function (bundle) {
                expect(bundle).to.be.instanceOf(resource.ResourceBundle);
                expect(rm.isLoaded("en")).to.be.true;
                expect(bundle.lang).to.equal("en");
                expect(bundle.getText("NORMAN_MAGIC")).to.equal("Norman magic is good for you!");
            }).then(testPassed(done), testFailed(done));
        });
        it("should fallback to parent language", function (done) {
            rm.loadResourceBundle("fr-FR").then(function (bundle) {
                expect(bundle).to.be.instanceOf(resource.ResourceBundle);
                expect(rm.isLoaded("fr-FR")).to.be.true;
                expect(rm.isLoaded("fr")).to.be.true;
                expect(bundle.lang).to.equal("fr");
                expect(bundle.getText("NORMAN_MAGIC")).to.equal("La magie Norman c'est bon mangez-en !");
            }).then(testPassed(done), testFailed(done));
        });
    });
});
