//DOM References
var canvas = $("#canvas"),
	zoneContainerElement = $("#zoneContainerElement"),
	zoneContainerElement_label = $("#zoneContainerElement_label"),
	viewControls_slider = $("#viewControls_slider"),
	deckClassifiedContainer = $("#deckStatusClassifiedContainer"),
	deckLabel = $("#deckLabel"),
	ship = $("#ship"),
	shipTopBar = $("#ship_bar_top"),
	shipBottomBar = $("#ship_bar_bottom");

//variables
var gridWidth = 45,
	gridHeight = 40,
	worldMap = [],
	randomNames = [],
	databaseObserversInit = false,
	compiledZoneMaps = [],
	lastZoneHoveredOver = undefined,
	worldMaps,
	cellWidth,
	cellHeight,
	devDrawMode = false,
	devDrawSettings =
	{
		"blockType" : "wall", //wall is the only supported mode right now, hope to add doors soon
		"zoning" : false,
		"zoneName" : "Sickbay Alpha"
	},
	doors = [],
	displayZones = [],
	zones = [],
	drawZones = false,
	drawGrid = false,
	drawBounds = true,
	currentDeck = 2,
	jobs = 
	[
		"general engineer",
		"doctor",
		"janitor",
		"cook",
		"damage control officer",
		"fire control specialist",
		"nuclear engineer",
		"antimatter engineer",
		"chaplain",
		"shuttle pilot",
		"shuttle support crew",
		"personnel officer",
		"tactical officer",
		"science officer",
		"communications operator",
		"fuel specialist",
		"teacher",
		"civilian",
		"nurse",
		"medical assistant",
		"EMT",
		"paramedic",
		"electrician",
		"programmer",
		"computer network specialist",
		"sensors officer",
		"technician",
		"enlisted officer",
		"quartermaster"
	]

	officerPositions = [];

//Class instances
var pathfinder;

/*officer position array is as follows:

	{
		"firstName" : "Isaac",
		"lastName" : "Ostler",
		"id" : GUID,
		"type" : "officer", //security, officer, intruder, other
		"positioning" :
		{
			"deck" : 0,
			"xPos" : 0,
			"yPos" : 0,
			"path" : [...], //pathfinding result
			"startTime" : x,
			"finishTime" : y
		} 
	}

*/

//type of world tiles 
/*
	{
		"state" : "open",
	}
*/

//init calls


$.getJSON('/resource?path=public/deckData.json', function(deckDataJSONFile) {
	Interstellar.setDatabaseValue("securityTracking.deckMaps",deckDataJSONFile);
	worldMaps = deckDataJSONFile.deck;
	zones = deckDataJSONFile.zones;
	displayZones = deckDataJSONFile.displayZones;
	viewControls_slider.attr("max",worldMaps.length);
	var zonesOnDeck = [];
	for(var i = 0;i < worldMaps.length;i++){
		compiledZoneMaps.splice(compiledZoneMaps.length,0,[]);
	}
	for(var i = 0;i < zones.length;i++){
		var detected = false;
		for(var j = 0;j < zonesOnDeck.length;j++){
			if(zones[i].zoneDeck == zonesOnDeck[j].deck){
				detected = true;
				zonesOnDeck[j].zones.splice(zonesOnDeck[j].length,0,zones[i]);
			}
		}
		if(!detected){
			zonesOnDeck.splice(zonesOnDeck.length,0,
			{
				"deck" : zones[i].zoneDeck,
				"zones" : [zones[i]]
			});
		}
	}
	for(var i = 0;i < zonesOnDeck.length;i++){
		compiledZoneMaps[zonesOnDeck[i].deck] = compileZoneMap(zonesOnDeck[i].zones);
	}
	pathfinder = new Pathfinder();
 
	$.getJSON('/resource?path=public/randomNames.json',function(jsonLoaded){
		randomNames = jsonLoaded;
		initWorld(function(){
			drawCanvas();
			createDatabaseObservers();
			if(!devDrawMode){
				
				/*setInterval(function(){
					if(compiledZoneMaps[currentDeck].length == 0){
						return;
					}
					var type = Math.random() > .95 ? "intruder" : "officer",
						randomZone = Math.floor(Math.random() * zones.length),
					var wanderPoint = zones[randomZone].tiles[Math.floor(zones[randomZone].tiles.length * Math.random())];
					officerPositions.splice(officerPositions.length,0,generateNewOfficer("Officer", "#" + officerPositions.length,type,zones[randomZone].zoneDeck,wanderPoint.y,wanderPoint.x,Math.random() * 550 + 1000));
				},1000);*/

				setInterval(function(){
					for(var i = 0;i < officerPositions.length;i++){
						updateOfficerPosition(i);
					}
					if(drawBounds){
						drawCanvas();
					}
					drawOfficerPositions(currentDeck);
				},0050);
			}
		});
	});
});

