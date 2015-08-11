<img src = "https://github.com/SAP/BUILD/blob/master/docs/images/BUILD_Logo_Light.png?raw=true" height="128"> 

** Beta - work in Progress **

# Overview 
BUILD  is an open-source, cloud-based and social platform that enables users, even those with no UI development knowledge, to easily create fully interactive prototypes with realistic data, share them with colleagues and consolidate this feedback without writing a line of code. 

For a more detailed description of BUILD, see the [BUILD Overview](https://github.com/SAP/BUILD/wiki/BUILD-Overview).

# Modules in Build
**Foundation Modules**
+ [angular-sap-common-directives](https://github.com/SAP/BUILD/tree/master/angular-sap-common-directives/README.md)
+ [angular-sap-common-services](https://github.com/SAP/BUILD/tree/master/angular-sap-common-services/README.md)
+ [angular-sap-ui-elements](https://github.com/SAP/BUILD/tree/master/angular-sap-ui-elements/README.md)
+ [angular-sap-common-filters](https://github.com/SAP/BUILD/tree/master/angular-sap-common-filters/README.md)
+ [node-sap-mongo-config](https://github.com/SAP/BUILD/tree/master/node-sap-mongo-config/README.md)
+ [node-sap-common](https://github.com/SAP/BUILD/tree/master/node-sap-common/README.md)
+ [node-sap-app-server](https://github.com/SAP/BUILD/tree/master/node-sap-app-server/README.md)
+ [node-sap-mailer](https://github.com/SAP/BUILD/tree/master/node-sap-mailer/README.md)
+ [node-sap-secure-store](https://github.com/SAP/BUILD/tree/master/node-sap-secure-store/README.md)
+ [node-sap-upload](https://github.com/SAP/BUILD/tree/master/node-sap-upload/README.md)
+ [node-sap-mongo](https://github.com/SAP/BUILD/tree/master/node-sap-mongo/README.md)
+ [node-sap-promise](https://github.com/SAP/BUILD/tree/master/node-sap-promise/README.md)
+ [node-sap-logging](https://github.com/SAP/BUILD/tree/master/node-sap-logging/README.md)
+ [node-sap-mongo-config](https://github.com/SAP/BUILD/tree/master/node-sap-mongo-config/README.md)
+ [node-sap-build](https://github.com/SAP/BUILD/tree/master/node-sap-build/README.md)
+ [angular-sap-html2canvas](https://github.com/SAP/BUILD/tree/master/angular-sap-html2canvas/README.md)
+ [angular-sap-d3-plugins](https://github.com/SAP/BUILD/tree/master/angular-sap-d3-plugins/README.md)

**Build Modules**
+ [BUILD_PrototypeEditors](https://github.com/SAP/BUILD/tree/master/BUILD_PrototypeEditors/README.md)
+ [BUILD_Projects](https://github.com/SAP/BUILD/tree/master/BUILD_Projects/README.md)
+ [BUILD_UICatalogManager](https://github.com/SAP/BUILD/tree/master/BUILD_UICatalogManager/README.md)
+ [BUILD_UserResearch](https://github.com/SAP/BUILD/tree/master/BUILD_UserResearch/README.md)
+ [BUILD_BusinessCatalogManager](https://github.com/SAP/BUILD/tree/master/BUILD_BusinessCatalogManager/README.md)
+ [BUILD_Auth](https://github.com/SAP/BUILD/tree/master/BUILD_Auth/README.md) 
+ [BUILD_Shell](https://github.com/SAP/BUILD/tree/master/BUILD_Shell/README.md)
+ [BUILD_SharedThirdParties](https://github.com/SAP/BUILD/tree/master/BUILD_SharedThirdParties/README.md)
+ [BUILD_Common](https://github.com/SAP/BUILD/tree/master/BUILD_Common/README.md)
+ [BUILD_AngularUIGrid](https://github.com/SAP/BUILD/tree/master/BUILD_AngularUIGrid/README.md)
+ [BUILD_AngularUIGridTree](https://github.com/SAP/BUILD/tree/master/BUILD_AngularUITree/README.md)
+ [BUILD_AngularUIGridZip](https://github.com/SAP/BUILD/tree/master/BUILD_AngularZip/README.md)
+ [BUILD_KeyBoardEventPolyfill](https://github.com/SAP/BUILD/tree/master/BUILD_KeyBoardEventPolyfill/README.md)
+ [BUILD_jQuery](https://github.com/SAP/BUILD/tree/master/BUILD_jQuery/README.md)

**Admin Modules**
+ [BUILD_AdminUsers](https://github.com/SAP/BUILD/tree/master/BUILD_AdminUsers/README.md)
+ [BUILD_Admin](https://github.com/SAP/BUILD/tree/master/BUILD_Admin/README.md)
+ [BUILD_AdminAudit](https://github.com/SAP/BUILD/tree/master/BUILD_AdminAudit/README.md)

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

2. Install required node modules (dependencies) (note, you need to be in the BUILD/ folder within the repo):
    ```sh 
    npm install -g grunt-cli
    cd BUILD/BUILD/
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

_If you're having a problem installing, you can create a bug or ask a question using the [BUILD Issue Tracker](https://github.com/SAP/BUILD/issues), contact contribute.build@sap.com or tweet our twitter account [buildwithbuild](https://twitter.com/buildwithbuild) and we will reach out to you._ 

## TO DO 
- [ ] Update package names
- [X] Enable Prototype creation

## Licenses

This project is licensed under the Apache Software License, v. 2 except as noted otherwise in the [License file](https://github.com/SAP/BUILD/blob/master/LICENSE.txt).

_Please do not remove this license from cloned or forked versions of BUILD._

###Licenses for Contributors

+ [Individual Contribution License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BIndividual%2BContributor%2BLicense%2BAgreement.pdf) 
+ [Corporate Contributor License Agreement](https://github.com/SAP/BUILD/blob/master/docs/SAP%20License%20Agreements/SAP%2BCorporate%2BContributor%2BLicense%2BAgreement.pdf) 

## Legal Notices

[View the legal notice about fonts used in Build](https://github.com/SAP/BUILD/wiki/Legal-Notice-About-Fonts).
