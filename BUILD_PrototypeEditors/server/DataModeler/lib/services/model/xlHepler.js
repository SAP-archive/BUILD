'use strict';
var importModel = require('./importModel.js');
var util = require('util');
var XLSX = require('xlsx');
var lodash = require('norman-server-tp').lodash;
var entityHelper = require('./entityHelper.js');
var navigationPropertyHelper = require('./navigationPropertyHelper.js');

// case insensitive regexp on table & column names
var ODATA_IDENTIFIER = /^[a-z_]\w{0,39}$/i;
var FK = /^[a-z_]\w{0,39}\.[a-z_]\w{0,39}\.[a-z_]\w{0,39}$/i;
var FROM = /^from\.([a-z_]\w{0,39})$/i;
var TO = /^to\.([a-z_]\w{0,39})$/i;

var R1 = 'Object {name}: You need one column named “ID”.';
var R2 = 'Object {name}: You need only one column named “ID”';
var R3 = 'Object {name}: The first property of the Object must be "ID".';
var R4 = 'A file cannot contain both foreign keys and mapping tables.';
var R5a = 'Invalid foreign key. Please check the syntax: [Object name from].[Relation name].[Object name to]';
var R5b = 'Invalid Foreign Key. Object {Object name from} or {Object name to} does not exist.';
var R5c = 'Invalid Foreign Key. Object {Object name from} or {Object name to} must be identified as the Object that contains this Foreign Key.';
var R6a = 'Invalid mapping table name. Please check the syntax: [Object name from].[Relation name]';
var R6b = 'Invalid mapping table name. Object {Object name from} does not exist.';
var R7a = 'Invalid column name for the source Object. Please check the syntax: From.[Object name]';
var R7b = 'Invalid column name for the source Object. Please check the syntax: To.[Object name]';
var R7c = 'Invalid column name. Object {Object name from} or {Object name to} does not exist';
var R7d = 'Invalid mapping table. A mapping table shall have only a From.[Object name] and To.[Object name] columns.';
// R8 defined in importModel.js
var R9a = 'Please check the name. Names may not contain more than 40 characters.';
var R9b = 'Please check the name. The first character of a name must be alphabetic or “_”.';
var R9c = 'Please check the name. The next characters of a name must be alphanumeric or “_”.';
var R10a = 'You cannot use duplicate names. Property (or Object or Relation) {Object name} is a duplicate name.';
var R10b = 'You cannot import an Object that already exists in the Data Model. Object {name} already exists.';
var R11 = 'No data available for Object {name}.';
var R12 = 'The Properties and Relations of the Object {name} must be identical to those in the target model.';
var R13 = 'Invalid N - N cardinality for relation {name}. A relation can either be 1 - N or 1 - 1.';
var R14 = 'Object {name}: The content of the "ID" property shall be unique and can\'t be empty.';
var R15 = 'Invalid foreign key. Object {Object name} ID {value} referenced in entity foreign keys or mapping tables {relation name} doesn\'t exist in the model.';

/**
 * utility hash table that search its keys case insensitively
 * overrides the hasOwnProperty to make it case insensitive
 * @constructor
 */
function CaseInsensitiveHash() {
}

CaseInsensitiveHash.prototype.hasOwnProperty = function (sNeedle) {
    var aKeys = Object.keys(this),
        bHasOwnProperty = false,
        i;

    sNeedle = sNeedle.toLowerCase();

    for (i = 0; !bHasOwnProperty && i < aKeys.length; i++) {
        if (aKeys[i].toLowerCase() === sNeedle) {
            bHasOwnProperty = true;
        }
    }

    return bHasOwnProperty;
};

function createError(description, code, table, cell) {
    var message = {level: 'error', code: code, description: description};
    if (table) {
        message.sheet = table.origin.sheetName;
        if (table.origin) {
            if (table.origin.isTable) {
                message.table = table.name;
            }
            message.cell = cell ? cell : table.origin.firstColumn + table.origin.firstRow;
        }
    }

    return message;
}

function addFKData(entityData, relationData, fkName) {
    entityData.forEach(function (element) {
        var search = {};
        search[entityHelper.PROPERTY_ID.name] = element[entityHelper.PROPERTY_ID.name];
        var relData = lodash.find(relationData, search);

        if (relData) {
            element[fkName] = relData[fkName];
        }
    });
}

