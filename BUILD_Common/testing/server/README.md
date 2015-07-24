Norman Testing Server
=============

## Norman Testing Server - Server

```javascript
var NormanTestServer = require('norman-test-server').server;
NormanTestServer.initialize(normanAppServer, myServices)
```

normanAppServer => require('norman-app-server')
```javascript
 var server = new Server(configFile);
 normanAppServer.AppServer= new AppServer(server.config);
```
myServices => norman-custom-service



## Norman Testing Server - Requester

var requester = require('norman-test-requester');
var requester = new requester(app, user, password fnCallback, forceCreateUser);

* app is mandatory
* if user and password are set try connect to connect
    - connect ok: set token and cookie
    - connect ko:
        - forceCreateUser (default value is true) create user
        - forceCreateUser==false


```javascript
normanTestRequester.reqGet(url, statusCode, fnCallBack)
normanTestRequester.reqPost(url, statusCode, fnCallBack, sendValue)
normanTestRequester.reqPostAttach(url, statusCode, fnCallBack, sendValue, attachValue)
normanTestRequester.reqPut(url, statusCode, fnCallBack, sendValue)
normanTestRequester.reqPutAttach = function (url, statusCode, fnCallBack, sendValue, attachValue)
normanTestRequester.reqDelete(url, statusCode, fnCallBack)
normanTestRequester.token => get
normanTestRequester.cookie => get
normanTestRequester.contentType => get
normanTestRequester.contentType => set(value)
normanTestRequester.contentType => reset = set()
```