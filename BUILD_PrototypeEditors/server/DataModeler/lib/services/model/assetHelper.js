'use strict';

exports.getAssets = function (context) {
    return context.assetService.getAssets(context.projectId, undefined, false)
        .then(function (assets) {
            context.assets = {};

            assets.forEach(function (asset) {
                context.assets['assets/' + asset.filename] = asset._id.toString();
            });

            return context;
        });
};
