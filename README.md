norman-norman
===============


Getting started:

	1. Clone [Norman/Norman](https://github.wdf.sap.corp/Norman/Norman) repo
	2. Run:
		`npm install` to install required node modules
	3. To build and run a development build
		```
		grunt dev
		grunt serve
		```

To include another Norman module on the client e.g. the Shell Module
	1. npm install `norman-shell-client` 
		*Note:*  Make sure the npm registry is set to use the internal SAP registry see here for details
	2. Inside  `client/require.js` file add:
		```
		require('norman-shell-client');
		```
	3. Build and Run

To include another Norman module on the Server e.g. the Login Server Module
	1. npm install `norman-login-server` 
		*Note:*  Make sure to use the internal SAP registry
	2. Inside the `require.js` file add:
		```
		require('norman-login-server');
		```
	3. Build and Run


To Develop a module locally:

	1. clone your module to a separate folder
	2. cd into the client/server folder
	3. create a link to module
		```
		npm link module-name	
		```
	3. cd to the Norman-Norman root and as in last step run 
		```
		npm link module-name	
		```
	4. follow from step 2 in the previous instructions

	*NOTE* When making changes to the module under development it may be necessary to run the `npm link` command again
