'use strict';

describe('Unit tests for UserResearch TaskCreator factory', function () {

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('common.utils'));
    beforeEach(module('UserResearch.utils'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));
    beforeEach(module('ngResource'));
    beforeEach(module('zip'));


    var taskCreator, httpBackend, projId = '007';
    var mockProtoType = {
        appMetadata: {},
        snapshot: {
            version: 1,
            deepLinks: []
        }
    };

    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', {
            currentProject: projId
        });
    }));

    beforeEach(inject(function ($injector, $httpBackend) {

        taskCreator = $injector.get('TaskCreator');
        httpBackend = $httpBackend;
    }));


    // createTask
    it('createTask should create a task on the server', function () {

        var tc = new taskCreator();
        var prototype = mockProtoType, name = 'The Name', desc = 'The desc', ord = '0', sub = '0';
        tc.createTask(prototype, name, desc, ord, sub);
        httpBackend.expect('POST', 'api/projects/' + projId + '/research/uploadFiles/').respond(200);
    });


    // uploadSuccess


    // setPrototype

    // onUploadError

    // onUploadStart


});
