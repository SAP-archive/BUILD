'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Configuration = require('./Configuration');

function ConfigurationManager() {
    EventEmitter.call(this);
    this.config = new Configuration({});
}

util.inherits(ConfigurationManager, EventEmitter);
module.exports = ConfigurationManager;

ConfigurationManager.prototype.get = function (section) {
    var sectionConfig;

    if (section) {
        sectionConfig = (this.config && this.config[section]);
    }
    else {
        sectionConfig = this.config;
    }

    return sectionConfig;
};

ConfigurationManager.prototype.initialize = function (conf) {
    this.config = new Configuration(conf);
    this.emit('configure');
    return this.config;
};

ConfigurationManager.Configuration = Configuration;
