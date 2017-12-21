//DOM References
var canvas = $("#canvas");

//variables
var gridWidth = 30,
	gridHeight = 30,
	worldMap = [],
	cellWidth,
	cellHeight,
	devDrawMode = false,
	devDiagnostics = false,
	allowDiangle = false;

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
	if(path == null){
		return;
	}

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();
	

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,height,width);

	drawCanvas();

	ctx.beginPath();


	for(var i = 0;i < path.length;i++){
		ctx.rect(path[i].y * cellHeight,path[i].x * cellWidth,cellHeight,cellWidth);
	}

	ctx.fillStyle = "rgba(255,0,0,.5)";
	ctx.fill();
	ctx.stroke();

	for(var i = 0;i < gridWidth;i++){
		for(var j = 0;j < gridHeight;j++){
			var g = manhattenHeuristic(startX,startY,i,j),
				h = manhattenHeuristic(i,j,endX,endY) * 1.5;
				f = g + h;
			ctx.beginPath();
			ctx.fillStyle = Interstellar.rotateHue("#00ff00",(f / 50) * -360);
			ctx.fillText(Math.round(f),i * cellHeight,j * cellWidth);
			ctx.stroke();
		}
	}
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

		drawPath(10,10,x,y);
		canvas.on("mousemove.draw",function(event){
			var width = canvas.width(),
				height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

			drawPath(1,1,x,y);
			
		});
		canvas.on("mouseup.end",function(event){
			canvas.off("mouseup.end");
			canvas.off("mousemove.draw");
		});
	});
}

