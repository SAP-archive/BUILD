BUILD_Projects
===============

This module handles the creation and lifecycle of BUILD projects, which is the entry point to allow users create User Research studies and Protoype apps. It also allows the project owner to manage team members and associated project assets.
    
# Exposed API Calls
```
[GET, POST, PUT] /api/projects/
[GET] /api/projects/?showArchived=true|false
```
- JSON response containing all projects associated with the users profile
- Supported filters [?showArchived=true|false], return a list of projects filtered by the archive flag. If flag is omitted you receive ALL projects
- to archive a project, you call PUT, passing in the following body '{"archived":true}', similar to how you would update the project and its respective fields.

```
[POST, PUT, PATCH, DELETE] /api/projects/:projectId/invite
```
- Allowing the user to accept, reject and create invites for a project
- There is no ACL on the PUT,PATCH and DELETE as user wont be a collaborator on the project

```
[GET] /api/projects/:projectId/team
```
- Return a JSON response of all team members of a project i.e. Rejected User, Invite List and Collaborators
- User must be a member of the project in order to carry out any of these tasks

```
[GET] /api/projects/:projectId/
[PUT, PATCH, DELETE] /api/projects/:projectId/settings
```
- JSON response containing specific project details
- ACL is enforced to owner to update, archive or delete a project
- User must be a member of the project in order to carry out any of these tasks

```
[GET, POST] /api/projects/:projectId/document/
[GET] /api/projects/:projectId/document/?fileType=image/png|image/jpeg
[GET] /api/projects/:projectId/document/?thumbOnly=true|false [default is false]
[POST] /api/projects/:projectId/document/?linkImage=true [default is false]
```
- Upload and retrieve files belonging to a specific project
- Supported filters [?fileType=image/png, thumbOnly=true|false], these can be combined in one request as well
- Append linkImage=true to the POST if you want to attach a thumbnail to the main image. This thumbnail needs to be uploaded/created by the UI client, it is not created on the server. Setting this attribute to true will populate the parent_id in the thumbnail.
- User must be a member of the project in order to carry out any of these tasks

```
[GET] /api/projects/:projectId/document/:assetId/
[GET] /api/projects/:projectId/document/:assetId/?thumbOnly=true|false
```
- Handle specific asset details, response is in JSON format
- Supported filters [thumbOnly=true|false, default is false], these can be combined in one request
- User must be a member of the project in order to carry out any of these tasks

```
[GET] /api/projects/:projectId/document/:assetId/:version/
[GET] /api/projects/:projectId/document/:assetId/:version/render/
```
- Handle specific asset details, response is in JSON format
- Supported filters [thumbOnly=true|false, default is false]
- User must be a member of the project in order to carry out any of these tasks

```
[GET] /api/projects/:projectId/document/:assetId/render/
[GET] /api/projects/:projectId/document/:assetId/render/?thumbOnly=true|false
[GET] /api/projects/:projectId/document/:assetId/render/?download=true|false
[GET] /api/projects/:projectId/document/:assetId/:version/render/?thumbOnly=true|false
[GET] /api/projects/:projectId/document/:assetId/:version/render/?download=true|false
```
- Render the latest asset that has been uploaded
- Supported filters [thumbOnly=true|false, default is false], show the upload thumb version of the parent image
- Supported filters [download=true|false, default is false], allows the user to download the file, does not return a 304 and sets content-disposition with 'attachment' 
- User must be a member of the project in order to carry out any of these tasks

```
[GET] /api/projects/:projectId/history
[POST] /api/projects/:projectId/history
```
- Log and retrieve project history
- User must be a member of the project in order to carry out any of these tasks

# Sample Representation of Projects JSON

```
{  
   "name":"Project Name",
   "_id":"9c8d76dedc7a6aac09b213c7",
   "reject_list":[  

   ],
   "invite_list":[  

   ],
   "user_list":[  
      {  
         "user_id":"54ef1f481393a84bbfe0f75f",
         "email":"jmetertester@example.com"
      }
   ],
   "deleted":false,
   "stats":{  
      "created_by":"54ef1f481393a84bbfe0f75f",
      "updated_by":"54ef1f481393a84bbfe0f75f",
      "updated_at":"2015-02-26T15:50:15.927Z",
      "created_at":"2015-02-26T15:50:15.927Z"
   }
}
```

# Sample Representation of Asset JSON
```
[  
   {  
      "_id":"54ef40b8e67672a0d62ec381",
      "filename":"SampleLogo.png",
      "length":222,
      "uploadDate":"2015-02-26T15:50:16.895Z",
      "metadata":{  
         "updated_at":1424965816891,
         "created_at":1424965816891,
         "project":"67f7ac1818872a9e09b213c8",
         "contentType":"image/png",
         "extension":"png",
         "version":1,
         "isThumb":false,
         "hasThumb":false,
         "created_by":"54ef1f481393a84bbfe0f761",
         "updated_by":"54ef1f481393a84bbfe0f761"
      }
   }
]
```

Further Information
======================

*BUILD_Projects* is part of [BUILD](https://github.com/SAP/BUILD/blob/master/README.md).
