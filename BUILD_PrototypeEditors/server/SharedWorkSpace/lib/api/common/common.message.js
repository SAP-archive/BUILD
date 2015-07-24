'use strict';

module.exports = {
    success:{
        SWS001:'Snapshot version validated',
        SWS002:'Snapshot version not provided, fetching latest version'

    },
    error:{
        SWE001:'There are no snapshots to retrieve',
        SWE002:'Snapshot version should be a number',
        SWE003:'Error while fetching version for project',
        SWE004:'Prototype does not exist for the projectId',
        SWE005:'Failed to save snapshot url',
        SWE006:'Failed to deploy snapshot',
        SWE007:'Failed to create snapshot',
        SWE008:'Failed to retrieve snapshots',
        SWE009:'Session timed out. There is no object lock',
        SWE010:'Failed to retrieve snapshot content',
        SWE011:'Failed to delete snapshot directory',
        SWE012:'Failed to create snapshot zip',
        SWE013:'ProjectId cannot be empty'

    }
};