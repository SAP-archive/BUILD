/*eslint dot-notation: 0, no-unused-vars: 0 */
'use strict';

var tp = require('norman-client-tp');
var _ = tp.lodash;

module.exports = [
    '$scope',
    '$rootScope',
    '$http',
    '$upload',
    'ucm.UICatalog', 'uiError',
    function ($scope, $rootScope, $http, $upload, UICatalog, uiError) {
        $scope.$on('$stateChangeSuccess', function () {
            $scope.getCatalogList();
        });

        $scope.uploader = {
            loading: false,
            mdatadownload: false
        };
        $scope.version = {
            error: false
        };

        $scope.isPrivateCheckbox = {
            status: false
        };

        $scope.TYPES = {
            sapui5: 'SAP UI5',
            openui5: 'open UI5'
        };

        $scope.libraryToUpload = {
            version: '',
            type: 'openui5',
            url: ''
        };

        $scope.controlsCheckModel = {
            value: false
        };

        $scope.showLoading = function () {
            $scope.uploader.loading = true;
        };

        $scope.availableVersions = {
            sapui5: [],
            openui5: []
        };

        $scope.fileListData = {};

        $scope.retrieveControlFromRoot = function (control) {
            if ($scope.RootCatalog.controls.hasOwnProperty(control))
                return $scope.RootCatalog.controls[control];
        };
        $scope.populateUrl = function () {
            var version = $scope.libraryToUpload.version,
                type = $scope.libraryToUpload.type,
                isPrivate = '';

            if ($scope.availableVersions[type].indexOf(version) !== -1) {
                $scope.version.error = true;
            }
            else {
                $scope.version.error = false;
                isPrivate = $scope.isPrivateCheckbox.status ? 'true' : 'false';

                $scope.libraryToUpload.url = 'api/uicatalogs/uilib/' + type + '/' + version + '/' + isPrivate + '/uploaduilib';
            }
        };

        $scope.getAllProperitesForControl = function (control, allProps) {
            // 1. get the control from root
            var propertiesControl = $scope.retrieveControlFromRoot(control);
            // 2.Add the properties
            for (var property in propertiesControl.additionalMetadata.properties)
                allProps[property] = propertiesControl.additionalMetadata.properties[property];

            // 3.Check if control has parent
            if (propertiesControl.additionalMetadata.parent === 'sap_ui_base_ManagedObject') return allProps;
            // 4.call the function with parent control name
            $scope.getAllProperitesForControl(propertiesControl.additionalMetadata.parent, allProps);
        };

        $scope.closeDialog = function (id, filelist) {
            $scope.resetUploadDialog();
            var type = filelist.libType,
                version = filelist.libVersion,
                isPrivate = filelist.isPrivate,
                url = 'api/uicatalogs/private/metadatagen/' + version + '/' + isPrivate + '/' + type + '/1.0/generateMetadata.html';
            angular.element(document.getElementById('getmetadata-uilib')).attr('src', url);
            $scope.fileListData = filelist;
        };

        $scope.iframeLoaded = function () {
            if (Object.keys($scope.fileListData).length !== 0) {
                var isPrivateSet = ($scope.fileListData.isPrivate === 'true');
                document.getElementById('getmetadata-uilib').contentWindow.constructControls($scope.fileListData.file, $scope.fileListData.libType, $scope.fileListData.libVersion, isPrivateSet);
                $scope.uploader.mdatadownload = true;
            }
        };

        $scope.resetUploadDialog = function () {
            $scope.uploader.loading = false;
            $scope.isPrivateCheckbox.status = false;
            $scope.libraryToUpload.version = '';
        };

        $scope.downloadMData = function () {
            var data = document.getElementById('getmetadata-uilib').contentDocument.getElementById('libraryMetadata').innerHTML;
            data = JSON.parse(data);
            var blob = new Blob([JSON.stringify(data, null, 4)]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = $scope.fileListData.libType + '_' + $scope.fileListData.libVersion + '.json';
            link.click();
            link.remove();
            $scope.uploader.mdatadownload = false;
        };
        $scope.getAllAggregationsForControl = function (control, allAggregations) {
            // 1. get the control from root
            var aggregationControl = $scope.retrieveControlFromRoot(control);
            // 2.Add the aggregations
            for (var aggregation in aggregationControl.additionalMetadata.aggregations)
                allAggregations[aggregation] = aggregationControl.additionalMetadata.aggregations[aggregation];

            // 3.Check if control has parent
            if (aggregationControl.additionalMetadata.parent === 'sap_ui_base_ManagedObject') return allAggregations;
            // 4.call the function with parent control name
            $scope.getAllAggregationsForControl(aggregationControl.additionalMetadata.parent, allAggregations);
        };
        $scope.getAllEventsForControl = function (control, allEvents) {
            // 1. get the control from root
            var eventsControl = $scope.retrieveControlFromRoot(control);
            // 2.Add the events
            for (var event in eventsControl.additionalMetadata.events)
                allEvents[event] = eventsControl.additionalMetadata.events[event];

            // 3.Check if control has parent
            if (eventsControl.additionalMetadata.parent === 'sap_ui_base_ManagedObject') return allEvents;
            // 4.call the function with parent control name
            $scope.getAllEventsForControl(eventsControl.additionalMetadata.parent, allEvents);
        };


        var getAvailableVersions = function () {
            UICatalog.getAvailableVersions({libType: 'openui5'}, function (response) {
                $scope.availableVersions.openui5 = _.pluck(response, '_id');
            });

            UICatalog.getAvailableVersions({libType: 'sapui5'}, function (response) {
                $scope.availableVersions.sapui5 = _.pluck(response, '_id');
            });
        };

        $scope.getCatalogList = function () {
            $scope.prevSelectedControlKey = '';
            $scope.versionsAvailable = '';

            getAvailableVersions();

            UICatalog.getCatalogList(function (response) {
                $scope.catalogList = response;
                for (var count = 0; count < $scope.catalogList.length; count++) {
                    if ($scope.catalogList[count].catalogName === 'openui5r4') {
                        $scope.Root = [];

                        // root catalog reference - not changed
                        $scope.RootCatalog = $scope.catalogList[count];
                        // root catalog that hold all property/aggregation/event changes
                        $scope.RootCatalogInherited = $scope.catalogList[count];

                        // loop based on every control
                        for (var control in $scope.RootCatalog.controls) {
                            // for this control get all properties
                            var allProps = {};
                            $scope.getAllProperitesForControl(control, allProps);
                            $scope.RootCatalogInherited.controls[control].additionalMetadata.properties = allProps;

                            // for this control get all aggregations
                            var allAggregations = {};
                            $scope.getAllAggregationsForControl(control, allAggregations);
                            $scope.RootCatalogInherited.controls[control].additionalMetadata.aggregations = allAggregations;

                            // for this control get all events
                            var allEvents = {};
                            $scope.getAllEventsForControl(control, allEvents);
                            $scope.RootCatalogInherited.controls[control].additionalMetadata.events = allEvents;
                        }
                        $scope.Root.push($scope.RootCatalogInherited);
                    }
                    else if ($scope.catalogList[count].catalogName === 'r4c1ui5') {
                        $scope.Custom = [];
                        $scope.Custom
                            .push($scope.catalogList[count]);
                    }
                }
                $scope.panes = $scope.Root;

                $scope.catalogInfo = [
                    {
                        name: 'Root'
                    },
                    {
                        name: 'Custom'
                    }
                ];
                $scope.selectedItem = $scope.catalogInfo[0];
                $scope.displayButton = false;
                $scope.displayEditButton = false;
            });

        };
        $scope.handleUILibSuccess = function (response) {
            var filelist = $scope.filterJsFiles(response.file);
            response.file = filelist;
            $scope.closeDialog('uiLibDialog', response);
            $scope.openToastSuccess(response.status + '.Generating metadata.......');
            getAvailableVersions();
        };

        $scope.filterJsFiles = function (files) {
            var filteredJsfiles = _.transform(files, function (result, token) {
                var jsfile = token.match(/.js$/);
                if (jsfile !== null && jsfile[0]) {
                    jsfile = token.substring(10, token.length).replace(/\//g, '.');
                    if (jsfile.indexOf('-dbg.') === -1 &&
                        jsfile.indexOf('sap.ui.thirdparty') === -1 &&
                        jsfile.indexOf('.library') === -1 &&
                        jsfile.indexOf('jquery') === -1 &&
                        jsfile.indexOf('min') === -1 &&
                        jsfile.indexOf('sap-ui-debug') === -1 &&
                        jsfile.indexOf('sap-ui-core') === -1 &&
                        jsfile.indexOf('sap-ui-core-nojQuery') === -1 &&
                        jsfile.indexOf('sap.fiori.core-ext-ushell') === -1 &&
                        jsfile.indexOf('sap.fiori.core-ext') === -1 &&
                        jsfile.indexOf('sap.fiori.core-min-0') === -1 &&
                        jsfile.indexOf('sap.fiori.core-min-1') === -1 &&
                        jsfile.indexOf('sap.fiori.core-min-2') === -1 &&
                        jsfile.indexOf('sap.fiori.core-min-3') === -1 &&
                        jsfile.indexOf('sap.fiori.core-min') === -1 &&
                        jsfile.indexOf('sap.fiori.core') === -1 &&
                        jsfile.indexOf('sap.fiori.messagebundle-preload') === -1 &&
                        jsfile.indexOf('tiny_mce') === -1) {
                        result.push(jsfile.substring(0, jsfile.length - 3));
                    }
                    return result;
                }
            });
            return filteredJsfiles;
        };

        $scope.handleUILibError = function (response) {
            $scope.openToastError(response);
            $scope.closeDialog('uiLibDialog');
        };

        $scope.downloadData = function (data, filename) {
            var blob = new Blob([JSON.stringify(data, null, 4)]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            link.remove();
        };
        // for success messages
        $scope.openToastSuccess = function (text) {
            uiError.create({
                content: text,
                dismissOnTimeout: true,
                timeout: 2000,
                dismissButton: false,
                className: 'success'
            });
        };
        // for error messages/ alert messages
        $scope.openToastError = function (text) {
            uiError.create({
                content: text,
                dismissOnTimeout: true,
                timeout: 2000,
                dismissButton: false
            });
        };
        $scope.selectChange = function () {
            if ($scope.selectedItem.name === 'Root') {
                $scope.panes = $scope.Root;
                $scope.displayButton = false;
                $scope.displayEditButton = false;
                $scope.prevSelectedControlKey = '';
            }
            else {
                $scope.panes = $scope.Custom;
                $scope.displayEditButton = true;
                $scope.prevSelectedControlKey = '';
            }

        };
        $scope.copy = function () {
            if (Object.keys($scope.selectedProperty).length === 0 && Object.keys($scope.selectedAggregation).length === 0 && Object.keys($scope.selectedEvent).length === 0) {
                $scope.openToastError('Copy either property/aggregation/event data of a control');
                return;
            }
            //update catalogFile
            var params = {
                name: $scope.Custom[0].catalogName,
                catalogVersion: $scope.Custom[0].catalogVersion
            };
            UICatalog
                .getCatalog(
                params,
                function (response) {
                    var jsonData = response;
                    $scope.newvalue = JSON.parse(JSON
                        .stringify($scope.value));
                    delete $scope.newvalue['$key'];
                    delete $scope.newvalue['$$hashKey'];
                    // if the custom catalog already has the control-update the sections else place selected data
                    if (jsonData.controls
                        .hasOwnProperty($scope.key)) {
                        $scope.newvalue.additionalMetadata.parent = $scope.key;
                        $scope.newvalue.name = jsonData.controls[$scope.key].name;
                        $scope.newvalue.displayName = jsonData.controls[$scope.key].displayName;
                        $scope.newvalue.displayToUser = jsonData.controls[$scope.key].displayToUser;
                        $scope.newvalue.groupName = jsonData.controls[$scope.key].groupName;

                        if ($scope.selectedProperty) {
                            if (jsonData.controls[$scope.key].additionalMetadata
                                .hasOwnProperty('properties')) {
                                $scope.newvalue.additionalMetadata.properties = jsonData.controls[$scope.key].additionalMetadata.properties;
                            }
                            else {
                                $scope.newvalue.additionalMetadata.properties = {};
                            }

                            for (var key in $scope.selectedProperty) {
                                $scope.newvalue.additionalMetadata.properties[key] = $scope.selectedProperty[key];
                            }
                        }
                        if ($scope.selectedAggregation) {
                            if (jsonData.controls[$scope.key].additionalMetadata
                                .hasOwnProperty('aggregations')) {
                                $scope.newvalue.additionalMetadata.aggregations = jsonData.controls[$scope.key].additionalMetadata.aggregations;
                            }
                            else {
                                $scope.newvalue.additionalMetadata.aggregations = {};
                            }
                            for (var keyA in $scope.selectedAggregation) {
                                $scope.newvalue.additionalMetadata.aggregations[keyA] = $scope.selectedAggregation[keyA];
                            }
                        }
                        if ($scope.selectedEvent) {
                            if (jsonData.controls[$scope.key].additionalMetadata
                                .hasOwnProperty('events')) {
                                $scope.newvalue.additionalMetadata.events = jsonData.controls[$scope.key].additionalMetadata.events;
                            }
                            else {
                                $scope.newvalue.additionalMetadata.events = {};
                            }
                            for (var keyE in $scope.selectedEvent) {
                                $scope.newvalue.additionalMetadata.events[keyE] = $scope.selectedEvent[keyE];
                            }
                        }
                        jsonData.controls[$scope.key] = $scope.newvalue;

                    }
                    else {
                        $scope.newvalue.additionalMetadata.parent = $scope.key;
                        if ($scope.selectedProperty) {
                            $scope.newvalue.additionalMetadata.properties = {};

                            for (var keyP in $scope.selectedProperty) {
                                $scope.newvalue.additionalMetadata.properties[keyP] = $scope.selectedProperty[keyP];
                            }
                        }
                        if ($scope.selectedAggregation) {
                            $scope.newvalue.additionalMetadata.aggregations = {};

                            for (var keyAg in $scope.selectedAggregation) {
                                $scope.newvalue.additionalMetadata.aggregations[keyAg] = $scope.selectedAggregation[keyAg];
                            }
                        }
                        if ($scope.selectedEvent) {
                            $scope.newvalue.additionalMetadata.events = {};

                            for (var keyEv in $scope.selectedEvent) {
                                $scope.newvalue.additionalMetadata.events[keyEv] = $scope.selectedEvent[keyEv];
                            }
                        }
                        jsonData.controls[$scope.key] = $scope.newvalue;
                        //$scope.Custom[0]=jsonData;
                    }
                    delete jsonData['$resolved'];
                    delete jsonData['$promise'];
                    delete jsonData['__v'];

                    //update catalogFile
                    UICatalog.updateCatalog({}, {
                        data: JSON.stringify(jsonData)
                    }, function (response) {
                        $scope.Custom[0] = response;
                        $scope.openToastSuccess('Successfully copied the control to custom catalog');
                    }, function () {
                        $scope.openToastError('Failure in copying control to custom catalog');
                    });
                });
        };
        $scope.selectedControl = function (key, value) {
            $scope.selectedRow = key;
            $scope.key = key;
            $scope.value = value;
            $scope.controlValue = value;
            $scope.originalValue = angular.copy(value);
            $scope.selectedProperty = {};
            $scope.selectedAggregation = {};
            $scope.selectedEvent = {};

            $scope.properties = value.additionalMetadata.properties;
            $scope.originalProperties = angular.copy(value.additionalMetadata.properties);
            $scope.aggregations = value.additionalMetadata.aggregations;
            $scope.originalAggregations = angular.copy(value.additionalMetadata.aggregations);
            $scope.events = value.additionalMetadata.events;
            $scope.originalEvents = angular.copy(value.additionalMetadata.events);
        };
        $scope.setFirst = function (key, value, isFirst) {
            if ($scope.prevSelectedControlKey === '') {
                if (isFirst) {
                    $scope.first = key;
                    $scope.selectedControl(key, value);
                }
            }
            else {
                if ($scope.prevSelectedControlKey === key) {
                    $scope.first = key;
                    $scope.selectedControl(key, value);

                }
            }
        };
        $scope.selectedProperties = function (key, value, isPropertySelected) {
            if (isPropertySelected) {
                $scope.selectedProperty[key] = value;
            }
            else {
                delete $scope.selectedProperty[key];
            }
        };
        $scope.selectedAggregations = function (key, value, isAggregationSelected) {
            if (isAggregationSelected) {
                $scope.selectedAggregation[key] = value;
            }
            else {
                delete $scope.selectedAggregation[key];
            }
        };
        $scope.selectedEvents = function (key, value, isEventSelected) {
            if (isEventSelected) {
                $scope.selectedEvent[key] = value;
            }
            else {
                delete $scope.selectedEvent[key];
            }
        };
        $scope.editCustomCatalog = function () {
            $scope.displayButton = true;
        };
        $scope.possibleValues = function (possibleValues, type) {
            if (possibleValues !== null) {
                var values;
                if (possibleValues.indexOf(',') !== -1) {
                    if (type === 'string') {
                        values = possibleValues.split(',');
                        var possibleData = [];
                        for (var count = 0; count < values.length; count++) {
                            possibleData.push(values[count].trim());
                        }
                        return possibleData;
                    }
                    else {
                        possibleValues = possibleValues.replace(/ /g, '');
                        values = possibleValues.split(',');
                        return values;
                    }
                }
                else {
                    values = [];
                    values.push(possibleValues);
                    return values;
                }
            }
        };
        $scope.editProperty = function (key, value) {
            $scope.prevSelectedControlKey = $scope.key;
            var values;
            var count;
            switch (value.type) {
                case 'string':
                {
                    if (value.possibleValues !== null && value.possibleValues !== undefined) {
                        values = $scope.possibleValues(value.possibleValues, value.type);
                        value.possibleValues = [];
                        value.possibleValues = values;
                    }

                    break;
                }
                case 'float':
                {
                    if (value.defaultValue !== null)
                        value.defaultValue = parseFloat(value.defaultValue);

                    if (value.possibleValues !== null && value.possibleValues !== undefined) {
                        values = $scope.possibleValues(value.possibleValues, value.type);
                        value.possibleValues = [];
                        for (count = 0; count < values.length; count++)
                            value.possibleValues.push(parseFloat(values[count]));
                    }
                    break;
                }
                case 'int':
                {
                    if (value.defaultValue !== null)
                        value.defaultValue = parseInt(value.defaultValue);

                    if (value.possibleValues !== null && value.possibleValues !== undefined) {
                        values = $scope.possibleValues(value.possibleValues, value.type);
                        value.possibleValues = [];
                        for (count = 0; count < values.length; count++)
                            value.possibleValues.push(parseInt(values[count]));
                    }
                    break;
                }
                case 'boolean':
                {
                    if (value.defaultValue !== null)
                        value.defaultValue = (value.defaultValue === 'true') ? true : false;

                    if (value.possibleValues !== null && value.possibleValues !== undefined) {
                        values = $scope.possibleValues(value.possibleValues, value.type);
                        value.possibleValues = [];
                        for (count = 0; count < values.length; count++)
                            value.possibleValues
                                .push((values[count] === 'true') ? true : false);
                    }
                    break;
                }
                case 'sap_ui_core_CSSSize':
                case 'CSSSize':
                {
                    if (value.possibleValues !== null && value.possibleValues !== undefined) {
                        values = $scope.possibleValues(value.possibleValues, value.type);
                        value.possibleValues = [];
                        value.possibleValues = values;
                    }
                    break;
                }
            }
            if (typeof value.displayToUser === 'string')
                value.displayToUser = (value.displayToUser === 'true') ? true : false;

            $scope.Custom[0].controls[$scope.key].additionalMetadata.properties[key] = value;
            $scope.updateCustomCatalog($scope.Custom[0],
                'Property has been edited successfully',
                'Failure in editing property');
        };

        $scope.cancelEdit = function (type) {
            if (type === 'properties') {
                $scope.properties = angular.copy($scope.originalProperties);
            }
            if (type === 'aggregations') {
                $scope.aggregations = angular.copy($scope.originalAggregations);
            }
            if (type === 'events') {
                $scope.events = angular.copy($scope.originalEvents);
            }
            if (type === 'controls') {
                $scope.controlValue = angular.copy($scope.originalValue);
            }
        };
        $scope.deleteProperty = function (key) {
            $scope.prevSelectedControlKey = $scope.key;
            delete $scope.Custom[0].controls[$scope.key].additionalMetadata.properties[key];
            $scope.updateCustomCatalog($scope.Custom[0], 'Property has been successfully deleted', 'Failure in deleting the property');
        };
        $scope.editAggregation = function (key, value) {
            $scope.prevSelectedControlKey = $scope.key;
            if (value.hasOwnProperty('types')) {
                if (value.types !== null) {
                    if (value.types.indexOf(',') !== -1) {
                        var values = value.types.split(',');
                        value.types = [];
                        value.types = values;
                    }
                }
            }
            if (typeof value.displayToUser === 'string')
                value.displayToUser = (value.displayToUser === 'true') ? true : false;

            $scope.Custom[0].controls[$scope.key].additionalMetadata.aggregations[key] = value;
            $scope.updateCustomCatalog($scope.Custom[0], 'Aggregation has been edited successfully', 'Failure in editing aggregation');
        };
        $scope.deleteAggregation = function (key) {
            $scope.prevSelectedControlKey = $scope.key;
            delete $scope.Custom[0].controls[$scope.key].additionalMetadata.aggregations[key];
            $scope.updateCustomCatalog($scope.Custom[0], 'Aggregation has been successfully deleted', 'Failure in deleting the aggregation');
        };
        $scope.editEvent = function (key, value) {
            $scope.prevSelectedControlKey = $scope.key;
            if (typeof value.displayToUser === 'string')
                value.displayToUser = (value.displayToUser === 'true') ? true : false;

            $scope.Custom[0].controls[$scope.key].additionalMetadata.events[key] = value;
            $scope.updateCustomCatalog($scope.Custom[0], 'Event has been edited successfully', 'Failure in editing event');
        };
        $scope.deleteEvent = function (key) {
            $scope.prevSelectedControlKey = $scope.key;
            delete $scope.Custom[0].controls[$scope.key].additionalMetadata.events[key];
            $scope.updateCustomCatalog($scope.Custom[0], 'Event has been successfully deleted', 'Failure in deleting the event');
        };
        $scope.downloadCustomCatalog = function () {
            var params = {
                name: $scope.Custom[0].catalogName,
                catalogVersion: $scope.Custom[0].catalogVersion
            };
            UICatalog
                .getCatalog(
                params,
                function (response) {
                    $scope.downloadData(response,
                        'CustomCatalogTemplate.json');
                },
                function () {
                    $scope
                        .openToastError('Failure in downloading custom catalog');
                });
        };
        $scope.updateCustomCatalog = function (data, successMsg, errorMsg) {
            delete data['$$hashKey'];
            delete data['$promised'];
            delete data['$resolved'];
            delete data['$promise'];
            delete data['__v'];
            for (var keys in data.controls) {
                delete data.controls[keys]['$$hashKey'];
                delete data.controls[keys]['$key'];
            }
            //update catalogFile
            UICatalog.updateCatalog({}, {
                data: JSON.stringify(data)
            }, function (response) {
                $scope.Custom[0] = response;
                $scope.openToastSuccess(successMsg);
            }, function () {
                $scope.openToastError(errorMsg);
            });
        };

        $scope.deleteControls = function () {
            //console.log($scope.selection);
            var params = {
                name: $scope.Custom[0].catalogName,
                catalogVersion: $scope.Custom[0].catalogVersion
            };
            UICatalog
                .getCatalog(
                params,
                function (response) {
                    var jsonData = response;

                    delete jsonData['$resolved'];
                    delete jsonData['$promise'];
                    delete jsonData['__v'];
                    for (var count = 0; count < $scope.selection.length; count++)
                        delete jsonData.controls[$scope.selection[count]];

                    $scope.updateCustomCatalog(jsonData, 'Control has been deleted successfully', 'Failure in deleting control');
                });
            /* var jsonData = {
             catalogName: $scope.panes[0].catalogName,
             catalogVersion: $scope.panes[0].catalogVersion,
             controls: $scope.selection
             }
             UICatalog.deleteControls({}, {
             data: JSON.stringify(jsonData)
             },
             function(response) {
             $scope.Custom[0] = response;
             //reset the data
             $scope.key = null;
             $scope.value = null;
             $scope.selectedProperty = null;
             });*/
        };
        $scope.selection = [];
        $scope.toggleSelection = function toggleSelection(controlName) {
            var idx = $scope.selection.indexOf(controlName);

            // is currently selected
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }

            // is newly selected
            else {
                $scope.selection.push(controlName);
            }
        };

        $scope.checkAll = function () {
            angular.forEach(Object.keys($scope.panes[0].controls), function (item) {
                if ($scope.controlsCheckModel.value) {
                    $scope.selection.push(item);
                }
                else {
                    $scope.selection.splice($scope.selection.indexOf(item), 1);
                }
            });
        };
        $scope.updateControlCatalog = function (key, control) {
            $scope.prevSelectedControlKey = $scope.key;
            $scope.Custom[0].controls[$scope.key] = control;
            $scope.updateCustomCatalog($scope.Custom[0], 'Control Info has been edited successfully', 'Failure in editing control info');
        };
        $scope.onFileSelect = function ($files) {
            var url = 'api/uicatalogs/catalogupdate';
            $scope.uploadFiles($files, url)
                .success(function (response) {
                    $scope.Custom[0] = response;
                    $scope.openToastSuccess('Your file has been uploaded successfully');
                }).error(function () {
                    $scope.openToastError('Error in uploading file');
                });
        };
        $scope.uploadFiles = function ($files, url) {
            if ($files.length > 0) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL($files[0]);
                return $upload.upload({
                    url: url,
                    headers: {
                        'Content-Type': 'application.json'
                    },
                    file: $files[0],
                    fileFormDataName: 'catalogFile'
                });
            }
        };

    }
];
