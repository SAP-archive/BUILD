'use strict';

var m = require('moment');

// @ngInject
module.exports = function ($sce) {
    return function (myDate, text) {
        return $sce.trustAsHtml(m(myDate).format("DD MMMM") + '&nbsp;' + m(myDate).format("'YY") + '&nbsp;&nbsp;&nbsp;' + m(myDate).format("HH:mm"));
    };
};
