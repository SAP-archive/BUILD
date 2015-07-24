'use strict';

// @ngInject
module.exports = function ($scope, $timeout, $filter, AdminAccessService, uiError, ADMIN_ACCESS_CONSTANT, accessLevelProvider) {
    $scope.defaultLevelErrorMessage = 'There are some domains which are more restrictive than the Default. Please change each domain’s Access Level first, then, change the Default access level.';
    $scope.defaultSecurityPolicy = {};
    $scope.newSecurityPolicy = {};
    $scope.securityPolicies = [];
    $scope.accessLevelItems = [
        ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_0,
        ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_1,
        ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_2,
        ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_3,
        ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_4,
        ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_5
    ];

    var _computeAccessLevel = function (securityPolicy) {
        if (securityPolicy.projectInvitation === undefined || securityPolicy.projectInvitation !== ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR) {
            securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE;
        }
        if (securityPolicy.selfRegistration === undefined
            || (securityPolicy.selfRegistration !== ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.STANDARD
            && securityPolicy.selfRegistration !== ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.GUEST)) {
            securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.NONE;
        }
        var accessLevel;
        switch (securityPolicy.selfRegistration) {
            case ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.NONE:
                switch (securityPolicy.projectInvitation) {
                    case ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE:
                        if (securityPolicy.studyInvitation === true) {
                            accessLevel = ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_1;
                        }
                        else {
                            accessLevel = ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_0;
                        }
                        break;
                    case ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR:
                        if (securityPolicy.studyInvitation === true) {
                            accessLevel = ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_2;
                        }
                        break;
                }
                break;

            case ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.GUEST:
                switch (securityPolicy.projectInvitation) {
                    case ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE:
                        if (securityPolicy.studyInvitation === true) {
                            accessLevel = ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_3;
                        }
                        break;
                    case ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR:
                        if (securityPolicy.studyInvitation === true) {
                            accessLevel = ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_4;
                        }
                        break;
                }

                break;

            case ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.STANDARD:

                switch (securityPolicy.projectInvitation) {
                    case ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE:
                        break;
                    case ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR:
                        if (securityPolicy.studyInvitation === true) {
                            accessLevel = ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_5;
                        }
                        break;
                }
                break;
        }
        if (!accessLevel) {
            uiError.create({
                content: 'Failed to load the access levels.',
                dismissOnTimeout: true,
                dismissButton: true
            });
        }
        securityPolicy.accessLevel = accessLevel;
    };

    var _init = function () {
        return AdminAccessService.getSecurityPolicies().$promise
            .then(function (response) {
                if (response) {
                    if (response.defaultSecurityPolicy) {
                        $scope.defaultSecurityPolicy = response.defaultSecurityPolicy;
                        $scope.defaultSecurityPolicy.isDefault = true;
                        _computeAccessLevel($scope.defaultSecurityPolicy);
                        $scope.lastDefaultAccessLevel = $scope.defaultSecurityPolicy.accessLevel;
                    }
                    $scope.securityPolicies = response.securityPolicy ? response.securityPolicy : [];
                    if ($scope.securityPolicies && $scope.securityPolicies.length > 0) {
                        for (var k = 0; k < $scope.securityPolicies.length; k++) {
                            _computeAccessLevel($scope.securityPolicies[k]);
                         }
                     }
                    $scope.allSecurityPolicies = $scope.securityPolicies;
                }
        }).
        catch(function () {
                uiError.create({
                    content: 'Failed to load the domains.',
                    dismissOnTimeout: true,
                    dismissButton: true
                });
            }
        );
    };

    var _formatDomain = function (domain) {
        return domain.indexOf('@') === -1 ? '@' + domain.trim() : domain.trim();
    };

    var _clearInvalidAccessLevels = function () {
         for (var k = 0; k < $scope.securityPolicies.length; k++) {
            delete $scope.securityPolicies[k].invalidAccessLevel;
        }
        if ($scope.newSecurityPolicy) {
            delete $scope.newSecurityPolicy.invalidAccessLevel;
        }
    };

    $scope.deleteSecurityPolicy = function (domain) {
        var domainText = $filter('accessDomainFilter')(domain);
        return AdminAccessService.deleteSecurityPolicy({domain: domain}).$promise
            .then(function () {
               return _init().then(function () {
                   uiError.create({
                       content: 'The domain ' + domainText + ' has been removed.',
                       dismissOnTimeout: true,
                       dismissButton: true,
                       timeout: 5000,
                       className: 'success'
                   });
                   $scope.domainToDelete = undefined;
               });
        })
        .catch(function (err) {
                uiError.create({
                    content: 'Failed to remove the domain ' + domainText + '.',
                    dismissOnTimeout: true,
                    dismissButton: true
                });
                $scope.domainToDelete = undefined;
                throw err;
            });
    };


    $scope.onDeleteClick = function (domain) {
        _hideNewRow();
        $scope.domainToDelete = domain;
        $scope.$broadcast('dialog-open', 'delete-confirm-domain');
    };

    var _displayNewRow = function () {
        $scope.displayAddMode = true;
        var defaultAccessLevelIndex = $scope.accessLevelItems.indexOf($scope.defaultSecurityPolicy.accessLevel);
        $scope.newSecurityPolicy = {
            isNew: true,
            cachedNewRow: false,
            Domain: '',
            accessLevel: defaultAccessLevelIndex < $scope.accessLevelItems.length - 1 ? $scope.accessLevelItems[defaultAccessLevelIndex + 1] : $scope.accessLevelItems[$scope.accessLevelItems.length - 1]
        };
        $scope.allSecurityPolicies = $scope.securityPolicies.concat([ $scope.newSecurityPolicy]);
    };

    var _hideNewRow = function () {
        $scope.displayAddMode = false;
        $scope.newSecurityPolicy.cachedNewRow = false;
        $scope.allSecurityPolicies = $scope.securityPolicies;
    };

    $scope.onClickAddDomain = function () {
        if ($scope.newSecurityPolicy.cachedNewRow) {
            _init().then(function () {
                _displayNewRow();
            });
        }
        else {
            _clearInvalidAccessLevels();
            _displayNewRow();
        }

    };
    $scope.onEnterPressDomain = function (event, securityPolicy) {
        // Key Code for Enter
        if (event.keyCode === 13) {
            $scope.onSave(securityPolicy);
        }
    };

    $scope.onDeleteNewDomain = function (cachedNewRow) {
        if (cachedNewRow) {
            $scope.$broadcast('dialog-open', 'delete-confirm-cachedNewRow');
        }
        else {
            _hideNewRow();
        }
    };

    $scope.onDeleteCachedNewRow = function (securityPolicy) {
        var domain = _formatDomain(securityPolicy.Domain);
        $scope.deleteSecurityPolicy(domain).then(function () {
            _hideNewRow();
        });
    };

     $scope.levelOptionEnabled = function (securityPolicy, accessLevel) {
        var defaultAccessLevelIndex = securityPolicy.invalidAccessLevel === true ? $scope.accessLevelItems.indexOf($scope.lastDefaultAccessLevel) : $scope.accessLevelItems.indexOf($scope.defaultSecurityPolicy.accessLevel);
        var accessLevelIndex = $scope.accessLevelItems.indexOf(accessLevel);
        return defaultAccessLevelIndex < accessLevelIndex || accessLevelIndex === $scope.accessLevelItems.length - 1;
    };

    $scope.onSave = function (currentSecurityPolicy, ignoreValidation) {
        if ($scope.accessForm.$valid || ignoreValidation) {
            var securityPolicy = {};
            angular.copy(currentSecurityPolicy, securityPolicy);
            var isNew = securityPolicy.isNew;
            var isDefault = securityPolicy.isDefault;
            var accessLevel = securityPolicy.accessLevel;
            var cachedNewRow = securityPolicy.cachedNewRow;
            if (isNew) {
                securityPolicy.Domain = _formatDomain(securityPolicy.Domain);
            }
            var domain = securityPolicy.Domain;
            var domainText = isDefault ? 'Default' : $filter('accessDomainFilter')(domain);
             switch (securityPolicy.accessLevel) {
                case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_0:
                    securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.NONE;
                    securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE;
                    securityPolicy.studyInvitation = false;
                    break;
                case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_1:
                    securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.NONE;
                    securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE;
                    securityPolicy.studyInvitation = true;
                    break;
                case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_2:
                    securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.NONE;
                    securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR;
                    securityPolicy.studyInvitation = true;
                    break;
                case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_3:
                    securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.GUEST;
                    securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE;
                    securityPolicy.studyInvitation = true;
                    break;
                case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_4:
                    securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.GUEST;
                    securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR;
                    securityPolicy.studyInvitation = true;
                    break;
                case ADMIN_ACCESS_CONSTANT.ACCESS_LEVEL.LEVEL_5:
                    securityPolicy.selfRegistration = ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.STANDARD;
                    securityPolicy.projectInvitation = ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.COLLABORATOR;
                    securityPolicy.studyInvitation = true;
                    break;

            }
            if (securityPolicy.projectInvitation === ADMIN_ACCESS_CONSTANT.PROJECT_INVITATION.NONE) {
                delete securityPolicy.projectInvitation;
            }
            if (securityPolicy.selfRegistration === ADMIN_ACCESS_CONSTANT.SELF_REGISTRATION.NONE) {
                delete securityPolicy.selfRegistration;
            }
            delete securityPolicy.isNew;
            delete securityPolicy.accessLevel;
            delete securityPolicy.isDefault;
            delete securityPolicy.cachedNewRow;
            AdminAccessService.setSecurityPolicy({securityPolicy: securityPolicy}).$promise
                .then(function () {
                    if (isNew && !cachedNewRow) {
                        currentSecurityPolicy.cachedNewRow = true;
                        currentSecurityPolicy.Domain = domain;
                        uiError.create({
                            content: 'The domain ' + domainText + ' has been successfully created.',
                            dismissOnTimeout: true,
                            dismissButton: true,
                            timeout: 5000,
                            className: 'success'
                        });
                    }
                    else {
                        if (isDefault) {
                            $scope.lastDefaultAccessLevel = accessLevel;
                            _clearInvalidAccessLevels();
                        }
                        else {
                            accessLevelProvider.assertLevelValidity($scope.accessLevelItems, currentSecurityPolicy, accessLevel);
                        }
                        $scope.displayAddMode = false;

                            uiError.create({
                            content: 'The domain ' + domainText + ' has been successfully updated.',
                            dismissOnTimeout: true,
                            dismissButton: true,
                            timeout: 5000,
                            className: 'success'
                        });
                    }
                })
                .catch(function (err) {
                    _hideNewRow();
                    uiError.create({
                        content: isNew ? 'Failed to create the domain ' + domainText + '.' : 'Failed to update the domain' + domainText + '.',
                        dismissOnTimeout: true,
                        dismissButton: true
                    });
                    throw err;
                });
        }
    };
    $scope.infoCollapsed = function () {
        var elementAccordionPane = angular.element(document.querySelector('#access-accordion-pane'));
        return !elementAccordionPane.hasClass('is-expanded');
    };

    angular.element(document).ready(_init);
};


