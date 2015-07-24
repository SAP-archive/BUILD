'use strict';

var _ = require('norman-client-tp').lodash;

var npCopyPaste = ['npGrid', 'npCanvasElementDrop', 'npKeyboarder', 'npConstants', 'npPageMetadata', 'npMessaging',
    function (npGrid, npCanvasElementDrop, npKeyboarder, npConstants, npPageMetadata, npMessaging) {
        var selectedElementsMd;
        return {
            restrict: 'A',

            link: function (scope) {
                var copy = function () {
                    selectedElementsMd = npGrid.getSelectedElements().map(function (gridElement) {
                        return gridElement.controlMd;
                    });

                };

                var paste = function () {
                    var cloneControlDefs = [];
                    var targetMd = npGrid.getSelectedElements().pop().controlMd;

                    _.forEach(selectedElementsMd, function (controlMd) {
                        var dropData = npCanvasElementDrop.getDropData(controlMd, targetMd);
                        if (dropData) {
                            var controlDef = _.extend({controlMd: controlMd}, dropData);
                            cloneControlDefs.push(controlDef);
                        }
                    });

                    if (cloneControlDefs.length !== selectedElementsMd.length) {
                        npMessaging.showError('Cannot paste controls');
                    }
                    else {
                        npPageMetadata.addControlByCloning(cloneControlDefs, npPageMetadata.getCurrentPageName()).then(function (controlsMd) {
                            npGrid.setSelectedElements([npGrid.getElementForControlId(controlsMd[0].controlId)], false);
                            selectedElementsMd = [controlsMd[0]];
                        });
                    }
                };

                var MacCopy = npKeyboarder.on(npConstants.keymap.c, copy, [npConstants.modifierKeys.Meta], [npConstants.os.MacOS]);
                var WindowsCopy = npKeyboarder.on(npConstants.keymap.c, copy, [npConstants.modifierKeys.Control], [npConstants.os.Windows, npConstants.os.Linux]);
                var MacPaste = npKeyboarder.on(npConstants.keymap.v, paste, [npConstants.modifierKeys.Meta], [npConstants.os.MacOS]);
                var WindowsPaste = npKeyboarder.on(npConstants.keymap.v, paste, [npConstants.modifierKeys.Control], [npConstants.os.Windows, npConstants.os.Linux]);

                scope.$on('$destroy', function cleanup() {
                    npKeyboarder.off(MacCopy);
                    npKeyboarder.off(WindowsCopy);
                    npKeyboarder.off(MacPaste);
                    npKeyboarder.off(WindowsPaste);
                });
            }
        };
    }
];

module.exports = npCopyPaste;
