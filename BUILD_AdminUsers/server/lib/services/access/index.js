'use strict';
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('user-access-service');
var accessService;
var defaultDomainId;

var SCOPES = {
    ACCESS: 'access',
    STUDY: 'study',
    PROJECT: 'project'
};

function AdminAccessService() {
}

module.exports = AdminAccessService;

AdminAccessService.prototype.initialize = function (done) {
    if (done && typeof done === 'function') {
        done();
    }
};

AdminAccessService.prototype.onInitialized = function (done) {
    accessService = commonServer.registry.getModule('AccessService');
    defaultDomainId = accessService.getDefaultDomainID();
    if (done && typeof done === 'function') {
        done();
    }
};

AdminAccessService.prototype.shutdown = function (done) {
    if (done && typeof done === 'function') {
        done();
    }
};

/**
 * Set a security policy
 * @param {object} securityPolicy
 * @param {object} context
 * @returns {object} securityPolicy
 */
AdminAccessService.prototype.setSecurityPolicy = function (securityPolicy, context) {
    serviceLogger.debug(securityPolicy, 'setSecurityPolicy');
    var rule = _formatToUpdate(securityPolicy);
    return accessService.getAccessById(rule._id).then(function (registeredRule) {
        if (!registeredRule) {
            accessService.create(rule, context)
                .then(function (data) {
                    serviceLogger.debug(data);
                })
                .catch(function (err) {
                    serviceLogger.error(err, 'Failed to create security access rule');
                    throw err;
                });
        }
        else {
            accessService.update(rule, context)
                .then(function (data) {
                    serviceLogger.debug(data);
                })
                .catch(function (err) {
                    serviceLogger.error(err, 'Failed to update security access rule');
                    throw err;
                });
        }
    }).catch(function (err) {
        serviceLogger.error(err, 'Failed to create/update security access rule');
        throw err;
    });

};

/**
 * Get security policies linked to a domain
 * @param {object} options
 * @returns {array} policies
 */
AdminAccessService.prototype.getSecurityPolicies = function (options) {
    serviceLogger.debug(options, 'getSecurityPolicies');
    options = options || {};
    // Filter on domains
    options.filter = {$in: [ /^@/i, defaultDomainId] };
    var policies = {nbSecurityPolicies: 0, defaultSecurityPolicy: {}, securityPolicy: []};
    return accessService.get(options)
        .then(function (rules) {
            policies.nbSecurityPolicies = rules.nbTotalRules;
            if (rules && rules.accessRules && Array.isArray(rules.accessRules)) {
                rules.accessRules.forEach(function (rule) {
                    if (rule._id && rule._id === defaultDomainId) {
                        policies.defaultSecurityPolicy = _formatToDisplay(rule);
                    }
                    else {
                        policies.securityPolicy.push(_formatToDisplay(rule));
                    }
                });
            }
            return policies;
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to get security access rules');
            throw err;
        });
};

/**
 * Delete a security policy
 * @param req
 * @param context
 * @returns {*}
 */
AdminAccessService.prototype.deleteSecurityPolicy = function (req, context) {
    serviceLogger.debug(req.params.domain, 'delete');
    var domain = (req.params) ? _formatID(req.params.domain) : '';
    return accessService.delete(domain, context).then(function (rule) {
        return rule;
    }).catch(function (err) {
        serviceLogger.error(err, 'Failed to delete security access rules');
        throw err;
    });
};

/**
 * Check domain as an Id
 * @param {string} domain
 * @returns string} domain
 * @private
 */
function _formatID(domain) {
    // TODO: input validation
    var regexpID = new RegExp(/^[@][\w.-]+/);
    var id = '';
    if (!domain) {
        return id;
    }
    if (domain === defaultDomainId) {
        return domain;
    }
    if (domain.indexOf('@') === -1) {
        id = '@' + domain;
    }
    else {
        id = domain;
    }
    if (!regexpID.test(domain)) {
        return '';
    }
    return id;
}

/**
 * Format a policy to a access rule
 * @param {{Domain: string, selfRegistration: string, studyInvitation: boolean, projectInvitation: string}} policy
 * @returns {{_id: string, scope: Array}}
 * @private
 */
function _formatToUpdate(policy) {
    // policy: {"selfRegistration":"standard","studyInvitation":"true","projectInvitation":"collaborator","Domain":"test.com"}
    // rule:{"_id":"test.com","scope":[{"name":"access","permissions":["standard"]},{"name":"study","permissions":["participant"]},{"name":"projects","permissions":["collaborator"]}]}
    var rule = {_id: '', scope: []};
    if (!policy) {
        return rule;
    }
    rule._id = _formatID(policy.Domain);
    if (policy.selfRegistration) {
        rule.scope.push({
            name: SCOPES.ACCESS,
            permissions: (policy.selfRegistration === 'standard' || policy.selfRegistration === 'guest') ? [policy.selfRegistration] : []
        });
    }
    else {
        rule.scope.push({
            name: SCOPES.ACCESS,
            permissions: []
        });
    }
    if (policy.studyInvitation === true) {
        rule.scope.push({
            name: SCOPES.STUDY,
            permissions: ['participant']
        });
    }
    else {
        rule.scope.push({
            name: SCOPES.STUDY,
            permissions: []
        });
    }
    if (policy.projectInvitation === 'collaborator') {
        rule.scope.push({
            name: SCOPES.PROJECT,
            permissions: ['collaborator']
        });
    }
    else {
        rule.scope.push({
            name: SCOPES.PROJECT,
            permissions: []
        });
    }
    return rule;
}

/**
 * Format a access rule to a policy
 * @param {{_id: string, scope: Array}} rule
 * @returns {{Domain: string, selfRegistration: string, studyInvitation: boolean, projectInvitation: string}}
 * @private
 */
function _formatToDisplay(rule) {
    // policy: {"selfRegistration":"standard","studyInvitation":"true","projectInvitation":"collaborator","Domain":"test.com"}
    // rule:{"_id":"test.com","scope":[{"name":"access","permissions":["standard"]},{"name":"study","permissions":["participant"]},{"name":"projects","permissions":["collaborator"]}]}
    var policy = {Domain: '', studyInvitation: false};
    if (!rule) {
        return policy;
    }
    if (rule._id) {
        policy.Domain = rule._id;
    }
    if (rule.scope && Array.isArray(rule.scope)) {
        rule.scope.forEach(function (scope) {
            switch (scope.name) {
                case SCOPES.ACCESS:
                    if (scope.permissions && scope.permissions.length > 0) {
                        policy.selfRegistration = scope.permissions[0];
                    }
                    break;
                case SCOPES.STUDY:
                    policy.studyInvitation = (scope.permissions && scope.permissions.length > 0);
                    break;
                case SCOPES.PROJECT:
                    if (scope.permissions && scope.permissions.length > 0) {
                        policy.projectInvitation = scope.permissions[0];
                    }
                    break;
            }
        });
    }
    return policy;
}