function getPathForPoints(startY,startX,endY,endX){
	var openList = [], //places we have explored
		closedList = [{"x" : startX,"y" : startY,"breadcrumb" : {"x" : startX, "y" : startY}}], //border
		detectedPath = false,
		path = [],
		lastX = 0,
		lastY = 0;
	while(!detectedPath){
		if(closedList.length == 0){
			//AAAA!  It's not possible to reach this position!
			return null;
		}
		for(var n = 0;closedList.length > 0;n = 0){
			if(detectedPath){
				break;
			}

			if(devDiagnostics){
				var ctx = canvas[0].getContext('2d');
				var width = canvas.width(),
					height = canvas.height();
				

				cellWidth = width / gridWidth,
				cellHeight = height / gridHeight;

				//clear the canvas
				ctx.clearRect(0,0,height,width);

				drawCanvas();

				ctx.beginPath();


				for(var i = 0;i < closedList.length;i++){
					ctx.rect(closedList[i].y * cellHeight,closedList[i].x * cellWidth,cellHeight,cellWidth);
				}

				ctx.fillStyle = "rgba(255,0,0,.5)";
				ctx.fill();
				ctx.stroke();

				ctx.beginPath();


				for(var i = 0;i < openList.length;i++){
					ctx.rect(openList[i].y * cellHeight,openList[i].x * cellWidth,cellHeight,cellWidth);
					var xDirection = openList[i].x - openList[i].breadcrumb.x;
						yDirection = openList[i].y - openList[i].breadcrumb.y;

					console.log(xDirection,yDirection)
					ctx.moveTo(openList[i].y * cellHeight + (cellHeight / 2),openList[i].x * cellWidth + (cellWidth / 2));
					if(xDirection != 0){
						if(xDirection == -1){
							//moving left
							ctx.lineTo(openList[i].y * cellHeight + (cellHeight / 2),openList[i].x * cellWidth);
						}else{
							//moving right
							ctx.lineTo(openList[i].y * cellHeight + (cellHeight / 2),openList[i].x * cellWidth + cellWidth);
						}
					}else if(yDirection != 0){
						if(yDirection == -1){
							//moving down
							ctx.lineTo(openList[i].y * cellHeight + cellHeight,openList[i].x * cellWidth + (cellWidth / 2));
						}else{
							//moving up
							ctx.lineTo(openList[i].y * cellHeight,openList[i].x * cellWidth + (cellWidth / 2));
						}
					}
				}

				ctx.fillStyle = "rgba(0,255,0,.5)";
				ctx.fill();
				ctx.stroke();
			}


			var x = closedList[n].x,
			y = closedList[n].y,
			breadcrumb = {"x" : x,"y" : y};
			var adjacentSquares = [];

			if(devDiagnostics){
				ctx.beginPath();


				for(var i = 0;i < openList.length;i++){
					ctx.rect(y * cellHeight,x * cellWidth,cellHeight,cellWidth);
				}

				ctx.fillStyle = "rgba(255,255,255,.5)";
				ctx.fill();
				ctx.stroke();
			}

			if(y - 1 > 0){
				//top good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x,"y" : y - 1});
				if(x - 1 >=0 && allowDiangle){
					//top left good
					adjacentSquares.splice(adjacentSquares.length,0,{"x" : x - 1,"y" : y - 1});
				}
				if(x + 1 < gridWidth && allowDiangle){
					//top right good
					adjacentSquares.splice(adjacentSquares.length,0,{"x" : x + 1,"y" : y - 1});
					
				}
			}
			if(x + 1 < gridWidth){
				//right good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x + 1,"y" : y});
			}
			if(x - 1 > 0){
				//left good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x - 1,"y" : y});
			}
			if(y + 1 < gridHeight){
				//bottom good
				adjacentSquares.splice(adjacentSquares.length,0,{"x" : x,"y" : y + 1});
				if(x + 1 <= gridHeight && allowDiangle){
					//bottom right good
					adjacentSquares.splice(adjacentSquares.length,0,{"x" : x + 1,"y" : y + 1});
				}
				if(x - 1 >= 0 && allowDiangle){
					//bottom left good
					adjacentSquares.splice(adjacentSquares.length,0,{"x" : x - 1,"y" : y + 1});
				}
			}

			var refinedPathOptions = [];
			//now we need to remove any that aren't suitable
			for(var i = 0;i < adjacentSquares.length;i++){
				if(worldMap[adjacentSquares[i].y][adjacentSquares[i].x].state != "closed"){
					var wasDetected = false;
					for(var j = 0;j < openList.length;j++){
						if(adjacentSquares[i].x == openList[j].x && adjacentSquares[i].y == openList[j].y){
							wasDetected = true;
						}
					}
					for(var j = 0;j < closedList.length;j++){
						if(adjacentSquares[i].x == closedList[j].x && adjacentSquares[i].y == closedList[j].y){
							wasDetected = true;
						}
					}
					if(!wasDetected){
						refinedPathOptions.splice(refinedPathOptions.length,0,{"x" : adjacentSquares[i].x,"y" : adjacentSquares[i].y,"breadcrumb" : breadcrumb});
					}
				}
			}
			adjacentSquares = refinedPathOptions;
			//now we need to compute the f and g and h score for each one
			//add to openList
			openList.splice(openList.length,0,closedList[n]);
			//remove this from the border (closed list)
			closedList.splice(n,1);
			//add the new borders
			for(var i = 0;i < adjacentSquares.length;i++){
				closedList.splice(closedList.length,0,adjacentSquares[i])
			}
			for(var i = 0;i < openList.length;i++){
				if(openList[i].x == endX && openList[i].y == endY){
					//WE DID IT!!!!!!!!!  YESSSS
					detectedPath = true;
					path[0] = {"x" : lastX, "y" : lastY};
					lastX = openList[i].x;
					lastY = openList[i].y;
					closedList = [];
				}
			}
		}
	}
	while(path[0].x != startX || path[0].y != startY){
		//clear the canvas
		if(devDiagnostics){
			ctx.clearRect(0,0,height,width);

			drawCanvas();

			ctx.beginPath();


			for(var i = 0;i < path.length;i++){
				ctx.rect(path[i].y * cellHeight,path[i].x * cellWidth,cellHeight,cellWidth);
			}

			ctx.fillStyle = "rgba(255,0,0,.5)";
			ctx.fill();
			ctx.stroke();
		}

		for(var i = openList.length;i > 0;i--){
			//work backwards through breadcrumbs
			if(openList[i - 1].x == lastX && openList[i - 1].y == lastY){
				path.unshift({"x" : openList[i - 1].x,"y" : openList[i - 1].y});
				lastX = openList[i - 1].breadcrumb.x;
				lastY = openList[i - 1].breadcrumb.y;
				break;
			}
		}
	}
	return path;
}

function manhattenHeuristic(startX,startY,endX,endY){
	return Math.abs(startX - endX) + Math.abs(startY - endY);
}

function diagonalHeuristic(startX,startY,endX,endY){
	var D = 1;
	var D2 = Math.sqrt(2); //cost of moving diagonally
    dx = Math.abs(startX - endX)
    dy = Math.abs(startY - endY)
    return D * (dx + dy) + (D2 - 1 * D) * Math.min(dx, dy)
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
				"state" : Math.random() > .25 ? "open" : "closed"
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

	//clear the canvas
	ctx.clearRect(0,0,height,width);

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