'use strict';

var Q = require('q');
var utility = require('../support/utility.js');

var DataModeler = function (value, cb) {
    var url = value.charAt(0) == '/' ? value : "/" + value;
    browser.get(url);
    var width = 1800;
    var height = 1000;
    browser.driver.manage().window().setSize(width, height);
    if (typeof cb === 'function') cb() ;
};

DataModeler.prototype = Object.create({}, {


// <editor-fold desc="Selectors">
    page: {   get: function () {
        return element(by.css('div.dm-main-container'));
    }},
    btnAdd: {   get: function () {
        return element(by.css('div[ui-popup-open="add-panel"]'));
    }},
    editableEntity: {   get: function () {
        return element(by.css('input[ng-model="$data"]'));
    }},
    btnZoom: {   get: function () {
        return element(by.model('zoom'));
    }},
    btnImportsXls: {   get: function () {
        return element(by.id('dm-header-import-excel'));
    }},
    btnManual: {   get: function () {
        return element(by.css('div[ng-click="ctrl.addNewEntity()"]'));
    }},
    btnSearch: {   get: function () {
        return element(by.css('div[ui-dialog-open="search-entity-panel"]'));
    }},
    btnUndo: {   get: function () {
        return element(by.css('img[ui-tooltip-content="Undo"]'));
    }},
    btnRedo: {   get: function () {
        return element(by.css('img[ui-tooltip-content="Redo"]'));
    }},
    btnShowHideSidePanel: {   get: function () {
        return element.all(by.css('img[ng - click = "ctrl.toggleShowHideSidePanel()"]'));
    }},
    btnComment: {   get: function () {
        return element.all(by.css('img[ui-tooltip-content="Comment"]'));
    }},
    btnHistory: {   get: function () {
        return element.all(by.css('img[ui-tooltip-content="History"]'));
    }},
    btnAddProperty: {   get: function () {
        return element(by.css('div[ng-click="controller.startPropertyCreation()"]'));
    }},
    inputNewPropertyNameInput: {   get: function () {
        return element(by.css('input[ng-model="controller.newProperty.name"]'));
    }},
    selectNewPropertyType: {   get: function () {
        return element(by.model('controller.newProperty.propertyType'));
    }},
    btnAddRelations: {   get: function () {
        return element(by.css('div[ng-click="controller.startNavigationCreation()"]'));
    }},
    inputNewNavigationNameInput: {   get: function () {
        return element(by.css('input[ng-model="controller.newNavigation.name"]'));
    }},
    selectNewNavigationEntityId: {   get: function () {
        return element(by.model('controller.newNavigation.toEntityId'));
    }},
    selectNewNavigationCardinality: {   get: function () {
        return element(by.model('controller.newNavigation.multiplicity'));
    }},

    btnOpenEditor: {get: function () {
        return element(by.css('button[ng-click="controller.openSampleData()"]'));
    }},


//    entities: {   get: function () {
//        return element.all(by.css('.dmd-entityName'));
//    }},


// </editor-fold>

// <editor-fold desc="Actions">
    clickAdd: {
        value: function () {
            this.btnAdd.click()
        }
    },
    clickZoom: {
        value: function () {
            this.btnZoom.click()
        }
    },
    // not use to import entities with an Excel file
    clickImportsXls: {
        value: function () {
            this.btnImportsXls.click()
        }
    },
    clickManual: {
        value: function () {
            this.btnManual.click()
        }
    },
    clickSearch: {
        value: function () {
            this.btnSearch.click()
        }
    },
    clickUndo: {
        value: function () {
            this.btnUndo.click()
        }
    },
    clickPropertiesTab: {
        value: function () {
            browser.waitForAngular();
            element(by.id('dm-properties-tab')).click();
        }
    },
    clickRelationsTab: {
        value: function () {
            browser.waitForAngular();
            element(by.id('dm-relations-tab')).click();
        }
    },
    clickSamplesTab: {
        value: function () {
            browser.waitForAngular();
            element(by.id('dm-sample-tab')).click();
        }
    },

    clickOpenEditor: {
        value: function () {
            browser.waitForAngular();
            this.clickSamplesTab();
            this.btnOpenEditor.click();
        }
    },


// </editor-fold>

// <editor-fold desc="functions">
    /**
     * Cheak an entity is existing given its name, answer: true/false*
     */
    existsEntity: {
        value: function (keys) {
            browser.waitForAngular();
            var promiseArray = [];

            return element.all(by.cssContainingText('.dmd-entityName', keys))
                .then(function (entities) {
                    if (entities.length == 0) {
                        return [false];

                    }
                    else {
                        for (var i = 0; i < entities.length; i++) {
                            var entityName = entities[i];
                            entityName.click();
                            browser.waitForAngular();
                            promiseArray.push(entityName.getText()
                                .then(function (text) {
                                    return (keys === text);
                                }));
                        }
                        return Q.all(promiseArray);
                    }
                })
                .then(function (booleanArray) {
                    var result = false;
                    for (var i = 0; i < booleanArray.length; i++) {
                        if (booleanArray[i]) {
                            result = true;
                        }
                    }
                    return result;
                });
        }
    },

    /**
     * Add an entity of the given name*
     */
    addEntity: {
        value: function (keys) {
            this.clickManual();
            this.editableEntity.clear();
            this.editableEntity.sendKeys(keys);
            this.editableEntity.sendKeys(protractor.Key.ENTER);
        }
    },

    /**
     * Delete an entity given its name*
     */
    deleteEntity: {
        value: function (keys) {
            browser.waitForAngular();
            element.all(by.cssContainingText('div.dmd-entity', keys)).then(function (entities) {
                if (entities.length == 1) {
                    var entity = entities[0];
                    var entityName = entity.element(by.css('div.dmd-entityName'));
                    entityName.click();
                    browser.waitForAngular();
                    var entityRemoveButton = entity.element(by.css('div[ng-click="delete()"]'));
                    entityRemoveButton.click();
                }
                else {

                    for (var i = 0; i < entities.length; i++) {
                        var entity = entities[i];
                        var entityName = entities[i].element(by.css('div.dmd-entityName'));
                        browser.waitForAngular();
                        entityName.click();
                        var entityRemoveButton = entities[i].element(by.css('div[ng-click="delete()"]'));
                        entityName.getText().then(function (text) {
                            if (keys == text) {
                                browser.waitForAngular();
                                entityRemoveButton.click();
                            }
                        });
                    }
                }
            })
        }
    },

    /**
     * Click on an entity given its name*
     */
    clickEntity: {
        value: function (keys) {
            browser.waitForAngular();
            var entityNames = element.all(by.cssContainingText('.dmd-entityName', keys)).map(function (elm) {
                return elm.getText();
            });
            entityNames.then(function (result) {
                for (var i = 0; i < result.length; i++) {
                    var entityName = result[i];
                    if (entityName == keys) {
                        element.all(by.cssContainingText('.dmd-entityName', keys)).get(i).click();
                    }
                }
            })
        }
    },

    /**
     * Check an entity property names given a list of property names as comma-separated list (no space character allowed)*
     */
    checkEntityPropertyNames: {
        value: function (entityName) {
            browser.waitForAngular();
            this.clickEntity(entityName);
            browser.waitForAngular();
            this.clickPropertiesTab();
            var UIPropertyNames = element.all(by.css('.dm-propertyDetail-Name')).map(function (name) {
                return name.getText();
            });
            var propertyNamesAsString = "";
            return UIPropertyNames.then(function (result) {
                var propertyNamesAsString = "";
                for (var i = 0; i < result.length; i++) {
                    if (result[i].trim() != "") {
                        propertyNamesAsString += result[i] + ",";
                    }
//                    console.log("propertyNamesAsString = " + propertyNamesAsString);
                }
                // Remove trailing ,
                propertyNamesAsString = propertyNamesAsString.substring(0, propertyNamesAsString.length - 1);
                return propertyNamesAsString;
            }).then(function (value) {
                return value;
            });
        }

    },

    /**
     * Check an entity property types given a list of property types as comma-separated list (no space character allowed)*
     * BEWARE: no type is to be given for ID property*
     */
    checkEntityPropertyTypes: {
        value: function (entityName) {
            browser.waitForAngular();
            this.clickEntity(entityName);
            browser.waitForAngular();
            this.clickPropertiesTab();
            var UIPropertyTypes = element.all(by.css('.dm-propertyDetail-Type')).map(function (type) {
                return type.getText();
            });
            return UIPropertyTypes.then(function (result) {
                var propertyTypesAsString = "";
                for (var i = 0; i < result.length; i++) {
                    if (result[i].trim() != "") {
                        propertyTypesAsString += result[i] + ",";
                    }
//                    console.log("propertyTypesAsString = " + propertyTypesAsString);
                }
                // Remove trailing ,
                propertyTypesAsString = propertyTypesAsString.substring(0, propertyTypesAsString.length - 1);
                return propertyTypesAsString;
            }).then(function (value) {
                return value;
            });
        }

    },

    /**
     * Check an entity relations names given a comma-separated lists*
     */
    checkEntityRelationNames: {
        value: function (entityName) {
            browser.waitForAngular();
            this.clickEntity(entityName);
            browser.waitForAngular();
            this.clickRelationsTab();
            var UIRelationNames = element.all(by.css('.dm-navigationDetail-Name')).map(function (relation) {
                return relation.getText();
            });
            return UIRelationNames.then(function (result) {
                var RelationNamesAsString = "";
                for (var i = 0; i < result.length; i++) {
                    if (result[i].trim() != "") {
                        RelationNamesAsString += result[i] + ",";
                    }
                }
                // Remove trailing ,
                RelationNamesAsString = RelationNamesAsString.substring(0, RelationNamesAsString.length - 1);
                return RelationNamesAsString;
            }).then(function (value) {
                return value;
            });
        }

    },

    /**
     * Check an entity relations names given a comma-separated lists*
     */
    checkEntityRelationCardinalities: {
        value: function (entityName) {
            browser.waitForAngular();
            this.clickEntity(entityName);
            browser.waitForAngular();
            this.clickRelationsTab();
            var UIRelationCardinalities = element.all(by.css('.dm-navigationDetail-Multiplicity')).map(function (cardinality) {
                return cardinality.getText();
            });
            return UIRelationCardinalities.then(function (result) {
                var RelationCardinalitiesAsString = "";
                for (var i = 0; i < result.length; i++) {
                    if (result[i].trim() != "") {
                        RelationCardinalitiesAsString += result[i] + ",";
                    }
                }
                // Remove trailing ,
                RelationCardinalitiesAsString = RelationCardinalitiesAsString.substring(0, RelationCardinalitiesAsString.length - 1);
                return RelationCardinalitiesAsString;
            }).then(function (value) {
                return value;
            });
        }

    },

    /**
     * Rename an entity given its name and its new name*
     */
    renameEntity: {
        value: function (oldName, newName) {
            element.all(by.cssContainingText('div.dmd-entity', oldName)).then(function (entities) {
                for (var i = 0; i < entities.length; i++) {
                    var entity = entities[i];
                    var entityName = entities[i].element(by.css('div.dmd-entityName'));
                    entityName.getText().then(function (text) {
                        if (text == oldName) {
                            entityName.click();
                            browser.actions().doubleClick(entityName).perform();
                            var label = entity.element(by.model('$data'));
                            label.clear();
                            label.sendKeys(newName);
                        }
                    });
                }
            })
        }
    },

    /**
     * upload an Excel file of entities given its path *
     */
    uploadFile: {
        value: function (absolutePath) {
            browser.waitForAngular();
            browser.driver.getCurrentUrl().then(function (url) {
                var localbaseURL = url.toString().replace("norman/projects", "api/models").replace("dataModel", "importxl");
                browser.manage().getCookies()
                    .then(function (cookies) {
                        utility.importXL(localbaseURL, cookies, absolutePath);
                    });

            });
            browser.driver.navigate().refresh();
            browser.waitForAngular();
        }
    },

    /**
     * Add a property to an entity given: the entity name, the property name and the property type*
     */
    addPropertyToEntity: {
        value: function (entityName, propertyName, propertyType) {
            browser.waitForAngular();
            this.clickEntity(entityName);
            browser.waitForAngular();
            this.clickPropertiesTab();
            //browser.sleep(1000);
            browser.waitForAngular();
            this.btnAddProperty.click();
            browser.waitForAngular();
            //browser.sleep(1000);
            this.inputNewPropertyNameInput.clear();
            this.inputNewPropertyNameInput.sendKeys(propertyName);
            this.selectNewPropertyType.sendKeys(propertyType);
            browser.waitForAngular();
            //browser.sleep(1000);
        }
    },

    /**
     * Add a relation to an entity given: the entity name, the related entity name, the cardinality of the relation and the name of the relation*
     */
    addRelationToEntity: {
        value: function (entityFrom, entityTo, cardinality, relationName) {
            browser.waitForAngular();
            this.clickEntity(entityFrom);
            browser.waitForAngular();
            this.clickRelationsTab();
            browser.waitForAngular();
            //browser.sleep(1000);
            this.btnAddRelations.click();
            browser.waitForAngular();
            //browser.sleep(1000);
            this.inputNewNavigationNameInput.clear();
            this.inputNewNavigationNameInput.sendKeys(relationName);
            this.selectNewNavigationEntityId.sendKeys(entityTo);
            this.selectNewNavigationCardinality.sendKeys(cardinality);
            browser.waitForAngular();
            //browser.sleep(1000);
        }
    }


// </editor-fold>
})
;

module.exports = DataModeler;
