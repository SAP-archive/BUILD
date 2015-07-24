'use strict';

// @ngInject
module.exports = function($parse, $rootScope) {
    return function(scope, element, attrs) {
        var isDragHandleUsed = false,
            dragHandleClass,
            draggingClass = attrs.draggingClass || 'on-dragging',
            dragTarget;

        element.attr('draggable', false);

        scope.$watch(attrs.uiDraggable, function(newValue) {
            if (newValue) {
                element.attr('draggable', newValue);
            } else {
                element.removeAttr('draggable');
            }

        });

        if (angular.isString(attrs.dragHandleClass)) {
            isDragHandleUsed = true;
            dragHandleClass = attrs.dragHandleClass.trim() || 'drag-handle';

            element.bind('mousedown', function(e) {
                dragTarget = e.target;
            });
        }

        function dragendHandler(e) {
            var fn;

            setTimeout(function() {
                element.unbind('$destroy', dragendHandler);
            }, 0);
            var sendChannel = attrs.dragChannel || 'defaultchannel';
            $rootScope.$broadcast('ANGULAR_DRAG_END', sendChannel);
            if (e.dataTransfer && e.dataTransfer.dropEffect !== 'none') {
                if (attrs.onDropSuccess) {
                    fn = $parse(attrs.onDropSuccess);
                    scope.$evalAsync(function() {
                        fn(scope, {
                            $event: e
                        });
                    });
                } else {
                    if (attrs.onDropFailure) {
                        fn = $parse(attrs.onDropFailure);
                        scope.$evalAsync(function() {
                            fn(scope, {
                                $event: e
                            });
                        });
                    }
                }
            }
            element.removeClass(draggingClass);
        }

        function dragstartHandler(e) {
            var isDragAllowed = !isDragHandleUsed || dragTarget.classList.contains(dragHandleClass);

            if (isDragAllowed) {
                var sendChannel = attrs.dragChannel || 'defaultchannel';
                var dragData = '';
                if (attrs.drag) {
                    dragData = scope.$eval(attrs.drag);
                }
                var sendData = angular.toJson({
                    data: dragData,
                    channel: sendChannel
                });

                element.addClass(draggingClass);
                element.bind('$destroy', dragendHandler);

                e.dataTransfer.setData('dataToSend', sendData);
                var currentData = angular.fromJson(sendData);
                e.dataTransfer.effectAllowed = 'copyMove';
                $rootScope.$broadcast('ANGULAR_DRAG_START', sendChannel, currentData.data);
            } else {
                e.preventDefault();
            }
        }

        element.bind('dragend', dragendHandler);

        element.bind('dragstart', dragstartHandler);
    };
};
