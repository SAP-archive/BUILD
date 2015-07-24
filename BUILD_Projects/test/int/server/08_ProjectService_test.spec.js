'use strict';

var expect = require('norman-testing-tp').chai.expect;
var ProjectAPI = require('../api/ProjectsRestApi');
var api = new ProjectAPI();

var USER_ID = '5507028694267057674862a3';
var projectId;

describe('Project Service Test', function () {
    this.timeout(15000);
    var projectService;

    before('Setup assetService', function (done) {
        var registry = require('norman-common-server').registry;
        projectService = registry.getModule('ProjectService');
        done();
    });

    after(function (done) {
        // Only required for one user to do this task!
        api.resetDB(done);
    });

    it('projectService create model', function (done) {
        projectService.checkSchema(done);
    });

    it('projectService shutdown', function (done) {
        projectService.shutdown(done);
    });

    it('projectService Get Project - should not return a project if the state of fields is not correct', function (done) {
        var projectId = '5507028694267057674862a3';
        var userId = '5507028694267057674862a3';

        projectService.getProject(projectId, userId)
            .then(function () {
                done(new Error('Should have failed'));
            }).catch(function (err) {
                expect(err.message).to.eq('One of the parameters is not set correctly');
                done();
            });
    });

    it('projectService Get Project - should not return a project if the state of fields is not correct', function (done) {
        var userId = '5507028694267057674862a3';

        projectService.getProjects(userId, {}, {showArchived: 'StringValue'}, {}, false)
            .then(function () {
                done(new Error('Should have failed'));
            }).catch(function (err) {
                expect(err.message).to.eq('One of the parameters is not set correctly');
                done();
            });
    });

    it('projectService Create Project - should not create a new project is missing params', function (done) {
        projectService.createProject({})
            .then(function () {
                done(new Error('Should have failed'));
            }).catch(function (err) {
                expect(err.message).to.eq('One of the parameters is not set correctly');
                done();
            });
    });

    it('projectService Create Project - should not create a new project if name is a function', function (done) {
        var project = {};
        project.name = {name: 'test'};
        var userObject = {_id: USER_ID, email: 'user1@test.com'};

        projectService.createProject(userObject, project)
            .then(function () {
                done(new Error('Should have failed'));
            }).catch(function (err) {
                expect(err.message).to.eq('One of the parameters is not set correctly');
                done();
            });
    });

    it('projectService Create Project - should not create a new project if name is typeof function', function (done) {
        var project = {};
        project.name = 'Test Project';
        var userObject = {_id: USER_ID, email: 'user1@test.com'};

        projectService.createProject(userObject, project, {})
            .then(function (project) {
                expect(project).not.to.be.empty;
                expect(project.name).to.eq('Test Project');
                expect(project.archived).to.eq(false);
                expect(project.deleted).to.eq(false);
                done();
            }).catch(done);
    });

    it('projectService Update Project - should not be allowed update a project if the archived flag is not set correctly i.e. true|false', function (done) {
        var projectId = '5507028694267057674862a3';
        var updateFields = {archived: 'SomeValue'};

        projectService.updateProject(projectId, USER_ID, updateFields)
            .then(function () {
                done(new Error('Should have failed'));
            }).catch(function (err) {
                expect(err.message).to.eq('Archived field is not set correctly');
                done();
            });
    });

    it('projectService Update Project - should not be allowed update a project if the name field is not set correctly', function (done) {
        var projectId = '5507028694267057674862a3';
        var updateFields = {archived: 'SomeValue'};
        updateFields.name = {};

        projectService.updateProject(projectId, USER_ID, updateFields)
            .then(function () {
                done(new Error('Should have failed'));
            }).catch(function (err) {
                expect(err.message).to.eq('Name field is not set correctly');
                done();
            });
    });

    it('Step1. Create Project - create a new project with the invite list updated', function (done) {
        var userObject = {_id: USER_ID, email: 'user1@test.com'};

        var projectFields = {name: 'Test Project', invite_list: [{email: 'user2@test.com'}]};

        projectService.createProject(userObject, projectFields, {})
            .then(function (project) {
                expect(project).not.to.be.empty;
                expect(project.name).to.eq('Test Project');
                expect(project.archived).to.eq(false);
                expect(project.deleted).to.eq(false);
                expect(project.invite_list).not.to.be.empty;
                expect(project.invite_list[0].email).to.eq('user2@test.com');
                projectId = project._id;
                done();
            }).catch(done);
    });

    it('Step2. Update Project - should return a populated invite list when archived: false', function (done) {
        var userId = '5507028694267057674862a3';
        var updateFields = {name: 'Update Project', archived: false};

        projectService.updateProject(projectId, userId, updateFields)
            .then(function (project) {
                expect(project).not.to.be.empty;
                expect(project.name).to.eq('Update Project');
                expect(project.archived).to.eq(false);
                expect(project.invite_list).not.to.be.empty;
                expect(project.invite_list[0].email).to.eq('user2@test.com');
                done();
            }).catch(function (err) {
                done(new Error('Should not have failed, err: ' + err));
            });
    });


    it('Step3. Update Project - should return an empty invite list when archived: true', function (done) {
        var userId = '5507028694267057674862a3';
        var updateFields = {name: 'Update Project', archived: true};

        projectService.updateProject(projectId, userId, updateFields)
            .then(function (project) {
                expect(project).not.to.be.empty;
                expect(project.name).to.eq('Update Project');
                expect(project.archived).to.eq(true);
                expect(project.invite_list).to.be.empty;
                done();
            }).catch(function (err) {
                done(new Error('Should not have failed, err: ' + err));
            });
    });

	it('Set Deleted Project - create a new project and set deleted', function (done) {
		var userObject = {_id: USER_ID, email: 'user1@test.com'};

		var projectFields = {name: 'Test Delete Project'};

		projectService.createProject(userObject, projectFields, {})
				.then(function (project) {
					expect(project).not.to.be.empty;
					expect(project.name).to.eq('Test Delete Project');
					projectId = project._id;
					projectService.setDeletedFlag(projectId, true).then(function (id) {
						done();
					}).catch(function (err) {
						done(new Error('Should not have failed, err: ' + err));
					});
				}).catch(done);
	});

	it('Delete Project - create a new project and delete it', function (done) {
		var userObject = {_id: USER_ID, email: 'user1@test.com'};

		var projectFields = {name: 'Test Delete Project'};

		projectService.createProject(userObject, projectFields, {})
				.then(function (project) {
					expect(project).not.to.be.empty;
					expect(project.name).to.eq('Test Delete Project');
					projectId = project._id;
                    var changeInfo = {
                        action : 'delete'
                    };
                    projectService.onUserGlobalChange(USER_ID, changeInfo).then(function (id) {
						done();
					}).catch(function (err) {
						done(new Error('Should not have failed, err: ' + err));
					});
				}).catch(done);
	});


});
