'use strict';

var XLSX = require('xlsx');
var htmlparser = require('htmlparser');
var util = require('util');
var lodash = require('norman-server-tp').lodash;
var entityHelper = require('./entityHelper.js');
var url = require('url');

var R8 = 'No random text allowed around the data area of the Object or mapping table. Please modify your data sheet.';

/**
 * find the useful range of data with headers
 * @param xlsSheet
 * @returns {{firstRow: *, columns: Array, rows: Array, sheet: *}|*}
 */
function getFirstRowAndColumns(xlsSheet) {
    var range = XLSX.utils.decode_range(xlsSheet['!ref']), columns = [], rows = [], column, row,
        firstRow = -1,          // first row with useful data
        lastRow = -1,           // last row with useful data
        firstColumn = -1,       // first column with useful data
        lastColumn = -1,        // last column with useful data
        context,
        bValidRange = true,     // do we have holes inside the useful data?
        cell;

    // build the columns and rows from the full range identified by excel
    for (column = 0; column <= range.e.c; ++column) {
        if (column < range.s.c) {
            columns[column] = 0;
        }
        else {
            columns[column] = XLSX.utils.encode_col(column);
        }
    }

    for (row = 0; row <= range.e.r; ++row) {
        if (row < range.s.r) {
            rows[row] = 0;
        }
        else {
            rows[row] = XLSX.utils.encode_row(row);
        }
    }

    // narrow down to useful data range
    // look when data starts and ends
    for (column = range.s.c; column <= range.e.c; column++) {
        for (row = range.s.r; row <= range.e.r; row++) {
            cell = xlsSheet[columns[column] + rows[row]];


            // data in this cell, keep counting
            if (cell !== undefined && cell.w !== undefined) {
                if (firstColumn < 0 && firstColumn < 0) {
                    firstRow = row;
                    firstColumn = column;
                }

                if (row > lastRow) {
                    lastRow = row;
                }
                if (column > lastColumn) {
                    lastColumn = column;
                }
            }
        }
    }

    // do we have holes inside ?
    for (row = firstRow; row <= lastRow; row++) {
        cell = xlsSheet[columns[firstColumn] + rows[row]];
        if (cell === undefined || cell.w === undefined) {
            bValidRange = false;
            break;
        }
    }

    for (column = firstColumn; column <= lastColumn; column++) {
        cell = xlsSheet[columns[column] + rows[firstRow]];
        if (cell === undefined || cell.w === undefined) {
            bValidRange = false;
            break;
        }
    }

    // validation ok
    // narrow down to the clean data area
    if (bValidRange) {

        rows = rows.slice(firstRow, lastRow + 1);
        columns = columns.slice(firstColumn, lastColumn + 1);

        context = {
            firstRow: rows[0],
            columns: columns,
            rows: rows,
            sheet: xlsSheet
        };
    }

    return context;
}

function getPropertyType(context, column) {
    var type, format, property = {};
    context.rows.forEach(function (row) {
        if (row !== context.firstRow) {
            var cell = context.sheet[column + row];
            if (cell) {
                if (!type) {
                    if (cell.t) {
                        type = cell.t;
                        format = cell.z;
                    }
                }
                else {
                    if (type !== cell.t && format !== cell.z) {
                        type = 's';
                        format = 'general';
                    }
                }
            }
        }
    });

    type = type || 's';

    switch (type) {
        case 's':
            if (context.sheet[column + context.rows[1]]
                && context.sheet[column + context.rows[1]].w) {
                var data = context.sheet[column + context.rows[1]].w;
                if (data.indexOf('data:image') === 0) {
                    property.tags = ['photo'];
                }
                else if (data.indexOf('assets/') === 0) {
                    property.tags = ['photo'];
                    property.isAsset = true;
                }
                else if (url.parse(data).protocol) {
                    property.tags = ['url'];
                }
            }
            property.propertyType = 'String';
            break;
        case 'b':
            property.propertyType = 'Boolean';
            break;
        case 'n':
            switch (format) {
                case 'General':
                case '#,##0':
                case '#,##0.00':
                case '#,##0 ;(#,##0)':
                case '#,##0 ;[Red](#,##0)':
                case '#,##0.00;(#,##0.00)':
                case '#,##0.00;[Red](#,##0.00)':
                case '0%':
                case '0.00%':
                    property.propertyType = 'Decimal';
                    break;
                case '0':
                    property.propertyType = 'Int32';
                    break;
                case '0.00':
                case '0.000':
                case '0.0000':
                case '0.00000':
                case '0.000000':
                case '0.0000000':
                case '0.00000000':
                case '0.000000000':
                    property.propertyType = 'Decimal';
                    break;
                case '0.00E+00':
                case '##0.0E+0':
                    property.propertyType = 'Double';
                    break;
                case '# ?/?':
                case '# ??/??':
                    property.propertyType = 'String';
                    break;
                case 'm/d/yy':
                case 'd-mmm-yy':
                case 'd-mmm':
                case 'mmm-yy':
                case 'm/d/yy h:mm':
                    property.propertyType = 'DateTime';
                    break;
                case 'h:mm AM/PM':
                case 'h:mm:ss AM/PM':
                case 'h:mm':
                case 'h:mm:ss':
                case 'mm:ss':
                case '[h]:mm:ss':
                case 'mmss.0':
                    property.propertyType = 'Time';
                    break;
                case '@':
                case '"上午/下午 "hh"時"mm"分"ss"秒 "':
                default:
                    property.propertyType = 'String';
                    break;
            }
            break;
        default :
            property.propertyType = 'String';
            break;
    }

    return property;
}

