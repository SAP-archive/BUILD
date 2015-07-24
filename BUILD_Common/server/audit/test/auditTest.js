var expect = require("chai").expect;
var commonServer = require("norman-common-server");
var commonDb = commonServer.db;
var audit = require("./audit");

var connectionConfig = {
    hosts: "localhost",
    database: "norman-test-audit",
    "options": {
        "db": {
            "w": 1
        },
        "server": {
            "poolSize": 1,
            "socketOptions": {
                "keepAlive": 1
            }
        }
    }
};

function testPassed(done) {
    return function () {
        done();
    }
}
function testFailed(done) {
    return function (err) {
        done(err);
    }
}



describe("Audit", function () {
    this.timeout(3000000);
    before(function (done) {
        commonDb.connection.initialize(connectionConfig)
            .then(function () {
                return audit.initialize(done);
            })
            .catch(function (err) {
                done(err);
            });
    });

    after(function (done) {
        commonDb.connection.disconnect(done);
    });
    describe("service", function () {
        it("should be exposed through Norman registry", function () {
            var auditService = commonServer.registry.getModule("AuditService");
            expect(auditService).to.exist();
        });
    });
    describe("logEvent", function () {
        it ("should support create API", function (done) {

            var auditService = commonServer.registry.getModule("AuditService");
            var context = {
                ip: "10.176.26.228",
                user: {
                    _id: "54e4aa5272d2cd74274e92d7",
                    name: "Smith"
                }
            };
            auditService.logEvent("Authentication", "failed login", "user failed to connect", { emailToken: "152558acZZCEZeez" }, context)
               .then(testPassed(done), testFailed(done));
        });
    });
    describe("logSystemEvent", function () {
        it ("should support logSystemEvent API", function (done) {

            var auditService = commonServer.registry.getModule("AuditService");
            auditService.logSystemEvent("AuditTest", "System Event", "Testing logSystemEvent", { emailToken: "152558acZZCEZeez" } )
               .then(testPassed(done), testFailed(done));
        });
    });
    describe("findAuditEvents", function () {
        it ("should support findAuditEvents API", function (done) {
            var auditService = commonServer.registry.getModule("AuditService");
           var options = {criteria:{},result:{sort:"", limit:""}};
            auditService.findAuditEvents(options).exec().then(testPassed(done), testFailed(done));
        });
    });
});