'use strict';
module.exports = {

    SampleDataManager: {
        src: [
            'node_modules/norman-prototype-editors-server/SampleDataManager/**/*.spec.js',
            'node_modules/norman-prototype-editors-test/int/SampleDataManager/server/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/server/SampleDataManager',
            root: './node_modules/norman-prototype-editors-server/SampleDataManager',
            reportFormats: ['lcov'],
            check: {
                lines: 0,
                statements: 0
            }
        }
    },
    Previewer: {
        src: [
            'node_modules/norman-prototype-editors-server/Previewer/**/*.spec.js',
            'node_modules/norman-prototype-editors-test/Previewer/int/server/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/server/Previewer',
            root: './node_modules/norman-prototype-editors-server/Previewer',
            reportFormats: ['lcov'],
            check: {
                lines: 0,
                statements: 0
            }
        }
    },

    PrototypeBuilder: {
        src: [
            'node_modules/norman-prototype-editors-server/PrototypeBuilder/**/*.spec.js',
            'node_modules/norman-prototype-editors-test/int/PrototypeBuilder/server/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/server/PrototypeBuilder',
            timeout: 5000,
            root: './node_modules/norman-prototype-editors-server/PrototypeBuilder',
            reportFormats: ['lcov'],
            check: {
                lines: 50,
                statements: 50
            }
        }
    },

    DataModeler: {
        src: [
            'node_modules/norman-prototype-editors-server/DataModeler/**/*.spec.js',
            'node_modules/norman-prototype-editors-test/int/DataModeler/server/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/server/DataModeler',
            root: './node_modules/norman-prototype-editors-server/DataModeler',
            reportFormats: ['lcov'],
            check: {
                lines: 20,
                statements: 20
            }
        }
    },

    UIComposer: {
        src: [
            'node_modules/norman-prototype-editors-server/UIComposer/**/*.spec.js'
            // TODO UIComposer team fix prototypeService.prototype.createDataDrivenPrototype 'node_modules/norman-prototype-editors-test/UIComposer/**/*.spec.js'
        ],

        options: {
            coverage: false,
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/server/UIComposer',
            root: './node_modules/norman-prototype-editors-server/UIComposer',
            reportFormats: ['lcov'],
            check: {
                lines: 20,
                statements: 20
            }
        }
    },

    UIComposer_int: {
        src: [
            'node_modules/norman-prototype-editors-test/int/UIComposer/**/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/integration/UIComposer_int',
            root: './node_modules/norman-prototype-editors-server/UIComposer',
            reportFormats: ['lcov'],
            check: {
                lines: 20,
                statements: 20
            }
        }
    },

    SharedWorkSpace: {
        src: [
            'node_modules/norman-prototype-editors-server/SharedWorkSpace/**/*.spec.js'
// TODO BY SharedWorkSpace team             'node_modules/norman-prototype-editors-test/SharedWorkSpace/**/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/server/SharedWorkSpace',
            root: './node_modules/norman-prototype-editors-server/SharedWorkSpace',
            reportFormats: ['lcov'],
            check: {
                lines: 0,
                statements: 0
            }
        }
    },

    SharedWorkSpace_int: {
        src: [
            'node_modules/norman-prototype-editors-test/int/SharedWorkSpace/**/*.spec.js'
        ], // a folder works nicely
        options: {
            reporter: 'mocha-jenkins-reporter',
            coverageFolder: 'reports/coverage/integration/SharedWorkSpace_int',
            root: './node_modules/norman-prototype-editors-server/SharedWorkSpace',
            reportFormats: ['lcov'],
            check: {
                lines: 20,
                statements: 20
            }
        }
    }

};
