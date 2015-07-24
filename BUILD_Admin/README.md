BUILD_Admin
=====

Admin is a wrapper module to build the BUILD Admin console and include the relevant dependant modules

#### Create a user with the Admin role

  1 - Go to root\Admin\server\admin-server
  
  2 - Script for admin creation : node createAdmin.js --name <admin name> --password <admin password>  --email <admin email>
  
  Note: this script creates a user with a Standard and an Admin roles.

#### Opt-out
To manage the emails blacklist, you can use the optout-script.js in server/. The first argument is the action you want to perform (add or remove) and all the following arguments will be email addresses.

`` node optout-script.js  add|remove email1 email2 ... emailn``

##### Examples

`` node optout-script.js  add bob@example.com dave@example.com`` 
Will add bob@example.com and dave@example.com to the blacklist.

`` node optout-script.js  remove bob@example.com``
Will remove bob@example.com from the blacklist.

### The following happens when a user is removed via the admin console
- Remove the projects owned by this user from projects collection,
- Remove the user from project user list (remove from participant list)
- Remove the studies belonging to the deleted project from studies collection,
- Remove answers and annotations made by the user in studies he participated in
- Remove user + deleted projects from roles collection
- Remove user from users collection

Further Information
======================

*BUILD_Admin* is part of [BUILD](https://github.com/SAP/BUILD/blob/master/README.md).