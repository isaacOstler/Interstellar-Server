//variables
var commFreq = .05,
	commAmp = .6,
	commPhase = 0,
	incomingHails = 
	[
		{
			"frequency" : Math.random() * .2,
			"amplitude" : Math.random() * .9,
			"phase" : 0,
			"color" : "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",.7)"
		}
	],
	canConnectToLine = false;


//DOM References
var frequencyCanvas = $("#frequencyCanvas"),
	frequencyCanvasContainer = $("#frequencyCanvasContainer"),
	frequencySliderCanvasContainer = $("#frequencySliderCanvasContainer"),
	frequencySliderCanvas = $("#frequencySliderCanvas"),
	amplitudeSliderCanvasContainer = $("#amplitudeSliderCanvasContainer"),
	amplitudeSliderCanvas = $("#amplitudeSliderCanvas"),
	hailButton = $("#hailButton"),
	connectButton = $("#connectButton");

//init calls
initGUI();
drawFrequencyCanvas();

//preset observers

//database observers
Interstellar.onDatabaseValueChange("shortRangeComm.currentCommunicationSettings",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("shortRangeComm.currentCommunicationSettings",{"frequency" : commFreq,"amplitude" : commAmp});
		return;
	}
	commFreq = newData.frequency;
	commAmp = newData.amplitude;
	drawFrequencyCanvas();
	drawAmplitudeFrequencySliderCanvas();
});

//functions

function initGUI(){
	var canvas = document.getElementById(frequencyCanvas.prop("id"));
	var width = frequencyCanvasContainer.width(),
		height = frequencyCanvasContainer.height();
	var ctx = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = height;
	canvas = document.getElementById(amplitudeSliderCanvas.prop("id"));
	width = amplitudeSliderCanvasContainer.width(),
	height = amplitudeSliderCanvasContainer.height();
	canvas.width = width;
	canvas.height = height;
	canvas = document.getElementById(frequencySliderCanvas.prop("id"));
	width = frequencySliderCanvasContainer.width(),
	height = frequencySliderCanvasContainer.height();
	canvas.width = width;
	canvas.height = height;
	drawFrequencyCanvas();
	drawAmplitudeFrequencySliderCanvas();
}

function drawAmplitudeFrequencySliderCanvas(){
	var canvas,
		width,
		height,
		incomingHailValues,
		userValue;
	for(var canvasInstance = 0;canvasInstance < 2;canvasInstance++){
		if(canvasInstance == 0){
			canvas = document.getElementById(amplitudeSliderCanvas.prop("id"));
			width = amplitudeSliderCanvasContainer.width();
			height = amplitudeSliderCanvasContainer.height();
			userValue = commAmp / .9;
			incomingHailValues = [];
			for(var j = 0;j < incomingHails.length;j++){
				incomingHailValues.splice(incomingHailValues.length,0,{"value" : (incomingHails[j].amplitude / .9),"color" : incomingHails[j].color });
			}
		}else{
			canvas = document.getElementById(frequencySliderCanvas.prop("id"));
			width = frequencySliderCanvasContainer.width();
			height = frequencySliderCanvasContainer.height();
			userValue = commFreq / .2;
			incomingHailValues = [];
			for(var j = 0;j < incomingHails.length;j++){
				incomingHailValues.splice(incomingHailValues.length,0,{"value" : (incomingHails[j].frequency / .2),"color" : incomingHails[j].color });
			}
		}
		canvas.height = height;
		canvas.width = width;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,width,height);
		ctx.lineWidth = 3;
		var max = height / 4;
		for(var i = 0;i < max;i++){
			ctx.beginPath();
			ctx.strokeStyle = "rgb(0," + (Math.round(((max - i) / max) * 128) + 55) + "," + (Math.round(((max - i) / max) * 200) + 55) + ")";
			ctx.moveTo(0,(4 * i) + 1);
			ctx.lineTo(width,(4 * i) + 1);
			ctx.stroke();
		}
		for(var i = 0;i < incomingHailValues.length;i++){
			ctx.beginPath();
			ctx.lineWidth = 8;
			ctx.strokeStyle = incomingHailValues[i].color;
			ctx.moveTo(0,Number(incomingHailValues[i].value) * height);
			ctx.lineTo(width,Number(incomingHailValues[i].value) * height);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.lineWidth = 6;
		ctx.strokeStyle = "white";
		ctx.moveTo(0,userValue * height);
		ctx.lineTo(width,userValue * height);
		ctx.stroke();
	}
	determainIfLineCanBeConnected();
}

