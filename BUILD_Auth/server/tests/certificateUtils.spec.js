'use strict';

var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var certificateUtils = require('../lib/utils/certificateUtils');

var cert1 = {
    subject: {
        CN: 'I123456',
        SN: 'Alice',
        E: 'Alice@norman.com'
    },
    issuer: { CN: 'SAPNetCA' }
};
var cert2 = {
    subject: {
        cn: 'I123456',
        sn: 'Alice',
        e: 'Alice@norman.com'
    },
    issuer: { cn: 'SAPNetCA' }
};
var cert3 = {
    subject: {
        commonName: 'I123456',
        surname: 'Alice',
        emailAddress: 'Alice@norman.com'
    },
    issuer: { CN: 'SAPNetCA' }
};
var cert4 = {
    subject: {
        cn: 'I123456',
        sn: 'Alice',
        EMAIL: 'Alice@norman.com'
    },
    issuer: { cn: 'SAPNetCA' }
};
var cert5 = {
    subject: {
        cn: 'I123456',
        sn: 'Alice',
        email: 'Alice@norman.com'
    },
    issuer: { cn: 'SAPNetCA' }
};

describe('Certificate utils', function () {
    describe('getPrincipalName', function () {
        it('should return an empty string in case of bad input', function () {
            expect(certificateUtils.getPrincipalName()).to.equal('');
            expect(certificateUtils.getPrincipalName({})).to.equal('');
            expect(certificateUtils.getPrincipalName({subject: { CN: 'Alice' } })).to.equal('');
        });
        it('should derives the principal from the subject and issuer common names', function () {
            expect(certificateUtils.getPrincipalName(cert1)).to.equal('i123456|sapnetca');
        });

    });
    describe('getName', function () {
        it('should get the name from the subject surname', function () {
            expect(certificateUtils.getName(cert1)).to.equal('Alice');
            expect(certificateUtils.getName(cert2)).to.equal('Alice');
            expect(certificateUtils.getName(cert3)).to.equal('Alice');
        });
        it('should fallback to the common name', function () {
            expect(certificateUtils.getName({subject: { CN: 'Alice' } })).to.equal('Alice');
            expect(certificateUtils.getName(cert2)).to.equal('Alice');
            expect(certificateUtils.getName(cert3)).to.equal('Alice');
        });
    });
    describe('getEmail', function () {
        it('should retrieve the subject email attribute', function () {
            expect(certificateUtils.getEmail(cert1)).to.equal('Alice@norman.com');
            expect(certificateUtils.getEmail(cert2)).to.equal('Alice@norman.com');
            expect(certificateUtils.getEmail(cert3)).to.equal('Alice@norman.com');
            expect(certificateUtils.getEmail(cert4)).to.equal('Alice@norman.com');
            expect(certificateUtils.getEmail(cert5)).to.equal('Alice@norman.com');
        });
    });
    describe('getIssuerFromPrincipal', function () {
        it('should retrieve the issuer of a principal attribute', function () {
            expect(certificateUtils.getIssuerFromPrincipal('i123456|sapnetca')).to.equal('sapnetca');
        });
    });
    describe('getPrincipalFromMailAndIssuer', function () {
        it('should build a principal attribute from a mail and an issuer', function () {
            expect(certificateUtils.getPrincipalFromMailAndIssuer('Alice@norman.com', 'sapnetca')).to.equal('alice@norman.com|sapnetca');
        });
    });
});
