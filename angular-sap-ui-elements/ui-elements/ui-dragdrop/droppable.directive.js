'use strict';

// @ngInject
module.exports = function($parse, $rootScope) {
    return function(scope, element, attr) {
        var dragging = 0; //Ref. http://stackoverflow.com/a/10906204
        var dropChannel = attr.dropChannel || 'defaultchannel';
        var dragChannel = '';
        var dragEnterClass = attr.dragEnterClass || 'ui-on-drag-enter';
        var dragHoverClass = attr.dragHoverClass || 'ui-on-drag-hover';
        var customDragEnterEvent = $parse(attr.onDragEnter);
        var customDragLeaveEvent = $parse(attr.onDragLeave);

        function onDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }

            if (e.stopPropagation) {
                e.stopPropagation();
            }

            var fn = $parse(attr.uiOnDragOver);
            scope.$evalAsync(function() {
                fn(scope, {
                    $event: e,
                    $channel: dropChannel
                });
            });

            e.dataTransfer.dropEffect = e.shiftKey ? 'copy' : 'move';
            return false;
        }

        function onDragLeave(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            if (e.stopPropagation) {
                e.stopPropagation();
            }
            dragging--;

            if (dragging === 0) {
                scope.$evalAsync(function() {
                    customDragEnterEvent(scope, {
                        $event: e
                    });
                });
                element.removeClass(dragHoverClass);
            }

            var fn = $parse(attr.uiOnDragLeave);
            scope.$evalAsync(function() {
                fn(scope, {
                    $event: e,
                    $channel: dropChannel
                });
            });
        }

        function onDragEnter(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            if (e.stopPropagation) {
                e.stopPropagation();
            }
            dragging++;

            var fn = $parse(attr.uiOnDragEnter);
            scope.$evalAsync(function() {
                fn(scope, {
                    $event: e,
                    $channel: dropChannel
                });
            });

            $rootScope.$broadcast('ANGULAR_HOVER', dragChannel);
            scope.$evalAsync(function() {
                customDragLeaveEvent(scope, {
                    $event: e
                });
            });
            element.addClass(dragHoverClass);
        }

        function onDrop(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }
            if (e.stopPropagation) {
                e.stopPropagation(); // Necessary. Allows us to drop.
            }

            var sendData = e.dataTransfer.getData('dataToSend');
            sendData = angular.fromJson(sendData);

            var fn = $parse(attr.uiDroppable);
            scope.$evalAsync(function() {
                fn(scope, {
                    $data: sendData.data,
                    $event: e,
                    $channel: sendData.channel
                });
            });
            element.removeClass(dragEnterClass);
            dragging = 0;
        }

        function isDragChannelAccepted(dragChannel, dropChannel) {
            if (dropChannel === '*') {
                return true;
            }

            var channelMatchPattern = new RegExp('(\\s|[,])+(' + dragChannel + ')(\\s|[,])+', 'i');

            return channelMatchPattern.test(',' + dropChannel + ',');
        }

        function preventNativeDnD(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.dataTransfer.dropEffect = 'none';
            return false;
        }

        var deregisterDragStart = $rootScope.$on('ANGULAR_DRAG_START', function(event, channel) {
            dragChannel = channel;
            if (isDragChannelAccepted(channel, dropChannel)) {
                element.bind('dragover', onDragOver);
                element.bind('dragenter', onDragEnter);
                element.bind('dragleave', onDragLeave);

                element.bind('drop', onDrop);
            } else {
                element.bind('dragover', preventNativeDnD);
                element.bind('dragenter', preventNativeDnD);
                element.bind('dragleave', preventNativeDnD);
                element.bind('drop', preventNativeDnD);
            }
        });

        var deregisterDragEnd = $rootScope.$on('ANGULAR_DRAG_END', function(e, channel) {
            dragChannel = '';
            if (isDragChannelAccepted(channel, dropChannel)) {

                element.unbind('dragover', onDragOver);
                element.unbind('dragenter', onDragEnter);
                element.unbind('dragleave', onDragLeave);

                element.unbind('drop', onDrop);
                element.removeClass(dragHoverClass);
                element.removeClass(dragEnterClass);
            }

            element.unbind('dragover', preventNativeDnD);
            element.unbind('dragenter', preventNativeDnD);
            element.unbind('dragleave', preventNativeDnD);
            element.unbind('drop', preventNativeDnD);
        });

        var deregisterDragHover = $rootScope.$on('ANGULAR_HOVER', function(e, channel) {
            if (isDragChannelAccepted(channel, dropChannel)) {
                element.removeClass(dragHoverClass);
            }
        });

        scope.$on('$destroy', function() {
            deregisterDragStart();
            deregisterDragEnd();
            deregisterDragHover();
        });

        attr.$observe('dropChannel', function(value) {
            if (value) {
                dropChannel = value;
            }
        });

    };
};
