## Make a Contribution

So you want to contribute to BUILD? Good choice! There is lots of scope for contribution, and there's plenty to do! 
Popular contributions include bug reports, feature requests, and new features. [This document](https://github.com/SAP/BUILD/blob/master/Contributing.md) describes how to make contributions to any of these modules.

##Getting Started

###Prerequisites
- install [GIT](https://git-scm.com/downloads)
- install [npm.js](https://docs.npmjs.com/cli/install) - _*only version 1.4.28 is supported*_
- install [node.js](https://docs.npmjs.com/cli/install) -_*versions 10.33 and 10.38 are supported*_
- install [mongodb](https://www.mongodb.org/downloads#previous) -_*only version 2.6.x is supported*_
- Follow install for your OS @ https://github.com/TooTallNate/node-gyp/blob/master/README.md#installation


###Download / Clone

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

####Admin Settings
You can manage your user settings with the Admin module. Install the Admin module here: [http://github.com/sapbuild/Admin](http://github.com/sapbuild/Admin). You can log in to the Admin module using your BUILD account details. 

####Debugging the Node.js backend
Starting BUILD with "grunt serve" will start the debug server on the default port 5858. You can connect to this debugger session with tools like Webstorm or node-inspector. The easiest and fastest way to debug the Node.js backend is to use node-inspector. 
You can install node-inspector globally via:
```sh
npm install -g node-inspector
```
and connect then to the running server via
```sh
node-inspector --no-preload
```
The option --no-preload will speed up the initiliziation dramatically as it doesn't preload all source files, but loads them when neccessary.

#Contact

_Having a problem? Create a bug or ask a question using the [BUILD Issue Tracker](https://github.com/SAP/BUILD/issues), send a mail to contribute.build@sap.com or send a tweet to our twitter account [buildwithbuild](https://twitter.com/buildwithbuild) and we'll get back to you as soon as possible._ 

# Modules in Build

**Foundation Modules**
+ [angular-sap-common-directives](https://github.com/sapbuild/angular-sap-common-directives)
+ [angular-sap-common-services](https://github.com/sapbuild/angular-sap-common-services)
+ [angular-sap-ui-elements](https://github.com/sapbuild/angular-sap-ui-elements)
+ [node-sap-mongo-config](https://github.com/sapbuild/node-sap-mongo-config)
+ [node-sap-common](https://github.com/sapbuild/common)
+ [node-sap-app-server](https://github.com/sapbuild/node-sap-app-server)
+ [node-sap-mailer](https://github.com/sapbuild/node-sap-mailer)
+ [node-sap-secure-store](https://github.com/sapbuild/node-sap-secure-store)
+ [node-sap-upload](https://github.com/sapbuild/node-sap-upload)
+ [node-sap-mongo](https://github.com/sapbuild/node-sap-mongo)
+ [node-sap-promise](https://github.com/sapbuild/node-sap-promise)
+ [node-sap-logging](https://github.com/sapbuild/node-sap-logging)
+ [node-sap-upload](https://github.com/sapbuild/node-sap-upload)
+ [node-sap-mongo-config](https://github.com/sapbuild/node-sap-mongo-config)
+ [node-sap-build](https://github.com/sapbuild/node-sap-build)

**Build Modules**
+ [PrototypeEditors](https://github.com/sapbuild/PrototypeEditors)
+ [BUILD](https://github.com/SAP/BUILD)
+ [Projects](https://github.com/sapbuild/Projects)
+ [UICatalogManager](https://github.com/sapbuild/UICatalogManager)
+ [UserResearch](https://github.com/sapbuild/UserResearch)
+ [BusinessCatalogManager](https://github.com/sapbuild/BusinessCatalogManager)
+ [Auth](https://github.com/sapbuild/Auth) 
+ [Shell](https://github.com/sapbuild/Shell)
+ [SharedThirdParties](https://github.com/sapbuild/SharedThirdParties)
+ [Common](https://github.com/sapbuild/Common)
+ [AngularZip](https://github.com/sapbuild/AngularZip)
+ [AngularUIGrid](https://github.com/sapbuild/AngularUIGrid)
+ [AngularUITree](https://github.com/sapbuild/AngularUITree)
+ [Html2Canvas](https://github.com/sapbuild/angular-sap-html2canvas)
+ [KeyBoardEventPolyfill](https://github.com/sapbuild/KeyBoardEventPolyfill)
+ [AngularSAPD3Plugins](https://github.com/sapbuild/angular-sap-d3-plugins)
+ [jQuery](https://github.com/sapbuild/jquery)

**Admin Modules**
+ [AdminUsers](https://github.com/sapbuild/adminusers)
+ [Admin](https://github.com/sapbuild/admin)
+ [AdminAudit](https://github.com/sapbuild/adminaudit)
