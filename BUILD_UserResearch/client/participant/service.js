'use strict';
// @ngInject
module.exports = function ($resource) {
	return $resource('/api/participant/:id', {
		id: '@_id'
	});
};
