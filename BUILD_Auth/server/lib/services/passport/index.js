'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('passport-service');
var _ = require('norman-server-tp')['lodash'];
var config = commonServer.config.get();

// load all the passport strategy  we need
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var registry = commonServer.registry;

var auditService;
var userService;

// TODO: replace with user service when merged
var User = require('../user/user.model').create();

function PassportService() {
}

module.exports = PassportService;

PassportService.prototype.initialize = function (done) {
    serviceLogger.info('initialize');
    done();
};

PassportService.prototype.onInitialized = function (done) {
    serviceLogger.info('PassportService>>onInitialized>>');
    auditService = registry.getModule('AuditService');
    userService = registry.getModule('UserService');
    done();
};

PassportService.prototype.shutdown = function () {
    serviceLogger.info('shutdown');
};

// LOCAL------------------------------------------
passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        if (email) {
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        }
        process.nextTick(function () {
            serviceLogger.info({ context: req.context, email: email }, 'local-login');
            // Authenticate user
            User.getAuthenticated(email, password, function (err, user, reason) {
                if (!auditService) {
                    auditService = registry.getModule('AuditService');
                }

                if (err) {
                    serviceLogger.error(err, 'Failed to authenticate user');
                    /*return done(err);*/
                    return done(null, false, {message: err});
                }
                // login was successful if we have a user
                if (user) {
                    //audit action
                    auditService.logSystemEvent('Authentication', 'Local signup', 'authentication is successful', { email: email }, req.context);
                    return done(null, user);
                }
                // otherwise determine why it failed
                var reasons = User.failedLogin,
                    msg = {};

                // real reason: email is not registered.
                msg[reasons.NOT_FOUND] = config.security.failedLoginReasons.notFound;
                // The email or password you entered is incorrect. Please try again.
                msg[reasons.PASSWORD_INCORRECT] = config.security.failedLoginReasons.passwordIncorrect;
                // notify user that account is temporarily locked by email with unlock instructions
                msg[reasons.MAX_ATTEMPTS] = config.security.failedLoginReasons.maxAttempts;

                serviceLogger.error({ message: msg[reason] }, 'Failed to authenticate user');
                auditService.logSystemEvent('Authentication', 'Local signup failed', 'Failed to authenticate user', {email: email, error: msg[reason]}, req.context);
                return done(null, false, {message: msg[reason]});
            }, req.context);
        });

    }));

passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            var url = req.protocol + '://' + req.host + '/verifyemail';
            var emailTemplateData = {
                url: url
            };

            serviceLogger.info({
                context: req.context,
                email: email
            }, 'local-signup');

            if (email) email = email.toLowerCase();
            process.nextTick(function () {
                if (!userService) userService = registry.getModule('UserService');
                if (!auditService) auditService = registry.getModule('AuditService');
                serviceLogger.info('Account found, linking accounts>>req.user>>', req.user);
                if (!req.user) {
                    userService.GetUserByEmail(email)
                        .then(function (user) {
                            if (user) {
                                serviceLogger.info('Account found, linking accounts');
                                if (user.provider === 'local') {
                                    serviceLogger.error('An account using this email address already exists. Please either log in, reset your password or create an account using a different email address.');
                                    return done(null, false, {message: 'An account using this email address already exists. Please either log in, reset your password or create an account using a different email address.'});
                                }

                                // merge them
                                var updateUser = {
                                    password: password,
                                    provider: 'local'
                                };
                                userService.LinkLocalAccount(user._id, updateUser)
                                    .then(function (user2) {
                                        auditService.logSystemEvent('Authentication', 'Local sign up', 'Authentication is successful. Succeeded to link local account', {email: email, name: req.body.name || '' }, req.context);
                                        return done(null, user2);
                                    })
                                    .catch(function (err) {
                                        serviceLogger.error(err, 'Failed to link local account.');
                                        auditService.logSystemEvent('Authentication', 'Local sign up failed', 'Failed to link local account', {email: email, name: req.body.name || '', error: err }, req.context);
                                        return done(null, false, {message: 'Failed to link local account.'});
                                    });

                            }
                            else {
                                serviceLogger.info('No account found, creating new account');
                                // create new user
                                var newUser = {
                                    principal: email, // Email is the principal
                                    email: email,
                                    password: password,
                                    name: req.body.name,
                                    provider: 'local'
                                };

                                userService.createUser(newUser, emailTemplateData, req.context)
                                    .then(function (user3) {
                                        auditService.logSystemEvent('Authentication', 'Local sign up', 'Authentication is successful', {email: email, name: req.body.name || '' }, req.context);
                                        return done(null, user3);
                                    })
                                    .catch(function (err) {
                                        serviceLogger.error(err, 'Failed to local sign up');
                                        auditService.logSystemEvent('Authentication', 'Local sign up failed', 'Failed to local sign up', { email: email, name: req.body.name || '', error: err }, req.context);
                                        /*return done(err);*/
                                        return done(null, false, {message: 'Sorry! Due to an internal error we are unable to create this account. Please try again later.'});
                                    });

                            }

                        })
                        .catch(function (err) {
                            serviceLogger.error(err, 'Failed to retrieve user');
                            return done(err);
                        });
                }
                else {
                    // user is logged in and already has a local account.
                    // Ignore signup.
                    return done(null, req.user);
                }
            });
        })
);