//preset observers

//database observers
function createDatabaseObservers(){
	if(databaseObserversInit){
		return;
	}
	databaseObserversInit = true;

	Interstellar.onDatabaseValueChange("securityTracking.officerPositions",function(newData){
		if(newData == null){

			//wait for core to spawn everyone ;(


			/*spawnAmountOfOfficers(500);
			Interstellar.setDatabaseValue("securityTracking.officerPositions",officerPositions);*/
			return;
		}
		officerPositions = newData
	});
}
//functions

function setDeckBar(top,height){
	shipTopBar.css("height",ship.height() * top + "px");
	shipBottomBar.css("height",ship.height() - ((ship.height() * top) + ship.height() * height) + "px");
}

function spawnAmountOfOfficers(amount){
	for(var i = 0;i < amount;i++){
		var type = Math.random() > .95 ? (Math.random() > .7 ? "intruder" : "security") : jobs[Math.floor(Math.random() * jobs.length)],
			randomZone = Math.floor(Math.random() * zones.length),
			wanderPoint = zones[randomZone].tiles[Math.floor(zones[randomZone].tiles.length * Math.random())];
		officerPositions.splice(officerPositions.length,0,generateNewOfficer(randomNames.maleNames[Math.floor(Math.random() * randomNames.maleNames.length)], randomNames.maleNames[Math.floor(Math.random() * randomNames.maleNames.length)],type,zones[randomZone].zoneDeck,wanderPoint.y,wanderPoint.x,Math.random() * 550 + 1000));
	}
}

function drawOfficerPositions(deck){

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();

	cellWidth = (width / gridWidth),
	cellHeight = height / gridHeight;

	if(!drawBounds){
		ctx.clearRect(0,0,width,height);
	}

	for(var i = 0;i < officerPositions.length;i++){
		if(officerPositions[i].positioning.deck == currentDeck){
			ctx.beginPath();
			//this officer is on this deck, lets draw their position
			var xPos = officerPositions[i].positioning.xPos,
				yPos = officerPositions[i].positioning.yPos,
				radius = cellWidth * .175,
				varianceX = officerPositions[i].positioning.varianceX * (cellWidth / 2),
				varianceY = officerPositions[i].positioning.varianceY * (cellHeight / 2);
			//ctx.moveTo(xPos * cellWidth + (cellWidth / 2),yPos * cellHeight + (cellHeight / 2),(cellHeight / cellWidth) * cellWidth * .25 + (cellWidth / 2));
			ctx.arc(yPos * cellWidth + (cellWidth / 2) + varianceX,xPos * cellHeight + (cellHeight / 2) + varianceY,radius,0,2*Math.PI);
			//lets also draw where they are going, 
			/*if(officerPositions[i].positioning.path.length > 0){
				radius = radius * 2;
				xPos = officerPositions[i].positioning.path[officerPositions[i].positioning.path.length - 1].x;
				yPos = officerPositions[i].positioning.path[officerPositions[i].positioning.path.length - 1].y;
				ctx.arc(yPos * cellWidth + (cellWidth / 2) + varianceX,xPos * cellHeight + (cellHeight / 2) + varianceY,radius,0,2*Math.PI);
			}*/
			if(officerPositions[i].type == "security"){
				ctx.fillStyle = "yellow";
			}else if(officerPositions[i].type == "intruder"){
				//INTRUDER ALERT!
				ctx.fillStyle = "red";
			}else{
				//could be anything from an engineer to a doctor
				ctx.fillStyle = "white";
			}
			ctx.fill();
			ctx.stroke();
		}
	}
}

