'use strict';

module.exports = {
    success: {
        SWS007: 'Snapshot version updated',
        SWS008: 'Snapshot created for the project',
        SWS009: 'Artifact file created',
        SWS010: 'All Artifacts Uploaded',
        SWS011: 'Artifact Fetched by Id',
        SWS012: 'Artifact Fetched by Metadata',
        SWS013: 'Artifact Removed',
        SWS014: 'All Artifact with matching Metadata Removed',
        SWS015: 'All Artifact with matching ProjecTID Removed',
        SWS016: 'Artifact Fetched by ProjectId',
        SWS017: 'Metadata Fetched by ProjectId',
        SWS018: 'Project version tagged as snapshot',
        SWS019: 'Project version is already a snapshot',
        SWS020: 'Latest prototype and snapshot version fetched for project',
        SWS021: 'Snapshot url saved for the project',
        SWS022: 'Snapshots retrieved for the project',
        SWS023: 'Outdated prototype versions removed',
        SWS024: 'Retrieving final snapshot url with deep links',
        SWE025: 'Artifacts ready for deployment'
    },
    error: {
        SWE008: 'Associated Metadata fetch Error',
        SWE009: 'Snapshot version update failed',
        SWE010: 'Snapshot creation failed for the project',
        SWE011: 'Failed to create artifact File',
        SWE012: 'Error while uploading multiple Artifacts',
        SWE013: 'Error Finding Artifact',
        SWE014: 'Error Reading Artifact Content',
        SWE015: 'Error Removing Artifacts',
        SWE016: 'Error During Removal of Artifact with matching metadata',
        SWE017: 'Error During Removal of Artifact with matching ProjectID',
        SWE018: 'Error During Artifact Fetch by ProjectId',
        SWE019: 'Error During Fetching Metadata for project',
        SWE020: 'Error during fetching latest prototype and snapshot version',
        SWE021: 'Saving snapshot url failed for the project',
        SWE022: 'Error during fetching appMetadata',
        SWE023: 'Saving snapshot metadata failed for the project',
        SWE024: 'Old Metadata Id doesnt match for UPDATE or DELETE',
        SWS026: 'Retrieving snapshots failed for the project',
        SWE027: 'Failed to Fetch Asset from Project Module',
        SWE028: 'No Asset Found for the given AssetId from Projects',
        SWE029: 'Unable to update version of Prototype',
        SWE030: 'Unable to fetch version of prototype',
        SWE031: 'Error in creating lock',
        SWE032: 'Error in deleting lock',
        SWE033: 'Error in update lock',
        SWE034: 'Error in getting lock info', // was SWE030
        SWE035: 'Removing outdated prototype versions failed', // SWE029
        SWE036: 'Getting artifacts for deployment failed for project'

    },
    prototype: {
        success: {
            SWPS001: 'Metadata Saved',
            SWPS002: 'Prototype Created for the project',
            SWPS003: 'Prototype found for the project',
            SWPS004: 'Prototype fetch for Specific Version',
            SWPS005: 'Prototype fetch for Latest Version',
            SWPS006: 'Prototype fetch with all versions',
            SWPS007: 'Outdated prototype versions removed'

        },
        error: {
            SWPE001: 'Project not found',
            SWPE002: 'Failed to saved Metadata',
            SWPE003: 'Failed to create a prototype',
            SWPE004: 'Not all Metadata Saved',
            SWPE005: 'Prototype Already Exists',
            SWPE006: 'Error during Prototype find',
            SWPE007: 'Failed to update prototype',
            SWPE008: 'Associated Metadata fetch Error',
            SWPE009: 'Error while Saving Thumbnail',
            SWPE010: 'Removing outdated prototype versions failed',
            SWPE011: 'Requested prototype version is invalid, unable to fetch',
            SWPE012: 'Project found but requested version is invalid for projectId: '

        }
    },
    registry: {
        success: {
            SWRS001: 'Module Name Registed',
            SWRS002: 'Module Name UnRegistered'
        },
        error: {
            SWRE001: 'Missing Module Name',
            SWRE002: 'Module is not Registed'
        }
    },
    swProcessing: {
        success: {},
        error: {
            SWPRE001: 'no data for processing',
            SWPRE002: 'PostProcessing after save encountered an error',
            SWPRE003: 'Invalidation of Prototype Version resulted in exception',
            SWPRE004: 'Session Timeout due to inactivity',
            SWPRE005: 'Error while processing prototype'
        }
    }
};
