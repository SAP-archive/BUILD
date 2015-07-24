'use strict';

var url = require('url');
var protoRegExp = /^(\w+):/;
var forwardedProtoRegExp = /^\s*(\w+)/;

var express = require('express');
Object.defineProperties(express.request, {
    proxyBaseUrl: {
        configurable: true,
        enumerable: true,
        get: function () {
            return this.headers['x-proxybaseurl'];
        }
    },
    proxyBaseHost: {
        configurable: true,
        enumerable: true,
        get: function () {
            var parsed, host, pbu = this.headers['x-proxybaseurl'];
            if (pbu) {
                parsed = url.parse(pbu);
                if (parsed.host) {
                    host = parsed.host;
                }
            }
            return host;
        }
    },
    proxyBaseProto: {
        configurable: true,
        enumerable: true,
        get: function () {
            var match, proto, pbu = this.headers['x-proxybaseurl'];
            if (pbu) {
                match = protoRegExp.exec(pbu);
                if (match) {
                    proto = match[1];
                }
            }
            return proto;
        }
    },
    forwardedProto: {
        configurable: true,
        enumerable: true,
        get: function () {
            var match, proto = this.headers['x-forwarded-proto'];
            if (proto) {
                match = forwardedProtoRegExp.exec(proto);
                if (match) {
                    proto = match[1];
                }
            }
            return proto;
        }
    },
    host: {
        configurable: true,
        enumerable: true,
        get: function () {
            var trust = this.app.get('trust proxy fn');
            var host = this.headers.host;
            if (trust(this.connection.remoteAddress)) {
                host = this.headers['x-forwarded-host'] || this.proxyBaseHost || host;
            }
            return host;
        }
    },
    hostname: {
        configurable: true,
        enumerable: true,
        get: function () {
            var host = this.host;
            var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0; // IPv6 literals cf RFC 2732 (e.g. [::1])
            var index = host.indexOf(':', offset);
            return (index !== -1 ? host.substring(0, index) : host);
        }
    },
    protocol: {
        configurable: true,
        enumerable: true,
        get: function () {
            var proto = this.connection.encrypted ? 'https' : 'http';
            var trust = this.app.get('trust proxy fn');
            if (trust(this.connection.remoteAddress)) {
                proto = this.forwardedProto || this.proxyBaseProto || proto;
            }
            return proto;
        }
    }
});

module.exports = express;
