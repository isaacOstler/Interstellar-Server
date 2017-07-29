/*

Three.js crap

*/

var scene = new THREE.Scene();
var width = $("#contentArea").width();
var height = $("#contentArea").height();
var aspect = width / height;
var camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer( { alpha: true } );
var geometry;
var innerShieldMaterials = [];
var outerShieldMaterials = [];
var innerShield;
var outerShield

init();

function init(){
	renderer.setSize( width, height );
	$("#contentArea").append( renderer.domElement );

	var row = 0;
	var column = 64;
	var requiredColumnAmount = column * 2;
	geometry = new THREE.SphereGeometry( 40, column, column);

	for(var i = 0;i < geometry.faces.length;i++){
		if(column == requiredColumnAmount){
			column = 0;
			row++;
		}
		column++;
		if(row < (64 / 3.5)){
			geometry.faces[i].materialIndex = 0;
		}else if(row < (64 / 3.5) * 2.5){
			for(var j = 0;j < 4;j++){
				matIndex = j + 1;
				var cap = Math.round((requiredColumnAmount / 4) * j);
				if(isOdd(cap)){
					cap--;
				}
				console.log(cap);
				if(column > cap){
					geometry.faces[i].materialIndex = matIndex;
				}
			}
		}else{
			geometry.faces[i].materialIndex = 5;
		}
	}
	geometry.colorsNeedUpdate = true;
	outerShieldMaterials = [];
	for(var i = 0;i < 6;i++){
		var newMat = new THREE.MeshBasicMaterial({
		    color: 0x00ffff, 
		    transparent: true,
		    opacity: 0.5
		});
		outerShieldMaterials.push(newMat);
	}
	innerShieldMaterials = [];
	for(var i = 0;i < 6;i++){
		var newMat = new THREE.MeshBasicMaterial({
		    color: 0x00ffff, 
		    transparent: true,
		    opacity: outerShieldMaterials[i].opacity,
		    side: THREE.BackSide
		});
		innerShieldMaterials.push(newMat);
	}

	var grid = new THREE.GridHelper(100, 20);
	scene.add(grid);

	innerShield = new THREE.Mesh( geometry, innerShieldMaterials );
	outerShield = new THREE.Mesh( geometry, outerShieldMaterials );
	innerShield.scale.set(.995,.995,.995);
	innerShield.rotation.set(0,0.78539816,0); //radians, not degrees... get's me every time
	outerShield.rotation.set(0,0.78539816,0); //radians, not degrees... get's me every time
	scene.add( innerShield );
	scene.add( outerShield );
	camera.position.set(100,10,0);
	//outerShield.scale.set(.8,.85,1);
	var loader = new THREE.TextureLoader();

	loader.load(
	// resource URL
	'/ship?file=3d/modelTexture.png',
	// Function when resource is loaded
	function ( texture ) {
		// do something with the texture
    	loader = new THREE.JSONLoader();
		loader.load('/ship?file=3d/model.JSON', function(geometry) {
	  		var material = new THREE.MeshPhongMaterial({map: texture, overdraw: 0.5});
	    	shipMesh = new THREE.Mesh(geometry, material);
		    //shipMesh.scale.set(3);
		    shipMesh.scale.set(7,7,7);
		    scene.add(shipMesh);
		});
	});
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.25 );
	scene.add( directionalLight );
	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
	scene.add(ambientLight);
	controls = new THREE.OrbitControls( camera, renderer.domElement );
}

function setShieldStrength(shields){
	for(var i = 0;i < shields.length;i++){
		outerShieldMaterials[i].opacity = shields[i] / 2;
		innerShieldMaterials[i].opacity = shields[i] / 2;
	}
}

var render = function () {

  requestAnimationFrame( render );
  renderer.render( scene, camera );
};

	render();
function isOdd(num) { return (num % 2) == 1;}

/*
	Not, Three.js crap
*/