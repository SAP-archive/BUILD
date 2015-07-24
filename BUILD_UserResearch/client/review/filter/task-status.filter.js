'use strict';


// @ngInject
module.exports = function () {
    return function (text) {
        if (text === 'completed correctly') {
            return 'Success';
        }
        if (text === 'completed incorrectly') {
            return 'Fail';
        }
        if (text === 'aborted') {
            return 'Abandon';
        }
    };
};
