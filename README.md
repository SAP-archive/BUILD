<img src = "https://github.com/SAP/BUILD/blob/master/docs/images/BUILD_Logo_Light.png?raw=true" height="128"> 

** Beta - work in Progress **

# Overview 
BUILD  is an open-source, cloud-based and social platform that enables users, even those with no UI development knowledge, to easily create fully interactive prototypes with realistic data, share them with colleagues and consolidate this feedback without writing a line of code. 

For a more detailed description of BUILD, see the [BUILD Overview](https://github.com/SAP/BUILD/wiki/BUILD-Overview).

# Modules in Build
**Foundation Modules**
+ [angular-sap-common-directives](https://github.com/SAP/BUILD/tree/master/angular-sap-common-directives/readme.md)
+ [angular-sap-common-services](https://github.com/SAP/BUILD/tree/master/angular-sap-common-services/readme.md)
+ [angular-sap-ui-elements](https://github.com/SAP/BUILD/tree/master/angular-sap-ui-elements/readme.md)
+ [angular-sap-common-filters](https://github.com/SAP/BUILD/tree/master/angular-sap-common-filters/readme.md)
+ [node-sap-mongo-config](https://github.com/SAP/BUILD/tree/master/node-sap-mongo-config/readme.md)
+ [node-sap-common](https://github.com/SAP/BUILD/tree/master/node-sap-common/readme.md)
+ [node-sap-app-server](https://github.com/SAP/BUILD/tree/master/node-sap-app-server/readme.md)
+ [node-sap-mailer](https://github.com/SAP/BUILD/tree/master/node-sap-mailer/readme.md)
+ [node-sap-secure-store](https://github.com/SAP/BUILD/tree/master/node-sap-secure-store/readme.md)
+ [node-sap-upload](https://github.com/SAP/BUILD/tree/master/node-sap-upload/readme.md)
+ [node-sap-mongo](https://github.com/SAP/BUILD/tree/master/node-sap-mongo/readme.md)
+ [node-sap-promise](https://github.com/SAP/BUILD/tree/master/node-sap-promise/readme.md)
+ [node-sap-logging](https://github.com/SAP/BUILD/tree/master/node-sap-logging/readme.md)
+ [node-sap-mongo-config](https://github.com/SAP/BUILD/tree/master/node-sap-mongo-config/readme.md)
+ [node-sap-build](https://github.com/SAP/BUILD/tree/master/node-sap-build/readme.md)
+ [angular-sap-html2canvas](https://github.com/SAP/BUILD/tree/master/angular-sap-html2canvas/readme.md)
+ [angular-sap-d3-plugins](https://github.com/SAP/BUILD/tree/master/angular-sap-d3-plugins/readme.md)

**Build Modules**
+ [BUILD_PrototypeEditors](https://github.com/SAP/BUILD/tree/master/BUILD_PrototypeEditors/readme.md)
+ [BUILD_Projects](https://github.com/SAP/BUILD/tree/master/BUILD_Projects/readme.md)
+ [BUILD_UICatalogManager](https://github.com/SAP/BUILD/tree/master/BUILD_UICatalogManager/readme.md)
+ [BUILD_UserResearch](https://github.com/SAP/BUILD/tree/master/BUILD_UserResearch/readme.md)
+ [BUILD_BusinessCatalogManager](https://github.com/SAP/BUILD/tree/master/BUILD_BusinessCatalogManager/readme.md)
+ [BUILD_Auth](https://github.com/SAP/BUILD/tree/master/BUILD_Auth/readme.md) 
+ [BUILD_Shell](https://github.com/SAP/BUILD/tree/master/BUILD_Shell/readme.md)
+ [BUILD_SharedThirdParties](https://github.com/SAP/BUILD/tree/master/BUILD_SharedThirdParties/readme.md)
+ [BUILD_Common](https://github.com/SAP/BUILD/tree/master/BUILD_Common/readme.md)
+ [BUILD_AngularUIGrid](https://github.com/SAP/BUILD/tree/master/BUILD_AngularUIGrid/readme.md)
+ [BUILD_AngularUIGridTree](https://github.com/SAP/BUILD/tree/master/BUILD_AngularUITree/readme.md)
+ [BUILD_AngularUIGridZip](https://github.com/SAP/BUILD/tree/master/BUILD_AngularZip/readme.md)
+ [BUILD_KeyBoardEventPolyfill](https://github.com/SAP/BUILD/tree/master/BUILD_KeyBoardEventPolyfill/readme.md)
+ [BUILD_jQuery](https://github.com/SAP/BUILD/tree/master/BUILD_jQuery/readme.md)

**Admin Modules**
+ [BUILD_AdminUsers](https://github.com/SAP/BUILD/tree/master/BUILD_AdminUsers/readme.md)
+ [BUILD_Admin](https://github.com/SAP/BUILD/tree/master/BUILD_Admin/readme.md)
+ [BUILD_AdminAudit](https://github.com/SAP/BUILD/tree/master/BUILD_AdminAudit/readme.md)

# User Documentation
Check out the [Build Support](http://sap.github.io/BUILD_User_Assistance) for detailed help topics and video tutorial about using Build!

#Getting Started

##Prerequisites
- install [GIT](https://git-scm.com/downloads)
- install [npm.js](https://docs.npmjs.com/cli/install) - _*only version 1.4.28 is supported*_
- install [node.js](https://docs.npmjs.com/cli/install) -_*only version 10.28 is supported*_
- install [mongodb](https://www.mongodb.org/downloads#previous) -_*only version 2.6.x is supported*_

## Download / Clone

1. Clone [BUILD](https://github.com/SAP/BUILD) repo
    ```sh
    git clone https://github.com/SAP/BUILD.git
    ```

2. Install required node modules (dependencies):
    ```sh 
    npm install -g grunt-cli
    cd BUILD
    npm install
    ```
    
3. Initialize the database(Required just the first time):
   ```sh
    cd server
    node initSchema.js
    node setDefaultAccess.js
    cd ..
   ```
   
4. Start the BUILD application (for Dev):
    ```sh
     grunt serve
    ```

Go to [http://localhost:9000](http://localhost:9000) in Chrome browser and click Join

_If you're having a problem installing, you can create a bug or ask a question using the [BUILD Issue Tracker](https://github.com/SAP/BUILD/issues), contact contact.build@sap.com or tweet our twitter account [buildwithbuild](https://twitter.com/buildwithbuild) and we will reach out to you._ 

## TO DO 
- [ ] Update package names
- [ ] Enable Prototype creation

## Licenses

This project is licensed under the Apache Software License, v. 2 except as noted otherwise in the [License file](https://github.com/SAP/BUILD/blob/master/LICENSE.txt).

###Licenses for Contributors

+ [Individual Contribution License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BIndividual%2BContributor%2BLicense%2BAgreement.pdf) 
+ [Corporate Contributor License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BCorporate%2BContributor%2BLicense%2BAgreement.pdf) 

## Legal Notices

[View the legal notice about fonts used in Build](https://github.com/SAP/BUILD/wiki/Legal-Notice-About-Fonts).
