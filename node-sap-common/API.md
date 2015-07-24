## Classes
<dl>
<dt><a href="#CommonError">CommonError</a></dt>
<dd></dd>
</dl>
## Members
<dl>
<dt><a href="#cipher">cipher</a></dt>
<dd></dd>
</dl>
## Functions
<dl>
<dt><a href="#clone">clone(data)</a> ⇒ <code>*</code></dt>
<dd><p>Deep copy</p>
</dd>
<dt><a href="#copy">copy(data)</a> ⇒ <code>*</code></dt>
<dd><p>Shallow copy</p>
</dd>
<dt><a href="#merge">merge(target, add)</a> ⇒ <code>*</code></dt>
<dd><p>Enhance target with the properties of add. For object properties, it performs a deep merging</p>
</dd>
<dt><a href="#extend">extend(target)</a> ⇒ <code>*</code> | <code>Object</code></dt>
<dd></dd>
</dl>
<a name="CommonError"></a>
## CommonError
**Kind**: global class  
<a name="new_CommonError_new"></a>
### new CommonError([message], [code], [target], [inner])

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | error message, if not provided will default to http.STATUS_CODES[code] |
| [code] | <code>number</code> &#124; <code>string</code> | optional error code, default to 500 |
| [target] | <code>string</code> | optional error target |
| [inner] | <code>Error</code> | optional inner exceptions |

<a name="cipher"></a>
## cipher
**Kind**: global variable  

* [cipher](#cipher)
  * [.createCipherInit(password, [salt], [options])](#cipher.createCipherInit) ⇒ <code>Promise</code>
  * [.createCipher(algorithm, password, salt, [options])](#cipher.createCipher) ⇒ <code>Promise</code>
  * [.createDecipher(algorithm, password, salt, [options])](#cipher.createDecipher) ⇒ <code>Promise</code>

<a name="cipher.createCipherInit"></a>
### cipher.createCipherInit(password, [salt], [options]) ⇒ <code>Promise</code>
Derive cipher initialization parameters (key and IV) from password and optional salt

**Kind**: static method of <code>[cipher](#cipher)</code>  
**Returns**: <code>Promise</code> - Returned promise will eventually be resolved to an object with properties key, iv and salt  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | Password from which cipher initialization parameters should be derived. |
| [salt] | <code>string</code> &#124; <code>Buffer</code> | Explicit salt passed as base64 string or Buffer. If no salt is passed, a random one whose length match options.keyLength will be generated. |
| [options] | <code>object</code> | Custom derivation options. |
| [options.keyLength] | <code>number</code> | Key length in bytes (default 32 bytes = 256 bits). |
| [options.ivLength] | <code>number</code> | Initialization vector length in bytes (default 16 bytes = 128 bits) |
| [options.digest] | <code>string</code> | Digest algorithm for PBKDF2 key derivation (default SHA256 on node 0.12+, SHA1 on node 0.10) |
| [options.iterationCount] | <code>number</code> | Iteration count for for PBKDF2 key derivation (default 10000) |

<a name="cipher.createCipher"></a>
### cipher.createCipher(algorithm, password, salt, [options]) ⇒ <code>Promise</code>
Initializes a given Cipher object from password and salt

**Kind**: static method of <code>[cipher](#cipher)</code>  
**Returns**: <code>Promise</code> - Returned promise will eventually be resolved to the Cipher object  

| Param | Type | Description |
| --- | --- | --- |
| algorithm | <code>string</code> | Algorithm (e.g. 'aes-256-cbc') |
| password | <code>string</code> | Password from which cipher initialization parameters should be derived. |
| salt | <code>string</code> &#124; <code>Buffer</code> | Explicit salt passed as base64 string or Buffer. |
| [options] | <code>object</code> | Custom derivation options. |
| [options.keyLength] | <code>number</code> | Key length in bytes (default 32 bytes = 256 bits). |
| [options.ivLength] | <code>number</code> | Initialization vector length in bytes (default 16 bytes = 128 bits) |
| [options.digest] | <code>string</code> | Digest algorithm for PBKDF2 key derivation (default SHA256 on node 0.12+, SHA1 on node 0.10) |
| [options.iterationCount] | <code>number</code> | Iteration count for for PBKDF2 key derivation (default 10000) |

<a name="cipher.createDecipher"></a>
### cipher.createDecipher(algorithm, password, salt, [options]) ⇒ <code>Promise</code>
Initializes a given Decipher object from password and salt

**Kind**: static method of <code>[cipher](#cipher)</code>  
**Returns**: <code>Promise</code> - Returned promise will eventually be resolved to the Decipher object  

| Param | Type | Description |
| --- | --- | --- |
| algorithm | <code>string</code> | Algorithm (e.g. 'aes-256-cbc') |
| password | <code>string</code> | Password from which cipher initialization parameters should be derived. |
| salt | <code>string</code> &#124; <code>Buffer</code> | Explicit salt passed as base64 string or Buffer. |
| [options] | <code>object</code> | Custom derivation options. |
| [options.keyLength] | <code>number</code> | Key length in bytes (default 32 bytes = 256 bits). |
| [options.ivLength] | <code>number</code> | Initialization vector length in bytes (default 16 bytes = 128 bits) |
| [options.digest] | <code>string</code> | Digest algorithm for PBKDF2 key derivation (default SHA256 on node 0.12+, SHA1 on node 0.10) |
| [options.iterationCount] | <code>number</code> | Iteration count for for PBKDF2 key derivation (default 10000) |

<a name="clone"></a>
## clone(data) ⇒ <code>\*</code>
Deep copy

**Kind**: global function  

| Param |
| --- |
| data | 

<a name="copy"></a>
## copy(data) ⇒ <code>\*</code>
Shallow copy

**Kind**: global function  

| Param |
| --- |
| data | 

<a name="merge"></a>
## merge(target, add) ⇒ <code>\*</code>
Enhance target with the properties of add. For object properties, it performs a deep merging

**Kind**: global function  

| Param |
| --- |
| target | 
| add | 

<a name="extend"></a>
## extend(target) ⇒ <code>\*</code> &#124; <code>Object</code>
**Kind**: global function  

| Param |
| --- |
| target | 

