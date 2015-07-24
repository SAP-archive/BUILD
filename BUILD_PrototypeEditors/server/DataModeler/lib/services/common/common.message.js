'use strict';

module.exports.success = {};

module.exports.error = {
    SWE100: 'Please check the name. Names may not contain more than 40 characters or be Excel reserved names (such as "C" or "R").\nThe first character of a name must be alphabetic or “_”\nThe next characters of a name must be alphanumeric or “_”',
    SWE101: 'Please check the name. Names may not contain more than 128 characters.\nThe first character of a name must be alphabetic or “_”\nThe next characters of a name must be alphanumeric or “_”',
    SWE1001: 'This property is referenced by property {{PROPERTY_NAME}} of object {{OBJECT_NAME}} and cannot be deleted.\nIf you want to delete this property you need to change the formula first.',
    SWE1002: 'This navigation is referenced by property {{PROPERTY_NAME}} of object {{OBJECT_NAME}} and cannot be deleted.\nIf you want to delete this navigation you need to change the formula first.',
    SWE1003: 'This entity is referenced by property {{PROPERTY_NAME}} of object {{OBJECT_NAME}} and cannot be deleted.\nIf you want to delete this entity you need to change the formula first.'
};
