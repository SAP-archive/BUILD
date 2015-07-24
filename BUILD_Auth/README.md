BUILD_Auth
=====

Authentication module for BUILD which provides authenication and access control checks on services for the BUILD application

###BUILD authentication module.

To check the authentication in your api you have to configure "BUILD/server/services.json" as follows:

First define filter to be implemented on routes, for example:

	"filters" : {
        "auth" : {
            "module" : "norman-auth-server",
            "filter" : "auth",
            "options" : {}
        },
        "jwt" : {
            "module" : "norman-auth-server",
            "filter" : "jwt",
            "options" : {}
        },
        "xsrf" : {
            "module" : "norman-auth-server",
            "filter" : "xsrf",
            "options" : {
                "headerName" : "X-CSRF-Token",
                "cookieName" : "X-CSRF-Token"
            }
        }
    },
    
then define routes that have to be filtered (/api) and what filter to be applied ([ "jwt", "auth", "xsrf" ]).
Careful, filter order here is very important.

    "locations" : [
        {
            "/api" : [ "jwt", "auth", "xsrf" ]
        }
    ]
	
In this example we are applying filters 'jwt', 'auth' and 'xsrf' on route '/api'. These filters are located in 'norman-auth-server'. You can also provide options to the filter, like here in 'xsrf' filter, 'headerName' and 'cookieName'.

###Usage of access control:

The node module we are using to implement access control is: https://github.com/OptimalBits/node_acl

In order to add acl middleware to your router, simply add the middleware call like so:

	var auth = registry.getModule('AuthService');
	var aclService = registry.getModule('AclService');
	router.get('/:projectId', aclService.getAcl().middleware(2, auth.getUserId), controller.show);
	
In addition to the middleware function, we now also provide a function checkAllowed. It is essentially the same function however it provides more correct http responses, contains norman logging information, and performs the check on the entire url, i.e. uses req.originalUrl over req.url.

Usage of check allowed is as follows; 

	var auth = registry.getModule('AuthService');
	var aclService = registry.getModule('AclService');
	router.get('/:projectId', auth.isAuthenticated(), aclService.checkAllowed(2, auth.getUserId), controller.show);

The roles and permissions are currently defined on a project-by-project basis, with a set of owner, collaborator and spectator roles being created for each project. The owner role is assigned to the user who creates the project, and the collaborator role is assigned to any uses who have accepted invites to the project.

A sample role with permissions can be seen below: 

	var ownerObject = {
        	roles: 'owner-1',
        	allows: [
            		{ resources: '/', permissions: 'get' },
            		{ resources: '/1', permissions: 'post' },
            		{ resources: '/1/document', permissions: 'delete' },
            		{ resources: '/1/document/upload', permissions: '*' },
            		{ resources: '/1', permissions: ['put','post', 'patch'] },
            		{ resources: '/1/invite', permissions: '*' }
        	]
    	};
    	
    	aclService.getAcl().allow([ownerObject]);


The spectator role will be used for participants of a study who aren't members of the project that the study belongs to (the handling of this role is yet to be fully implemented).


The default roles are pretty basic and only protect as far as the projectId in terms of granularity.

One of them removes a specific roles from a user such as below:

	aclService.removeUserRole(userId, role); // role can be for example 'owner-1'
	
The other removes all of the possible permissions a user can have to a project like below:

	aclService.removeProjectAccess(userId, projectId);
	
	
NOTE: Clarification on the use of the middleware() function. 

The number which is the first argument in the middleware call defines how many path elements it protects to.

For example, the following will only protect as far as '/api/projects/:projectId' because they are the first 3 elements in the route. Please adjust the number accordingly to the projectId.

	router.get('/api/projects/:projectId/prototypes/routes', auth.isAuthenticated(), aclService.getAcl().middleware(3, auth.getUserId), controller.show);

If more specific route permissions need to be added, you will need to add them using the acl API linked to above.

### Admin User


**Make a new Admin User**

  1. Go to root\Admin\server\

  2. Script for admin creation : node createAdmin.js --name <admin name> --password <admin password>  --email <admin email>

  Note: this script creates a user with a Standard and an Admin roles.

Further Information
======================

*BUILD_Auth* is part of [BUILD](https://github.com/SAP/BUILD/blob/master/README.md).