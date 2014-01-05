define([
	'underscore',
	'marionette',
	'vent',
	'config',
	'templates',
	'Three',
	'Sparks',
	'hammer',
	'hammer-jquery',
	'Three-EffectComposer',
	'Three-RenderPass',
	'Three-ShaderPass',
	'Three-MaskPass',
	'Three-BloomPass',
	'Three-FilmPass',
	'Three-CopyShader',
	'Three-FilmShader',
	'Three-FocusShader',
	'Three-HBlurShader',
	'Three-TBlurShader',
	'Three-VBlurShader'
], function(
	_,
	Marionette,
	vent,
	config,
	templates,
	THREE,
	SPARKS,
	Hammer
){
    var camera, scene, renderer, composer, vblur, hblur, effectFocus;
	var particleCloud, sparksEmitter;
	var datasetPos = -2000,
		datasetSpacing = 300;

	var DatasetItemView = Marionette.ItemView.extend({
		tagName: 'li',
		className: 'data-set',
		pos: 0,
		speed: 2,
		width: 0,
		template: _.template(templates.datasetItem),
		events: {
			'tap.pause': 'pause',
			'doubletap': 'addDataset',
            'dragstart': 'dragStart',
            'drag': 'onDrag',
            'dragend': 'dragEnd'
		},
		
		initialize: function(){
			_.bindAll(this, 'pause', 'resume', 'updatePos');
		},
		onDomRefresh: function(){
			//after view has been rendered
			this.pos = this.calcPos();
			this.width = this.$el.width();
            this.marginTop = -1*(this.width/2 + (Math.random() - 0.5)*24);
            this.height = this.$el.height();
            this.top = $("#dataset-list").height()/2;
			this.$el.css({
				'left': this.pos + 'px',
				'margin-top': this.marginTop + 'px'
			});
			
			var datasetName = this.model.get('datasetName');
			var datasetIcon = config.getIconByDataset(datasetName);
			this.$('a').css({
				'background': 'url("' + datasetIcon.path + '") no-repeat center'
			});
			
			this.updatePos();
			
			//enable touch
			this.$el.hammer();
		},
		calcPos: function(){
			datasetPos += datasetSpacing;
			return datasetPos;
		},
		updatePos: function(){
			var self = this;		
			self.pos > 2000? self.pos = -self.width : self.pos += self.speed;
			self.$el.css({'left':this.pos + 'px'});
			this.animation = requestAnimationFrame( this.updatePos );
		},
		pause: function(e){
			e.preventDefault();
			this.$el.off('.pause');
			this.$el.on('tap.resume', this.resume);
			cancelAnimationFrame(this.animation);
			this.$el.addClass('paused');
		},
		resume: function(e){
			e.preventDefault();
			this.$el.off('.resume');
			this.$el.on('tap.pause', this.pause);
			this.animation = requestAnimationFrame( this.updatePos );
			this.$el.removeClass('paused');
		},
		addDataset: function(e){
			e.preventDefault();
			vent.trigger('add:dataset', this.model);
		},
        dragStart: function(e){
            e.stopPropagation();
            console.log('dragstart');
            cancelAnimationFrame(this.animation);
        },
        onDrag: function(e){
            e.preventDefault();

            var pos = {};
            pos.x = e.gesture.touches[0].pageX;
            pos.y = e.gesture.touches[0].pageY;

            var left = pos.x - this.width/ 2,
                marginTop = (pos.y - this.top) + this.marginTop;
            this.pos = left;

            this.$el.css({
               'left': this.pos + 'px',
                'margin-top': marginTop + 'px'
            });
        },
        dragEnd: function(e){
            e.stopPropagation();
            console.log('dragend');
            this.animation = requestAnimationFrame( this.updatePos );
        }
		
	});
	
	var ConveyorView = Marionette.CompositeView.extend({
		className: 'conveyor-inner',
		template: _.template(templates.conveyor),
		itemView: DatasetItemView,
		itemViewContainer: '#dataset-list',
		
		onShow: function(){
			//CSS applied at this point
			//initialize webGL environment
			//init(this.$('#webgl'));
		},
	});
	
	//when config.systemDatasets becomes available, create ConveyorView instance and pass it to App
	vent.on('conveyor:add:datasets', function(){
		var conveyorView = new ConveyorView({
			collection: config.systemDatasets.get('datasets')
		});
		
		vent.trigger('app:show:conveyor', conveyorView);
	});
	
	//WebGL stuff
	function init($webglCanvas){
		var rendererW = $webglCanvas.width(),
			rendererH = $webglCanvas.height();
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			clearColor: 0xaaaaaa,
			clearAlpha: 1
		});
		renderer.setSize(rendererW, rendererH);
		renderer.setClearColor(0x000);
		$webglCanvas.append(renderer.domElement);
	
		scene = new THREE.Scene();
	
		camera = new THREE.PerspectiveCamera(45, rendererW/rendererH, 1, 10000);
		camera.position.set(0,0,40);
		camera.lookAt(scene.position);
		scene.add(camera);
	
		//particle stuff
		var particlesLength = 10000,
			particles = new THREE.Geometry();
		
		function newpos( x, y, z ) {
			return new THREE.Vector3( x, y, z );
		}
	
		var Pool = {
			__pools: [],
			// Get a new Vector
			get: function() {
				if ( this.__pools.length > 0 ) {
					return this.__pools.pop();
				}
				console.log( "pool ran out!" )
				return null;
			},
			// Release a vector back into the pool
			add: function( v ) {
				this.__pools.push( v );
			}
		};
	
		for ( i = 0; i < particlesLength; i ++ ) {
			particles.vertices.push( newpos( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY ) );
			Pool.add( i );
		}
	
		//use default particle material for now
		var pMaterial = new THREE.ParticleBasicMaterial({
			color: 0x66FFE2, //e8ff00
			size: 6,
			blending: THREE.AdditiveBlending,
			transparent: true
		});
	
		particleCloud = new THREE.ParticleSystem(particles, pMaterial);
		scene.add(particleCloud);
	
		//set up particle system
		var setTargetParticle = function() {
			var target = Pool.get();
			//values_size[ target ] = Math.random() * 200 + 100;
			return target;
		};
		var onParticleCreated = function( p ) {
			var position = p.position;
			p.target.position = position;

			var target = p.target;

			if ( target ) {
				particles.vertices[ target ] = p.position;
				//values_color[ target ].setHSL( hue, 0.6, 0.1 );
			};
		};
		var onParticleDead = function( particle ) {
			var target = particle.target;
			if ( target ) {
				// Hide the particle
				//values_color[ target ].setRGB( 0, 0, 0 );
				particles.vertices[ target ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );
				// Mark particle system as available by returning to pool
				Pool.add( particle.target );
			}
		};
		sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(500) );
		sparksEmitter.addInitializer( new SPARKS.Position( new SPARKS.LineZone( new THREE.Vector3(-170,-3,0), new THREE.Vector3(-170,3,0) ) ) );
		sparksEmitter.addInitializer( new SPARKS.Lifetime( 1, 20 ));
		sparksEmitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );
		sparksEmitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 25, 0, 0 ) ) ) );
	
		sparksEmitter.addAction( new SPARKS.Age(TWEEN.Easing.Linear.None) );
		sparksEmitter.addAction( new SPARKS.Accelerate( 0, 0, 0 ) );
		sparksEmitter.addAction( new SPARKS.Move() );
		sparksEmitter.addAction( new SPARKS.RandomDrift( 1, 2, 5 ) );
	
		sparksEmitter.addCallback( "created", onParticleCreated );
		sparksEmitter.addCallback( "dead", onParticleDead );
		sparksEmitter.start();
		
		//POST PROCESSING
		effectFocus = new THREE.ShaderPass( THREE.FocusShader );
		vblur = new THREE.ShaderPass( THREE.VerticalBlurShader );
		hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		vblur.uniforms['v'].value = 0.4/rendererH;
		hblur.uniforms['h'].value = 0.2/rendererW;
		effectFocus.uniforms[ 'sampleDistance' ].value = 0.99;
		effectFocus.uniforms[ 'waveFactor' ].value = 0.003;
		
		var renderScene = new THREE.RenderPass(scene, camera);
		
		composer = new THREE.EffectComposer( renderer );
		composer.addPass( renderScene );
		//composer.addPass( effectFocus );
		composer.addPass( hblur );
		vblur.renderToScreen = true; //need to set this for the last pass
		composer.addPass( vblur );
		//END OF POST PROCESSING
			
		animate();
	}
	function animate(){	
		render();
		requestAnimationFrame( animate );
	}
	function render(){
		particleCloud.geometry.verticesNeedUpdate = true;
		
		renderer.clear();
		composer.render(1);
	}	
	
	return ConveyorView;

});