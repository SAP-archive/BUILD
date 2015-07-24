'use strict';
/*global Promise:true*/
var _ = require('norman-server-tp').lodash;
var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var handlebars = require('node-handlebars');
var mailer = commonServer.Mailer;

var mailOptions = {
	from: mailer.sender
};

/**
 *  mixin to extend lodash to load email template,
 *  render with data and return the full completed html email
 */
_.mixin({
	asyncRenderEmail: function (template_name, template_data) {
		var promise;
		var hbs = handlebars.create({
			partialsDir: __dirname
		});

		promise = new Promise(function (resolve, reject) {
			hbs.engine(template_name, template_data, function (err, html) {
				if (err) {
					reject(err);
				}
				resolve(html);
			});
		});
		return promise;
	}
});
var mailUtility = {
	asyncRenderEmail: _.asyncRenderEmail,
	mailOptions: mailOptions
};

module.exports = mailUtility;
