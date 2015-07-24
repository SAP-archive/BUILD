'use strict';
/* eslint no-unused-vars:1 */
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var NodeAcl = require('acl');
var MongodbBackend = NodeAcl.mongodbBackend;
var serviceLogger = commonServer.logging.createLogger('acl-facade');
var auditService;

function NodeAclFacade() {
}

module.exports = NodeAclFacade;

NodeAclFacade.prototype.initialize = function () {
    serviceLogger.debug('initialize');
    if (!this.node_acl) {
        this.node_acl = new NodeAcl(new MongodbBackend(commonServer.db.connection.getMongooseConnection('auth').db, 'authACL', true));
    }
    auditService = registry.getModule('AuditService');
};

NodeAclFacade.prototype.allow = function (roles, resources, permissions, context, callback) {
    var legacy, auditData = {
        roles: roles,
        resources: resources,
        permissions: permissions
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }
    return Promise.invoke(this.node_acl, 'allow', roles, resources, permissions)
        .then(function () {
            serviceLogger.info({rolesConfig: auditData}, 'allow(), Adds the permissions to the roles');
            auditService.logEvent('Permission', 'Add permissions', 'Adds successfully the given permissions to the given roles over the given resources', {
                rolesConfig: auditData
            }, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to add the given permissions to the given roles over the given resources');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.allowEx = function (roles, context, callback) {
    var auditData = {
        roles: roles
    };
    return Promise.invoke(this.node_acl, 'allow', roles)
        .then(function () {
            serviceLogger.info({rolesConfig: auditData}, 'allow(), Adds the permissions to the roles');
            auditService.logEvent('Permission', 'Add permissions', 'Adds successfully the given permissions to the given roles over the given resources', {
                rolesConfig: auditData
            }, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to add the given permissions to the given roles over the given resources');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.removeAllow = function (roles, resources, permissions, context, callback) {
    var legacy, auditData = {
        roles: roles,
        resources: resources,
        permissions: permissions
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }
    return Promise.invoke(this.node_acl, 'removeAllow', roles, resources, permissions)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'removeAllow(), Remove the permissions from the roles');
            auditService.logEvent('Permission', 'Remove permissions', 'Remove successfully the given permissions from the given roles over the given resources', {
                rolesConfig: auditData
            }, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to remove the given permissions from the given roles over the given resources');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.userRoles = function (userId, callback) {
    serviceLogger.debug({userId: userId}, 'userRoles(), Return all the roles from a given user');
    return Promise.invoke(this.node_acl, 'userRoles', userId).callback(callback);
};

NodeAclFacade.prototype.addUserRoles = function (userId, roles, context, callback) {
    var legacy, auditData = {
        userId: userId,
        roles: roles
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }

    return Promise.invoke(this.node_acl, 'addUserRoles', userId, roles)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'addUserRoles(), grant roles to user');
            auditService.logEvent('Permission', 'Add user roles', 'Roles granted to user', auditData, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to grant roles to user');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.removeUserRoles = function (userId, roles, context, callback) {
    var legacy, auditData = {
        userId: userId,
        roles: roles
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }

    return Promise.invoke(this.node_acl, 'removeUserRoles', userId, roles)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'removeUserRoles(), revoke roles from user');
            auditService.logEvent('Permission', 'Remove user roles', 'Roles revoked from user', auditData, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to revoke roles from user');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.middleware = function (numPathComponents, userId, actions) {
    return this.node_acl.middleware(numPathComponents, userId, actions);
};

NodeAclFacade.prototype.allowedPermissions = function (userId, resources, callback) {
    serviceLogger.debug({userId: userId, resources: resources}, 'allowedPermissions(), Get all the permissions to access resources');
    return Promise.invoke(this.node_acl, 'allowedPermissions', userId, resources).callback(callback);
};

NodeAclFacade.prototype.isAllowed = function (userId, resource, permissions, callback) {
    serviceLogger.debug({userId: userId, resource: resource, permissions: permissions}, 'allowedPermissions(), Checks if the user is allowed to access the resource');
    return Promise.invoke(this.node_acl, 'isAllowed', userId, resource, permissions).callback(callback);
};

NodeAclFacade.prototype.hasRole = function (userId, roleName, callback) {
    serviceLogger.debug({userId: userId, roleName: roleName}, 'hasRole(), Checks whether user is in the role');
    return Promise.invoke(this.node_acl, 'hasRole', userId, roleName).callback(callback);
};

NodeAclFacade.prototype.roleUsers = function (roleName, callback) {
    serviceLogger.debug({roleName: roleName}, 'roleUsers(), Returns all users who has a given role');
    return Promise.invoke(this.node_acl, 'roleUsers', roleName).callback(callback);
};


NodeAclFacade.prototype.addRoleParents = function (role, parents, context, callback) {
    var legacy, auditData = {
        role: role,
        parents: parents
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }
    return Promise.invoke(this.node_acl, 'addRoleParents', role, parents)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'addRoleParents(), grant roles to role');
            auditService.logEvent('Permission', 'Add parent(s) to role', 'Roles granted to role', auditData, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to grant roles to role');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.removeRole = function (role, context, callback) {
    var legacy, auditData = {
        role: role
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }
    return Promise.invoke(this.node_acl, 'removeRole', role)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'removeRole(), delete role');
            auditService.logEvent('Permission', 'Delete role', 'Role deleted', auditData, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to delete role');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.removeResource = function (resource, context, callback) {
    var legacy, auditData = {
        resource: resource
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }
    return Promise.invoke(this.node_acl, 'removeResource', resource)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'removeResource(), remove resource from access control');
            auditService.logEvent('Permission', 'Remove resource', 'Resource removed from access control', auditData, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to remove resource from access control');
            throw err;
        })
        .callback(callback);
};


NodeAclFacade.prototype.removePermissions = function (role, resources, permissions, context, callback) {
    var legacy, auditData = {
        role: role,
        resources: resources,
        permissions: permissions
    };
    if ((typeof context === 'function') || (typeof callback === 'object')) {
        legacy = callback;
        callback = context;
        context = legacy;
    }
    return Promise.invoke(this.node_acl, 'removePermissions', role, resources, permissions)
        .then(function () {
            serviceLogger.debug({rolesConfig: auditData}, 'removePermissions(), revoke resource permissions from role');
            auditService.logEvent('Permission', 'Remove permissions', 'Resource permissions revoked from role', auditData, context);
        })
        .catch(function (err) {
            serviceLogger.error(err, {rolesConfig: auditData}, 'Failed to revoke resource permissions from role');
            throw err;
        })
        .callback(callback);
};

NodeAclFacade.prototype.areAnyRolesAllowed = function (roles, resource, permissions, callback) {
    serviceLogger.debug({roles: roles, resource: resource, permissions: permissions}, 'areAnyRolesAllowed(), Returns if any of the roles have the right permissions');
    return Promise.invoke(this.node_acl, 'areAnyRolesAllowed', roles, resource, permissions).callback(callback);
};

NodeAclFacade.prototype.whatResources = function (roles, permissions, callback) {
    serviceLogger.debug({roles: roles, permissions: permissions}, 'whatResources(), Returns for which resources a set of roles as some given permissions');
    return Promise.invoke(this.node_acl, 'whatResources', roles, permissions).callback(callback);
};
