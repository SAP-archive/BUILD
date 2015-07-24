'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('context: basic test', function () {
    it('run', function () {
        expect(common.context).to.be.a('object');
    });

    it('Context', function () {
        var req = {ip: 'toto', protocol: 'p', host: 'host', method: 'method', url: 'url'};
        var newContext = new common.context.Context(req);
        expect(newContext).to.be.a('object');
        expect(newContext.ip).to.equal(req.ip);
        expect(newContext.request.ip).to.equal(req.ip);
        expect(newContext.request.protocol).to.equal(req.protocol);
        expect(newContext.request.method).to.equal(req.method);
        expect(newContext.request.url).to.equal(req.url);
    });

    it('init', function () {
        var req = {ip: 'toto', protocol: 'p', host: 'host', method: 'method', url: 'url'}, called = 0;
        expect(common.context.init).to.be.a('function');
        var fn = common.context.init();
        expect(fn).to.be.a('function');
        fn(req, null, function () {
            called++;
        });

        expect(req.context).to.be.a('object');
        expect(called).to.equal(1);
        expect(req.context.ip).to.equal(req.ip);
        expect(req.context.request.ip).to.equal(req.ip);
        expect(req.context.request.protocol).to.equal(req.protocol);
        expect(req.context.request.method).to.equal(req.method);
        expect(req.context.request.url).to.equal(req.url);
    });

    it('attachLoggedUser', function () {
        var req = {user: {_id: 'id', name: 'name'}}, called = 0;
        expect(common.context.attachLoggedUser).to.be.a('function');
        var fn = common.context.attachLoggedUser();
        expect(fn).to.be.a('function');
        var callBack = function () {
            called++;
        };
        fn(req, null, callBack);

        expect(req.context).to.be.a('object');
        expect(req.context.user).to.deep.equal({id: req.user._id, name: req.user.name});
        expect(called).to.equal(1);

        fn({}, null, callBack);
        expect(called).to.equal(2);
    });
});
