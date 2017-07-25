//variables
var renderer,
camera,
scene,
sphereContainer,
falseContainer,
alertStatus = 5,
shipMesh = null,
stars = [],
scanningAnimationObject = {},
courseName = "UNKNOWN COURSE",
alertStatus = 5,
velocity = 30,
zoomIn = false,
revolution = 0,
thrusters = {
	"yaw" : 0,
	"pitch" : 0,
	"roll" : 0
},
requiredThrusters = {
	"yaw" : 0,
	"pitch" : 0,
	"roll" : 0
},
lastScannedCourse =  "";

//DOM references
var container = $("#container"),
	scanningCourseTitle = $("#scanningCourseTitle"),
	yaw = $("#yaw"),
	pitch = $("#pitch"),
	roll = $("#roll"),
	thrustersContainer = $("#thrusters"),
	courseTextbox = $("#courseTextbox"),
	scanForCourseButton = $("#scanForCourseButton");
//init calls
init();

//database observers
Interstellar.onDatabaseValueChange("courseCalculation.isScanning",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("courseCalculation.isScanning",false);
		return;
	}
	velocity = 30;
	if(newData){
		scanningAnimationObject = calculationAnimation();
		scanningCourseTitle.slideDown();
		scanningCourseTitle.css("opacity",1);
		yaw.fadeOut();
		pitch.fadeOut();
		roll.fadeOut();
		scanForCourseButton.fadeOut();
		courseTextbox.fadeOut(function(){
			container.animate({top : "17.75%"},2000);
		});
	}else{
		scanningCourseTitle.slideUp(function(){
			scanningCourseTitle.css("opacity",0);
			container.animate({top : "3.5%"},500,function(){
				courseTextbox.fadeIn();
				scanForCourseButton.fadeIn();
				yaw.fadeIn(function(){
					pitch.fadeIn(function(){
						roll.fadeIn();
					})
				});
			});
		});
	}
	zoomIn = !newData;
});

Interstellar.onDatabaseValueChange("courseCalculation.courseName",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("courseCalculation.courseName","");
		return;
	}
	courseName = newData;
});

Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
	if(newData == null){
		setDatabaseValue("ship.alertStatus",5);
		return;
	}
	alertStatus = newData;
	updateThrustersGUI();
});

Interstellar.onDatabaseValueChange("courseCalculation.thrusters",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("courseCalculation.thrusters",{
			"yaw" : 0,
			"pitch" : 0,
			"roll" : 0
		});
		return;
	}
	thrusters = newData;
	updateThrustersGUI();
});

Interstellar.onDatabaseValueChange("courseCalculation.requiredThrusters",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("courseCalculation.requiredThrusters",{
			"yaw" : 0,
			"pitch" : 0,
			"roll" : 0
		});
		return;
	}
	requiredThrusters = newData;
	updateThrustersGUI();
});

var dotsForAnimation = 0;

