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
            'client/assets/norman-user-research-client.svg': 'client/assets/norman-user-research-client.svg'
        }
    }
}
