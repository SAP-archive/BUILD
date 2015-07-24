'use strict';

var formulaCalculation = require('norman-prototype-editors-server/DataModeler/lib/services/model/resource/formulaCalculation.js');
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var data = function () {
    return {
        SalesOrderSet: [
            {
                ID: "SO1"
            },
            {
                ID: "SO2"
            },
            {
                ID: "SO3"
            }
        ],
        SalesOrderItemSet:[
                {
                    ID:"D1",
                    Price:9,
                    ___SalesOrder_ItemSet_ID:"SO1",
                    ___SalesOrder_ItemSet1_ID:"SO1"
                },
                {
                    ID:"D1",
                    Price:11,
                    ___SalesOrder_ItemSet_ID:"SO1",
                    ___SalesOrder_ItemSet1_ID:"SO2"
                },
                {
                    ID:"D1",
                    Price:12,
                    ___SalesOrder_ItemSet_ID:"SO2",
                    ___SalesOrder_ItemSet1_ID:"SO3"
                }
            ]
    };
};
var helper = function () {
    return  {
        model: {
            "EntityType": [
                {
                    "ID": "SalesOrder",
                    "Name": "SalesOrder",
                    "Property": [{
                        "ID": "ID", "Name": "ID", "sap:calculated": null
                    }, {
                        "ID": "Sum",
                        "Name": "Sum",
                        "sap:calculated": "{\"calculation\":\"[{\\\"label\\\":\\\"PROPERTY\\\",\\\"name\\\":\\\"property\\\",\\\"entityName\\\":\\\"SalesOrderItem\\\",\\\"entityId\\\":\\\"SalesOrderItem\\\",\\\"navPropName\\\":\\\"ItemSet\\\",\\\"navPropId\\\":\\\"ItemSet\\\",\\\"navPropMultiplicity\\\":true,\\\"navPropOp\\\":\\\"sum\\\",\\\"propertyName\\\":\\\"Price\\\",\\\"propertyId\\\":\\\"Price\\\",\\\"type\\\":\\\"property\\\",\\\"id\\\":0}]\",\"inputProperties\":[{\"navPropId\":\"ItemSet\",\"entityId\":\"SalesOrderItem\",\"propertyId\":\"Price\",\"_id\":\"Price\"}]}"
                    }, {
                        "ID": "navProp1",
                        "Name": "navProp1",
                        "sap:calculated": "{\"calculation\":\"[{\\\"label\\\":\\\"PROPERTY\\\",\\\"name\\\":\\\"property\\\",\\\"entityName\\\":\\\"SalesOrderItem\\\",\\\"entityId\\\":\\\"SalesOrderItem\\\",\\\"navPropName\\\":\\\"ItemSet1\\\",\\\"navPropId\\\":\\\"ItemSet1\\\",\\\"navPropMultiplicity\\\":false,\\\"navPropOp\\\":\\\"sum\\\",\\\"propertyName\\\":\\\"Price\\\",\\\"propertyId\\\":\\\"Price\\\",\\\"type\\\":\\\"property\\\",\\\"id\\\":0}]\",\"inputProperties\":[{\"navPropId\":\"ItemSet1\",\"entityId\":\"SalesOrderItem\",\"propertyId\":\"Price\",\"_id\":\"Price\"}]}"
                    }, {
                        "ID": "OtherSum",
                        "Name": "OtherSum",
                        "sap:calculated": "{\"calculation\":\"[{\\\"label\\\":\\\"PROPERTY\\\",\\\"name\\\":\\\"property\\\",\\\"entityName\\\":\\\"SalesOrder\\\",\\\"entityId\\\":\\\"SalesOrder\\\",\\\"navPropName\\\":null,\\\"navPropId\\\":null,\\\"navPropMultiplicity\\\":null,\\\"navPropOp\\\":\\\"sum\\\",\\\"propertyName\\\":\\\"Sum\\\",\\\"propertyId\\\":\\\"Sum\\\",\\\"type\\\":\\\"property\\\",\\\"id\\\":0}]\",\"inputProperties\":[{\"navPropId\":null,\"entityId\":\"SalesOrder\",\"propertyId\":\"Sum\",\"_id\":\"Sum\"}]}"
                    }],
                    "NavigationProperty": [{
                        "ID": "ItemSet",
                        "Name": "ItemSet",
                        "Relationship": "85900af83755aab009dbf004.SalesOrderItemSetSalesOrderItem",
                        "ToRole": "ToRole_SalesOrderItemSetSalesOrderItem"
                    }, {
                        "ID": "ItemSet1",
                        "Name": "ItemSet1",
                        "Relationship": "85900af83755aab009dbf004.SalesOrderItemSetSalesOrderItem1",
                        "ToRole": "ToRole_SalesOrderItemSetSalesOrderItem1"
                    }]
                },
                {
                    "Name": "SalesOrderItem", "Property": [{
                        "ID": "ID", "Name": "ID", "sap:calculated": null
                    }, {
                        "ID": "Price", "Name": "Price", "sap:calculated": null
                    }, {
                        "ID": "___SalesOrder_ItemSet_ID", "Name": "___SalesOrder_ItemSet_ID", "sap:calculated": null
                    }, {
                        "ID": "___SalesOrder_ItemSet1_ID", "Name": "___SalesOrder_ItemSet1_ID", "sap:calculated": null
                    }], "NavigationProperty": []
                }
            ],
            "Schema": [{
                "Namespace": "85900af83755aab009dbf004"
            }],
            "EntitySet": [
                {
                "EntityType": "85900af83755aab009dbf004.SalesOrder", "ID": "SalesOrderSet", "Name": "SalesOrderSet"
            }, {
                "EntityType": "85900af83755aab009dbf004.SalesOrderItem", "ID": "SalesOrderItemSet", "Name": "SalesOrderItemSet"
            }],
            "Association": [
                {
                    "Name": "SalesOrderItemSetSalesOrderItem",
                    "End": [{
                        "Role": "FromRole_SalesOrderItemSetSalesOrderItem",
                        "Type": "85900af83755aab009dbf004.SalesOrder",
                        "Multiplicity": "1"
                    }, {
                        "Role": "ToRole_SalesOrderItemSetSalesOrderItem",
                        "Type": "85900af83755aab009dbf004.SalesOrderItem",
                        "Multiplicity": "*"
                    }],
                    "ReferentialConstraint": [{
                        "Principal": [{
                            "PropertyRef": [{
                                "Name": "ID"
                            }]
                        }],
                        "Dependent": [{
                            "PropertyRef": [{
                                "Name": "___SalesOrder_ItemSet_ID"
                            }]
                        }]
                    }]
                },
                {
                    "Name": "SalesOrderItemSetSalesOrderItem1",
                    "End": [{
                        "Role": "FromRole_SalesOrderItemSetSalesOrderItem1",
                        "Type": "85900af83755aab009dbf004.SalesOrder",
                        "Multiplicity": "1"
                    }, {
                        "Role": "ToRole_SalesOrderItemSetSalesOrderItem1",
                        "Type": "85900af83755aab009dbf004.SalesOrderItem",
                        "Multiplicity": "1"
                    }],
                    "ReferentialConstraint": [{
                        "Principal": [{
                            "PropertyRef": [{
                                "Name": "ID"
                            }]
                        }],
                        "Dependent": [{
                            "PropertyRef": [{
                                "Name": "___SalesOrder_ItemSet1_ID"
                            }]
                        }]
                    }]
                }
            ]
        },
        find: function (what, where) {
            if (typeof where === 'undefined') {
                where = this.model;
            }
            var result = [];
            for (var prop in where) {
                if (prop === what && Array.isArray(where[prop])) {
                    result = result.concat(where[prop]);
                }
                else if (Array.isArray(where[prop])) {
                    for (var i = 0; i < where[prop].length; i++) {
                        result = result.concat(this.find(what, where[prop][i]));
                    }
                }
            }
            return result;
        },
        getAttribute: function (attribute, of) {
            var result;
            if (attribute && of) {
                if(attribute === 'sap:calculated') {
                    result = of[attribute];
                    var name = of['Name'];
                    if (result) {
                        result = JSON.parse(of[attribute]);
                        if(result.calculation) {
                            result.calculation = JSON.parse(result.calculation);
                        }
                    }
                }
                else {
                    result = of[attribute];
                }
            }
            return result;
        }
    };
};

