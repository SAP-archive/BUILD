'use strict';

// @ngInject
module.exports = function ($window, $compile, $rootScope) {
    return {
        restrict: 'A',
        scope: {},
        link: function linkingFunction($scope, element, attr) {
            var initialized = false;
            var thisElement = angular.element(element[0]);
            var body = angular.element($window.document.getElementsByTagName('body')[0]);
            var theTooltip;
            var theTooltipHeight;
            var theTooltipWidth;
            var theTooltipMargin; //used both for margin top left right bottom
            var height;
            var width;
            var offsetTop;
            var scrollTop = 0;
            var offsetLeft;
            var title = attr.uiTooltipTitle || attr.title || '';
            var content = attr.uiTooltipContent || '';
            var showTriggers = attr.uiTooltipShowTrigger || 'mouseenter mouseover';
            var hideTriggers = attr.uiTooltipHideTrigger || 'mouseleave mouseout';
            var side = attr.uiTooltipSide || 'top';

            var animationPos = attr.uiTooltipSide;
            if (animationPos === 'top') {
                animationPos = 'down';
            }
            if (animationPos === 'bottom') {
                animationPos = 'up';
            }
            var direction = animationPos.charAt(0).toUpperCase() + animationPos.slice(1);

            var tryPosition = attr.uiTooltipTry || 1; // If set into 0 , the auto-position method will not call
            var className = attr.uiTooltipClass || '';
            var lazyMode = $scope.$eval(attr.uiTooltipLazy || false);
            var htmlTemplate = '<div class="fadeIn' + direction + ' ui-tooltip ui-tooltip-' + side + '">' +
                '<div class="ui-tooltip-title"> ' + title + '</div>' +
                content + ' <span class="ui-tooltip-caret"></span>' +
                '</div>';

            //create the tooltip
            theTooltip = $compile(htmlTemplate)($scope);

            theTooltip.addClass(className);
            angular.element(body).append(theTooltip);

            $scope.initTooltip = function getInfos(tooltipSide) {
                height = thisElement[0].offsetHeight;
                width = thisElement[0].offsetWidth;
                offsetTop = $scope.getRootOffsetTop(thisElement[0], 0);
                offsetLeft = $scope.getRootOffsetLeft(thisElement[0], 0);
                //get tooltip dimension
                theTooltipHeight = theTooltip[0].offsetHeight;
                theTooltipWidth = theTooltip[0].offsetWidth;

                offsetTop = offsetTop - scrollTop;
                $scope.tooltipPositioning(tooltipSide);
            };

            $scope.getRootOffsetTop = function getRootOffsetTop(elem, val) {
                if (elem.offsetParent === null) {
                    return val + elem.offsetTop;
                }
                return $scope.getRootOffsetTop(elem.offsetParent, val + elem.offsetTop);
            };

            $scope.getRootOffsetLeft = function getRootOffsetLeft(elem, val) {
                if (elem.offsetParent === null) {
                    return val + elem.offsetLeft;
                }
                return $scope.getRootOffsetLeft(elem.offsetParent, val + elem.offsetLeft);
            };

            thisElement.bind(showTriggers, function onMouseEnterAndMouseOver() {
                if (!lazyMode || !initialized) {
                    initialized = false;
                    $scope.initTooltip(side);
                }
                $scope.showTooltip();
            });

            thisElement.bind(hideTriggers, function onMouseLeaveAndMouseOut() {
                $scope.hideTooltip();
            });

            $scope.showTooltip = function showTooltip() {
                theTooltip.addClass('ui-tooltip-open');
            };

            $scope.hideTooltip = function hideTooltip() {
                theTooltip.removeClass('ui-tooltip-open');
            };

            $scope.tooltipPositioning = function tooltipPositioning(tooltipSide) {
                var topValue, leftValue, position;

                theTooltipMargin = 5;

                if (tooltipSide === 'left') {
                    topValue = offsetTop + height / 2 - theTooltipHeight / 2;
                    leftValue = offsetLeft - (theTooltipWidth + theTooltipMargin);

                    position = $scope.trySuitablePosition(topValue, leftValue, tooltipSide);
                    topValue = position.topValue;
                    leftValue = position.leftValue;

                    theTooltip.css('top', topValue + 'px');
                    theTooltip.css('left', leftValue + 'px');
                }

                if (tooltipSide === 'right') {
                    topValue = offsetTop + height / 2 - theTooltipHeight / 2;
                    leftValue = offsetLeft + width + theTooltipMargin;

                    position = $scope.trySuitablePosition(topValue, leftValue, tooltipSide);
                    topValue = position.topValue;
                    leftValue = position.leftValue;

                    theTooltip.css('top', topValue + 'px');
                    theTooltip.css('left', leftValue + 'px');
                }

                if (tooltipSide === 'top') {
                    topValue = offsetTop - theTooltipMargin - theTooltipHeight;
                    leftValue = offsetLeft + width / 2 - theTooltipWidth / 2;

                    position = $scope.trySuitablePosition(topValue, leftValue, tooltipSide);
                    topValue = position.topValue;
                    leftValue = position.leftValue;

                    theTooltip.css('top', topValue + 'px');
                    theTooltip.css('left', leftValue + 'px');
                }

                if (tooltipSide === 'bottom') {
                    topValue = offsetTop + height + theTooltipMargin;
                    leftValue = offsetLeft + width / 2 - theTooltipWidth / 2;

                    position = $scope.trySuitablePosition(topValue, leftValue, tooltipSide);
                    topValue = position.topValue;
                    leftValue = position.leftValue;

                    theTooltip.css('top', topValue + 'px');
                    theTooltip.css('left', leftValue + 'px');
                }
            };

            // try a suitable position when no space to show
            $scope.trySuitablePosition = function trySuitablePosition(topValue, leftValue, orginPosition) {
                var position = {};

                position.topValue = topValue;
                position.leftValue = leftValue;

                if (tryPosition === 0 || (position.topValue >= 0 && position.leftValue >= 0)) {
                    return position;
                }

                position.topValue = offsetTop + height / 2 - theTooltipHeight / 2;
                position.leftValue = offsetLeft - (theTooltipWidth + theTooltipMargin);

                if (position.topValue >= 0 && position.leftValue >= 0) {
                    theTooltip.removeClass('ui-tooltip-' + orginPosition);
                    theTooltip.addClass('ui-tooltip-left');

                    return position;
                }

                position.topValue = offsetTop + height / 2 - theTooltipHeight / 2;
                position.leftValue = offsetLeft + width + theTooltipMargin;

                if (position.topValue >= 0 && position.leftValue >= 0) {
                    theTooltip.removeClass('ui-tooltip-' + orginPosition);
                    theTooltip.addClass('ui-tooltip-right');

                    return position;
                }

                position.topValue = offsetTop - theTooltipMargin - theTooltipHeight;
                position.leftValue = offsetLeft + width / 2 - theTooltipWidth / 2;

                if (position.topValue >= 0 && position.leftValue >= 0) {
                    theTooltip.removeClass('ui-tooltip-' + orginPosition);
                    theTooltip.addClass('ui-tooltip-top');

                    return position;
                }

                position.topValue = offsetTop + height + theTooltipMargin;
                position.leftValue = offsetLeft + width / 2 - theTooltipWidth / 2;

                theTooltip.removeClass('ui-tooltip-' + orginPosition);
                theTooltip.addClass('ui-tooltip-bottom');

                return position;
            };

            angular.element($window).bind('resize', function onResize() {
                $scope.initTooltip(side);
            });

            $scope.$on('$uiContentScrolled', function (event, element) {
                scrollTop = element[0].scrollTop;
                $scope.initTooltip(side);
            });

            $scope.$on('$destroy', function () {
                theTooltip.remove();
            });
        }
    };
};
