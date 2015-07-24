var path = require('path');
var fs = require('fs');
var util = require('util');
var https = require('https');
var domain = require('domain');

var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('connector');

var configFile = path.join(__dirname, 'config.json');
var config = require(configFile);
var server;

var serverCert = {
    cert: loadFile(config.http.tls.cert),
    key: loadFile(config.http.tls.key)
};

function loadFile(filename) {
    var filePath = path.resolve(__dirname, filename);
    return fs.readFileSync(filePath);
}

function getUserCert() {
    var username = (process.argv.length > 2 ? process.argv[2] : config.user.default);
    var userBase = path.join(__dirname, config.user.dir, username);
    var cert = fs.readFileSync(userBase + '.cer', { encoding: 'utf-8' });
    var cert = cert.replace('-----BEGIN CERTIFICATE-----', '');
    var cert = cert.replace('-----END CERTIFICATE-----', '');
    var cert = cert.replace(/\r|\n/g, '');
    return cert;
}

function getHttpsAgent() {
    var options = util._extend({}, serverCert);
    if (config.target.ca) {
        options.ca = loadFile(config.target.ca);
    }
    options.rejectUnauthorized = false;
    return new https.Agent(options);
}

function getTlsOptions() {
    var options = util._extend({}, serverCert);
    if (config.http.tls.ca) {
        options.ca = loadFile(config.http.tls.ca);
    }
    return options;
}

function start() {
    var tlsOptions = getTlsOptions();
    var agent = getHttpsAgent();
    var certHeader = config.user.header || 'ssl_client_cert';
    var userCert = getUserCert();

    function handleRequest(req, res) {
        var headers = util._extend({}, req.headers);
        headers[certHeader] = userCert;
        var options = {
            hostname: config.target.hostname,
            port: config.target.port,
            path: req.url,
            method: req.method,
            headers: headers,
            agent: agent
        };
        var tsStart = Date.now();
        var request = https.request(options, function (response) {
            var duration = Date.now() - tsStart;
            logger.debug(req.method + ' ' + req.url + ' ' + response.statusCode + ' - ' + duration + ' ms');
            res.statusCode = response.statusCode;
            res.statusMessage = response.statusMessage;
            Object.keys(response.headers).forEach(function (headerName) {
                res.setHeader(headerName, response.headers[headerName]);
            });
            response.pipe(res);
        });
        req.pipe(request);
    }

    server = https.createServer(tlsOptions, handleRequest);
    server.listen(config.http.port, config.http.hostname, function () {
        logger.info('Server listening on port ' + config.http.port);
    });
}

var mainDomain = domain.create();
mainDomain.on('error', function (err) {
    logger.error('Unhandled error ' + err.message);
    logger.error(err.stack);
    process.exit(1);
});
mainDomain.run(start);
