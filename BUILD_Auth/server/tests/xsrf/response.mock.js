'use strict';

function Response() {
    this.statusValue = 200;
}

Response.prototype.setHeader = function (name, value) {
    this.xsrfHeader = value;
};

Response.prototype.cookie = function (name, value, options) {
    this.xsrfCookie = value;
    this.xsrfCookieOptions = options;
};

Response.prototype.status = function (value) {
    this.statusValue = value;
    return {
      end: function () {

      },
      json: function () {

      }
    };
};

module.exports = Response;
