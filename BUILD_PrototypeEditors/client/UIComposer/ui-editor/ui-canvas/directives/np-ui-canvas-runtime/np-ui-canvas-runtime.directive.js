'use strict';

var npUiCanvasRuntime = ['$log', 'npUiCanvasAPI', 'npPrototype',
    function ($log, npUiCanvasAPI, npPrototype) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var protoPromise = npPrototype.getPrototype();

                var loadNormanService = function () {
                    $log.debug('canvas runtime: iframe load event received');
                    protoPromise.then(function (proto) {
                        npUiCanvasAPI.init(element[0].contentWindow, proto.uiLang);
                    });
                    scope.$emit('canvasRuntime/loaded');
                };

                element.on('load', loadNormanService);
            }
        };
    }
];

module.exports = npUiCanvasRuntime;
