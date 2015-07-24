var util = require('util');

var authService = {};
module.exports = authService;

authService.users = {};

authService.authenticate = function (username, password) {
    var user = this.users[username];
    if (!user) {
        return false;
    }
    return (user.password === password);
};

authService.createUser = function (user) {
    var createdUser, username = user.email;
    if (this.users[username]) {
        throw new Error("User already exists");
    }
    this.users[username] = util._extend({}, user);
};

authService.getUser = function (username) {
    return this.users[username];
};