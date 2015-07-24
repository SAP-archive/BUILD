'use strict';

function Request(json) {
    this.acceptJson = json;
}

Request.prototype.accepts = function (type) {
    if (type === 'json') {
        return this.acceptJson;
    }
    return true;
};

module.exports = Request;
