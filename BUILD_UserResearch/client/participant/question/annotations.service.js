'use strict';
// @ngInject
module.exports = function ($resource, $stateParams) {
  return $resource('/api/participant/:studyId/annotations/:id',
    {
      id: '@_id',
      studyId: function () {
        return $stateParams.studyId;
      }
    },
    {
      update: {method: 'PUT'},
      delete: {method: 'DELETE'}
    }
  );
};