setInterval(function(){
	dotsForAnimation++;
	if(dotsForAnimation > 3){
		dotsForAnimation = 0;
	}
	scanningCourseTitle.html("");
	scanningCourseTitle.html("CALCULATING COURSE TO " + courseName.toString().toUpperCase());
	for(var i = 0;i < dotsForAnimation;i++){
		scanningCourseTitle.append(".");
	}
},1000);

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

	//draw the yaw pitch and roll wheels
	updateThrustersGUI();

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
	var geo = new THREE.SphereGeometry(3,1,1);
	var i = 0;
	for(i = 0;i < 3000;i++){
		var mat = new THREE.MeshBasicMaterial();
		var sphere = new THREE.Mesh(geo,mat);
		var randomCords = randomSpherePoint(0,0,0,(Math.random() * 500) + 1000);
		sphere.position.set(randomCords[0],randomCords[1],randomCords[2]);
		sphereContainer.add(sphere);
		stars.splice(stars.length,0,sphere);
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
function updateThrustersGUI(){

	for(var i = 0;i < 3;i++){
		var element;
		if(i == 0){
			element = yaw;
		}else if(i == 1){
			element = pitch;
		}else{
			element = roll;
		}
		var ctx = document.getElementById($(element).attr('id')).getContext("2d");
		ctx.clearRect(0,0,1000,1000); //clear old draws
      	ctx.lineWidth=2;
		ctx.imageSmoothingEnabled = true;
		var center = element.height() / 2;
		var radius = center * .85;
		ctx.beginPath();
		ctx.width = center * 2;
		ctx.height = center * 2;
		ctx.strokeStyle = "white";
		ctx.strokeWidth = "3px";

      	var thruster;
      	var requiredThruster;
      	if(i == 0){
      		ctx.fillText("YAW",center,center - 5);
      		thruster = thrusters.yaw;
      		requiredThruster = requiredThrusters.yaw;
      	}else if(i == 1){
      		ctx.fillText("PITCH",center,center - 5);
      		thruster = thrusters.pitch;
      		requiredThruster = requiredThrusters.pitch;
      	}else{
			ctx.fillText("ROLL",center,center - 5);
      		thruster = thrusters.roll;
      		requiredThruster = requiredThrusters.roll;
      	}
		var color;
    	//if(Math.round(radiansToDegrees(thruster)) != Math.round(radiansToDegrees(requiredThruster))){
    	//	color = 'rgba(255, 0, 0, 0.5)';
    	//}else{
    		switch(Number(alertStatus)){
	            case 5:
	            color = 'rgba(66, 191, 244, 0.3)'; //set the color to white
	            break;
	            case 4:
	            color = 'rgba(65, 244, 166, 0.3)'; //set the color to a greenish blue color
	            break;
	            case 3:
	            color = 'rgba(244, 238, 66, 0.3)'; //set the color to yellow
	            break;
	            case 2:
	            color = 'rgba(172, 119, 32, 0.6'; //set the color to orange
	            break;
	            case 1:
	            color = 'rgba(255, 0, 0, 0.5)'; //set the color to red
	            break;
	        	default: //in case the alert status is something wierd, default to this
	        	color = 'rgba(66, 191, 244, 0.3)';
	        	break;
    		}
    	//}

		// Create gradient
	    grd = ctx.createRadialGradient(center, center, 0.000, center, center, center);
	      
	    // Add colors
	    grd.addColorStop(0.525, 'rgba(1, 1, 1, 0.000)');
	    grd.addColorStop(0.526, 'rgba(33, 29, 29, 1.000)');
	    grd.addColorStop(1.000, color);
	      
	    // Fill with gradient
	    ctx.fillStyle = grd;

		ctx.arc(center,center,radius,0,2*Math.PI);

		ctx.moveTo(center + (radius * .595),center);
		ctx.arc(center,center,radius * .595,0,2 * Math.PI);
		ctx.shadowBlur = 5;
    	ctx.shadowColor = color;
		ctx.fill();
		ctx.font = "20px Arial";
      	ctx.textAlign = 'center';
    	if(Math.round(radiansToDegrees(thruster)) != Math.round(radiansToDegrees(requiredThruster))){
      		ctx.fillStyle = "red";
      	}else{
      		ctx.fillStyle = "white";
      	}
      	ctx.fillText(Math.round(radiansToDegrees(thruster)) + "°",center,center + 15);
		ctx.stroke();
		ctx.beginPath();
      	ctx.strokeStyle = "red";
      	ctx.shadowColor = "red";
      	ctx.lineWidth=3;
      	ctx.lineCap = "butt";
      	ctx.shadowBlur = 5;
      	var lineStart = Polar2Cartesian(radius * 0.65,requiredThruster - degreesToRadians(90));
      	var lineEnd = Polar2Cartesian(radius * .95,requiredThruster - degreesToRadians(90));
      	ctx.moveTo(lineStart.x + center,lineStart.y + center);
      	ctx.lineTo(lineEnd.x + center,lineEnd.y + center);
		ctx.stroke();
		ctx.beginPath();
      	lineStart = Polar2Cartesian(radius * 0.65,thruster - degreesToRadians(90));
      	lineEnd = Polar2Cartesian(radius * .95,thruster - degreesToRadians(90));
      	ctx.strokeStyle = "white";
      	ctx.shadowColor = "white";
      	ctx.moveTo(lineStart.x + center,lineStart.y + center);
      	ctx.lineTo(lineEnd.x + center,lineEnd.y + center);
		ctx.stroke();
      	ctx.shadowBlur = 0;
	}
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
		if(camera.position.z < 4050){
			if(camera.position.z > 3500){
				velocity--;
			}
			if(velocity < 0){
				velocity = 0;
			}else{
				camera.position.z += velocity;
			}
		}
		sphereContainer.rotation.x += .001;
		sphereContainer.rotation.y += .001;
	}
  // Draw!
  renderer.render(scene, camera);

  // Schedule the next frame.
  requestAnimationFrame(update);
}

