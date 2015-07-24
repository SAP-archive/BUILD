'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npPropertyChangeHelper service provides functions to transform/autocomplete the input field value
 * @module npPropertyChangeHelper
 */
var npPropertyChangeHelper = ['$log', 'npConstants',
    function ($log, npConstants) {
        var self = {};

        /**
         * @name typeAheadPropertyValue
         * @description autocompletes the input value for a property
         * @param {property} property who's value should be transformed
         * @param key key that caused the property change
         * @returns string The new property value
         */
        self.typeAheadPropertyValue = function (property, key) {
            var transformedValue;
            switch (property.type) {
                case (isCssType(property.type) ? property.type : 'always false') :
                    transformedValue = transformCSSSize(property.value, key);
                    break;
                default:
                    transformedValue = property.value;
            }
            return transformedValue;
        };

        /**
         * @name transformPropertyValue
         * @description Parses the input value for a property
         * @param {property} property who's value should be transformed
         * @returns any The new property value
         */
        self.parsePropertyValue = function (property) {
            var transformedValue;
            switch (property.type) {
                case 'int':
                    transformedValue = parseInt(property.value, 10) || null;
                    break;
                case 'float':
                    transformedValue = parseFloat(property.value) || null;
                    break;
                case 'object':
                    transformedValue = convertToObject(property.value);
                    break;
                default:
                    transformedValue = property.value;
            }
            return transformedValue;
        };

        /**
         * @name serializePropertyValue
         * @description Serialize the input value for a property
         * @param {property} property who's value should be transformed
         * @returns string The new property value
         */
        self.serializePropertyValue = function (property) {
            var transformedValue;
            switch (property.type) {
                case 'int':
                    transformedValue = parseInt(property.value, 10) || null;
                    break;
                case 'float':
                    transformedValue = parseFloat(property.value) || null;
                    break;
                default:
                    transformedValue = property.value;
            }
            return transformedValue;
        };

        /**
         * @name deleteKeyPressed
         * @description checks if backspace or delete has been pressed
         * @param key key that caused the property change
         * @returns boolean if delete key was pressed
         */
        self.deleteKeyPressed = function (key) {
            return key === npConstants.keymap.Delete || key === npConstants.keymap.Backspace;
        };

        /**
         * @name updateCSSSelection
         * @description checks if part of the input value needs to be selected
         * @param {property} property that was updated
         * @param key key that caused the property change
         * @returns boolean if selection should be updated
         */
        self.updateCSSSelection = function (property, key) {
            return !self.deleteKeyPressed(key) && isCssType(property.type) && self.isPropertyValueValid(property);
        };

        /**
         * @name isPropertyValueValid
         * @description checks if new value is valid for this property
         * @param {property} property that was updated
         * @returns boolean if new property value is valied
         */
        self.isPropertyValueValid = function (property) {
            var regexForCSSSize = new RegExp('^(^$|auto|inherit|0)$|^[+-]?[0-9]+\.?([0-9]+)?(%|cm|em|ex|in|mm|px|pt|pc|rem)$');

            switch (property.type) {
                case 'int':
                    return !property.value || isNumber(property.value) && Math.floor(property.value) === Number(property.value);
                case 'float':
                    return !property.value || isNumber(property.value);
                case (isCssType(property.type) ? property.type : 'always false') :
                    return !property.value || regexForCSSSize.test(property.value);
                case 'object':
                    return canConvertToObject(property.value);
                default:
                    return true;
            }
            return true;
        };

        var isNumber = function (num) {
           return !!num && !isNaN(Number(num));
        };

        /**
         * @private
         * @description checks for css type
         */
        var isCssType = function (type) {
            return type.indexOf('CSSSize') !== -1;
        };

        /**
         * @private
         * @description check if can be converted to object
         */
        var canConvertToObject = function (inputString) {
            return inputString === '' || !!convertToObject(inputString);
        };

        /**
         * @private
         * @description convert String to Object
         */
        var convertToObject = function (input) {
            var result;
            if (typeof input === 'string') {
                try {
                    result = JSON.parse(input);
                }
                catch (err) {
                }
            }
            if (typeof result === 'object') {
                return result;
            }
        };

        /**
         * @private
         * @description matches input value against regular expressions and appends missing parts
         */
        var transformCSSSize = function (input, key) {

            if (!input) {
                return null;
            }
            else if (self.deleteKeyPressed(key)) {
                return input;
            }

            var regexPrefixNum = /^[+-]?[0-9]+\.?([0-9]+)?/i;
            var regexAuto = /^(a)(u)?(t)?(o)?$/i;
            var regexInherit = /^(i)(n)?(h)?(e)?(r)?(i)?(t)?$/i;
            var regexCm = /^[+-]?[0-9]+\.?([0-9]+)?cm?$/i;
            var regexEm = /^[+-]?[0-9]+\.?([0-9]+)?em?$/i;
            var regexEx = /^[+-]?[0-9]+\.?([0-9]+)?ex?$/i;
            var regexIn = /^[+-]?[0-9]+\.?([0-9]+)?in?$/i;
            var regexMm = /^[+-]?[0-9]+\.?([0-9]+)?mm?$/i;
            var regexPx = /^[+-]?[1-9]+\.?([0-9]+)?p?x?$/i;
            var regexPt = /^[+-]?[0-9]+\.?([0-9]+)?pt?$/i;
            var regexPc = /^[+-]?[0-9]+\.?([0-9]+)?pc?$/i;
            var regexRem = /^[+-]?[0-9]+\.?([0-9]+)?re?m?$/i;

            var regexCandidates = [regexAuto, regexInherit, regexCm, regexEm, regexEx, regexIn, regexMm, regexPx, regexPt, regexPc, regexRem];

            var regex = _.find(regexCandidates, function (candidate) {
                return input.search(candidate) > -1;
            });

            var transformed;

            switch (regex) {
                case regexAuto:
                    transformed = 'auto';
                    break;
                case regexInherit:
                    transformed = 'inherit';
                    break;
                case regexCm:
                    transformed = input.match(regexPrefixNum)[0].concat('cm');
                    break;
                case regexEm:
                    transformed = input.match(regexPrefixNum)[0].concat('em');
                    break;
                case regexEx:
                    transformed = input.match(regexPrefixNum)[0].concat('ex');
                    break;
                case regexIn:
                    transformed = input.match(regexPrefixNum)[0].concat('in');
                    break;
                case regexMm:
                    transformed = input.match(regexPrefixNum)[0].concat('mm');
                    break;
                case regexPx:
                    transformed = input.match(regexPrefixNum)[0].concat('px');
                    break;
                case regexPt:
                    transformed = input.match(regexPrefixNum)[0].concat('pt');
                    break;
                case regexPc:
                    transformed = input.match(regexPrefixNum)[0].concat('pc');
                    break;
                case regexRem:
                    transformed = input.match(regexPrefixNum)[0].concat('rem');
                    break;
                default:
                    transformed = input;
            }
            return transformed;
        };

        return self;
    }
];

module.exports = npPropertyChangeHelper;
