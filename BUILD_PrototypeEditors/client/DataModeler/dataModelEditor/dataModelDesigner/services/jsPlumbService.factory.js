'use strict';
var jsPlumb = require('norman-client-tp').jsPlumb;
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($timeout, $location, $anchorScroll, $log) {

    var END_POINT_STYLES = [
        {fillStyle: 'transparent', outlineColor: 'transparent', outlineWidth: 0},
        {fillStyle: 'transparent'}
    ];

    var self = this;

    self.instance = null;

    // this affect the edge style
    self.PAINT_STYLE_MULTIPLICITY_ONE = {strokeStyle: '#3398DB', lineWidth: 1};
    self.PAINT_STYLE_MULTIPLICITY_N = {strokeStyle: '#2980B9', lineWidth: 2};


    function _getInstance() {
        if (!self.instance) {
            self.instance = jsPlumb.getInstance({

                // drag options
                DragOptions: {cursor: 'pointer', zIndex: 5000},
                // default to blue at source and green at target
                EndpointStyles: END_POINT_STYLES,
                // blue endpoints  px; green endpoints  px.
                Endpoints: [
                    ['Rectangle', {width: 1, height: 1}],
                    ['Rectangle', {width: 1, height: 1}]
                ],
                PaintStyle: self.PAINT_STYLE_MULTIPLICITY_ONE,
                HoverPaintStyle: {/*strokeStyle: '#1e8151',*/ lineWidth: 3},
                ConnectionOverlays: [
                    ['PlainArrow', {
                        location: [1],
                        id: 'arrow',
                        length: 6,
                        width: 5
                    }]
                ],
                Connector: ['Bezier', {curviness: 35, proximityLimit: 200, margin: -4}]
            });
        }
        return self.instance;

    }

    self.getConnection = function (sId) {
        if (self.instance) {
            var stConnections = self.instance.getConnections();
            return _.find(stConnections, function (oConn) {
                return oConn.getParameter('connId') === sId;
            });
        }
    };


    self.init = function (fnCallBack) {
        jsPlumb.ready(function () {
            _getInstance();
            $log.info('jsPlumbService ready');
            if (typeof fnCallBack === 'function') {
                fnCallBack();
            }
        });
    };

    self.scrollToItem = function (sId) {
        self.instance.getZoom();
        $location.hash(sId);

        $anchorScroll();

        $timeout(function () {
            var outer = document.getElementsByClassName('dm-dataModel-Outer')[0];
            outer.scrollIntoView();
        });
    };

    return self;

};
