'use strict';
var DummyService = require('./DummyService.js');

var fooService = new DummyService('Foo');
var barService = new DummyService('Bar', true);

var services = [ fooService, barService ];

module.exports = {
    fooService: fooService,
    barService: barService
};

module.exports.getInnerServices = function () {
    return services;
};
