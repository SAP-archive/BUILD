'use strict';

// @ngInject
module.exports = function () {
    return function (input) {
        if (!input || !input.length) return '';

        var initialsArray = input.match(/\b(\w)/g);
        var initials = '';

        // If the user has both a first and last name, show two initials, otherwise show 1
        if(input.indexOf(' ') > -1) {
            initials = initialsArray[0] + initialsArray[initialsArray.length - 1];
        } else {
            initials = initialsArray[0];
        }

        return initials.toUpperCase();
    };

};
