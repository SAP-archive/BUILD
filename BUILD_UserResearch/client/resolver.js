'use strict';

module.exports = {

    // @ngInject
    currentStudy: function (Studies, $stateParams) {
        if ($stateParams.study) {
            return $stateParams.study;
        }
        return Studies.get({
            id: $stateParams.studyId,
            projectId: $stateParams.currentProject
        }).$promise;
    },


    // @ngInject
    questionId: function ($stateParams) {
        if ($stateParams.questionId) {
            return $stateParams.questionId;
        }
        else if ($stateParams.study) {
            return $stateParams.study.questions[0]._id;
        }
    },


    // @ngInject
    currentStudyParticipant: function (ParticipantStudy, $stateParams) {
        if ($stateParams.study) {
            return $stateParams.study;
        }
        return ParticipantStudy.get({
            id: $stateParams.studyId
        }).$promise;
    },

    // @ngInject
    currentStudyPreview: function (Studies, $stateParams) {
        if ($stateParams.study) {
            return $stateParams.study;
        }

        var study = Studies.get({
            id: $stateParams.studyId,
            projectId: $stateParams.currentProject
        });
        study.$promise.then(function (st) {
            st.annotations = [];
            st.answers = [];
        });
        return study.$promise;
    },

    // @ngInject
    currentReview: function (Reviews, $stateParams) {
        if ($stateParams.review) {
            return $stateParams.review;
        }
        return Reviews.get({
            id: $stateParams.studyId,
            projectId: $stateParams.currentProject
        }).$promise;
    },

     // @ngInject
    currentStudyReview: function (Reviews, $stateParams) {
        if ($stateParams.review) {
            return $stateParams.review;
        }
        return Reviews.getStudyStats({
            id: $stateParams.studyId,
            projectId: $stateParams.currentProject
        }).$promise;
    }

};
