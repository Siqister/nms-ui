define([
	'underscore',
	'marionette',
	'vent',
	'config',
	'templates',
	'hammer',
	'hammer-jquery',
], function(
	_,
	Marionette,
	vent,
	config,
	templates,
	Hammer
){	
	var NavView = Marionette.ItemView.extend({
		template: _.template(templates.nav)
	});
		
	return NavView;

});