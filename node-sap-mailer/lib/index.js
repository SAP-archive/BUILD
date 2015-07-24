'use strict';

var nodemailer = require('nodemailer');
var Promise = require('node-sap-promise');
var handlebars = require('handlebars');
var defaultConfig = require('./config.js');
var fs = require('fs');

var transporter,
    mailConfig = defaultConfig.mail,
    sender = defaultConfig.mail.sender,
    serviceLogger = {
        info: function () {
        },
        error: function () {
        },
        debug: function () {
        }
    };

function Mailer() {
    Object.defineProperty(this, 'sender', {
        get: function () {
            return sender;
        },
        set: function (value) {
            sender = value;
        }
    });
}

Mailer.prototype.setMailConfig = function (config) {
    serviceLogger.info('Mailer >> initialize()');

    mailConfig = config;
    if (mailConfig && mailConfig.sender) {
        sender = mailConfig.sender;
    }

    serviceLogger.info('<< initialize(), finished');
};

Mailer.prototype.configure = function (options) {
    transporter = nodemailer.createTransport(options);
};

Mailer.prototype.send = function (mailOptions, cbError, cbInfo) {
    if (!transporter) {
        transporter = nodemailer.createTransport(mailConfig.smtp);
    }

    transporter.sendMail(mailOptions, function (error, info) {
        return error ? cbError(error) : cbInfo(info);
    });
};

/**
* Render a email template and return a promise.
*
* @param  {string} template_name A email template name
* @param  {object} template_data Some email data to be populated
* @return {promise}
*/
Mailer.prototype.render = function (template_name, template_data) {

    return Promise.invoke(fs.readFile, template_name, {encoding:'utf-8'})
        .then(function (data) {
            var template = handlebars.compile(data);
            return template(template_data);
    });
};


module.exports = new Mailer();

module.exports.setLogger = function (logger) {
    serviceLogger = logger;
};

module.exports.getLogger = function () {
    return serviceLogger;
};

