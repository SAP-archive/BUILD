'use strict';
// @ngInject
module.exports = function ($resource, $stateParams) {
  return $resource('/api/participant/studies/:studyId/answers/:id',
    {
      id: '@_id',
      studyId: function () {
        return $stateParams.studyId;
      }
    }, {
      save: {method: 'PUT'}
    },
    {
      delete: {method: 'DELETE'}
    }
  );
};
