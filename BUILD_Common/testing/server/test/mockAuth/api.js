var commonServer = require('norman-common-server');
var authService = require('./service');
var NormanError = commonServer.NormanError;

var express = commonServer.tp.express;

var authRouter = new express.Router();
authRouter.get('/local', function (req, res) {
    res.end();
});
authRouter.post('/local', function (req, res) {
    var user = req.body;
    try {
        authService.createUser(user);
    }
    catch (err) {
        var error = new NormanError(err);
        res.status(404).json(error);
    }
});
authRouter.post('/signup', function (req, res) {
    var username = '';
    var password = '';
    if (authService.authenticate(username, password)) {
        res.json({});
    }
    else {
        res.status(401).end();
    }
});

var userRouter = new express.Router();
userRouter.get('/me', function (req, res) {
    res.end();
});

var api = {
    getHandlers: function () {
        return {
            'auth': 'authRouter',
            'users': userRouter
        };
    }
};
module.exports = api;

