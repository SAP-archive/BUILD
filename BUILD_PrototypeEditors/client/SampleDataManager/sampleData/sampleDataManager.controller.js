'use strict';

var _ = require('norman-client-tp').lodash;
var moment = require('norman-client-tp').moment;

module.exports = [
    '$rootScope',
    '$scope',
    '$http',
    '$q',
    '$timeout',
    '$interval',
    '$stateParams',
    'sdm.sampleData',
    'SampleDataHelper',
    'uiError',
    'uiDialogHelper',
    function ($rootScope, $scope, $http, $q, $timeout, $interval, $stateParams, sampleDataFactoryService, SampleDataHelper, uiError, uiDialogHelper) {
        var openPopUp = function (text) {
            uiError.create({
                content: text,
                dismissOnTimeout: false,
                dismissButton: true
            });
        };
        /***ERROR HANDLING START***/
        $scope.tab = {
            active: ''
        };

        function handleError(err) {
            $scope.openToast(err.data);
        }


        var previousTab;

        $scope.saveCurrentTab = function () {
            previousTab = $scope.tab.active;
        };
        $scope.changeToPrevTab = function () {
            function change() {
                if ($scope.tab.active !== previousTab) {
                    $scope.tab.active = previousTab;
                }
            }

            $timeout(change, 200);
        };
        var highlight = function (data) {
            if (typeof data.tab !== 'undefined') {
                var tab = data.tab.tabNum;
                var column = data.column;
                var row = data.row;
                var rowEntity = data.rowEntity;
                var tabName = data.tab.tabName;
                var grid = $scope.gridApis[$scope.tab.active].grid;
                var changeTab = function () {
                    $scope.entityTabs[tab].gridOptions.enableCellEditOnFocus = false;
                    grid.api.cellNav.scrollTo(grid, $scope, rowEntity, null);
                    $scope.entityTabs[tab].activeErrorStyle = {
                        background: '#EF6152'
                    };
                    $scope.entityTabs[tab].inactiveErrorStyle = {
                        color: '#EF6152'
                    };
                    if ($scope.entityTabs[tab].gridOptions.data[row].isHighLight) {
                        $scope.entityTabs[tab].gridOptions.data[row].isHighLight.push(column);
                    }
                    else {
                        $scope.entityTabs[tab].gridOptions.data[row].isHighLight = [column];
                    }
                    if (!$scope.entityTabs[tab].gridOptions.data[row].errorText) {
                        $scope.entityTabs[tab].gridOptions.data[row].errorText = {};
                    }
                    $scope.entityTabs[tab].gridOptions.data[row].errorText[column] = data.text;
                    $scope.gridApis[tabName].selection.selectRow(data.rowEntity);
                    $scope.$emit('uiGridEventEndCellEdit');
                };
                $timeout(changeTab, 200);
            }
        };
        var removehighlight = function (data) {
            if (typeof data.tab !== 'undefined') {
                var tab = data.tab.tabNum;
                var row = data.row;

                if ($scope.entityTabs[tab].gridOptions.data[row]) {
                    delete $scope.entityTabs[tab].gridOptions.data[row].isHighLight;
                    delete $scope.entityTabs[tab].gridOptions.data[row].errorText;
                }
            }
        };

        /***ERROR HANDLING END***/
        function getForeignKeyName(foreignKeyId, entityId, idMap) {
            var foreignKeyProp = idMap.foreignKeyMap[entityId][foreignKeyId];
            var relationName = foreignKeyProp.relationName;
            var sourceEntityId, targetEntityId, sourceEntityName, targetEntityName;
            if (foreignKeyProp.multiplicity) {
                sourceEntityId = idMap.foreignKeyMap[entityId][foreignKeyId].entityId;
                sourceEntityName = idMap.entityMap[sourceEntityId].name;
                targetEntityName = idMap.entityMap[entityId].name;
            }
            else {
                targetEntityId = idMap.foreignKeyMap[entityId][foreignKeyId].entityId;
                sourceEntityName = idMap.entityMap[entityId].name;
                if (foreignKeyProp.selfNavigation) {
                    targetEntityName = sourceEntityName;
                }
                else {
                    targetEntityName = idMap.entityMap[targetEntityId].name;
                }
            }
            return sourceEntityName + '.' + relationName + '.' + targetEntityName;
        }

        function rebaseSampleData(entityMeta, properties) {
            var aDMProperties = _.map(entityMeta.properties, 'name');
            var propName = null,
                i;
            var loopInPropArray = function (value, index) {
                if ((value !== propName) && (value.toLowerCase() === propName.toLowerCase())) {
                    properties[i][aDMProperties[index]] = properties[i][propName];
                    delete properties[i][propName];
                }
            };
            for (i = 0; i < properties.length; i++) {
                for (propName in properties[i]) {
                    aDMProperties.forEach(loopInPropArray);
                }
            }
        }

        $scope.$on('removeError', function (event, data) {
            var findTabIndex = function (tabname, EntityTabs) {
                var id = _.findIndex(EntityTabs, function (tab) {
                    return tab.name.toLowerCase() === tabname.toLowerCase();
                });
                return id;
            };
            var tab = findTabIndex(data, $scope.entityTabs);
            delete $scope.entityTabs[tab].inactiveErrorStyle;
            delete $scope.entityTabs[tab].activeErrorStyle;
        });
        $scope.$on('SampleDataEditor', function (event, data) {
            $rootScope.loadSDEDitor = false;
            $scope.getEntityNavDataForProj(data.id, data.entityName);
        });
        $scope.$on('hidePop', function () {
            $timeout(function () {
                $scope.popupShow = {
                    visibility: 'hidden'
                };
            }, 250);
        });
        $scope.$on('emitRow', function (event, emitRow) {
            $scope.popupShow = {
                visibility: 'hidden'
            };
            if (emitRow.row.isSelected) {
                $timeout(function () {
                    $scope.popupShow = {
                        visibility: 'visible',
                        top: emitRow.coordinates.y + 'px',
                        left: '45px'
                    };
                }, 251);
                $scope.emittedRow = emitRow.row;
            }
        });
        var addLineListener = $scope.$on('addLine', function () {
            $scope.triggerNewLine();
        });

        $scope.$on('$destroy', function () {
            addLineListener(); // remove listener.
        });

        $scope.saveNcloseDialog = function () {
            return function () {
                $scope.triggerSave();
            };
        };

        $scope.cleanDialog = function (id) {
            angular.element(document.getElementById(id)).data().$isolateScope.dialogClean();
        };

        $scope.triggerModalClick = $scope.saveNcloseDialog('sd-grid-dialog-id');

        $scope.openSDDialog = function () {
            angular.element(document.getElementById('ui-dialog-modal-backdrop')).bind('click', $scope.triggerModalClick);
        };
        $scope.reOpenOnError = function () {
            uiDialogHelper.open('sd-grid-dialog-id');
        };

        $scope.addHiddenCol = function (colName) {
            if (!$scope.hiddenCols[$scope.tab.active]) {
                $scope.hiddenCols[$scope.tab.active] = [];
            }
            $scope.hiddenCols[$scope.tab.active].push(colName);
        };

        $scope.checkarray = [];

        function dateCheck(a) {
            for (var i = 0; i < a.properties.length; i++) {
                switch (a.properties[i].propertyType.toLowerCase()) {
                case 'time':
                case 'datetime':
                    $scope.checkarray.push({
                        name: a.properties[i].name,
                        type: a.properties[i].propertyType.toLowerCase()
                    });
                }
            }
        }

        function dateParse(data, opt) {
            if ($scope.checkarray.length > 0) {
                var checkArr = $scope.checkarray;
                for (var i = 0; i < checkArr.length; i++) {
                    switch (checkArr[i].type) {
                    case 'datetime':
                        for (var j = 0; j < data.properties.length; j++) {
                            var parse = data.properties[j][checkArr[i].name];
                            switch (opt) {
                            case 'format':
                                if (parse) {
                                    parse = moment(parse).format('YYYY-MM-DD');
                                }
                                data.properties[j][checkArr[i].name] = parse;
                                break;
                            case 'parse':
                                if (parse) {
                                    parse = moment.parseZone(parse + ' UTC');
                                    parse = parse._d;
                                }
                                if ((parse instanceof Date) && isFinite(parse)) {
                                    data.properties[j][checkArr[i].name] = parse;
                                }
                                break;
                            }
                        }
                        break;
                    case 'time':
                        for (var k = 0; k < data.properties.length; k++) {
                            parse = data.properties[k][checkArr[i].name];
                            switch (opt) {
                            case 'format':
                                if (parse) {
                                    parse = moment.utc(parse).format('HH:mm:ss');
                                    data.properties[k][checkArr[i].name] = parse;
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            return data;
        }

        $scope.getEntityNavDataForProj = function (projId, entityName) {
            var params = {
                projId: projId,
                entityName: entityName
            };
            $scope.saveError = false;

            function setHeaderCSS(grid, row, column) {
                if (column.colDef.isForeignKey) {
                    return 'sd-foreign-key-class';
                }
            }

            sampleDataFactoryService.getEntityNavDataForProj(params, function (response) {
                    var registerGridApi = function (gridApi) {
                        if (!$scope.gridApis) {
                            $scope.gridApis = {};
                        }
                        $scope.gridApis[gridApi.grid.options.tabName] = gridApi;
                        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            if (row.isSelected) {
                                $scope.lastSelectedRow = row;
                            }
                            $scope.gridApis[gridApi.grid.options.tabName] = gridApi;
                        });
                    };
                    var sampleDataNav = JSON.parse(JSON.stringify(response));
                    if (!sampleDataNav) {
                        handleError(new Error('No Sample Data found'));
                    }
                    $scope.dataModelJson = sampleDataNav.dataModelJson;
                    $scope.sampleData = sampleDataNav.sampleData;
                    $scope.hiddenCols = {};
                    $scope.navigationEntities = sampleDataNav.navigationEntities;
                    // Lower case key value object pair
                    var dataModelEntity = _.transform(sampleDataNav.dataModelJson.entities, function (result, entityObj) {
                        result[entityObj.name.toLowerCase()] = entityObj;
                        return result;
                    });
                    // Lower case key value object pair
                    var sampleDataEntity = _.transform(sampleDataNav.sampleData.entities, function (result, entityObj) {
                        result[entityObj.entityName.toLowerCase()] = entityObj;
                        return result;
                    }, {});

                    var entityLCase = entityName.toLowerCase();
                    var tableNamesL = [entityLCase];
                    var entityTabs = [];
                    for (var ind = 0; ind < sampleDataNav.navigationEntities.length; ind++) {
                        tableNamesL.push(sampleDataNav.navigationEntities[ind].entityName.toLowerCase());
                    }
                    $scope.checkarray = [];
                    for (var i = 0; i < tableNamesL.length; i++) {
                        var entityMeta = dataModelEntity[tableNamesL[i]];
                        var entityData = sampleDataEntity[tableNamesL[i]];
                        dateCheck(entityMeta);

                        if ($scope.checkarray.length > 0) {
                            entityData = dateParse(entityData, 'format');
                        }
                        rebaseSampleData(entityMeta, entityData.properties);
                        var entityTab = {
                            hasError: true,
                            name: entityData.entityName,
                            gridOptions: {
                                data: entityData.properties,
                                dataModel: sampleDataNav.dataModelJson,
                                rowHeight: 30,
                                columnDefs: [],
                                excludeProperties: ['dirtyCells'],
                                enableHorizontalScrollbar: 0,
                                enableVerticalScrollbar: 2,
                                enableCellSelection: true,
                                enableCellEditOnFocus: true,
                                enableCellEdit: true,
                                enableFiltering: true,
                                tabName: entityData.entityName,
                                onRegisterApi: registerGridApi,
                                virtualizationThreshold: 2000,
                                scrollThreshold: 10,
                                minRowsToShow: 18,
                                enableRowHeaderSelection: false
                            }
                        };
                        if (i === 0) {
                            entityTab.primaryTable = true;
                        }
                        else {
                            entityTab.primaryTable = false;
                        }
                        entityTab.gridOptions.columnDefs.push({
                            name: '+',
                            width: 30,
                            isForeignKey: false,
                            enableSorting: false,
                            isPrimaryKey: false,
                            isRowHeader: true,
                            enableCellEdit: false,
                            headerCellClass: setHeaderCSS,
                            cellTemplate: 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/rowTemplate.html',
                            headerCellTemplate: 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/cornerTemplate.html'
                        });
                        var pkColDefItem = [];
                        var fkColDefItem = [];
                        var orderColDefItem = [];
                        for (var j = 0; j < entityMeta.properties.length; j++) {
                            var colDefItem = {
                                name: entityMeta.properties[j].name,
                                order: entityMeta.properties[j].order,
                                isForeignKey: entityMeta.properties[j].isForeignKey,
                                enableSorting: true,
                                enableHiding: false,
                                headerCellClass: setHeaderCSS,
                                isPrimaryKey: entityMeta.properties[j].isKey,
                                cellTemplate: 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/cellTemplate.html',
                                editableCellTemplate: 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/editableCellTemplate.html',
                                headerCellTemplate: 'resources/norman-prototype-editors-client/SampleDataManager/sampleData/columnHeader.html'
                            };
                            if (entityMeta.properties[j].calculated.inputProperties.length !== 0) {
                                colDefItem.enableCellEdit = false;
                            }
                            if (entityMeta.properties[j].isForeignKey) {
                                colDefItem.displayName = getForeignKeyName(entityMeta.properties[j]._id, entityMeta._id, response.idMap);
                                fkColDefItem.push(colDefItem);
                            }
                            else if (entityMeta.properties[j].isKey) {
                                colDefItem.displayName = colDefItem.name;
                                pkColDefItem.push(colDefItem);
                            }
                            else {
                                colDefItem.displayName = colDefItem.name;
                                orderColDefItem.push(colDefItem);
                            }
                        }
                        // sort the non key properties
                        var sortedProperties = _.sortBy(orderColDefItem, 'order');
                        entityTab.gridOptions.columnDefs = entityTab.gridOptions.columnDefs.concat(pkColDefItem.concat(sortedProperties, fkColDefItem));
                        entityTabs.push(entityTab);
                    }
                    $scope.entityTabs = entityTabs;
                    $scope.selectedTab = entityTabs[0].name;
                    uiDialogHelper.open('sd-grid-dialog-id');
                },
                function (err) {
                    handleError(err);
                });
        };

        $scope.triggerSave = function () {
            var entityNameLcase;
            angular.element(document.getElementById('ui-dialog-modal-backdrop')).unbind('click', $scope.closeSDdialog);
            var aHiddenColNames = {};

            function _findGridOptions(row) {
                return row.name.toLowerCase() === $scope.localEntityName.toLowerCase();
            }

            function _getHiddenColumns(tabName) {
                return $scope.hiddenCols[tabName];
            }
            for (var c = 0; c < $scope.sampleData.entities.length; c++) {
                $scope.localEntityName = $scope.sampleData.entities[c].entityName;
                aHiddenColNames[$scope.localEntityName.toLowerCase()] = _getHiddenColumns($scope.localEntityName);
                var gridDataResult = _.result(_.find($scope.entityTabs, _findGridOptions), 'gridOptions');
                if (gridDataResult) {
                    var gridData = gridDataResult.data;
                    $scope.sampleData.entities[c].properties = gridData;
                }
            }

            function findIndexOfEntity(item) {
                return item.entityName.toLowerCase() === entityNameLcase;
            }

            for (var i = 0; i < $scope.entityTabs.length; i++) {
                entityNameLcase = $scope.entityTabs[i].name.toLowerCase();
                var replaceEntity = _.find($scope.sampleData.entities, findIndexOfEntity);
                replaceEntity.properties = _.clone($scope.entityTabs[i].gridOptions.data, true);
                for (var j = 0; j < replaceEntity.properties.length; j++) {
                    var properties = replaceEntity.properties[j];
                    delete properties['+'];
                    if (properties.hasOwnProperty('dirtyCells')) {
                        delete properties.dirtyCells;
                    }
                    if (properties.hasOwnProperty('isHighLight')) {
                        delete properties.isHighLight;
                    }
                    if (properties.hasOwnProperty('errorText')) {
                        delete properties.errorText;
                    }
                    if (aHiddenColNames[entityNameLcase]) {
                        for (var n = 0; n < aHiddenColNames[entityNameLcase].length; n++) {
                            delete properties[aHiddenColNames[entityNameLcase][n]];
                        }
                    }
                }
            }
            var postData = {
                sampleData: $scope.sampleData,
                dataModelJson: $scope.dataModelJson
            };
            var params = {
                projId: $scope.sampleData.projectId
            };

            var fnError = function (error) {
                var entityTabs = $scope.entityTabs;
                var entities = $scope.sampleData.entities;

                _.forEach($scope.errorList, removehighlight);

                SampleDataHelper.convertErrorSyntax(error.data.errorList, entityTabs, entities)
                    .then(function (response) {
                        $scope.errorList = response;
                        openPopUp($scope.errorList.length + ' error(s) found,fix them before you can proceed');
                        _.forEach($scope.errorList, highlight);
                    }, function (err) {
                        openPopUp(err);
                    });
            };
            var fnSuccess = function () {
                angular.element(document.getElementById('ui-dialog-modal-backdrop')).unbind('click', $scope.triggerModalClick);
                // close the dialog
                $scope.saveError = false;
                $scope.cleanDialog('sd-grid-dialog-id');
            };
            sampleDataFactoryService.saveSampleData(params, postData, fnSuccess, fnError);
        };

        $scope.sdCancelled = function () {
            $scope.checkarray = [];
            angular.element(document.getElementById('ui-dialog-modal-backdrop')).unbind('click', $scope.triggerModalClick);
        };
        $scope.triggerNewLine = function (activeRow) {
            var selectedTab = $scope.getSelectedTabId();
            var index = _.findIndex($scope.entityTabs, function (row) {
                return row.name.toLowerCase() === selectedTab.toLowerCase();
            });
            var data = $scope.entityTabs[index].gridOptions.data;
            var columnDefs = $scope.entityTabs[index].gridOptions.columnDefs;
            var sampleRow = {};
            for (var c = 0; c < columnDefs.length; c++) {
                sampleRow[columnDefs[c].name] = null;
            }
            if (activeRow) {
                var selectedRowIndex = _.findIndex(data, function (item) {
                    return item.$$hashKey === activeRow.entity.$$hashKey;
                });
                data.splice(selectedRowIndex + 1, 0, sampleRow);
                var grid = $scope.gridApis[$scope.tab.active].grid;
                $scope.gridApis[$scope.tab.active].core.refresh();
                $timeout(function () {
                    var elementId = grid.rows[selectedRowIndex + 1].entity.$$hashKey;
                    var clientHeight = document.documentElement.clientHeight;
                    var elementBottomPosition = document.querySelectorAll('#btn-' + elementId)[0].getBoundingClientRect().bottom;
                    if (elementBottomPosition <= clientHeight) {
                        grid.api.cellNav.scrollTo(grid, $scope, grid.rows[selectedRowIndex + 1].entity, null);
                    }
                }, 300);
            }
            else {
                data.push(sampleRow);
                $timeout(function () {
                    var grid = $scope.gridApis[$scope.tab.active].grid;
                    grid.api.cellNav.scrollTo(grid, $scope, grid.rows[grid.rows.length - 1].entity, null);
                });
            }
        };

        $scope.triggerDelete = function () {
            var selectedTab = $scope.getSelectedTabId();
            var selEntityTab = _.find($scope.entityTabs, function (entityTab) {
                return entityTab.name.toLowerCase() === selectedTab.toLowerCase();
            });
            if ($scope.gridApis[selEntityTab.name]) {
                var deletableData = $scope.gridApis[selEntityTab.name].selection.getSelectedRows();
                selEntityTab.gridOptions.data = _.difference(selEntityTab.gridOptions.data, deletableData);

                if (!(_.some($scope.entityTabs[0].gridOptions.data, 'errorText'))) {
                    delete $scope.entityTabs[0].inactiveErrorStyle;
                    delete $scope.entityTabs[0].activeErrorStyle;
                }
            }
        };

        $scope.triggerDuplicate = function () {
            var selectedTab = $scope.getSelectedTabId();
            var selEntityTab = _.find($scope.entityTabs, function (entityTab) {
                return entityTab.name.toLowerCase() === selectedTab.toLowerCase();
            });
            if ($scope.gridApis[selEntityTab.name]) {
                var index = _.findIndex($scope.entityTabs, function (row) {
                    return row.name.toLowerCase() === selectedTab.toLowerCase();
                });
                var data = $scope.entityTabs[index].gridOptions.data;
                var selectedData = JSON.parse(JSON.stringify($scope.gridApis[selEntityTab.name].selection.getSelectedRows())); // to avoid reference
                var selectedRowIndex = _.findIndex(data, function (item) {
                    return item.$$hashKey === selectedData[selectedData.length - 1].$$hashKey;
                });
                for (var i = 0; i < selectedData.length; i++) {
                    delete selectedData[i].$$hashKey;
                    data.splice(selectedRowIndex + i + 1, 0, selectedData[i]);
                }
            }
        };

        $scope.getSelectedTabId = function () {
            return $scope.tab.active;
        };

        $scope.isActiveTab = function (tabKey) {
            return tabKey === $scope.currentEntityTab.key;
        };

        /*** Key Event Handlers START ****************/
        $scope.onKeyUp = function ($event) {
            if ($event.shiftKey) {
                if (!$scope.lastSelectedRow) {
                    return;
                }
                var gridRows = $scope.gridApis[$scope.getSelectedTabId()].grid.rows;
                var indexAt = _.findIndex(gridRows, function (item) {
                    return item.entity.$$hashKey === $scope.lastSelectedRow.entity.$$hashKey;
                });
                var nextRow;
                switch ($event.keyCode) {
                case 40:
                    nextRow = gridRows[indexAt + 1];
                    break;
                case 38:
                    nextRow = gridRows[indexAt - 1];
                    break;
                }
                if (nextRow) {
                    if (nextRow && nextRow.isSelected) {
                        // find next unselected Row
                        while (nextRow && nextRow.isSelected) {
                            if ($event.keyCode === 40) {
                                nextRow = gridRows[++indexAt];
                            }
                            else if ($event.keyCode === 38) {
                                nextRow = gridRows[--indexAt];
                            }
                        }
                        if (nextRow) {
                            $scope.gridApis[$scope.getSelectedTabId()].selection.selectRow(nextRow.entity);
                        }
                    }
                    else {
                        $scope.gridApis[$scope.getSelectedTabId()].selection.selectRow(nextRow.entity);
                    }
                }

            }

        };

        $scope.isSelected = function (tabName) {
            if (tabName.toLowerCase() === $scope.tab.active.toLowerCase()) {
                return true;
            }
            return false;
        };

        $scope.okBtnClicked = function () {
            $scope.triggerSave();
            return false; // return false to avoid dialog close
        };
        /*** Key Event Handlers END ***************/
        // Trigger Editor dialog on load of Controller
        if ($rootScope.loadSDEDitor) {
            $rootScope.loadSDEDitor = false;
            $scope.getEntityNavDataForProj($rootScope.sampleData.id, $rootScope.sampleData.entityName);
        }
        this.sampleDataControllerSafe = true;
}
];