describe('FormulaCalculation - removeNull()', function () {
    it('should return [0] when given [null]', function (done) {
        expect(formulaCalculation.removeNull([null])[0]).equal(0);
        done();
    });
    it('should return [0, 0] when given [null, 0]', function (done) {
        expect(formulaCalculation.removeNull([null, 0])[0]).equal(0);
        done();
    });
    it('should return [\'\', \'\'] when given [null, \'\']', function (done) {
        expect(formulaCalculation.removeNull([null, ''])[0]).equal('');
        done();
    });
});

describe('FormulaCalculation - allNumeric()', function () {
    it('should return true when given [null]', function (done) {
        expect(formulaCalculation.allNumeric([null])).equal(true);
        done();
    });
    it('should return false when given [\'\']', function (done) {
        expect(formulaCalculation.allNumeric([''])).equal(false);
        done();
    });
    it('should return true when given [0]', function (done) {
        expect(formulaCalculation.allNumeric([0])).equal(true);
        done();
    });
    it('should return false when given [\'\', 0]', function (done) {
        expect(formulaCalculation.allNumeric(['', 0])).equal(false);
        done();
    });
    it('should return true when given [\'1\', 2, \'3\', 4]', function (done) {
        expect(formulaCalculation.allNumeric(['1', 2, '3', 4])).equal(true);
        done();
    });
    it('should return true when given [\'1\', \'2\', \'3\', \'4\']', function (done) {
        expect(formulaCalculation.allNumeric(['1', 2, '3', 4])).equal(true);
        done();
    });
    it('should return false when given [\'\', \'0\']', function (done) {
        expect(formulaCalculation.allNumeric(['', '0'])).equal(false);
        done();
    });
    it('should return false when given [0, \'string\']', function (done) {
        expect(formulaCalculation.allNumeric([0, 'string'])).equal(false);
        done();
    });
});

