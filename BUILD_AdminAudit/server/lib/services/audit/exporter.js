'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var Promise = require('norman-promise');

// All the properties that will be exported in the CSV
var properties = ['date', 'category', 'event', 'user', 'ipAddress', 'username', 'description', 'details'];
var EOL = '\n';

// Return the string representation of the date
function getString(data) {
    if (data === undefined) {
        return '';
    }
    // To avoid errors when writing dates
    if (data instanceof Date) {
        return data.toISOString();
    }
    if (data instanceof Object) {
        return JSON.stringify(data);
    }

    return data;
}

// get the headers for the export
function getHeader(oOptions) {
    var sHeader = '';

    // Headers
    for (var i = 0; i < properties.length; i++) {
        sHeader += properties[i] + oOptions.output.delimiter;
    }

    return sHeader + EOL;
}

// process the result set of the query
function processResults(oOptions, aResultSet) {
    var sRows = null;

    if (aResultSet.length > 0) {
        sRows = '';
        for (var i = 0; i < aResultSet.length; i++) {
            var oAuditItem = aResultSet[i];
            for (var j = 0; j < properties.length - 1; j++) {
                sRows += getString(oAuditItem[properties[j]]) + oOptions.output.delimiter;
            }
            sRows += getString(oAuditItem[properties[properties.length - 1]]) + EOL;
        }
    }

    return sRows;
}

// Write the headers
function getAuditLogs(oOptions, callback) {
    var auditService = commonServer.registry.getModule('AuditService');
    var query = auditService.findAuditEvents(oOptions);
    var promise = query.exec();
    promise.addBack(function (err, aResultSet) {
        if (err) {
            throw new NormanError('query of audit logs', err);
        }
        var sRows = processResults(oOptions, aResultSet);
        callback(sRows);
    });
    return '';
}

/**
 * Export the audit logs
 * @param oOptions the exporter options
 * @returns {Promise}
 */
exports.exportLogs = function (oOptions) {

    return new Promise(function (resolve, reject) {
        try {
            getAuditLogs(oOptions, function (rows) {
                if (rows) {
                    var header = getHeader(oOptions);
                    resolve(header + rows);
                }
                else {
                    resolve(null);
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
