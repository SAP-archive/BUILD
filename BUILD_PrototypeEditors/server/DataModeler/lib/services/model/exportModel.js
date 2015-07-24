'use strict';

var XLSX = require('xlsx');
require('norman-promise');
var lodash = require('norman-server-tp').lodash;
var JSzip = require('jszip');

// var TYPES = ['String', 'Decimal', 'Boolean', 'DateTime', 'Binary', 'Byte', 'Double', 'Single', 'Guid', 'Int16', 'Int32', 'Int64', 'SByte', 'Time', 'DateTimeOffset'];
function _getExcelCellType(dataType) {
    switch (dataType) {
        case 'Decimal':
            return {type: 'n', format: '0.00'};
        case 'Boolean':
            return {type: 'b'};
        case 'DateTime':
        case 'DateTimeOffset':
            return {type: 'n', format: 'm/d/yy'};
        case 'Double':
            return {type: 'n', format: '0.00E+00'};
        case 'Int16':
        case 'Int32':
        case 'Int64':
            return {type: 'n', format: '0'};
        case 'Time':
            return {type: 'n', format: 'h:mm'};
        case 'SByte':
        case 'Guid':
        case 'Single':
        case 'Byte':
        case 'Binary':
        case 'String':
        default:
            return {type: 's'};
    }
}

function _dateToNum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}


function _convertData(data, dataType) {
    var value;
    if (data) {
        if (dataType === 'DateTimeOffset' || dataType === 'DateTime') {
            value = _dateToNum(data);// new Date(data).getTime() / (86400 * 1000) + (25567 + 1);
        }
        else {
            value = data;
        }
    }
    else {
        value = data;
    }

    return value;
}

function _createWorkbook() {
    return {
        SheetNames: [],
        Sheets: {}
    };
}

function _writeTableDataInWorksheet(table, oDataTable, ws, columnOffset, rowOffset) {

    /*var tableNameCell_ref = XLSX.utils.encode_cell({
     c: columnOffset,
     r: 0
     });
     var tableNameCell = {
     v: tableName,
     t: 's'
     };

     ws[tableNameCell_ref] = tableNameCell;
     */

    var iRow = rowOffset;
    var i;
    for (i = 0; i < table.properties.length; i++) {

        var prop = table.properties[i];
        var columnName = table.columnNames[i];
        var cell_ref = XLSX.utils.encode_cell({
            c: columnOffset + i,
            r: iRow
        });
        var cell = {
            v: columnName,
            t: 's'
        };
        ws[cell_ref] = cell;

        if (oDataTable) {
            var dataRow = iRow + 1;
            for (var j = 0; j < oDataTable.data.length; j++) {
                if (oDataTable.data[j]) {

                    var dataCol = columnOffset + i;
                    var propVal = oDataTable.data[j][prop.name];
                    if (propVal === null) {
                        propVal = undefined; // else above, XLSX.write will throw an exception
                    }
                    propVal = _convertData(propVal, prop.propertyType);

                    var dataCellRef = XLSX.utils.encode_cell({
                        c: dataCol,
                        r: dataRow
                    });

                    var cellType = _getExcelCellType(prop.propertyType);
                    var dataCell = {
                        v: propVal,
                        t: cellType.type
                    };

                    if (cellType.format) {
                        dataCell.z = cellType.format;
                    }

                    ws[dataCellRef] = dataCell;
                    dataRow++;
                }
            }
        }
    }
}

function _getTableRange(table, oDataTable, columnOffset, rowOffset) {
    var range = {
        s: {
            c: columnOffset,
            r: rowOffset
        },
        e: {
            c: columnOffset + table.properties.length - 1,
            r: rowOffset + 1
        }
    };

    if (oDataTable) {
        range.e.r = Math.max(rowOffset + 1, rowOffset + oDataTable.data.length);
    }

    return range;
}

function _getTableInfo(table, tableType, range) {
    var tableInfo = {name: table.name, columns: [], type: tableType};
    var i, iNbProperties = table.properties.length;
    for (i = 0; i < iNbProperties; i++) {
        tableInfo.columns.push(table.columnNames[i]);
    }
    tableInfo.ref = XLSX.utils.encode_range(range);
    return tableInfo;
}