function updateOfficerPosition(index){
	var totalTime = Math.max(officerPositions[index].positioning.finishTime - officerPositions[index].positioning.startTime,0);
	var timePassed = Date.now() - officerPositions[index].positioning.startTime;
	if(timePassed >= totalTime || officerPositions[index].positioning.path == "NO PATH" || officerPositions[index].positioning.path.length == 0){
		//this person is already at the destination
		if(!(officerPositions[index].positioning.path == "NO PATH" || officerPositions[index].positioning.path.length == 0)){
			//the code below sets officers to "wander mode"
			if(officerPositions[index].positioning.nextDestinations.length > 0){
				if(officerPositions[index].positioning.nextDestinations[0].isTurbolift){
					officerPositions[index].positioning.deck = officerPositions[index].positioning.nextDestinations[0].newDeck;
					officerPositions[index].positioning.nextDestinations.splice(0,1);
				}else{
					var cords = officerPositions[index].positioning.nextDestinations[0];
					sendOfficerToRoom(index,cords.zoneName,officerPositions[index].positioning.deck);
					officerPositions[index].positioning.nextDestinations.splice(0,1);
				}
			}
			//if they had a path, set the x and y pos to the last step
			//officerPositions[index].positioning.xPos = officerPositions[index].positioning.path[officerPositions[index].positioning.length - 1].x;
			//officerPositions[index].positioning.yPos = officerPositions[index].positioning.path[officerPositions[index].positioning.length - 1].y;
		}
		return;
	}
	var timePerStep = officerPositions[index].positioning.path.length / totalTime;
	var currentStep = Math.floor(timePassed / officerPositions[index].positioning.moveSpeed);
	var progress = 1 - ((currentStep + 1) - (timePassed / officerPositions[index].positioning.moveSpeed));

	var currentXStep = officerPositions[index].positioning.path[currentStep].x;
	var currentYStep = officerPositions[index].positioning.path[currentStep].y;

	if(currentStep > 0){
		var lastXStep = officerPositions[index].positioning.path[currentStep - 1].x
		var lastYStep = officerPositions[index].positioning.path[currentStep - 1].y
		var differenceX = currentXStep - lastXStep;
		var differenceY = currentYStep - lastYStep;
		officerPositions[index].positioning.xPos = lastXStep + (differenceX * progress);
		officerPositions[index].positioning.yPos = lastYStep + (differenceY * progress);

		var detected = false;
		for(var i = 0;i < doors.length;i++){
			if(door[i].x == Math.floor(officerPositions[index].positioning.xPos + 1) && door[i].y == Math.floor(officerPositions[index].positioning.yPos + 1)){
				if(door[i].doorState == "closed"){
					detected = true;
				}
			}
		}
		if(detected){
			//prevent them from moving
			console.log("door closed!");
		}
	}else{
		officerPositions[index].positioning.xPos = currentXStep;
		officerPositions[index].positioning.yPos = currentYStep;
	}
	officerPositions[index].positioning.varianceX = Math.min(Math.max(officerPositions[index].positioning.varianceX + randomNumberBetween(-0.04,0.04),-0.5),0.5);
	officerPositions[index].positioning.varianceY = Math.min(Math.max(officerPositions[index].positioning.varianceY + randomNumberBetween(-0.04,0.04),-0.5),0.5);
}

function sendToRandomRoom(officer){
	randomZone = Math.floor(zones.length * Math.random());
	sendOfficerToRoom(officer,zones[randomZone].zoneName,zones[randomZone].zoneDeck);
}

