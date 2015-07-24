'use strict';

var npDragHelper = [
    function () {
        var self = {},
            _dragData,
            _isImageDrag;

        self.startDrag = function (dragData, isImageDrag) {
            isImageDrag = !!isImageDrag;
            _dragData = dragData;
            _isImageDrag = isImageDrag;
        };

        self.endDrag = function () {
            _dragData = undefined;
            _isImageDrag = undefined;
        };

        self.getDragData = function () {
            return _dragData;
        };

        self.isImageDrag = function () {
            return _isImageDrag;
        };

        return self;
    }
];

module.exports = npDragHelper;