function _increaseRange(range, rangeToAdd) {
    range.s.c = Math.min(range.s.c, rangeToAdd.s.c);
    range.s.r = Math.min(range.s.r, rangeToAdd.s.r);
    range.e.c = Math.max(range.e.c, rangeToAdd.e.c);
    range.e.r = Math.max(range.e.r, rangeToAdd.e.r);
}

function _addWorksheet(wb, sheetName, ws, range) {
    ws['!ref'] = XLSX.utils.encode_range(range);

    wb.SheetNames.push(sheetName);
    wb.Sheets[sheetName] = ws;
}

/*----------------------------------------------------------------------------------------------------------------------
 Add tables in xlsx file
 --------------------------------------------------------------------------------------------------------------------*/

function _getzipfile(zip, filePath) {
    var f = filePath;
    if (zip.files[f]) return zip.files[f];
    // f = file.toLowerCase(); if(zip.files[f]) return zip.files[f];
    // f = f.replace(/\//g,'\\'); if(zip.files[f]) return zip.files[f];
    return null;
}

function _addzipfile(zip, filePath, fileContent) {
    zip.file(filePath, fileContent);
}

function _generateContentTypesFileContent(contentTypesContent, tablesCount) {
    var tableRefs = '';
    var i;
    for (i = 0; i < tablesCount; i++) {
        var tableRef = '<Override PartName="/xl/tables/table{TABLE_INDEX}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>';
        tableRef = tableRef.replace(/\{TABLE_INDEX\}/g, ('' + (i + 1)));
        tableRefs += tableRef;
    }
    contentTypesContent = contentTypesContent.replace('<Override PartName="/docProps/core.xml"', tableRefs + '<Override PartName="/docProps/core.xml"');

    return contentTypesContent;
}

function _generateTableFileContent(tableInfo, index) {
    var tableContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="{ID}" name="{NAME}" displayName="{NAME}" ref="{REF}" ' +
        'totalsRowShown="0"><autoFilter ref="{REF}"/><tableColumns count="{COL_COUNT}">{COLUMNS}</tableColumns><tableStyleInfo name="{TABLE_STYLE}" ' +
        'showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/></table>';

    var columns = '', i;
    for (i = 0; i < tableInfo.columns.length; i++) {
        var column = '<tableColumn id="{ID}" name="{NAME}"/>';
        var propertyName = tableInfo.columns[i];
        column = column.replace(/\{ID\}/g, ('' + (i + 1)));
        column = column.replace(/\{NAME\}/g, propertyName);
        columns += column;
    }

    tableContent = tableContent.replace(/\{ID\}/g, '' + index);
    tableContent = tableContent.replace(/\{NAME\}/g, tableInfo.name);
    tableContent = tableContent.replace(/\{REF\}/g, tableInfo.ref);
    tableContent = tableContent.replace(/\{COL_COUNT\}/g, '' + tableInfo.columns.length);
    tableContent = tableContent.replace(/\{TABLE_STYLE\}/g, tableInfo.type === 'entity' ? 'TableStyleMedium9' : 'TableStyleMedium10');
    tableContent = tableContent.replace(/\{COLUMNS\}/g, columns);

    return tableContent;
}

function _generateSheetFileContent(sheetContent, tablesCount, dataValidations) {
    var tableParts = '<tableParts count="{TABLE_COUNT}">{TABLE_PARTS}</tableParts>', dataValidationsParts = '';
    tableParts = tableParts.replace(/\{TABLE_COUNT\}/g, '' + tablesCount);

    if (dataValidations.length > 0) {
        dataValidationsParts = '<dataValidations count="' + dataValidations.length + '">{DATA_VALIDATION_PARTS}</dataValidations>';
    }

    sheetContent = sheetContent.replace('</worksheet>', dataValidationsParts + tableParts + '</worksheet>');

    var i;
    tableParts = '';
    for (i = 0; i < tablesCount; i++) {
        var tablePart = '<tablePart r:id="rId{TABLE_PART_INDEX}"/>';
        tablePart = tablePart.replace(/\{TABLE_PART_INDEX\}/g, ('' + (i + 1)));
        tableParts += tablePart;
    }

    sheetContent = sheetContent.replace(/\{TABLE_PARTS\}/g, tableParts);

    if (dataValidations.length > 0) {
        var dataValidationParts = '';
        dataValidations.forEach(function (dataValidation) {
            dataValidationParts += '<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="' + dataValidation.ref + '"><formula1>' + dataValidation.formula + '</formula1></dataValidation>';
        });

        sheetContent = sheetContent.replace(/\{DATA_VALIDATION_PARTS\}/g, dataValidationParts);
    }

    return sheetContent;
}

