node-sap-upload
===============

SAP file upload component

Further Information
======================

*node-sap-upload* is part of [BUILD](https://github.com/SAP/BUILD).


### Configuration  file

You can configure the file upload in Nomran/server/config.json. You can add the section fileUpload

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
dest: './uploads/'
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
limits: {
  fieldNameSize: 100,
  files: 2,
  fields: 5
}
```

Specifying the limits can help protect your site against denial of service (DoS) attacks.

### includeEmptyFields
A Boolean value to specify whether empty submitted values should be processed and applied to req.body; defaults to false;

```javascript
includeEmptyFields: true
```

### inMemory
If this Boolean value is true, the file.buffer property holds the data in-memory that Multer would have written to disk. The dest option is still populated and the path property contains the proposed path to save the file. Defaults to false.

```javascript
inMemory: true
```

WARNING: Uploading very large files, or relatively small files in large numbers very quickly, can cause your application to run out of memory when inMemory is set to true.

### mimetype
it's MIME type white list. The default value are:

* application/json: JavaScript Object Notation JSON; Defined in RFC 4627
* application/pdf: Portable Document Format, PDF has been in use for document exchange on the Internet since 1993; Defined in RFC 3778
* application/zip:  ZIP archive files; Registered
* application/gzip:  Gzip, Defined in RFC 6713
* application/vnd.ms-excel: Microsoft Excel files
* application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: Microsoft Excel 2007 files
* application/vnd.ms-powerpoint: Microsoft Powerpoint files
* application/vnd.openxmlformats-officedocument.presentationml.presentation: Microsoft Powerpoint 2007 files
* application/vnd.openxmlformats-officedocument.wordprocessingml.document: Microsoft Word 2007 files
* application/x-iwork-keynote-sffkey: keynote
* application/x-iwork-pages-sffpages: pages
* application/x-rar-compressed: com.rarlab.rar-archive
* application/x-zip-compressed: ZIP archive files; Registered
* application/x-zip: ZIP archive files; Registered
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
* image/gif: GIF image; Defined in RFC 2045 and RFC 2046
* image/jpeg: JPEG JFIF image; Defined in RFC 2045 and RFC 2046
* image/pjpeg: JPEG JFIF image; Associated with Internet Explorer; Listed in ms775147(v=vs.85) - Progressive JPEG, initiated before global browser support for progressive JPEGs (Microsoft and Firefox).
* image/png: Portable Network Graphics; Registered,[13] Defined in RFC 2083
* image/svg+xml: SVG vector image; Defined in SVG Tiny 1.2 Specification Appendix M
* image/tiff: TIF image;
* image/vnd.djvu: DjVu image and multipage document format.[14]
* image/example: example in documentation, Defined in RFC 4735
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


### scan

TBD

* action: TBD
* baseSourceDir: TBD
* baseTargetDir: TBD

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

