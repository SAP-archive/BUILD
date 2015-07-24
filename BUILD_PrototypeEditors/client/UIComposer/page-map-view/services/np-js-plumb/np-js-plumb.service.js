'use strict';

var jsPlumb = require('norman-client-tp').jsPlumb;

var npJsPlumb = ['$log',
    function ($log) {
        var self = {};

        self.instance = null;

        // this affect the edge style
        self.PAINT_STYLE_NAV_TO = {strokeStyle: '#2ECC71', lineWidth: 1};

        function _getInstance() {
            if (!self.instance) {
                self.instance = jsPlumb.getInstance({

                    // drag options
                    DragOptions: {cursor: 'pointer', zIndex: 5000},

                    Endpoint: ['Dot', {radius: 2}],
                    PaintStyle: self.PAINT_STYLE_NAV_TO,
                    ConnectionOverlays: [
                        ['PlainArrow', {
                            location: [1],
                            id: 'arrow',
                            length: 6,
                            width: 5
                        }]
                    ],
                    Anchors: [[[0, 0.5, -1, 0, 0, -5, 'Left'], 'Top', 'Right', 'Bottom'], [[0, 0.5, -1, 0, 0, 5, 'Left'],
                        [1, 0.5, 1, 0, 0, -10, 'Right'],
                        [0.5, 0, 0, -1, -10, 0, 'Top'],
                        [0.5, 1, 0, 1, 0, 0, 'Bottom']]],

                    Connector: ['Bezier', {curviness: 35}]
                });
            }
            return self.instance;

        }

        self.getConnection = function (sId, tId, name) {
            if (self.instance) {
                return self.instance.getConnections({source: sId, target: tId, name: name});
            }
        };


        self.init = function () {
            jsPlumb.ready(function () {
                _getInstance();
                $log.info('jsPlumbService ready');
            });
        };

        self.repaintEverything = function () {
            if (self.instance) {
                self.instance.repaintEverything();
            }
        };

        self.reset = function () {

            if (self.instance) {
                self.instance.cleanupListeners();
                self.instance.deleteEveryEndpoint();
                self.instance.reset();
                self.instance.detachEveryConnection();
                self.instance = null;
            }
        };

        return self;

    }
];
module.exports = npJsPlumb;
