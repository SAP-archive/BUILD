Core Server services
=============

##Importing core services
```javascript
var commonServer = require('norman-common-server');
```

##Error Handling

##Logging

##Using the Common MongoDB Connection

###Initializing the connection 
This must be done once by the main server process. This is done by the Norman AppServer, you may do this manually in your service tests. 

```javascript
commonServer.db.connection.initialize({ database: "norman-test" }, function (err)  {
  if (err) {
    console.error("Oops, no magic today!");
  }
});
```

Optional second parameter allows configuring the deployment strategy. Default strategy "single" stores all Norman collection into a single database. Production strategy "distribute" spreads the collections over multiple domain databases to reduce write contention. Database distribution may be fine-tuned with the "map" strategy. 

###Getting a mongoose connection
The following code snippet returns a connection to the database configured for the module "my-module" according to the deployment strategy. 

```javascript
var connection = commonserver.db.connection.getMongooseConnection("my-module");
```

###Getting a Mongo database connection
```javascript
var db1 = commonserver.db.connection.getDb("my-module");
var db2 = commonserver.db.connection.getMongooseConnection("my-other-module").db;
```


###Creating mongoose models
We offer a simple way to define mongoose model on a specific connection :

```javascript
var commonServer = require('norman-common-server'),
    mongoose = commonServer.db.mongoose;

var MySchema = mongoose.createSchema('my-module', { ... });


module.exports = mongoose.createModel('MyModel', MySchema);

```

##Using the Service Registry

###Declaring a service

```javascript
var commonServer = require('norman-common-server);

var fooService = {...};

commonServer.registry.registerModule(fooService, 'Foo');

```

###Accessing a service

```javascript
var commonServer = require('norman-common-server);

var fooService = commonServer.registry.getModule('Foo');

```

##File Upload

### Configuration  file

You can configure the file upload in Norman/dist/server/config.json. You can add the section fileUpload which is not there by default (default value for parameters are then applied)

The following are the options that can be passed to File Upload.

* dest
* limits
* includeEmptyFields
* inMemory
* mimetype
* scanAction

### dest
The destination directory for the uploaded files.

```javascript
"dest": "./uploads/"
```

### limits
An object specifying the size limits of the following optional properties. This object is passed to busboy directly, and the details of properties can be found on busboy's page

