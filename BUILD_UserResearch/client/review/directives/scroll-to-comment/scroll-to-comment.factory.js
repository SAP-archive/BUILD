'use strict';

// @ngInject
module.exports = function () {
    return {
        events: [],

        addUpdateEvent: function (func, element) {
            this.events.push({
                fctl: func,
                elt: element
            });
        },

        scrollToComment: function (args, evt) {
            this.events.forEach(function (obj) {
                if (evt.currentTarget.id === obj.elt[0].id) {
                    obj.fctl.call(args, obj.elt);
                }
            });
        }
    };
};
