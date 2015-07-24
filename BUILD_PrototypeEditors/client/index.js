'use strict';
require('./SharedWorkSpace');
require('./UIComposer');
require('./DataModeler');
require('./Previewer');
require('./SampleDataManager');

module.exports = angular.module('prototype-editors', ['model', 'uiComposer', 'SampleDataManager', 'Previewer', 'sharedWorkspace']);