describe('FormulaCalculation - calcLeft()', function () {
    var getProps = function() {
        var props = [];
        for (var i = 0; i < arguments.length; i++) {
            props.push({
                name: 'Property' + i,
                id: 'test' + i,
                done: arguments[i]
            });
        }
        return props;
    };
    it('should return 0 when given ' + JSON.stringify(getProps(true, true, true)), function (done) {
        var props = getProps(true, true, true);
        expect(formulaCalculation.calcLeft(props)).equal(0);
        done();
    });
    it('should return 1 when given ' + JSON.stringify(getProps(false, true, true)), function (done) {
        var props = getProps(false, true, true);
        expect(formulaCalculation.calcLeft(props)).equal(1);
        done();
    });
    it('should return 1 when given ' + JSON.stringify(getProps(undefined, true, true)), function (done) {
        var props = getProps(undefined, true, true);
        expect(formulaCalculation.calcLeft(props)).equal(1);
        done();
    });
    it('should return 2 when given ' + JSON.stringify(getProps(false, undefined, true)), function (done) {
        var props = getProps(false, undefined, true);
        expect(formulaCalculation.calcLeft(props)).equal(2);
        done();
    });
    it('should return 0 when given []', function (done) {
        var props = [];
        expect(formulaCalculation.calcLeft(props)).equal(0);
        done();
    });
});

