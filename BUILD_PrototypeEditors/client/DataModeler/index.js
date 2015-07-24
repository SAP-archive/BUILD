'use strict';

require('./dataModelEditor/dataModelDesigner');
require('./dataModelerWidget');

require('norman-client-tp');
require('angular-xeditable');

module.exports = angular.module('model', ['dataModeler.designer', 'modelerWidget.home'])
    .config(['$stateProvider', function ($stateProvider) {

        var resolves = {
            resPrototypeLock: ['npPrototype', function (npPrototype) {
                // return {success: true} if the user was able to lock the prototype, {success: false} otherwise
                return npPrototype.lockPrototype();
            }],
            resPrototype: ['npPrototype', function (npPrototype) {
                return npPrototype.getPrototype();
            }]
        };

        var checkPrototypeLockAndSmartTemplate = ['$state', '$stateParams', '$timeout', 'resPrototypeLock', 'resPrototype', function ($state, $stateParams, $timeout, resPrototypeLock, resPrototype) {
            // if the prototype is already locked or a freestyle prototype is found, refresh the prototype home page
            var disableForFreestyleProto = (resPrototype.pages && resPrototype.pages.length > 0 && !resPrototype.isSmartApp);
            if (!resPrototypeLock.success || disableForFreestyleProto) {
                // TODO: $timeout wrapping is needed as a workaround to get the $state.go to work properly within onEnter. This is a known $stateProvider issue. Not sure if it will ever be fixed.
                $timeout(function () {
                    $state.go('shell.project.prototype', {
                        currentProject: $stateParams.currentProject
                    });
                });
            }
        }];

        var unlockPrototype = ['npConcurrentAccessHelper', function (npConcurrentAccessHelper) {
            // unlock the prototype
            npConcurrentAccessHelper.handleUnlock();
        }];

        $stateProvider
            .state('shell.models', {
                url: '/projects/{currentProject}/dataModel',
                templateUrl: 'resources/norman-prototype-editors-client/DataModeler/dataModelEditor/dataModelEditor.html',
                controller: 'HeaderBarController as ctrl',
                authenticate: true,
                resolve: resolves,
                onEnter: checkPrototypeLockAndSmartTemplate,
                onExit: unlockPrototype
            });

    }])
    .service('dm.ModelEditorService', require('./services/dataModelEditor.service.js'))
    .service('dm.SidePanelService', require('./services/sidePanel.service.js'))
    .factory('dm.Entity', require('./services/entity.service.js'))
    .factory('dm.Model', require('./services/model.service.js'))
    .factory('dm.Navigation', require('./services/navigation.service.js'))
    .factory('dm.Property', require('./services/property.service.js'))
    .factory('dm.Catalog', require('./services/catalog.service.js'))
    .factory('dm.Group', require('./services/group.service.js'))
    .controller('HeaderBarController', require('./dataModelEditor/header/headerBar.controller.js'))
    .controller('SidePanelController', require('./dataModelEditor/sidePanel/sidePanelEditor.controller.js'))
    .controller('SampleDataController', require('./dataModelEditor/sidePanel/sampleData.controller.js'))
    .controller('RelationsController', require('./dataModelEditor/sidePanel/relations.controller.js'))
    .controller('PropertiesController', require('./dataModelEditor/sidePanel/properties.controller.js'))
    .controller('GroupsController', require('./dataModelEditor/sidePanel/groups.controller.js'))
    .controller('SearchCatalogController', require('./dataModelEditor/popUps/searchCatalog.controller.js'))
    .controller('MessageInformationController', require('./dataModelEditor/popUps/messageInformation.controller.js'))
    .run(['AsideFactory', 'projectLandingPageService', 'featureToggle', function (AsideFactory, projectLandingPageService, featureToggle) {
        /**
         * Inject the prototype in the project landing page if feature toggle is ok
         * run() is executed after the injector is created and is used to kickstart the application
         */
        featureToggle.isEnabled('disable-dataModeler').then(function (dataModelerDisabled) {
            if (!dataModelerDisabled) {
                projectLandingPageService.push({
                    priority: 2,
                    template: 'resources/norman-prototype-editors-client/DataModeler/dataModelerWidget/modelHomeWidget.html'
                });
            }
        });
    }]);

// FIXME To be migrated
require('./dataModelEditor/popUps/formulaEditor.controller.js');
require('./interceptor');