function enterDevDrawMode(){
	canvas.on("mousedown.devDraw",function(event){
		var width = canvas.width(),
			height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			var cords = findTileWithCords(event.offsetX,event.offsetY),
			x = cords.x,
			y = cords.y;

		let drawState;
		if(worldMaps[currentDeck][x][y].state == "closed"){
			drawState = "open";
			//worldMaps[currentDeck][x][y].state = "open";
		}else{
			drawState = "closed";
			//worldMaps[currentDeck][x][y].state = "closed";
		}

		if(devDrawSettings.zoning){
			var detected = false;
			for(var i = 0;i < zones.length;i++){
				for(var j = 0;j < zones[i].tiles.length;j++){
					if(zones[i].tiles[j].x == x && zones[i].tiles[j].y == y){
						detected = true;
					}
				}
			}
			if(detected){
				drawState = "removeZone";
			}else{
				drawState = "addZone";
			}
			//clear this tile from any other zone
			for(var i = 0;i < zones.length;i++){
				var newTiles = [];
				for(var j = 0;j < zones[i].tiles.length;j++){
					if(!(zones[i].tiles[j].x == x && zones[i].tiles[j].y == y)){
						newTiles.splice(newTiles.length,0,zones[i].tiles[j]);
					}
				}
				zones[i].tiles = newTiles;
				if(zones[i].zoneName == devDrawSettings.zoneName){
					zones[i].tiles.splice(zones[i].tiles.length,0,{"x" : x,"y" : y});
					if(drawState == "addZone"){
						zones[i].tiles.splice(zones[i].tiles.length,0,{"x" : x,"y" : y});
					}
				}
			}
		}else if(devDrawSettings.blockType == "door"){
			var wasDetected = false;
			for(var i = 0;i < doors.length;i++){
				if(doors[i].x == x && doors[i].y == y && doors[i].deck == currentDeck){
					wasDetected = true;
				}
			}
			if(!wasDetected){
				var newDoorObject = 
				{
					"x" : x,
					"y" : y,
					"deck" : currentDeck,
					"guid" : guidGenerator(),
					"doorState" : "open"
				}
				doors.splice(doors.length,0,newDoorObject);
			}
		}else{
			worldMaps[currentDeck][x][y].state = drawState;
		}
		canvas.on("mousemove.draw",function(event){
			var width = canvas.width(),
				height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			var cords = findTileWithCords(event.offsetX,event.offsetY),
			x = cords.x,
			y = cords.y;

			if(devDrawSettings.zoning){
				//clear this tile from any other zone
				var detected = false;
				for(var i = 0;i < zones.length;i++){
					var newTiles = [];
					for(var j = 0;j < zones[i].tiles.length;j++){
						if(!(zones[i].tiles[j].x == x && zones[i].tiles[j].y == y)){
							newTiles.splice(newTiles.length,0,zones[i].tiles[j]);
						}
					}
					zones[i].tiles = newTiles;
					if(zones[i].zoneName == devDrawSettings.zoneName){
						detected = true;
						if(drawState == "addZone"){
							zones[i].tiles.splice(zones[i].tiles.length,0,{"x" : x,"y" : y});
						}
					}
				}
				if(!detected){
					zones.splice(zones.length,0,{"zoneName" : devDrawSettings.zoneName,"zoneDeck" : currentDeck,"color" : getRandomColor(),"tiles" : [{"x" : x,"y" : y}]});
				}
			}else if(devDrawSettings.blockType == "door"){
				var wasDetected = false;
				for(var i = 0;i < doors.length;i++){
					if(doors[i].x == x && doors[i].y == y && doors[i].deck == currentDeck){
						wasDetected = true;
					}
				}
				if(!wasDetected){
					var newDoorObject = 
					{
						"x" : x,
						"y" : y,
						"deck" : currentDeck,
						"guid" : guidGenerator(),
						"doorState" : "open"
					}
					doors.splice(doors.length,0,newDoorObject);
				}
			}else{
				worldMaps[currentDeck][x][y].state = drawState;
			}
		});
		canvas.on("mouseup.end",function(event){
			canvas.off("mouseup.end");
			canvas.off("mousemove.draw");
			compiledZoneMaps[currentDeck] = compileZoneMap(currentDeck);
		});
	});
}

function sendOfficerToRoom(officer,room,deck){
	if(officerPositions[officer].positioning.deck != deck){
		var turboliftPoint;
		for(var i = 0;i < zones.length;i++){
			if(zones[i].zoneDeck == officerPositions[officer].positioning.deck && (zones[i].zoneName.toLowerCase().includes("turbolift") || zones[i].zoneName.toLowerCase().includes("transit") || zones[i].zoneName.toLowerCase().includes("elevator"))){
				turboliftPoint = zones[i].tiles[Math.floor(zones[i].tiles.length * Math.random())];
				changeOfficerPath(officer,turboliftPoint.x,turboliftPoint.y,officerPositions[officer].positioning.deck);
			}
		}
		for(var i = 0;i < zones.length;i++){
			if(zones[i].zoneName.toLowerCase() == room.toLowerCase()){
				wanderPoint = zones[i].tiles[Math.floor(zones[i].tiles.length * Math.random())];
				officerPositions[officer].positioning.nextDestinations = [{"x" : turboliftPoint.x,"y" : turboliftPoint.y,"isTurbolift" : true,"newDeck" : zones[i].zoneDeck},{"x" : wanderPoint.x,"y" : wanderPoint.y,"zoneName" : zones[i].zoneName,"isTurbolift" : false,"newDeck" : zones[i].zoneDeck}]
			}
		}
		//we need to go to a different deck,
		//lets head to the turbolift
	}else{
		for(var i = 0;i < zones.length;i++){
			if(zones[i].zoneName.toLowerCase() == room.toLowerCase()){
				wanderPoint = zones[i].tiles[Math.floor(zones[i].tiles.length * Math.random())];
				changeOfficerPath(officer,wanderPoint.x,wanderPoint.y,officerPositions[officer].positioning.deck);
			}
		}
	}
}

