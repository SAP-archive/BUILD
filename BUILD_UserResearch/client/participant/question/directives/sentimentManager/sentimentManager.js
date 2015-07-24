'use strict';

// @ngInject
module.exports = function ($state, $stateParams, SENTIMENT, $filter, urUtil) {
    return {
        restrict: 'E',
        scope: {
            details: '=',
            editMode: '=',
            onSave: '&',
            onEdit: '&',
            onDelete: '&',
            limitStringTo: '=',
            useLimit: '='
        },
        templateUrl: 'resources/norman-user-research-client/participant/question/directives/sentimentManager/template.html',
        link: function (scope, element, attrs) {

            scope.SENTIMENT = SENTIMENT; // to access constants in the html
            angular.element(element).addClass('sentimentManager');

            scope.maxlength = scope.maxChars = 500; // chars: allowed characters, length: chars + Carriage Returns
            scope.breaks = 0;
            scope.warningLevel = 100;
            scope.showDeleteButton = false;
            scope.showEditButton = false;

            if (attrs.deleteActive !== undefined) scope.showDeleteButton = true;
            if (attrs.editActive !== undefined) scope.showEditButton = true;
            if (attrs.dark !== undefined) {
                scope.dark = true;
                angular.element(element).addClass('dark');
            }
            else angular.element(element).addClass('light');

            scope.commentPath = (typeof attrs.commentPath === 'string' ? attrs.commentPath : 'comment');

            // Used for limiting string to certain length and ending with ellipsis
            if (scope.limitStringTo &&
                (typeof scope.limitStringTo === 'number' || typeof scope.limitStringTo === 'string')) {

                if (typeof scope.limitStringTo === 'string') {
                    scope.limitStringTo = parseInt(scope.limitStringTo, 10);
                }
                if (!isNaN(scope.limitStringTo)) scope.limitString = true;
            }

            scope.$watch(function () {
                return scope.details;
            }, function () {
                if (scope.details && scope.commentPath && scope.details[scope.commentPath]) {
                    var comment = scope.details[scope.commentPath];
                    var text = urUtil.textCountValidation(comment, scope.maxChars);
                    scope.remainingCharacters = text.remaining;
                    scope.maxlength = text.max;

                    if (scope.limitString === true) {
                        scope.limitedString = urUtil.shortenText(comment, scope.limitStringTo);
                    }
                }
                else scope.remainingCharacters = scope.maxChars;
            }, true);



            scope.changeSentiment = function (sentiment) {
                // if the sentiment is already set we  turn it off
                if (scope.details.sentiment === sentiment) {
                    scope.details.sentiment = SENTIMENT.NONE;
                    return;
                }
                scope.details.sentiment = sentiment;
            };

        }
    };
};
