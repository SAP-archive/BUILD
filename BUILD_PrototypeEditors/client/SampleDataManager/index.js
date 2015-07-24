'use strict';

/**
 * @ngdoc module
 * @name SampleDataManager
 * @description SampleDataManager module to handle Sample data
 */

require('norman-ng-grid');
var sampleDataCtrl = require('./sampleData/sampleDataManager.controller.js');
module.exports = angular.module('SampleDataManager', ['ui.router', 'ui.grid', 'ui.grid.edit', 'ui.grid.selection'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('shell.SampleDataManager', {
                url: '/SampleDataManager/:projId/:entityName',
                templateUrl: 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/sampleDataManager.html',
                controller: 'sampleDataManagerController',
                authenticate: false,
                onEnter: 'sampleDataManagerController.getEntityNavDataForProj'
            });
    }])
    .factory('sdm.sampleData', require('./services/sampleData.service.js'))
    .factory('SampleDataHelper', require('./services/sampledata.Helper.js'))
    .controller('sampleDataManagerController', sampleDataCtrl)
    .controller('rowTemplateController', require('./sampleData/rowTemplate.controller.js'))
    .controller('editableCellTemplateController', require('./sampleData/editableCellTemplate.controller.js'))
    .controller('cellTemplateController', require('./sampleData/cellTemplate.controller.js'))
    .controller('columnHeaderController', require('./sampleData/columnHeader.controller.js'))
    .controller('cornerCellController', require('./sampleData/cornerTemplate.controller.js'))
    .directive('focusOn', function () {
        return function (scope, elem, attr) {
            scope.$on(attr.focusOn, function () {
                elem[0].parentElement.parentElement.classList.add('sd-header-selected');
                elem[0].parentElement.style.display = 'flex';
                elem[0].focus();
                var classes = elem[0].parentElement.parentElement.parentElement.classList;
                var reqClass;
                for (var i in classes) {
                    if (classes[i].indexOf('ui-grid-coluiGrid-') !== -1) {
                        reqClass = classes[i];
                        break;
                    }
                }
                angular.element(document.getElementsByClassName(reqClass)).addClass('sd-cells-selected');
            });
        };
    })
    .directive('blurOn', function () {
        return function (scope, elem, attr) {
            scope.$on(attr.blurOn, function () {
                if (elem[0].value === '') {
                    elem[0].parentElement.style.display = 'none';
                    elem[0].parentElement.parentElement.classList.remove('sd-header-selected');
                    var classes = elem[0].parentElement.parentElement.parentElement.classList;
                    var reqClass;
                    for (var i in classes) {
                        if (classes[i].indexOf('ui-grid-coluiGrid-') !== -1) {
                            reqClass = classes[i];
                            break;
                        }
                    }
                    angular.element(document.getElementsByClassName(reqClass)).removeClass('sd-cells-selected');
                }
            });
        };
    })
    .directive('showFocus', ['$timeout', function ($timeout) {
        return function (scope, element, attrs) {
            scope.$watch(attrs.showFocus,
                function () {
                    $timeout(function () {
                        element[0].select();
                    });
                }, true);
        };
    }])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.$on('SampleDataEditor', function (event, data) {
            $rootScope[data.sampleDataPath] = 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/sampleDataManager.html';
            $rootScope.sampleData = {
                id: data.id,
                entityName: data.entityName
            };
            $rootScope.loadSDEDitor = true;
        });
    }]);
