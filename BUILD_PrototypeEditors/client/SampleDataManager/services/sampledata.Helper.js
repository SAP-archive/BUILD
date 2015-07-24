'use strict';
var _ = require('norman-client-tp').lodash;

function sampleDataHelperService($q) {

    return {
        convertErrorSyntax: function (errors, entityTabs, entities) {
            var deffered = $q.defer();
            try {
                var errorList = [];
                var errBody = {};
                var findTabIndex = function (tabname, EntityTabs) {
                    var id = _.findIndex(EntityTabs, function (tab) {
                        return tab.name.toLowerCase() === tabname.toLowerCase();
                    });
                    return id;
                };
                var findIfDuplicate = function (errorList, serachObj) {
                    return _.find(errorList, function (list) {
                        return JSON.stringify(list) === JSON.stringify(serachObj);
                    });
                };

                var createaErrorBody = function (cnvrt, index, entity) {
                    var formatted = {};
                    formatted.text = cnvrt.text;
                    formatted.row = index;
                    formatted.column = cnvrt.colname;
                    formatted.tab = {};
                    formatted.tab.tabNum = cnvrt.tabId;
                    formatted.tab.tabName = cnvrt.entityName;
                    formatted.rowEntity = entity;
                    return formatted;
                };
                _.forEach(errors, function (errored) {
                    errored.tabId = findTabIndex(errored.entityName, entityTabs);
                    _.forEach(entities[errored.tabId].properties, function (entity, index) {
                        var colname = entity[errored.colname];
                        if (colname === errored.column) {
                            errBody = createaErrorBody(errored, index, entity);
                            if (!errored.isKey) {
                                var duplicate = findIfDuplicate(errorList, errBody);
                                if (!duplicate) {
                                    errorList.push(errBody);
                                }
                            }
                            else {
                                errorList.push(errBody);
                            }
                        }
                    });
                });
                deffered.resolve(errorList);
                return deffered.promise;
            }
            catch (err) {
                deffered.reject(err);
            }
            return deffered.promise;
        }
    };
}
module.exports = ['$q', sampleDataHelperService];
