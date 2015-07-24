'use strict';

module.exports = function () {
	return {
		restrict: 'A',
		require: ['ngModel', '^uiInputContainer'],
		link: function postLink(scope, element, attr, ctrls) {

			var ngModel = ctrls[0];

			function setMatch(bool) {
				ngModel.$setValidity('passwordmatch', bool);
			}

			ngModel.$parsers.push(function (value) {
				console.dir(attr);
				if (!value || value.length === 0) return null;

				if (attr.uiNewPassword === value) {
					setMatch(true);
				}
                else {
					setMatch(false);
				}
				return value;
			});

		}
	};
};
