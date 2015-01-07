var normanServices = {
    'norman-auth-server': {
        'users': '/api/users',
        'auth': '/auth'
    },
    'norman-projects-server': '/api/projects',
    'norman-business-catalog-manager-server': '/api/catalogs',
    'norman-ui-composer-server': '',
    'norman-uicanvas-server': '',
    'norman-data-modeler-server': '/api/models',
    'norman-sample-data-server-server': '',
    'norman-ui-catalog-manager-server':'/api/uicatalogs',
    'norman-user-research-server': {
        'studies': '/api/study',
        'questions': '/api/question'
    }
};

var serviceLoader = {
    services: {}
};

serviceLoader.loadServices = function () {
    Object.keys(normanServices).forEach(function (service) {
        serviceLoader.services[service] = require(service);
    });
};

serviceLoader.initializeServices = function () {
    var services = serviceLoader.services;
    Object.keys(services).forEach(function (name) {
        var service = services[name];
        if (service && typeof service.initialize === "function") {
            service.initialize();
        }
    });
};

serviceLoader.initializeHandlers = function (app) {
    var handlers, services = serviceLoader.services;
    Object.keys(services).forEach(function (serviceName) {
        var service = services[serviceName];
        var handlerConfig = normanServices[serviceName];
        switch (typeof service) {
            case "function":
                // Legacy service API
                service(app);
                break;
            case "object":
                if (typeof service.getHandlers === "function") {
                    handlers = service.getHandlers();
                    Object.keys(handlers).forEach(function (handlerName) {
                        if (typeof handlerConfig === "string") {
                            // simple case, mount all handlers under the same path
                            app.use(handlerConfig, handlers[handlerName]);
                        }
                        else if (handlerConfig[handlerName]) {
                            app.use(handlerConfig[handlerName], handlers[handlerName]);
                        }
                    });
                }
                break;
        }
    });
};

module.exports = serviceLoader;
