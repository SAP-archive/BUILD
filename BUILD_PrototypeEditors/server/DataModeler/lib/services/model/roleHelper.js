'use strict';

var CLONE_PROPERTIES = [ 'id', 'path', 'propertyId' ];

exports.add = function (context) {
    var newRole = { };

    CLONE_PROPERTIES.forEach(function (property) {
        if (context.newRole[property] !== undefined) {
            newRole[property] = context.newRole[property];
        }
    });

    context.role = context.group.roles.create(newRole);

    context.group.roles.push(context.role);

    return context;
};

exports.update = function (context) {

    CLONE_PROPERTIES.forEach(function (property) {
        context.role[property] = context.updatedRole[property];
    });

    return context;
};
