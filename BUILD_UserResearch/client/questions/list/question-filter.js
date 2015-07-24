'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = function () {
    return function (listItems) {
        return _.sortBy(_.uniq(listItems, 'ordinal'), ['ordinal'], [true]);
    };
};
