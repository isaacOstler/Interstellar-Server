
var radiusOfCoolantTank = 2.5;
var heightOfCoolantTank = 7;

var systemsThatTakeCoolant = [
	{
		"systemName" : "MAIN REACTOR",
		"coolantAmount" : 0,
	},
	{
		"systemName" : "PHASERS",
		"coolantAmount" : 0,
	},
	{
		"systemName" : "ENGINES",
		"coolantAmount" : 0,
	}
];

var amountOfCoolant = 0.001;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var bubbles = [];
var maxBubbles = 120;

var indexOfSystemBeingFilled = -1;
var coolantTransferInterval = undefined;

function randomPositiveOrNegative(){
	if(Math.random() > .5){
		return (-1 * Math.random());
	}else{
		return (Math.random());
	}
}

var heightOfSystemViewBox = $("#systemsView").height();
var spaceOfEachSystem = heightOfSystemViewBox / systemsThatTakeCoolant.length;
var spaceBetweenEachSystem = spaceOfEachSystem * .2;

for(var i = 0;i < systemsThatTakeCoolant.length;i++){
	var system = systemsThatTakeCoolant[i].systemName;
	var newHTML = "<div class='systemView' style='top: " + ((spaceOfEachSystem * i) + (spaceBetweenEachSystem * i))+ "px;height:" + (spaceOfEachSystem * .8) + "px;z-index:2' id='" + system + "-System-View'>";
	newHTML += "<div style='font-size:36px;'>" + system + "</div>";
	system = system.toLowerCase();
	system = system.replace(/\s+/g, '-').toLowerCase();
	newHTML += "<div id='" + system + "_COOLANT_PROGRESS_BAR' class='coolantProgressBar'><div id='" + system + "_COOLANT_PROGRESS_BAR_FILL' class='progressBarFill'></div></div>";
	newHTML += "<div id='" + system + "-FillButton' class='fillButton buttonEffect noSelect verticalAlign beepOnClick'>FILL SUPPLY</div>";
	newHTML += "<div id='" + system + "-DrainButton' class='drainButton buttonEffect noSelect verticalAlign beepOnClick'>DRAIN SUPPLY</div>";
	$("#systemsView").append(newHTML);
}

$(".fillButton").on("mousedown touchstart",function(event){
	for(var i = 0;i < systemsThatTakeCoolant.length;i++){
		systemName = systemsThatTakeCoolant[i].systemName.toLowerCase();
		systemName = systemName.replace(/\s+/g, '-').toLowerCase();
		if(systemName + "-FillButton" == event.target.id){
			if(coolantTransferInterval != undefined){
				clearInterval(coolantTransferInterval);
				coolantTransferInterval = undefined;
			}
			indexOfSystemBeingFilled = i;
			coolantTransferInterval = setInterval(function(){
				if(systemsThatTakeCoolant[indexOfSystemBeingFilled].coolantAmount >= 1){
					if(coolantTransferInterval != undefined){
						clearInterval(coolantTransferInterval);
						coolantTransferInterval = undefined;
					}
					indexOfSystemBeingFilled = -1;
					return;
				}
				if(amountOfCoolant <= 0){
					return;
				}
				systemsThatTakeCoolant[indexOfSystemBeingFilled].coolantAmount += .005;
				Interstellar.setDatabaseValue("coolant.systemCoolantLevels",systemsThatTakeCoolant);
				Interstellar.setDatabaseValue("coolant.coolantInMainTank",amountOfCoolant - .00008);
			},0032);
			$(document).on("mouseup touchend",function(event){
				if(coolantTransferInterval != undefined){
					clearInterval(coolantTransferInterval);
					coolantTransferInterval = undefined;
				}
				indexOfSystemBeingFilled = -1;
			});
			return;
		}
	}
});


$(".drainButton").on("mousedown",function(event){
	for(var i = 0;i < systemsThatTakeCoolant.length;i++){
		systemName = systemsThatTakeCoolant[i].systemName.toLowerCase();
		systemName = systemName.replace(/\s+/g, '-').toLowerCase();
		if(systemName + "-DrainButton" == event.target.id){
			if(coolantTransferInterval != undefined){
				clearInterval(coolantTransferInterval);
				coolantTransferInterval = undefined;
			}
			indexOfSystemBeingFilled = i;
			coolantTransferInterval = setInterval(function(){
				if(systemsThatTakeCoolant[indexOfSystemBeingFilled].coolantAmount <= 0 || amountOfCoolant >= 1){
					if(coolantTransferInterval != undefined){
						clearInterval(coolantTransferInterval);
						coolantTransferInterval = undefined;
					}
					indexOfSystemBeingFilled = -1;
					return;
				}
				systemsThatTakeCoolant[indexOfSystemBeingFilled].coolantAmount -= .005;
				Interstellar.setDatabaseValue("coolant.systemCoolantLevels",systemsThatTakeCoolant);
				Interstellar.setDatabaseValue("coolant.coolantInMainTank",amountOfCoolant + .00008);
			},0032);
			$(document).mouseup(function(event){
				if(coolantTransferInterval != undefined){
					clearInterval(coolantTransferInterval);
					coolantTransferInterval = undefined;
				}
				indexOfSystemBeingFilled = -1;
			});
			return;
		}
	}
});

