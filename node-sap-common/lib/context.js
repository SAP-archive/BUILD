'use strict';

var requestId = 0;

function Context(request) {
    this.requestId = ++requestId;
    this.ip = request.ip;
    this.request = {
        ip: request.ip,
        protocol: request.protocol,
        host: request.host,
        method: request.method,
        url: request.url
    };
}

Context.init = function () {
    return function (request, response, next) {
        var context = new Context(request);
        request.context = context;
        return next();
    };
};

Context.attachLoggedUser = function () {
    return function (request, response, next) {
        if (request.user) {
            request.context = request.context || {};
            request.context.user = {id: request.user._id, name: request.user.name};
        }
        return next();
    };
};

module.exports = {
    Context: Context,
    init: Context.init,
    attachLoggedUser: Context.attachLoggedUser
};