function createNavigationProperty(relationName, fromEntity, toEntity, prop1, prop2, cardinality) {
    fromEntity.navigationProperties.push({
        name: relationName,
        multiplicity: cardinality,
        toEntityId: toEntity ? toEntity.name : null,
        referentialConstraints: [
            {
                entityId: fromEntity.name,
                propertyRef: cardinality ? prop1 : prop2
            },
            {
                entityId: toEntity.name,
                propertyRef: cardinality ? prop2 : prop1
            }
        ]
    });
}

function getUniqueData(data, keys) {
    var names = {};
    return data.filter(function (element) {
        var key = '', result = false;
        keys.forEach(function (e) {
            key += e;
            key += ':';
            key += element[e];
            key += ';';
        });

        if (!names.hasOwnProperty(key)) {
            result = true;
            names[key] = true;
        }

        return result;
    });
}

/**
 * determines the cardinality of a relation from its data
 *
 * @param {string} unique array of data {keyFrom: value1, keyTo: value2}
 * @param {array}  keys array of keys (keyFrom,keyTo) to match against
 * @returns {string}
 */
function getCardinalityForFK(unique, keys) {
    var cardinality = 'n', // can be 1,n
        keyFrom = keys[0], // fk or pk
        keyTo = keys[1], // fk or pk
        rel = {}; // map of the keyFrom:[dataTo]

    if (unique.length > 0) {
        // if we have a navigation toward itself

        // if each of the keyFrom data has only one keyTo data associated then it's a 1 cardinality
        // in all other cases (1..n, n..1) it's a n cardinality

        // look for all the data associated to keyFrom
        unique.forEach(function (element) {
            if (!rel[element[keyFrom]]) {
                rel[element[keyFrom]] = [];
            }

            rel[element[keyFrom]].push(element[keyTo]);
        });

        // do we have 1 and only 1 data for each of the entries?
        cardinality = '1';

        Object.keys(rel).some(function (key) {
            if (rel[key].length !== 1) {
                cardinality = 'n';
                return true;
            }
        });
    }

    return cardinality;
}

function getCardinalityForMappingTable(table, messages) {
    var target = table.columns[1] && table.columns[1].name ? table.columns[1].name.split('.')[1] : null,
        cardinality = false,
        keys,
        inverseKeys,
        unique;

    if (target) {
        keys = [table.columns[0].name, table.columns[1].name];
        unique = getUniqueData(table.data, keys);

        // test from > to
        cardinality = getCardinalityForFK(unique, keys) === 'n';

        if (cardinality) {
            // test to > from
            inverseKeys = keys.reverse();
            unique = getUniqueData(table.data, inverseKeys);

            // n..n forbidden (if there is not data, the relation is 1-n)
            if (unique.length !== 0 && getCardinalityForFK(unique, inverseKeys) === 'n') {
                messages.push(createError(R13.replace('{name}', table.name), 'R13', table));
                cardinality = null;
            }
        }
    }

    return cardinality;
}

function fillRelationTable(table, messages) {
    var split = table.name.split('.'),
        source = split[0],
        relationName = split[1],
        target = table.columns[1] && table.columns[1].name ? table.columns[1].name.split('.')[1] : null,
        data = [];

    var relation = {name: relationName, source: source, target: target};

    relation.cardinality = getCardinalityForMappingTable(table, messages);
    relation.fkName = navigationPropertyHelper.generateFKName();
    relation.property = util._extend({
        isKey: false,
        propertyType: 'String',
        label: table.columns[0].name
    }, table.columns[0]);

    relation.property.name = relation.fkName;

    table.data.forEach(function (element) {
        var newElement = {}, val0 = element[table.columns[0].name], val1 = element[table.columns[1].name];
        /* JLT write : after discussing with JLS, if I understand the issue correctly, the problem is coming from the fact that the ID should be a "String" type and if not (The guy puts a number, or a date) it doesn't work.
         From my perspective for the column ID whatever XLS type in the XLS file it should be considered/managed as a string.*/

        val0 = val0 && val0.toString ? val0.toString() : val0;
        val1 = val1 && val1.toString ? val1.toString() : val1;

        if (relation.cardinality) {
            newElement[entityHelper.PROPERTY_ID.name] = val1;
            newElement[relation.fkName] = val0;
        }
        else {
            newElement[entityHelper.PROPERTY_ID.name] = val0;
            newElement[relation.fkName] = val1;
        }

        data.push(newElement);
    });
    relation.data = data;

    return relation;
}

