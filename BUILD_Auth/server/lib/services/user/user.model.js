'use strict';
var util = require('util');
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;

var crypt = require('./user.crypto');

var configJson = commonServer.config.get();
var validator = require('./password.validation');
var serviceLogger = commonServer.logging.createLogger('user-model');
var authTypes = ['linkedin', 'facebook', 'google'];

var User;

var defaultPasswordPolicy = {
    minLength: 6,
    maxLength: 40,
    digits: {
        allowed: true
    },
    upperCase: {
        allowed: true
    },
    lowerCase: {
        allowed: true
    },
    specialCharacters: {
        allowed: true
    },
    bannedPasswords: [
    ],
    bannedCharacterCombination: []
};
var passwordPolicy = util._extend(defaultPasswordPolicy, configJson.security.passwordPolicy);

var defaultAccountConfig = {
    accountNameMinlength: 3,
    accountNameMaxlength: 120,
    forgotPasswordTokenExpiryInDays: 1,
    autoResendEmailVerification: true,
    emailVerifingTokenExpiryInDays: 30,
    emailHasAlreadyVerified: 'Your email address has been already verified.',
    recoverAccountPasswordTokenExpiredMessage: 'The resource your are looking for has expired.',
    recoverAccountPasswordTokenVerifiedMessage: 'Your email address has been verified.'
};
var accountConfig = util._extend(defaultAccountConfig, configJson.account);
var NAME_MIN_LENGTH = accountConfig.accountNameMinlength;
var NAME_MAX_LENGTH = accountConfig.accountNameMaxlength;

var MAX_LOGIN_ATTEMPTS = configJson.security.maxLoginAttempts || 5;

// lock time should be defined in minutes not in hours
var LOCK_TIME = (~~configJson.security.lockTimeInHours * 60) || configJson.security.lockTime || 30;


var UserSchema = mongoose.createSchema('auth', {
    principal: {type: String, lowercase: true, index: {unique: true}},
    name: {type: String, required: true},
    email: {type: String, lowercase: true, index: {unique: true, sparse: true}}, //in sso mode, email can by empty
    login_attempts: {type: Number, required: true, default: 0},
    lock_until: {type: Number},
    password: {type: String},
    salt: {type: String},
    iterationCount: {type: Number, default: crypt.iterationCount},
    provider: {type: String},
    email_verified_token: {type: String},
    email_verified_token_expired: {type: Date},
    has_email_verified: {type: Boolean, default: false},     // email address has been verified
    has_deactivated: {type: Boolean, default: false},     // account deactivated for some reason
    last_login: {type: Date, default: Date.now},
    facebook: {},
    google: {},
    linkedin: {},
    request_password_token: {type: String},
    request_password_token_expired: {type: Date},
    password_history: [],
    avatar_url: {type: String},
    avatar_bin: {type: String},
    avatar_content_type: {type: String},
    avatar_last_modified: {type: Date, default: Date.now},
    invitation_token: {type: String},
    invitation_expired: {type: Date},
    stats: {
        created_at: {type: Date, default: Date.now},
        created_by: String,
        updated_at: {type: Date, default: Date.now},
        updated_by: String
    },
    version: {type: Number},
    deleted: {type: Boolean, default: false},
    globalRoleChange: {type: String},
    preferences: {
        help: { disable: {type: Boolean, default: false} },
        projectsHelp: { disable: {type: Boolean, default: false} }
    }
});

UserSchema.set('autoIndex', false);

// enum on the model to provide failed login attempts statics
UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

/**
 * Check for lock_until timestamp
 * @return {Boolean}
 */
UserSchema.virtual('isLocked')
    .get(function () {
        return !!(this.lock_until && this.lock_until > Date.now());
    });

// Public profile information
UserSchema.virtual('profile')
    .get(function () {
        return {name: this.name};
    });

// Non-sensitive info we'll be putting in the token
UserSchema.virtual('token')
    .get(function () {
        return {_id: this._id};
    });

/*** METHODS **************************************************************************************/

/**
 * Increment Login Attempts and lock if exceeds the max
 * @return updates
 */
UserSchema.methods.incrementLoginAttempts = function () {
    var updates = {};
    updates.$inc = {login_attempts: 1};
    // lock the account on login_attempts
    if (this.login_attempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = {lock_until: Date.now() + 60 * 1000 * LOCK_TIME}; //lock time is in minutess Date.now in ms
    }

    this.update(updates, function (err) {
        if (err) return false;
        return true;
    });
};

/**
 * Authenticate user (for local authentication)
 * @static
 * @param  {String}   username
 * @param  {String}   password unhashed password for comparison
 * @param  {Function} callback with parameters: (err, user, reason)
 */
