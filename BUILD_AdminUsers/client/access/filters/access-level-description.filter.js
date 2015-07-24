'use strict';

// @ngInject
module.exports = function (ADMIN_ACCESS_CONSTANT) {
    return function (accessLevel) {
        var result;
        switch (accessLevel) {
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_0:
                result = 'No access to BUILD.';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_1:
                result = 'User can’t login to BUILD. Access is only permitted via Study invitation.';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_2:
                result = 'User can’t login to BUILD. Access is only permitted via Study and Project invitations.';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_3:
                result = 'User can login to BUILD with Guest rights. Participation to Study via invitation.';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_4:
                result = 'User can login to BUILD with Guest rights. Participation to Study and Project via invitations.';
                break;
            case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_5:
                result = 'User can login to BUILD with full access rights.';
                break;
        }
        return result;
    };
};
