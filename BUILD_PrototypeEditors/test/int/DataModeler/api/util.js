'use strict';

var chai = require('norman-testing-tp').chai;
var expect = chai.expect;

var path = require('path');
var fs = require('fs');

function getXmlFile(fileName, callBack) {
    fs.readFile(path.resolve(__dirname, '../server/material/' + fileName + '.xml'), 'utf8', callBack);
}

function getModel(fileName, callBack) {
    fs.readFile(path.resolve(__dirname, '../server/material/' + fileName + '.json'), 'utf8', callBack);
}

function compare(source, de) {
    Object.keys(source).forEach(function (key) {
        if (typeof source[key] === 'object') {
            if (Array.isArray(source[key])) {
                source[key].forEach(function (element, index) {
                    compare(element, de[key][index]);
                });

            }
            else {
                compare(source[key], de[key]);

            }
        }
        //skip compare of foreign key names
        else if (!de[key].indexOf || de[key].indexOf('___FK_') !== 0) {
            expect(source[key]).equal(de[key], 'Key: ' + key + ', source: ' + source[key] + ', destination: ' + de[key] + ', for name:' + JSON.stringify(de));
        }
    });
}


module.exports.getXmlFile = getXmlFile;
module.exports.getModel = getModel;
module.exports.compare = compare;