// FACEBOOK------------------------------------------
if (config.facebook) {
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            passReqToCallback: true
        }, function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                if (!userService) userService = registry.getModule('UserService');
                if (!auditService) auditService = registry.getModule('AuditService');
                // check if the user is already logged in
                if (!req.user) {
                    userService.GetUserByEmail(profile.emails[0].value)
                        .then(function (user) {
                            if (user) {
                                // if there is a user id already without token : Login
                                if (_.isEmpty(user.facebook)) {

                                    // update facebook profile and token
                                    profile.token = token;
                                    userService.Update(user._id, { facebook: profile})
                                        .then(function (user2) {
                                            // audit action
                                            auditService.logSystemEvent('Authentication', 'facebook sign up', 'Authentication is successful', { profile: profile }, req.context);
                                            return done(null, user2);
                                        })
                                        .catch(function (err) {
                                            serviceLogger.error(err, 'Failed to create facebook social account.');
                                            // audit action
                                            auditService.logSystemEvent('Authentication', 'facebook sign up failed', 'Failed to create facebook social account', { profile: profile, error: err }, req.context);
                                            return done(err);
                                        });
                                }
                                else {
                                    serviceLogger.info('Facebook Login>>Done>>', user);
                                    auditService.logSystemEvent('Authentication', 'facebook sign up', 'Authentication is successful', {token: token}, req.context);
                                    return done(null, user);
                                }
                            }
                            else {
                                // if there is no user, create them
                                serviceLogger.info('Create user for facebook social account.');
                                var newUser = new User();
                                newUser.principal = profile.emails[0].value;
                                newUser.email = profile.emails[0].value;
                                newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                                newUser.provider = 'facebook';
                                newUser.facebook = profile;
                                newUser.facebook.token = token;
                                newUser.avatar_url = 'https://graph.facebook.com/' + profile.id + '/picture';
                                // Create user
                                userService.CreateSocialUser(newUser)
                                    .then(function (user3) {
                                        // audit action
                                        auditService.logSystemEvent('Authentication', 'facebook sign up', 'Authentication is successful', { profile: profile }, req.context);
                                        return done(null, user3);
                                    })
                                    .catch(function (err) {
                                        serviceLogger.error(err, 'Failed to create facebook social account.');
                                        // audit action
                                        auditService.logSystemEvent('Authentication', 'facebook sign up failed', 'Failed to create facebook social account', {profile: profile, error: err}, req.context);
                                        return done(err);
                                    });
                            }
                        })
                        .catch(function (err) {
                            serviceLogger.error(err, 'Failed to retrieve user');
                            return done(err);
                        });
                }
            });
        })
    );
}

