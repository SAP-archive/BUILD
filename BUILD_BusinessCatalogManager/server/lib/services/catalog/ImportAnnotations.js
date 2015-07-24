'use strict';

require('norman-promise');
var commonServer = require('norman-common-server');
var Url = require('url');
var _ = require('norman-server-tp').lodash;
var Request = require('request');

var Converter = require('../metadataConverter');
var ConverterExt = require('../annotationConverter');
var ImportMetadata = require('./ImportMetadata.js');
var logger = commonServer.logging.createLogger('catalog-service');

var mCurrentImports = {};

function requestData(options) {
    var deferred = Promise.defer();
    var requestOptions = {};
    requestOptions.url = options.protocol + '//' + options.hostname + ':' + options.port + options.path;
    if (options.protocol.toLowerCase().indexOf('https') >= 0) {
        requestOptions.agentOptions = options.agentOptions;
    }
    requestOptions.headers = options.headers;
    requestOptions.auth = options.auth;
    if (options.qs) {
        requestOptions.qs = options.qs;
        requestOptions.useQuerystring = true;
    }

    Request(requestOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            deferred.resolve(body);
        }
        else {
            if (response) {
                deferred.reject('Http status ' + response.statusCode);
            }
            else {
                deferred.reject('Http request failed');
            }
        }
    });
    return deferred.promise;
}

