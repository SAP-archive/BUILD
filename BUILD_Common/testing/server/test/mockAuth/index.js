var api = require('./api');
var service = require('./service');

module.exports = {
    getHandlers: function () {
        return api.getHandlers();
    },
    api: api,
    service: service
};
