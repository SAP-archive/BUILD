'use strict';

var UICatalogAPI = require('../api/uiCatalogRestApi');
var api = new UICatalogAPI();

describe('DB init', function () {
    this.timeout(600000);
    before('db initialize', function (done) {
        api.dbInitialize(done);
    });
    it('ok', function (done) {
        api.initialize('dbinit.uicatalog@test.com','Minitest!1').then(done);
    });
});
