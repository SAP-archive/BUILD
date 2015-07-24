node-sap-mongo
==============

MongoDB connectivity layer

Further Information
======================

*node-sap-mongo* is part of [BUILD](https://github.com/SAP/BUILD).

##Using the Common MongoDB Connection

###Initializing the connection 
This must be done once by the main server process. This is done by the Norman AppServer, you may do this manually in your service tests. 

```javascript
commonServer.db.connection.initialize({ database: "norman-test" }, function (err)  {
  if (err) {
    console.error("Oops, no magic today!");
  }
});
```

Optional second parameter allows configuring the deployment strategy. Default strategy "single" stores all Norman collection into a single database. Production strategy "distribute" spreads the collections over multiple domain databases to reduce write contention. Database distribution may be fine-tuned with the "map" strategy. 

###Getting a mongoose connection
The following code snippet returns a connection to the database configured for the module "my-module" according to the deployment strategy. 

```javascript
var connection = commonserver.db.connection.getMongooseConnection("my-module");
```

###Getting a Mongo database connection
```javascript
var db1 = commonserver.db.connection.getDb("my-module");
var db2 = commonserver.db.connection.getMongooseConnection("my-other-module").db;
```


###Creating mongoose models
We offer a simple way to define mongoose model on a specific connection :

```javascript
var commonServer = require('norman-common-server'),
    mongoose = commonServer.db.mongoose;

var MySchema = mongoose.createSchema('my-module', { ... });


module.exports = mongoose.createModel('MyModel', MySchema);

```

