//variables
var reactorStress = 20,
	reactorVariance = 2,
	tmpReactorStress = reactorStress,
	pastValues = [],
	maxHistory = 1000;

//DOM References
var gridContainer = $("#grid"),
	canvas = document.getElementById("grid_canvas");

//init calls
initCanvas();

//preset observers

//database observers

Interstellar.onDatabaseValueChange("reactor.reactorStress",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("reactor.reactorStress",reactorStress);
		return;
	}
	reactorStress = newData;
	updateCanvas();
});

Interstellar.onDatabaseValueChange("reactor.reactorStressVariance",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("reactor.reactorStressVariance",reactorVariance);
		return;
	}
	reactorVariance = newData;
	updateCanvas();
});

//functions
function initCanvas(){
	$("#menu").css("display","none");
	$("#contentArea").css("width","85%");
	canvas.width = gridContainer.width();
	canvas.height = gridContainer.height();
	updateCanvas();
}

function updateCanvas(){
	var ctx= canvas.getContext("2d");
	var width = gridContainer.width();
	var height = gridContainer.height();
	//clear, in case we have drawn before
	ctx.clearRect(0,0,width,height);
	//draw box for graph
	ctx.beginPath();
	ctx.strokeStyle = "white";
	ctx.strokeWidth = 5;
	ctx.rect(0,0,width - 60,height);
	ctx.stroke();
	//draw stress levels
	ctx.beginPath();
	ctx.rect(width - 60,height - (height * (tmpReactorStress / 100)),58,height * (tmpReactorStress / 100));
	ctx.fillStyle = "red";
	ctx.fill();
	ctx.stroke();
	//draw graph
	var i,
		oldX = width - 60,
		oldY = height - (height * (tmpReactorStress / 100)),
		newX = 0,
		newY = 0;

	ctx.beginPath();
	for(i = 0;i < pastValues.length;i++){
		newX =  (width - 60) - ((width / maxHistory) * i);
		newY = height - (height * (pastValues[i] / 100));
		ctx.moveTo(oldX,oldY);
		ctx.lineTo(newX,newY);
		oldX = newX;
		oldY = newY;
	}
	ctx.stroke();
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//event handlers

//intervals
setInterval(function(){
	pastValues.splice(0,0,tmpReactorStress);
	if(pastValues.length > maxHistory){
		pastValues.splice(maxHistory,pastValues.length - maxHistory);
	}
	console.log(pastValues);
	tmpReactorStress = reactorStress + getRandomInt(-reactorVariance,reactorVariance);
	updateCanvas();
},0100);