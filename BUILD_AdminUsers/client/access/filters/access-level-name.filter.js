'use strict';

// @ngInject
module.exports = function (ADMIN_ACCESS_CONSTANT) {
    return function (accessLevel) {
        var result;
        switch (accessLevel) {
           case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_0:
               result = 'No Access';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_1:
                result = 'Study invitation only';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_2:
                result = 'Study or Project Invitation only';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_3:
                result = 'Guest with Study invitation';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_4:
                result = 'Guest with Study or Project Invitation';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_5:
                result = 'Full Access';
                break;
        }
        return result;
    };
};