UserSchema.statics.getAuthenticated = function (principal, password, cb) {
    var reasons = this.failedLogin;
    serviceLogger.debug('Authenticating user  ', principal.toLowerCase());

    this.findOne({principal: principal.toLowerCase()}, function (err, user) {

        if (err) {
            serviceLogger.debug(err, 'User lookup failed');
            return cb(err);
        }
        // compare passwords (even if user not found) to prevent leaking the information
        // which (login or pass) is incorrect
        var isMatch = crypt.compare(password, user ? user.password : '', user ? user.salt : '12345678901234567890123456789012');

        // make sure the user exists
        if (!user) {
            serviceLogger.debug('Unknown user ' + principal.toLowerCase());
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked and if so -  increment login attempts
        if (user.lock_until && user.lock_until > Date.now()) {
            if (!user.incrementLoginAttempts()) {
                serviceLogger.debug('Account locked for  user ' + principal.toLowerCase());
                return cb(null, null, reasons.MAX_ATTEMPTS);
            }
        }

        // incorrect password, increment login attempts
        if (!isMatch) {
            if (!user.incrementLoginAttempts()) {
                serviceLogger.debug('Invalid credentials for  user ' + principal.toLowerCase());
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            }
        }

        // acc. was not locked
        if (!user.login_attempts && !user.lock_until) {
            serviceLogger.debug('User ' + principal.toLowerCase() + ' authenticated');

            // check iterations count & rehash if needed
            if (user.iterationCount < crypt.iterationCount) {
                user.password = password;
                return user.save(function (error, usr) {
                    if (error) {
                        return cb(error);
                    }
                    return cb(null, usr);
                });
            }

            return cb(null, user);
        }

        // reset
        var updates = {
            $set: {login_attempts: 0},
            $unset: {lock_until: 1}
        };

        return user.update(updates, function (error) {
            if (error) {
                return cb(error);
            }
            return cb(null, user);
        });

    });
};
/*** METHODS **************************************************************************************/

/*** VALIDATION ***********************************************************************************/

// Validate that email is not empty (only for non-social logins)
UserSchema.path('email')
    .validate(function (email) {
        if (this.provider !== 'local') {
            return true;
        }

        if (!this.isModified('email')) return true;
        return !!email.length;
    }, 'Email cannot be blank');


// Validate email is not taken
UserSchema.path('email')
    .validate(function (value, respond) {
        if (!this.isModified('email')) respond(true);
        var _id = this.id;
        if (this.provider !== 'local' && (!value || value.length === 0)) {
            respond(true);
        }
        else {
            this.constructor.findOne({email: value}, function (err, user) {
                if (err) throw err;
                if (user) return respond(_id === user.id);
                respond(true);
            });
        }
    }, 'The specified email address is already in use.');


// Validate that password is not empty (only for non-social logins)
UserSchema.path('password')
    .validate(function (password) {
        if (authTypes.indexOf(this.provider) !== -1) return true;
        return (!!password && !!password.length);
    }, 'Password cannot be blank');

// Policy rules
UserSchema.path('password')
    .validate(function (password) {

        if (authTypes.indexOf(this.provider) !== -1) return true;

        if (!this.isModified('password')) return true;
        // check length
        if (!validator.isMinLengthOrMore(password, passwordPolicy.minLength)
            || !validator.isMaxLengthOrLess(password, passwordPolicy.maxLength)) {
            return false;
        }
        var allowedOptions = {
            digits: passwordPolicy.digits.allowed,
            upperCase: passwordPolicy.upperCase.allowed,
            lowerCase: passwordPolicy.lowerCase.allowed,
            specialCharacters: {
                allowed: passwordPolicy.specialCharacters.allowed,
                characters: passwordPolicy.specialCharacters.allowedCharacters
            }
        };
        if (!validator.hasAllowedCharactersOnly(password, allowedOptions)) {
            return false;
        }

        if (passwordPolicy.digits && passwordPolicy.digits.required) {
            if (!validator.hasDigit(password, passwordPolicy.digits.minOccurrence)) {
                return false;
            }
        }

        if (passwordPolicy.upperCase && passwordPolicy.upperCase.required) {
            if (!validator.hasUpperCase(password, passwordPolicy.upperCase.minOccurrence)) {
                return false;
            }
        }
        if (passwordPolicy.lowerCase && passwordPolicy.lowerCase.required) {
            if (!validator.hasLowerCase(password, passwordPolicy.lowerCase.minOccurrence)) {
                return false;
            }
        }

        if (passwordPolicy.specialCharacters && passwordPolicy.specialCharacters.required) {
            if (!validator.hasSpecialCharacter(password, passwordPolicy.specialCharacters.allowedCharacters, passwordPolicy.specialCharacters.minOccurrence)) {
                return false;
            }
        }

        return true;
    }, passwordPolicy.errorMessage);

UserSchema.path('password')
    .validate(function (password) {
        if (!this.isModified('password')) return true;
        var history = this.password_history;
        for (var i = 0, len = history.length; i < len; i++) {
            var isMatch = crypt.compare(password, history[i].password, history[i].salt);
            if (isMatch) {
                return false;
            }
        }
        return true;
    }, 'This Password has been used previously, you cannot use any of the last 5 previously used passwords');

UserSchema.path('name')
    .validate(function (name) {
        return name.length <= NAME_MAX_LENGTH;
    }, 'The maximum length is ' + NAME_MAX_LENGTH);

UserSchema.path('name')
    .validate(function (name) {
        return name.length >= NAME_MIN_LENGTH;
    }, 'The minimum length is ' + NAME_MIN_LENGTH);


/*** VALIDATION ***********************************************************************************/

/**
 * Pre-save hook
 * Generate new salt & re-hash the password when it was changed
 */
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();


    this.salt = crypt.generateSalt();                          // generate a new salt
    this.iterationCount = crypt.iterationCount;                // update if rehashing
    this.password = crypt.hash(this.password, this.salt);      // hash password using new salt
    next();
});

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking User model indexes');
    User.ensureIndexes();
    User.on('index', function (err) {
        if (err) {
            serviceLogger.error(err, 'Failed to create indexes for User collection');
            done(err);
        }
        else {
            serviceLogger.debug('User collection indexes verified');
            done();
        }
    });
}

function create() {
    serviceLogger.debug('>> create(), creating User model');

    if (!User) {
        User = mongoose.createModel('User', UserSchema, undefined, {cache: false});
    }

    return User;
}

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy User model');
    User = undefined;
    done();
}

module.exports = {
    create: create,
    createIndexes: createIndexes,
    destroy: destroy
};
