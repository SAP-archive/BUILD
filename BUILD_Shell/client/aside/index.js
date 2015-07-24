'use strict';

module.exports = angular.module('shell.aside', ['globals'])
    .service('AsideFactory', require('./aside.service.js'))
    .controller('AsideCtrl', require('./aside.controller.js'));