function generateNewOfficer(firstName,lastName,type,deck,positionX,positionY,moveSpeed){
	var newOfficer = 	
	{
		"firstName" : firstName,
		"lastName" : lastName,
		"id" : guidGenerator(),
		"type" : type, //security, officer, intruder, other
		"positioning" :
		{
			"deck" : deck,
			"moveSpeed" : moveSpeed,
			"xPos" : positionX,
			"yPos" : positionY,
			"path" : [], //pathfinding result
			"nextDestinations" : [],
			"startTime" : null,
			"finishTime" : null,
			"varianceX" : randomNumberBetween(-0.5,0.5),
			"varianceY" : randomNumberBetween(-0.5,0.5)
		},
		"state" :
		{
			"dead" : false,
			"frozen" : false,
			"injuried" : false
		}
	}
	return newOfficer;
}

function randomNumberBetween(min,max){
	return Math.random() * (max * 2) + min; 
}

function changeOfficerPath(index,newX,newY,deck){

	officerPositions[index].positioning.path = pathfinder.getPathForPoints(worldMaps[deck],Math.floor(officerPositions[index].positioning.yPos),Math.floor(officerPositions[index].positioning.xPos),newX,newY);
	var totalTime = officerPositions[index].positioning.path.length * officerPositions[index].positioning.moveSpeed;
	officerPositions[index].positioning.startTime = Date.now();
	officerPositions[index].positioning.finishTime = Date.now() + totalTime;
}

function drawPath(path){
	if(path == null){
		return;
	}

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();
	

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,width,height);

	if(drawBounds){

		drawCanvas();
	}

	ctx.beginPath();

	ctx.fillStyle = "rgba(255,0,0,.5)";

	for(var i = 0;i < path.length;i++){
		ctx.rect(path[i].y * cellHeight,path[i].x * cellWidth,cellHeight,cellWidth);
	}

	ctx.fill();
	ctx.stroke();
}
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
   };
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function initWorld(functionCallback){
	let callback = functionCallback;
	worldMap = worldMaps[currentDeck]
		
	if(devDrawMode){
		enterDevDrawMode();
	}else{
		worldMap = worldMaps[currentDeck];
		//worldMap = [];

		/*
		for(var i = 0;i < gridHeight;i++){
			worldMaps[currentDeck][i] = [];
			for(var j = 0;j < gridWidth;j++){
				worldMaps[currentDeck][i][j] = 
				{
					"state" : Math.random() > .25 ? "open" : "closed"
				}
			}
		}*/
	}

	callback();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createNewDeck(radius){
	worldMaps[currentDeck][i] = [];
	
	for(var i = 0;i < gridHeight;i++){
		worldMaps[currentDeck][i] = [];
		for(var j = 0;j < gridWidth;j++){
			worldMaps[currentDeck][i][j] = 
			{
				"state" : "open"
			}
		}
	}
	if(radius != undefined){
		for(degree = 0;degree < 360;degree++){
			var cart = polarToCartesian({"radians" : degreesToRadians(degree), "distance" : ((gridWidth / gridHeight) * gridHeight) * radius});
			worldMaps[currentDeck][Math.floor(cart.x + gridWidth / 2)][Math.floor(cart.y + gridHeight / 2) - 3].state = "closed";
		}
	}
}

function hexToRgbA(hex,opacity){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',opacity)';
    }
    throw new Error('Bad Hex');
}

