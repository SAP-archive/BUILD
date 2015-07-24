'use strict';

var async = require('async');
var util = require('util');
var tp = require('norman-server-tp');
var _ = tp.lodash;
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var projectService = registry.getModule('ProjectService');
var commonProjectService = registry.getModule('ProjectCommonService');
var historyService = registry.getModule('HistoryService');
var aclService = registry.getModule('AclService');
var userService = registry.getModule('UserService');
var serviceLogger = commonServer.logging.createLogger('project-ctrl');
var features = commonServer.features;

/**
 * Shallow copy of avatar and project detail
 *
 * @param project
 * @param avatars
 */
function addAvatar(project, avatars) {
    avatars.forEach(function (avatar) {
        util._extend(avatar, _.find(project.user_list, {user_id: avatar._id.toString()}));
    });
    project.user_list = avatars;
}

/**
 * Get list of projects either owned, collaborating on or invited to
 * Dev-note: User has the option of accessing archived projects by setting the flag true|false using the query param showArchived
 *
 * @param req
 * @param res
 */
module.exports.index = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> index()');

    var userId = req.user._id;
    var userEmail = req.user.email;

    // user can filter by archived, not query flag is not present ALL projects are returned
    var options = {};

    // Be default, showArchived will always be either true|false
    if (!_.isEmpty(req.query.showArchived)) {
        options.showArchived = (req.query.showArchived === 'true');
    }

    projectService.getProjects(userId, userEmail, options, {}, true)
        .then(function (projects) {
            // Need to update the project list with avatar details
            async.each([].concat(projects), function (project, done) {
                var tmpList = project.user_list.map(function (entry) {
                    return entry.user_id;
                });
                userService.showAvatarList(tmpList)
                    .then(function (avatars) {
                        addAvatar(project, avatars);
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });
            }, function (err) {
                if (err) {
                    serviceLogger.warn('<< index(), return error from avatar list');
                    return commonProjectService.sendError(res, err);
                }

                serviceLogger.info('<< index(), return project(s)');
                return commonProjectService.sendResponse(res, 200, projects);
            });
        })
        .catch(function (err) {
            serviceLogger.warn('<< index(), return error');
            return commonProjectService.sendError(res, err);
        });
};

/**
 * Return the specified project to the user. All fields are currently being returned to the UI.
 *
 * @param req
 * @param res
 * @returns {*}
 */
module.exports.show = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> show()');

    var userId = req.user._id;
    var projectId = req.params.projectId;
    var jsonProject;

    projectService.getProject(projectId, userId, {}, {}, true)
        .then(function (project) {
            // Step 1. Return project and pick out user list, need to update the avatar details
            if (!project) {
                serviceLogger.info('<< show(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }

            jsonProject = project;
            return project.user_list.map(function (entry) {
                return entry.user_id;
            });
        })
        .then(function (userList) {
            // Step 2. Will not return deleted users, will only display active users
            return userService.showAvatarList(userList)
                .then(function (avatars) {
                    serviceLogger.info('<< show(), return project');
                    addAvatar(jsonProject, avatars);
                    return commonProjectService.sendResponse(res, 200, jsonProject);
                });
        })
        .catch(function (err) {
            serviceLogger.info('<< show(), return error');
            return commonProjectService.sendError(res, err);
        });
};

/**
 * Creates a new project (and prototype) in the DB. All fields are currently being returned to the UI
 *
 * @param req
 * @param res
 */
exports.create = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> create()');

    var projectResponse = {};
    var userId = req.user._id;
    var userObject = {_id: userId, userEmail: req.user.email};

    projectService.createProject(userObject, req.body, req.context)
        .then(function (project) {
            // Step 1. Generate avatar list
            var tmpUserList = project.user_list.map(function (entry) {
                return entry.user_id;
            });
            serviceLogger.info('create(), project created');
            projectResponse = project;
            return userService.showAvatarList(tmpUserList);
        })
        .then(function (avatars) {
            // Step 2. Update project with avatar list
            projectResponse.user_list = avatars;
            serviceLogger.info('create(), avatars updated');
            return projectResponse;
        })
        .then(function (project) {
            // Step 3. Call SW Service if its available
            // Dev-note: using lookupModule rather than getRegistry as this returns undefined if not found rather than
            // throwing an exception
            var swProcessService = registry.lookupModule('SwProcessing');
            req.body.createPrototype = {
                numPages: 0
            };
            if (swProcessService !== undefined && !features.isEnabled('disable-prototype')) {
                serviceLogger.info('create(), creating prototype');
                return swProcessService.processMetadata(project._id.toString(), null, req, req.user._id);
            }
            serviceLogger.info('create(), prototype disabled, return empty prototype');
            return {};
        })
        .then(function (prototype) {
            // Step 4. Return project and update history
            var prototypeId = _.isEmpty(prototype) ? '' : prototype.prototype._id;
            historyService.logHistory({
                project_id: projectResponse._id,
                prototype_id: prototypeId,
                user: req.user._id,
                resource_url: 'api/projects/' + projectResponse._id + '/prototype',
                description: 'New project \'' + projectResponse.name + '\' Created!',
                resource_name: projectResponse.name,
                resource_type: 'project'
            });

            serviceLogger.info('<< create(), returning new project');
            return commonProjectService.sendResponse(res, 201, projectResponse);
        })
        .catch(function (err) {
            serviceLogger.warn('<< create(), return error, ' + err);
            return commonProjectService.sendError(res, err);
        });
};

