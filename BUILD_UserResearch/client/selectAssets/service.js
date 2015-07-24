'use strict';
// @ngInject
module.exports = function ($resource) {
	return $resource('/api/projects/:projectId/document');
};