describe('FormulaCalculation - noCalcProp()', function () {
    var getProps = function() {
        var props = [];
        props[0] = {
            name: 'Property0',
            propertyId: 'Property0',
            done: arguments[0],
            entityId: 'Entity',
            parentElement: {
            "Name": "Entity"
            },
            Name: "Property0"
        };
        props[1] = {
            name: 'Property1',
            propertyId: 'Property1',
            done: arguments[1],
            entityId: 'Entity',
            parentElement: {
                "Name": "Entity"
            },
            Name: "Property0"
        };
        return props;
    };
    var modelHelper = helper();
    it('should return true when given ' + JSON.stringify(getProps(true, true)) + ', ' + JSON.stringify(getProps(undefined, undefined)), function (done) {
        var calcProps = getProps(true, true);
        var props = getProps();
        expect(formulaCalculation.noCalcProp(props, calcProps, modelHelper)).equal(true);
        done();
    });
    it('should return true when given ' + JSON.stringify(getProps(true, false)) + ', ' + JSON.stringify(getProps(undefined, undefined)), function (done) {
        var calcProps = getProps(true, false);
        var props = getProps();
        expect(formulaCalculation.noCalcProp(props, calcProps, modelHelper)).equal(false);
        done();
    });
    it('should return true when given ' + JSON.stringify(getProps()) + ', ' + JSON.stringify(getProps(undefined, undefined)), function (done) {
        var calcProps = getProps();
        var props = getProps();
        expect(formulaCalculation.noCalcProp(props, calcProps, modelHelper)).equal(false);
        done();
    });
});

describe('FormulaCalculation - resetCircularity()', function () {
    var getProps = function () {
        var props = [
            {
                beenThrough: false
            },
            {
                beenThrough: true
            },
            {
                beenThrough: true
            },
            {
                beenThrough: true
            },
            {
                beenThrough: false
            },
            {
                beenThrough: true
            }
        ];
        var resetProps = [
            {
                beenThrough: false
            },
            {
                beenThrough: false
            },
            {
                beenThrough: false
            },
            {
                beenThrough: false
            },
            {
                beenThrough: false
            },
            {
                beenThrough: false
            }
        ];
        return [props, resetProps];
    };
    it('should return ' + JSON.stringify(getProps()[1]) + ' when given , ' + JSON.stringify(getProps()[0]), function (done) {
        var props = getProps()[0];
        formulaCalculation.resetCircularity(props);
        for (var i = 0; i < props.length; i++) {
            expect(props[i].beenThrough).equal(getProps()[1][i].beenThrough);
        }
        done();
    });
});

describe('FormulaCalculation - getEntity()', function () {
    it('should return the correct entity when given the name of an existing entity', function (done) {
        var modelHelper = helper();
        expect(formulaCalculation.getEntity('SalesOrder', modelHelper)).equal(modelHelper.model.EntityType[0]);
        expect(formulaCalculation.getEntity('SalesOrderItem', modelHelper)).equal(modelHelper.model.EntityType[1]);
        done();
    });
    it('should return undefined when given the name of a non-existing entity', function (done) {
        var modelHelper = helper();
        expect(formulaCalculation.getEntity('NonExisting', modelHelper)).equal(undefined);
        done();
    });
});

describe('FormulaCalculation - getProperty()', function () {
    it('should return the correct property when given the name of an existing property', function (done) {
        var modelHelper = helper();
        expect(formulaCalculation.getProperty('Sum', modelHelper.model.EntityType[0], modelHelper)).equal(modelHelper.model.EntityType[0].Property[1]);
        expect(formulaCalculation.getProperty('Price', modelHelper.model.EntityType[1], modelHelper)).equal(modelHelper.model.EntityType[1].Property[1]);
        done();
    });
    it('should return undefined when given the name of a non-existing property', function (done) {
        var modelHelper = helper();
        expect(formulaCalculation.getProperty('NonExisting', modelHelper.model.EntityType[0], modelHelper)).equal(undefined);
        expect(formulaCalculation.getProperty('Sum', modelHelper.model.EntityType[1], modelHelper)).equal(undefined);
        done();
    });
});

