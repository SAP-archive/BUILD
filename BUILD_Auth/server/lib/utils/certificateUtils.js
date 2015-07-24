'use strict';

exports.getPrincipalName = function (certificate) {
    if (!certificate || !certificate.subject || !certificate.issuer) {
        return '';
    }
    var subjectCommonName = exports.getCommonName(certificate);
    var issuerCommonName = exports.getIssuerCommonName(certificate);
    var principal = (subjectCommonName + '|' + issuerCommonName);
    return principal.toLowerCase();
};

exports.getIssuerFromPrincipal = function (principal) {
    if (!principal) {
        return '';
    }

    var separator = principal.indexOf('|');
    if (separator <= 0 || separator === (principal.length - 1)) {
        return '';
    }

    return principal.substr(separator + 1);
};

exports.getPrincipalFromMailAndIssuer = function (mail, issuer) {
    var principal = (mail + '|' + issuer);
    return principal.toLowerCase();
};

exports.getCommonName = function (certificate) {
    var subject = (certificate && certificate.subject) || {};
    return (subject.CN || subject.cn || subject.commonName);
};

exports.getIssuerCommonName = function (certificate) {
    var issuer = (certificate && certificate.issuer) || {};
    return (issuer.CN || issuer.cn || issuer.commonName);
};

exports.getName = function (certificate) {
    var subject = (certificate && certificate.subject) || {};
    var name = subject.SN || subject.sn || subject.surname;
    if (!name) {
        name = exports.getCommonName(certificate);
    }
    return name;
};

exports.getEmail = function (certificate) {
    var subject = (certificate && certificate.subject) || {};
    var email;
    if (certificate.subjectAlternativeName && (certificate.subjectAlternativeName.indexOf('email:') === 0)) {
        email = certificate.subjectAlternativeName.substr(6);
    }
    else {
        email = subject.E || subject.e || subject.EMAIL || subject.email || subject.emailAddress;
    }
    return email;
};
