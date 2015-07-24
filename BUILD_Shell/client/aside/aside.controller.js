/*eslint no-cond-assign: 0 */
'use strict';
/**
 * @ngdoc controller
 * @param $scope
 * @param $rootScope
 * @param AsideFactory
 */
// @ngInject
module.exports = function ($state, $scope, $rootScope, $timeout, $window,
    AsideFactory, globals, NavBarService, Auth) {

	$scope.asideService = AsideFactory;
	$scope.globals = globals;
	$scope.navbarService = NavBarService;
	$scope.showMenu = false;

    /**
     * Check if str is undefined, null or an empty string
     * @param str
     * @returns {boolean}
     */
    function isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    /**
     * Check if the current state is matching item's state or root
     * @param current
     * @param item
     * @returns {boolean}
     */
    function matchState(current, item) {
        return (
            (item.state.indexOf(current) > -1) ||
            (!isBlank(item.root) && current.indexOf(item.root) > -1)
        );
    }

    /**
     * Checks the current State against the aside menu,
     * If Current state is not contained in the aside it
     * attempts to check if it has a root (an abstract state)
     *
     * @param menuItems from the AsideFactory {array}
     * @returns the aside name to be set active{string}
     */
    $scope.getAsideActiveItem = function () {
        var items = AsideFactory.menuItems,
            currentStateName = $state.current.name,
            i = 0,
            item;

        if (items && items.length) {
            for (; item = items[i]; i++) {
                if (currentStateName === item.state || matchState(currentStateName, item)) {
                    if (typeof item.type === 'string') {
                        return item.type.toLowerCase();
                    }
                    return item.name.toLowerCase();
                }
            }
        }
        return '';
    };

	/**
	 * Checks if an aside Item is set as Persistent
	 * i.e. always visible
	 *
	 * @param stateName
	 * @returns {*}
	 */
	function isItemPersistent(stateName) {
		var items = AsideFactory.menuItems,
			i = 0,
			item;
		if (Array.isArray(stateName)) stateName = stateName[0];
		if (items && items.length) {
			for (; item = items[i]; i++) {
				if (item.state.indexOf(stateName) > -1) {
					return item.isPersistant;
				}
			}
		}
		return false;
	}

    /**
     * Checks if an aside Item is clearing the current Project
     *
     * @param stateName
     * @returns {*}
     */
    function clearsCurrentProject(stateName) {
        var items = AsideFactory.menuItems,
            i = 0,
            item;
        if (Array.isArray(stateName)) stateName = stateName[0];
        if (items && items.length) {
            for (; item = items[i]; i++) {
                if (item.state.indexOf(stateName) > -1) {
                    return item.clearCurrentProject;
                }
            }
        }
        return false;
    }

    /**
     * For some reason the width of the aside div is not correct 69.75px unstead of 70 so we fix it here
     */
    function checkSize() {
        var asideDiv = document.body.querySelector('.aside');
        var asideElement = angular.element(asideDiv);
        asideElement.css('width', '70px');
    }

    /**
     * Callback when the state will change
     * We process to see if wee need to do a two steps animation
     * @param event
     * @param toState
     * @param toParams
     * @param fromState
     */
    function onStateChangeStart(event, toState, toParams, fromState) {
        var bIsFirstTime = (event === null);
        // Special case when we go back to the home we need to do it in two steps
        if (event && toState.navbar && toState.navbar === 'hero' && toState.aside && toState.aside === 'hideAnimate' && $scope.asideService.hidden === false) {
            // Canceling the event
            event.preventDefault();
            // First hidding the aside
            $scope.asideService.hideAnimate();
            // Re launching the state transition so we will have the hero banner animation
            $timeout(function () {
                $state.go(toState.name);
            }, 500);
        }
        // If we don't go to hero but we are collapsed
        if (toState.navbar && toState.navbar !== 'hero' && fromState && fromState.navbar === 'hero' && $scope.isCollapsed) {
            var bNavbarHidden = $scope.navbarService.hidden;
            switch (toState.navbar) {
            case 'hideAnimate':
                if (bNavbarHidden) {
                    break;
                }
                if (!bIsFirstTime) {
                    $scope.asideService.hideAnimate();
                }
                else {
                    $scope.asideService.hide();
                }
                break;
            case 'showAnimate':
                if (!bNavbarHidden) {
                    break;
                }
                if (!bIsFirstTime) {
                    $scope.asideService.showAnimate();
                    $timeout(checkSize, 500);
                }
                else {
                    $scope.asideService.show();
                }
                break;
            case 'hide':
                if (bNavbarHidden) {
                    break;
                }
                $scope.navbarService.hide();
                break;
            case 'show':
            default:
                if (bNavbarHidden) {
                    $scope.navbarService.show();
                }
                $timeout(checkSize, 10);
            }
        }
    }

    /**
     * Callback when the state has changed. We process the information to update the aside and navbar
     * @param event
     * @param toState
     */
    function onStateChanged(event, toState, toParams, fromState) {
        var bFromHome = (fromState ? fromState.name === 'shell' : false);
        var bToProject = toState.name === 'shell.project.prototype';
        var bIsFirstTime = (event === null);
        if (event && toState.navbar && toState.navbar === 'hero' && toState.aside && toState.aside === 'showAnimate' && $scope.asideService.hidden === true) {
            // In this case we need to make the aside appears after the hero transition
            $scope.navbarService.hero(bToProject, bFromHome);
            $timeout($scope.asideService.showAnimate, 1000);
            $timeout(checkSize, 2000);
        }
        else {
            var bAsideHidden = $scope.asideService.hidden;
            var bNavbarHidden = $scope.navbarService.hidden;
            switch (toState.aside) {
            case 'hideAnimate':
                if (bAsideHidden) {
                    break;
                }
                if (!bIsFirstTime) {
                    $scope.asideService.hideAnimate();
                }
                else {
                    $scope.asideService.hide();
                }
                break;
            case 'showAnimate':
                if (!bAsideHidden) {
                    break;
                }
                if (!bIsFirstTime) {
                    $scope.asideService.showAnimate();
                    $timeout(checkSize, 500);
                }
                else {
                    $scope.asideService.show();
                }
                break;
            case 'hide':
                if (bAsideHidden) {
                    break;
                }
                $scope.asideService.hide();
                break;
            case 'show':
            default:
                if (bAsideHidden) {
                    $scope.asideService.show();
                }
                $timeout(checkSize, 10);
            }
            switch (toState.navbar) {
                case 'hero':
                $scope.navbarService.hero(bToProject, bFromHome);
                break;
            case 'hideAnimate':
                if (bNavbarHidden) {
                    break;
                }
                if (!bIsFirstTime) {
                    $scope.navbarService.hideAnimate();
                }
                else {
                    $scope.navbarService.hide();
                }
                break;
            case 'showAnimate':
                if (!bNavbarHidden) {
                    break;
                }
                if (!bIsFirstTime) {
                    $scope.navbarService.showAnimate();
                }
                else {
                    $scope.navbarService.show();
                }
                break;
            case 'hide':
                if (bNavbarHidden) {
                    break;
                }
                $scope.navbarService.hide();
                break;
            case 'show':
            default:
                $scope.navbarService.show();
            }
        }
        var bIsClearingProject = clearsCurrentProject(toState.name);
        if (bIsClearingProject) {
            $rootScope.currentProject = null;
        }
        $scope.showMenu = !bIsClearingProject;
        $scope.menuItemSelected = $scope.getAsideActiveItem();
    }

    /**
     * exposes the $state.go() method to the template while handling
     * missing params and check of isPersistent
     * @param stateName
     * @param params
     */
    $scope.stateGo = function (stateName) {
        if ((!clearsCurrentProject(stateName)) || isItemPersistent(stateName)) {
            var params = {
                currentProject: $rootScope.currentProject
            };
            // go to the first in the state list by default
            if (Array.isArray(stateName)) {
                $state.go(stateName[0], params);
            }
            else {
                $state.go(stateName, params);
            }
        }
        else {
            $state.go('shell');
        }
    };
    // Listening to state changes
    $rootScope.$on('$stateChangeStart', onStateChangeStart);
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        $timeout(function () {
            onStateChanged(event, toState, toParams, fromState);
        }, 10);
    });
    // Calling the sate change callback one
    onStateChangeStart(null, $state.current);
    onStateChanged(null, $state.current);
    Auth.getSecurityConfig()
        .then(function (d) {
            var settings = d.settings;
            $scope.isAdminConsole = settings && settings.application && settings.application.admin === true;
        });
};
