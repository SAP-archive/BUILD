'use strict';

var fs = require('fs');
var path = require('path');

var ResourceBundle = require('./ResourceBundle');

function ResourceManager(name, baseDir) {
    this.name = name;
    this.baseDir = baseDir;
    this.bundles = {};
    this.initialized = this.loadResourceBundle();
}
module.exports = ResourceManager;

ResourceManager.prototype.isLoaded = function (lang) {
    return !!this.bundles[lang];
};

ResourceManager.prototype.getBundleFilename = function (lang) {
    var fileName = this.name;
    if (lang) {
        fileName += '_' + lang;
    }
    fileName += '.json';
    return fileName;
};

ResourceManager.prototype.getResourceBundle = function (lang) {
    var bundle, fallback;
    bundle = this.bundles[lang];
    if (!bundle) {
        // Oops, bundle has not been loaded. Let's trigger bundle loading for future requests and fallback to parent language
        this.loadResourceBundle(lang);
        fallback = lang;
        while(!bundle && fallback) {
            fallback = ResourceManager.getFallback(fallback);
            bundle = this.bundles[fallback];
        }
    }
    return bundle;
};

ResourceManager.prototype.setResourceBundle = function (lang, bundle) {
    if (!bundle || (typeof bundle.getText !== 'function')) {
        throw new TypeError('Invalid resource bundle');
    }
    this.bundles[lang] = bundle;
};

function loadResourceFile(file) {
    return Promise.invoke(fs.readFile, file, { encoding: 'utf-8' }).then(function (data) {
        return JSON.parse(data);
    }, function (err) {
        // Handle situation where file does not exist
        if (err.code === 'ENOENT') {
            return null;
        }
        // log error and disregard file
        return null;
    });
}

ResourceManager.prototype.loadResourceBundle = function (lang) {
    var file, loadedBundle, self = this;
    lang = lang || '';
    loadedBundle = this.bundles[lang];
    if (loadedBundle) {
        return Promise.resolve(loadedBundle);
    }

    file = path.join(this.baseDir, this.getBundleFilename(lang));
    return loadResourceFile(file).then(function (resources) {
        var bundle, fallback;
        if (resources || (!lang)) {
            bundle = new ResourceBundle(lang, resources);
        }
        if (lang) {
            fallback = ResourceManager.getFallback(lang);
            return self.loadResourceBundle(fallback).then(function (parent) {
                if (bundle) {
                    bundle.parent = parent;
                }
                else {
                    bundle = parent;
                }
                self.bundles[lang] = bundle;
                return bundle;
            });
        }
        else {
            self.bundles[''] = bundle;
            return bundle;
        }
    });
};

ResourceManager.getFallback = function (lang) {
    var fallback, pos = lang.lastIndexOf('-');
    if (pos === -1) {
        fallback = '';
    }
    else {
        fallback = lang.substring(0, pos);
    }
    return fallback;
};