function generateRelationFromFK(table, property, entities) {
    var split = property.name.split('.'),
        source = split[0],
        relationName = split[1],
        target = split[2],
        data = [];

    var idKey;
    table.data.forEach(function (line) {
        if (!idKey) {
            Object.keys(line).some(function (key) {
                if (key.toLocaleLowerCase() === entityHelper.PROPERTY_ID.name.toLowerCase()) {
                    idKey = key;
                    return true;
                }
            });

            if (!idKey) {
                throw new Error('Not found ID');
            }
        }

        data.push({id: line[idKey], fk: line[property.name]});

        delete line[property.name];
    });

    var relation = {
        name: relationName,
        source: entities[source.toLowerCase()].name,
        target: entities[target.toLowerCase()].name
    };

    // if the from and the to objects are the same, we need to determine the cardinality based on data
    if (source.toLowerCase() === target.toLowerCase()) {
        var keys = ['fk', 'id'];
        var unique = getUniqueData(data, keys);
        relation.cardinality = getCardinalityForFK(unique, keys) === 'n';
    }
    // if the key is on the same entity that it refers to = 1 relationship, otherwise it's an n relationship
    else {
        relation.cardinality = source.toLowerCase() !== table.name.toLowerCase() || target.toLowerCase() === table.name.toLowerCase();
    }

    relation.fkName = navigationPropertyHelper.generateFKName();

    table.data.forEach(function (line, index) {
        line[relation.fkName] = data[index].fk;
    });

    return relation;
}

function getKeys(table) {
    var keys = lodash.find(table.columns, function (column) {
        return column.name.toLowerCase() === entityHelper.PROPERTY_ID.name.toLowerCase();
    });

    var key = {};
    if (keys && keys.name) {
        key[keys.name] = keys;
    }

    return key;
}

function checkData(model, entityData, messages, bUpdateScenario) {
    var dataKey = {}, oPropertyHash = {}, oEntityHash = {};

    // first iteration to check unicity of all primary keys
    model.entities.forEach(function (entity) {
        var entityName = entity.name.toString(),
            data = entityData[entityName];
        oEntityHash[entity._id] = entity;
        dataKey[entityName] = {};

        if (Array.isArray(data) && data.length > 0) {
            var prop = lodash.find(entity.properties, {isKey: true});
            if (prop) {
                var keyProp = prop.name;


                data.forEach(function (element) {
                    var value = element[keyProp];

                    if (value === undefined || value === null) {
                        messages.push(createError(R14.replace('{name}', entityName), 'R14'));
                    }
                    else {
                        if (dataKey[entityName][value] === undefined) {
                            dataKey[entityName][value] = 0;
                        }

                        dataKey[entityName][value] += 1;

                        if (dataKey[entityName][value] === 2) {
                            messages.push(createError(R14.replace('{name}', entityName), 'R14'));
                        }
                    }
                });
            }
        }

        // also register properties for a faster processing
        entity.properties.forEach(function (oProperty) {
            oPropertyHash[oProperty.id] = oProperty;
        });
    });

    // second iteration for checking existance of foreign keys
    model.entities.forEach(function (entity) {
        var aNavigationProperties = entity.navigationProperties || [];

        aNavigationProperties.forEach(function (oNavigationProperty) {
            var oForeignKey, oSourceEntity, oTargetEntity, sForeignKeyName, sTargetEntityName, sSourceEntityName;

            // on update scenario we work with proper ids, while on create we work with entity names
            if (bUpdateScenario) {
                oForeignKey = oPropertyHash[oNavigationProperty.referentialConstraints[0].propertyRef];

                // if this is not the foreign key, it means, the foreign is on the other referencialContraint
                if (oForeignKey.isForeignKey) {
                    oTargetEntity = oEntityHash[oNavigationProperty.referentialConstraints[1].entityId];
                    oSourceEntity = oEntityHash[oNavigationProperty.referentialConstraints[0].entityId];
                    /* oForeignKey already found */
                }
                else {
                    oTargetEntity = oEntityHash[oNavigationProperty.referentialConstraints[0].entityId];
                    oSourceEntity = oEntityHash[oNavigationProperty.referentialConstraints[1].entityId];
                    oForeignKey = oPropertyHash[oNavigationProperty.referentialConstraints[1].propertyRef];
                }

                sTargetEntityName = oTargetEntity.name.toString();
                sSourceEntityName = oSourceEntity.name.toString();
                sForeignKeyName = oForeignKey.name.toString();
            }
            else {
                if (oNavigationProperty.multiplicity) {
                    sTargetEntityName = oNavigationProperty.referentialConstraints[0].entityId;
                    sSourceEntityName = oNavigationProperty.referentialConstraints[1].entityId;
                    sForeignKeyName = oNavigationProperty.referentialConstraints[1].propertyRef;
                }
                else {
                    sTargetEntityName = oNavigationProperty.referentialConstraints[1].entityId;
                    sSourceEntityName = oNavigationProperty.referentialConstraints[0].entityId;
                    sForeignKeyName = oNavigationProperty.referentialConstraints[0].propertyRef;
                }
            }

            // for each of the data row, we check if the data that is in the foreign key is an actual key of the referenced entity
            // for example in SalesOrder 1 > n Product, Product has a foreign key. Does all values from this foreign key are matching existing ids of salesorders ?
            if (entityData[sSourceEntityName]) {
                entityData[sSourceEntityName].forEach(function (oDataRow) {
                    if (oDataRow[sForeignKeyName] && !dataKey[sTargetEntityName][oDataRow[sForeignKeyName]]) {
                        messages.push(createError(R15.replace('{Object name}', sTargetEntityName).replace('{value}', oDataRow[sForeignKeyName]).replace('{relation name}', sSourceEntityName), 'R15'));
                    }
                });
            }
        });
    });
}