function _generateSheetRelsFileContent(tablesCount) {
    var sheetRelsContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '{TABLE_RELS}' +
        '</Relationships>';

    var tableRels = '', i;
    for (i = 0; i < tablesCount; i++) {
        var tableRel = '<Relationship Id="rId{REL_INDEX}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table{REL_INDEX}.xml"/>';
        tableRel = tableRel.replace(/\{REL_INDEX\}/g, ('' + (i + 1)));
        tableRels += tableRel;
    }
    sheetRelsContent = sheetRelsContent.replace(/\{TABLE_RELS\}/g, tableRels);

    return sheetRelsContent;
}

/*---------------------------------------------------------------------------------------------------------
 Generate xlsx workbook
 --------------------------------------------------------------------------------------------------------*/

function _generateXlsxWorkbook(oWb, tablesInfo, dataValidations) {
    var wbOut = XLSX.write(oWb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'binary'
    });

    var zip = new JSzip(wbOut, {base64: false});
    var i;
    var tablesCount = tablesInfo.length;

    // Update content type file
    var contentTypeFileName = '[Content_Types].xml';
    var contentTypesFile = _getzipfile(zip, contentTypeFileName);
    var contentTypesContent = contentTypesFile.asText();
    contentTypesContent = _generateContentTypesFileContent(contentTypesContent, tablesCount);
    _addzipfile(zip, contentTypeFileName, contentTypesContent);

    // Add tables files
    zip.folder('xl/tables');
    for (i = 0; i < tablesCount; i++) {
        var tableIndex = i + 1;
        var tableFileContent = _generateTableFileContent(tablesInfo[i], tableIndex);
        zip.file('xl/tables/table' + tableIndex + '.xml', tableFileContent);
    }

    // Update sheet1.xml file
    var sheetFileName = 'xl/worksheets/sheet1.xml';
    var sheetFile = _getzipfile(zip, sheetFileName);
    var sheetContent = sheetFile.asText();
    sheetContent = _generateSheetFileContent(sheetContent, tablesCount, dataValidations);
    _addzipfile(zip, sheetFileName, sheetContent);

    // Add file sheet1.xml.rels
    zip.folder('xl/worksheets/_rels');
    var sheetRelsFileName = 'xl/worksheets/_rels/sheet1.xml.rels';
    var sheetRelsContent = _generateSheetRelsFileContent(tablesCount);
    _addzipfile(zip, sheetRelsFileName, sheetRelsContent);


    wbOut = zip.generate({type: 'string'});
    return wbOut;
}

function _addTableInWorksheet(ws, range, tableData, dataFromDB, tablesInfo, columnOffset, rowOffset, zone) {
    var table = tableData.table, oDataTable = null;
    if (dataFromDB) {
        oDataTable = dataFromDB[tableData.dataTableName];
    }

    var tableRange = _getTableRange(table, oDataTable, columnOffset, rowOffset);

    var tableInfo = _getTableInfo(table, tableData.type, tableRange);
    tablesInfo.push(tableInfo);

    zone.key[tableData._id] = {
        s: {c: tableRange.s.c, r: tableRange.s.r + 1},
        e: {c: tableRange.s.c, r: tableRange.e.r}
    };

    var process = function (property) {
        var index = lodash.indexOf(tableData.table.properties, property);
        zone.fk.push({
            property: property,
            range: {
                s: {c: tableRange.s.c + index, r: tableRange.s.r + 1},
                e: {c: tableRange.s.c + index, r: tableRange.e.r}
            }
        });
    };

    lodash.where(tableData.table.properties, {isForeignKey: true}).forEach(process);

    if (tableData.type === 'navTable') {
        lodash.where(tableData.table.properties, {isKey: true}).forEach(process);
    }

    _writeTableDataInWorksheet(table, oDataTable, ws, columnOffset, rowOffset);
    _increaseRange(range, tableRange);
}

