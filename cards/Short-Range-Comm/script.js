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
			"isConnected" : false,
			"color" : "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",.7)"
		}
	],
	channels = 
	[
		{
			"channelName" : "Dominion",
			"picture" : "dominionLogo.png",
			"top" : 0,
			"bottom" : 0.1
		},
		{
			"channelName" : "Starfleet",
			"picture" : "federationLogo.png",
			"top" : 0.1,
			"bottom" : 0.25
		},
		{
			"channelName" : "General Use",
			"picture" : "anonLogo.png",
			"top" : 0.25,
			"bottom" : 0.45
		},
		{
			"channelName" : "Klingon",
			"picture" : "klingonLogo.png",
			"top" : 0.45,
			"bottom" : 0.6
		},
		{
			"channelName" : "Romulan",
			"picture" : "romulanLogo.png",
			"top" : 0.6,
			"bottom" : 0.75
		},
		{
			"channelName" : "Cardassian",
			"picture" : "cardassianLogo.png",
			"top" : 0.75,
			"bottom" : 0.9
		},
		{
			"channelName" : "Ferengi",
			"picture" : "ferengiLogo.png",
			"top" : 0.9,
			"bottom" : 1
		}
	],
	canConnectToLine = false,
	isConnected = false,
	currentPicture = "",
	outgoingHail = "none",
	hailingLabelAnimationInterval = undefined;


//DOM References
var frequencyCanvas = $("#frequencyCanvas"),
	frequencyCanvasContainer = $("#frequencyCanvasContainer"),
	frequencySliderCanvasContainer = $("#frequencySliderCanvasContainer"),
	frequencySliderCanvas = $("#frequencySliderCanvas"),
	amplitudeSliderCanvasContainer = $("#amplitudeSliderCanvasContainer"),
	amplitudeSliderCanvas = $("#amplitudeSliderCanvas"),
	hailButton = $("#hailButton"),
	connectButton = $("#connectButton"),
	picture = $("#picture"),
	pictureMask = $("#pictureFilter"),
	pictureLabel = $("#pictureLabel");

//init calls
initGUI();
drawFrequencyCanvas();

//preset observers

//database observers
Interstellar.onDatabaseValueChange("shortRangeComm.outgoingHail",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("shortRangeComm.outgoingHail","none");
		return;
	}
	outgoingHail = newData;
	if(outgoingHail != "none"){
		if(hailingLabelAnimationInterval != undefined){
			clearInterval(hailingLabelAnimationInterval);
			hailingLabelAnimationInterval = undefined;
		}
		if(outgoingHail.isConnected){
			pictureLabel.html("LINE CONNECTED");
			hailButton.html("DISCONNECT LINE");
			isConnected = true;
			pictureMask.css("background-color","lime");
		}else{
			pictureLabel.html("HAILING");
			hailingLabelAnimationInterval = setInterval(function(){
				pictureLabel.append(".");
				if(pictureLabel.html().length > 10){
					pictureLabel.html("HAILING");
				}
			},500);
			hailButton.html("CANCEL HAIL");
			isConnected = false;
			pictureMask.css("background-color","rgb(0,128,255)");
		}
		pictureMask.stop();
		pictureMask.fadeIn(1000);
		pictureLabel.fadeIn(2000);
	}else{
		if(hailingLabelAnimationInterval != undefined){
			clearInterval(hailingLabelAnimationInterval);
			hailingLabelAnimationInterval = undefined;
		}
		pictureLabel.html("HAIL CANCELED...");
		isConnected = false;
		pictureMask.fadeOut(2000,function(){
			pictureLabel.fadeOut(2000);
		});
		hailButton.html("HAIL");
	}
	drawFrequencyCanvas();
	drawAmplitudeFrequencySliderCanvas();
});

