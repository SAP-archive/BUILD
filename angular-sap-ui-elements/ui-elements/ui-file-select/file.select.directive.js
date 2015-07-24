'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiFileSelect
 *
 * @description
 * Generates a file select dialog component for selecting files from the supplied list.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} launchId the unique identifier of the DOM element which will invoke the select files dialog.
 * @param {function} loadFiles the callback function to be invoked when generating the list of files to be displayed.
 * The files list must be in the JSON form:
 * {
            name: "beforetomcat.png",
            date: "2015-06-03T08:24:45.306Z",
            size: 45813,
            url: "/api/projects/071df815009df7210a318cc0/document/556eb9cd1b27a77beec5fdaa/render/?thumbOnly=true"
        }
 * This JSON can have other attributes.
 *
 * @param {boolean} disableViewToggle indicates if the view toggle is displayed in the dialog. The toggle allows the
 * user to switch between list view and tile view.
 * @param {string} initialViewType the initial view type to be shown when the component is invoked.  Can be either
 * 'list' or 'view'.  Defaults to 'list' if not supplied.
 * @param {boolean} disableUpload indicates if the file upload functionality should be included in the dialog.
 * NOTE: File upload functionality has not yet been delivered as part of this component.
 * @param {function} fileSelectCallback the callback function to be invoked after the dialog has been closed. This callback
 * will be invoked with the list of selected files choosen.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-file-select load-files="loadFiles()" launch-id="launch-file-select4" disable-upload="true" initial-view-type="list"  file-select-callback="selectFilesCallback(files)">
 </ui-file-select>
 </doc:source>
 </doc:example>
 *
 */


require('norman-client-tp');
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function () {
    return {
        restrict: 'E',
        scope: {
            launchId: '@',
            loadFiles: '&',
            disableViewToggle: '@',
            initialViewType: '@',
            disableUpload: '@',
            fileSelectCallback: '&'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-file-select/file.select.template.html',

        link: function (scope, elem, attrs) {

            /**
             * Sets or unsets the supplied file as being selected.
             *
             * @param file the file to be updated.
             */
            scope.selectFile = function(file) {
                if (file.selected) {
                    file.selected = false;
                } else {
                    file.selected = true;
                }
            };

            /* A list of the sort options available. */
            scope.sortedItems = [{
                name: '↑ Date',
                value: 'date'
            }, {
                name: '↓ Date',
                value: '-date'
            }, {
                name: '↑ Name',
                value: 'name'
            }, {
                name: '↓ Name',
                value: '-name'
            }];

            scope.selectedItem = scope.sortedItems[0];

            if (scope.launchId) {
                var launchElement = document.getElementById(scope.launchId);
                if (launchElement) {
                    angular.element(launchElement).bind('click', function () {
                        if (scope.initialViewType) {
                            scope.viewType = scope.initialViewType;
                        } else {
                            scope.viewType = 'list';
                        }
                        scope.loading = true;
                        scope.$broadcast('dialog-open', 'file-select-id');
                        if (typeof scope.loadFiles === 'function') {
                            scope.files = scope.loadFiles();
                            scope.loading = false;
                        }
                    });
                }
            };

            /**
             * Returns the list of files selected to the callback function when the user closes the select files dialog.
             */
            scope.selectFiles = function() {
                if (typeof scope.fileSelectCallback === 'function') {
                    var fileSelectParams = {};
                    var callbackParameter = scope.getCallbackParameter(attrs.fileSelectCallback);
                    if (callbackParameter.length > 0) {
                        fileSelectParams[callbackParameter] = _.filter(scope.files, 'selected');
                    }
                    scope.fileSelectCallback(fileSelectParams);
                }
            };

            /**
             * Retrieves the named parameter to be used in the callback function for this directive.  The callback
             * function, including arguments, is examined, and the first argument is returned as the callback
             * parameter.
             * @param callbackFunction the callback function, including arguments, whose first parameter is to be
             * * retrieved.
             * @returns {string} the name of the first argument in the callback function, if present, or an empty
             * string otherwise.
             */
            scope.getCallbackParameter = function (callbackFunction) {
                var callbackParameter = '';
                if (callbackFunction !== undefined && callbackFunction.indexOf('(') !== -1) {
                    callbackParameter = callbackFunction.substring(callbackFunction.indexOf('(') + 1,
                        callbackFunction.indexOf(')'));
                    if (callbackFunction.indexOf(',') !== -1) {
                        callbackFunction = callbackFunction.substring(0, callbackFunction.indexOf(','));
                    }
                    if (callbackFunction.indexOf(' ') !== -1) {
                        callbackFunction = callbackFunction.substring(0, callbackFunction.indexOf(' '));
                    }
                }
                return callbackParameter;
            };
        }
    };
};