/**
 * Update an existing project, if you have write access only. During the create phase, the ACL roles will have been
 * created. All fields are currently being returned to the UI.
 *
 * @param req
 * @param res
 * @returns {*}
 */
module.exports.update = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        body: req.body,
        user: req.user._id
    }, '>> update()');

    if (req.body._id) {
        delete req.body._id;
    }

    var userId = req.user._id;
    var projectId = req.params.projectId;

    // Update fields to reflect latest changes
    var updated = _.merge({}, req.body);
    updated.updated_at = new Date();
    updated.updated_by = req.user._id;
    updated.archived = (req.body.archived === true || req.body.archived === 'true') ? true : false;

    projectService.updateProject(projectId, userId, updated)
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< update(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }

            historyService.logHistory({
                project_id: project._id,
                user: req.user._id,
                resource_url: 'norman/projects/' + project._id + '/prototype',
                description: 'New project \'' + project.name + '\' Updated!',
                resource_name: project.name,
                resource_type: 'project'
            });

            serviceLogger.info('<< update(), returning project');
            return commonProjectService.sendResponse(res, 200, project);
        })
        .catch(function (err) {
            serviceLogger.warn('<< update(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

/**
 * Delete existing project in the DB. Only a HTTP status of 204 is returned to the UI.
 *
 * @param req
 * @param res
 * @returns {*}
 */
module.exports.delete = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> delete()');

    var userId = req.user._id;
    var projectId = req.params.projectId;

    projectService.getProject(projectId, userId, {}, {}, false)
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< delete(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }

            // Update fields to reflect changes
            project.stats.updated_at = new Date();
            project.stats.updated_by = req.user._id;

            // Soft delete
            project.deleted = true;

            project.save(function (err) {
                if (err) {
                    serviceLogger.warn('<< delete(), error during save, return error');
                    return commonProjectService.sendError(res, err);
                }
                serviceLogger.info('<< delete(), return status 204');
                return commonProjectService.sendResponse(res, 204, null);
            });
        })
        .catch(function (err) {
            serviceLogger.warn('<< delete(), return error');
            return commonProjectService.sendError(res, err);
        });
};

