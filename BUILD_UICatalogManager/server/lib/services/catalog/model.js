'use strict';

var commonServer = require('norman-common-server'),
    mongoose = commonServer.db.mongoose;

/**
 * Catalog Schema
 */
var Catalog = mongoose.createSchema('uicatalog', {
    catalogVersion: {
        type: String
    },
    catalogName: {
        type: String
    },
    description: String,
    catalogLang: String,
    libraryVersion: String,
    isArtifactAttached: Boolean,
    libraryURL: String,
    libraryPublicURL: String,
    mashupControls: {},
    displayName: String,
    isRootCatalog: Boolean,
    rootCatalogId: mongoose.Schema.Types.ObjectId,
    isDefault: Boolean,
    controls: {},
    floorPlans: {},
    actions: {}
});
Catalog.set('autoIndex', false);
Catalog.index({
    catalogVersion: 1,
    catalogName: 1
}, {
    unique: true
});


// Catalog.virtual('catalogId').get(function() {
//     return this._id.toHexString();
// });

// Catalog.set('toJSON', {
//     virtuals: true
// });
// Catalog.set('toObject', {
//     virtuals: true
// });
// Catalog.options.toJSON.transform = function(doc, ret, options) {
//     // remove the _id of every document before returning the result
//     ret.id = ret._id;
//     delete ret._id;
//     delete ret.__v;
// };
// Catalog.options.toObject = {
//     transform: function(doc, ret, options) {
//         ret.catalogId = ret._id;
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//     }
// }
module.exports = mongoose.createModel('UICatalog', Catalog);
