var commonServer = require("norman-common-server");
var auditServer = require("norman-audit-server");
var commonDb = commonServer.db;

module.exports = {
    // Search audits on the given criteria and export them to a file
    // Close the connection when it's done
    log: function (options, exporter, callback) {
        var that = this;

        // The init might fail if the output name is illegal or if the file is already opened
        if (!exporter.init(options.output)) {
            callback("Error: could not write in " + options.output.name
                        + ". Make sure the name is correct and that the file isn\"t opened elsewhere.");
        } else {
            var auditService = commonServer.registry.getModule("AuditService");
            var stream = auditService.findAuditEvents(options).stream();

            // Tell the exporter to write its remaining buffer and close the mongodb connection
            stream.on("close", function () {
                exporter.end();
                that.close();
                callback();
            });

            // Feed all entries to the exporter
            stream.on("data", function (doc) {
                exporter.append(doc);
            });
        }
    },

    // Start the mongodb connection
    connect: function (options, callback) {
        var connectionConfig = {
            hosts: options.host,
            database: options.db,
            username: options.user,
            password: options.pwd,
            "options": {
                "db": {
                    "w": 0
                }
            }
        };

    commonDb.connection.initialize(connectionConfig)
        .then(function () {
            auditServer.initialize(callback);
        })
        .catch(function (err) {
            callback(err);
        });
    },

    // Close the mongodb connection
    close: function() {
        commonDb.connection.disconnect();
    }
};