function createModel(tables) {
    var entityData = {}, keys = {}, entities = {}, messages = [];
    var model = {
        entities: []
    };

    var relations = [];

    // first get all entities in the file
    tables.forEach(function (table) {
        if (table.name.indexOf('.') < 0) {
            var entity = {
                name: table.name,
                nameSet: table.name + 'Set',
                label: table.displayName,
                properties: [],
                navigationProperties: []
            };

            entities[entity.name.toLowerCase()] = entity;
            model.entities.push(entity);
        }
    });

    // then check the columns and validity of mapping table / foreign keys
    tables.forEach(function (table) {

        // if the table name contains a . , then we compute it as a relation table
        if (table.name.indexOf('.') > 0) {
            relations.push(fillRelationTable(table, messages));
            return;
        }

        var entity = entities[table.name.toLowerCase()];

        keys[table.name] = getKeys(table);

        if (Object.keys(keys).length === 0) {
            throw new Error('The ' + table.name + ' data don\'t have key');
        }

        table.columns.forEach(function (column) {
            var property = util._extend({
                isKey: keys[table.name].hasOwnProperty(column.name),
                propertyType: 'String',
                label: column.name
            }, column);

            if (property.name.indexOf('.') !== -1) {
                var relation = generateRelationFromFK(table, property, entities);
                property.name = relation.fkName;
                relations.push(relation);
            }
            else {
                entity.properties.push(property);
            }
        });

        if (table.data) {
            entityData[table.name] = table.data;
        }
    });

    relations.forEach(function (relation) {
        var source = lodash.find(Object.keys(entities), function (element) {
            return element.toLowerCase() === relation.source.toLowerCase();
        });
        var target = lodash.find(Object.keys(entities), function (element) {
            return element.toLowerCase() === relation.target.toLowerCase();
        });

        // we may not have them in case of previous error
        if (entities[source] && entities[target]) {
            createNavigationProperty(relation.name, entities[source], entities[target], entityHelper.PROPERTY_ID.name, relation.fkName, relation.cardinality);

            if (relation.data) {
                var updateEntity;
                if (relation.cardinality) {
                    updateEntity = entities[target];
                }
                else {
                    updateEntity = entities[source];
                }

                addFKData(entityData[updateEntity.name], relation.data, relation.fkName);
                relation.property.order = updateEntity.properties.length;
                /* JLT write : after discussing with JLS, if I understand the issue correctly, the problem is coming from the fact that the ID should be a "String" type and if not (The guy puts a number, or a date) it doesn't work.
                 From my perspective for the column ID whatever XLS type in the XLS file it should be considered/managed as a string.*/
                relation.property.propertyType = 'String';
                updateEntity.properties.push(relation.property);
            }
        }

    });

    checkData(model, entityData, messages, false /* creation scenario */);

    return {model: model, entityData: entityData, messages: messages};
}

function _renamePropertiesInData(data, propertiesToRename) {
    if (propertiesToRename.length > 0) {
        data.forEach(function (line) {
            propertiesToRename.forEach(function (propertyToRename) {
                var value = line[propertyToRename.oldName];
                line[propertyToRename.newName] = value;
                delete line[propertyToRename.oldName];
            });
        });
    }
}

