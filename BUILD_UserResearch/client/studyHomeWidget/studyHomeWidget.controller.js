'use strict';

// @ngInject
module.exports = function ($window, $rootScope, StudiesParticipate, uiError, $location) {
    $rootScope.baseUrl = $location.absUrl();
    var that = this;
    that.participates = [];
    that.showAllStudies = false;
    that.numOfHidden = 0;
    that.loading = true;
    that.baseUrl = $location.protocol() + '://' + $location.host();

    // check if the deployment has a port
    if ($location.port()) {
        that.baseUrl = that.baseUrl + ':' + $location.port();
    }

    that.openStudy = function (projectId, studyId) {
        var link = that.baseUrl + '/norman/projects/' + projectId + '/research/participant/' + studyId;
        $window.open(link);
    };

    function handleQueryResponse(study) {
        that.participates.push(study);
    }

    StudiesParticipate.query().$promise
        .then(function (res) {
            that.loading = false;
            res.forEach(handleQueryResponse);
        })
        .catch(function error(res) {
            that.loading = false;
            uiError.create({
                content: res.data.error,
                dismissOnTimeout: false
            });
        });
};