function convertData(property, cell) {
    var data;
    if (cell) {
        if (property.name.toLowerCase() === entityHelper.PROPERTY_ID.name.toLowerCase()) {
            /* JLT write : after discussing with JLS, if I understand the issue correctly, the problem is coming from the fact that the ID should be a "String" type and if not (The guy puts a number, or a date) it doesn't work.
             From my perspective for the column ID whatever XLS type in the XLS file it should be considered/managed as a string.*/
            data = cell && cell.w ? cell.w.toString() : null;
        }
        else {
            switch (property.propertyType) {
                case 'Int32':
                    data = cell.v ? parseInt(cell.v, 10) : undefined;
                    break;
                case 'Decimal':
                case 'Double':
                    data = cell.v ? parseFloat(cell.v) : undefined;
                    break;
                case 'DateTime':
                case 'Time':
                    data = undefined;
                    if (cell.v) {
                        var res = XLSX.SSF.parse_date_code(cell.v);
                        res.m = res.m !== 0 ? res.m - 1 : res.m;
                        data = new Date(Date.UTC(res.y, res.m, res.d, res.H, res.M, res.S));
                    }
                    break;
                case 'Boolean':
                    data = cell.v;
                    break;
                default:
                    data = cell && cell.w ? cell.w : null;
                    break;
            }
        }
    }

    return data;
}

function getColumns(xlsSheet, sheetName) {
    var context = getFirstRowAndColumns(xlsSheet),
        oInfo = null; // info returned containing column, data and origin

    if (context) {

        var columns = [], properties = {};
        context.columns.forEach(function (column, index) {
            var cell = xlsSheet[column + context.firstRow], property;
            if (index === 0) {
                /* JLT write : after discussing with JLS, if I understand the issue correctly, the problem is coming from the fact that the ID should be a "String" type and if not (The guy puts a number, or a date) it doesn't work.
                 From my perspective for the column ID whatever XLS type in the XLS file it should be considered/managed as a string.*/
                property = {
                    propertyType: 'String',
                    order: index,
                    name: XLSX.utils.format_cell(cell).trim()
                };
            }
            else {
                property = util._extend(getPropertyType(context, column), {
                    order: index,
                    name: XLSX.utils.format_cell(cell).trim()
                });
            }

            properties[column] = property;
            columns.push(property);
        });

        var data = [];
        context.rows.forEach(function (row) {
            if (row !== context.firstRow) {
                var element = {};
                context.columns.forEach(function (column) {
                    var cell = xlsSheet[column + row];
                    element[properties[column].name] = convertData(properties[column], cell);
                });

                data.push(element);
            }
        });
        var origin = {
            firstRow: context.firstRow,
            firstColumn: context.columns[0],
            firstRowIndex: XLSX.utils.decode_row(context.firstRow),
            firstColumnIndex: XLSX.utils.decode_col(context.columns[0]),
            sheetName: sheetName,
            isTable: false
        };

        oInfo = {columns: columns, data: data, origin: origin};
    }

    return oInfo;
}

