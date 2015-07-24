'use strict';
var q = require('q');
var lodash = require('norman-server-tp').lodash;
var prototypeHelper = require('./prototypeHelper.js');
var navigationPropertyHelper = require('./navigationPropertyHelper.js');
var assetHelper = require('./assetHelper.js');

function updateData(dataContext) {
	dataContext.logger.debug('update data on sample data server - sampleDataId: ' + dataContext.sampleData._id + ' - entities: ' + JSON.stringify(dataContext.sampleData.entities));

    return prototypeHelper.updateSampleMetadata(dataContext);
}

exports.filterCalculatedProperty = function (sourceModel) {
	var model = {
		name: sourceModel.name,
		entities: []
	};
	var entity, sourceProperties;
	sourceModel.entities.forEach(function (sourceEntity) {
		if (sourceEntity.toObject) {
			entity = sourceEntity.toObject();
		}
		else {
			// this is used for unit test
			entity = sourceEntity;
		}

		sourceProperties = entity.properties;
		entity.properties = [];
		sourceProperties.forEach(function (property) {
			if (!property.calculated || !property.calculated.calculation || property.calculated.calculation === '[]') {
				entity.properties.push(property);
			}
		});
		model.entities.push(entity);
	});

	return model;
};

exports.create = function (context) {
	return context;
};

exports.getEntityData = function (context) {
	var deffered = q.defer();
	if (context && context.entity && context.entity.name && context.model) {
		prototypeHelper.getSampleData(context)
			.then(function (dataContext) {
				dataContext.logger.debug('getEntityData - sample data id : ' + context.sampleData._id.toString() + ' - data: ' + JSON.stringify(context.sampleData.entities));

				var data = {entities: []};
				context.sampleData.entities.some(function (entity) {
					if (entity.entityName.toLowerCase() === context.entity.name.toLocaleLowerCase()) {
						data.entities.push(entity);
						return true;
					}
				});

				dataContext.data = data;
				deffered.resolve(dataContext);
			}).catch(deffered.reject);
	}
	else {
		context.logger.debug('getEntityData - sample data id : null');
		deffered.resolve(context);
	}

	return deffered.promise;
};

exports.incrementData = function (context) {
	var data = [], oResult;

	if (context.entityData) {
		Object.keys(context.entityData).forEach(function (key) {
			var element = {
				entityName: context.entityNameMap[key].name,
				properties: context.entityData[key]
			};

			if (context.propertyNameMap && context.propertyNameMap[key]) {
				Object.keys(context.propertyNameMap[key]).forEach(function (originalName) {
					var newPropertyName = context.propertyNameMap[key][originalName];
					element.properties.forEach(function (row) {
						row[newPropertyName] = row[originalName];
						delete row[originalName];
					});
				});
			}

			data.push(element);
		});

		oResult = exports.getData(context)
			.then(assetHelper.getAssets)
			.then(function (dataContext) {
				dataContext.sampleData.entities = dataContext.sampleData.entities.concat(data);
				return updateData(dataContext);
			});
	}
	else {
		oResult = q(context);
	}
	return oResult;
};

exports.getData = function (context) {
	return prototypeHelper.getSampleData(context);
};

function _replaceData(sampleData, entityName, data) {
	var name = entityName.toLowerCase(),
		oOldEntity = lodash.find(sampleData.entities, function (entity) {
			return entity.entityName.toLowerCase() === name;
		});

	// smart update: we look for the entity to update and we update as much as we can
	if (oOldEntity) {

		// merge all the old data values that wouldn't exist inside the new data
		if (oOldEntity.properties.length > 0) {
			data.forEach(function (oNewDataRow) {

				// id shall match
				var oOldRow = lodash.find(oOldEntity.properties, {ID: oNewDataRow.ID});
				if (oOldRow) {
					for (var sPropertyName in oOldRow) {
						// copy back holes for foreign keys
						if (oNewDataRow[sPropertyName] === undefined && navigationPropertyHelper.isForeignKey(sPropertyName)) {
							oNewDataRow[sPropertyName] = oOldRow[sPropertyName];
						}
					}
				}
			});
		}

		sampleData.entities = lodash.filter(sampleData.entities, function (entity) {
			return entity.entityName.toLowerCase() !== name;
		});
	}

	sampleData.entities.push({entityName: entityName, properties: data});
}

exports.add = function (context) {
	return exports.getData(context)
		.then(assetHelper.getAssets)
		.then(function (dataContext) {
			_replaceData(dataContext.sampleData, dataContext.entity.name, dataContext.data);

			return updateData(dataContext);
		});
};

exports.mergeData = function (context) {
	var promise = null;
	if (context.replaceData) {
		promise = exports.getData(context)
			.then(assetHelper.getAssets)
			.then(function (dataContext) {
				context.replaceData.forEach(function (replaceData) {
					_replaceData(dataContext.sampleData, replaceData.entityName, replaceData.properties);
				});

				return updateData(dataContext);
			});
	}
	else {
		promise = q(context);
	}

	return promise;
};

