'use strict';

var ServerStatus = {
    STOPPED: 'stopped',
    STARTING: 'starting',
    STARTED: 'started',
    STOPPING: 'stopping'
};

var Timeout = {
    SERVICE_STARTUP: 10,
    STARTUP: 60,
    ABORT_STARTUP: 10,
    HTTP_SHUTDOWN: 30,
    SERVICE_SHUTDOWN: 10,
    SHUTDOWN: 60
};

var Respawn = {
    INTERVAL: 10, // minimal time interval between 2 respawns in seconds
    LIMIT: 100 // how many worker respawn do we allow before suicide
};

var MESSAGE_TYPE = {
    start: 'WORKER_START',
    started: 'WORKER_STARTED',
    startFailed: 'WORKER_START_FAILED',
    stop: 'WORKER_STOP'
};

module.exports = {
    Respawn: Respawn,
    ServerStatus: ServerStatus,
    MESSAGE_TYPE: MESSAGE_TYPE,
    Timeout: Timeout
};
