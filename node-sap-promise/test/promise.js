require("./helper/clear-promise.js")();

process.env.SAP_PROMISES = 1;
process.env.SAP_PROMISES_LOCAL = 1;
module.exports = require("../index.js");

