'use strict';
// @ngInject
module.exports = function () {
    var httpMessages = [],
        messageStack = [];
    var defaultMessage = {msg1 : 'An error occurred.', msg2 : 'Please fix that issue and if this error persists contact support.'};
    var defaults = {
        className          : 'error',
        dismissOnTimeout   : true,
        timeout            : 10000,
        dismissButton      : true,
        dismissButtonHtml  : '&times;',
        dismissOnClick     : true,
        compileContent     : false,
        horizontalPosition : 'center', // right, center, left
        verticalPosition   : 'top', // top, bottom,
        maxNumber          : 0
    };

    function Message(msg) {
        var id = Math.floor(Math.random() * 1000);
        while (httpMessages.indexOf(id) > -1) {
            id = Math.floor(Math.random() * 1000);
        }
        this.id = id;
        this.className = defaults.className;
        this.dismissOnTimeout = defaults.dismissOnTimeout;
        this.timeout = defaults.timeout;
        this.dismissButton = defaults.dismissButton;
        this.dismissButtonHtml = defaults.dismissButtonHtml;
        this.dismissOnClick = defaults.dismissOnClick;
        this.compileContent = defaults.compileContent;
        angular.extend(this, msg);
    };
    function isJson(str) {
        var isJson = false;
        var contentType = '';
        if (typeof str.headers === 'function') {
            contentType = str.headers("content-type");
            if (contentType.indexOf('application/json') > -1) {
                isJson = true;
            }
        }
        return isJson;
    };
    function isCommonError(obj) {
        if (typeof obj.error === 'object' && typeof obj.error.details === 'array' && obj.code && obj.message && obj.target) {
            return true;
        }
        return false;
    };
    function getCommonErrors(details) {
        var content = {};
        for (var key in details) {
            if (typeof details[key] === 'object') {
                content[key] = details[key];
            }
        }
        return content;
    };

    function getAgnosticErrors(errors) {
        var haveObj;
        var content = {};
        for (var key in errors) {
            if (typeof errors[key] === 'object') {
                if(lookForObjOneLevDown(errors[key])) {
                    return getAgnosticErrors(errors[key]);
                } else {
                    content[key] = errors[key];
                }
            }
            else {
                content[key] = errors[key];
            }
        }
        return content;
    };

    function lookForObjOneLevDown(errors) {
        var haveObj = false;
        for (var key in errors) {
            if (typeof errors[key] === 'object') {
                haveObj = true;
                break;
            }
        }
        return haveObj;
    };

    this.configure = function (config) {
        angular.extend(defaults, config);
    };
        this.$get = ['$rootScope', function ($rootScope) {
            return {
                settings     : defaults,
                httpMessages : httpMessages,
                dismiss      : function (id) {
                    if (id) {
                        for (var i = httpMessages.length - 1; i >= 0; i--) {
                            if (httpMessages[i].id === id) {
                                httpMessages.splice(i, 1);
                                messageStack.splice(messageStack.indexOf(id), 1);
                                return;
                            }
                        }
                    }
                    else {
                        while (httpMessages.length > 0) {
                            httpMessages.pop();
                        }
                        messageStack = [];
                    }
                },
                create       : function (err) {
                    var msg = {}, req = {};
                    if (defaults.maxNumber > 0 && messageStack.length >= defaults.maxNumber) {
                        this.dismiss(messageStack[0]);
                    }
                    // default error message for when none have been passed
                    if (!err) {
                        msg.content = defaultMessage;
                    } else {
                        if (typeof err === 'object') {
                            for (var key in err) {
                                if (typeof err[key] === 'object') {
                                    req = err[key];
                                } else {
                                    msg[key] = err[key];
                                }
                            }
                            var error;
                            if (req.status) {
                                if (req.data) {
                                    var jsonType = isJson(req);
                                    error = req.data;
                                    if (jsonType) {
                                        if (isCommonError(error)) {
                                            msg.title = {code : error.code, msg : error.message};
                                            msg.content = getCommonErrors(error.details);
                                        } else {
                                            msg.title = {status : req.status, statusText : req.statusText, msg : error.message};
                                            msg.content = getAgnosticErrors(error);
                                        }
                                    } else {
                                        if (!msg.title) {
                                            msg.title = {status : req.status, statusText : req.statusText, msg : error.message};
                                        }
                                        msg.content = getAgnosticErrors(error);
                                    }
                                } else {
                                    if (!err.title) {
                                        msg.title = defaultMessage;
                                    } else {
                                        msg.title = err.title;
                                    }
                                    if (msg.req) {
                                        msg.content = msg.req;
                                    }
                                }
                            } else {
                                if (!err.title) {
                                    msg.title = defaultMessage;
                                } else {
                                    msg.title = err.title;
                                }
                                if (msg.req) {
                                    msg.content = msg.req;
                                }
                            }
                        }
                        else {
                            msg = (typeof err === 'string') ? {
                                content : err
                            } : err;
                        }
                    }
                    var newMsg = new Message(msg);
                    if (defaults.verticalPosition === 'bottom') {
                        httpMessages.unshift(newMsg);
                    }
                    else {
                        httpMessages.push(newMsg);
                    }
                    messageStack.push(newMsg.id);
                    return newMsg.id;
                }
            };
        }];
    };