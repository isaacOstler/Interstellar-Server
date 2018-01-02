var ipc = require('electron').ipcMain;
const remote = require('electron').remote,
	{ipcRenderer} = require('electron'),
    BrowserWindow = remote.BrowserWindow;


//DOM references
var numberOfKeysLabel = $("#frame_databaseInfo_numberOfKeys"),
	lastUpdateLabel = $("#frame_databaseInfo_lastUpdate"),
	lastResetLabel = $("#frame_databaseInfo_lastReset"),
	connectedClientsLabel = $("#frame_databaseInfo_clientCoint"),
	saveModeLabel = $("#frame_databaseInfo_saveMode"),
	databaseValues = $("#frame_databaseValues"),
	databaseValueCanvas = $("#frame_dataCanvas");
//variables
var database = [],
	gridWidth = 400,
	gridHeight = 100,
	drawLines = true,
	databaseTimeObservationAmount = 0.3, //how long to poll during observation times (in seconds)
	databaseChangesInTime = 0,
	databaseChangeHistory = [],
	databaseChangeAverageHistory = [];

function getDatabase(callback){
	let functionCallback = callback;
	ipcRenderer.send('getDatabase');
	ipcRenderer.on('recieveDatabase', (event, arg) => {
		functionCallback(arg);
	});
}

//init calls
init();

//functions
function init(){
	ipcRenderer.send('watchDatabaseInfo');
	ipcRenderer.on('databaseInfoDidChange', (event, arg) => {
		updateDisplay(arg);
	});
}

function updateDisplay(data){
	numberOfKeysLabel.html(data.databaseValues.length);
	lastUpdateLabel.html(data.lastUpdate);
	lastResetLabel.html(data.lastReset);
	connectedClientsLabel.html(data.clients.length);
	saveModeLabel.html(data.saveMode);
	if(database != data.databaseValues){
		databaseChangesInTime++;
	}
	database = data.databaseValues;

	databaseValues.html(JSON.stringify(database));
}

function drawGraph(values){
	var ctx = databaseValueCanvas[0].getContext('2d');
	var width = databaseValueCanvas.width(),
		height = databaseValueCanvas.height();

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,width,height);

	databaseValueCanvas.attr("width",width);
	databaseValueCanvas.attr("height",height);


	if(drawLines){
		ctx.beginPath();
		ctx.strokeStyle = "rgba(255,255,255,.25)";
		for(var i = 0;i < gridHeight;i += gridHeight * .025){
			ctx.moveTo(0,i * cellHeight);
			ctx.lineTo(width,i * cellHeight);
		}
		for(var i = 0;i < gridWidth;i += gridWidth * .025){
			ctx.moveTo(i * cellWidth,0);
			ctx.lineTo(i * cellWidth, height);
		}
		ctx.stroke();
	}

	//draw the graph

	//first we need to find the highest value
	var highestValue = undefined,
		lowestPoint = undefined,
		average = 0;
	for(var i = 0;i < values.length;i++){
		if(values[i] > highestValue || lowestPoint == undefined){
			highestValue = values[i];
		}
		if(values[i] < lowestPoint || lowestPoint == undefined){
			lowestPoint = values[i]
		}
		average += values[i];
	}
	average = average / values.length;
	databaseChangeAverageHistory.unshift(average);
	databaseChangeAverageHistory.splice(gridWidth,Math.max(0,databaseChangeAverageHistory.length - gridWidth));
	console.log(values.length);
	//now we need to graph each one
	ctx.beginPath();
	ctx.strokeStyle = "red";
	for(var i = 0;i < values.length;i++){
		//the highest value is the top of the graph
		var heightOfPoint = (1 - (values[i] - lowestPoint) / (highestValue - lowestPoint)) * height;
		ctx.moveTo(width - (i * cellWidth),heightOfPoint);
		if(i + 1 < values.length){
			heightOfPoint = (1 - (values[i + 1] - lowestPoint) / (highestValue - lowestPoint)) * height;
			ctx.lineTo(width - ((i + 1) * cellWidth),heightOfPoint);
		}
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle = "yellow";
	for(var i = 0;i < databaseChangeAverageHistory.length;i++){
		//the highest value is the top of the graph
		var heightOfPoint = (1 - (databaseChangeAverageHistory[i] - lowestPoint) / (highestValue - lowestPoint)) * height;
		ctx.moveTo(width - (i * cellWidth),heightOfPoint);
		if(i + 1 < databaseChangeAverageHistory.length){
			heightOfPoint = (1 - (databaseChangeAverageHistory[i + 1] - lowestPoint) / (highestValue - lowestPoint)) * height;
			ctx.lineTo(width - ((i + 1) * cellWidth),heightOfPoint);
		}
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle = "white";
	ctx.fillStyle = "rgba(0,0,0,.7)";
	ctx.rect(5,0,20,height);
	ctx.fill();
	ctx.font = '14px arial';
	ctx.fillStyle = "white";
  	ctx.fillText(highestValue, 10, 24);
  	ctx.fillText(lowestPoint, 10, height - 10);
	ctx.stroke();
	ctx.fillStyle = "red";
  	ctx.fillText(values[0], 10, (1 - (values[0] - lowestPoint) / (highestValue - lowestPoint)) * height);
	ctx.stroke();
	ctx.fillStyle = "yellow";
  	ctx.fillText(Math.round(average), 10, (1 - (average - lowestPoint) / (highestValue - lowestPoint)) * height);
	ctx.stroke();
}
//event handlers
setInterval(function(){
	databaseChangeHistory.unshift(databaseChangesInTime);
	databaseChangeHistory.splice(gridWidth,Math.max(0,databaseChangeHistory.length - gridWidth));
	databaseChangesInTime = 0;
	drawGraph(databaseChangeHistory);
},databaseTimeObservationAmount * 1000);

//intervals