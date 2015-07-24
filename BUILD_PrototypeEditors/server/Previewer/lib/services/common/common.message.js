'use strict';

module.exports = {
    success: {
        SWS001: 'Snapshot deployed successfully',
        SWS002: 'Creation of artifacts successful for project',
        SWS003: 'Folder structure created for project',
        SWS004: 'File created for deployment',
        SWS005: 'Snapshot created in zip format',
        SWS006: 'File is added to archieve',
        SWS007: 'Folder of latest snapshot deleted'
    },
    error: {
        SWE001: 'Snapshot deployment failed',
        SWE002: 'File creation failed for deployment',
        SWE003: 'Folder structure creation failed for project',
        SWE004: 'Creation of artifacts failed for project',
        SWE005: 'Error while creating archive from snapshot content: snapshot path does not exist',
        SWE006: 'Snapshot zip file creation failed',
        SWE007: 'Adding file to the archive failed',
        SWE008: 'Generating archive as a buffer failed'
    }
};
