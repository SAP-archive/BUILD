'use strict';

require('angular');

/*
** intercept all the module declarations and add the module
** names to the "modules" array. This array is then exported and
** used in the main Norman app as dependency array.
*/
var aModule = angular.module, modules = [], dependencies = [];
angular.module = function (name, dep) {
    if (dep) { // do not add a module if it's a dependency of an existing module
        if (name !== 'norman' && dependencies.indexOf(name) === -1) {
            modules.push(name);
        }
        dependencies = dependencies.concat(dep);
    }
    return aModule(name, dep);
};

//third-party angular modules
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-ui-router');
require('angular-animate');
require('angular-moment');
require('angular-messages');
require('norman-angular-zip');
var uiElements = require('angular-sap-ui-elements');
require('angular-sap-common-services');
require('angular-sap-common-directives');
require('angular-sap-common-filters');

//other common third parties
module.exports = {
    'modules':modules,
    'moment': require('moment'),
    'jquery' : require('norman-jquery'),
    'sortablejs': require('sortablejs'),
    'lodash':uiElements.lodash,
    'pica': require('pica/dist/pica.min'),
    'html2canvas': uiElements.html2canvas,
    'heatmap': require('heatmap.js'),
    'd3' : uiElements.d3,
    'sankey':require('angular-sap-d3-plugins/sankey/sankey')
};

//specific case for jsPlumb
//jsPlumb must be executed with this = window
//so we temporary override the call function to ensure this.
var oldCall = Function.prototype.call;
function newCall() {
    Function.prototype.call = oldCall;
    var newArgs = Array.prototype.slice.call(arguments,1);
    this.apply(window,newArgs);
    Function.prototype.call = newCall;
}
Function.prototype.call = newCall;
module.exports.jsPlumb = require('jsPlumb').jsPlumb;
Function.prototype.call = oldCall;
