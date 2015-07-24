'use strict';
// @ngInject
module.exports = function ($scope, AdminUsersService, $timeout, uiError) {

    $scope.users = [];
    $scope.nbUsers = 0;
    $scope.displayToaster = false;
    $scope.userDeleted = '';
    $scope.idDeleted = '';
    $scope.userRole = '';
    $scope.userEmail = '';
    $scope.toggleGuest = true;
    $scope.displaySimple = true;
    $scope.canSearch = true;
    $scope.deletedUser = null;
    $scope.hoveredUser = null;
    $scope.SEARCH_DELAY = 250;
    $scope.selectedIndex = 0;

    $scope.top = 50;
    $scope.skip = 0;
    $scope.nbPages = 1;
    $scope.currentPage = 1;
    $scope.search = '';
    $scope.isFirst = false;
    $scope.isLast = false;

    // We have to use an object to store these values because of angular scopes
    // Name/email search value
    $scope.search = {
        value: ''
    };
    // Role of the hovered user
    $scope.user = {
        role: ''
    };

    // Calling API for pagination
    $scope._pagination = function () {
        var options = {
            name: $scope.search.value,
            skip: $scope.skip,
            top: $scope.top
        };

        AdminUsersService.getUsers(options, function (response) {
            if (response) {
                $scope.users = response.users;
                $scope.nbUsers = response.nbUsers;
                // Normally we should always have at least 1 user (ourself)
                $scope.nbPages = ($scope.nbUsers ? Math.ceil($scope.nbUsers / $scope.top) : 1);

                // Disable Previous if on first page
                $scope.isFirst = $scope.currentPage === 1;

                // Disable Next if on first page
                if ($scope.currentPage >= $scope.nbPages) {
                    $scope.currentPage = $scope.nbPages;
                    $scope.isLast = true;
                }
                else {
                    $scope.isLast = false;
                }

            }
        }, function (/*error*/) {});
    };

    $scope._pagination();

    // Get the name and the id of the user to be deleted
    $scope._getInfoToDelete = function (user) {
        $scope.$broadcast('dialog-open', 'idDeleteDialog');
        $scope.userDeleted = user.name;
        $scope.idDeleted = user.id;
    };

    // Call the API to remove user, decrement the number of users and send a toast message
    $scope.delete = function () {
        // call delete API if 200 then do code below
        AdminUsersService.deleteUser({id: $scope.idDeleted}, function (response) {
            if (response) {
                uiError.create({
                    content: $scope.userDeleted + ' has been removed from the list',
                    dismissOnTimeout: true,
                    dismissButton: true,
                    timeout: 5000,
                    className: 'success'
                });
                // Call pagination again
                // Need to reset pagination for search
                $scope.skip = 0;
                $scope.nbPages = 1;
                $scope.currentPage = 1;
                $scope._pagination();
            }
        });
    };

    // Previous behavior
    $scope._onPrevious = function () {
        if ($scope.currentPage > 1) {
            $scope.skip -= $scope.top;
            $scope.currentPage--;
            $scope._pagination();
        }
    };

    // Next behavior
    $scope._onNext = function () {
        if ($scope.currentPage < $scope.nbPages) {
            $scope.skip += $scope.top;
            $scope.currentPage++;
            $scope._pagination();
        }
    };

    // Search behavior
    $scope._onSearch = function () {
        if ($scope.timer) {
            $timeout.cancel($scope.timer);
        }

        $scope.timer = $timeout(function () {
            // Need to reset pagination for search
            $scope.skip = 0;
            $scope.nbPages = 1;
            $scope.currentPage = 1;

            $scope._pagination();
        }, $scope.SEARCH_DELAY);
    };

    // Handle the display of the red message for guest
    $scope._onClick = function () {
        $scope.toggleGuest = $scope.user.role !== 'guest';
    };

    // Call the save API and display the selected role
    $scope._onSave = function (id) {

        $scope.toggleGuest = true;

        var options = {
            id: id,
            role: $scope.user.role
        };

        AdminUsersService.setRole(options, function (response) {
            if (response) {
                $scope.users[$scope.selectedIndex].roles[0] = $scope.user.role;
            }
        }, function (/*error*/) {});
    };

    // On Cancel remove the red message for guest
    $scope._onCancel = function () {
        $scope.toggleGuest = true;
    };

    $scope.setHoveredUser = function (user) {
        $scope.hoveredUser = user;
        if (user) {
            $scope.user.role = user.roles[0];
        }
    };

    $scope.setSimpleDisplay = function (isSimpleDisplay) {
        $scope.displaySimple = isSimpleDisplay;
    };

    // Evaluate the role to be display and open the dialog
    $scope._openDialog = function (index) {
        $scope.selectedIndex = index;
        $scope.$broadcast('dialog-open', 'idRoleDialog');
    };

    $scope.showDelete = function (user) {
        return $scope.hoveredUser && $scope.hoveredUser.id === user.id;
    };
};
