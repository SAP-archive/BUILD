'use strict';
var Sortable = require('sortablejs');

// @ngInject
module.exports = function ($timeout, $animate) {
    return {
        restrict: 'AC',
        scope: {
            dragOnSort: '&dragOnSort',
            dragOnStart: '&dragOnStart',
            dragOnEnd: '&dragOnEnd',
            dragOnUpdate: '&dragOnUpdate'
        },
        link: function (scope, element, attrs) {

            var onSortFnctl = scope.dragOnSort;
            var onDragStartFnctl = scope.dragOnStart;
            var onDragEndFnctl = scope.dragOnEnd;
            var onDragUpdateFnctl = scope.dragOnUpdate;
            var disabled = false;
            var copyImage = null;
            var dragDiv;
            var backdropDiv;
            var nLayerX;
            var nLayerY;

            if (typeof attrs.drag === 'undefined') {
                disabled = true;
            }

            new Sortable(element[0], {
                disabled: disabled,
                draggable: attrs.drag,
                ghostClass: attrs.dragGhost,
                filter: attrs.dragFilter,
                animation: 400,
                sort: true,

                setData: function (dataTransfer, dragEl) {
                    // Remove all previous onHover tile
                    angular.element(angular.element(dragEl).parent()[0].querySelectorAll('.showOver')).removeClass('showOver');

                    // Create a drag div to be used during the drag/drop
                    dragDiv = angular.element(angular.element(dragEl)[0].querySelector('.ui-thumbnail')).clone();
                    dragDiv.addClass('ui-sortable-helper');
                    dragDiv.css('left', angular.element(dragEl)[0].offsetLeft + 'px');
                    dragDiv.css('top', angular.element(dragEl)[0].offsetTop + 'px');

                    // Add the drag div on top of the drag image
                    angular.element(this.el).append(dragDiv[0]);

                    // Create a drag image from a transparent div to allow the dragDiv to be used instead.
                    var dragImage = document.createElement('div');
                    dragImage.setAttribute('class', 'ui-sortable-helper-drag-image');
                    document.body.appendChild(dragImage);

                    // Set the placement of the drag/drop tile. set to the middle of the element
                    nLayerX = 120;
                    nLayerY = 90;

                    dataTransfer.setDragImage(dragImage, nLayerX, nLayerY);
                    dataTransfer.setData('Text', dragEl.textContent);
                    dataTransfer.effectAllowed = 'move';
                    dataTransfer.dropEffect = 'move';
                },

                // dragging started
                onStart: function (evt) {
                    angular.element(evt.item).addClass('dragPointer');
                    dragDiv.addClass('ui-sortable-helper-animation');

                    angular.element(evt.item).on('drag', function (e) {
                        // Set the coordinate of the drag div to follow the drag/drop mouse event
                        dragDiv.css('top', (e.clientY - nLayerY) + 'px');
                        dragDiv.css('left', (e.clientX - nLayerX) + 'px');

                        angular.element(this.querySelector('.ui-sortable-content')).css('visibility', 'hidden');
                        angular.element(this.querySelector('.ui-sortable-backdrop')).css('visibility', 'visible');

                        e.stopImmediatePropagation();
                    });

                    if (typeof onDragStartFnctl === 'function') {
                        onDragStartFnctl({
                            'event': evt
                        });
                    }
                },

                // dragging ended
                onEnd: function (evt) {
                    angular.element(evt.item).removeClass('dragPointer');

                    dragDiv.css('left', evt.item.offsetLeft + 'px');
                    dragDiv.css('top', evt.item.offsetTop + 'px');

                    dragDiv.removeClass('ui-sortable-helper-animation');
                    angular.element(angular.element(evt.item)[0].querySelector('.ui-thumbnail')).addClass('showOver');

                    $timeout(function () {
                        angular.element(evt.item).addClass('showOver');

                        dragDiv.remove();
                        angular.element(evt.item.querySelector('.ui-sortable-content')).css('visibility', 'visible');
                        angular.element(evt.item.querySelector('.ui-sortable-backdrop')).css('visibility', 'hidden');
                    }, 100);

                    if (typeof onDragEndFnctl === 'function') {
                        onDragEndFnctl({
                            'event': evt
                        });
                    }
                },

                onRemove: function (evt) {},

                onUpdate: function (evt) {
                    if (typeof onDragUpdateFnctl === 'function') {
                        onDragUpdateFnctl({
                            'event': evt
                        });
                    }
                },

                // Called by any change to the list (add / update / remove)
                onSort: function (evt) {
                    if (typeof onSortFnctl === 'function') {
                        onSortFnctl({
                            'event': evt
                        });
                    }
                }
            });
        }
    };
};
