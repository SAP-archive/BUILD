var argsModule = require("./auditCli").arguments;
var assert = require("chai").assert;


describe("norman-audit-cli arguments", function () {
    describe("Mongodb connection string", function () {
        it("should have correct default values", function () {
            var args = "node index.js db".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.connection.host, "localhost");
            assert.equal(options.connection.port, "27017");
        });

        it("should recognize the database name", function () {
            var args = "node index.js norman".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.connection.db, "norman");
        });

        it("should parse the database name and the host", function () {
            var args = "node index.js myHost/norman".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.connection.db, "norman");
            assert.equal(options.connection.host, "myHost");
        });

        it("should parse the database name, the host and the port", function () {
            var args = "node index.js myHost:25000/norman".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.connection.db, "norman");
            assert.equal(options.connection.host, "myHost");
            assert.equal(options.connection.port, "25000");
        });
    });

    describe("Options parsing", function () {
        it("should detect a simple option", function () {
            var args = "node index.js norman --category=authentication".split(" ");
            var options = argsModule.parse(args);
            // String criteria are converted to regexp
            assert.equal(options.criteria.category.toString(), "/authentication/");
        });

        it("should detect connection options", function () {
            var args = "node index.js norman -u bob -p pwd123".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.connection.user, "bob");
            assert.equal(options.connection.pwd, "pwd123");
        });

        it("should detect multiple options", function () {
            var args = "node index.js norman -u david -p myPass --event=attack --username=user".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.connection.user, "david");
            assert.equal(options.connection.pwd, "myPass");
            assert.equal(options.criteria.event.toString(), "/attack/");
            assert.equal(options.criteria.username.toString(), "/user/");
        });

        it("should correctly parse regexp", function () {
            var args = "node index.js norman --event=[a-c]+.* --category=^A.{10}r$".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.criteria.event.toString(), "/[a-c]+.*/");
            assert.equal(options.criteria.category.toString(), "/^A.{10}r$/");
        });

        it("should correctly parse dates", function () {
            var args = "node index.js norman --date=2000-05-18".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.criteria.date.$gte.getDate(), 18);
            assert.equal(options.criteria.date.$gte.getMonth(), 4);
            assert.equal(options.criteria.date.$gte.getFullYear(), 2000);

            assert.equal(options.criteria.date.$lt.getDate(), 19);
            assert.equal(options.criteria.date.$lt.getMonth(), 4);
            assert.equal(options.criteria.date.$lt.getFullYear(), 2000);
        });

        it("should be able to sort and limit the result", function () {
            var args = "node index.js norman --limit=100 --sort=-event".split(" ");
            var options = argsModule.parse(args);
            assert.equal(options.result.limit, "100");
            assert.equal(options.result.sort, "-event");
        });
    });
});