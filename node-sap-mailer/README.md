node-sap-mailer
===============

This service gives the ability to easily send emails. This service is based on Nodemailer node package.

Further Information
======================

*node-sap-mailer* is part of [BUILD](https://github.com/SAP/BUILD).


###Nodemailer transport options

```javascript
//./config.js
module.exports = {
     host: "mail.example.com",
      port: 25,
      debug: true,
      tls: {
        rejectUnauthorized: false
    }
};
```



### How to use Mailer service in module 
```javascript
//./config.js
var Mailer = require('norman-common-server').Mailer;
Mailer.sender = 'no-reply@mail.example.com';
mailer.send(mailOptions, function onError(error) {
    console.log('Error', error);
}, function onSuccess(info) {
   console.log('Success', info);
});
```

### mailOptions: 
```javascript
// setup an e-mail
var mailOptions = {
    from: 'foo@mail.example.com', // sender address
    to: 'bar@mail.example.com, baz@mail.example.com', // list of receivers
    subject: 'Hello', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world</b>' // html body
};
```
For more please see the https://github.com/andris9/Nodemailer example for mailOptions.

