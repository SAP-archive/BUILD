'use strict';

angular.module('UserResearch')

    .directive('resolveController', require('./resolveController.js'))
    .directive('fullSizeImage', require('./fullSizeImage.js'))
    .directive('validateInput', require('./validateInput.js'))
    .directive('autoScroll', require('./autoScroll.js'))
    .directive('handyTip', require('./handyTip/handyTip.js'))
    .directive('calcHeight', require('./calcHeight.js'))
    .directive('screenPlacement', require('./screenPlacement/screenPlacement.js'))
    .directive('toggleImageSize', require('./toggleImageSize/toggleImageSize.js'))
    .directive('studyParticipantInvitation', require('./participant-invitation/participant-invitation.js'));