function _getCellRef(tableOrigin, deltaColumn, deltaRow) {
    var colIndex = XLSX.utils.decode_col(tableOrigin.firstColumn) + deltaColumn;
    var rowIndex = XLSX.utils.decode_row(tableOrigin.firstRow) + deltaRow;
    var cellRef = XLSX.utils.encode_cell({
        c: colIndex,
        r: rowIndex
    });
    return cellRef;
}

/**
 * check the functional rules related to imported data
 * @param tables array the tables to be checed
 * @param messages array the error message stack
 */
function checkTables(tables, messages, existingModel) {
    var tableName = new CaseInsensitiveHash(),
        existingTableNames = new CaseInsensitiveHash(),
        hasMappingTable = false, hasForeignKeys = false;

    tables.forEach(function (table) {
        if (table.name.indexOf('.') === -1) {
            tableName[table.name] = table;
        }
        else {
            hasMappingTable = true;
        }
    });

    if (hasMappingTable) {
        tables.some(function (table) {
            if (table.name.indexOf('.') === -1) {
                table.columns.some(function (column) {
                    hasForeignKeys = (column.name.indexOf('.') > 0);
                    return hasForeignKeys;
                });
            }

            return hasForeignKeys;
        });

        if (hasForeignKeys) {
            messages.push(createError(R4, 'R4'));
        }
    }

    if (existingModel !== undefined) {
        existingModel.entities.forEach(function (oEntity) {
            existingTableNames[oEntity.name] = true;
        });
    }

    tables.forEach(function (table) {
        var cols = new CaseInsensitiveHash();

        // is this a mapping table?
        if (table.name.indexOf('.') > 0) {
            var s = table.name.split('.');

            // checking table name
            if (s.length !== 2) {
                messages.push(createError(R6a, 'R6a', table));
                return false;
            }

            if (!tableName.hasOwnProperty(s[0])) {
                messages.push(createError(R6b.replace('{Object name from}', s[0]), 'R6b', table));
                return false;
            }

            // checking each columns: check if the part [?] in From.[?] or To.[?] are valid column names
            if (table.columns.length !== 2) {
                messages.push(createError(R7d, 'R7d', table));
                return false;
            }

            if (!FROM.test(table.columns[0].name)) {
                messages.push(createError(R7a, 'R7a', table));
                return false;
            }
            if (!TO.test(table.columns[1].name)) {
                messages.push(createError(R7b, 'R7b', table));
                return false;
            }

            if (!tableName.hasOwnProperty(table.columns[0].name.replace(FROM, '$1')) || !tableName.hasOwnProperty(table.columns[1].name.replace(TO, '$1'))) {
                messages.push(createError(R7c.replace('{Object name from}', table.columns[0].name).replace('{Object name to}', table.columns[1].name), 'R7c', table));
                return false;
            }

            // also enforcing type to String, Ids are always strings
            // we dont raise an error to the user, we silently change it
            table.columns[0].propertyType = 'String';
            table.columns[1].propertyType = 'String';
        }
        else {

            // counting 'id' columns
            var ids = 0,
                sIdLowerCase = entityHelper.PROPERTY_ID.name.toLowerCase(),
                oRelations = new CaseInsensitiveHash();

            table.columns.forEach(function (column) {
                if (column.name.toLowerCase() === sIdLowerCase) {
                    ids++;
                    // also enforcing type to String, Ids are always strings
                    // we dont raise an error to the user, we silently change it
                    column.propertyType = 'String';
                }
            });

            // table already exists in the model
            if (existingTableNames.hasOwnProperty(table.name)) {
                messages.push(createError(R10b.replace('{name}', table.name), 'R10b', table));
            }

            if (ids > 1) {
                messages.push(createError(R2.replace('{name}', table.name), 'R2', table));
            }

            if (ids === 0) {
                messages.push(createError(R1.replace('{name}', table.name), 'R1', table));
            }

            // id is not the first column
            if (ids === 1 && table.columns[0].name.toLowerCase() !== sIdLowerCase) {
                messages.push(createError(R3.replace('{name}', table.name), 'R3', table));
            }
            // do we need to normalize the column name, id > ID?
            else if (table.columns[0].name !== entityHelper.PROPERTY_ID.name) {
                _renamePropertiesInData(table.data, [
                    {
                        oldName: table.columns[0].name,
                        newName: entityHelper.PROPERTY_ID.name
                    }
                ]);
                table.columns[0].name = entityHelper.PROPERTY_ID.name;
            }

            table.columns.forEach(function (column, index) {
                var cell = _getCellRef(table.origin, index, 0),
                    els = column.name.split('.');

                // if this is a regular column, check its existence
                if (ODATA_IDENTIFIER.test(column.name)) {
                    if (cols.hasOwnProperty(column.name)) {
                        // only warn if not id, ID is a special case handled by R2
                        if (column.name.toLowerCase() !== entityHelper.PROPERTY_ID.name.toLowerCase()) {
                            messages.push(createError(R10a.replace('{Object name}', column.name), 'R10a', table, cell));
                        }

                        return false;
                    }
                }
                // if this is a valid foreign key, check existence of the involved objects
                else if (FK.test(column.name)) {

                    // find the lower case entity names into the lower case table name hash
                    if (!tableName.hasOwnProperty(els[0]) || !tableName.hasOwnProperty(els[2])) {
                        messages.push(createError(R5b.replace('{Object name from}', els[0]).replace('{Object name to}', els[2]), 'R5b', table, cell));
                        return false;
                    }

                    // validate the relation syntax
                    if (els[0].toLowerCase() !== table.name.toLowerCase() && els[2].toLowerCase() !== table.name.toLowerCase()) {
                        messages.push(createError(R5c.replace('{Object name from}', els[0]).replace('{Object name to}', els[2]), 'R5c', table, cell));
                        return false;
                    }

                    // validate the relation name uniqueness
                    if (oRelations[els[0] + '.' + els[1]]) {
                        messages.push(createError(R10a.replace('{Object name}', els[0] + '.' + els[1]), 'R10a', table, cell));
                        return false;
                    }

                    oRelations[els[0] + '.' + els[1]] = true;
                }
                // not a valid foreign key
                else if (els.length > 1) {
                    messages.push(createError(R5a, 'R5a', table, cell));
                    return false;
                }
                // not a valid identifier
                else {
                    // we investigate a little more to identify the root issue
                    if (column.name.length > 40) {
                        messages.push(createError(R9a, 'R9a', table, cell));
                        return false;
                    }

                    if (!/[a-z_]/i.test(column.name.substr(0, 1))) {
                        messages.push(createError(R9b, 'R9b', table, cell));
                        return false;
                    }

                    messages.push(createError(R9c, 'R9c', table, cell));
                    return false;
                }

                // all valid
                cols[column.name] = column;
            });
        }
    });
}

