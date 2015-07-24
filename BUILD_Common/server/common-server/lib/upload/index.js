'use strict';

var tp  = require('norman-server-tp');
var singleton = tp['node-sap-common'].singleton;
var config = require('../config');
var logging = require('../logging');
var upload = tp['node-sap-upload'];

var FILE_UPLOAD_CONFIG = 'fileUploadConfig';

var serviceLogger = logging.createLogger('common-upload');
logging.addWatch(serviceLogger);
upload.setLogger(serviceLogger);

var fileUploadConfig = singleton.get(FILE_UPLOAD_CONFIG);

if (!fileUploadConfig) {

    fileUploadConfig = {};

    var init = function () {
        serviceLogger.info('FileUpload >> initialize()');

        fileUploadConfig.options = config.get('fileUpload');

        upload.setOptions(fileUploadConfig.options);
        serviceLogger.debug({scanOptions: fileUploadConfig.options}, 'scan options set');

        serviceLogger.info('<< initialize(), finished');
    };

    if (config.get('fileUpload')) {
        init();
    }

    config.on('configure', init);

    singleton.register(FILE_UPLOAD_CONFIG, fileUploadConfig);
}


upload.setOptions(fileUploadConfig.options);

module.exports = upload;
