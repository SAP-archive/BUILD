'use strict';
/**
 * @ngdoc controller
 * @param $scope
 * @param $location
 * @param Auth
 * @param NavBarService
 */
// @ngInject
module.exports = function ($rootScope, $scope, $location, $state, $window, Auth, NavBarService, $http, $sce) {

    // Hero Style
    $scope.navbarService = NavBarService;
    $scope.logoState = NavBarService.logoState === undefined ? 'shell' : NavBarService.logoState;
    $scope.logoStateParams = NavBarService.logoStateParams;


     $scope.showHelpMenu = true;
    $scope.hideFTUOverlay = true;
    $scope.overlayActiveVideo = $sce.trustAsResourceUrl('https://www.youtube.com/embed/Rc-22UdTMqI');
    $scope.overlayActiveTitle = 'Creating User Research Studies in BUILD';
    $scope.aVideoSliderItems = [{
        title: 'Introduction to User Research in BUILD',
        src: 'https://www.youtube.com/embed/Q6N2cqf6V90'
    }, {
        title: 'Using Questions in BUILD User Research',
        src: 'https://www.youtube.com/embed/Do3OmR_CrR8'
    }, {
        title: 'Using Tasks in BUILD User Research',
        src: 'https://www.youtube.com/embed/h--rx-bgmMI'
    }, {
        title: 'Previewing and Publishing your BUILD Study',
        src: 'https://www.youtube.com/embed/0KdWkj_RO5I'
    }, {
        title: 'Participating in BUILD User Research',
        src: 'https://www.youtube.com/embed/D-Her1s2OQQ'
    }];

    $scope.sliderVideoSelected = function (video) {
        $scope.overlayActiveVideo = $sce.trustAsResourceUrl(video.src + '?autoplay=1');
        $scope.overlayActiveTitle = video.title;
    };

    if ($state.current.name === 'shell') {
        $scope.isLandingPage = true;
    }

    Auth.getPreferences()
        .then(function (data) {
            $scope.userPrefrences = data.preferences;
            if ($scope.userPrefrences && $scope.userPrefrences.help) {
                $scope.hideFTUOverlay = $scope.userPrefrences.help.disable;
            }
        });

    $scope.closeHelpOverlay = function () {
        $scope.hideFTUOverlay = true;
        $scope.showHelpMenu = false;
        $rootScope.$broadcast('popup-open', {
            id: 'na-help-popover'
        });
        if ($scope.disableHelp) {
            $scope.userPrefrences.help.disable = true;
            Auth.updatePreferences($scope.userPrefrences);
        }
    };

    // Fot the avatar popover
    $scope.status = [
        {name: 'Online'},
        {name: 'Offline'}
    ];

    $scope.statusSelectedItem = $scope.status[0];

    var currentUser = Auth.getCurrentUser();
    if (currentUser.$promise) {
        currentUser.$promise.then(function (user) {
            $scope.currentUser = user;
            $scope.isLoggedIn = Auth.isLoggedIn();
        });
    }
    else {
        $scope.currentUser = null;
        $scope.isLoggedIn = false;
    }
    $scope.logout = function () {
        Auth.logout();
        $rootScope.currentProject = null;
        $location.path('/login');
    };

    Auth.getSecurityConfig()
        .then(function (d) {
            var settings = d.settings;
            var isProviderLocal = settings && settings.provider && settings.provider.local === true;
            $scope.showLogout = function () {
                return isProviderLocal;
            };
            $rootScope.isAdminConsole = settings && settings.application && settings.application.admin === true;
            $rootScope.hideAvatarPopover = $rootScope.isAdminConsole && !isProviderLocal;
        });

    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.navigateToLanding = function () {
        $rootScope.currentProject = null;
        NavBarService.updateHeading();
        $rootScope.$broadcast('shell.aside.updated');
        $state.go($scope.logoState, $scope.logoStateParams);
    };

    /**
     * Open a new tab for the help
     */
    $scope.goHelp = function () {
        $window.open('http://testfeature.github.io/testing1/', '_blank');
    };

    var privacyStmtPath = '/legal/terms/privacy_statement_EN.txt';
    $rootScope.showPrivacyStmt = false;
    $http.get(privacyStmtPath)
        .then(function (success) {
            $rootScope.showPrivacyStmt = true;
            $scope.privacystatement = success.data;
        });

};
