'use strict';

var baseUrl = '/api/admin/audit/', defaultParams = {}, option = {};

// url for export
var actions = {
    getAudit: {
        method: 'GET',
        url: baseUrl + '/:startdate/:enddate',
        params: {
            startdate: '@startdate',
            enddate: '@enddate'
        }
    }
};

function auditService($resource) {
    return $resource(baseUrl, defaultParams, actions, option);
}

module.exports = ['$resource', auditService];