exports.getModel = function (context) {
    var messages = [];
    try {
        var tables = importModel.getDataFromXl(context.data, messages);

        if (tables.length > 0) {
            checkTables(tables, messages, context.model);

            if (messages.length === 0) {
                var model = createModel(tables);

                if (messages.length === 0 && model.messages.length === 0) {
                    context.updatedModel = model.model;
                    context.entityData = model.entityData;
                }

                messages = messages.concat(model.messages);
            }
        }
    }
    catch (e) {
        context.logger.error(e);

        messages.push(createError(e.message));
    }

    context.parserXlResult = {success: messages.length === 0, messages: messages};

    return context;
};

function compareEntityProperties(modelEntity, excelEntity, table, messages) {
    var isIdentical = true, excelPropNameMap = {};

    // Search for missing excel properties in the model entity
    // And check types
    excelEntity.properties.some(function (excelProperty, excelPropertyIndex) {
        var name = excelPropNameMap[excelProperty.name],
            cell = _getCellRef(table.origin, excelPropertyIndex, 0);
        if (name) {
            // Duplicate property name
            messages.push(createError(R12.replace('{name}', table.name), 'R12', table, cell));
            isIdentical = false;
        }
        else {
            excelPropNameMap[excelProperty.name] = excelProperty.name;
        }
        var modelProperty = null;
        modelEntity.properties.some(function (currentModelProp) {
            if (excelProperty.name.toLowerCase() === currentModelProp.name.toLowerCase()) {
                modelProperty = currentModelProp;
                return true;
            }
        });
        if (!modelProperty) {
            messages.push(createError(R12.replace('{name}', table.name), 'R12', table, cell));
            isIdentical = false;
        }
        else {
            if (modelProperty.propertyType !== excelProperty.propertyType) {
                // the type is presumably wrong, before raising this as an error we check (in this case only for performance reasons)
                // that there are data for that excel property (no data = no type check needed)
                var bHasData = false;
                if (table.data && table.data.length > 0) {
                    table.data.forEach(function (oDataRow) {
                        bHasData = oDataRow[excelProperty.name] !== undefined;
                        return !bHasData; // breaks on false
                    });
                }

                // this is a confirmed error
                if (bHasData) {
                    messages.push(createError(R12.replace('{name}', table.name), 'R12', table, cell));
                    isIdentical = false;
                }
                // this is a false positive
                else {
                    excelProperty.propertyType = modelProperty.propertyType;
                }
            }
        }
    });

    // Search for missing model properties in the excel entity
    modelEntity.properties.some(function (modelProperty) {
        var excelProperty = null;
        excelEntity.properties.some(function (currentExcelProp) {
            if (modelProperty.name.toLowerCase() === currentExcelProp.name.toLowerCase()) {
                excelProperty = currentExcelProp;
                return true;
            }
        });

        // don't match properties that are in the model only (foreign keys, calculated properties)
        if (!excelProperty && !modelProperty.isForeignKey && (!modelProperty.calculated || !modelProperty.calculated.calculation)) {
            messages.push(createError(R12.replace('{name}', table.name), 'R12', table));
            isIdentical = false;
            return true;
        }
    });


    return isIdentical;
}

