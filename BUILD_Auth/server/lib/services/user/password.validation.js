'use strict';

function escapeRegexCharacters(str) {
    if (str) {
        return str.replace(/[,-`´.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return '';
}

module.exports.isMinLengthOrMore = function isMinLengthOrMore(password, minLength) {
    return (!!password && (password.length >= minLength));
};

module.exports.isMaxLengthOrLess = function isMaxLengthOrLess(password, maxLength) {
    return (!!password && (password.length <= maxLength));
};

// var regex = new RegExp('.{' + minLength + ',' + maxLength + '}','g');

module.exports.hasLowerCase = function hasLowerCase(password, minOccurrence) {
    if (!password) {
        return false;
    }
    var lowerCaseRegx = /[a-z]/g;
    var occurrences = password.match(lowerCaseRegx);

    if (minOccurrence && minOccurrence > 1) {
        return occurrences.length > minOccurrence;
    }
    return occurrences !== null;

};

module.exports.hasUpperCase = function hasUpperCase(password, minOccurrence) {
    if (!password) {
        return false;
    }
    var upperCaseRegx = /[A-Z]/g;
    var occurrences = password.match(upperCaseRegx);

    if (minOccurrence && minOccurrence > 1) {
        return occurrences.length > minOccurrence;
    }

    return occurrences !== null;

};

module.exports.hasDigit = function hasDigit(password, minOccurrence) {
    if (!password) {
        return false;
    }
    // var min = minOccurrence || 1;
    var digitsRegx = /[0-9]/g;
    var occurrences = password.match(digitsRegx);

    if (minOccurrence && minOccurrence > 1) {
        return occurrences.length > minOccurrence;
    }
    return occurrences !== null;
};


module.exports.hasSpecialCharacter = function hasSpecialCharacter(password, charStr, minOccurrence) {
    if (!password) {
        return false;
    }
    var specialRegex = escapeRegexCharacters(charStr);
    var regExp = new RegExp('[' + specialRegex + ']', 'g');
    var occurrences = password.match(regExp);
    if (minOccurrence && minOccurrence > 1) {
        return occurrences.length >= minOccurrence;
    }

    return occurrences !== null;
};


module.exports.doesNotContain = function doesNotContain(password, patterns) {
    for (var i = 0, len = patterns.length; i < len; i++) {
        var regExp = new RegExp(patterns[i], 'g');
        var contains = regExp.test(password);
        if (contains) return false;
    }
    return true;
};

module.exports.hasAllowedCharactersOnly = function hasAllowedCharactersOnly(password, options) {
    if (options) {
        var regexStr = '';
        if (options.specialCharacters && options.specialCharacters.allowed) {
            var charStr = options.specialCharacters.characters;
            // if no characters accept all
            if (!charStr) return true;
            regexStr += escapeRegexCharacters(charStr);

        }

        if (options.digits) {
            regexStr += '0-9';
        }

        if (options.upperCase) {
            regexStr += 'A-Z';
        }

        if (options.lowerCase) {
            regexStr += 'a-z';
        }


        var regExp = new RegExp('[' + regexStr + ']', 'g');
        var leftOverCharacters = password.replace(regExp, '');
        if (leftOverCharacters.length > 0) {
            return false;
        }
    }
    return true;

};

module.exports.isNotCommonUnsafe = function (password, unsafePasswords) {

    for (var i = 0, len = unsafePasswords.length; i < len; i++) {
        if (password === unsafePasswords[i]) return false;
    }
    return true;
};
