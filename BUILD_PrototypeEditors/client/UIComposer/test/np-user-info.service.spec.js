'use strict';
(function () {

    // PhantomJS does not implement the includes method yet
    /*eslint-disable no-extend-native */
    if (!String.prototype.includes) {
        String.prototype.includes = function (searchValue, fromIndex) {
            return this.indexOf(searchValue, fromIndex) !== -1;
        };
    }

    var expect = chai.expect;

    describe('Service: np-user-info', function () {
        var npUserInfo, npConstants,
            $windowMock;

        beforeEach(module('uiComposer.services'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            $windowMock = {
                navigator: {
                    appVersion: ''
                }
            };

            module(function ($provide) {
                $provide.value('$window', $windowMock);
            });

            inject(function ($injector) {
                npUserInfo = $injector.get('npUserInfo');
                npConstants = $injector.get('npConstants');
            });
        });

        it('should return the user\'s operating system', function () {
            $windowMock.navigator.appVersion = 'MacOS';

            var userOS = npUserInfo.getUserOS();

            expect(userOS).to.be.equal(npConstants.os.MacOS);
        });

        it('should return \'Unknown OS\' if the user\'s operating system could not be retrieved', function () {
            $windowMock.navigator.appVersion = 'Not a valid OS';

            var userOS = npUserInfo.getUserOS();

            expect(userOS).to.be.equal('Unknown OS');
        });
    });
})();
