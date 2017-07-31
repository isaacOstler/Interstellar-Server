/*

Three.js crap

*/

var scene = new THREE.Scene();
var width = $("#shield3DCanvas").width();
var height = $("#shield3DCanvas").height();
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
	$("#shield3DCanvas").append( renderer.domElement );

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
		    opacity: 0
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

	var grid = new THREE.GridHelper(40, 20);
	scene.add(grid);

	innerShield = new THREE.Mesh( geometry, new THREE.MultiMaterial(innerShieldMaterials) );
	outerShield = new THREE.Mesh( geometry, new THREE.MultiMaterial(outerShieldMaterials) );
	innerShield.scale.set(.995,.995,.995);
	innerShield.rotation.set(0,0.78539816,0); //radians, not degrees... get's me every time
	outerShield.rotation.set(0,0.78539816,0); //radians, not degrees... get's me every time
	scene.add( innerShield );
	scene.add( outerShield );
	camera.position.set(72,40,40);
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
	  		var material = new THREE.MeshPhongMaterial({map: texture});
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

function updateShieldStrength(){
    if(shields == undefined || actualShields == undefined){
        return;
    }
    for(var i = 0;i < shields.length;i++){
        var shieldStrength = shields[i].strength;
        if(!shields[i].isRaised){
            shieldStrength = 0;
        }
        if(shipSystems != undefined){
            for(var j = 0;j < shipSystems.length;j++){
                if(shipSystems[j].systemName.toLowerCase().includes(shields[i].name.toLowerCase()) && shipSystems[j].systemName.toLowerCase().includes("shields")){
                    if(shipSystems[j].requiredPower[0] > shipSystems[j].systemPower){
                        shieldStrength = 0;
                    }
                }
            }
        }
        if(shieldStrength != actualShields[i].strength){
            if(shieldStrength < actualShields[i].strength){
                actualShields[i].strength -= .01;
            }else{
                actualShields[i].strength += .01;
            }
        }
    }
	for(var i = 0;i < shields.length;i++){
		outerShieldMaterials[i].opacity = actualShields[i].strength / 2;
		innerShieldMaterials[i].opacity = actualShields[i].strength / 2;
		outerShieldMaterials[i].color.set(changeHue("#00b7ff",-(260 - (260 * actualShields[i].strength))));
		innerShieldMaterials[i].color.set(changeHue("#00b7ff",-(260 - (260 * actualShields[i].strength))));
	}
}

var render = function () {
    updateShieldStrength();
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
var shields =
[
    {
        "name" : "DORSAL",
        "strength" : 1,
        "isRaised" : false
    },{
        "name" : "FORWARD",
        "strength" : 1,
        "isRaised" : false
    },{
        "name" : "PORT",
        "strength" : 1,
        "isRaised" : false
    },{
        "name" : "AFT",
        "strength" : 1,
        "isRaised" : false
    },{
        "name" : "STARBOARD",
        "strength" : 1,
        "isRaised" : false
    },{
        "name" : "VENTRAL",
        "strength" : 1,
        "isRaised" : false
    }
],
actualShields = [
    {
        "name" : "DORSAL",
        "strength" : 0,
        "isRaised" : false
    },{
        "name" : "FORWARD",
        "strength" : 0,
        "isRaised" : false
    },{
        "name" : "PORT",
        "strength" : 0,
        "isRaised" : false
    },{
        "name" : "AFT",
        "strength" : 0,
        "isRaised" : false
    },{
        "name" : "STARBOARD",
        "strength" : 0,
        "isRaised" : false
    },{
        "name" : "VENTRAL",
        "strength" : 0,
        "isRaised" : false
    }
],
shipSystems = [],
arrowTimeIntervals = {
    "lowTime" : undefined,
    "midTime" : undefined,
    "highTime" : undefined,
    "clock" : undefined
},
frequency = 150.2;

//DOM References
var shieldInfoContainer = $("#shieldInfoContainer"),
    individualShieldsContainer = $("#shieldInfoContainer_individualShieldsContainer"),
    allShieldsContainer = $("#shieldInfoContainer_allShieldsContainer"),
    averageShieldStrengthLabel = $("#shieldInfoContainer_allShieldsContainer_allShieldStrength_value"),
    raiseAllShieldsButton = $("#raiseAllShieldsButton"),
    lowerAllShieldsButton = $("#lowerAllShieldsButton"),
    frequencyTextbox = $("#shieldInfoContainer_allShieldsContainer_shieldFrequency_textbox");

//database observers
Interstellar.onDatabaseValueChange("shields.frequency",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("shields.frequency",frequency);
        return;
    }
    frequency = newData;
    frequencyTextbox.val(frequency.toFixed(1) + "MHz");
});
Interstellar.onDatabaseValueChange("ship.systems",function(newData){
    if(newData == null){
        //DO NOT DEFINE THIS HERE!  JAMES!  STOP TOUCHING MY CODE!
        return;
    }
    shipSystems = newData;
    drawGUI();
    return;
});
Interstellar.onDatabaseValueChange("shields.strength",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("shields.strength",shields);
		return;
	}
	shields = newData;
    drawGUI();
});

