var path = require('path');
var fs = require('fs');

exports.getSampleData = function(fileName){
    if (JSON && !JSON.dateParser) {
        var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

        JSON.dateParser = function (key, value) {
            if (typeof value === 'string') {
                if (reISO.exec(value)){
                    return new Date(value);
                }

                var a = reMsAjax.exec(value);
                if (a) {
                    var b = a[1].split(/[-+,.]/);
                    return new Date(b[0] ? +b[0] : 0 - +b[1]);
                }
            }
            return value;
        };

    }

    var json = require(path.resolve(__dirname, 'excelFiles/' + fileName + '.json'));
    return JSON.parse(JSON.stringify(json), JSON.dateParser);
};

exports.getModel = function(fileName){
    var json = exports.getSampleData(fileName);
    return JSON.parse(JSON.stringify(json), JSON.dateParser).model;
};

exports.getMetadata = function(fileName, callBack) {
    fs.readFile(path.resolve(__dirname, 'excelFiles/' + fileName + '.xml'), 'utf8', callBack);
};
