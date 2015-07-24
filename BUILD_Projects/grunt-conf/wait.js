'use strict';
module.exports = {

    dev: {
        options: {
            delay: 15000
        },
        pause: {
            options: {
                before: function (options) {
                    console.log('pausing %dms', options.delay);
                },
                after: function () {
                    console.log('pause end');
                }
            }
        }
    },
    report: {
        options: {
            delay: 5000
        },
        pause: {
            options: {
                before: function (options) {
                    console.log('pausing %dms', options.delay);
                },
                after: function () {
                    console.log('pause end');
                }
            }
        }
    }

};
