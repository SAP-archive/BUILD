'use strict';

var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var path = require('path');
var mailer = commonServer.Mailer;

var hexadecimal = /^[0-9a-fA-F]+$/;

var serviceLogger = commonServer.logging.createLogger('project-common-service');

function ProjectCommonService() {
}

module.exports = ProjectCommonService;

// Possible causes
// 1. Project ID in URL is incorrect
// 2. params does not have the required field to complete the req
ProjectCommonService.prototype.requestErrorMsg = 'There is a problem with the request, missing required fields';

ProjectCommonService.prototype.initialize = function (done) {
    serviceLogger.info('>> initialize()');
    done();
};

ProjectCommonService.prototype.shutdown = function (done) {
    serviceLogger.info('>> shutdown()');
    done();
};

ProjectCommonService.prototype.onInitialized = function (done) {
    serviceLogger.info('>> onInitialized()');
    done();
};

// 200 - OK
// 201 - Created  # Response to successful POST
// 204 - No content
// 302 - Found # Temporary redirect such as to /login
// 303 - See Other # Redirect back to page after successful login
// 304 - Not Modified
// 400 - Bad Request
// 401 - Unauthorized  # Not logged in
// 403 - Forbidden  # Accessing another user's resource
// 404 - Not Found
// 422 - The request was well-formed but was unable to be followed due to semantic errors
// 500 - Internal Server Error

ProjectCommonService.prototype.sendResponse = function (res, statusCode, jsonBody) {
    if (jsonBody) {
        res.status(statusCode || 200).json(jsonBody);
    }
    else {
        res.status(statusCode || 204).json();
    }
};

ProjectCommonService.prototype.sendError = function (res, err) {

    if (err.stack) {
        serviceLogger.error(err.stack);
    }

    // Handle mongo errors i.e. duplicate error
    if (err && err.name === 'MongoError') {
        // Well formed but unable to execute
        this.sendResponse(res, 422, {
            name: 'MongoError',
            errorCode: err.code
        });
    }
    else if (err instanceof Error) {
        // Not well formed, something was missing!
        this.sendResponse(res, 400, {
            error: err.message
        });
    }
    else {
        // Not something we are expecting
        this.sendResponse(res, 500, err);
    }
};

ProjectCommonService.prototype.isMongoId = function (str) {
    return hexadecimal.test(str) && str.length === 24;
};

ProjectCommonService.prototype.validateEmail = function (email) {
    var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regEx.test(email);
};

/**
 * Send an email invitation to project - its up to the calling method to handle error/success
 *
 * @param  {string} email   Email address to send the email
 * @param  {object} user    The user object who send the email
 * @param  {object} project The project to be invited to
 * @return {boolean}
 */
ProjectCommonService.prototype.sendInviteEmail = function (req, emails, user, project) {
    serviceLogger.info({
        emails: emails,
        user: user,
        project: project
    }, '>> sendInviteEmail()');

    return new Promise(function (resolve, reject) {
        mailer.render(path.resolve(__dirname, 'emails_template/' + 'invite_email.tpl'), {
            user: user,
            project: project,
            url: req.protocol + '://' + req.host
        })
            .then(function (emailTemplate) {
                var mailOptions = {
                    bcc: emails,
                    html: emailTemplate,
                    subject: '' + user.name + ' wants you to join a BUILD project!',
                    from: 'do.not.reply@example.com'
                };

                // Send email
                mailer.send(mailOptions, function (err) {
                    serviceLogger.error('<< sendInviteEmail, error found: ' + err);
                    reject(err);
                }, function () {
                    serviceLogger.info('<< sendInviteEmail(), mail sent successfully');
                    resolve(true);
                });
            })
            .catch(function (err) {
                serviceLogger.error('<< sendInviteEmail, error found loading template: ' + err);
                reject(err);
            });
    });
};

ProjectCommonService.prototype.isBoolean = function (str) {
    return str === 'true' || str === 'false';
};