function calculationAnimation(){
	var lastPoint;
	var line;
	let endAnimationObject = 
	{
		"lineObject" : undefined,
		"interval" : undefined
	}
	endAnimationObject.interval = setInterval(function(){
		if(zoomIn){
			clearInterval(endAnimationObject.interval);
			sphereContainer.remove(line);
			return;
		}
		for(var i = 0;i < stars.length;i++){
			stars[i].material.color.setHex(0xffffff);
			stars[i].scale.set(1,1,1);
		}
		var randomIndex = Math.floor(Math.random() * stars.length);
		stars[randomIndex].material.color.setHex(0x00ffff);
		stars[randomIndex].scale.set(5,5,5);
		if(lastPoint != undefined){
			sphereContainer.remove(line);
			geometry = new THREE.Geometry();
			geometry.vertices.push(stars[randomIndex].position);
			geometry.vertices.push(lastPoint);
			material = new THREE.LineBasicMaterial( { color: 0x00ffff, linewidth: 1 } );
			line = new THREE.Line(geometry, material);
			sphereContainer.add(line);
			endAnimationObject.lineObject = line;
		}
		lastPoint = stars[randomIndex].position;
	},0100);
	return endAnimationObject;
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
    return Number(degrees * (Math.PI / 180));
}

function radiansToDegrees(radians){
    return Number(radians * (180 / Math.PI));
}

//name: cartesian2Polar
//purpse: converts cartesian cords to polar cords, assuming origin is x:0 y:0 (top left)
//takes: x cord, y cord
//returns: object, containing distance and radians

function cartesian2Polar(x, y){
    //pythagorean theorem
    distance = Math.sqrt(x*x + y*y);
    //trig ... yuck
    radians = Math.atan2(y,x) //This takes y first
    //create the polarCoor object
    polarCoor = { distance:distance, radians:radians }
    //return this value to the orignal caller
    return polarCoor;
}

function Polar2Cartesian(distance,radians){
    var cartX = distance * Math.cos(radians);
    var cartY = distance * Math.sin(radians);
    return {"x" : cartX, "y" : cartY};
}

