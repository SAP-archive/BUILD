<img src = "https://github.wdf.sap.corp/Norman/Norman/blob/master/docs/images/BUILD_Logo_Light.png?raw=true" height="128"> 

# Overview 
BUILD (formerly known as Project Norman) is an open-source, cloud-based and social platform that enables users, even those with no UI development knowledge, to easily create fully interactive prototypes with realistic data, share them with colleagues and consolidate this feedback without writing a line of code. 

For a more detailed description of BUILD, see the [BUILD Overview](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/BUILD/wiki/Build-Overview).

# Modules in Build
**Foundation Modules**
+ [angular-sap-common-directives](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/angular-sap-common-directives)
+ [angular-sap-common-services](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/angular-sap-common-services)
+ [angular-sap-ui-elements](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/angular-sap-ui-elements)
+ [angular-sap-common-filters](https://github.wdf.sap.corp/Norman/Norman)
+ [node-sap-mongo-config](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-mongo-config)
+ [node-sap-common](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-common)
+ [node-sap-app-server](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-app-server)
+ [node-sap-mailer](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-mailer)
+ [node-sap-secure-store](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-secure-store)
+ [node-sap-upload](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-upload)
+ [node-sap-mongo](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-mongo)
+ [node-sap-promise](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-promise)
+ [node-sap-logging](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-logging)
+ [node-sap-mongo-config](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-mongo-config)
+ [node-sap-build](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/node-sap-build)


# User Documentation
Check out the [Build Support](http://sap.github.io/BUILD_User_Assistance) for detailed help topics and video tutorial about using Build!

#Architectural Overview
Check out this useful [overview of the BUILD architecture](https://github.wdf.sap.corp/Norman/Norman/blob/master/docs/Architecture/BUILD%20architecture%20presentation%20V2.pptx).

#Getting Started

## What's included
|Folder/File  | Description |
| ------------- | ------------- | 
|client  |  |
| docs |  | 
| grunt-conf |  |
| server |  |
| .dashboard.yml |  |
| .editorconfig |  | 
| .gitattributes |  |
| .gitignore |  |
| .travis.yml |  | 
| Community Roles.md |  |
| Contributing.md |  |
| Contributing.pdf |  | 
| Gruntfile |  |
| LICENSE.txt |  |
| README.md |  | 
| bump-config.json  |  |
| karma.conf.js  |  |
| package.json  |  | 
| run.js |  |


##Prerequisites
- Ensure your proxy settings are resolved. 
- install [GIT](https://git-scm.com/downloads)
- install [npm.js](https://docs.npmjs.com/cli/install) - _*only version 1.4.28 is supported*_
- install [node.js](https://docs.npmjs.com/cli/install) -_*only version 10.28 is supported*_

## Download / Clone

1. Clone [BUILD](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/BUILD) repo
    ```sh
    git clone git@github.wdf.sap.corp:https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/BUILD.git
    ```

2. Install required node modules (dependencies):
    ```sh
    npm install
    ```

3. Build and run:

    ```sh
    grunt dist              // build for production*
    cd dist                 // moves into new directory
    node server/initSchema  // populate the library metadata** 
                             (**needs to be executed once for a given database in a single node instance)
    node server/app.js      // runs the BUILD application server at http://localhost:9000.
    ```
   Optional steps (after grunt dist):

   ```sh
   grunt dev            // just build in development mode (optional)
   grunt serve          // build dev + start express server + watch js & less for changes (optional)
   grunt serve:debug    // run app in debug mode (with node-inspector) (optional)
   ```
_If you're having a problem installing, you can create a bug or ask a question using the [BUILD Issue Tracker](https://github.wdf.sap.corp/UXD-BUILD-OPENSOURCE/BUILD/issues)._ For more information, see our [Contribution Guidelines](https://github.wdf.sap.corp/Norman/Norman/wiki/Contribution-Guidelines).

## Make a Contribution
**Although we are not currently reviewing or accepting code contribution, our core-development team want to hear about any bugs you encounter, and answer any questions you might have!** 

For more information, see our [Contribution Guidelines](https://github.wdf.sap.corp/Norman/Norman/wiki/Contribution-Guidelines).

## Copyright and Licenses

+ [Apache License](https://github.wdf.sap.corp/Norman/Norman/wiki/License)
+ [Individual Contribution License Agreement](https://github.wdf.sap.corp/Norman/Norman/blob/master/docs/SAP%20License%20Agreements/SAP%2BIndividual%2BContributor%2BLicense%2BAgreement.pdf) 
+ [Corporate Contributor License Agreement](https://github.wdf.sap.corp/Norman/Norman/blob/master/docs/SAP%20License%20Agreements/SAP%2BCorporate%2BContributor%2BLicense%2BAgreement.pdf) 

## Legal Notices

[View the legal notice about fonts used in Build](https://github.wdf.sap.corp/Norman/Norman/wiki/Legal-Notice-About-Fonts).
