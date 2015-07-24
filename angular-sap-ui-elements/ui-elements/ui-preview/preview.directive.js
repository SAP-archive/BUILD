'use strict';
var _ = require('lodash');

/**
 * @ngdoc directive
 * @name ui.elements:uiPreview
 *
 * @description
 * Display in a fullscreen popup the full list of files/docs.
 * Display the size/date created of each document
 * Display the owner name and avatar
 *
 * @restrict E
 * @element ANY
 *
 * @param {array} docs An array of document to be displayed      
 * @param {string} filter A filter to be applied to the doc array
 * @param {string} order A sort order to be applied to the doc array
 * @param {string} reverseOrder Reverse the order of the sort order or not
 *
 * @example

 <doc:example>
 <doc:source>
    <ui-preview 
        docs="{{document.docs}}"
        filter="{{document.typeFilter}}"
        order="{{document.sortOptionValue}}"
        reverseOrder="{{document.sortOptionReverse}}">
    </ui-preview>
 </doc:source>
 </doc:example>
 *
 */


// @ngInject
module.exports = function ($window, $rootScope, $timeout) {
    return {
        scope: {
            docs: '@',
            filter: '@',
            order: '@',
            reverseOrder: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-preview/preview.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        controllerAs: 'uiPreviewCtrl',
        controller: ['$scope', '$element', '$attrs', 'UserService', uiPreviewCtrl],
        link: function (scope, element, attrs) {
            scope.element = angular.element(element);
            scope.imgElement = angular.element(document.querySelector('#ui-preview-image-id'));
            scope.pdfElement = angular.element(document.querySelector('#ui-preview-pdf-id'));

            var body = document.getElementsByTagName('body')[0];
            $timeout(function () {
                angular.element(body).append(element);
            });
        }
    };

    /**
     * Controller for that directive
     * @param  {object} scope       The directive scope
     * @param  {DOM} element        The DOM elt
     * @param  {object} attrs       The directives attributes
     * @param  {object} userService The user service object
     */
    function uiPreviewCtrl(scope, element, attrs, userService) {
        scope.isBtnNextDisabled = false;
        scope.isBtnPrevDisabled = false;
        scope.allDocs = [];
        scope.open = false;
        scope.isImage = false;
        scope.isDocument = false;
        scope.currentIdx = 0;
        scope.url = '';
        scope.showBusyIndicator = true;
        scope.isFullScreen = false;
        scope.isLoaded = false;

        scope.currentDoc = {
            'fileUrl': ''
        };
        scope.userService = userService;

        /**
         * Set the content type of the doc
         * If the doc is an image set up its src url
         * @param {string} doc idocument id
         */
        var setContent = function (doc) {
            if (doc.type === 'image') {

                scope.showBusyIndicator = true;

                scope.isImage = true;
                scope.url = doc.fileUrl;
            }
            if (doc.type === 'document') {
                scope.isDocument = true;
            }
        };

        /**
         * Get the user details and avatar to be displayed on the right side bar
         * @param {string} id The user id
         */
        var setUserName = function (id) {
            scope.userService.getUserById({
                    id: id
                }).$promise
                .then(function (response) {
                    scope.currentDoc.createdName = response.name;
                    scope.currentDoc.userAvatar = response.avatar_url;
                })
                .catch(function error(response) {
                    // TODO
                });
        };

        /**
         * [setUrlAsset description]
         * @param {[type]} project [description]
         * @param {[type]} asset   [description]
         */
        var setUrlAsset = function (project, asset) {
            var urlObj = {
                assetUrl: '/api/projects/' + project + '/document/' + asset + '/render'
            };
            $rootScope.$broadcast('assetUrlUpdated', urlObj);
        };

        /**
         * [setDocument description]
         */
        var setDocument = function () {
            scope.isImage = false;
            scope.isDocument = false;

            scope.currentDoc = scope.allDocs[scope.currentIdx];
            scope.currentDoc.userAvatar = '/api/users/' + scope.currentDoc.createdBy + '/avatar';

            setUserName(scope.currentDoc.createdBy);
            setContent(scope.currentDoc);
            setUrlAsset(scope.currentDoc.projectId, scope.currentDoc.id);
        };

        /**
         * Set to lower case all property value for a property name
         * @param  {string} property The name of the property to be lower case
         * @return {array}
         */
        var lowerize = function (property) {
            return _.map(scope.allDocs, function (hash) {
                hash[property] = hash[property].toLowerCase();
                return hash;
            });
        };

        /**
         * Clean up the preview
         */
        scope.previewClean = function () {
            scope.open = false;
            scope.element.removeClass('open');
            $timeout(function () {
                scope.imgElement.removeAttr('src');
                scope.isImage = false;
                scope.isDocument = false;
            }, 50);
        };

        /**
         * Display or not the navigation buttons
         */
        scope.showNavButton = function () {
            return scope.allDocs.length > 1;
        };

        /**
         * Close the preview
         */
        scope.closePreview = function () {
            if (scope.closeAction) {
                scope.closeAction();
            }
            scope.previewClean();
        };

        /**
         * Go to the next document
         */
        scope.goPrev = function () {
            $rootScope.$broadcast('busyIndicator', true);
            if (scope.currentIdx > 0) {
                if (scope.currentIdx === (scope.nbDocs - 1)) {
                    scope.isBtnNextDisabled = false;
                }
                scope.currentIdx = scope.currentIdx - 1;
                setDocument();

                if (scope.currentIdx === 0) {
                    scope.isBtnPrevDisabled = true;
                }
            }
        };

        /**
         * Go to the previous document
         */
        scope.goNext = function () {
            $rootScope.$broadcast('busyIndicator', true);
            if (scope.currentIdx < (scope.nbDocs - 1)) {
                if (scope.currentIdx === 0) {
                    scope.isBtnPrevDisabled = false;
                }
                scope.currentIdx = scope.currentIdx + 1;
                setDocument();

                if (scope.currentIdx === (scope.nbDocs - 1)) {
                    scope.isBtnNextDisabled = true;
                }
            }
        };

        /**
         * Delete a document
         * @param  {string} id  The document id to be deleted
         * @param  {number} idx The document index in the main dox array
         */
        scope.deleteDoc = function (id, idx) {

            $rootScope.$broadcast('previewDocumentDelete', _.findWhere(scope.allDocs, {
                'id': id
            }));

            scope.allDocs = _.without(scope.allDocs, _.findWhere(scope.allDocs, {
                'id': id
            }));

            scope.nbDocs = scope.nbDocs - 1;
            if (!scope.nbDocs) {
                scope.closePreview();
            }
            else {
                if (!idx) {
                    scope.currentIdx = 0;
                    setDocument();
                }
                else {
                    if (idx === scope.nbDocs) {
                        scope.currentIdx = scope.nbDocs - 1;
                        setDocument();
                    }
                    else {
                        scope.currentIdx = idx - 1;
                        setDocument();
                    }
                }
            }
            if (scope.currentIdx === 0) {
                scope.isBtnPrevDisabled = true;
            }
            if (scope.currentIdx === (scope.nbDocs - 1)) {
                scope.isBtnNextDisabled = true;
            }
        };

        /**
         * Event handler when the preview is opened
         * @param  {event} event     event
         * @param  {DOM id} elementId The DOM id
         * @param  {string} docId)   The document id which should be displayed first
         */
        scope.$on('preview-open', function (event, elementId, docId) {
            scope.isImage = false;
            scope.showBusyIndicator = false;
            scope.isDocument = false;

            scope.isBtnNextDisabled = false;
            scope.isBtnPrevDisabled = false;
            scope.allDocs = scope.$eval(attrs.docs);
            scope.filter = attrs.filter;
            scope.order = attrs.order;
            scope.reverseOrder = attrs.reverseorder;

            if (scope.filter !== '') {
                scope.allDocs = _.filter(scope.allDocs, {
                    'type': scope.filter
                });
            }

            // Sort the docs array if sort order is specidied
            // - check if reverse order
            var reverseChar = "-";
            var reverse = false;
            if (scope.order !== '' && typeof scope.order !== 'undefined') {
                if (scope.order.substring(0, reverseChar.length) === reverseChar) {
                    reverse = true;
                    scope.order = scope.order.slice(1);
                }

                if (scope.order === 'name') {
                    scope.allDocs = _.sortBy(lowerize(scope.order), scope.order);
                }
                else {
                    scope.allDocs = _.sortBy(scope.allDocs, scope.order);
                    reverse = (scope.reverseOrder === "true");
                }
                if (reverse) {
                    scope.allDocs.reverse();
                }
            }

            scope.nbDocs = scope.allDocs.length;
            scope.currentPage = 1;

            // Search the doc in the doc array
            scope.currentDoc = _.findWhere(scope.allDocs, {
                'id': docId
            });
            scope.currentIdx = _.findIndex(scope.allDocs, function (chr) {
                return chr.id === docId;
            });

            // Sets the nav buttons state
            if (scope.currentIdx === (scope.nbDocs - 1)) {
                scope.isBtnNextDisabled = true;
            }
            if (scope.currentIdx === 0) {
                scope.isBtnPrevDisabled = true;
            }

            // Set user detail, document detail and display
            setUserName(scope.currentDoc.createdBy);
            setContent(scope.currentDoc);
            setUrlAsset(scope.currentDoc.projectId, scope.currentDoc.id);

            $timeout(function () {
                scope.$apply();
                scope.open = true;
            });
        });

        /**
         * Event handler when an image is completely loaded
         * remove the busy indicator
         * @param  {event}  event
         * @param  {Boolean} isLoaded true when the image has been fully loaded
         */
        scope.$on('imageLoaded', function (event, isLoaded) {
            if (isLoaded) {
                $timeout(function () {
                    scope.showBusyIndicator = false;
                }, 10);
            }
        });

        /**
         * Destroy the DOM element used for that directive
         */
        scope.$on('$destroy', function () {
            element.remove();
        });
    }

};
