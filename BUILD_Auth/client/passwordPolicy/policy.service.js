/**
 * Created by i311181 on 16 Jan 2015.
 */
'use strict';

module.exports = function () {

	function escapeRegexCharacters(str) {
		return str.replace(/[,-`´.*+?^${}()|[\]\\]/g, '\\$&');
	}

	this.escapeRegexCharacters = escapeRegexCharacters;
	this.passwordLength = function passwordLength(password) {
		if (password && password.length !== undefined) {
			return password.length;
		}
		return 0;
	};

	this.hasLowerCase = function hasLowerCase(password, minOccurrence) {
		if (password === undefined) return false;
		var lowerCaseRegx = /[a-z]/g;
		var occurrences = password.match(lowerCaseRegx);

		if (minOccurrence && minOccurrence > 1) {
			return occurrences.length > minOccurrence;
		}
		return occurrences !== null;
	};

	this.hasUpperCase = function hasUpperCase(password, minOccurrence) {
		if (password === undefined) return false;
		var upperCaseRegx = /[A-Z]/g;
		var occurrences = password.match(upperCaseRegx);

		if (minOccurrence && minOccurrence > 1) {
			return occurrences.length > minOccurrence;
		}

		return occurrences !== null;

	};

	this.hasNumber = function hasNumber(password, minOccurrence) {
		if (password === undefined) return false;
		var digitsRegx = /[0-9]/g;
		var occurrences = password.match(digitsRegx);

		if (minOccurrence && minOccurrence > 1) {
			return occurrences.length > minOccurrence;
		}
		return occurrences !== null;
	};

	this.hasSpecialCharacters = function hasSpecialCharacters(password, charStr, minOccurrence) {
		if (password === undefined) return false;
		var specialRegex = escapeRegexCharacters(charStr);
		var regExp = new RegExp('[' + specialRegex + ']', 'g');
		var occurrences = password.match(regExp);
		if (minOccurrence && minOccurrence > 1) {
			return occurrences.length >= minOccurrence;
		}

		return occurrences !== null;
	};
};
