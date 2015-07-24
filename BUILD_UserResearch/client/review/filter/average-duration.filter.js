'use strict';

var m = require('norman-client-tp').moment;
// @ngInject
module.exports = function ($sce) {
    return function (numberOfSeconds, text) {

        var avgText = '';

        if (text !== null && text !== '' && typeof text !== 'undefined') {
            avgText = '<small> ' + text + '</small>';
        }

        if (numberOfSeconds === null || numberOfSeconds === 0 || typeof numberOfSeconds === 'undefined') {
            return $sce.trustAsHtml('N/A' + avgText);
        }
        var hh = m.duration(numberOfSeconds, 'seconds').hours();
        var mm = m.duration(numberOfSeconds, 'seconds').minutes();
        var ss = m.duration(numberOfSeconds, 'seconds').seconds();

        var hour = hh ? hh + '<span class="normal">h</span> ' : '';
        var mins = mm ? mm + '<span class="normal">m</span> ' : '';
        var secs = ss ? ss + '<span class="normal">s</span> ' : '';

        return $sce.trustAsHtml(hour + mins + secs + avgText);
    };
};
