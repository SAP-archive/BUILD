var assert = require("chai").assert;
var commonServer = require("norman-common-server");
var mongo = require("./auditCli").mongo;
var exporter = require("./auditCli").exporter;
var fs = require('fs');

var options = {
    // Search criteria for the mongodb find() method
    criteria: {
    },
    // Options of the output file
    output: {
        format: "csv",
        name: "tt.csv",
        delimiter: ";"
    },
    // Operations on the mongodb results set (sort, limit ...)
    result: {
        sort: "",
        limit: ""
    }
};

describe("norman-audit-cli mongo", function () {
    this.timeout(3000000);

    before(function (done) {
        var options = {
            host: "localhost",
            db: "norman-test-audit"
        };
        mongo.connect(options, function () {
            done();
        });
    });

    after(function (done) {
        mongo.close();
        done();
    });

    it("should create a dump file", function (done) {
        mongo.log(options, exporter, function() {
            assert.equal(fs.existsSync(options.output.name), true);
            done();
        });
    });

    it("should not be empty", function (done) {
        var content = fs.readFileSync(options.output.name);
        assert.notEqual(content.toString(), 0);
        done();
    });

    it("should correctly be removed", function (done) {
        fs.unlink(options.output.name, function(err) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });
});