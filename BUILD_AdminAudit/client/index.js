'use strict';

// Use Application configuration module to register a new module
module.exports = angular.module('audit', ['shell', 'ui.router'])
    .config(function ($stateProvider) {
        $stateProvider.state('console.audit', {
            url: '/audit',
            templateUrl: './resources/norman-admin-audit-client/audit/audit.html',
            controller: 'AdminAuditCtrl'
        });
    })
    .controller('AdminAuditCtrl', require('./audit/audit.controller.js'))
    .factory('AuditAdminService', require('./services/audit.service.js'))
    .run(function (AsideFactory, HomeDashboardFactory, NavBarService) {
        NavBarService.updateHeading('Admin Console');
        AsideFactory.push({
            state: 'console.audit',
            priority: 5,
            name: 'Audit',
            isPersistant: true
        });
    });
