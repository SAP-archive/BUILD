/**
 * Created by I311016 on 13/01/2015.
 */
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var request = require('supertest');
var Chance = require('norman-testing-tp').chance, chance = new Chance();

module.exports = {


    post: function (url, user) {
        var postData = {'name': user.name, 'email': user.email, 'password': user.password};

        var defer = protractor.promise.defer();

        request(url)
            .post('/')
            .send(postData)
            .end(function (error, message) {
                if (error || message.statusCode >= 400) {
                    defer.reject({
                        error: error,
                        message: message
                    });
                } else {
                    defer.fulfill(message);
                }
            });
        return defer.promise;
    }
}
