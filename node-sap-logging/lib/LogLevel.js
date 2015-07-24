"use strict";
var levelNames = [ "NONE", "FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE" ];
var levelValues = [ 1000, 60, 50, 40, 30, 20, 10 ];
var logLevel = {};

function initLevels() {
    var name, k, n = levelNames.length;
    for (k = 0; k < n; ++k) {
        name = levelNames[k];
        logLevel[name.toLowerCase()] = logLevel[name] = levelValues[k];
        logLevel[levelValues[k]] = name;
    }
    return logLevel;
}

module.exports = initLevels();