function getTable(table, context, sheet) {
    if (context.workbook.files.hasOwnProperty(table.target)) {
        var dataBinary = context.workbook.files[table.target].asNodeBuffer().toString('binary');
        var handle = new htmlparser.DefaultHandler(function (error, dom) {
            // http://msdn.microsoft.com/en-us/library/documentformat.openxml.spreadsheet.table(v=office.15).aspx
            var xmlTable = htmlparser.DomUtils.getElementsByTagName('table', dom)[0];
            table.name = xmlTable.attribs.name;
            table.columns = [];
            table.displayName = xmlTable.attribs.displayName;

            var tableBoundaries = XLSX.utils.decode_range(xmlTable.attribs.ref);
            var rows = [], columns = [], column, row;
            var index = 0;
            for (column = tableBoundaries.s.c; column <= tableBoundaries.e.c; ++column, index++) {
                columns[index] = XLSX.utils.encode_col(column);
            }
            index = 0;
            for (row = tableBoundaries.s.r; row <= tableBoundaries.e.r; ++row, index++) {
                rows[index] = XLSX.utils.encode_row(row);
            }
            var tableContent = {
                firstRow: rows[0],
                columns: columns,
                rows: rows,
                sheet: table.xlsSheet
            };

            var properties = {};
            htmlparser.DomUtils.getElementsByTagName('tableColumn', xmlTable).forEach(function (xmlColumn, idx) {
                var col;
                var name = xmlColumn.attribs.name.toLowerCase();
                var matchForeignKey = name.match(/\./g);
                var isForeignKey = !!matchForeignKey && matchForeignKey.length === 2;
                var isKey = idx === 0 && name === entityHelper.PROPERTY_ID.name.toLowerCase();
                if (isKey || isForeignKey) {
                    /* JLT write : after discussing with JLS, if I understand the issue correctly, the problem is coming from the fact that the ID should be a "String" type and if not (The guy puts a number, or a date) it doesn't work.
                     From my perspective for the column ID whatever XLS type in the XLS file it should be considered/managed as a string.*/
                    col = {
                        propertyType: 'String',
                        name: xmlColumn.attribs.name,
                        order: idx
                    };
                }
                else {
                    col = util._extend(getPropertyType(tableContent, columns[table.columns.length]), {
                        name: xmlColumn.attribs.name,
                        order: idx
                    });
                }

                properties[columns[table.columns.length]] = col;
                table.columns.push(col);
            });

            var data = [], lastRowWithData = -1;
            tableContent.rows.forEach(function (currRow, idx) {
                if (currRow !== tableContent.firstRow) {
                    var element = {};
                    var hasData = false;
                    tableContent.columns.forEach(function (currColumn) {
                        var cell = table.xlsSheet[currColumn + currRow];
                        var value = convertData(properties[currColumn], cell);
                        if (value) {
                            hasData = true;
                            lastRowWithData = idx;
                        }
                        element[properties[currColumn].name] = value;
                    });
                    data.push(element);
                    if (hasData) {
                        lastRowWithData = data.length - 1;
                    }
                }
            });

            table.data = data.slice(0, lastRowWithData + 1);
            table.origin = {
                firstRow: tableContent.firstRow,
                firstColumn: tableContent.columns[0],
                firstRowIndex: tableBoundaries.s.r,
                firstColumnIndex: tableBoundaries.s.c,
                sheetName: sheet.name,
                isTable: true
            };
        });

        var parser = new htmlparser.Parser(handle);
        parser.parseComplete(dataBinary);
    }
    else {
        throw new Error('not found');
    }
}

function getRelSheet(sheet, context) {
    var fileName = 'xl/worksheets/_rels/' + sheet.target.substr(sheet.target.lastIndexOf('/') + 1) + '.rels';

    if (context.workbook.files.hasOwnProperty(fileName)) {
        var data = context.workbook.files[fileName].asNodeBuffer().toString('binary');
        var handle = new htmlparser.DefaultHandler(function (error, dom) {
            htmlparser.DomUtils.getElementsByTagName('Relationship', dom).forEach(function (relationship) {
                if (relationship.attribs.Type === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table') {
                    sheet.table[relationship.attribs.Id].target = 'xl' + relationship.attribs.Target.substr(relationship.attribs.Target.indexOf('/'));
                }
            });
        });

        var parser = new htmlparser.Parser(handle);
        parser.parseComplete(data);
    }
    else {
        throw new Error('not found');
    }
}

