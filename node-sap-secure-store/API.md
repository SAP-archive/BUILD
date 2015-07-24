## Modules
<dl>
<dt><a href="#module_node-sap-secure-store">node-sap-secure-store</a></dt>
<dd></dd>
</dl>
## Functions
<dl>
<dt><a href="#readSecureData">readSecureData(filename, [password])</a> ⇒ <code>Promise</code></dt>
<dd><p>Read encrypted, password protected configuration data</p>
</dd>
<dt><a href="#writeSecureData">writeSecureData(filename, data, [password], [customOptions])</a> ⇒ <code>Promise</code></dt>
<dd><p>Write encrypted, password protected configuration data</p>
</dd>
<dt><a href="#cryptJSON">cryptJSON(filename, [password])</a> ⇒ <code>Promise</code></dt>
<dd><p>Encrypt a JSON configuration file</p>
</dd>
<dt><a href="#decryptJSON">decryptJSON(filename, [password])</a> ⇒ <code>Promise</code></dt>
<dd><p>Decrypt a JSON configuration file</p>
</dd>
</dl>
<a name="module_node-sap-secure-store"></a>
## node-sap-secure-store
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Default encryption options |
| options.algorithm | <code>string</code> | Encryption algorithm (default "aes-256-cbc") |
| options.keyLength | <code>number</code> | Key length in bytes (default 32) |
| options.ivLength | <code>number</code> | Initialization Vector length in bytes (default 16) |
| options.digest | <code>string</code> | Hash algorithm for PBKDF2 derivation of key and IV from password (on node 0.10.x only sha1 is supported) |
| options.iterationCount | <code>number</code> | PBKDF2 iteration count for key and IV derivation (default 10000) |
| options.fileMode | <code>number</code> | Configuration file mode if created (default 420, i.e. octal 644) |

<a name="readSecureData"></a>
## readSecureData(filename, [password]) ⇒ <code>Promise</code>
Read encrypted, password protected configuration data

**Kind**: global function  
**Returns**: <code>Promise</code> - Promise eventually fulfilled with the configuration data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | Encrypted configuration file |
| [password] | <code>string</code> | Password |

<a name="writeSecureData"></a>
## writeSecureData(filename, data, [password], [customOptions]) ⇒ <code>Promise</code>
Write encrypted, password protected configuration data

**Kind**: global function  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | Encrypted configuration file |
| data | <code>object</code> &#124; <code>string</code> &#124; <code>buffer</code> | Configuration data |
| [password] | <code>string</code> | Password |
| [customOptions] | <code>object</code> | Custom options |

<a name="cryptJSON"></a>
## cryptJSON(filename, [password]) ⇒ <code>Promise</code>
Encrypt a JSON configuration file

**Kind**: global function  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | JSON configuration file to encrypt |
| [password] | <code>string</code> | Password |

<a name="decryptJSON"></a>
## decryptJSON(filename, [password]) ⇒ <code>Promise</code>
Decrypt a JSON configuration file

**Kind**: global function  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | JSON configuration file to decrypt |
| [password] | <code>string</code> | Password |

