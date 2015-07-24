"use strict";
var PromiseClass = global.Promise;

// Polyfill approach for core Promise implementation
if ((typeof PromiseClass !== "function") || process.env.SAP_PROMISES) {
    PromiseClass = require("./lib/promise.js");
    if (!process.env.SAP_PROMISES_LOCAL) {
        global.Promise = PromiseClass;
    }
}

// Promise API extensions
require("./lib/enhance.js")(PromiseClass);

module.exports = PromiseClass;
