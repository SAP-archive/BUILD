'use strict';
var http = require('http');
var expect = require('chai').expect;
var express = require('../index.js').express;
var logger = require('./logger.js');

var server, proxiedServer;

function httpGet(queryOptions, done) {
    var body = '';
    var request = http.request(queryOptions, function (res) {
        if (res.statusCode !== 200) {
            done(new Error('HTTP error ' + res.statusCode));
        }
        else {
            res.setEncoding('utf-8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                done(null, body);
            });
        }
    });
    request.end();
}

function createServer(trustProxy) {
    var app = express();
    if (trustProxy) {
        app.enable('trust proxy');
    }
    app.get('/host', function (req, res) {
        res.json({
            host: req.host,
            hostname: req.hostname,
            protocol: req.protocol
        });
    });
    return http.createServer(app);
}

function getQuery(port, hostname) {
    if (typeof port === 'string') {
        hostname = port;
        port = undefined;
    }
    hostname = hostname || 'localhost';
    var query = {
        hostname: hostname,
        method: 'GET',
        path: '/host'
    };
    if (port) {
        query.port = port;
    }
    return query;
}

describe('Express enhancements', function () {
    before(function (done) {
        server = createServer();
        proxiedServer = createServer(true);
        proxiedServer.listen(9081, function () {
            logger.info('Proxied server listening on port 9080');
            server.listen(9080, function () {
                logger.info('Server listening on port 9081');
                done();
            });
        });
        proxiedServer.on('error', function (err) {
            done(err);
        });
        server.on('error', function (err) {
            done(err);
        });
    });

    after(function (done) {
        if (proxiedServer) {
            proxiedServer.close(function () {
                proxiedServer = null;
                if (!server) {
                    done();
                }
            });
        }
        if (server) {
            server.close(function () {
                server = null;
                if (!proxiedServer) {
                    done();
                }
            });
        }
    });

    it('should give access to host, hostname and protocol', function (done) {
        httpGet(getQuery(9080), function (err, body) {
            var response;
            if (err) {
                done(err);
            }
            else {
                logger.info('GET /host: ' + body);
                response = JSON.parse(body);
                expect(response.host).to.equal('localhost:9080');
                expect(response.hostname).to.equal('localhost');
                expect(response.protocol).to.equal('http');
                done();
            }
        });
    });

    it('should ignore X-Forwarded- headers by default', function (done) {
        var options = getQuery(9080);
        options.headers = {
            'X-Forwarded-Host': 'norman.mo.sap.corp:8443',
            'X-Forwarded-Proto': 'https'
        };
        httpGet(getQuery(9080), function (err, body) {
            var response;
            if (err) {
                done(err);
            }
            else {
                logger.info('GET /host: ' + body);
                response = JSON.parse(body);
                expect(response.host).to.equal('localhost:9080');
                expect(response.hostname).to.equal('localhost');
                expect(response.protocol).to.equal('http');
                done();
            }
        });
    });

    it('should ignore X-ProxyBaseUrl header by default', function (done) {
        var options = getQuery(9080);
        options.headers = {
            'X-ProxyBaseUrl': 'https://norman.mo.sap.corp:8443'
        };
        httpGet(getQuery(9080), function (err, body) {
            var response;
            if (err) {
                done(err);
            }
            else {
                logger.info('GET /host: ' + body);
                response = JSON.parse(body);
                expect(response.host).to.equal('localhost:9080');
                expect(response.hostname).to.equal('localhost');
                expect(response.protocol).to.equal('http');
                done();
            }
        });
    });

    it('should leverage X-Forwarded- headers in trusted proxy mode', function (done) {
        var options = getQuery(9081);
        options.headers = {
            'X-Forwarded-Host': 'norman.mo.sap.corp:8443',
            'X-Forwarded-Proto': 'https'
        };
        httpGet(options, function (err, body) {
            var response;
            if (err) {
                done(err);
            }
            else {
                logger.info('GET /host: ' + body);
                response = JSON.parse(body);
                expect(response.host).to.equal('norman.mo.sap.corp:8443');
                expect(response.hostname).to.equal('norman.mo.sap.corp');
                expect(response.protocol).to.equal('https');
                done();
            }
        });
    });

    it('should leverage X-ProxyBaseUrl header in trusted proxy mode', function (done) {
        var options = getQuery(9081);
        options.headers = {
            'X-ProxyBaseUrl': 'https://norman.mo.sap.corp:8443'
        };
        httpGet(options, function (err, body) {
            var response;
            if (err) {
                done(err);
            }
            else {
                logger.info('GET /host: ' + body);
                response = JSON.parse(body);
                expect(response.host).to.equal('norman.mo.sap.corp:8443');
                expect(response.hostname).to.equal('norman.mo.sap.corp');
                expect(response.protocol).to.equal('https');
                done();
            }
        });
    });
});