function _cloneProperty(prop) {
    var clone = {};
    var propKey;
    for (propKey in prop) {
        clone[propKey] = prop[propKey];
    }

    return clone;
}

function _getNavTable(fromEntity, oDataModelNav, toEntity) {
    var i,
        fromEntityIdProperty,
        toEntityIdProperty,
        oPropertyMap = {},  // map of property._id:property
        oNavTable = {
            name: fromEntity.name + '.' + oDataModelNav.name,
            properties: [],
            columnNames: []
        };

    // create a map of properties for all entities
    for (i = 0; i < fromEntity.properties.length; i++) {
        oPropertyMap[fromEntity.properties[i]._id] = fromEntity.properties[i];

        if (fromEntity.properties[i].isKey) {
            fromEntityIdProperty = fromEntity.properties[i];
        }
    }

    for (i = 0; i < toEntity.properties.length; i++) {
        oPropertyMap[toEntity.properties[i]._id] = toEntity.properties[i];

        if (toEntity.properties[i].isKey) {
            toEntityIdProperty = toEntity.properties[i];
        }
    }

    // get the right properties from the referentialConstraints
    // in 1 relationship, the foreignKey is within the fromEntity
    // in n relationship, the foreignKey is within the toEntity
    if (oDataModelNav.multiplicity) {
        if (oPropertyMap[oDataModelNav.referentialConstraints[1].propertyRef].isForeignKey) {
            fromEntityIdProperty = _cloneProperty(oPropertyMap[oDataModelNav.referentialConstraints[1].propertyRef]);
        }
        else {
            fromEntityIdProperty = _cloneProperty(oPropertyMap[oDataModelNav.referentialConstraints[0].propertyRef]);
        }
    }
    else {
        if (oPropertyMap[oDataModelNav.referentialConstraints[0].propertyRef].isForeignKey) {
            toEntityIdProperty = _cloneProperty(oPropertyMap[oDataModelNav.referentialConstraints[0].propertyRef]);
        }
        else {
            toEntityIdProperty = _cloneProperty(oPropertyMap[oDataModelNav.referentialConstraints[1].propertyRef]);
        }
    }

    oNavTable.columnNames.push('From.' + fromEntity.name);
    oNavTable.properties.push(fromEntityIdProperty);

    oNavTable.columnNames.push('To.' + toEntity.name);
    oNavTable.properties.push(toEntityIdProperty);

    return {
        type: 'navTable',
        table: oNavTable,
        dataTableName: oDataModelNav.multiplicity ? toEntity.lcaseName : fromEntity.lcaseName
    };
}

function _getNavTables(oEntity, oDataModelMaps) {
    var fkPropId,
        foreignKeyInfo,
        navTables = {},
        oNavTable,
        oDataModelNav,
        foreignKeyMap = oDataModelMaps.entityForeignKeyMap[oEntity._id];

    for (fkPropId in foreignKeyMap) {
        foreignKeyInfo = foreignKeyMap[fkPropId];

        oDataModelNav = foreignKeyInfo.navProp;
        oNavTable = _getNavTable(foreignKeyInfo.sourceEntity, oDataModelNav, oDataModelMaps.entityIdMap[oDataModelNav.toEntityId]);

        navTables[oNavTable.table.name] = oNavTable;
    }

    return navTables;
}

function _getForeignKeyName(multiplicity, sourceEntityName, targetEntityName, navPropertyName) {
    return sourceEntityName + '.' + navPropertyName + '.' + targetEntityName;
}

