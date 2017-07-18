//variables
var renderer,
camera,
scene,
sphereContainer,
falseContainer,
alertStatus = 5,
shipMesh = null;
//DOM references
var container = $("#container");
//init calls
init();

//functions
function init(){
	// Set the scene size.
	const WIDTH = container.width();
	const HEIGHT = container.height();

	// Set some camera attributes.
	const VIEW_ANGLE = 45;
	const ASPECT = WIDTH / HEIGHT;
	const NEAR = 0.1;
	const FAR = 10000;

	// Create a WebGL renderer, camera
	// and a scene

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setClearColor( 0xffffff, 0);
	camera =
	new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR
	);

	scene = new THREE.Scene();

	// Add the camera to the scene.
	scene.add(camera);

	// Start the renderer.
	renderer.setSize(WIDTH, HEIGHT);

	// Attach the renderer-supplied
	// DOM element.
	container.append(renderer.domElement);


	// Set up the sphere vars
	var RADIUS = 1500;
	var SEGMENTS = 64;
	var RINGS = 64;

	// Create a new mesh with
	// sphere geometry - we will cover
	// the sphereMaterial next!


	const falseSphereMaterial =
	new THREE.MeshBasicMaterial(
	{
		wireframe : true,
		transparent : true,
		opacity : .01
	});
	falseContainer = new THREE.Mesh(
		new THREE.SphereGeometry(
			RADIUS,
			SEGMENTS,
			RINGS),

		falseSphereMaterial);

	RADIUS = .1;
	SEGMENTS = 0;
	RINGS = 0;
	const sphereMaterial =
	new THREE.MeshBasicMaterial(
	{
		wireframe : false,
		transparent : true
	});

	sphereContainer = new THREE.Mesh(
		new THREE.SphereGeometry(
			RADIUS,
			SEGMENTS,
			RINGS),

		sphereMaterial);

	// Move the Sphere back in Z so we
	// can see it.
	scene.add(sphereContainer);
	sphereContainer.add(falseContainer);
	// create a point light
	const pointLight =
	new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add to the scene
	scene.add(pointLight);

	// Schedule the first frame.
	camera.position.set(0,0,4050);
	requestAnimationFrame(update);
	var mat = new THREE.MeshBasicMaterial();
	var geo = new THREE.SphereGeometry(3,1,1);
	var i = 0;
	for(i = 0;i < 3000;i++){
		var sphere = new THREE.Mesh(geo,mat);
		var randomCords = randomSpherePoint(0,0,0,(Math.random() * 500) + 1000);
		sphere.position.set(randomCords[0],randomCords[1],randomCords[2]);
		sphereContainer.add(sphere);
	}

	var loader = new THREE.TextureLoader();

	loader.load(
	// resource URL
	'/ship?file=3d/modelTexture.png',
	// Function when resource is loaded
	function ( texture ) {
		// do something with the texture
    	loader = new THREE.JSONLoader();
		loader.load('/ship?file=3d/model.JSON', function(geometry) {
	  		var material = new THREE.MeshPhongMaterial({map: texture, overdraw: 1});
	    	shipMesh = new THREE.Mesh(geometry, material);
		    //shipMesh.scale.set(3);
		    sphereContainer.add(shipMesh);
		});
	});
}
var velocity = 30;
var zoomIn = true;
var revolution = 0;

var thrusters = {
	"yaw" : 0,
	"pitch" : 0,
	"roll" : 0
}
function update () {
	if(shipMesh != null){
		shipMesh.rotation.set(0,0,0)
		shipMesh.rotateOnAxis(new THREE.Vector3(1,0,0),thrusters.pitch); 
		shipMesh.rotateOnAxis(new THREE.Vector3(0,1,0),thrusters.yaw);
		shipMesh.rotateOnAxis(new THREE.Vector3(0,0,1),thrusters.roll);
	}
	if(zoomIn){
		if(camera.position.z > 2){
			if(camera.position.z < 480){
				velocity--;
			}
			if(velocity < 0){
				velocity = 0;
			}else{
				camera.position.z -= velocity;
			}
		}
		if(sphereContainer.rotation.z > 0){
			//falseContainer.rotation.z -= .002;
			sphereContainer.rotation.z = sphereContainer.rotation.z * .99;
		}
		if(sphereContainer.rotation.y > 0){
			//falseContainer.rotation.y -= .002;
			sphereContainer.rotation.y = sphereContainer.rotation.y * .99;
		}
	}else{
		sphereContainer.rotation.x += .001;
		sphereContainer.rotation.y += .001;
	}
  // Draw!
  renderer.render(scene, camera);

  // Schedule the next frame.
  requestAnimationFrame(update);
}
function randomSpherePoint(x0,y0,z0,radius){
	var u = Math.random();
	var v = Math.random();
	var theta = 2 * Math.PI * u;
	var phi = Math.acos(2 * v - 1);
	var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
	var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
	var z = z0 + (radius * Math.cos(phi));
	return [x,y,z];
}

function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians){
    return radians * (180 / Math.PI);
}