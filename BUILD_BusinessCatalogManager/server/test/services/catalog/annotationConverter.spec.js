'use strict';

var converter = require('../../../lib/services/annotationConverter.js');
var helper = require('./catalogHelper.js');


function test(fileName, done) {
//    var reference = helper.getCatalog(fileName);
    helper.getMetadata(fileName, function (err, data) {
        if (err) {
            done(err);
        }
        else {
            converter.getCatalogAnnotations(data);
            done();
        }
    });
}

describe('UT - annotationConverter.spec.js - Check V4 annotation', function () {

    it('ZAREXT_CARTAPPROVAL_V2_SRV', function (done) {
        test('ZAREXT_CARTAPPROVAL_V2_SRV', done);
    });

});