describe('FormulaCalculation - getNavPropValues()', function() {
    it('should return the correct summation of all linked properties when given a 1.n relationship with a sum operator', function (done) {
        var modelHelper = helper();
        var testData = data();
        var formulaObj = JSON.parse(JSON.parse(modelHelper.model.EntityType[0].Property[1]['sap:calculated']).calculation)[0];
        expect(formulaCalculation.getNavPropValues(testData, testData['SalesOrderSet'][0], formulaObj, modelHelper.model.EntityType[0].NavigationProperty[0], modelHelper)).equal(testData.SalesOrderItemSet[0].Price + testData.SalesOrderItemSet[1].Price);
        done();
    });
    it('should return the mean of all linked properties when given a 1.n relationship with a mean operator', function (done) {
        var modelHelper = helper();
        var testData = data();
        var formulaObj = JSON.parse(JSON.parse(modelHelper.model.EntityType[0].Property[1]['sap:calculated']).calculation)[0];
        formulaObj.navPropOp = 'mean';
        expect(formulaCalculation.getNavPropValues(testData, testData['SalesOrderSet'][0], formulaObj, modelHelper.model.EntityType[0].NavigationProperty[0], modelHelper)).equal((testData.SalesOrderItemSet[0].Price + testData.SalesOrderItemSet[1].Price)/2);
        done();
    });
    it('should return the correct number of linked properties when given a 1.n relationship with a count operator', function (done) {
        var modelHelper = helper();
        var testData = data();
        var formulaObj = JSON.parse(JSON.parse(modelHelper.model.EntityType[0].Property[1]['sap:calculated']).calculation)[0];
        formulaObj.navPropOp = 'count';
        expect(formulaCalculation.getNavPropValues(testData, testData['SalesOrderSet'][0], formulaObj, modelHelper.model.EntityType[0].NavigationProperty[0], modelHelper)).equal(2);
        done();
    });
    it('should return the correct value of the linked properties when given a 1.1 relationship', function (done) {
        var modelHelper = helper();
        var testData = data();
        var formulaObj = JSON.parse(JSON.parse(modelHelper.model.EntityType[0].Property[2]['sap:calculated']).calculation)[0];
        expect(formulaCalculation.getNavPropValues(testData, testData['SalesOrderSet'][0], formulaObj, modelHelper.model.EntityType[0].NavigationProperty[1], modelHelper)).equal(testData.SalesOrderItemSet[0].Price);
        done();
    });
    it('should return null when given invalid parameters', function (done) {
        var modelHelper = helper();
        var testData = data();
        var formulaObj = JSON.parse(JSON.parse(modelHelper.model.EntityType[0].Property[2]['sap:calculated']).calculation)[0];
        var navProp = modelHelper.model.EntityType[0].NavigationProperty[1];
        formulaObj.propertyName = '';
        expect(formulaCalculation.getNavPropValues(testData, testData['SalesOrderSet'][0], formulaObj, navProp, modelHelper)).equal(null);
        done();
    });
});

describe('FormulaCalculation - eraseCalculatedValues()', function() {
    it('should erase calculated values when given data where calculations have been performed', function (done) {
        var modelHelper = helper();
        var calculatedData = data();
        calculatedData.SalesOrderSet[0].Sum = 20;
        calculatedData.SalesOrderSet[1].Sum = 9;
        calculatedData.SalesOrderSet[2].Sum = 0;
        formulaCalculation.eraseCalculatedValues(calculatedData, modelHelper);
        expect(calculatedData.SalesOrderSet[0].Sum).equal(undefined);
        expect(calculatedData.SalesOrderSet[1].Sum).equal(undefined);
        expect(calculatedData.SalesOrderSet[2].Sum).equal(undefined);
        done();
    });
    it('should not change anything when given data that has not been processed', function (done) {
        var modelHelper = helper();
        var calculatedData = data();
        var initialData = data();
        formulaCalculation.eraseCalculatedValues(calculatedData, modelHelper);
        expect(initialData).to.deep.equal(calculatedData);
        done();
    });
});

describe('FormulaCalculation - getCalculatedProperties()', function() {
    it('should return an array of all calculated properties needed for a given property\'s calculation', function (done) {
        var modelHelper = helper();
        expect(formulaCalculation.getCalculatedProperties(modelHelper.model.EntityType[0], modelHelper.model.EntityType[0].Property[1], data(), [], modelHelper)).to.deep.equal([modelHelper.model.EntityType[0].Property[1]]);
        expect(formulaCalculation.getCalculatedProperties(modelHelper.model.EntityType[0], modelHelper.model.EntityType[0].Property[3], data(), [], modelHelper)).to.deep.equal([modelHelper.model.EntityType[0].Property[3], modelHelper.model.EntityType[0].Property[1]]);
        done();
    });
});

