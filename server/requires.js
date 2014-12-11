'use strict';
// Insert all the requires for optional modules here:

module.exports = function (app) {
    require('norman-projects-server')(app);
    require('norman-auth-server')(app);
    require('norman-business-catalog-manager-server')(app);
};