function setState(index,state,status){
	if(index == -1){
		for(var i = 0;i < officerPositions.length;i++){
			if(state == "frozen" || state == "dead"){
				if(state == "frozen"){
					officerPositions[i].state.frozen = status;
				}else{
					officerPositions[i].state.dead = status;
				}
				changeOfficerPath(i,officerPositions[i].positioning.xPos,officerPositions[i].positioning.yPos,officerPositions[i].positioning.deck);
			}
		}
	}else{
		if(state == "frozen" || state == "dead"){
			if(state == "frozen"){
				officerPositions[index].state.frozen = status;
			}else{
				officerPositions[index].state.dead = status;
			}
			if(status){
				changeOfficerPath(index,officerPositions[index].positioning.xPos,officerPositions[index].positioning.yPos,officerPositions[i].positioning.deck);
			}
		}
	}
}

function drawCanvas(){

	for(var i = 0;i < displayZones.length;i++){
		if(displayZones[i].deck == currentDeck){
			setDeckBar(displayZones[i].startY,displayZones[i].height);
		}
	}
	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,width,height);

	canvas.attr("width",width);
	canvas.attr("height",height);

	if(worldMaps[currentDeck].length == 0){
		deckClassifiedContainer.css("display","block");
		canvas.css("background-color","white");
		canvas.css("border-radius","50px");
		noise(ctx);
	}else{
		deckClassifiedContainer.css("display","none");
		canvas.css("background-color","");
		canvas.css("border-radius","");
		if(drawGrid){
			ctx.setLineDash([2,3]);
			ctx.strokeStyle = "rgb(95,95,95)";
			for(var i = 0;i < gridHeight;i++){
				ctx.moveTo(0,i * cellHeight);
				ctx.lineTo(width,i * cellHeight);
			}

			for(var i = 0;i < gridWidth;i++){
				ctx.moveTo(i * cellWidth,0);
				ctx.lineTo(i * cellWidth,height);
			}
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.setLineDash([]);
		}


		for(var i = 0;i < zones.length;i++){
			if(drawZones || zones[i].highlighted){
				ctx.beginPath();//draw world zones
				for(var j = 0;j < zones[i].tiles.length;j++){
					ctx.rect(zones[i].tiles[j].x * cellWidth,zones[i].tiles[j].y * cellHeight,cellWidth,cellHeight);
				}
				ctx.fillStyle = zones[i].color;
				ctx.fill();
				ctx.stroke();
			}
		}

		ctx.beginPath();//draw world tiles
		for(var i = 0;i < worldMap.length;i++){
			for(var j = 0;j < worldMaps[currentDeck][i].length;j++){
				if(worldMaps[currentDeck][i][j].state == "closed"){
					ctx.rect(i * cellWidth,j * cellHeight,cellWidth,cellHeight);
				}
			}
		}
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.stroke();
	/*
		ctx.beginPath();//draw world tiles
		for(var i = 0;i < safeWanderPoints.length;i++){
			ctx.rect(safeWanderPoints[i].x * cellHeight,safeWanderPoints[i].y * cellWidth,cellHeight,cellWidth);
		}
		ctx.fillStyle = "yellow";
		ctx.fill();
		ctx.stroke();*/
	}
}


//name: cartToPolar
//purpose: converts Cartesian cords to polar cords, assuming origin is x:0 y:0 (top left)
//takes: x cord, y cord
//returns: object, containing distance and radians

function cartToPolar(x, y){
    //Pythagorean theorem
    distance = Math.sqrt(x*x + y*y);
    //trig ... yuck
    radians = Math.atan2(y,x) //This takes y first
    //create the polarCoor object
    polarCoor = { distance:distance, radians:radians }
    //return this value to the original caller
    return polarCoor;
}

function polarToCartesian(polarCord){
    return {
        "x" : polarCord.distance * Math.cos(polarCord.radians),
        "y" : polarCord.distance * Math.sin(polarCord.radians)
    }
}

function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians){
    return radians * (180 / Math.PI);
}

function findTileWithCords(xCord,yCord){
	var height = canvas.height(),
		width = canvas.width(),
		xTile = Math.floor(Math.min(Math.max(xCord / width,0),1) * gridWidth),
		yTile = Math.floor(Math.min(Math.max(yCord / height,0),1) * gridHeight);
	return({"x" : xTile, "y" : yTile});
}