* fieldNameSize - integer - Max field name size (Default: 100 bytes)
* fieldSize - integer - Max field value size (Default: 1MB)
* fields - integer - Max number of non-file fields (Default: 50)
* fileSize - integer - For multipart forms, the max file size (in bytes) (Default: 25Mo)
* files - integer - For multipart forms, the max number of file fields (Default: 10)
* parts - integer - For multipart forms, the max number of parts (fields + files) (Default: 10)
* headerPairs - integer - For multipart forms, the max number of header key=>value pairs to parse Default: 2000 (same as node's http).

```javascript
"limits": {
  "fieldNameSize": 100,
  "files": 2,
  "fields": 5
}
```

Specifying the limits can help protect your site against denial of service (DoS) attacks.

### includeEmptyFields
A Boolean value to specify whether empty submitted values should be processed and applied to req.body; defaults to false;

```javascript
"includeEmptyFields": true
```

### inMemory
If this Boolean value is true, the file.buffer property holds the data in-memory that Multer would have written to disk. The dest option is still populated and the path property contains the proposed path to save the file. Defaults to false.

```javascript
"inMemory": true
```

WARNING: Uploading very large files, or relatively small files in large numbers very quickly, can cause your application to run out of memory when inMemory is set to true.

### mimetype
it's MIME type white list. The default value are:

* application/json: JavaScript Object Notation JSON; Defined in RFC 4627
* application/pdf: Portable Document Format, PDF has been in use for document exchange on the Internet since 1993; Defined in RFC 3778
* application/zip:  ZIP archive files; Registered
* application/gzip:  Gzip, Defined in RFC 6713
* application/vnd.ms-excel: Microsoft Excel files
* application/msword
* application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: Microsoft Excel 2007 files
* application/vnd.ms-powerpoint: Microsoft Powerpoint files
* application/vnd.openxmlformats-officedocument.presentationml.presentation: Microsoft Powerpoint 2007 files
* application/vnd.openxmlformats-officedocument.wordprocessingml.document: Microsoft Word 2007 files
* application/x-iwork-keynote-sffkey: keynote
* application/x-iwork-pages-sffpages: pages
* application/x-rar-compressed: com.rarlab.rar-archive
* application/x-zip-compressed: ZIP archive files; Registered
* application/x-zip: ZIP archive files; Registered
* application/x-omnigraffle
* application/octet-stream:
* audio/basic: μ-law audio at 8 kHz, 1 channel; Defined in RFC 2046
* audio/L24: 24bit Linear PCM audio at 8–48 kHz, 1-N channels; Defined in RFC 3190
* audio/mp4: MP4 audio
* audio/mpeg: MP3 or other MPEG audio; Defined in RFC 3003
* audio/ogg: Vorbis, Opus, Speex, Flac and other audio in an Ogg container; Defined in RFC 5334
* audio/flac: native Flac (Flac in its own container)
* audio/opus: Opus streamed audio
* audio/vorbis: Vorbis streamed audio; Defined in RFC 5215
* audio/vnd.rn-realaudio: RealAudio; Documented in RealPlayer Help[12]
* audio/vnd.wave: WAV audio; Defined in RFC 2361
* audio/webm: WebM open media format
* audio/example:example in documentation, Defined in RFC 4735
* image/bmp
* image/gif: GIF image; Defined in RFC 2045 and RFC 2046
* image/jpeg: JPEG JFIF image; Defined in RFC 2045 and RFC 2046
* image/pjpeg: JPEG JFIF image; Associated with Internet Explorer; Listed in ms775147(v=vs.85) - Progressive JPEG, initiated before global browser support for progressive JPEGs (Microsoft and Firefox).
* image/png: Portable Network Graphics; Registered,[13] Defined in RFC 2083
* image/svg+xml: SVG vector image; Defined in SVG Tiny 1.2 Specification Appendix M
* image/tiff: TIF image;
* image/vnd.djvu: DjVu image and multipage document format.[14]
* image/vnd.rn-realpix
* image/example: example in documentation, Defined in RFC 4735
* image/x-windows-bmp
* text/css: Cascading Style Sheets; Defined in RFC 2318
* text/csv: Comma-separated values; Defined in RFC 4180
* text/example: example in documentation, Defined in RFC 4735
* text/html: HTML; Defined in RFC 2854
* text/plain: Textual data; Defined in RFC 2046 and RFC 3676
* text/rtf: RTF; Defined by Paul Lindner
* text/xml: Extensible Markup Language; Defined in RFC 3023
* video/avi: Covers most Windows-compatible formats including .avi and .divx[17]
* video/example: example in documentation, Defined in RFC 4735
* video/mpeg: MPEG-1 video with multiplexed audio; Defined in RFC 2045 and RFC 2046
* video/mp4: MP4 video; Defined in RFC 4337
* video/ogg: Ogg Theora or other video (with audio); Defined in RFC 5334
* video/quicktime: QuickTime video; Registered[18]
* video/webm: WebM Matroska-based open media format
* video/x-matroska: Matroska open media format
* video/x-ms-wmv: Windows Media Video; Documented in Microsoft KB 288102
* video/x-flv: Flash video (FLV files)

If you want to override this list, set the mimetype parameter as below :
```javascript
        "mimetype": ["image/bmp", "application/zip", "application/octet-stream", "application/pdf"]
```

### scan
To implement scan actions after the upload (and prior to processing of the uploaded file on the server) you will need to set the 3 following parameters (baseSourceDir, baseTargetDir and action) :

* baseSourceDir: Fully qualified path to a directory where the uploaded file will be moved for processing the scan actions.
* baseTargetDir: Fully qualified path to a directory where the uploaded files will be moved after the scan actions. The BUILD server will assume that the uploaded file are safe (not infected by any virus) if :
  * the shell script returns no error code (0)
  * It finds the uploaded file in the baseTargetDir.



* action: Fully qualified path to a shell script that will be executed upon upload. Note: do not remove the parameters ${source_dir} ${target_dir} and ${files} that needs to be passed to your scan action shell script for processing :
The BUILD server will set the input parameters as :

```javascript
${source_dir} = baseSourceDir + ‘/’ + <a unique request GUID >
${target_dir} = baseTargetDir + ‘/’ + <a unique request GUID >
${files} = baseSourceDir + ‘/’ + <a unique request GUID > + ‘/’ + fileName1 + " " + baseSourceDir + ‘/’ + <a unique request GUID > + ‘/’ + fileName2 etc…
```

Note : It is the responsibility of the shell script to move the uploaded file to the target directory after correct processing (hence why the ${target_dir} is passed as an argument)
For example
```javascript
"fileUpload":{
    "scan": {
        "action" : "C:\\temp\\image\\scanTrue.bat ${source_dir} ${target_dir} ${files}",
        "baseSourceDir" : "C:\\temp\\image\\",
        "baseTargetDir": "C:\\temp\\image2\\",
    }
}
```
Full sample FileUpload section:
```javascript
"fileUpload":{
        "scan": {
            "action" : "C:\\temp\\Norman\\Action\\scanTrue.bat ${source_dir} ${target_dir} ${files}",
            "baseSourceDir" : "C:\\temp\\Norman\\Source\\",
            "baseTargetDir": "C:\\temp\\Norman\\Dest\\"
        },
        "limits": {
            "fields": 4,
            "fileSize": 0.5e7,
            "files": 2,
            "parts": 5
        },
        "dest": "C:\\temp\\Norman\\Upload\\",
        "mimetype": ["image/bmp", "application/zip", "application/octet-stream", "application/pdf"]
    }
```
