'use strict';
var _ = require('norman-client-tp').lodash;


// In order to avoid any changes without server validation,
// clients of this service should:
//  - Always use getters to retrieve service attributes (getters return copies)
//  - Always use service methods to make any change
//  - Listen for event to update corresponding data
//
// Events are :
//  - 'ModelEditorService.selectedEntityChanged'
//  - 'ModelEditorService.modelChanged'
//  - 'ModelEditorService.propertyTypesChanged'
//  - 'ModelEditorService.modelChangeStart'
//  - 'ModelEditorService.propertyAdded'
//  - 'ModelEditorService.relationAdded'
//  - 'ModelEditorService.saveStatusChanged'

// Never do this:
//
//  function(){
//      controller.selection = ModelEditorService.selectedEntity;
//      controller.selection.name = "dumb";
//  }
//
//  Always do this:
//
//  $scope.$on('ModelEditorService.selectedEntityChanged', function(event){
//      vm.selectedEntity = ModelEditorService.getSelectedEntity();
//  });
//
//  vm.update = function(){
//      var copy = angular.copy(vm.selectedEntity);
//      copy.name = "smart";
//      ModelEditorService.updateEntity(copy);
//  }

function modelEditorService($log, $q, $window, $upload, $rootScope, Model, Entity, Property, Navigation, Group) {

    var self = this;

    // ------------    Save status    ------------
    //
    // This broadcasts an event when the status has changed.
    // The status is SAVE_PENDING when a server call was triggered,
    //               SAVE_SUCCESSFUL when the request was fulfilled,
    //               SAVE_FAILED when the request was on error.
    //

    this.saveStatuses = {
        SAVE_SUCCESSFUL: 'SAVE_SUCCESSFUL',
        SAVE_FAILED: 'SAVE_FAILED',
        SAVE_PENDING: 'SAVE_PENDING'
    };

    this._saveStatus = this.saveStatuses.SAVE_SUCCESSFUL;

    this.getSaveStatus = function () {
        return this._saveStatus;
    };

    this._setSaveStatus = function (status) {
        this._saveStatus = status;
        $rootScope.$broadcast('ModelEditorService.saveStatusChanged');
    };

    // -------- Server Call Waiting Queue -------
    //
    // The goal of this waiting queue is to make one server call at a time,
    // waiting for server response, before triggering another server call.
    //
    // Any function f that makes a server call should not be called directly.
    // Instead, you should call this._pushInWaitingQueue(f, args)
    //

    this._serverCallWaitingQueue = [];

    /**
     * Recursive function that execute operations in the waiting queue
     * @private
     */
    this._execute = function () {

        if (self._serverCallWaitingQueue.length !== 0) {

            var func = self._serverCallWaitingQueue[0].func;
            var args = self._serverCallWaitingQueue[0].args;
            var deferred = self._serverCallWaitingQueue[0].deferred;
            var returnedValue = func.apply(self, args);

            var shiftAndExecute = function () {
                self._serverCallWaitingQueue.shift();
                self._execute();
            };

            var promise = null;
            if (returnedValue) {
                if (returnedValue.$promise) {
                    promise = returnedValue.$promise;
                }
                else if (returnedValue.then) {
                    promise = returnedValue;
                }
            }

            if (promise) {
                self._setSaveStatus(self.saveStatuses.SAVE_PENDING);
                promise.then(function (success) {
                    deferred.resolve(success);
                    self._setSaveStatus(self.saveStatuses.SAVE_SUCCESSFUL);
                }, function (oError) {
                    deferred.reject(oError);
                    self._setSaveStatus(self.saveStatuses.SAVE_FAILED);
                })
                    .finally(shiftAndExecute);
            }
            else {
                $log.error('all server calls must return a promise');
                deferred.resolve();
                shiftAndExecute();
            }
        }
    };

    /**
     * Push the operation in the queue
     * func will be called when it will be in the first position in the queue
     *
     * @param func
     * @param args
     * @returns {*} the promise returned by a call to func(args)
     * @private
     */
    this._pushInWaitingQueue = function (func, args) {
        var deferred = $q.defer();
        self._serverCallWaitingQueue.push({func: func, args: args, deferred: deferred});
        if (self._serverCallWaitingQueue.length === 1) {
            self._execute();
        }
        return deferred.promise;
    };

    // -------------------------------

    var onSuccessNewModel = function (value) {
        self.model = value;
        self.modelUpdateMutex[value.projectId] = false;
        $rootScope.$broadcast('ModelEditorService.modelChanged', value);
        // reset property types for the new model
        self.propertyTypes = null;
        self.getPropertyTypes();
        self.standardGroups = null;
        self.getStandardGroups();

        self.selectFirstEntity();
    };

    var error = function () {
    };

    // @private
    this.propertyTypes = null;
    // @private
    this.selectedEntity = null;
    // @private
    this.model = {};
    // @private
    this.modelUpdateMutex = {}; // mutex for not retrieving the same model several times in parallel

    // --- Selection ---

    this.getSelectedEntity = function () {
        return this.selectedEntity;
    };

    this.setSelectedEntity = function (entity) {
        if (entity) {
            this.selectedEntity = _.find(self.model.entities, {_id: entity._id});
        }
        else {
            this.selectedEntity = null;
        }
        $rootScope.$broadcast('ModelEditorService.selectedEntityChanged');
    };

    this.selectFirstEntity = function () {
        if (this.model && this.model.entities && this.model.entities.length > 0) {
            this.setSelectedEntity(this.model.entities[0]);
        }
        else {
            this.setSelectedEntity(null);
        }
    };

    // --- Model ---

    // Without parameter, this returns the current model
    // With project id as parameter,
    // if projectId is not the current, this triggers a server call to retrieve the model and change the current model used;
    // otherwise this returns the current model
    this.getModel = function (projectId) {
        var oResult;
        if (!projectId || (this.model && this.model.projectId === projectId)) {
            oResult = angular.copy(this.model);
        }
        else if (!this.modelUpdateMutex[projectId]) {
            this.modelUpdateMutex[projectId] = true;
            self._pushInWaitingQueue(self._doGetModel, arguments);
        }
        return oResult;
    };

    this._doGetModel = function (projectId, errorCallback) {
        this.selectedEntity = null;
        var params = {
            id: projectId
        };
        return Model.get(params, onSuccessNewModel, errorCallback);
    };

    this.createBlankModel = function () {
        return self._pushInWaitingQueue(self._doCreateBlankModel, arguments);
    };

    this._doCreateBlankModel = function (projectId) {
        var params = {
            projectId: projectId
        };
        return Model.create(params, onSuccessNewModel, error);
    };

    this.createModelFromCatalog = function () {
        return self._pushInWaitingQueue(self._doCreateModelFromCatalog, arguments);
    };

    this._doCreateModelFromCatalog = function (projectId, catalog) {
        var params = {};
        var postInfo = {
            projectId: projectId,
            catalog: catalog.id
        };
        return Model.create(params, postInfo, onSuccessNewModel, error);
    };

    // TODO refactor this
    this.setEditedProperty = function (property) {
        this.model.editedProperty = property;
        $rootScope.$broadcast('ModelEditorService.editedPropertyChanged');
    };

    this.updateModel = function () {
        self._pushInWaitingQueue(self._updatePosition, [this.model]);
    };

    this._updatePosition = function (modelData) {
        var params = {
            id: this.model.projectId
        };
        var model = {entities: []};
        var selfEntitiesMap = _.indexBy(self.model.entities, '_id');

        var success = function () {
            model.entities.forEach(function (curEntity) {
                var selfEntity = selfEntitiesMap[curEntity._id];
                if (selfEntity) {
                    selfEntity.position = curEntity.position;
                }
            });
        };

        modelData.entities.forEach(function (entity) {
            model.entities.push({_id: entity._id, position: entity.position});
        });

        return Model.update(params, model, success, error);
    };

    // --- Entity ---

    this.addEntity = function () {
        return self._pushInWaitingQueue(self._doAddEntity, arguments);
    };

    this._doAddEntity = function (entityData) {
        var params = {
            modelId: self.model.projectId
        };
        var success = function (value) {
            self.model.entities.push(value);
            self.model.layout = 'U';
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
            $rootScope.$broadcast('ModelEditorService.newEntity', value);

            self.setSelectedEntity(value);
        };

        return new Entity(entityData).$save(params, success, error);
    };

    this.removeEntity = function () {
        return self._pushInWaitingQueue(self._doRemoveEntity, arguments);
    };

    this._doRemoveEntity = function () {
        var id = this.selectedEntity._id;
        var params = {
            id: id,
            modelId: self.model.projectId
        };
        var success = function (value) {
            self.model = value;

            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
            self.selectFirstEntity();
        };

        return Entity.delete(params, success, error);
    };

    this.updateEntity = function () {
        return self._pushInWaitingQueue(self._doUpdateEntity, arguments);
    };

    this._doUpdateEntity = function (entityData) {
        var id = entityData._id;
        var properties = ['name', 'label', 'nameSet', 'isReadOnly', 'media', 'readable', 'pageable', 'addressable', 'originalEntity', 'semantics'];
        var params = {
            id: id,
            modelId: self.model.projectId
        };
        var success = function (value) {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === id) {
                    // we update the properties of the modified entity (this way it is immediatly propagated to the sidePanel)
                    angular.forEach(properties, function (propKey) {
                        self.model.entities[key][propKey] = value[propKey];
                    });

                    $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
                    return;
                }
            });
        };

        return Entity.update(params, entityData, success, error);
    };

    // -- Import Entity ---

    this.importOriginalEntity = function () {
        return self._pushInWaitingQueue(self._doImportOriginalEntity, arguments);
    };

    this._doImportOriginalEntity = function (entity) {

        var params = {
            id: self.model.projectId,
            catalogId: entity.catalog.id,
            catalogEntityId: entity._id
        };
        var success = function (value) {
            self.model.entities.push(value);
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
            self.setSelectedEntity(value);
            $rootScope.$broadcast('ModelEditorService.newEntity', value, false);

        };

        return Model.importEntity(params, null, success, error);
    };

    this.importOriginalEntityWithNavigation = function () {
        return self._pushInWaitingQueue(self._doImportOriginalEntityWithNavigation, arguments);
    };

    this._doImportOriginalEntityWithNavigation = function (entity) {
        var params = {
            id: self.model.projectId,
            catalogId: entity.catalog.id,
            catalogEntityId: entity._id,
            nav: true
        };
        var success = function (value) {
            // whole model is returned here
            self.model = value;
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
            // the _id is not the same of the added entity
            entity = _.find(self.model.entities, {name: entity.name});
            self.setSelectedEntity(entity);
            $rootScope.$broadcast('ModelEditorService.newEntity', entity, false);


        };

        return Model.importEntity(params, null, success, error);
    };

    this.importAllCatalog = function () {
        return self._pushInWaitingQueue(self._doImportAllCatalog, arguments);
    };

    this._doImportAllCatalog = function (entity) {
        var params = {
            id: self.model.projectId,
            catalogId: entity.catalog.id
        };
        var success = function (value) {
            // whole model is returned here
            self.model = value;
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
            // the _id is not the same of the added entity
            entity = _.find(self.model.entities, {name: entity.name});
            self.setSelectedEntity(entity);
            $rootScope.$broadcast('ModelEditorService.newEntity', entity, false);

        };

        return Model.importAll(params, null, success, error);
    };


    // --- Property ---

    this.addProperty = function () {
        return self._pushInWaitingQueue(self._doAddProperty, arguments);
    };

    this._doAddProperty = function (propertyData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };
        var success = function (value) {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    entity.properties.push(value);
                    $rootScope.$broadcast('ModelEditorService.propertyAdded', {eid: entity._id, property: value});
                    return;
                }
            });
        };

        return new Property(propertyData).$save(params, success, error);
    };

    this.updateProperty = function () {
        return self._pushInWaitingQueue(self._doUpdateProperty, arguments);
    };

    this._doUpdateProperty = function (propertyData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };

        var success = function (value) {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    angular.forEach(entity.properties, function (pV, pKey) {
                        if (pV._id === propertyData._id) {
                            entity.properties[pKey] = value;
                            return;
                        }
                    });
                }
            });
        };

        return Property.update(params, propertyData, success, error);
    };

    this.removeProperty = function () {
        return self._pushInWaitingQueue(self._doRemoveProperty, arguments);
    };

    this._doRemoveProperty = function (propertyData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };

        var success = function () {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    angular.forEach(entity.properties, function (pV, pKey) {
                        if (pV._id === propertyData._id) {
                            entity.properties.splice(pKey, 1);
                            return;
                        }
                    });
                    // delete the propertyId if it is present as a role inside a group
                    angular.forEach(entity.groups, function (group) {
                        angular.forEach(group.roles, function (role) {
                            if (role.propertyId === propertyData._id) {
                                role.propertyId = null;
                            }
                        });
                    });
                }
            });
        };

        return Property.remove(params, propertyData, success, error);
    };

    // --- Navigation ---

    this.addNavigation = function () {
        return self._pushInWaitingQueue(self._doAddNavigation, arguments);
    };

    this._doAddNavigation = function (navigationData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };
        var success = function (nav) {
            angular.forEach(self.model.entities, function (entity) {
                if (entity._id === entityId) {
                    entity.navigationProperties.push(nav);

                    $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
                    $rootScope.$broadcast('ModelEditorService.relationAdded');
                }
            });
        };

        return new Navigation(navigationData).$save(params, success, error);
    };


    this.updateNavigation = function () {
        return self._pushInWaitingQueue(self._doUpdateNavigation, arguments);
    };

    this._doUpdateNavigation = function (navigationData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };

        var success = function (value) {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    angular.forEach(entity.navigationProperties, function (pV, pKey) {
                        if (pV._id === navigationData._id) {
                            entity.navigationProperties[pKey] = value;

                            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
                            return;
                        }
                    });
                }
            });
        };

        return Navigation.update(params, navigationData, success, error);
    };

    this.removeNavigation = function () {
        return self._pushInWaitingQueue(self._doRemoveNavigation, arguments);
    };

    this._doRemoveNavigation = function (navigationData) {
        var sourceEntity;
        angular.forEach(self.model.entities, function (entity) {
            angular.forEach(entity.navigationProperties, function (nav) {
                if (nav._id === navigationData._id) {
                    sourceEntity = entity;
                    return;
                }
            });
        });
        var params = {
            modelId: self.model.projectId,
            entityId: sourceEntity._id
        };

        var success = function () {
            angular.forEach(self.model.entities, function (entity, entityIndex) {
                if (entity._id === sourceEntity._id) {
                    var entityToUpdate = self.model.entities[entityIndex];

                    angular.forEach(entityToUpdate.navigationProperties, function (nav, navIndex) {
                        if (nav._id === navigationData._id) {
                            entityToUpdate.navigationProperties.splice(navIndex, 1);

                            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
                            return;
                        }
                    });
                }
            });
        };

        return Navigation.remove(params, navigationData, success, error);
    };

    this.setSelectedNavigation = function (sId, tid, name) {

        var sEntity = _.find(self.model.entities, {_id: sId});

        this.selectedNavigation = _.find(sEntity.navigationProperties, {toEntityId: tid, name: name});

        $rootScope.$broadcast('ModelEditorService.selectedNavigation', {
            navProp: this.selectedNavigation,
            sourceEntity: sEntity
        });
    };

    // --- Property types ---

    this.getPropertyTypes = function () {
        if (!this.propertyTypes) {
            this.propertyTypes = ['String', 'Decimal', 'Boolean', 'DateTime', 'Binary', 'Byte', 'Double', 'Single', 'Guid', 'Int16', 'Int32', 'Int64', 'SByte', 'Time', 'DateTimeOffset'];
            $rootScope.$broadcast('ModelEditorService.propertyTypesChanged');
        }
        return this.propertyTypes;
    };

    // --- Import excel ---
    this.onImportExcel = function (value) {
        if (value.success) {
            self.model = value.result;
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);

            // reset property types for the new model
            self.propertyTypes = null;
            self.getPropertyTypes();
            self.standardGroups = null;
            self.getStandardGroups();

            self.selectFirstEntity();
        }

        return {success: value.success, messages: value.messages};
    };

    this.onImportExcelSuccess = function (value) {
        if (value.success) {
            self.model = value.result;
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);

            // reset property types for the new model
            self.propertyTypes = null;
            self.getPropertyTypes();
            self.standardGroups = null;
            self.getStandardGroups();

            if (Array.isArray(value.result.createdEntities) && value.result.createdEntities.length > 0) {
                self.setSelectedEntity(value.result.createdEntities[0]);
                $rootScope.$broadcast('ModelEditorService.newEntity', value.result.createdEntities[0], false);
            }
            else {
                self.selectFirstEntity();
            }

        }
        else {
            if (value.messages && value.messages.length > 0) {
                self.importMessages = value.messages;
                $rootScope.$broadcast('ModelEditorService.importMessages');
            }
        }
    };

    this.importExcel = function (files, projectId, fnSuccess) {
        var id = projectId || this.model.projectId;
        var that = this;
        var fnCallback = function (result) {
            var messageInfo = that.onImportExcel(result);
            if (fnSuccess) {
                fnSuccess(messageInfo.success, messageInfo.messages);
            }
        };

        if (files && files.length) {
            $upload.upload({
                url: '/api/models/' + id + '/importxl',
                file: files
            }).success(fnCallback).error(error);
        }
    };

    // --- Update excel ---
    this.getUpdateExcelUrl = function (projectId) {
        var id = projectId || this.model.projectId;
        return '/api/models/' + id + '/updatexl';
    };

    this.getImportExcelUrl = function (projectId) {
        var id = projectId || this.model.projectId;
        return '/api/models/' + id + '/importxl';
    };

    // return import messages
    this.getImportMessages = function () {
        return self.importMessages;
    };

    this.onUpdateExcelSuccess = function (value) {
        if (value.success) {
            self.model = value.result;
            $rootScope.$broadcast('ModelEditorService.modelChanged', self.model);
            self.setSelectedEntity(self.selectedEntity);
        }
        else {
            if (value.messages && value.messages.length > 0) {
                self.importMessages = value.messages;
                $rootScope.$broadcast('ModelEditorService.importMessages');
            }
        }
    };

    this.updateExcel = function (files, projectId, fnSuccess) {
        var id = projectId || this.model.projectId;
        var that = this;
        var fnCallback = function (result) {
            var messageInfo = that.onImportExcel(result);
            if (fnSuccess) {
                fnSuccess(messageInfo.success, messageInfo.messages);
            }
        };

        if (files && files.length) {
            $upload.upload({
                url: '/api/models/' + id + '/updatexl',
                file: files
            }).success(fnCallback).error(error);
        }
    };

    // --- Export excel

    this.exportModelInExcel = function (useTable) {

        var url = '/api/models/' + self.model.projectId + '/exportXl';
        if (useTable) {
            url += '?table=true';
        }

        $window.open(url);
    };

    this.exportEntityInExcel = function (useTable, withNavigation) {

        var url = '/api/models/' + self.model.projectId + '/entities/' + self.selectedEntity._id + '/exportXl';
        if (useTable) {
            url += '?table=true';
        }
        if (withNavigation) {
            url += useTable ? '&nav=true' : '?nav=true';
        }

        $window.open(url);
    };

    // --- Groups
    this.getStandardGroups = function () {
        if (!this.standardGroups) {
            this.standardGroups = {
                Person: ['fullName', 'givenName', 'middleName', 'familyName', 'prefix', 'suffix', 'nickName', 'photo', 'gender', 'title', 'birthday'],
                Address: ['street', 'city', 'region', 'zipCode', 'country', 'poBox', 'extension'],
                Overview: ['description', 'title', 'image', 'mainInfo', 'secondaryInfo'],
                DataSeries: ['dimension1', 'dimension2', 'dimension3', 'data1', 'data2', 'data3'],
                ValueWithUnit: ['value', 'unit'],
                RoleInOrganization: ['role', 'orgName', 'orgUnit'],
                AmountWithCurrency: ['amount', 'currency']
            };

            $rootScope.$broadcast('ModelEditorService.standardGroupsChanged');
        }
        return this.standardGroups;
    };

    this.addGroup = function () {
        return self._pushInWaitingQueue(self._doAddGroup, arguments);
    };

    this._doAddGroup = function (groupData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };
        var success = function (value) {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    entity.groups.push(value);
                    return;
                }
            });
        };

        return new Group(groupData).$save(params, success, error);
    };

    this.removeGroup = function () {
        return self._pushInWaitingQueue(self._doRemoveGroup, arguments);
    };

    this._doRemoveGroup = function (entityId, groupData) {
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };

        var success = function () {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    angular.forEach(entity.groups, function (pV, pKey) {
                        if (pV._id === groupData._id) {
                            entity.groups.splice(pKey, 1);
                            return;
                        }
                    });
                }
            });
        };

        return Group.remove(params, groupData, success, error);
    };

    this.updateGroup = function () {
        return self._pushInWaitingQueue(self._doUpdateGroup, arguments);
    };

    this._doUpdateGroup = function (groupData) {
        var entityId = this.selectedEntity._id;
        var params = {
            modelId: self.model.projectId,
            entityId: entityId
        };

        var success = function (value) {
            angular.forEach(self.model.entities, function (v, key) {
                if (v._id === entityId) {
                    var entity = self.model.entities[key];

                    angular.forEach(entity.groups, function (pV, pKey) {
                        if (pV._id === groupData._id) {
                            // modify only value and roles in order to avoid rerendering of the whole accordion
                            entity.groups[pKey].roles = value.roles;
                            entity.groups[pKey].name = value.name;
                            return;
                        }
                    });
                }
            });
        };

        return Group.update(params, groupData, success, error);
    };

}

module.exports = ['$log', '$q', '$window', '$upload', '$rootScope', 'dm.Model', 'dm.Entity', 'dm.Property', 'dm.Navigation', 'dm.Group', modelEditorService];
