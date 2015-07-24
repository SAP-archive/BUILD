'use strict';


// var should = chai.should(),
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;

var validator = require('../lib/services/user/password.validation');

describe('Password Validation', function () {

	it('Password min & max Length', function () {

		var minLength = 6,
			maxLength = 40;
		var tooShortPassword = 'pass';
		expect(validator.isMinLengthOrMore(tooShortPassword, minLength)).to.be.eq(false);
		var longEnoughPassword = 'password';
		expect(validator.isMinLengthOrMore(longEnoughPassword, minLength)).to.be.eq(true);

		expect(validator.isMaxLengthOrLess(longEnoughPassword, maxLength)).to.be.eq(true);

		var tooLongPassword = 'this_password_is_far_too_long_to_except!!!';    //42
		expect(validator.isMaxLengthOrLess(tooLongPassword, maxLength)).to.be.eq(false);

	});

	it('Password has UpperCase', function () {

		var passwordWithUpperCase = 'Password';
		var passwordWithOutUpperCase = 'password';
		expect(validator.hasUpperCase(passwordWithUpperCase)).to.be.eq(true);
		expect(validator.hasUpperCase(passwordWithOutUpperCase)).to.be.eq(false);

	});

	it('Password has LowerCase', function () {

		var passwordWithLowerCase = 'Password';
		var passwordWithOutLowerCase = 'PASSWORD';
		expect(validator.hasLowerCase(passwordWithLowerCase)).to.be.eq(true);
		expect(validator.hasLowerCase(passwordWithOutLowerCase)).to.be.eq(false);

	});

	it('Password has Digits', function () {

		var passwordWithDigit = 'Password123';
		var passwordWithOutDigit = 'Password';
		expect(validator.hasDigit(passwordWithDigit)).to.be.eq(true);
		expect(validator.hasDigit(passwordWithOutDigit)).to.be.eq(false);

	});

	it('password has allowed Characters only', function () {

		var password = 'Password123$!)';
		var options = {
			digits: true,
			upperCase: true,
			lowerCase: true,
			specialCharacters: {
				allowed: true,
				characters: '!"#$%&\'()*+,-./:;><=?[]\\^_`{|}~´'
			}
		};
		expect(validator.hasAllowedCharactersOnly(password, options)).to.be.eq(true);
		password = 'P@ssword123$!)';
		// expect(validator.hasAllowedCharactersOnly(password, options)).to.be.eq(false);

	});

	it('Password has SpecialCharacter', function () {

		var specialCharacters = '! " # $ % & \' ( ) * + , - . / : ; > < = ? @ [ ] \\ ^ _ ` { | } ~ ´';
		var chars = specialCharacters.split(' ');
		var characterStr = specialCharacters.replace(' ', '');
		console.log('Characters Tested: ', characterStr);
		for (var i = 0, len = chars.length; i < len; i++) {
			var passwordWithSpecialCharacter = 'Password123' + chars[i];
			var isValid = validator.hasSpecialCharacter(passwordWithSpecialCharacter, characterStr, 1);
			if (!isValid) {
				console.log('invalid password with "' + chars[i] + '"', passwordWithSpecialCharacter);
			}
			expect(isValid).to.be.eq(true);
		}

		var passwordWithOutSpecialCharacter = 'Password';
		expect(validator.hasSpecialCharacter(passwordWithOutSpecialCharacter, characterStr, 1)).to.be.eq(false);

	});

	it('Password shouldn\'t contain banned combinations', function () {

		var bannedCombinations = [
			'sap.com'
		];

		for (var i = 0, len = bannedCombinations.length; i < len; i++) {
			var passwordWithBannedCombination = 'Password' + bannedCombinations[i] + '123';
			var isValid = validator.doesNotContain(passwordWithBannedCombination, bannedCombinations);
			expect(isValid).to.be.eq(false);
		}

		var passwordWithOutBannedCombination = 'Password123';
		expect(validator.doesNotContain(passwordWithOutBannedCombination, bannedCombinations)).to.be.eq(true);

	});

	it('Password is not common and unsafe', function () {

		var unsafeFavs2014 = [
			'password',
			'12345678',
			'qwerty',
			'abc123',
			'123456789',
			'111111',
			'1234567',
			'iloveyou',
			'adobe123',
			'123123',
			'admin',
			'1234567890',
			'letmein',
			'photoshop',
			'1234',
			'monkey',
			'shadow',
			'sunshine',
			'12345',
			'password1',
			'princess',
			'azerty',
			'trustno1',
			'0'
		];

		for (var i = 0, len = unsafeFavs2014.length; i < len; i++) {

			var isValid = validator.isNotCommonUnsafe(unsafeFavs2014[i], unsafeFavs2014);

			expect(isValid).to.be.eq(false);
		}

		var uncommonPassword = 'you_couldn\'t_possibly_guess_this';
		expect(validator.isNotCommonUnsafe(uncommonPassword, unsafeFavs2014)).to.be.eq(true);

	});

});
