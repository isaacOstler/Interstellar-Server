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
	var column = 32;
	var requiredColumnAmount = column * 2;
	geometry = new THREE.SphereGeometry( 40, column, column);

	for(var i = 0;i < geometry.faces.length;i++){
		if(column == requiredColumnAmount){
			column = 0;
			row++;
		}
		column++;
		if(row < (32 / 3.5)){
			geometry.faces[i].materialIndex = 0;
		}else if(row < (32 / 3.5) * 2.5){
			for(var j = 0;j < 4;j++){
				matIndex = j + 1;
				var cap = Math.round((requiredColumnAmount / 4) * j);
				if(isOdd(cap)){
					cap--;
				}
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
	//scene.add(grid);

	innerShield = new THREE.Mesh( geometry, new THREE.MultiMaterial(innerShieldMaterials) );
	outerShield = new THREE.Mesh( geometry, new THREE.MultiMaterial(outerShieldMaterials) );
	innerShield.scale.set(.995,.995,.995);
	innerShield.rotation.set(0,0.78539816,0); //radians, not degrees... get's me every time
	outerShield.rotation.set(0,0.78539816,0); //radians, not degrees... get's me every time
	scene.add( innerShield );
	scene.add( outerShield );
	camera.position.set(100,10,0);
	outerShield.scale.set(1,.7,1);
	innerShield.scale.set(1,.7,1);
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
		outerShieldMaterials[i].color.set(changeHue("#00b7ff",-(260 - (260 * shields[i]))));
		innerShieldMaterials[i].color.set(changeHue("#00b7ff",-(260 - (260 * shields[i]))));
	}
}

var render = function () {

  requestAnimationFrame( render );
  renderer.render( scene, camera );
};

	render();
function isOdd(num) { return (num % 2) == 1;}

function changeHue(rgb, degree) {
    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string and returns an object
function rgbToHSL(rgb) {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(rgb.length == 3){
        rgb = rgb.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(rgb.substr(0, 2), 16) / 255,
        g = parseInt(rgb.substr(2, 2), 16) / 255,
        b = parseInt(rgb.substr(4, 2), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return rgbToHex(r,g,b);
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/*
	Not, Three.js crap
*/

//variables
var shields;

//database observers
Interstellar.onDatabaseValueChange("shields.strength",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("shields.strength",{"ventral" : 1,"dorsal" : 1,"forward" : 1,"aft" : 1,"port" : 1,"starboard" : 1});
		return;
	}
	shields = newData;
	setShieldStrength([shields.dorsal,shields.forward,shields.port,shields.aft,shields.starboard,shields.ventral]);
});