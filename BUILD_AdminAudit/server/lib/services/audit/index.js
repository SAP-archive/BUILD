'use strict';
var Promise = require('norman-promise');
var Exporter = require('./exporter.js');


// The configuration of the export
var oExportOptions = {
    // Search criteria for the mongodb find() method
    criteria: {
    },
    // Options of the output file
    output: {
        format: 'csv',
        name: 'Audit_log',
        extension: '.csv',
        delimiter: ';'
    },
    // Operations on the mongodb results set (sort, limit ...)
    result: {
        // By default, sort by most recent date
        sort: '-date',
        limit: ''
    }
};


function getDateString(oDate) {
    var d = oDate.getDate();
    var m = oDate.getMonth() + 1;
    var y = oDate.getFullYear();
    return '' + y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
}

// Parse the date given by the user
function setDateCriteria(startDate, endDate) {
    if (startDate && endDate) {
        oExportOptions.criteria.date = {};
        oExportOptions.criteria.date.$gte = startDate;
        oExportOptions.criteria.date.$lt = endDate;
    }
}

// Parse the date given by the user
function getFileName(startDate, endDate) {

    var filename = oExportOptions.output.name;
    if (startDate && endDate) {
        filename += '_' + getDateString(startDate);
        filename += '_' + getDateString(endDate);
    }

    return filename + oExportOptions.output.extension;
}

function AuditAdminService() {
}
module.exports = AuditAdminService;

AuditAdminService.prototype.initialize = function (done) {
    done();
};

AuditAdminService.prototype.onInitialized = function () {
};

AuditAdminService.prototype.shutdown = function (done) {
    done();
};

AuditAdminService.prototype.getAudit = function (startDate, endDate) {
    return new Promise(function (resolve, reject) {
        try {
            setDateCriteria(startDate, endDate);
            var filename = getFileName(startDate, endDate);
            Exporter.exportLogs(oExportOptions).then(function (sExportData) {
                resolve({filename: filename, data: sExportData});
            });
        }
        catch (err) {
            reject(err);
        }
    });
};