function getSemanticInfosFromCatalogs(data) {
    var linksToResolve = [], configuration;
    var regexIsFactSheet = /\\\"navigation_provider_instance\\\":\\\"FACTSHEETS\\\"/;
    var regexGetSemanticObject = /\\\"semantic_object\\\":\\\"([^"]*)\\\"/;
    var regexGetSemanticAction = /\\\"semantic_action\\\":\\\"([^"]*)\\\"/;
    var regexIsFactSheet2 = /\\\'navigation_provider_instance\\\':\\\'FACTSHEETS\\\'/;
    var regexGetSemanticObject2 = /\\\'semantic_object\\\':\\\'([^']*)\\\'/;
    var regexGetSemanticAction2 = /\\\'semantic_action\\\':\\\'([^']*)\\\'/;
    if (data && data.d && data.d.results) {
        _.forEach(data.d.results, function (catalog) {
            if (catalog.Chips && catalog.Chips.results) {
                _.forEach(catalog.Chips.results, function (chip) {
                    configuration = chip.configuration;
                    if (configuration) {
                        var isFactsheet = regexIsFactSheet.test(configuration);
                        var useDoubleQuote = false;
                        if (!isFactsheet) {
                            isFactsheet = useDoubleQuote = regexIsFactSheet2.test(configuration);
                        }
                        if (isFactsheet) {
                            var semanticObjectRes = useDoubleQuote ? regexGetSemanticObject2.exec(configuration) :
                                regexGetSemanticObject.exec(configuration);
                            if (semanticObjectRes && semanticObjectRes.length > 1) {
                                var semanticObject = semanticObjectRes[1];
                                var semanticActionRes = useDoubleQuote ? regexGetSemanticAction2.exec(configuration) :
                                    regexGetSemanticAction.exec(configuration);
                                if (semanticActionRes && semanticActionRes.length > 1) {
                                    var semanticAction = semanticActionRes[1];
                                    var semanticInfo = semanticObject + '-' + semanticAction;
                                    linksToResolve.push({semanticInfo: semanticInfo, configuration: configuration});
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    return linksToResolve;
}

function getApplicationURLFromApplicationInfo(data) {
    var applicationURL;
    if (data && data.d && data.d.results && data.d.results.length > 0 && data.d.results[0].applicationType === 'URL') {
        applicationURL = data.d.results[0].url;
        if (applicationURL && applicationURL[applicationURL.length - 1] === '/') {
            applicationURL = applicationURL.substring(0, applicationURL.length - 1);
        }
    }
    return applicationURL;
}

function getAnnotationInfoFromApplicationInfo(options, data) {
    var applicationURL = getApplicationURLFromApplicationInfo(data);
    var oAnnotationInfo;
    if (applicationURL) {
        var parseUrl = Url.parse(applicationURL, true);
        var queryParameters = parseUrl.query;
        var sAnnotationURI = queryParameters.annotationURI;
        var sEntityTemplateURI = queryParameters.entityTemplateURI;
        var sDescription;
        if (data && data.d && data.d.results && data.d.results.length > 0) {
            sDescription = data.d.results[0].text;
        }
        var sServiceURI = getServiceFromUri(sEntityTemplateURI);
        oAnnotationInfo = {
            annotationURI: sAnnotationURI,
            entityTemplateURI: sEntityTemplateURI,
            entityURI: getEntityFromUri(sEntityTemplateURI),
            serviceURI: sServiceURI,
            serviceName: getServiceNameFromUri(sServiceURI),
            serviceDescription: sDescription
        };
    }
    return oAnnotationInfo;
}

function getServiceNameFromUri(sUri) {
    var sTempUri = sUri;
    var arrayUri, sServiceName;
    if (sTempUri[sTempUri.length - 1] === '/') {
        sTempUri = sTempUri.substring(0, sTempUri.length - 1);
    }
    if (sTempUri.indexOf('/') >= 0) {
        arrayUri = sTempUri.split('/');
        sServiceName = arrayUri[arrayUri.length - 1];
    }
    return sServiceName;
}

function getServiceFromUri(sUri) {
    var aUriParts, sService, i;
    aUriParts = sUri.slice(1).split('/');
    sService = '/';
    for (i = 0; i < aUriParts.length; i += 1) {
        if (aUriParts[i].indexOf('(') > 0) {
            break;
        }
        sService += aUriParts[i] + '/';
    }
    return sService;
}

function getEntityFromUri(sUri) {
    var aUriParts, sService, i;
    aUriParts = sUri.slice(1).split('/');
    sService = '';
    for (i = 0; i < aUriParts.length; i += 1) {
        if (aUriParts[i].indexOf('(') > 0) {
            sService += '/' + aUriParts[i];
            break;
        }
        if (sService) {
            sService += '/' + aUriParts[i];
        }
    }
    return sService;
}

function loadAnnotationInfoFromSemanticInfo(semanticInfo, options) {
    var deferred = Promise.defer();

    var fnGetAnnotationURL = function (data) {
        data = JSON.parse(data);
        var oAnnotationInfo = getAnnotationInfoFromApplicationInfo(options, data);
        if (oAnnotationInfo) {
            deferred.resolve(oAnnotationInfo);
        }
        else {
            deferred.reject();
        }
    };

    options.path = '/sap/opu/odata/UI2/INTEROP/ResolveLink?linkId=%27' + semanticInfo.semanticInfo + '%27&shellType=%27FLP%27&formFactor=%27desktop%27&$format=json';
    requestData(options).then(fnGetAnnotationURL);
    return deferred.promise;
}

function getCatalogs(options) {
    var deferred = Promise.defer();
    requestData(options).then(function (body) {
        try {
            var data = JSON.parse(body);
        }
        catch (parseException) {
            deferred.reject(parseException);
            return;
        }
        deferred.resolve(data);
    }, function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}

function loadAnnotationsV4(model, importID, data, options) {
    var semanticInfos = getSemanticInfosFromCatalogs(data);
    var currentCallPromise = null;
    mCurrentImports[importID].state = 'running';
    _.forEach(semanticInfos, function (semanticInfo) {
        var fnAnalyze = function () {
            options.path = '/sap/opu/odata/UI2/INTEROP/ResolveLink?linkId=%27' + semanticInfo + '%27&shellType=%27FLP%27&formFactor=%27desktop%27&$format=json';

            var callPromise = loadAnnotationInfoFromSemanticInfo(semanticInfo, options).then(function (oAnnotationInfo) {
                return importServiceAnnotationsV4(model, oAnnotationInfo, options);
            });
            callPromise.then(function (/*createdCatalog*/) {
                mCurrentImports[importID].success++;

            }, function (/*reason*/) {
                mCurrentImports[importID].failed++;
            });
            return callPromise;
        };

        var fnAnalyzeIfError = function () {
            // In case of error, wait before analyzing the next application
            Promise.delay(1500).then(fnAnalyze);
        };

        if (currentCallPromise == null) {
            currentCallPromise = fnAnalyze();
        }
        else {
            currentCallPromise = currentCallPromise.delay(100).then(fnAnalyze).catch(fnAnalyzeIfError);
        }
    });

    var fnFinish = function () {
        mCurrentImports[importID].state = 'finished';
    };
    if (currentCallPromise == null) {
        fnFinish();
    }
    else {
        currentCallPromise = currentCallPromise.then(fnFinish).catch(fnFinish);
    }
}

function getAnnotations(model, options, oAnnotationInfo, catalog) {
    var deferred = Promise.defer();
    logger.debug({annotationURI: oAnnotationInfo.annotationURI}, 'Importing annotations');
    options.path = oAnnotationInfo.annotationURI;
    requestData(options).then(function (annotation) {
        ConverterExt.getCatalogAnnotations(annotation, catalog);
        ImportMetadata.calculateRootEntity(catalog.entities);
        model.create(catalog, function (err, createdCatalog) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(createdCatalog);
            }
        });
    }, function (err) {
        logger.error(err, 'Cannot import annotations');
        deferred.reject(err);
    });
    return deferred.promise;
}

function getServiceMetadata(options, oAnnotationInfo) {
    var deferred = Promise.defer();
    var serviceURL = oAnnotationInfo.serviceURI;
    if (serviceURL) {
        if (serviceURL[serviceURL.length - 1] === '/') {
            serviceURL = serviceURL.substring(0, serviceURL.length - 1);
        }
        serviceURL += '/$metadata';
        logger.debug({serviceURL: serviceURL}, 'Importing metadata');
    }
    options.path = serviceURL;
    requestData(options).then(function (metadata) {
        var catalog = Converter.getCatalog(metadata);
        if (!catalog) {
            deferred.reject(new Error('Cannot parse Metadata'));
        }
        catalog.name = oAnnotationInfo.serviceName;
        catalog.description = oAnnotationInfo.serviceDescription;
        deferred.resolve(catalog);
    }, function (err) {
        logger.error(err, 'Cannot import metadata');
        deferred.reject(err);
    });
    return deferred.promise;
}

function importServiceAnnotationsV4(model, oAnnotationInfo, options) {
    var deferred = Promise.defer();
    if (!oAnnotationInfo || !oAnnotationInfo.annotationURI) {
        deferred.reject('No annotation URL');
    }
    var fnGetAnnotations = function (catalog) {
        return getAnnotations(model, options, oAnnotationInfo, catalog);
    };
    var fnReject = function (err) {
        deferred.reject(err);
    };
    getServiceMetadata(options, oAnnotationInfo).then(fnGetAnnotations, fnReject).then(function () {
        deferred.resolve();
    }, fnReject);
    return deferred.promise;
}


exports.initTracking = function (importID) {
    mCurrentImports[importID] = {
        state: 'starting',
        success: 0,
        failed: 0,
        total: 0,
        services: []
    };
};

exports.getImportStatus = function (importID) {
    return mCurrentImports[importID];
};

exports.import = function (model, importID, context) {
    var deferred = Promise.defer();
    var urlParser = Url.parse(context.url);

    if (context == null && context.login && context.pwd) {
        logger.debug('Missing username or password');
        deferred.reject('Missing username or password');
    }
    else {
        var authorization = {user: context.login, pass: context.pwd};
        var queryParameters = urlParser.query;

        var fnHandleError = function (err) {
            logger.error(err);
        };
        var options = {
            protocol: urlParser.protocol,
            hostname: urlParser.hostname,
            port: urlParser.port,
            path: '/sap/opu/odata/UI2/PAGE_BUILDER_PERS/Pages(\'%2FUI2%2FFiori2LaunchpadHome\')/allCatalogs?$expand=Chips&$orderby=id&$filter=type%20eq%20%27CATALOG_PAGE%27%20or%20type%20eq%20%27H%27%20or%20type%20eq%20%27SM_CATALOG%27%20or%20type%20eq%20%27REMOTE%27&$format=json',
            auth: authorization,
            qs: queryParameters,
            useQuerystring: queryParameters ? true : false,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        };

        getCatalogs(options).then(function (data) {
            loadAnnotationsV4(model, importID, data, options);
            deferred.resolve();
        }).catch(function (err) {
            fnHandleError(err);
            deferred.reject(err);
        });
    }
    return deferred.promise;
};
