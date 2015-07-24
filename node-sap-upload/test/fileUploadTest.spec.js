'use strict';

var path = require('path');
var expect = require('chai').expect;
var upload = require('../index.js');

var DEFAULT_MIMETYPE = require('../lib/white-list.js');
var DEFAULT_OPTIONS = {
    limits: {
        fields: 50,
        fileSize: 2.5e7, // 25Mo
        files: 10,
        parts: 10
    },
    mimetype: DEFAULT_MIMETYPE
};


describe('FileUpload: basic test', function () {
    it('run', function () {
        expect(upload).to.be.a('function');
    });

    it('middleware without global option', function () {
        expect(upload).to.be.a('function');

        try {
            upload(undefined);
        }
        catch (error) {
            expect(error.toString()).to.equal('Error: File upload configuration not initialized');
        }
    });

    it('setOptions', function () {
        expect(upload.setOptions).to.be.a('function');
        upload.setOptions(undefined);

        expect(upload.getOptions()).to.deep.equal(DEFAULT_OPTIONS);

        upload.setOptions({});

        expect(upload.getOptions()).to.deep.equal(DEFAULT_OPTIONS);

        var op = {
            limits: {
                fields: 150
            },
            dest: 'test',
            cwd: process.cwd()
        };

        upload.setOptions(op);
        DEFAULT_OPTIONS.limits.fields = 150;
        DEFAULT_OPTIONS.cwd = op.cwd;
        DEFAULT_OPTIONS.dest = path.resolve(op.cwd, op.dest);
        expect(upload.getOptions()).to.deep.equal(DEFAULT_OPTIONS);

        try {
            op.scan = {};
            upload.setOptions(op);
        }
        catch (error) {
            expect(error.toLocaleString()).to.equal('Error: The action, baseSourceDir and baseTargetDir are mandatory to scan.');
        }

        try {
            op.scan.action = {};
            upload.setOptions(op);
        }
        catch (error) {
            expect(error.toLocaleString()).to.equal('Error: The action, baseSourceDir and baseTargetDir are mandatory to scan.');
        }

        try {
            op.scan.baseSourceDir = {};
            upload.setOptions(op);
        }
        catch (error) {
            expect(error.toLocaleString()).to.equal('Error: The action, baseSourceDir and baseTargetDir are mandatory to scan.');
        }

        delete op.scan;
        upload.setOptions(op);
    });

    it('setLogger', function () {
        expect(upload.setLogger).to.be.a('function');
        upload.setLogger(undefined);

        expect(upload.getLogger()).to.deep.equal(undefined);


        var op = {
            limits: {
                fields: 150
            }
        };

        upload.setLogger(op);
        expect(upload.getLogger()).to.deep.equal(op);
    });

    it('middleware', function () {
        expect(upload).to.be.a('function');
        var middleWare = upload(undefined);

        expect(middleWare).to.be.a('function');
    });

    it('middleware - instance options', function (done) {
        expect(upload).to.be.a('function');
        var middleWare = upload({
            inMemory: false,
            mimetype: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        });

        expect(middleWare).to.be.a('function');

        middleWare({headers: {}}, {}, function () {
            done();
        });
    });
});
