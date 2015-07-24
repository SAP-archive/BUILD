'use strict';

var appServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');

var path = require('path');
var config = path.join(__dirname, 'server.json');

var myServices = new appServer.ServiceContainer({});
myServices.addService('x509-test', function (app) {
    var logger = commonServer.logging.createLogger('x509.test');
    logger.info('Initializing X509 test service');
    var express = commonServer.tp.express;
    var router = new express.Router();
    router.get('/whoami', function (req, res) {
        logger.info('whoami called');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            auth: (req.context && req.context.auth),
            user: req.user
        }, null, 4));
    });
    app.use('/api', router);
}, {});



appServer.Server.start(config, myServices);