Interstellar.onDatabaseValueChange("shortRangeComm.incomingHails",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("shortRangeComm.incomingHails",incomingHails);
		return;
	}
	incomingHails = newData;

	var connectionDetected = false;
	for(var i = 0;i < incomingHails.length;i++){
		if(incomingHails[i].isConnected){
			connectionDetected = true;
		}
	}
	isConnected = connectionDetected;
	pictureMask.stop();
	if(connectionDetected){
		connectButton.html("DISCONNECT LINE");
		pictureLabel.html("LINE CONNECTED");
		pictureMask.css("background-color","lime");
		pictureMask.fadeIn(1000);
		pictureLabel.fadeIn(2000);
	}else{
		connectButton.html("CONNECT TO LINE");
		pictureLabel.fadeOut(1000);
		pictureMask.fadeOut(2000);
	}

	drawFrequencyCanvas();
	drawAmplitudeFrequencySliderCanvas();
});

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
			ctx.strokeStyle = "rgb(0," + (Math.round(((max - i) / max) * 55) + 55) + "," + (Math.round(((max - i) / max) * 128) + 55) + ")";
			ctx.moveTo(0,(4 * i) + 1);
			ctx.lineTo(width,(4 * i) + 1);
			ctx.stroke();
		}
		for(var i = 0;i < incomingHailValues.length;i++){
			ctx.beginPath();
			ctx.strokeStyle = "black";
			ctx.lineWidth = 11;
			ctx.moveTo(0,Number(incomingHailValues[i].value) * height);
			ctx.lineTo(width,Number(incomingHailValues[i].value) * height);
			ctx.stroke();
			ctx.beginPath();
			ctx.lineWidth = 8;
			ctx.strokeStyle = incomingHailValues[i].color;
			ctx.moveTo(0,Number(incomingHailValues[i].value) * height);
			ctx.lineTo(width,Number(incomingHailValues[i].value) * height);
			ctx.stroke();
		}

		if(canvasInstance == 1){
			ctx.beginPath();
			for(var i = 0;i < channels.length;i++){
				ctx.lineWidth = 2;
				ctx.strokeStyle = "white";
				ctx.moveTo(0,Number(channels[i].top) * height);
				ctx.lineTo(width,Number(channels[i].top) * height);

				ctx.moveTo(0,Number(channels[i].top) * height);
				var fontSize = (width * .15);
				while((fontSize * .9) * channels[i].channelName.length > width){
					fontSize -= .1
				}
				ctx.font = fontSize + "px Arial";
				ctx.fillStyle = "#ffffff";
				var posY = Math.max((Number(channels[i].top) * height) + (width * .15),25);
				ctx.fillText(channels[i].channelName.toUpperCase(),1,posY);

				ctx.moveTo(0,Number(channels[i].bottom) * height);
				ctx.lineTo(width,Number(channels[i].bottom) * height);
			}
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.lineWidth = 2;
		if(isConnected){
			ctx.strokeStyle = "lime";
		}else{
			ctx.strokeStyle = "white";
		}
		ctx.moveTo(0,(userValue * height) - 3);
		ctx.lineTo(width,(userValue * height) - 3);
		ctx.moveTo(0,(userValue * height) + 3);
		ctx.lineTo(width,(userValue * height) + 3);
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
	if(isConnected){
		ctx.strokeStyle = "lime";
	}else{
		ctx.strokeStyle = "white";
	}
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

function drawPictureForFrequency(frequency){
	var frequency = frequency / .2;
	for(var i = 0;i < channels.length;i++){
		if(frequency > channels[i].top && frequency < channels[i].bottom){
			if(currentPicture != channels[i].picture){
				currentPicture = channels[i].picture;
				picture.css("background-image","url('/resource?path=/public/" + channels[i].picture + "')")
				pictureMask.css("-webkit-mask-image","url('/resource?path=/public/" + channels[i].picture + "')")
			}
			return;
		}
	}
}

function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians){
    return radians * (180 / Math.PI);
}

//event handlers

connectButton.click(function(event){
	if(isConnected){
		Interstellar.playRandomBeep();
		var newArray = [];
		for(var j = 0;j < incomingHails.length;j++){
			incomingHails[j].isConnected = false;
			newArray.splice(newArray.length,0,incomingHails[j]);
		}
		Interstellar.setDatabaseValue("shortRangeComm.incomingHails",newArray);
		return;
	}
	if(canConnectToLine){
		Interstellar.playRandomBeep();
		for(var i = 0;i < incomingHails.length;i++){
			if(incomingHails[i].frequency > (commFreq - .001) && incomingHails[i].frequency < (commFreq + .001)){
				if(incomingHails[i].amplitude > (commAmp - .005) && incomingHails[i].amplitude < (commAmp + .005)){
					var newArray = [];
					for(var j = 0;j < incomingHails.length;j++){
						incomingHails[j].isConnected = false;
						newArray.splice(newArray.length,0,incomingHails[j]);
					}
					newArray[i].isConnected = true;
					Interstellar.setDatabaseValue("shortRangeComm.incomingHails",newArray);
				}
			}
		}
	}else{
		Interstellar.playErrorNoise();
	}
});

hailButton.click(function(event){
	if(isConnected){
		if(outgoingHail == "none"){
			Interstellar.playErrorNoise();
			return;
		}
	}
	Interstellar.playRandomBeep();
	var newHail;
	if(outgoingHail == "none"){
		newHail = 
		{
			"frequency" : commFreq,
			"amplitude" : commAmp,
			"isConnected" : false
		}
	}else{
		newHail = "none";
	}
	Interstellar.setDatabaseValue("shortRangeComm.outgoingHail",newHail);
})


$(".commSlider").mousedown(function(event){
	if(isConnected || outgoingHail != "none"){
		Interstellar.playErrorNoise();
		return;
	}
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
		drawPictureForFrequency(value * .2);
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
			drawPictureForFrequency(value * .2);
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