'use strict';

// @ngInject
module.exports = function ($resource) {

    return $resource('/api/projects/:id/:action/:assetId/:assetAction', {
        id: '@_id'
    }, {
        createInvite: {
            method: 'POST',
            params: {
                id: '@_id'
            },
            url: '/api/projects/:id/invite/'
        },
        acceptInvite: {
            method: 'PUT',
            params: {
                id: '@_id',
                action: 'invite'
            }
        },
        rejectInvite: {
            method: 'DELETE',
            params: {
                id: '@_id',
                action: 'invite'
            }
        },
        getTeam: {
            method: 'GET',
            params: {
                id: '@_id',
                action: 'team'
            }
        },
        setOwner: {
            method: 'PUT',
            params: {
                id: '@_id',
                action: 'owner'
            }
        },
        getDocument: {
            method: 'GET',
            isArray: true,
            params: {
                id: '@_id',
                action: 'document'
            }
        },
        deleteDocument: {
            method: 'DELETE',
            params: {
                id: '@_id',
                assetId: '@_assetId',
                action: 'document'
            }
        },
        archive: {
            method: 'PUT',
            params: {
                id: '@_id',
                action: 'settings',
                archived: '@archived'
            }
        }
    });
};