// GOOGLE
if (config.google) {
    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL,
            passReqToCallback: true
        }, function (req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {
                if (!userService) userService = registry.getModule('UserService');
                if (!auditService) auditService = registry.getModule('AuditService');
                // check if the user is already logged in
                if (!req.user) {
                    userService.GetUserByEmail(profile.emails[0].value)
                        .then(function (user) {
                            if (user) {
                                // if there is a user id already without token : Login
                                if (_.isEmpty(user.google)) {
                                    // update facebook profile and token
                                    profile.token = token;
                                    userService.Update(user._id, { google: profile })
                                        .then(function (user2) {
                                            // audit action
                                            auditService.logSystemEvent('Authentication', 'google sign up', 'authentication is successful', { profile: profile}, req.context);
                                            return done(null, user2);
                                        })
                                        .catch(function (err) {
                                            serviceLogger.error(err, 'Failed to create google social account.');
                                            // audit action
                                            auditService.logSystemEvent('Authentication', 'google sign up failed', 'Failed to create google social account', { profile: profile, error: err}, req.context);
                                            return done(err);
                                        });
                                }
                                else {
                                    auditService.logSystemEvent('Authentication', 'google sign up', 'Authentication is successful', { token: token }, req.context);
                                    return done(null, user);
                                }
                            }
                            else {
                                // if there is no user, create them
                                serviceLogger.info('Create user for google social account.');
                                var newUser = new User();
                                newUser.principal = profile.emails[0].value;
                                newUser.email = profile.emails[0].value;
                                newUser.name = profile.displayName;
                                newUser.provider = 'google';
                                newUser.google = profile;
                                newUser.google.token = token;
                                newUser.avatar_url = profile.picture;
                                // Create user
                                userService.CreateSocialUser(newUser)
                                    .then(function (user3) {
                                        // audit action
                                        auditService.logSystemEvent('Authentication', 'google sign up', 'Authentication is successful', {profile: profile}, req.context);
                                        return done(null, user3);
                                    })
                                    .catch(function (err) {
                                        serviceLogger.error(err, 'Failed to create google social account.');
                                        // audit action
                                        auditService.logEvent('Authentication', 'google sign up failed', 'Failed to create google social account', { profile: profile, error: err}, req.context);
                                        return done(err);
                                    });
                            }
                        })
                        .catch(function (err) {
                            serviceLogger.error(err, 'Failed to retrieve user');
                            return done(err);
                        });

                }
            });
        })
    );
}

// LINKEDIN
if (config.linkedin) {
    passport.use(new LinkedInStrategy({
            clientID: config.linkedin.clientID,
            clientSecret: config.linkedin.clientSecret,
            callbackURL: config.linkedin.callbackURL,
            profileFields: ['id', 'formatted-name', 'first-name', 'last-name', 'email-address', 'picture-url'],
            passReqToCallback: true
        }, function (req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {
                if (!userService) userService = registry.getModule('UserService');
                if (!auditService) auditService = registry.getModule('AuditService');

                // check if the user is already logged in
                if (req.user) {
                    return;
                }

                userService.GetUserByEmail(profile.emails[0].value)
                    .then(function (user) {
                        if (user) {
                            // if there is a user id already without token : Login
                            if (_.isEmpty(user.linkedin)) {
                                // update linkedin profile and token
                                profile.token = token;
                                return userService.Update(user._id, { linkedin: profile });
                            }

                            serviceLogger.debug('linkedin>>done(null, user)');
                            auditService.logSystemEvent('Authentication', 'linkedin sign up', 'Authentication is successful', {token: token}, req.context);
                            return done(null, user);
                        }

                        // if there is no user, create them
                        serviceLogger.info('Create user for linkedin social account.');
                        var newUser = new User();
                        newUser.principal = profile.emails[0].value;
                        newUser.email = profile.emails[0].value;
                        newUser.name = profile.displayName;
                        newUser.provider = 'linkedin';
                        newUser.linkedin = profile;
                        newUser.linkedin.token = token;
                        if (profile._json && profile._json.pictureUrl) {
                            newUser.avatar_url = profile._json.pictureUrl;
                        }
                        // Create user
                        return userService.CreateSocialUser(newUser, req.context);
                    })
                    .then(function (user3) {
                        // audit action
                        auditService.logEvent('Authentication', 'linkedin sign up', 'Authentication is successful', {profile: profile}, req.context);
                        return done(null, user3);
                    })
                    .catch(function (err) {
                        serviceLogger.error(err, 'Failed to login using linkedin social account.');
                        // audit action
                        auditService.logEvent('Authentication', 'linkedin sign up failed', 'Failed to login using linkedin social account', {profile: profile}, req.context);
                        return done(err);
                    });
            });
        })
    );
}
