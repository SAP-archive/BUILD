'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var mailer = commonServer.Mailer;

var path = require('path');

module.exports.EmailTemplates = {
    EMAIL_CHANGE: {path: '../services/user/email_templates/email_changed_email.tpl', type: 'Email Verification', subject: 'Welcome to BUILD.'},
    PWD_CHANGE: {path: '../services/user/email_templates/password_changed_email.tpl', type: 'Password Changed', subject: 'Password Changed.'},
    PWD_RESET: {path: '../services/user/email_templates/password_reset_email.tpl', type: 'Password Reset', subject: 'Password Changed'},
    PWD_REQUEST: {path: '../services/user/email_templates/request_password_email.tpl', type: 'New Password Request', subject: 'Resetting the password.'},
    ACCOUNT_REGISTER: {path: '../services/user/email_templates/register_account_email.tpl', type: 'Email Verification', subject: 'Welcome to BUILD.'}
};


function onSendError(error, type) {
    mailer.getLogger().error(new NormanError('Unable to send mail ' + type, error));
}

function onSendSuccess(info) {
    mailer.getLogger().info('Mail sent', info);
}

function onSendFailure(error) {
    mailer.getLogger().error(new NormanError('Failed to send email', error));
}

function missingInfo(info) {
    mailer.getLogger().info('Missing information to send a mail', info);
}

module.exports.sendTemplatedEmail = function (templateInfo) {
    if (!templateInfo.template || !templateInfo.template.path) {
        missingInfo(templateInfo.template);
        return;
    }
    if (!templateInfo.data || !templateInfo.data.user || !templateInfo.data.user.email) {
        missingInfo(templateInfo.data);
        return;
    }
    var templateName = path.resolve(__dirname, templateInfo.template.path);
    mailer.render(templateName, templateInfo.data)
        .then(function (emailTemplate) {
            var mailOptions = {
                from: mailer.sender,
                to: templateInfo.data.user.email,
                html: emailTemplate,
                subject: templateInfo.template.subject
            };
            mailer.send(mailOptions,
                function cb(error) {
                    onSendError(error, templateInfo.template.type);
                },
                onSendSuccess);
        }).catch(onSendFailure);
};
