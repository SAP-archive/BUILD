node-sap-secure-store
====================

Password protected encrypted configuration

Further Information
======================

*node-sap-secure-store* is part of [BUILD](https://github.com/SAP/BUILD).

# Module use

```
npm install --save node-sap-secure-store
```

## [API documentation](./API.md)

# Command line utilities

Command line utilities cryptjson/decryptjson are available through global installation of this module. 
 
```
npm install -g node-sap-secure-store
```

## cryptjson
Encrypts a JSON configuration file: **cryptjson -h** for command help 

```
cryptjson [-p <password>] [-e <environment-variable>] filename | -h 
```

* **-p \<password\>** specifies that file will be encrypted using password '\<password\>'
* **-e \<environment-variable\>** specifies that file will be encrypted using the password stored in the environment variable '\<environment-variable\>'
* **filename** path of the JSON file to encrypt

If neither -p nor -e options are used, password is read from CRYPT_JSON_PWD environment variable.

## decryptjson
Decrypts a JSON configuration file: **decryptjson -h** for command help 

```
decryptjson [-p <password>] [-e <environment-variable>] filename | -h 
```

* **-p \<password\>** specifies that file will be decrypted using password '\<password\>'
* **-e \<environment-variable\>** specifies that file will be decrypted using the password stored in the environment variable '\<environment-variable\>'
* **filename** path of the JSON file to decrypt

If neither -p nor -e options are used, password is read from CRYPT_JSON_PWD environment variable.