module.exports.createInvite = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> createInvite()');

    var emailList = req.body.email_list;

    if (emailList instanceof Array && emailList.length > 0) {

        // Check 1. User cant add themselves to the list
        if (emailList.some(function (value) {
                return value.email === req.user.email;
            })) {
            serviceLogger.warn('<< createInvite(), user cant add themselves, return error');
            return commonProjectService.sendResponse(res, 400, {
                error: 'Cannot invite yourself to a project that you are already a member of!'
            });
        }

        // Check 2. Each list item has to have an attribute called email specified and should be populated with a value
        if (emailList.some(function (value) {
                return (!value.hasOwnProperty('email') || !commonProjectService.validateEmail(value.email));
            })) {

            serviceLogger.warn('<< createInvite(), email is not set correctly, return error');
            return commonProjectService.sendResponse(res, 400, {
                error: commonProjectService.requestErrorMsg
            });
        }

        // Pull out email list
        var inviteeEmailList = _.pluck(emailList, 'email');

        // AccessService API Integration
        var accessService = registry.getModule('AccessService');
        accessService.inviteUsers(inviteeEmailList, 'project', req.context)
            .then(function (apiResponse) {
                serviceLogger.info('createInvite(), validating users access');

                var newInvitee = [];
                var emailListProvisioned = [];
                var toInviteeEmails = '';

                _.forEach(apiResponse, function (email) {
                    if (email.successfullyProvisioned) {
                        emailListProvisioned.push({email: email.emailAddress});
                        if (!email.acceptNotification) {
                            newInvitee.push({email: email.emailAddress, status: 'opt-out'});
                        }
                        else {
                            newInvitee.push({email: email.emailAddress, status: 'sent'});
                            toInviteeEmails += email.emailAddress + ';';
                        }
                    }
                    else {
                        newInvitee.push({email: email.emailAddress, status: 'rejected'});
                    }
                });

                return {inviteeList: newInvitee, provisioned: emailListProvisioned};
            })
            .then(function (emailList) {
                serviceLogger.info('createInvite(), updating project');

                var userId = req.user._id;
                var projectId = req.params.projectId;

                return projectService.updateProject(projectId, userId, {
                    $addToSet: {
                        invite_list: {
                            $each: emailList.provisioned
                        }
                    },
                    $pullAll: {
                        reject_list: emailList.provisioned
                    },
                    'stats.updated_at': new Date(),
                    'stats.updated_by': userId
                })
                    .then(function (project) {
                        if (!project) {
                            serviceLogger.info('<< createInvite(), nothing found');
                            return commonProjectService.sendResponse(res, 404, null);
                        }
                        var newUsersMessage;
                        var emails = emailList.provisioned.map(function (obj) {
                            return obj.email;
                        });
                        if (emailList.provisioned.length > 0) {
                            // Send the bulk emails invite
                            commonProjectService.sendInviteEmail(req, emailList.inviteeList, req.user, project);

                            if (emailList.provisioned.length === 1) {
                                newUsersMessage = 'A New User ( ' + emails[0] + ' ) has been invited to contribute to the \'' + project.name + '\' Project!';
                            }
                            else {
                                newUsersMessage = 'New User\'s ( ' + emails.join(' , ') + ' ) has all been invited to contribute to the \'' + project.name + '\' Project!';
                            }

                            historyService.logHistory({
                                project_id: project._id,
                                user: userId,
                                description: newUsersMessage,
                                resource_id: 'user_' + userId + new Date(),
                                resource_name: 'User Invite',
                                resource_type: 'people'
                            });
                        }

                        serviceLogger.info('<< createInvite(), return newInvitee list');
                        return commonProjectService.sendResponse(res, 201, {newInvitee: emailList.inviteeList});
                    })
                    .catch(function (err) {
                        serviceLogger.error('<< createInvite(), return error');
                        return commonProjectService.sendError(res, err);
                    });

            }).catch(function (apiErr) {
                serviceLogger.warn('<< createInvite(), error consuming accessService.inviteUsers api,  return err' + apiErr);
                return commonProjectService.sendError(res, apiErr);
            });

    }
    else {
        serviceLogger.warn('<< createInvite(), missing params, return error');
        return commonProjectService.sendResponse(res, 400, {error: commonProjectService.requestErrorMsg});
    }
};

