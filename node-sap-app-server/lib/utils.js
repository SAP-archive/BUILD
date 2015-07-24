'use strict';

function toInt(num) {
    if (num) {
        num = parseInt(num, 10);
        if (!isNaN(num)) {
            return num;
        }
    }
    return undefined;
}

function setupWorker(defaultDebugPort) {
    var k, n, debugRegExp, match, wid = toInt(process.env.NORMAN_WORKER_ID);
    if (wid === undefined) {
        return undefined;
    }
    debugRegExp = /^(--debug|--debug-brk)(=\d+)?$/;
    for (k = 0, n = process.execArgv.length; k < n; ++k) {
        match = process.execArgv[k].match(debugRegExp);
        if (match) {
            break;
        }
    }
    if (!match) {
        process.debugPort = defaultDebugPort + wid;
    }
    return wid;
}

function getSettings(defaultDebugPort) {
    var k, n, match, debugArg, debugPort, execArgv = [];
    var debugRegExp = /^(--debug|--debug-brk)(=\d+)?$/;
    for (k = 0, n = process.execArgv.length; k < n; ++k) {
        match = process.execArgv[k].match(debugRegExp);
        if (match) {
            debugArg = match[1];
            debugPort = toInt(match[2]) || defaultDebugPort;
        }
        else {
            execArgv.push(process.execArgv[k]);
        }
    }

    return {
        debugArg: debugArg,
        debugPort: debugPort,
        execArgv: execArgv
    };
}

module.exports = {
    setupWorker: setupWorker,
    toInt: toInt,
    getSettings: getSettings
};
