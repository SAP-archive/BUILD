/*eslint no-process-exit: 0*/
'use strict';
 
var path = require('path');
var AppServer = require('norman-app-server');
var configFile = path.join(__dirname, 'dbinitconfig.json');
 
var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}
console.log('server started') 
var server = new AppServer.Server(configFile);
server.start().then(function() {
  //create initial data for UI Catalog manager
    var uicatalogMangerServer = require('norman-ui-catalog-manager-server');
    uicatalogMangerServer.initializeDb(function (statuscode) {
      server.appServer.shutdown(false);
      console.log(statuscode+'**************');  
    });
});