/**
 * Sequence of historyService to register user
 *
 * 1. Find project by id and email
 * 2. Get query object and add user to user_list list, remove them from the invite list
 * 3. If project was updated return JSON otherwise return 404 as project wasn't found
 */
module.exports.acceptInvite = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> acceptInvite()');

    var userId = req.user._id;
    var projectId = req.params.projectId;
    var userEmail = req.user.email;

    projectService.findProject({
        _id: projectId,
        'invite_list.email': userEmail,
        deleted: false
    }, {
        'stats.updated_at': new Date(),
        'stats.updated_by': userId,
        $addToSet: {
            user_list: {
                user_id: userId,
                email: userEmail
            }
        },
        $pull: {
            invite_list: {
                email: userEmail
            }
        }
    })
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< acceptInvite(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }

            var newUsersMessage = 'A New User ( ' + userEmail + ' ) has been added as a contributor to the \'' + project.name + '\' Project!';

            historyService.logHistory({
                project_id: project._id,
                user: req.userId,
                resource_id: 'user_' + userId + new Date(),
                description: newUsersMessage,
                resource_name: 'User Invite',
                resource_type: 'people'
            });
            // Dev-note: user has accepted their invite so add them to the ACL role for the project
            aclService.getAcl().addUserRoles(req.user._id.toString(), 'collaborator-' + project._id, null, req.context);
            serviceLogger.info('<< acceptInvite(), return project');
            return commonProjectService.sendResponse(res, 200, project);
        })
        .catch(function (err) {
            serviceLogger.warn('<< acceptInvite(), return error');
            return commonProjectService.sendError(res, err);
        });
};

/**
 * User is denying the request to register themselves with a project
 * 1. Find project by id and email
 * 2. Get query object and remove user from invite list, add them to the rejected list
 * 3. If project was updated return JSON otherwise return 404 as project wasnt found
 */
module.exports.rejectInvite = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> rejectInvite()');

    projectService.findProject({
        _id: req.params.projectId,
        'invite_list.email': req.user.email,
        deleted: false
    }, {
        'stats.updated_at': new Date(),
        'stats.updated_by': req.user._id,
        $addToSet: {
            reject_list: {
                user_id: req.user._id,
                email: req.user.email
            }
        },
        $pull: {
            invite_list: {
                email: req.user.email
            }
        }
    })
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< rejectInvite(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }
            serviceLogger.info('<< rejectInvite(), return status 204');
            return commonProjectService.sendResponse(res, 204, null);
        })
        .catch(function (err) {
            serviceLogger.warn('<< rejectInvite(), return error ' + err);
            return commonProjectService.sendError(res, err);
        });
};

/**
 * Return team members associated with a project, user making the request needs to be either an owner or a member of
 * the project.
 *
 * @param req
 * @param res
 * @returns {*}
 */
module.exports.getTeam = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> getTeam()');

    var userId = req.user._id;
    var projectId = req.params.projectId;

    // Apply restricted fields as we only care about the team members lists
    projectService.getProject(projectId, userId, {}, 'invite_list user_list reject_list', true)
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< getTeam(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }

            var tmpList = project.user_list.map(function (entry) {
                return entry.user_id;
            });
            return userService.showAvatarList(tmpList)
                .then(function (avatars) {
                    addAvatar(project, avatars);
                    serviceLogger.info('<< getTeam(), returning project');
                    return commonProjectService.sendResponse(res, 200, project);
                });
        })
        .catch(function (err) {
            serviceLogger.warn('<< getTeam(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

module.exports.changeOwner = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> changeOwner()');

    if (!req || !req.body || !req.body.userId) {
        return commonProjectService.sendResponse(res, 400, {error: commonProjectService.requestErrorMsg});
    }

    var projectId = req.params.projectId;
    var ownerId = req.body.userId;

    projectService.changeOwner(projectId, ownerId, req.context)
        .then(function () {
            serviceLogger.info('<< changeOwner()');
            return commonProjectService.sendResponse(res, 204);
        })
        .catch(function (err) {
            serviceLogger.warn('<< changeOwner(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