function getSheet(sheet, context) {
    var fileName = 'xl/' + sheet.target;

    if (context.workbook.files.hasOwnProperty(fileName)) {
        var data = context.workbook.files[fileName].asNodeBuffer().toString('binary');
        var handle = new htmlparser.DefaultHandler(function (error, dom) {
            sheet.tables = [];
            sheet.table = {};
            sheet.xlsSheet = context.workbook.Sheets[sheet.name];

            htmlparser.DomUtils.getElementsByTagName('tablePart', dom).forEach(function (xmlTablePart) {
                var table = {
                    id: xmlTablePart.attribs['r:id'],
                    xlsSheet: sheet.xlsSheet
                };

                sheet.tables.push(table);
                sheet.table[table.id] = table;
                context.tables.push(table);
            });

            if (sheet.tables.length > 0) {
                getRelSheet(sheet, context);

                sheet.tables.forEach(function (table) {
                    getTable(table, context, sheet);
                });
            }
        });

        var parser = new htmlparser.Parser(handle);
        parser.parseComplete(data);
    }
    else {
        throw new Error('not found');
    }
}

function getRelWorkBook(context) {
    if (context.workbook.files.hasOwnProperty('xl/_rels/workbook.xml.rels')) {
        var data = context.workbook.files['xl/_rels/workbook.xml.rels'].asNodeBuffer().toString('binary');
        var handle = new htmlparser.DefaultHandler(function (error, dom) {
            htmlparser.DomUtils.getElementsByTagName('Relationship', dom).forEach(function (xmlRelationship) {
                if (xmlRelationship.attribs.Type === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet') {
                    context.sheet[xmlRelationship.attribs.Id].target = xmlRelationship.attribs.Target;
                }
            });
        });

        var parser = new htmlparser.Parser(handle);
        parser.parseComplete(data);
    }
    else {
        throw new Error('not found');
    }
}

function getWorkBook(workbook, messages) {
    var tables = [], context = {workbook: workbook}, oSheetInfo;

    if (context.workbook.files.hasOwnProperty('xl/workbook.xml')) {
        var data = context.workbook.files['xl/workbook.xml'].asNodeBuffer().toString('binary');
        var handle = new htmlparser.DefaultHandler(function (error, dom) {
            context.sheets = [];
            context.tables = [];
            context.sheet = {};
            htmlparser.DomUtils.getElementsByTagName('sheet', dom).forEach(function (xmlSheet) {
                var sheet = {
                    id: xmlSheet.attribs['r:id'],
                    name: xmlSheet.attribs.name,
                    sheetId: xmlSheet.attribs.sheetId
                };

                context.sheets.push(sheet);
                context.sheet[sheet.id] = sheet;
            });

            getRelWorkBook(context);

            context.sheets.forEach(function (sheet) {
                getSheet(sheet, context);
            });

            if (context.tables.length > 0) {
                context.tables.forEach(function (table) {
                    tables.push({
                        name: table.name.trim(),
                        displayName: table.displayName,
                        columns: table.columns,
                        data: table.data,
                        origin: table.origin
                    });
                });
            }
            else {
                context.sheets.forEach(function (sheet) {

                    // skip empty sheets
                    if (lodash.isEmpty(sheet.xlsSheet)) {
                        return true;
                    }

                    oSheetInfo = getColumns(sheet.xlsSheet, sheet.name);
                    if (oSheetInfo) {
                        tables.push(util._extend(oSheetInfo, {
                            name: sheet.name.trim(),
                            displayName: sheet.name,
                            sheetName: sheet.name
                        }));
                    }
                    else {
                        messages.push({level: 'error', code: 'R8', description: R8, sheet: sheet.name});
                    }
                });
            }
        });

        var parser = new htmlparser.Parser(handle);
        parser.parseComplete(data);
    }
    else {
        throw new Error('No workbook found in the xlsx file');
    }

    return tables;
}

exports.getDataFromXl = function (data, messages) {
    var workbook = XLSX.read(data, {
        type: 'binary',
        bookFiles: true,
        cellDates: true,
        cellNF: true,
        cellStyles: true
    });

    return getWorkBook(workbook, messages);
};
