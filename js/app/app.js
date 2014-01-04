define([
	'backbone',
	'underscore',
	'marionette',
	'vent',
	'ui',
	'app/views/conveyorView',
	'app/views/navView',
    'app/models/user',
    'config'
	], function(
	Backbone,
	_,
	Marionette,
	vent,
	ui,
	ConveyorView,
	NavView,
    UserModel,
    config
){
		
	var app = new Marionette.Application();

    var loginModel = new UserModel.Login({
        'username':'siqi',
        'password':'siqi',
    });

    //add regions
	//regions correspond to IDs in index.html
	app.addRegions({
		conveyor: '#conveyor',
		dataManager: '#data-manager',
		vizGallery: '#viz-gallery',
		nav: '#nav'
	});
	
	//add initializer on .start()
	app.addInitializer(function(options){
		Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateID){
			//Change Marionette.View.Template so that
			//instead of reading from templateID
			//it reads the full text
			var template = templateID;
			
            // Make sure we have a template before trying to
            // compile it
            if (!template || template.length === 0) {
                var msg = "Could not find template: '" + templateId + "'";
                var err = new Error(msg);
                err.name = "NoTemplateError";
                throw err;
            }
			
			return template;
		};
		
		//adding opFlowController
		new options.opFlowController.Router({
			controller: options.opFlowController 
		});		
		
		//load the data conveyor belt
		vent.trigger('app:show:nav', new NavView());

        $.ajaxSetup({
            xhrFields : {"withCredentials":true},
            crossDomain: true,
            statusCode: {
                // User is not login yet
                401: function(){
                    // Trigger signal to show login screen
                    //console.log("Error 401. Please login First");
                    alert("Error 401. User authentication is required.");
                    //vent.trigger("app.show.startup");
                },
                // Access denied
                403: function() {
                    console.log("Error 403. Access denied.");
                    //alert("Error 403. Access Denied. You are not allowed to access this page.");
                    vent.trigger("app.show.startup");
                }
            }
        });

       //log in to obtain access to the backend API
       loginModel.save();
	});
		
	//Marionette application events
	app.on('initialize:after', function(){
		Backbone.history.start({
			pushState:true
		});
		console.log('initialize:after');
	});
	
	//Inter-module events
	vent.on('app:show:conveyor', function(appView){
		app.conveyor.show(appView);
	});
	vent.on('app:show:opFlow', function(appView){
		app.dataManager.show(appView);
	});
	vent.on('app:show:nav', function(appView){
		app.nav.show(appView);
	});
	
	return app;
});