norman-auth-server
==================
###Norman authentication module.

To install run:
```sh
  npm install norman-auth-server
```

To include in your express app:
```js
  var app = express();
  ...
  require('norman-auth-server')(app);
```

To check the authentication in your api use:
```js
  var auth = require('norman-auth-server');
  app.use('/api', auth.isAuthenticated(), ...);
  app.use('/api/admin', auth.hasRole('admin'), ...);
```
