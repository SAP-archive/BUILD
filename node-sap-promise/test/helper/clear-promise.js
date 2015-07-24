module.exports = function () {
    var scripts = [ "../../lib/enhance.js", "../../lib/promise.js", "../../index.js" ];
    scripts.forEach(function (script) {
        var scriptPath = require.resolve(script);
        delete require.cache[scriptPath];
    });
    delete process.env.SAP_PROMISES;
    delete process.env.SAP_PROMISES_LOCAL;
};
