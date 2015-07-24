'use strict';

var npDragOverHighlight = [
    function () {
		return {
			restrict: 'E',
			scope: {
				isDraggingOver: '='
			},
			link: function (scope, element) {
				var _count = 0;
				var onEnter = function (e) {
					e.preventDefault();
					_count++;
					scope.isDraggingOver = true;
					scope.$apply();
				};
				var onDrop = function () {
					_count = 0;
					scope.isDraggingOver = false;
					scope.$apply();
				};
				var onLeave = function () {
					_count--;
					if (_count === 0) {
						onDrop();
					}
				};
				var onOver = function (e) {
					e.preventDefault();
				};
				element.on('dragenter', onEnter);
				element.on('dragover', onOver);
				element.on('dragleave', onLeave);
				element.on('drop', onDrop);
			}
		};
	}
];
module.exports = npDragOverHighlight;