//event handlers
$(".thruster").mousemove(function(event){
	var element = $(event.target);
	var center = (element.height() / 2) + (element.height() * .05);
	var x = event.pageX - (element.offset().left + center);
	var y = event.pageY - (element.offset().top + center);
	var polarCoor = cartesian2Polar(x,y);
	if(polarCoor.distance < ((element.height() / 2) * .9) && polarCoor.distance > ((element.height() / 2) * .5)){
		element.css("cursor","pointer");
	}else{
		element.css("cursor","default");
	}
})
$(".thruster").mousedown(function(event){
	var element = $(event.target);
	var center = (element.height() / 2) + (element.height() * .05);
	var x = event.pageX - (element.offset().left + center);
	var y = event.pageY - (element.offset().top + center);
	var polarCoor = cartesian2Polar(x,y);
	if(!(polarCoor.distance < ((element.height() / 2) * .9) && polarCoor.distance > ((element.height() / 2) * .5))){
		//not within the selection range
		return;
	}
	let thruster = event.target.id;
	let direction = 0;
	var desiredAngle = 0;
	var moveInterval = setInterval(function(){
		switch(thruster){
			case "yaw":
				if(Math.abs(desiredAngle - thrusters.yaw) <= degreesToRadians(1.5)){
					return;
				}
				thrusters.yaw += direction;
				if(thrusters.yaw > degreesToRadians(360)){
					thrusters.yaw = 0;
				}else if(thrusters.yaw < 0){
					thrusters.yaw = degreesToRadians(360);
				}
			break;
			case "pitch":
				if(Math.abs(desiredAngle - thrusters.pitch) <= degreesToRadians(1.5)){
					return;
				}
				thrusters.pitch += direction;
				if(thrusters.pitch > degreesToRadians(360)){
					thrusters.pitch = 0;
				}else if(thrusters.pitch < 0){
					thrusters.pitch = degreesToRadians(360);
				}
			break;
			case "roll":
				if(Math.abs(desiredAngle - thrusters.roll) <= degreesToRadians(1.5)){
					return;
				}
				thrusters.roll += direction;
				if(thrusters.roll > degreesToRadians(360)){
					thrusters.roll = 0;
				}else if(thrusters.roll < 0){
					thrusters.roll = degreesToRadians(360);
				}
			break;
		}
		Interstellar.setDatabaseValue("courseCalculation.thrusters",thrusters);
	},0010);
	var center = element.height() / 2;
	var x = event.pageX - (element.offset().left + center);
	var y = event.pageY - (element.offset().top + center);
	var polarCoor = cartesian2Polar(x,y);
	var anglediff;
	switch(thruster){
		case "yaw":
			anglediff = (radiansToDegrees(thrusters.yaw) - (radiansToDegrees(polarCoor.radians) + 90) + 180 + 360) % 360 - 180;
		break;
		case "pitch":
			anglediff = (radiansToDegrees(thrusters.pitch) - (radiansToDegrees(polarCoor.radians) + 90) + 180 + 360) % 360 - 180;
		break;
		case "roll":
			anglediff = (radiansToDegrees(thrusters.roll) - (radiansToDegrees(polarCoor.radians) + 90) + 180 + 360) % 360 - 180;
		break;
	}
	if (anglediff > 0){
		direction = -.00075;
	}else{
		direction = .00075;
	}
	desiredAngle = polarCoor.radians + degreesToRadians(90);
	$(document).mousemove(function(event){
		var center = element.height() / 2;
		var x = event.pageX - (element.offset().left + center);
		var y = event.pageY - (element.offset().top + center);
		var polarCoor = cartesian2Polar(x,y);
		var anglediff;
		switch(thruster){
			case "yaw":
				anglediff = (radiansToDegrees(thrusters.yaw) - (radiansToDegrees(polarCoor.radians) + 90) + 180 + 360) % 360 - 180;
			break;
			case "pitch":
				anglediff = (radiansToDegrees(thrusters.pitch) - (radiansToDegrees(polarCoor.radians) + 90) + 180 + 360) % 360 - 180;
			break;
			case "roll":
				anglediff = (radiansToDegrees(thrusters.roll) - (radiansToDegrees(polarCoor.radians) + 90) + 180 + 360) % 360 - 180;
			break;
		}
		if (anglediff > 0){
			direction = -.00075;
		}else{
			direction = .00075;
		}
		desiredAngle = polarCoor.radians + degreesToRadians(90);
	});
	$(document).mouseup(function(event){
		if(moveInterval != undefined){
			clearInterval(moveInterval);
		}
		$(document).off();
	})
});

scanForCourseButton.click(function(event){
	if(lastScannedCourse == courseTextbox.val()){
		return;
	}
	lastScannedCourse = courseTextbox.val();
	Interstellar.setDatabaseValue("courseCalculation.courseName",lastScannedCourse);
	Interstellar.setDatabaseValue("courseCalculation.isScanning",true);
});