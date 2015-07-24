'use strict';
module.exports = {
    dev: {
        options: {
            plugins: [
                {
                    removeUselessStrokeAndFill: false,
                    removeTitle: true,
                    removeComments: true
                }
            ]
        },
        files: {
            'client/assets/norman-common-client.svg': 'client/assets/norman-common-client.svg'
        }
    }
}