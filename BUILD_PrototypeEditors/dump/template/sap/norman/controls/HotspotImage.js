'use strict';

jQuery.sap.declare('sap.norman.controls.HotspotImage');
jQuery.sap.require('sap.ui.core.Control');
jQuery.sap.require('sap.ui.commons.Area');
jQuery.sap.require('sap.ui.commons.ImageMap');
jQuery.sap.require('sap.m.Image');

sap.ui.core.Control.extend('sap.norman.controls.HotspotImage', {
    metadata: {
        library: 'sap.norman.controls',
        properties: {
            'src': {type: 'sap.ui.core.URI', group: 'Appearance', defaultValue: null},
            'width': {type: 'sap.ui.core.CSSSize', group: 'Appearance', defaultValue: null},
            'height': {type: 'sap.ui.core.CSSSize', group: 'Appearance', defaultValue: null}
        },
        defaultAggregation: 'areas',
        aggregations: {
            'areas': {type: 'sap.ui.commons.Area', multiple: true, singularName: 'area'},
            '_img': {type: 'sap.m.Image', multiple: false, visibility: 'hidden'},
            '_map': {type: 'sap.ui.commons.ImageMap', multiple: false, visibility: 'hidden'}
        }
    },
    init: function () {
        var sMapName = this.getId() + '-map';
        var img = new sap.m.Image(this.getId() + '-img', {
            width: '100%',
            height: '100%',
            useMap: sMapName
        });
        this.setAggregation('_img', img, true);

        var map = new sap.ui.commons.ImageMap(sMapName, {
            name: sMapName
        });
        this.setAggregation('_map', map, true);
    },
    setWidth: function (w) {
        if (this.getDomRef()) {
            this.$().width(w);
        }
        return this.setProperty('width', w, true);
    },
    setHeight: function (h) {
        if (this.getDomRef()) {
            this.$().height(h);
        }
        return this.setProperty('height', h, true);
    },
    setSrc: function (src) {
        this.getAggregation('_img').setSrc(src);
        return this.setProperty('src', src, true);
    },
    addArea: function (area) {
        this.getAggregation('_map').addArea(area);
        return this;
    },
    insertArea: function (area, i) {
        this.getAggregation('_map').insertArea(area, i);
        return this;
    },
    removeArea: function (area) {
        return this.getAggregation('_map').removeArea(area);
    },
    removeAllAreas: function () {
        return this.getAggregation('_map').removeAllAreas();
    },
    getAreas: function () {
        return this.getAggregation('_map').getAreas();
    },
    destroyAreas: function () {
        this.getAggregation('_map').destroyAreas();
    },
    indexOfArea: function (area) {
        return this.getAggregation('_map').indexOfArea(area);
    },
    createArea: function (area) {
        return this.getAggregation('_map').createArea(area);
    },
    renderer: {
        render: function (rm, ctrl) {
            rm.write('<div');
            rm.writeControlData(ctrl);
            rm.addClass('normanMapImg');
            rm.writeClasses();
            if (ctrl.getWidth() && ctrl.getWidth() !== '') {
                rm.addStyle('width', ctrl.getWidth());
            }
            if (ctrl.getHeight() && ctrl.getHeight() !== '') {
                rm.addStyle('height', ctrl.getHeight());
            }
            //rm.addStyle('position', 'relative');
            rm.writeStyles();
            rm.write('>');

            rm.renderControl(ctrl.getAggregation('_img'));
            rm.renderControl(ctrl.getAggregation('_map'));

            rm.write('</div>');
        }
    }
});