function convertEntity(table) {
    var entity = {properties: []};
    table.columns.forEach(function (column) {
        var isKey = (column.name.toLowerCase() === 'id');
        var property = util._extend({
            isKey: isKey,
            propertyType: column.propertyType,
            label: column.name
        }, column);

        entity.properties.push(property);
    });

    return entity;
}

function compareEntityAndTable(modelEntity, table, messages) {
    var excelEntity = convertEntity(table);
    var isIdentical = compareEntityProperties(modelEntity, excelEntity, table, messages);
    return isIdentical;
}

function find(collection, name) {
    name = name.toLowerCase();
    return lodash.find(collection, function (element) {
        return element.name.toLowerCase() === name;
    });
}

function mergeData(entityTable, mappingTable, pkIdColumn, fkIdColumn, idPropName, pkPropertyName, messages) {
    mappingTable.data.forEach(function (line) {
        var idObject = {};
        var pkValue = line[pkIdColumn.name];

        if (line[mappingTable.columns[0].name]) {
            line[mappingTable.columns[0].name] = line[mappingTable.columns[0].name].toString();
        }
        if (line[mappingTable.columns[1].name]) {
            line[mappingTable.columns[1].name] = line[mappingTable.columns[1].name].toString();
        }

        if (pkValue) {
            idObject[idPropName] = pkValue.toString();
            var entityLine = lodash.find(entityTable.data, idObject);
            if (entityLine) {
                entityLine[pkPropertyName] = line[fkIdColumn.name];
            }
            else {
                messages.push(createError(R15.replace('{Object name}', entityTable.name).replace('{value}', pkValue).replace('{relation name}', mappingTable.name), 'R15', mappingTable, _getCellRef));
            }
        }
    });
    entityTable.columns.push({name: pkPropertyName, order: entityTable.columns.length, propertyType: 'String'});
}

function checkCardinalityForMappingTable(mappingTable, relation, messages) {
    var cardinality = getCardinalityForMappingTable(mappingTable, messages);

    var cardinalityMatch = cardinality === relation.multiplicity;
    var cardinalityCompatible = relation.multiplicity && !cardinality;
    /* n wins over 1*/
    var cardinalityIgnored = mappingTable.data.length === 0;

    return cardinality !== null && (cardinalityIgnored || cardinalityMatch || cardinalityCompatible);
}

function findFKName(entities, entity, relationName) {
    var fkName = '',
        nav, e, fk;

    nav = find(entity.navigationProperties, relationName);
    if (nav) {
        e = lodash.find(entities, {_id: nav.referentialConstraints[0].entityId});
        fk = lodash.find(e.properties, {_id: nav.referentialConstraints[0].propertyRef});
        fkName = fk.name;
        if (fkName.indexOf('___FK_') !== 0) {
            e = lodash.find(entities, {_id: nav.referentialConstraints[1].entityId});
            fk = lodash.find(e.properties, {_id: nav.referentialConstraints[1].propertyRef});
            fkName = fk.name.indexOf('___FK_') === 0 ? fk.name : '';
        }
    }

    return fkName;
}

