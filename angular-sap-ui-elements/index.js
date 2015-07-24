'use strict';

/**
 * @ngdoc module
 * @name ui.elements
 * @description
 *
 * The 'ui.elements' module contains the common directives that are to be used across Norman modules.
 *
 * - the ui-elements state contains directives relating to common ui elements that are to be shared.  These elements
 * should be granular in nature.  The general rule of thumb is that if a ui element is to be used more than once
 * across projects, then it should be contained within the ui-elements module of Norman/Common
 */

require('./common-utils');
require('./ui-elements');

module.exports = {
  'lodash': require('lodash'),
  'html2canvas': require('angular-sap-html2canvas'),
  'd3': require('d3-browserify')
};
