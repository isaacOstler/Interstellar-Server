//DOM References
var canvas = $("#canvas"),
	zoneContainerElement = $("#zoneContainerElement"),
	zoneContainerElement_label = $("#zoneContainerElement_label");

//variables
var gridWidth = 45,
	gridHeight = 45,
	worldMap = [],
	compiledZoneMaps = [],
	lastZoneHoveredOver = undefined,
	worldMaps,
	cellWidth,
	cellHeight,
	devDrawMode = false,
	devDrawSettings =
	{
		"blockType" : "wall", //wall is the only supported mode right now, hope to add doors soon
		"zoning" : true,
		"zoneName" : "Sickbay Alpha"
	},
	zones = []
	drawBounds = true,
	currentDeck = 2,

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

enterDevDrawMode();

$.getJSON('/resource?path=public/deckData.json', function(deckDataJSONFile) {
	worldMaps = deckDataJSONFile.deck;
	compiledZoneMaps = deckDataJSONFile.compiledZoneMap;
	pathfinder = new Pathfinder();
	initWorld(function(){
		for(degree = 0;degree < 360;degree++){
			var cart = polarToCartesian({"radians" : degreesToRadians(degree), "distance" : ((gridWidth / gridHeight) * gridHeight) * .4});
			worldMap[Math.floor(cart.x + gridWidth / 2)][Math.floor(cart.y + gridHeight / 2) - 3].state = "closed";
		}
		drawCanvas();
		if(!devDrawMode){
			setInterval(function(){
				if(compiledZoneMaps[currentDeck].length == 0){
					return;
				}
				var type = Math.random() > .95 ? "intruder" : "officer";
				var randomZone = Math.floor(Math.random() * zones.length);
				var wanderPoint = zones[randomZone].tiles[Math.floor(zones[randomZone].tiles.length * Math.random())];
				officerPositions.splice(officerPositions.length,0,generateNewOfficer("Officer", "#" + officerPositions.length,type,currentDeck,wanderPoint.y,wanderPoint.x,Math.random() * 550 + 1000));
				var randomZone = Math.floor(Math.random() * zones.length);
				wanderPoint = zones[randomZone].tiles[Math.floor(zones[randomZone].tiles.length * Math.random())];
				changeOfficerPath(officerPositions.length - 1,wanderPoint.x,wanderPoint.y);
			},1000);

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

//preset observers

//database observers

//functions

function drawOfficerPositions(deck){

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();
	

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	if(!drawBounds){
		ctx.clearRect(0,0,width,height);
	}

	for(var i = 0;i < officerPositions.length;i++){
		if(officerPositions[i].positioning.deck == currentDeck){
			ctx.beginPath();
			//this officer is on this deck, lets draw their position
			var xPos = officerPositions[i].positioning.xPos,
				yPos = officerPositions[i].positioning.yPos;
			ctx.moveTo(yPos * cellHeight + (cellHeight / 2),xPos * cellWidth + (cellWidth / 2),(cellWidth / cellWidth) * cellWidth * .25 + (cellWidth / 2));
			ctx.arc(yPos * cellHeight + (cellHeight / 2),xPos * cellWidth  + (cellWidth / 2),(cellWidth / cellWidth) * cellWidth * .25,0,2*Math.PI);
			ctx.fillStyle = officerPositions[i].type == "intruder" ? "red" : "white";
			ctx.fill();
		}
	}
	ctx.stroke();
}

function updateOfficerPosition(index){
	var totalTime = Math.max(officerPositions[index].positioning.finishTime - officerPositions[index].positioning.startTime,0);
	var timePassed = Date.now() - officerPositions[index].positioning.startTime;
	if(timePassed >= totalTime || officerPositions[index].positioning.path == "NO PATH" || officerPositions[index].positioning.path.length == 0){
		//this person is already at the destination
		if(!(officerPositions[index].positioning.path == "NO PATH" || officerPositions[index].positioning.path.length == 0)){
			//if they had a path, set the x and y pos to the last step
			//officerPositions[index].positioning.xPos = officerPositions[index].positioning.path[officerPositions[index].positioning.length - 1].x;
			//officerPositions[index].positioning.yPos = officerPositions[index].positioning.path[officerPositions[index].positioning.length - 1].y;
			if(!officerPositions[index].state.dead && !officerPositions[index].state.frozen){
				if(Math.random() > .99){
					var randomZone = Math.floor(Math.random() * zones.length),
						wanderPoint = zones[randomZone].tiles[Math.floor(zones[randomZone].tiles.length * Math.random())];
					changeOfficerPath(index,wanderPoint.x,wanderPoint.y);
				}
			}
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
	}else{
		officerPositions[index].positioning.xPos = currentXStep;
		officerPositions[index].positioning.yPos = currentYStep;
	}
}

function enterDevDrawMode(){
	canvas.on("mousedown.devDraw",function(event){
		var width = canvas.width(),
			height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

		let drawState;
		if(worldMap[x][y].state == "closed"){
			drawState = "open";
			//worldMap[x][y].state = "open";
		}else{
			drawState = "closed";
			//worldMap[x][y].state = "closed";
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
			console.log(detected);
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
		}else{
			worldMap[x][y].state = drawState;
		}
		canvas.on("mousemove.draw",function(event){
			var width = canvas.width(),
				height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

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
			}else{
				worldMap[x][y].state = drawState;
			}
		});
		canvas.on("mouseup.end",function(event){
			canvas.off("mouseup.end");
			canvas.off("mousemove.draw");
			compiledZoneMaps[currentDeck] = compileZoneMap(currentDeck);
		});
	});
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
			"startTime" : null,
			"finishTime" : null
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

function changeOfficerPath(index,newX,newY){

	officerPositions[index].positioning.path = pathfinder.getPathForPoints(worldMaps[currentDeck],Math.floor(officerPositions[index].positioning.yPos),Math.floor(officerPositions[index].positioning.xPos),newX,newY);
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
function startPathfindingTest(){
	canvas.off();
	canvas.on("mousedown",function(event){
		var width = canvas.width(),
			height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

		console.log(x,y);

		//drawPath(pathfinder.getPathForPoints(worldMap,1,17,x,y));
		changeOfficerPath(0,x,y);
		canvas.on("mousemove.draw",function(event){
			var width = canvas.width(),
				height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

			changeOfficerPath(0,x,y);
			//drawPath(pathfinder.getPathForPoints(worldMap,1,17,x,y));
		});
		canvas.on("mouseup.end",function(event){
			canvas.off("mouseup.end");
			canvas.off("mousemove.draw");
		});
	});
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
			worldMap[i] = [];
			for(var j = 0;j < gridWidth;j++){
				worldMap[i][j] = 
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

function setState(index,state,status){
	if(index == -1){
		for(var i = 0;i < officerPositions.length;i++){
			if(state == "frozen" || state == "dead"){
				if(state == "frozen"){
					officerPositions[i].state.frozen = status;
				}else{
					officerPositions[i].state.dead = status;
				}
				changeOfficerPath(i,officerPositions[i].positioning.xPos,officerPositions[i].positioning.yPos);
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
				changeOfficerPath(index,officerPositions[index].positioning.xPos,officerPositions[index].positioning.yPos);
			}
		}
	}
}

function drawCanvas(){
	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,width,height);

	canvas.attr("width",width);
	canvas.attr("height",height);

	ctx.setLineDash([2,3]);
	ctx.strokeStyle = "rgb(95,95,95)";
	for(var i = 0;i < gridWidth;i++){
		ctx.moveTo(0,i * cellWidth);
		ctx.lineTo(width,i * cellWidth);
	}

	for(var i = 0;i < gridHeight;i++){
		ctx.moveTo(i * cellHeight,0);
		ctx.lineTo(i * cellHeight,height);
	}
	ctx.stroke();
	ctx.setLineDash([]);

	for(var i = 0;i < zones.length;i++){
		ctx.beginPath();//draw world zones
		for(var j = 0;j < zones[i].tiles.length;j++){
			ctx.rect(zones[i].tiles[j].x * cellHeight,zones[i].tiles[j].y * cellWidth,cellHeight,cellWidth);
		}
		ctx.fillStyle = zones[i].color;
		ctx.fill();
		ctx.stroke();
	}

	ctx.beginPath();//draw world tiles
	for(var i = 0;i < worldMap.length;i++){
		for(var j = 0;j < worldMap[i].length;j++){
			if(worldMap[i][j].state == "closed"){
				ctx.rect(i * cellHeight,j * cellWidth,cellHeight,cellWidth);
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
		xTile = Math.floor(Math.min(Math.max(xCord / height,0),1) * gridWidth),
		yTile = Math.floor(Math.min(Math.max(yCord / width,0),1) * gridHeight);
	return({"x" : xTile, "y" : yTile});
}

function compileZoneMap(deck){
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
	for(var i = 0;i < zones.length;i++){
		for(var j = 0;j < zones[i].tiles.length;j++){
			var tileX = zones[i].tiles[j].x,
				tileY = zones[i].tiles[j].y;
			compiledMap[tileX][tileY].zoneName = zones[i].zoneName;
		}
	}
	return compiledMap;
}

//event handlers

canvas.on("mousemove.seeZone",function(event){
	if(compiledZoneMaps[currentDeck].length > 0){
		var cords = findTileWithCords(event.offsetX,event.offsetY);
		var zoneName = compiledZoneMaps[currentDeck][cords.x][cords.y].zoneName;

		zoneContainerElement.css("left",event.pageX + 20 + "px");
		zoneContainerElement.css("top",event.pageY - 20 + "px");

		if(zoneName != undefined){
			zoneContainerElement.stop();
			zoneContainerElement.fadeIn();
			zoneContainerElement_label.html(zoneName.toUpperCase());
		}else{
			zoneContainerElement.stop();
			zoneContainerElement.fadeOut();
		}
	}
});

//intervals
