'use strict';

var tp  = require('norman-server-tp');
var singleton = tp['node-sap-common'].singleton;
var config = require('../config');
var logging = require('../logging');

var MAILER = 'mailer';

var serviceLogger = logging.createLogger('common-mailer');
logging.addWatch(serviceLogger);

var mailer = singleton.get(MAILER);
if (!mailer) {

    mailer = tp['node-sap-mailer'];
    mailer.setLogger(serviceLogger);

    var init = function () {
        serviceLogger.info('Mailer >> initialize()');
        var options = config.get('mail');
        if (options) {
            serviceLogger.debug({mailerOptions: options}, 'mailer options set');
            mailer.setMailConfig(options);
        }
        serviceLogger.info('<< initialize(), finished');
    };

    //first time init
    init();

    //Manage configuration change
    config.on('configure', init);

    singleton.register(MAILER, mailer);
}

module.exports = mailer;
