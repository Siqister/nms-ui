require.config({
    paths: {
        'jquery': 'app/libs/jquery-amd/jquery',  // amd version
        'underscore': 'app/libs/underscore-amd/underscore', // amd version
        'underscoreM': 'app/libs/underscore-amd/underscore-mustache',  // templating supporting mustache style {{ ... }}
        'backbone': 'app/libs/backbone-amd/backbone', // amd version
        'backbone.wreqr': 'app/libs/backbone-amd/backbone.wreqr', // amd version
        'backbone.eventbinder': 'app/libs/backbone-amd/backbone.eventbinder', // amd version
        'backbone.babysitter': 'app/libs/backbone-amd/backbone.babysitter', // amd version
        'backbone-validation': 'app/libs/backbone-validation/backbone-validation-amd',
        'backbone-validation-bootstrap': 'app/libs/backbone-validation/backbone-validation-bootstrap',
        'marionette': 'app/libs/backbone-amd/backbone.marionette',  // amd version

        'jquery-ui': 'app/libs/jquery-ui/ui/jquery-ui',
        'jquery-ui-autocomplete': 'app/libs/jquery-ui/ui/jquery.ui.autocomplete',
        'jquery-menu-aim': 'app/libs/jquery-menu-aim/jquery.menu-aim',
        'jquery-serialize-object': 'app/libs/jquery-serialize-object/jquery.serialize-object',
        'jquery-deparam': 'app/libs/jquery-deparam/jquery-deparam',
        'jquery-scroll': 'app/libs/jquery-scroll/jquery.tinyscrollbar.min',
        'bootstrap-modal': 'app/libs/bootstrap/bootstrap-modal',
        'bootstrap-tooltip': 'app/libs/bootstrap/bootstrap-tooltip',
        'bootstrap-popover': 'app/libs/bootstrap/bootstrap-popover',
        'bootstrap-dropdown': 'app/libs/bootstrap/bootstrap-dropdown',
        'colorpicker':'app/libs/bootstrap-colorpicker/js/bootstrap-colorpicker',

        'd3': 'app/libs/d3/d3',
        'moment': 'app/libs/moment/moment',

        'dataTables': 'app/libs/DataTables/jquery.dataTables',
        'atmosphere': 'app/libs/atmosphere/jquery.atmosphere',
        'text': 'app/libs/requirejs-text/text',
        'config': 'app/config',
        'vent': 'app/vent',
        'templates': 'app/templates',
        'ui': 'app/ui',
        'util': 'app/util',
        
        'Three': 'app/libs/Three/three.min',
        'Tween': 'app/libs/Tween/Tween',
        'Sparks': 'app/libs/Three/Sparks',
        'Three-EffectComposer': 'app/libs/Three/postprocessing/EffectComposer',
        'Three-RenderPass': 'app/libs/Three/postprocessing/RenderPass',
        'Three-ShaderPass': 'app/libs/Three/postprocessing/ShaderPass',
        'Three-MaskPass': 'app/libs/Three/postprocessing/MaskPass',
        'Three-BloomPass': 'app/libs/Three/postprocessing/BloomPass',
        'Three-FilmPass': 'app/libs/Three/postprocessing/FilmPass',
        'Three-CopyShader': 'app/libs/Three/shaders/CopyShader',
        'Three-FilmShader': 'app/libs/Three/shaders/FilmShader',
        'Three-FocusShader': 'app/libs/Three/shaders/FocusShader',
        'Three-HBlurShader': 'app/libs/Three/shaders/HorizontalBlurShader',
        'Three-TBlurShader': 'app/libs/Three/shaders/TriangleBlurShader',
        'Three-VBlurShader': 'app/libs/Three/shaders/VerticalBlurShader',
        
        'hammer': 'app/libs/hammer/hammer', //AMD compatible
        'hammer-jquery': 'app/libs/hammer/jquery.hammer', //AMD compatible
        'hammer-showtouches': 'app/libs/hammer/hammer.showtouches', //non-AMD
        'caress': 'app/libs/caress/caress-0.1.0', //prerequisite for TUIO input
        'socket.io': 'app/libs/socket.io/socket.io-0.9.10.min' //prerequisite for TUIO input
        
        //MISSING
        //'Cesium'

    },

    shim: {
        'd3' : {
            exports: 'd3'
        },
        'ol' : {
            exports: 'ol'
        },
        'Three' : {
        	exports: 'THREE'
        },
        'Tween' : {
        	exports: 'TWEEN'
        },
        'Sparks' : {
        	deps: ['Three','Tween'],
        	exports: 'SPARKS'
        },
        'hammer-showtouches' : {
            deps: ['hammer', 'hammer-jquery'],
            exports: 'Hammer.plugins.showTouches'
        },
        'Three-EffectComposer': ['Three'],
        'Three-RenderPass': ['Three'],
        'Three-ShaderPass': ['Three'],
        'Three-MaskPass': ['Three'],
        'Three-BloomPass': ['Three'],
        'Three-FilmPass': ['Three'],
        'Three-CopyShader': ['Three'],
        'Three-FilmShader': ['Three'],
        'Three-FocusShader': ['Three'],
        'Three-HBlurShader': ['Three'],
        'Three-TBlurShader': ['Three'],
        'Three-VBlurShader': ['Three'],
        'socket.io' : {
        	exports: 'io'
        },
        'jquery-ui': ['jquery'],
        'jquery-ui-autocomplete': ['jquery-ui'],
        'jquery-serialize-object': ['jquery'],
        'jquery-menu-aim': ['jquery'],
        'jquery-scroll': ['jquery'],
        'jquery-deparam': ['jquery'],
        'bootstrap-modal': ['jquery'],
        'bootstrap-tooltip': ['jquery'],
        'bootstrap-dropdown': ['jquery'],
        'colorpicker': ['jquery'],
        'backbone-validation-bootstrap': ['backbone', 'backbone-validation'],
        'bootstrap-popover': ['jquery', 'bootstrap-tooltip'],
        'dataTables': ['jquery'],
        'atmosphere': ['jquery']
    },
    // Cache busting for development
    urlArgs: "_=" +  (new Date()).getTime()
});

require([
		'app/app',
		'opFlow/opFlowController',
		'hammer',
		'caress',
		'socket.io',
		'hammer-jquery',
        'hammer-showtouches'
    ], function(
    	App,
    	opFlowController,
    	Hammer,
    	Caress,
    	io
    ){
	console.log('Hello world');

    //TODO: for development, to be removed
    Hammer.plugins.showTouches();

	//TODO: remove this in the final release
	window.client = new Caress.Client({
		host: 'localhost',
		port: 5000
	});
	
	//start listening for TUIO events emitted by Caress server
	client.connect();
		
	App.start({
		opFlowController: opFlowController
	});
});