Interstellar.onDatabaseValueChange("coolant.systemCoolantLevels",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("coolant.systemCoolantLevels",systemsThatTakeCoolant);
		return;
	}
	systemsThatTakeCoolant = newData;
	drawCoolantLevels();
});

function drawCoolantLevels(){
	for(var i = 0;i < systemsThatTakeCoolant.length;i++){
		id = systemsThatTakeCoolant[i].systemName.toString().toLowerCase();
		id = id.replace(/\s+/g, '-').toLowerCase();
		id = "#" + id + "_COOLANT_PROGRESS_BAR_FILL";
		$(id).css("width",(systemsThatTakeCoolant[i].coolantAmount * 100) + "%");
	}
}

var bubbleMaker = setInterval(function(){
	//add bubbles
	if(bubbles.length > maxBubbles){
		clearInterval(bubbleMaker);
		return;
	}
	var bubbleGeo = new THREE.SphereGeometry(Math.random() * 0.05, 3, 3);
	var bubbleMat = new THREE.MeshBasicMaterial({wireframe: false, color: 0xffffff});
	var bubble = new THREE.Mesh(bubbleGeo, bubbleMat);

	coolant.add(bubble);

	bubble.position.y = -3.5;
	var angle = randomPositiveOrNegative()*Math.PI*2;

	bubble.position.x = Math.cos(angle)*(radiusOfCoolantTank - (radiusOfCoolantTank * Math.random()));
	bubble.position.z = Math.sin(angle)*(radiusOfCoolantTank - (radiusOfCoolantTank * Math.random()));

	bubbles.splice(bubbles.length,0,bubble);

},0080);

Interstellar.onDatabaseValueChange("coolant.coolantInMainTank",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("coolant.coolantInMainTank",1);
		return;
	}
	amountOfCoolant = newData;
});

var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor( 0xffffff, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
$("#contentArea").append(renderer.domElement);

camera.position.z = 9;

var coolantGeo = new THREE.CylinderGeometry(radiusOfCoolantTank - .01, radiusOfCoolantTank - .01, heightOfCoolantTank, 32, false);
var coolantMaterial = new THREE.MeshBasicMaterial({wireframe: false, color: 0x42bff4, transparent: true, opacity: 0.8 });
var coolant = new THREE.Mesh(coolantGeo, coolantMaterial);

var containerGeo = new THREE.CylinderGeometry(radiusOfCoolantTank, radiusOfCoolantTank, 7, 32, false);
var geo = new THREE.EdgesGeometry( containerGeo );
var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );
var container = new THREE.LineSegments( geo, mat );

container.position = new THREE.Vector3(2, 0, 0)
coolant.position = new THREE.Vector3(2.01, 0, 0)

scene.add(container);
scene.add(coolant);	

var render = function () {
	requestAnimationFrame(render);

	coolant.rotation.y -= 0.002;
	container.rotation.y -= 0.002;
	for(var i = 0;i < bubbles.length;i++){
		if(bubbles[i].position.y >= (heightOfCoolantTank - 3.75)){
			bubbles[i].position.y = -3.5;
			var angle = randomPositiveOrNegative()*Math.PI*2;
			bubbles[i].position.x = Math.cos(angle)*(radiusOfCoolantTank - (radiusOfCoolantTank * Math.random()));
			bubbles[i].position.z = Math.sin(angle)*(radiusOfCoolantTank - (radiusOfCoolantTank * Math.random()));
		}
		bubbles[i].position.y += ((.1 - bubbles[i].geometry.boundingSphere.radius) / 4) * (8 - heightOfCoolantTank);
	}

	coolant.scale.y = amountOfCoolant; // SCALE
	container.scale.y = 1; // SCALE
	container.position.y = .75;

	coolant.position.y = (amountOfCoolant * 3.5) - 2.75;
	renderer.render(scene, camera);
};

// Calling the render function
render();