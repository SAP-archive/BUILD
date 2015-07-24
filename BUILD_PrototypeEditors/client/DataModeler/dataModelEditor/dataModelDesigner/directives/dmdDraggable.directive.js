'use strict';

// @ngInject
module.exports = function ($timeout, jsPlumbService) {
    return {
        restrict: 'A',
        link: function (scope, element) {

            $timeout(function () {

                jsPlumbService.instance.draggable(element, {
                    grid: [10, 10],
                    constrain: false,
                    filter: '.dmd-linkIcon',
                    stop: function (eDragStopEvent) { // gets called on every drag stop
                        var item = scope.item,
                            bPosChanged = false,
                            oNewPosition = {left: eDragStopEvent.pos[0], top: eDragStopEvent.pos[1]};

                        if (oNewPosition.left < 0) {
                            // negative values are not permitted.
                            // set a small positive value to bring the element to the screen with a small margin from the border
                            oNewPosition.left = 20;
                        }
                        if (oNewPosition.top < 0) {
                            // negative values are not permitted.
                            // set a small positive value to bring the element to the screen with a small margin from the border
                            oNewPosition.top = 20;
                        }

                        // do we need to update the position?
                        if (item.position && (item.position.left !== oNewPosition.left || item.position.top !== oNewPosition.top)) {
                            bPosChanged = true;
                        }
                        if (!item.position || bPosChanged) {
                            angular.extend(item.position, oNewPosition);

                            if (scope.dragItemStop) {
                                scope.dragItemStop({item: item});
                            }

                            var modelerLayout = jsPlumbService.instance.getContainer();
                            if (item.position.left > modelerLayout.offsetWidth || item.position.top > modelerLayout.offsetHeight) {
                                jsPlumbService.scrollToItem(element[0].id);
                            }
                        }
                    }
                });
            });
        }
    };
};