function _generateDataModelMaps(dataModelJson, entityNames, useMappingTables, bWithNavigation) {
    var oDataModelMaps = {};
    var i, j, k, r, oEntity, entityId, oProp, table, targetEntity, oDataModelNav, refConstraint, rcEntity, currentForeignKeyMap, currentProperty, aValidProperties;
    var oEntityNameFilter = {};

    oDataModelMaps.model = dataModelJson;
    oDataModelMaps.entityIdMap = {};
    oDataModelMaps.tablesMap = {};
    oDataModelMaps.entityForeignKeyMap = {};

    // we need to take only entities asked by the user
    for (i = 0; i < entityNames.length; i++) {
        oEntityNameFilter[entityNames[i].toLowerCase()] = true;
    }

    for (i = 0; i < dataModelJson.entities.length; i++) {
        oEntity = dataModelJson.entities[i];
        oEntity.lcaseName = oEntity.name.toLowerCase();

        // is amongst the entities asked by the user?
        if (oEntityNameFilter[oEntity.lcaseName]) {
            oDataModelMaps.entityIdMap[oEntity._id] = oEntity;
        }
    }

    // Fill map of foreign keys and pointing navigation properties
    if (bWithNavigation) {
        for (entityId in oDataModelMaps.entityIdMap) {
            oEntity = oDataModelMaps.entityIdMap[entityId];

            for (j = 0; j < oEntity.navigationProperties.length; j++) {
                oDataModelNav = oEntity.navigationProperties[j];
                targetEntity = oDataModelMaps.entityIdMap[oDataModelNav.toEntityId];

                // is amongst the entities asked by the user?
                if (targetEntity && oEntityNameFilter[targetEntity.lcaseName]) {

                    for (r = 0; r < oDataModelNav.referentialConstraints.length; r++) {
                        refConstraint = oDataModelNav.referentialConstraints[r];
                        rcEntity = oDataModelMaps.entityIdMap[refConstraint.entityId];
                        currentProperty = null;
                        for (k = 0; k < rcEntity.properties.length; k++) {
                            oProp = rcEntity.properties[k];
                            if (oProp._id === refConstraint.propertyRef) {
                                currentProperty = oProp;
                                break;
                            }
                        }
                        if (currentProperty && currentProperty.isForeignKey) {
                            // for 1 relationship, FK is in the source entity
                            // for n relationship, FK is in the target entity
                            currentForeignKeyMap = oDataModelMaps.entityForeignKeyMap[refConstraint.entityId];
                            if (!currentForeignKeyMap) {
                                currentForeignKeyMap = {};
                                oDataModelMaps.entityForeignKeyMap[refConstraint.entityId] = currentForeignKeyMap;
                            }
                            var fkName = _getForeignKeyName(oDataModelNav.multiplicity, oEntity.name, targetEntity.name, oDataModelNav.name);
                            currentForeignKeyMap[refConstraint.propertyRef] = {
                                navProp: oDataModelNav,
                                sourceEntity: oEntity,
                                fkName: fkName
                            };

                        }
                    }
                }
            }
        }
    }

    for (entityId in oDataModelMaps.entityIdMap) {
        oEntity = oDataModelMaps.entityIdMap[entityId];

        table = {
            type: 'entity',
            _id: oEntity._id,
            dataTableName: oEntity.lcaseName,
            table: {
                name: oEntity.name,
                properties: [],
                columnNames: []
            },
            navTables: []
        };
        if (useMappingTables) {
            for (j = 0; j < oEntity.properties.length; j++) {
                oProp = oEntity.properties[j];
                if (!oProp.isForeignKey) {
                    table.table.properties.push(oProp);
                    table.table.columnNames.push(oProp.name);
                }
            }
        }
        else {
            table.table.properties = [];
            aValidProperties = [];
            for (j = 0; j < oEntity.properties.length; j++) {
                oProp = oEntity.properties[j];

                if (!oProp.isForeignKey) {
                    table.table.columnNames.push(oProp.name);
                    table.table.properties.push(oProp);
                    aValidProperties.push(oProp);
                }
                else if (bWithNavigation) {
                    currentForeignKeyMap = oDataModelMaps.entityForeignKeyMap[oEntity._id];

                    // the foreign key corresponds to an entity that we want to export
                    if (currentForeignKeyMap[oProp._id]) {
                        table.table.columnNames.push(currentForeignKeyMap[oProp._id].fkName);
                        table.table.properties.push(oProp);
                        aValidProperties.push(oProp);
                    }

                }
            }

            oEntity.properties = aValidProperties;
        }

        oDataModelMaps.tablesMap[oEntity.lcaseName] = table;
    }

    for (entityId in oDataModelMaps.entityIdMap) {
        oEntity = oDataModelMaps.entityIdMap[entityId];
        table = oDataModelMaps.tablesMap[oEntity.lcaseName];
        table.navTables = _getNavTables(oEntity, oDataModelMaps);
    }


    return oDataModelMaps;
}

