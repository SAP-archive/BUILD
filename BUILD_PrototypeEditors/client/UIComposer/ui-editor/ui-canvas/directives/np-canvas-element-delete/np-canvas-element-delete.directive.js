'use strict';

var _ = require('norman-client-tp').lodash;

var npCanvasElementDelete = ['npGrid', 'npConstants', 'npKeyboarder', 'npPageMetadata',
    function (npGrid, npConstants, npKeyboarder, npPageMetadata) {
        return {
            restrict: 'A',
            link: function (scope) {
                var deleteElements = function () {
                    var selectedElements = npGrid.getSelectedElements(),
                        controlsToDelete = _.chain(selectedElements)
                            .filter(function (element) {
                                return element.canDeleteElement();
                            })
                            .pluck('controlMd')
                            .pluck('controlId')
                            .value();
                    if (_.size(controlsToDelete) > 0) {
                        npPageMetadata.deleteControl(controlsToDelete);
                    }
                };

                var l1 = npKeyboarder.on(npConstants.keymap.Delete, deleteElements);
                var l2 = npKeyboarder.on(npConstants.keymap.Backspace, deleteElements);

                scope.$on('$destroy', function () {
                    npKeyboarder.off(l1);
                    npKeyboarder.off(l2);
                });
            }
        };
    }
];

module.exports = npCanvasElementDelete;