exports.getData = function (context) {
    var messages = [], replaceData = [], mappingTables = [], elements = {}, split, fkPropertyName;

    try {
        var tables = importModel.getDataFromXl(context.data, messages);

        if (tables.length > 0) {
            checkTables(tables, messages);

            tables.forEach(function (table) {
                if (table.name.indexOf('.') !== -1) {
                    mappingTables.push(table);
                }
                else {
                    var entityName = table.name.toLowerCase();
                    var entity = find(context.model.entities, entityName);

                    if (entity) {
                        elements[entityName] = {entity: entity, table: table};
                    }
                    else {
                        messages.push(createError(R12.replace('{name}', table.name), 'R12', table));
                    }
                }
            });

            // Manage mapping tables if there are some
            if (mappingTables.length > 0) {

                mappingTables.forEach(function (mappingTable) {

                    var entityName, element, relation, relationName, toEntity, toElement;

                    split = mappingTable.name.split('.');
                    if (!Array.isArray(split) || split.length !== 2) {
                        messages.push(createError(R6a, 'R6a', mappingTable));
                        return;
                    }

                    entityName = split[0].toLowerCase();
                    relationName = split[1];
                    element = elements[entityName];

                    if (!element) {
                        messages.push(createError(R7c, 'R7c', mappingTable));
                        return;
                    }

                    relation = find(element.entity.navigationProperties, relationName);

                    if (!relation) {
                        messages.push(createError(R12.replace('{name}', entityName), 'R12', mappingTable));
                        return;
                    }
                    fkPropertyName = findFKName(context.model.entities, element.entity, relationName);
                    toEntity = lodash.find(context.model.entities, {_id: relation.toEntityId});

                    if (!checkCardinalityForMappingTable(mappingTable, relation, messages)) {
                        messages.push(createError(R12.replace('{name}', entityName), 'R12', mappingTable));
                        return;
                    }

                    if (relation.multiplicity) {
                        toElement = elements[toEntity.name.toLowerCase()];

                        if (!toElement) {
                            messages.push(createError(R7c, 'R7c', mappingTable));
                            return;
                        }
                    }

                    // everything is valid in 1 relationship case
                    if (relation.multiplicity) {
                        mergeData(toElement.table, mappingTable, mappingTable.columns[1], mappingTable.columns[0], entityHelper.PROPERTY_ID.name, fkPropertyName, messages);
                    }
                    // everything is valid in n relationship case
                    else {
                        mergeData(element.table, mappingTable, mappingTable.columns[0], mappingTable.columns[1], entityHelper.PROPERTY_ID.name, fkPropertyName, messages);
                    }
                });
            }

            // Trim column names, check invalid characters and manage foreign keys in entity tables
            Object.keys(elements).forEach(function (key) {
                var propertiesToRename = [];
                var element = elements[key];
                element.table.columns.forEach(function (column, index) {
                    // Trim the column names
                    column.name = column.name ? column.name.trim() : column.name;
                    split = column.name.split('.');
                    if (split && Array.isArray(split)) {
                        if (split.length === 3) {
                            var fromEntityName = split[0], relationName = split[1];
                            var fromEntity = find(context.model.entities, fromEntityName);
                            fkPropertyName = findFKName(context.model.entities, fromEntity, relationName);
                            propertiesToRename.push({oldName: column.name, newName: fkPropertyName});
                            column.name = fkPropertyName;
                        }
                        else if (split.length !== 1) {
                            var cell = _getCellRef(element.table.origin, index, 0);
                            messages.push(createError(R5a, 'R5a', element.table, cell));
                        }
                    }
                });

                _renamePropertiesInData(element.table.data, propertiesToRename);
            });

            var entityData = {};
            Object.keys(elements).forEach(function (key) {
                var element = elements[key];
                if (!compareEntityAndTable(element.entity, element.table, messages)) {
                    return;
                }

                if (element.table.data.length === 0) {
                    messages.push(createError(R11.replace('{name}', element.table.name), 'R11', element.table));
                    return;
                }

                replaceData.push({
                    entityName: element.entity.name,
                    properties: element.table.data
                });
                entityData[element.entity.name] = element.table.data;
            });

            checkData(context.model, entityData, messages, true /* update scenario */);

            if (messages.length === 0) {
                context.replaceData = replaceData;
            }
        }
    }
    catch (e) {
        context.logger.error(e);
        messages.push(createError(e.message));
    }

    context.parserXlResult = {success: messages.length === 0, messages: [messages[0]]};

    return context;
};