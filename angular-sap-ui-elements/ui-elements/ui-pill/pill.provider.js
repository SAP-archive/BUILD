'use strict';

var _ = require('lodash');

// @ngInject
module.exports = function() {

    function Pill() {

        var color = {
            'wine': ['pdf'],
            'red': ['pptx', 'ppt', 'pot', 'pps', 'pptx', 'pptm', 'potx', 'potm', 'ppam', 'ppsx', 'ppsm', 'sldx', 'sldm'],
            'green': ['xls', 'xlsx', 'xlsm', 'xlsb', 'xltx', 'xltm', 'xlt', 'xml'],
            'blue': ['doc', 'docx', 'docm', 'dotx', 'dotm', 'docb'],
            'orange': ['txt', 'text', 'csv']
        };

        var _getColor = function(extension) {
            var type = 'gray';
            _.forEach(color, function(element, key) {
                if (element.indexOf(extension) !== -1) {
                    type = key;
                    return false;
                }
            });
            return type;
        };

        this.getColor = function(text) {
            return _getColor(text);
        };
    }

    this.$get = function() {
        return new Pill();
    };
};