function compileZoneMap(passedZones){
	var compiledMap = [];
	for(var i = 0;i < gridHeight;i++){
		compiledMap[i] = [];
		for(var j = 0;j < gridWidth;j++){
			compiledMap[i][j] = 
			{
				"zoneName" : undefined
			}
		}
	}
	for(var i = 0;i < passedZones.length;i++){
		for(var j = 0;j < passedZones[i].tiles.length;j++){
			var tileX = passedZones[i].tiles[j].x,
				tileY = passedZones[i].tiles[j].y;
			compiledMap[tileX][tileY].zoneName = passedZones[i].zoneName;
		}
	}
	return compiledMap;
}

//credit to http://jsfiddle.net/AbdiasSoftware/vX7NK/
function noise(ctx) {
    
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        idata = ctx.createImageData(w, h),
        buffer32 = new Uint32Array(idata.data.buffer),
        len = buffer32.length,
        i = 0;

    for(; i < len;)
        buffer32[i++] = ((255 * Math.random())|0) << 24;

    ctx.putImageData(idata, 0, 0);
}

function withinRange(variance,value,comparedTo){
	return value > (comparedTo - variance) && value < (comparedTo + variance);
}

//event handlers
viewControls_slider.on("input",function(event){
	currentDeck = Math.floor(event.target.value);
	deckLabel.html("DECK " + (currentDeck + 1));
});
canvas.on("mousemove.seeZone",function(event){
	if(compiledZoneMaps[currentDeck].length > 0){
		var cords = findTileWithCords(event.offsetX,event.offsetY);
		var zoneName = compiledZoneMaps[currentDeck][cords.x][cords.y].zoneName;
		zoneContainerElement.css("left",event.pageX + 20 + "px");
		zoneContainerElement.css("top",event.pageY - 20 + "px");

		var officerSelected = [];
		for(var i = 0;i < officerPositions.length;i++){
			if(withinRange(1,officerPositions[i].positioning.yPos,cords.x) && withinRange(1,officerPositions[i].positioning.xPos,cords.y) && officerPositions[i].positioning.deck == currentDeck){
				officerSelected.splice(officerSelected.length,0,i);
			}
		}

		var dropdownShown = false;
		if(zoneName != undefined){
			zoneContainerElement_label.html("");
			if(lastZoneHoveredOver != zoneName){
				zoneContainerElement.stop();
				zoneContainerElement.fadeIn();
			}
			dropdownShown = true;
			lastZoneHoveredOver = zoneName;
			zoneContainerElement_label.html(zoneName.toUpperCase() + "<br />");
			for(var i = 0;i < zones.length;i++){
				if(zones[i].zoneName == zoneName){
					zones[i].highlighted = true;
				}else{
					zones[i].highlighted = false;
				}
			}
		}else{
			for(var i = 0;i < zones.length;i++){
				zones[i].highlighted = false;
			}
			if(lastZoneHoveredOver != undefined){
				zoneContainerElement.stop();
				zoneContainerElement.fadeOut(function(){
					zoneContainerElement_label.html("");
				});
			}
			lastZoneHoveredOver = undefined;
		}
		if(officerSelected.length > 0 && !dropdownShown){
			lastZoneHoveredOver = "officer";
			zoneContainerElement_label.html("");
			zoneContainerElement.stop();
			zoneContainerElement.fadeIn();
		}
		for(var i = 0;i < officerSelected.length;i++){
			if(officerPositions[officerSelected[i]].type == "security"){
				zoneContainerElement_label.append("<small style='color:yellow'>" + officerPositions[officerSelected[i]].lastName + ", " + officerPositions[officerSelected[i]].firstName + " (SECURITY OFFICER)</small>")
			}else if(officerPositions[officerSelected[i]].type == "intruder"){
				zoneContainerElement_label.append("<small style='color:red'><b>" + officerPositions[officerSelected[i]].lastName + " " + officerPositions[officerSelected[i]].firstName + " (UNAUTHORIZED)</b></small>");
			}else{
				zoneContainerElement_label.append("<small>" + officerPositions[officerSelected[i]].lastName + ", " + officerPositions[officerSelected[i]].firstName + " (" + officerPositions[officerSelected[i]].type.toUpperCase() + ")</small>");
			}
			if(i != officerSelected.length - 1){
				zoneContainerElement_label.append("<br />");
			}
		}
	}
});


//intervals

/*
setInterval(function(){
	for(var i = 0;i < officerPositions.length;i++){
		if(Math.random() > .935){
			sendToRandomRoom(i);
		}
	}
	Interstellar.setDatabaseValue("securityTracking.officerPositions",officerPositions);
},30000);*/
