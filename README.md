<img src = "https://github.wdf.sap.corp/Norman/Norman/blob/master/docs/images/BUILD_Logo_Light.png?raw=true" height="128"> 

## Welcome to BUILD 

#### Jenkins CI [![Build Status](https://build-jenkins.wdf.sap.corp/jenkins/job/Norman-master/badge/icon)](https://build-jenkins.wdf.sap.corp/jenkins/job/Norman-master/)

#### Travis CI [![Build Status](https://travis-ci.mo.sap.corp/Norman/Norman.svg?token=L93dyaS972KHVVxxHDrQ&branch=master)](https://travis-ci.mo.sap.corp/Norman/Norman)



BUILD (formerly known as Project Norman) is an open-source, cloud-based and social platform that enables users, even those with no UI development knowledge, to easily create fully interactive prototypes with realistic data, share them with colleagues and consolidate this feedback without writing a line of code. 

For a more detailed description of BUILD, see the [BUILD Overview](https://github.wdf.sap.corp/Norman/Norman/wiki/Project-Norman-Overview).


##Project Norman Sub-Projects

Project Norman contains the following sub-projects:
+ [Projects - aka Project Management] (https://github.wdf.sap.corp/Norman/Projects)
+ [Auth] (https://github.wdf.sap.corp/Norman/Auth) 
+ [node-sap-mongo-config](https://github.wdf.sap.corp/Norman/node-sap-mongo-config)
+ [User Research] (https://github.wdf.sap.corp/Norman/UserResearch)
+ [UI Catalog Manager](https://github.wdf.sap.corp/Norman/UICatalogManager)
+ [PrototypeEditors] (https://github.wdf.sap.corp/Norman/PrototypeEditors)
+ [SharedThirdParties](https://github.wdf.sap.corp/Norman/SharedThirdParties)
+ [node-sampcommon](https://github.wdf.sap.corp/Norman)
+ [BusinessCatalogManager] (https://github.wdf.sap.corp/Norman/BusinessCatalogManager)
+ [BuildTools](https://github.wdf.sap.corp/Norman/BuildTools)
+ [node-sap-app-server](https://github.wdf.sap.corp/Norman/node-sap-app-server)
+ [Design](https://github.wdf.sap.corp/Norman/Design)
+ [DevFlowTest](https://github.wdf.sap.corp/Norman/DevFlowTest)
+ [admin-users](https://github.wdf.sap.corp/Norman/admin-users)
+ [node-sap-mailer](https://github.wdf.sap.corp/Norman/node-sap-mailer)
+ [build-hcp-web-dispatcher](https://github.wdf.sap.corp/Norman/build-hcp-web-dispatcher)
+ [Admin](https://github.wdf.sap.corp/Norman/Admin)
+ [angular-sap-ui-elements](https://github.wdf.sap.corp/Norman/angular-sap-ui-elements)
+ [Architecture](https://github.wdf.sap.corp/Norman/Architecture)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [](https://github.wdf.sap.corp/Norman/)
+ [Flow Composer] (https://github.wdf.sap.corp/Norman/FlowComposer)
+ [Sample Data Server] (https://github.wdf.sap.corp/Norman/SampleDataServer)
+ [UX Rule Engine] (https://github.wdf.sap.corp/Norman/UXRuleEngine )
+ [UI Canvas] (https://github.wdf.sap.corp/Norman/UICanvas )
+ [UI Composer] (https://github.wdf.sap.corp/Norman/UIComposer)
+ [Shared Workspace] (https://github.wdf.sap.corp/Norman/SharedWorkspace)
+ [UI Catalog Manager] (https://github.wdf.sap.corp/Norman/UICatalogManager)
+ [Previewer] (https://github.wdf.sap.corp/Norman/Previewer)
+ [Collaboration] (https://github.wdf.sap.corp/Norman/Collaboration)
+ [Shell] (https://github.wdf.sap.corp/Norman/Shell)
+ [Analytics] (https://github.wdf.sap.corp/Norman/Analytics)
+ [Common] (https://github.wdf.sap.corp/Norman/Common)



##Make a Contribution
Click here to view our [Contribution](https://github.wdf.sap.corp/Norman/Norman/blob/master/Contributing.md) document.


norman-norman
===============
This is a bare-bones norman application. Use this to build norman modules on top of that.


# Prerequisites
- Configure [Sap NPM registry](https://jam4.sapjam.com/wiki/show/kvLVqwLEg5DQorc6zsGIUh) - for installing norman modules with `npm`


# Installation

1. Clone [Norman/Norman](https://github.wdf.sap.corp/Norman/Norman) repo
    ```sh
    git clone git@github.wdf.sap.corp:Norman/Norman.git
    ```

2. Install required node modules (dependencies):
    ```sh
    npm install
    ```

3. Build and run:
    ```sh
    grunt dev            // just build in development mode
    grunt serve          // build dev + start express server + watch js & less for changes
    grunt serve:debug    // run app in debug mode (with node-inspector)
    grunt dist           // build for production
    ```

## Adding Modules

#### To include a Norman module to the client side e.g. the Shell module:

1. `npm install norman-shell-client` 

2. Inside `client/require.js` file add:
    ```sh
    require('norman-shell-client');
    ```

3. Build and Run


#### To include another Norman module on the Server e.g. the Auth module:

1. `npm install norman-auth-server` 

2. Inside the `server/require.js` file add:
    ```sh
    require('norman-auth-server')(app);
    ```

3. Build and Run


## Developing modules locally

1. Assuming you have your module in a separate folder

2. Using terminal/console, navigate to the `client` or `server` folder

3. create a link to the module
    ```sh
    npm link
    ```

4. Using terminal/console, navigate to the root of the `norman-norman` project and run:
    ```sh
    npm link module-name	
    ```

5. Inside the `server/require.js` (or `server/require.js`) file add:
    ```sh
    require('norman-login-server');
    ```

6. Build and Run

**<u>NOTE</u>**  When making changes to the module under development it may be necessary to run the `npm link` command again.

<!-- Piwik Image Tracker-->
<img src="https://norman-piwik.mo.sap.corp/piwik/piwik.php?idsite=4&rec=1" style="border:0" alt="" />
<!-- End Piwik -->

##Legal Notice About Font

[View the legal notice about fonts used in Build](https://github.wdf.sap.corp/Norman/Norman/wiki/Legal-Notice-About-Fonts).
