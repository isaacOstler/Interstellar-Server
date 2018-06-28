//copyright, isaac ostler, June 18th 2018
//adapted from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj.html
//credit to mrdoop

//
// Use this widget to create an interactive 3d display
// for models of your choice.  Just pass
// an .obj and texture file and you're golden
//

//*** This widget requires JQuery!  IMPORTANT!  IMPORATANT!   IMPORATANT!    IMPORATANT!  
//*** This widget requires Three.js!  IMPORTANT!  IMPORATANT!   IMPORATANT!    IMPORATANT!  
//*** This widget requires Three.js addon "js/loaders/OBJLoader.js"!  IMPORTANT!  IMPORATANT!   IMPORATANT!    IMPORATANT!  

// CLASS NAME: ThreeDisplay
// PURPOSE: to display a 3d model in an interactive enviroment
// TAKES:
//			HTML Div - The div you want to use

var ThreeDisplay = function(passedDiv){
	//public functions
	this.setModelAndTexture = function(newModel,newTexture){
		loadNewModel(newModel,newTexture);
	}

	//DOM references

	//variables
	var displayedObject = null;

	//init calls

	//preset observers

	//database observers

	//functions

	function loadNewModel(model,texture){
		// texture
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};
		var textureLoader = new THREE.TextureLoader( manager );
		var texture = textureLoader.load(texture);
		// model
		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};
		var onError = function ( xhr ) {
			console.error(xhr);
		};
		var loader = new THREE.OBJLoader( manager );
		loader.load(model, function ( object ) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material.map = texture;
				}
			} );
			object.position.y = 0;
			if(displayedObject != null){
				scene.remove( displayedObject );
			}
			displayedObject = object;
			scene.add( displayedObject );
		}, onProgress, onError );
	}

	//event handlers

	//intervals

	var isDragging = false;
	var container;
	var camera, scene, renderer;
	var mouseX = 0, mouseY = 0;
	var windowHalfX = passedDiv.width() / 2;
	var windowHalfY = passedDiv.height() / 2;

	init();
	animate();

	function init() {
		container = passedDiv;
		camera = new THREE.PerspectiveCamera( 45, container.width() / container.height(), .1, 2000 );
		camera.position.z = 150;
		// scene
		scene = new THREE.Scene();
		var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.2 );
		scene.add( ambientLight );
		var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
		camera.add( pointLight );
		scene.add( camera );
		
		//loadNewModel("/resource?path=public/3d_models/fighter/model.obj","/resource?path=public/3d_models/fighter/texture.png");
		//
		renderer = new THREE.WebGLRenderer({alpha: true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( $(container).width(), $(container).height() );
		container.append( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );

		controls = new THREE.OrbitControls( camera, renderer.domElement );
    	controls.autoRotate = true;

	}
	function onWindowResize() {
		windowHalfX = container.width() / 2;
		windowHalfY = container.height() / 2;
		camera.aspect = container.width() / container.height();
		camera.updateProjectionMatrix();
		renderer.setSize( container.width(), container.height() );
	}
	function onMouseMove( event ) {
		if(isDragging){
			mouseX = ( event.offsetX - windowHalfX ) / 2;
			mouseY = ( event.offsetY - windowHalfY ) / 2;
		}
	}
	//
	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		if(displayedObject != null){
			camera.lookAt( displayedObject );
		}
		render();
	}
	function render() {
		camera.lookAt( scene.position );
		renderer.render( scene, camera );
	}
}