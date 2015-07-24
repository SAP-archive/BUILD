'use strict';

var Promise = require('norman-promise');
var tp = require('norman-server-tp');
var _ = tp.lodash;
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var NormanError = commonServer.NormanError;
var userService;

var serviceLogger = commonServer.logging.createLogger('anonymous-service');

/**
 * Update the study participants list with respective avatar details from the Auth Service - there are four scenarios managed here;
 *
 * 1. User has been deleted - nothing is returned from the Auth Service thus the avatar details are updated to 'Participant N'
 * 2. User isDeleted is set to true - nothing is returned from the Auth Service thus the avatar details are updated to 'Participant N'
 * 3. User has requested to be anonymous in the study i.e. isAnonymous === true, avatar details are updated with 'Participant N'
 * 4. Active User, existing participant details are merged with the avatar details returned from Auth service
 *
 * Ex: Active User
 * [{name: 'John Doe', _id: 12345ABC, email: 'john@doe.com'}]
 *
 * Ex: Deleted/isAnonymous User
 * [{name: 'Participant x', _id: 12345ABC, email: ''}]
 *
 * @param   {object}  study
 * @return [{object}] List
 */
exports.anonymousUsers = function (study) {

    serviceLogger.info({
        participants: study.participants
    }, '>> anonymousUsers');

    var deferred = Promise.defer();

    if (!userService) {
        userService = registry.getModule('UserService');
    }

    // Pull out all the user ID's, apply isAnonymous filter
    // Dev-note: no point making call to showAvatarList if user has specified they want to be anonymous
    var filteredIdList = [];
    _.each(study.participants, function (participant) {
        if (!participant.isAnonymous) {
            filteredIdList.push(participant._id.toString());
        }
    });

    userService.showAvatarList(filteredIdList)
        .then(function (avatars) {
            // Step 1. Both list sizes should match, otherwise a user is either anonymous or removed from the system
            if (study.participants.length !== avatars.length) {
                serviceLogger.info('anonymousUsers(), lists dont match');

                // Step 2. Find missing participants
                var missingList = _(study.participants)
                    .reject(function (x) {
                        return _.where(avatars, {
                            _id: x._id
                        }).length;
                    })
                    .value();
                // Step 3. Sort by created time to ensure user ID's are consistent across calls
                var sortedMissingList = _.sortBy(missingList, 'created_by');
                // Step 4. Update users that are no longer in the system or have specified to be anonymous
                _.each(sortedMissingList, function (user, index) {
                    avatars.push({
                        _id: user._id,
                        email: '',
                        name: 'Participant ' + (index + 1)
                    });
                });
            }
            serviceLogger.info('<< anonymousUsers, returning avatar list');
            deferred.resolve(avatars);
        }).catch(function (err) {
            var normanError = new NormanError('Error handling avatar list', err);
            serviceLogger.error(normanError);
            deferred.reject(normanError);
        });

    return deferred.promise;
};
