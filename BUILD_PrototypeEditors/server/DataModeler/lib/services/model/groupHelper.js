'use strict';

var roleHelper = require('./roleHelper.js');
var entityHelper = require('./entityHelper.js');
var modelHelper = require('./modelHelper.js');
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var lodash = require('norman-server-tp').lodash;

var STANDARD_GROUP = {
    Person: ['fullName', 'givenName', 'middleName', 'familyName', 'prefix', 'suffix', 'nickName', 'photo', 'gender', 'title', 'birthday'],
    Address: ['street', 'city', 'region', 'zipCode', 'country', 'poBox', 'extension'],
    Overview: ['description', 'title', 'image', 'mainInfo', 'secondaryInfo'],
    DataSeries: ['dimension1', 'dimension2', 'dimension3', 'data1', 'data2', 'data3'],
    ValueWithUnit: ['value', 'unit'],
    RoleInOrganization: ['role', 'orgName', 'orgUnit'],
    AmountWithCurrency: ['amount', 'currency']
};

exports.STANDARD_GROUP = STANDARD_GROUP;

exports.getStandardGroups = function () {
    return Object.keys(STANDARD_GROUP);
};

exports.add = function (context) {
    var newGroup = { type: context.newGroup.type };

    newGroup.name = modelHelper.forceUniquenessForName(context.entity.groups, context.newGroup, context.newGroup.type);

    if (!STANDARD_GROUP.hasOwnProperty(newGroup.type)) {
        throw new NormanError('No type found: ' + newGroup.type, 404);
    }

    newGroup._id = commonServer.utils.shardkey();

    context.group = context.entity.groups.create(newGroup);

    if (context.newGroup.roles && context.newGroup.roles.length > 0) {
        context.newGroup.roles.forEach(function (role) {
            context.newRole = role;
            roleHelper.add(context);
        });
    }
    else {
        STANDARD_GROUP[newGroup.type].forEach(function (role) {
            context.newRole = { id: role };
            var lowerRole = role.toLowerCase();
            var property = lodash.find(context.entity.properties, function (prop) {
                return prop.name.toLowerCase() === lowerRole;
            });

            if (property) {
                context.newRole.path = property.name;
                context.newRole.propertyId = property._id;
            }

            roleHelper.add(context);
        });
    }

    context.entity.groups.push(context.group);

    return context;
};

exports.getGroup = function (context) {
    return entityHelper.getEntity(context)
        .then(function (theContext) {
            context.group = lodash.find(theContext.entity.groups, {_id: context.groupId});

            if (!context.group) {
                throw new NormanError('No group found with id: ' + context.groupId, 404);
            }

            return theContext;
        });
};

exports.update = function (context) {
    if (context.group.type !== context.updatedGroup.type) {
        throw new NormanError('We can\'t change type for group', 400);
    }
    else {
        context.group.name = context.updatedGroup.name || context.updatedGroup.type;

        context.updatedGroup.roles.forEach(function (updatedRole) {
            context.role = lodash.find(context.group.roles, {id: updatedRole.id});
            context.updatedRole = updatedRole;

            roleHelper.update(context);
        });
    }

    return context;
};

exports.remove = function (context) {

    context.group.remove();

    return context;
};