describe('FormulaCalculation - calculateValues()', function() {
    it('Should return the data with all calculated values', function (done) {
        var modelHelper = helper();
        var calcProps = [];
        var curProp = modelHelper.model.EntityType[0].Property[1];
        curProp.parentElement = modelHelper.model.EntityType[0];
        calcProps.push(curProp);
        curProp = modelHelper.model.EntityType[0].Property[2];
        curProp.parentElement = modelHelper.model.EntityType[0];
        calcProps.push(curProp);
        curProp = modelHelper.model.EntityType[0].Property[3];
        curProp.parentElement = modelHelper.model.EntityType[0];
        calcProps.push(curProp);
        var expected = [{
            "ID":"SO1",
            "Sum":20,
            "navProp1":9,
            "OtherSum":20
        },{
            "ID":"SO2",
            "Sum":12,
            "navProp1":11,
            "OtherSum":12
        },{
            "ID":"SO3",
            "Sum":0,
            "navProp1":12,
            "OtherSum":0
        }];
        expect(formulaCalculation.calculateValues(modelHelper.model.EntityType[0], data(), calcProps, modelHelper)).to.deep.equal(expected);
        done();
    });
});

describe('FormulaCalculation - getNameSet()', function() {
    it('Should return the correct nameSet for the given entity and undefined if entity does\'t exist', function (done) {
        var modelHelper = helper();
        expect(formulaCalculation.getNameSet(modelHelper.model.EntityType[0].Name, modelHelper)).equal(modelHelper.model.EntitySet[0].Name);
        expect(formulaCalculation.getNameSet(modelHelper.model.EntityType[1].Name, modelHelper)).equal(modelHelper.model.EntitySet[1].Name);
        expect(formulaCalculation.getNameSet('nonExistingEntity', modelHelper)).equal(undefined);
        done();
    });
});

describe('FormulaCalculation - generateResult()', function() {
    it('Should return the correct results when given calculations', function (done) {
        var modelHelper = helper();
        var formulaObj = [{
            "label":"PROPERTY",
            "name":"property",
            "entityName":"SalesOrderItem",
            "entityId":"SalesOrderItem",
            "navPropName":"ItemSet",
            "navPropId":"ItemSet",
            "navPropMultiplicity":true,
            "navPropOp":"sum",
            "propertyName":"Price",
            "propertyId":"Price",
            "type":"property",
            "id":0
        }];
        var currentData = data();
        var dataPoint = currentData.SalesOrderSet[0];
        var entity = modelHelper.model.EntityType[0];
        var result = currentData.SalesOrderItemSet[0].Price + currentData.SalesOrderItemSet[1].Price;
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"+",
            "name":"plus",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":3
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":7
            }]
        }];
        result = 10;
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"*",
            "name":"times",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":3
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":7
            }]
        }];
        result = 21;
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"/",
            "name":"divide",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":3
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":7
            }]
        }];
        result = 3/7;
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"-",
            "name":"minus",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":3
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":7
            }]
        }];
        result = -4;
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"+",
            "name":"plus",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'hell'
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'o'
            }]
        }];
        result = 'hello';
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"+",
            "name":"plus",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":undefined
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":null
            }]
        }];
        result = 0;
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        formulaObj = [{
            "label":"/",
            "name":"divide",
            "type":"operator",
            "left":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'hell'
            }],
            "right":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'0'
            }]
        }];
        result = true;
        expect(isNaN(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper))).equal(result);
        formulaObj = [{
            "label":"IF",
            "name":"if",
            "type":"condition",
            "condition":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'true'
            }],
            "then":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'success'
            }],
            "else":[{
                "label":"VALUE",
                "name":"value",
                "type":"value",
                "value":'fail'
            }]
        }];
        result = 'success';
        expect(formulaCalculation.generateResult(formulaObj, currentData, dataPoint, entity, modelHelper)).equal(result);
        done();
    });
});
