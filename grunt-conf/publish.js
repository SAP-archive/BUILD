module.exports = {
    main: {
        options: {
            registry: 'http://build-npm.mo.sap.corp:8080/',
            ignore: ['node_modules','client/node_modules','server/node_modules']
        },
        src: [
            '.'
        ]
    }
};
