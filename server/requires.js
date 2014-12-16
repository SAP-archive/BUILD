'use strict';
// Insert all the requires for optional modules here:

module.exports = function (app) {
    require('norman-auth-server')(app);
    require('norman-projects-server')(app);
    require('norman-business-catalog-manager-server')(app);
    require('norman-ui-composer-server')(app);
    require('norman-uicanvas-server')(app);
    require('norman-data-modeler-server')(app);
};
