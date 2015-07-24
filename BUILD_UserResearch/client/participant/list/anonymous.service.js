'use strict';
// @ngInject
module.exports = function ($resource, $stateParams) {
  return $resource('/api/participant/studies/:studyId/anonymous',
      {
          id: '@_id',
          studyId: function () {
              return $stateParams.studyId;
          }
      }, {
          toggle: {
              method: 'PUT',
              params: {
                  id: '@_id'
              }
          }
      }
  );
};
