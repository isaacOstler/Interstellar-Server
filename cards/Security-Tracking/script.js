//DOM References
var canvas = $("#canvas");

//variables
var gridWidth = 30,
	gridHeight = 30,
	worldMap = [],
	cellWidth,
	cellHeight,
	devDrawMode = true

//type of world tiles 
/*
	{
		"state" : "open",
	}
*/

//init calls

initWorld(function(){
	drawCanvas();
});

//preset observers

//database observers

//functions

function drawPath(startX,startY,endX,endY){
	var path = getPathForPoints(startX,startY,endX,endY);

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();
	

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	ctx.beginPath();


	for(var i = 0;i < path.length;i++){
		ctx.rect(path[i].y * cellHeight,path[i].x * cellWidth,cellHeight,cellWidth);
	}

	ctx.fillStyle = "rgba(255,0,0,.5)";
	ctx.fill();
	ctx.stroke();

	for(var i = 0;i < gridWidth;i++){
		for(var j = 0;j < gridHeight;j++){
			var g,h;
			g = Math.abs(i - startX) + Math.abs(j - startY);
			h = Math.abs(endX - i) + Math.abs(endY - j);

			ctx.fillText(Math.round(diagonalHeuristic(i,j,endX,endY)),i * cellHeight,j * cellWidth);
		}
	}
	ctx.stroke();
}

function getPathForPoints(startY,startX,endY,endX){
	var openList = [{"x" : startX,"y" : startY}];
	do{
		var x = openList[openList.length - 1].x,
			y = openList[openList.length - 1].y;
		//first we need to get all the adjacent squares, and compute their F score
		var adjacentSquares = [];
		if(y - 1 >= 0){
			//top good
			adjacentSquares.splice(adjacentSquares.length,0,{"x" : x,"y" : y - 1});
			if(x - 1 >= 0){
				//top left good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x - 1,"y" : y - 1});
			}
			if(x + 1 <= gridWidth){
				//top right good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x + 1,"y" : y - 1});
				
			}
		}
		if(x + 1 <= gridWidth){
			//right good
			adjacentSquares.splice(adjacentSquares.length,0,{"x" : x + 1,"y" : y});
		}
		if(x - 1 >= 0){
			//left good
			adjacentSquares.splice(adjacentSquares.length,0,{"x" : x - 1,"y" : y});
		}
		if(y + 1 <= gridHeight){
			//bottom good
			adjacentSquares.splice(adjacentSquares.length,0,{"x" : x,"y" : y + 1});
			if(x + 1 <= gridHeight){
				//bottom right good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x + 1,"y" : y + 1});
			}
			if(x - 1 >= 0){
				//bottom left good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x - 1,"y" : y + 1});
			}
		}

		var refinedPathOptions = [];
		//now we need to remove any that aren't suitable
		for(var i = 0;i < adjacentSquares.length;i++){
			if(worldMap[adjacentSquares[i].y][adjacentSquares[i].x].state != "closed"){
					//can't walk through walls
				var detected = false;
				for(var j = 0;j < openList.length;j++){
					if(adjacentSquares[i].x == openList[j].x && adjacentSquares[i].y == openList[j].y){
						//can't backtrack
						detected = true;
					}
				}
				if(!detected){
					refinedPathOptions.splice(refinedPathOptions.length,0,{"x" :adjacentSquares[i].x,"y" : adjacentSquares[i].y});
				}
			}
		}
		adjacentSquares = refinedPathOptions;
		console.log(adjacentSquares);
		//now we need to compute the f and g and h score for each one
		//f = g + h
		//g = cost from start
		//h = estimated cost from end
		var lowestFScore = undefined,
			nextSquare = {"x" : -1, "y" : -1};
		for(var i = 0;i < adjacentSquares.length;i++){
			var f = diagonalHeuristic(adjacentSquares[i].x,adjacentSquares[i].y,endX,endY)
			//g = Math.abs(adjacentSquares[i].x - openList[0].x) + Math.abs(adjacentSquares[i].y - openList[0].y);
			//h = Math.abs(adjacentSquares[i].x - endX) + Math.abs(adjacentSquares[i].y - endY);

			if(lowestFScore == undefined || f < lowestFScore){
				lowestFScore = f;
				nextSquare = {"x" : adjacentSquares[i].x,"y" : adjacentSquares[i].y}
			}else if(lowestFScore == f){
				//tie!
			}
		}
		openList.splice(openList.length,0,nextSquare);
	}while((openList[openList.length - 1].x != endX || openList[openList.length - 1].y != endY));
	return openList;
}
function diagonalHeuristic(startX,startY,endX,endY){
	var D = 1;
	var D2 = Math.sqrt(2); //cost of moving diagonally
    dx = Math.abs(startX - endX)
    dy = Math.abs(startY - endY)
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy)
}
function initWorld(callback){
	if(devDrawMode){
		worldMap = [];
		for(var i = 0;i < gridHeight;i++){
			worldMap[i] = [];
			for(var j = 0;j < gridWidth;j++){
				worldMap[i][j] = 
				{
					"state" : "open"
				}
			}
		}
		canvas.on("mousedown",function(event){
			var width = canvas.width(),
				height = canvas.height(),

				cellWidth = width / gridWidth,
				cellHeight = height / gridHeight;
				x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
				y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

			let drawState;
			if(worldMap[x][y].state == "closed"){
				drawState = "open";
				worldMap[x][y].state = "open";
			}else{
				drawState = "closed";
				worldMap[x][y].state = "closed";
			}
			callback();
			canvas.on("mousemove.draw",function(event){
				var width = canvas.width(),
					height = canvas.height(),

				cellWidth = width / gridWidth,
				cellHeight = height / gridHeight;
				x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
				y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

				worldMap[x][y].state = drawState;
				callback();
			});
			canvas.on("mouseup.end",function(event){
				canvas.off("mouseup.end");
				canvas.off("mousemove.draw");
			});
		});
		callback();
		return;
	}
	worldMap = [];
	for(var i = 0;i < gridHeight;i++){
		worldMap[i] = [];
		for(var j = 0;j < gridWidth;j++){
			worldMap[i][j] = 
			{
				"state" : Math.random() > .35 ? "open" : "closed"
			}
		}
	}

	callback();
}

function drawCanvas(){
	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

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
}

//event handlers

//intervals