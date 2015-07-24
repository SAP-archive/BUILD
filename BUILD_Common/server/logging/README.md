BUILD Logging component
=============

#http logging configuration

It is possible to customize http logging through the "http" section of the logging configuration. This sections contains the following properties, sub-sections

##logMode
Property wich may take the following values 

* **"response"** mode creates a single log entry per request (at the end of the request processing)
* **"both"** mode creates an additional log entry at the beginnning of the request processing 

##logLevel
Sub-section to control the log level for the request and the response (based on its status).

* **request** log level of request log entry in both mode, debug by default
* **info** log level for all 1xx responses, debug by default
* **success** log level for all 2xx responses, info by default
* **redirect** log level for all 3xx responses, info by default
* **clientError** log level for all 4xx responses, warn by default
* **error** log level for all 5xx responses, error by default
* **\<status code\>** log level for a particular status code. Default configuration contains a "404": "info" 

##request 
Sub-section to select request properties to log. A given property will be logged if the corresponding property in the sub-section exists with a truthy value (e.g. true or 1). Supported properties are 

* **host** returns the request.host property. In BUILD, express has been enhanced in order to leverage X-Forwarded-Host or X-ProxyBaseURL request headers if "trust proxy" settings is on. 
* **httpVersion**
* **ip** returns the request.ip property. Express sets this property leveraging the X-Forwarded-For header if "trust proxy" settings is on. (not yet available)
* **method** 
* **protocol** returns the request.protocol property. In BUILD, express has been enhanced in order to leverage X-Forwarded-Proto or X-ProxyBaseURL request headers if "trust proxy" settings is on. 
* **remoteAddress** 
* **url**

##response 
Sub-section to select response properties to log. A given property will be logged if the corresponding property in the sub-section exists with a truthy value (e.g. true or 1). Supported properties are 

* **responseTime**
* **status**

##requestHeaders
Sub-section to select request headers to log. A given header will be logged if the corresponding property in the sub-section exists with a truthy value (e.g. true or 1). 

If a truthy "*" property is defined, all headers will be logged except those which are explicitly defined with a falsy value. 

_Authorization_ and _Cookie_ headers will never be logged.  

##responseHeaders
Sub-section to select response headers to log. A given header will be logged if the corresponding property in the sub-section exists with a truthy value (e.g. true or 1). 

If a truthy "*" property is defined, all headers will be logged except those which are explicitly defined with a falsy value. 

_Set-Cookie_ header will never be logged.  


