'use strict';

var SharedWorkspaceRestApi = require('../api/SharedWorkspaceRestApi');
var api = new SharedWorkspaceRestApi();

describe('DB init', function () {
    this.timeout(120000);
    before('db initialize', function (done) {
        api.dbInitialize(done);
    });
    it('ok', function (done) {
        api.initialize('dbinit.shareWorkSpace@test.com','Minitest!1').then(done);
    });
});
