'use strict';

// @ngInject
module.exports = function () {
    return function (domain) {
       return domain && domain.indexOf('@') === 0 ? domain.substring(1) : domain;
    };
};
