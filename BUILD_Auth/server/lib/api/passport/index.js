'use strict';
var tp = require('norman-server-tp');
var commonServer = require('norman-common-server');
var passport = require('passport');

// var secret = require('../../../secret.js');
var userController = require('../user/user.controller');
var filters = require('../../filters');
var configurationUtils = require('../../utils/configurationUtils');

var express = tp.express;

var registry = commonServer.registry;
var features = commonServer.features;
var authService = registry.getModule('AuthService');

var router = new express.Router();
module.exports = router;

router.use(passport.initialize());

function getSecurityConfig() {
    return (commonServer.config.get('security') || {});
}
function getPassportConfig() {
    return (commonServer.config.get('passport') || {});
}

// ROUTES
router.use('/policy', function (req, res) {
    var securityConfig = getSecurityConfig() || {};
    var policy = securityConfig.passwordPolicy || {};
    res.status(200).json({ policy: policy});
});

router.use('/securityConfig', function (req, res) {
    var securityConfig = getSecurityConfig() || {};
    var settings = {
        registration: securityConfig.registration,
        provider: securityConfig.provider,
        passwordPolicy: securityConfig.passwordPolicy,
        application: securityConfig.application,
        scopes: securityConfig.scopes
    };
    res.status(200).json({ settings: settings });
});

router.use('/features', function (req, res) {
    // should always return a 200, getFeatureList only applies error handlying when a user ID is passed in
    var featureList = {
        features: features.getFeatureList()
    };

    return res.status(200).json(featureList);
});

function login(req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        var error = err || info;
        if (error) return res.status(404).json(error);
        if (!user) return res.status(404).json({ message: 'Something went wrong, please try again.' });
        var token = authService.initializeSession(user._id, res);
        filters.xsrf.setToken(res);
        res.status(200).send(token);
    })(req, res, next);
}

router.post('/login', function (req, res, next) {
    var provider = getSecurityConfig().provider;
    if (!provider || provider.local === true) {
        login(req, res, next);
    }
    else {
        return res.status(500).json();
    }
});

router.post('/signupSSO', function (req, res) {
    var provider = getSecurityConfig().provider;
    if (provider && provider.local === false && req.context && req.context.user) {
        return res.status(200).json();
    }
    return res.status(500).json();
});


// for backward compatibility
router.post('/local', function (req, res, next) {
    var provider = getSecurityConfig().provider;
    if (!provider || provider.local === true) {
        login(req, res, next);
    }
});

router.post('/signup', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.self === true) {
        passport.authenticate('local-signup', function (err, user, info) {
            var error = err || info;
            if (error) return res.status(404).json(error);
            if (!user) return res.status(404).json({ message: 'Something went wrong, please try again.' });
            var token = authService.initializeSession(user._id, res);
            filters.xsrf.setToken(res);
            res.status(201).json(token);
        })(req, res, next);
    }
    else {
        return res.status(500).json();
    }
});


router.get('/logout', function (req, res) {
    // req.logout();
    res.clearCookie(configurationUtils.getSessionIdTokenName());
    req.user = null;
    res.redirect('/');
});


// SOCIAL ACCOUNT AUTHENTICATION
// facebook--------------------------------
router.get('/facebook', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.social === true) {
        passport.authenticate('facebook', {
            scope: ['email', 'user_about_me'],
            failureRedirect: '/signup',
            successRedirect: getPassportConfig().successConnectRedirect || 'norman',
            session: false
        })(req, res, next);
    }
});


router.get('/facebook/callback', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.social === true) {
        passport.authenticate('facebook', {
            failureRedirect: '/',
            session: false
        })(req, res, next);
    }
}, function (req, res) {
    authService.setTokenCookie(req, res);
});

// linkedin--------------------------------
router.get('/linkedin', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.social === true) {
        passport.authenticate('linkedin', {
            scope: ['r_emailaddress', 'r_basicprofile'],
            state: true,
            failureRedirect: '/signup',
            successRedirect: getPassportConfig().successConnectRedirect || 'norman',
            session: false
        })(req, res, next);
    }
});


router.get('/linkedin/callback', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.social === true) {
        passport.authenticate('linkedin', {
            failureRedirect: '/',
            session: false
        })(req, res, next);
    }
}, function (req, res) {
    authService.setTokenCookie(req, res);
});

// google--------------------------------
router.get('/google', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.social === true) {
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            failureRedirect: '/signup',
            successRedirect: getPassportConfig().successConnectRedirect || 'norman',
            session: false})(req, res, next);
    }
});
router.get('/google/callback', function (req, res, next) {
    var registration = getSecurityConfig().registration;
    if (!registration || registration.social === true) {
        passport.authenticate('google', {
            failureRedirect: '/',
            session: false
        })(req, res, next);
    }
}, function (req, res) {
    authService.setTokenCookie(req, res);
});

/** Non Passport Routes **/

router.get('/:id/requestPwd', userController.requestPwd);
router.get('/:id/resetPasswordTokenValidation', userController.resetPasswordTokenValidation);
router.put('/:id/resetPassword', userController.resetPassword);