function _reformDataFromDB(aDataFromDB) {
    var oRefinedData = {};
    for (var i = 0; i < aDataFromDB.entities.length; i++) {
        var doc = aDataFromDB.entities[i];
        oRefinedData[doc.entityName.toLowerCase()] = {data: doc.properties};
    }
    return oRefinedData;
}

function generateDataValidation(dataModelJson, zone) {
    var dataValidations = [];

    zone.fk.forEach(function (fk) {
        var entityId, navigationProperty, source;
        if (fk.property.isForeignKey) {
            dataModelJson.entities.some(function (oEntity) {
                oEntity.navigationProperties.some(function (nav) {
                    nav.referentialConstraints.some(function (refContraint) {
                        if (refContraint.propertyRef === fk.property._id) {
                            entityId = oEntity._id;
                            navigationProperty = nav;
                            return true;
                        }
                    });

                    return entityId !== undefined;
                });
                return entityId !== undefined;
            });

            if (entityId) {
                source = zone.key[navigationProperty.multiplicity ? entityId : navigationProperty.toEntityId];
            }
        }
        else {
            var entity = lodash.find(dataModelJson.entities, {properties: [{_id: fk.property._id}]});

            if (entity) {
                source = zone.key[entity._id];
            }
        }

        if (source) {
            var formula = '$' + XLSX.utils.encode_col(source.s.c) + '$' + XLSX.utils.encode_row(source.s.r)
                + ':$' + XLSX.utils.encode_col(source.e.c) + '$' + XLSX.utils.encode_row(source.e.r);

            dataValidations.push({ref: XLSX.utils.encode_range(fk.range), formula: formula});
        }
    });

    return dataValidations;
}

function _getXlWorkbook(dataModelJson, entityNames, dataFromDB, useMappingTables, bWithNavigation, defaultSheetName) {
    var oWb = _createWorkbook();
    var oDataModelMaps = _generateDataModelMaps(dataModelJson, entityNames, useMappingTables, bWithNavigation);
    if (dataFromDB) {
        dataFromDB = _reformDataFromDB(dataFromDB);
    }
    if (entityNames && entityNames.length > 0) {
        lodash.transform(entityNames, function (result, sCurrString) {
            result.push(sCurrString.toLowerCase());
        });
    }

    var ws = {}, range, columnOffset = 1, rowOffset = 1, tablesInfo = [], zone = {key: {}, fk: []};

    range = {
        s: {c: 0, r: 0},
        e: {c: 0, r: 0}
    };

    for (var tableName in oDataModelMaps.tablesMap) {

        var tableData = oDataModelMaps.tablesMap[tableName];

        _addTableInWorksheet(ws, range, tableData, dataFromDB, tablesInfo, columnOffset, rowOffset, zone);
        columnOffset = range.e.c + 2;

        if (bWithNavigation && useMappingTables) {
            // Add navigation properties from the current entity
            for (var navTableName in tableData.navTables) {
                _addTableInWorksheet(ws, range, tableData.navTables[navTableName], dataFromDB, tablesInfo, columnOffset, rowOffset, zone);
                columnOffset = range.e.c + 2;
            }
        }
    }

    _addWorksheet(oWb, defaultSheetName, ws, range);

    var wbOut = _generateXlsxWorkbook(oWb, tablesInfo, generateDataValidation(dataModelJson, zone));

    return {
        xlsx_workbook: oWb,
        binaryData: wbOut
    };
}

exports.exportToXLFormat = function (oDataModelJson, aEntityNames, oSampleData, useMappingTables, withNavigation, defaultSheetName) {
    defaultSheetName = defaultSheetName || 'BuildExport';
    withNavigation = withNavigation || false;
    var promise = new Promise(function (resolve) {
        var xlData = _getXlWorkbook(oDataModelJson, aEntityNames, oSampleData, useMappingTables, withNavigation, defaultSheetName);
        resolve(xlData);
    });
    return promise;
};
