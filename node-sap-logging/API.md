<a name="module_node-sap-logging"></a>
## node-sap-logging

* [node-sap-logging](#module_node-sap-logging)
  * [~Logger](#module_node-sap-logging..Logger)
    * [new Logger(name, [options])](#new_module_node-sap-logging..Logger_new)
    * _instance_
      * [.isTraceEnabled](#module_node-sap-logging..Logger#isTraceEnabled)
      * [.isDebugEnabled](#module_node-sap-logging..Logger#isDebugEnabled)
      * [.isInfoEnabled](#module_node-sap-logging..Logger#isInfoEnabled)
      * [.isWarnEnabled](#module_node-sap-logging..Logger#isWarnEnabled)
      * [.isErrorEnabled](#module_node-sap-logging..Logger#isErrorEnabled)
      * [.isFatalEnabled](#module_node-sap-logging..Logger#isFatalEnabled)
      * [.isEnabledFor(level)](#module_node-sap-logging..Logger#isEnabledFor) ⇒ <code>boolean</code>
      * [.child(name, [options])](#module_node-sap-logging..Logger#child) ⇒ <code>Logger</code>
      * [.log(logLevel, [err], [fields], [message], [...arg])](#module_node-sap-logging..Logger#log) ⇒ <code>boolean</code>
    * _static_
      * [.defaultLogLevel](#module_node-sap-logging..Logger.defaultLogLevel)
      * [.systemFields](#module_node-sap-logging..Logger.systemFields)
      * [.serializers](#module_node-sap-logging..Logger.serializers)

<a name="module_node-sap-logging..Logger"></a>
### node-sap-logging~Logger
**Kind**: inner class of <code>[node-sap-logging](#module_node-sap-logging)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Logger unique identifier |
| level | <code>number</code> &#124; <code>string</code> | Logger log level |
| name | <code>string</code> | Logger name |


* [~Logger](#module_node-sap-logging..Logger)
  * [new Logger(name, [options])](#new_module_node-sap-logging..Logger_new)
  * _instance_
    * [.isTraceEnabled](#module_node-sap-logging..Logger#isTraceEnabled)
    * [.isDebugEnabled](#module_node-sap-logging..Logger#isDebugEnabled)
    * [.isInfoEnabled](#module_node-sap-logging..Logger#isInfoEnabled)
    * [.isWarnEnabled](#module_node-sap-logging..Logger#isWarnEnabled)
    * [.isErrorEnabled](#module_node-sap-logging..Logger#isErrorEnabled)
    * [.isFatalEnabled](#module_node-sap-logging..Logger#isFatalEnabled)
    * [.isEnabledFor(level)](#module_node-sap-logging..Logger#isEnabledFor) ⇒ <code>boolean</code>
    * [.child(name, [options])](#module_node-sap-logging..Logger#child) ⇒ <code>Logger</code>
    * [.log(logLevel, [err], [fields], [message], [...arg])](#module_node-sap-logging..Logger#log) ⇒ <code>boolean</code>
  * _static_
    * [.defaultLogLevel](#module_node-sap-logging..Logger.defaultLogLevel)
    * [.systemFields](#module_node-sap-logging..Logger.systemFields)
    * [.serializers](#module_node-sap-logging..Logger.serializers)

<a name="new_module_node-sap-logging..Logger_new"></a>
#### new Logger(name, [options])
Logger class


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Logger name |
| [options] | <code>object</code> |  |
| options.appenders | <code>object</code> | List of appenders to attach to the logger |
| options.serializers | <code>object</code> | List of serializers for the logger |
| options.field | <code>\*</code> | Field definition for the logger |

<a name="module_node-sap-logging..Logger#isTraceEnabled"></a>
#### logger.isTraceEnabled
Checks is TRACE level is enabled

**Kind**: instance property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger#isDebugEnabled"></a>
#### logger.isDebugEnabled
Checks is DEBUG level is enabled

**Kind**: instance property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger#isInfoEnabled"></a>
#### logger.isInfoEnabled
Checks is INFO level is enabled

**Kind**: instance property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger#isWarnEnabled"></a>
#### logger.isWarnEnabled
Checks is WARN level is enabled

**Kind**: instance property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger#isErrorEnabled"></a>
#### logger.isErrorEnabled
Checks is ERROR level is enabled

**Kind**: instance property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger#isFatalEnabled"></a>
#### logger.isFatalEnabled
Checks is FATAL level is enabled

**Kind**: instance property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger#isEnabledFor"></a>
#### logger.isEnabledFor(level) ⇒ <code>boolean</code>
Checks whether the logger is enabled for a given level

**Kind**: instance method of <code>[Logger](#module_node-sap-logging..Logger)</code>  

| Param | Type |
| --- | --- |
| level | <code>number</code> &#124; <code>string</code> | 

<a name="module_node-sap-logging..Logger#child"></a>
#### logger.child(name, [options]) ⇒ <code>Logger</code>
Creates a new logger inheriting the current logger fields

**Kind**: instance method of <code>[Logger](#module_node-sap-logging..Logger)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Logger name |
| [options] | <code>object</code> | Logger options @see [Logger](Logger) |

<a name="module_node-sap-logging..Logger#log"></a>
#### logger.log(logLevel, [err], [fields], [message], [...arg]) ⇒ <code>boolean</code>
Log an event at the specified level

**Kind**: instance method of <code>[Logger](#module_node-sap-logging..Logger)</code>  
**Returns**: <code>boolean</code> - true if log occurred (level greater than logger threshold)  

| Param | Type | Description |
| --- | --- | --- |
| logLevel | <code>number</code> &#124; <code>string</code> |  |
| [err] | <code>Error</code> | Error object |
| [fields] | <code>object</code> | Log Event additional fields |
| [message] | <code>string</code> | Log message |
| [...arg] | <code>\*</code> | Log message argument |

<a name="module_node-sap-logging..Logger.defaultLogLevel"></a>
#### Logger.defaultLogLevel
Default log level

**Kind**: static property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger.systemFields"></a>
#### Logger.systemFields
System fields to add to all log events

**Kind**: static property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
<a name="module_node-sap-logging..Logger.serializers"></a>
#### Logger.serializers
Global serializers

**Kind**: static property of <code>[Logger](#module_node-sap-logging..Logger)</code>  
