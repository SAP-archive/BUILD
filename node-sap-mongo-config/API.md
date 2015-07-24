## Classes
<dl>
<dt><a href="#ConfigService">ConfigService</a></dt>
<dd></dd>
<dt><a href="#SecureConfigService">SecureConfigService</a></dt>
<dd></dd>
</dl>
<a name="ConfigService"></a>
## ConfigService
**Kind**: global class  

* [ConfigService](#ConfigService)
  * _instance_
    * [.getConfig(key, [context])](#ConfigService+getConfig) ⇒ <code>Promise</code>
    * [.get(key, [context])](#ConfigService+get) ⇒ <code>Promise</code>
    * [.set(key, [value], [context])](#ConfigService+set) ⇒ <code>Promise</code>
    * [.delete(key, [context])](#ConfigService+delete) ⇒ <code>Promise</code>
  * _static_
    * [.create(db, [options], [context])](#ConfigService.create) ⇒ <code>[ConfigService](#ConfigService)</code>

<a name="ConfigService+getConfig"></a>
### configService.getConfig(key, [context]) ⇒ <code>Promise</code>
Retrieves a configuration entry

**Kind**: instance method of <code>[ConfigService](#ConfigService)</code>  
**Returns**: <code>Promise</code> - Promise eventually resolved to the configuration entry (an object with _id and value properties) or null if the entry is missing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

<a name="ConfigService+get"></a>
### configService.get(key, [context]) ⇒ <code>Promise</code>
Retrieves a configuration value

**Kind**: instance method of <code>[ConfigService](#ConfigService)</code>  
**Returns**: <code>Promise</code> - Promise eventually resolved to the configuration value or undefined if the entry is missing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

<a name="ConfigService+set"></a>
### configService.set(key, [value], [context]) ⇒ <code>Promise</code>
Sets a configuration value

**Kind**: instance method of <code>[ConfigService](#ConfigService)</code>  
**Returns**: <code>Promise</code> - Promise eventually resolved to the old configuration entry or undefined if the entry was missing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [value] | <code>\*</code> | Configuration entry value |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |
| [context.audit] | <code>function</code> | Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action, key, value and oldValue properties |

<a name="ConfigService+delete"></a>
### configService.delete(key, [context]) ⇒ <code>Promise</code>
Deletes a configuration entry

**Kind**: instance method of <code>[ConfigService](#ConfigService)</code>  
**Returns**: <code>Promise</code> - Promise eventually resolved to the old configuration entry or undefined if the entry was missing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |
| [context.audit] | <code>function</code> | Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action, key and oldValue properties |

<a name="ConfigService.create"></a>
### ConfigService.create(db, [options], [context]) ⇒ <code>[ConfigService](#ConfigService)</code>
Creates and initializes an instance of Configuration service.

**Kind**: static method of <code>[ConfigService](#ConfigService)</code>  
**Returns**: <code>[ConfigService](#ConfigService)</code> - initializing service instance  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>mongodb.Db</code> | Mongo DB connection |
| [options] | <code>object</code> | configuration parameters |
| [options.collection] | <code>string</code> | Config collection name, default to ConfigService.defaultCollection ('config' initially) |
| [options.mongo] | <code>object</code> | Mongo collection options |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

<a name="SecureConfigService"></a>
## SecureConfigService
**Kind**: global class  

* [SecureConfigService](#SecureConfigService)
  * _instance_
    * [.getConfig(key, [context])](#SecureConfigService+getConfig) ⇒ <code>Promise</code>
    * [.get(key, [context])](#SecureConfigService+get) ⇒ <code>Promise</code>
    * [.set(key, [value], [context])](#SecureConfigService+set) ⇒ <code>Promise</code>
    * [.delete(key, [context])](#SecureConfigService+delete) ⇒ <code>Promise</code>
    * [.changePassword(newPassword, [context])](#SecureConfigService+changePassword) ⇒ <code>Promise</code>
    * [.migrateAll([context])](#SecureConfigService+migrateAll) ⇒ <code>Promise</code>
  * _static_
    * [.create(db, options, [context])](#SecureConfigService.create) ⇒ <code>[SecureConfigService](#SecureConfigService)</code>

<a name="SecureConfigService+getConfig"></a>
### secureConfigService.getConfig(key, [context]) ⇒ <code>Promise</code>
Retrieves a configuration value

**Kind**: instance method of <code>[SecureConfigService](#SecureConfigService)</code>  
**Returns**: <code>Promise</code> - Promise eventually resolved to the configuration entry (an object with _id and value properties) or null if the entry is missing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

<a name="SecureConfigService+get"></a>
### secureConfigService.get(key, [context]) ⇒ <code>Promise</code>
Retrieves a configuration value

**Kind**: instance method of <code>[SecureConfigService](#SecureConfigService)</code>  
**Returns**: <code>Promise</code> - Promise eventually resolved to the configuration value or undefined if the entry is missing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

<a name="SecureConfigService+set"></a>
### secureConfigService.set(key, [value], [context]) ⇒ <code>Promise</code>
Sets a configuration value

**Kind**: instance method of <code>[SecureConfigService](#SecureConfigService)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [value] | <code>string</code> &#124; <code>object</code> &#124; <code>Buffer</code> | Configuration entry value |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |
| [context.audit] | <code>function</code> | Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action and key properties |

<a name="SecureConfigService+delete"></a>
### secureConfigService.delete(key, [context]) ⇒ <code>Promise</code>
Deletes a configuration entry

**Kind**: instance method of <code>[SecureConfigService](#SecureConfigService)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Configuration entry _id |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |
| [context.audit] | <code>function</code> | Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action and key properties |

<a name="SecureConfigService+changePassword"></a>
### secureConfigService.changePassword(newPassword, [context]) ⇒ <code>Promise</code>
Changes the secure configuration master password

**Kind**: instance method of <code>[SecureConfigService](#SecureConfigService)</code>  

| Param | Type | Description |
| --- | --- | --- |
| newPassword | <code>string</code> |  |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |
| [context.audit] | <code>function</code> | Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action property |

<a name="SecureConfigService+migrateAll"></a>
### secureConfigService.migrateAll([context]) ⇒ <code>Promise</code>
Migrates all secure configuration entries encrypted with an old password

**Kind**: instance method of <code>[SecureConfigService](#SecureConfigService)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

<a name="SecureConfigService.create"></a>
### SecureConfigService.create(db, options, [context]) ⇒ <code>[SecureConfigService](#SecureConfigService)</code>
Creates and initializes an instance of Secure Configuration service.

**Kind**: static method of <code>[SecureConfigService](#SecureConfigService)</code>  
**Returns**: <code>[SecureConfigService](#SecureConfigService)</code> - initializing service instance  
**Parem**: <code>string</code> options.password Password from which to derive the key and iv  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>mongodb.Db</code> | Mongo DB connection |
| options | <code>object</code> | configuration parameters |
| [options.algorithm] | <code>string</code> | Encryption algorithm default to SecureConfigService.defaultCipherOptions.algorithm (initially 'aes-256-cbc') |
| [options.keyLength] | <code>string</code> | Encryption key length default to SecureConfigService.defaultCipherOptions.keyLength (initially 32) |
| [options.keyLength] | <code>string</code> | Encryption initialization vector length default to SecureConfigService.defaultCipherOptions.ivLength (initially 16) |
| [options.digest] | <code>string</code> | Digest algorithm to derive encryption key from password default default to SecureConfigService.defaultCipherOptions.digest (initially 'sha1' on node 0.10, 'sha256' on node 0.12+) |
| [options.iterationCount] | <code>string</code> | Number of PBKDF2 iterations algorithm to derive encryption key from password default default to SecureConfigService.defaultCipherOptions.digest (initially 'sha1' on node 0.10, 'sha256' on node 0.12+) |
| [options.collection] | <code>string</code> | Config collection name, default to SecureConfigService.defaultCollection ('secure-config' initially) |
| [options.mongo] | <code>object</code> | Mongo collection options |
| [context] | <code>object</code> | Context information |
| [context.logger] | <code>Logger</code> | Context logger to use. Logger must be compatible with node-sap-logging API. |