//functions
function drawGUI(){
    var html = "";
    for(var i = 0;i < shields.length;i++){
        var status = "RAISE";
        if(shields[i].isRaised){
            status = "LOWER";
        }
        var hasEnoughPower = true;
        if(shipSystems != undefined){
            for(var j = 0;j < shipSystems.length;j++){
                if(shipSystems[j].systemName.toLowerCase().includes(shields[i].name.toLowerCase()) && shipSystems[j].systemName.toLowerCase().includes("shields")){
                    if(shipSystems[j].requiredPower[0] > shipSystems[j].systemPower){
                        hasEnoughPower = false;
                    }
                }
            }
        }
        var isOffline = false;
        html += "<div class='shield3DCanvas_shield' style='top:" + ((individualShieldsContainer.height() / shields.length) * i) + "px;height:" + (individualShieldsContainer.height() / shields.length) + "px;'>";
        html += "<div class='shield3DCanvas_shield_label'>";
        if(shields[i].strength <= 0){
            isOffline = true;
            html += "<span style='color:red'>"
        }else if(!shields[i].isRaised || !hasEnoughPower)
        {
            html += "<span style='color:#606060'>"
        }
        html += shields[i].name + " SHIELD";
        if(!shields[i].isRaised || shields[i].strength <= 0 || !hasEnoughPower){
            html += "</span>"
        }
        html += "</div>"
        if(hasEnoughPower){
            html += "<div index='" + i + "' class='individualShieldsContainer_button noselect ";
            if(isOffline){
                html += "Button2Disabled";
            }else{
                html += "raiseLowerShieldButton Button2";
            }
            html += "'>";
            html += status;
            html += "</div>";
            html += "<input type='text' class='individualShieldsContainer_textbox textbox noselect' value='" + (shields[i].strength * 100) + "%' style='height:100%' readonly>";    
        }else{
            html += "<div class='individualShieldsContainer_noPower'>";
            html += "INSUFFICIENT POWER";
            html += "</div>";
        }
        html += "</div>";
    }
    var averageShieldStrength = 0;
    var i;
    for(i = 0;i < shields.length;i++){
        var hasEnoughPower = true;
        if(shipSystems != undefined){
            for(var j = 0;j < shipSystems.length;j++){
                if(shipSystems[j].systemName.toLowerCase().includes(shields[i].name.toLowerCase()) && shipSystems[j].systemName.toLowerCase().includes("shields")){
                    if(shipSystems[j].requiredPower[0] > shipSystems[j].systemPower){
                        hasEnoughPower = false;
                    }
                }
            }
        }
        if(hasEnoughPower){
            averageShieldStrength += shields[i].strength;
        }
    }
    averageShieldStrength = Math.round(((averageShieldStrength / shields.length) * 100));
    averageShieldStrengthLabel.html("&nbsp" + averageShieldStrength + "%");
    individualShieldsContainer.html(html);
    $(".raiseLowerShieldButton").off();
    $(".raiseLowerShieldButton").click(function(event){
        playRandomBeep();
        var index = Number($(event.target).attr("index"));
        shields[index].isRaised = !shields[index].isRaised;
        Interstellar.setDatabaseValue("shields.strength",shields);
    });
}
//event listeners
raiseAllShieldsButton.click(function(event){
    for(var i = 0;i < shields.length;i++){
        shields[i].isRaised = true;
    }
    Interstellar.setDatabaseValue("shields.strength",shields);
});
lowerAllShieldsButton.click(function(event){
    for(var i = 0;i < shields.length;i++){
        shields[i].isRaised = false;
    }
    Interstellar.setDatabaseValue("shields.strength",shields);
});
$(".arrow").click(function(event){
    let direction = .1;
    if($(event.target).attr("type") == "down"){
        direction = -.1;
    }
    Interstellar.setDatabaseValue("shields.frequency",roundToFirstDecimal(frequency + direction));
});
$(".arrow").mousedown(function(event){
    let direction = .1;
    if($(event.target).attr("type") == "down"){
        direction = -.1;
    }
    arrowTimeIntervals.clock = setInterval(function(event){
            Interstellar.setDatabaseValue("shields.frequency",roundToFirstDecimal(frequency + direction));
    },0250);
    arrowTimeIntervals.lowTime = setTimeout(function(event){
        clearInterval(arrowTimeIntervals.clock);
        arrowTimeIntervals.clock = setInterval(function(event){
            Interstellar.setDatabaseValue("shields.frequency",roundToFirstDecimal(frequency + direction));
        },0100);
    },2000);
    arrowTimeIntervals.midTime = setTimeout(function(event){
        clearInterval(arrowTimeIntervals.clock);
        arrowTimeIntervals.clock = setInterval(function(event){
            Interstellar.setDatabaseValue("shields.frequency",roundToFirstDecimal(frequency + direction));
        },0050);
    },5000);
    arrowTimeIntervals.highTime = setTimeout(function(event){
        direction = direction * 10;
    },7000);
    $(document).mouseup(function(event){
        if(arrowTimeIntervals.lowTime != undefined){
            clearTimeout(arrowTimeIntervals.lowTime);
            arrowTimeIntervals.lowTime = undefined;
        }
        if(arrowTimeIntervals.midTime != undefined){
            clearTimeout(arrowTimeIntervals.midTime);
            arrowTimeIntervals.midTime = undefined;
        }
        if(arrowTimeIntervals.highTime != undefined){
            clearTimeout(arrowTimeIntervals.highTime);
            arrowTimeIntervals.highTime = undefined;
        }
        if(arrowTimeIntervals.clock != undefined){
            clearInterval(arrowTimeIntervals.clock);
            arrowTimeIntervals.clock = undefined;
        }
        $(document).off();
    });
});

function roundToFirstDecimal(num){
   return Math.round( num * 10) / 10;
}