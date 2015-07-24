'use strict';
var service = require('../services/catalog');
var path = require('path');
var fs = require('fs');
var cnt = 0;
/**
 * checkForData handler for creating predefined template data
 * @return {Object}
 */
var checkForData = function(total, cb) {
    return function(err, data) {
        if (err === null) {
            data = JSON.parse(data);
            service.updateCatalog(data).then(
                function(result) {
                    cnt++;
                    if (cnt === total)
                        cb(result);
                },
                function(err) {
                    cb(err);
                }
            ).catch(function(err) {
                cb(err);
            });
        } else {
            cb(err);
        }
    };
};

/**
 * createPredefinedTemplate handler for creating predefined template data
 * @return {Object}
 */
function initializeDb(callback) {
    console.log('intializing db');
    // array of predefined catalogs to be loaded
    // var filePathArray = ['../api/catalog/sampleTemplate/sampleTemplate.json', '../api/catalog/sampleTemplate/sampleAngularTemplate.json', '../api/catalog/sampleTemplate/sampleHtmlTemplate.json'];
    var filePathArray = ['../api/catalog/sampleTemplate/sampleTemplate.json'];
    var filePath = '';
    for (var count = 0; count < filePathArray.length; count++) {
        filePath = filePathArray[count];
        filePath = path.join(__dirname, filePath);
        fs.readFile(filePath, 'utf8', checkForData(filePathArray.length, callback));
    }
}

module.exports = initializeDb;