function determainIfLineCanBeConnected(){
	var detected = false;
	for(var i = 0;i < incomingHails.length;i++){
		if(incomingHails[i].frequency > (commFreq - .001) && incomingHails[i].frequency < (commFreq + .001)){
			if(incomingHails[i].amplitude > (commAmp - .005) && incomingHails[i].amplitude < (commAmp + .005)){
				detected = true;
			}
		}
	}
	if(detected){
		if(canConnectToLine){
			return;
		}
		canConnectToLine = true;
		hailButton.addClass("disabledButton");
		hailButton.removeClass("Button2");
		connectButton.removeClass("disabledButton");
		connectButton.addClass("Button2");
	}else{
		if(!canConnectToLine){
			return;
		}
		canConnectToLine = false;
		hailButton.removeClass("disabledButton");
		hailButton.addClass("Button2");
		connectButton.addClass("disabledButton");
		connectButton.removeClass("Button2");
	}
}

function drawFrequencyCanvas(){
	var canvas = document.getElementById(frequencyCanvas.prop("id"));
	var width = frequencyCanvasContainer.width(),
		height = frequencyCanvasContainer.height();
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,width,height);

	ctx.beginPath();
	ctx.lineWidth = .5;
	ctx.strokeStyle = "rgba(128,128,128,.5)";
	ctx.setLineDash([4,2]);
	for(var i = 0;i < (height / 20);i++){
		ctx.moveTo(0,(20 * i) + 2);
		ctx.lineTo(width,(20 * i) + 2);
	}
	for(var i = 0;i < (width / 20);i++){
		ctx.moveTo((20 * i) + 2,0);
		ctx.lineTo((20 * i) + 2,height);
	}
	ctx.stroke();

	ctx.setLineDash([])
	var x;
	for(var i = 0;i < incomingHails.length;i++){
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.moveTo(0,width / 2);
		ctx.strokeStyle = incomingHails[i].color;
		for(x = 0;x < width;x++){
			ctx.lineTo(x,getYforSineValueAtXWithParams(x,incomingHails[i].amplitude,incomingHails[i].frequency,incomingHails[i].phase,height));
		}
		ctx.stroke();
	}
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = "white";
	ctx.moveTo(0,width / 2);
	for(x = 0;x < width;x++){
		ctx.lineTo(x,getYforSineValueAtXWithParams(x,commAmp,commFreq,commPhase,height));
	}
	ctx.stroke();
}

function getYforSineValueAtXWithParams(xPos,communicationsAmp,communicationsFreq,communicationsPhase,heightOfContainer){
	communicationsAmp = heightOfContainer * communicationsAmp;
	var yValue = (communicationsAmp * .5) * Math.sin(communicationsFreq * (xPos - (communicationsPhase * communicationsFreq))) + (heightOfContainer / 2);
	return yValue;
}


function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians){
    return radians * (180 / Math.PI);
}

//event handlers

connectButton.click(function(event){
	if(canConnectToLine){
		Interstellar.playRandomBeep();
	}else{
		Interstellar.playErrorNoise();
	}
})

$(".commSlider").mousedown(function(event){
	Interstellar.playRandomBeep();
	let eventTarget = $(event.target);
	eventTarget.css("cursor","-webkit-grabbing");
	let sliderType = 0;//0 is freq, 1 is amp
	let height = $(event.target).height();
	let offset = $(event.target).offset().top;
	if($(event.target).attr("slider") == "amp"){
		sliderType = 1;
	}
	var yPos = event.pageY - offset;
	var value = Math.max(0,Math.min((yPos / height),1));
	if(sliderType == 0){
		commFreq = value * .2;
	}else{
		commAmp = value * .9;
	}
	drawAmplitudeFrequencySliderCanvas();
	drawFrequencyCanvas();
	$(document).mousemove(function(event){
		var yPos = event.pageY - offset;
		var value = Math.max(0,Math.min((yPos / height),1));
		if(sliderType == 0){
			commFreq = value * .2;
		}else{
			commAmp = value * .9;
		}
		drawAmplitudeFrequencySliderCanvas();
		drawFrequencyCanvas();
	});
	$(document).mouseup(function(event){
		eventTarget.css("cursor","-webkit-grab");
		Interstellar.playRandomBeep();
		Interstellar.setDatabaseValue("shortRangeComm.currentCommunicationSettings",{"frequency" : commFreq,"amplitude" : commAmp});
		$(document).off();
	});
});

//intervals