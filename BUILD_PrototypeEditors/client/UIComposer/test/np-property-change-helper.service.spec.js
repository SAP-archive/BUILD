'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-property-change-helper', function () {
        var npPropertyChangeHelper;

        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            inject(function ($injector) {
                npPropertyChangeHelper = $injector.get('npPropertyChangeHelper');
            });
        });

        afterEach(function () {

        });

        it('should return true for valid css values, and all other property types ', function () {
            var property = {}, isValid;

            property.type = 'sap_ui_core_CSSSize';
            property.value = '10px';

            isValid = npPropertyChangeHelper.isPropertyValueValid(property);
            expect(isValid).to.be.equal(true);

            property.value = 'auto';
            isValid = npPropertyChangeHelper.isPropertyValueValid(property);
            expect(isValid).to.be.equal(true);

            property.value = 'au';
            isValid = npPropertyChangeHelper.isPropertyValueValid(property);
            expect(isValid).to.be.equal(false);

            property.type = 'int';
            property.value = 'abcdf';
            isValid = npPropertyChangeHelper.isPropertyValueValid(property);
            expect(isValid).to.be.equal(false);

        });

        it('should return true for backspace or delete', function () {
            var isDelete;

            isDelete = npPropertyChangeHelper.deleteKeyPressed('Delete');
            expect(isDelete).to.be.equal(true);

            isDelete = npPropertyChangeHelper.deleteKeyPressed('Backspace');
            expect(isDelete).to.be.equal(true);

            isDelete = npPropertyChangeHelper.deleteKeyPressed('g');
            expect(isDelete).to.be.equal(false);

        });

        it('should return true for cssproperties and keys other than delete/backspace', function () {
            var updateCSSSelection;
            var property = {};

            property.type = 'sap_ui_core_CSSSize';
            property.value = '10px';

            updateCSSSelection = npPropertyChangeHelper.updateCSSSelection(property, 'Delete');
            expect(updateCSSSelection).to.be.equal(false);

            updateCSSSelection = npPropertyChangeHelper.updateCSSSelection(property, 'Backspace');
            expect(updateCSSSelection).to.be.equal(false);

            updateCSSSelection = npPropertyChangeHelper.updateCSSSelection(property, 'g');
            expect(updateCSSSelection).to.be.equal(true);

            property.type = 'int';
            property.value = '25';

            updateCSSSelection = npPropertyChangeHelper.updateCSSSelection(property, 'Delete');
            expect(updateCSSSelection).to.be.equal(false);

            updateCSSSelection = npPropertyChangeHelper.updateCSSSelection(property, 'Backspace');
            expect(updateCSSSelection).to.be.equal(false);

            updateCSSSelection = npPropertyChangeHelper.updateCSSSelection(property, 'g');
            expect(updateCSSSelection).to.be.equal(false);
        });

        it('should return same string', function () {
            var property = {
                type: 'string',
                value: '345.3abc'
            };
            var newValue = npPropertyChangeHelper.serializePropertyValue(property);
            expect(newValue).to.be.equal('345.3abc');
        });

        it('should serialize the int value', function () {
            var property = {
                type: 'int',
                value: '345.3abc'
            };
            var newValue = npPropertyChangeHelper.serializePropertyValue(property);
            expect(newValue).to.be.equal(345);
        });

        it('should serialize float value', function () {
            var property = {
                type: 'float',
                value: '10.01abc'
            };
            var newValue = npPropertyChangeHelper.serializePropertyValue(property);
            expect(newValue).to.be.equal(10.01);
        });

        it('test CSSSize normal', function () {
            var property = {
                type: 'CSSSize',
                value: '10px'
            };
            var newValue = npPropertyChangeHelper.serializePropertyValue(property);
            expect(newValue).to.be.equal('10px');
        });

        it('should return an object', function () {
            var property = {
                type: 'object',
                value: 'Jun 21, 2017'
            };
            var newValue = npPropertyChangeHelper.serializePropertyValue(property);
            expect(newValue).to.be.an.object;
        });

        it('test CSSSize autocomplete', function () {
            var property = {}, newValue;
            property.type = 'sap_ui_core_CSSSize';

            property.value = '10';
            newValue = npPropertyChangeHelper.typeAheadPropertyValue(property);
            expect(newValue).to.be.equal('10px');

            property.value = '10c';
            newValue = npPropertyChangeHelper.typeAheadPropertyValue(property);
            expect(newValue).to.be.equal('10cm');

            property.value = '10i';
            newValue = npPropertyChangeHelper.typeAheadPropertyValue(property);
            expect(newValue).to.be.equal('10in');

            property.value = '10r';
            newValue = npPropertyChangeHelper.typeAheadPropertyValue(property);
            expect(newValue).to.be.equal('10rem');

            property.value = 'au';
            newValue = npPropertyChangeHelper.typeAheadPropertyValue(property);
            expect(newValue).to.be.equal('auto');

            property.value = 'inhe';
            newValue = npPropertyChangeHelper.typeAheadPropertyValue(property);
            expect(newValue).to.be.equal('inherit');
        });

        it('should parse and return same string', function () {
            var property = {
                type: 'string',
                value: '345.3abc'
            };
            var newValue = npPropertyChangeHelper.parsePropertyValue(property);
            expect(newValue).to.be.equal('345.3abc');
            expect(typeof newValue).to.be.equal('string');
        });

        it('should parse the int value', function () {
            var property = {
                type: 'int',
                value: '345.3abc'
            };
            var newValue = npPropertyChangeHelper.parsePropertyValue(property);
            expect(newValue).to.be.equal(345);
            expect(typeof newValue).to.be.equal('number');
        });

        it('should parse float value', function () {
            var property = {
                type: 'float',
                value: '10.01abc'
            };
            var newValue = npPropertyChangeHelper.parsePropertyValue(property);
            expect(newValue).to.be.equal(10.01);
            expect(typeof newValue).to.be.equal('number');
        });

        it('should parse object value', function () {
            var property = {
                type: 'object',
                value: '{"a": "something"}'
            };
            var newValue = npPropertyChangeHelper.parsePropertyValue(property);
            expect(newValue.a).to.be.equal('something');
            expect(typeof newValue).to.be.equal('object');
        });

    });

})();
