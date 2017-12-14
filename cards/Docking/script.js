//dom references
var disembarkationViewButton = $("#disembarkationViewButton"),
	fuelViewButton = $("#fuelViewButton"),
	airlockViewButton = $("#airlockViewButton"),
	rampsViewButton = $("#rampsViewButton"),
	clampsViewButton = $("#clampsViewButton"),
	//views
	airlockView = $("#airlockView"),
	fuelView = $("#fuelView"),
	rampsView = $("#rampsView"),
	clampsView = $("#clampsView"),
	disembarkationView = $("#disembarkationView"),
	//statusLights
	disembarkationStatusLight = $("#disembarkationViewStatus"),
	fuelStatusLight = $('#fuelViewStatus'),
	airlockStatusLight = $("#airlockViewStatus"),
	rampsStatusLight = $("#rampsViewStatus"),
	clampsStatusLight = $("#clampsViewStatus");

	soundDisembarkationAlarmButton = $("#disembarkationView_soundAlarm"),
	silenceDisembarkationAlarmButton = $("#disembarkationView_silenceAlarm"),
	disembarkationStatusText = $("#disembarkationView_disembarkationState");

//variables
var disembarkationAlarmInterval = undefined,
	dockedState = 0, //the initial docking state... 0 is undocked, 1 is docked
	airlockStatus = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
	airlockDirections = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
	clampStatus = [dockedState,dockedState,dockedState],
	clampDirections = [dockedState,dockedState,dockedState],
	fuelStatus = [dockedState,dockedState,dockedState,dockedState,dockedState],
	rampsStatus = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
	rampDirections = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
	needsDisembarkation = false,
	disembarkationActive = false;

//init calls

//preset observers

//database observers

Interstellar.onDatabaseValueChange("docking.rampsStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.rampsStatus",rampsStatus);
		return;
	}
	rampsStatus = newData;
	var currentState = 0,
		isFluxing = false;
	for(var i = 0;i < rampsStatus.length;i++){
		if(rampsStatus[i] == 0){
			$("[rampID=" + i + "]").html("RETRACTED");
			$("[rampID=" + i + "]").css("color","red");
		}else if(rampsStatus[i] == 1){
			currentState = 1;
			$("[rampID=" + i + "]").html("EXTENDED");
			$("[rampID=" + i + "]").css("color","lime");
		}else if(rampsStatus[i] != 1 && rampsStatus[i] != 0){
			isFluxing = true;
			$("[rampID=" + i + "]").html("MOVING");
			$("[rampID=" + i + "]").css("color","yellow");
		}
	}
	if(isFluxing){
		setLightToStatus(rampsStatusLight,"yellow")
	}else{
		if(currentState){
			setLightToStatus(rampsStatusLight,"red")
		}else{
			setLightToStatus(rampsStatusLight,"green")
		}
	}
});


Interstellar.onDatabaseValueChange("docking.rampDirections",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.rampDirections",rampDirections)
		return;
	}
	rampDirections = newData;
});
Interstellar.onDatabaseValueChange("docking.fuelLines",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.fuelLines",fuelStatus);
		return;
	}
	fuelStatus = newData;
	var currentState = -1,
		isFluxing = false;
	for(var i = 0;i < fuelStatus.length;i++){
		if(currentState != -1){
			if(currentState != fuelStatus[i]){
				isFluxing = true
			}
		}
		currentState = fuelStatus[i];
		if(fuelStatus[i] == 1){
			$('[fuelIndex=' + i + ']').fadeOut();
			$('[system=' + i + ']').html("DISCONNECT");
			$('[system=' + i + ']').addClass("fuelDisconnect");
			$('[system=' + i + ']').removeClass("fuelConnect");
		}else{
			$('[fuelIndex=' + i + ']').fadeIn();
			$('[system=' + i + ']').html("CONNECT");
			$('[system=' + i + ']').removeClass("fuelDisconnect");
			$('[system=' + i + ']').addClass("fuelConnect");
		}
	}
	if(isFluxing){
		setLightToStatus(fuelStatusLight,"yellow")
	}else{
		if(currentState){
			setLightToStatus(fuelStatusLight,"red")
		}else{
			setLightToStatus(fuelStatusLight,"green")
		}
	}
});

Interstellar.onDatabaseValueChange("docking.needsDisembarkation",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.needsDisembarkation",false);
		return;
	}
	needsDisembarkation = newData;
	if(disembarkationActive){
			setLightToStatus(disembarkationStatusLight,"yellow");
	}else{
		if(needsDisembarkation){
			setLightToStatus(disembarkationStatusLight,"red");
		}else{
			setLightToStatus(disembarkationStatusLight,"green");
		}
	}
});

Interstellar.onDatabaseValueChange("docking.airlockStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.airlockStatus",airlockStatus);
		return;
	}
	airlockStatus = newData;
	var currentState = 0,
		isFluxing = false;
	for(var i = 0;i < airlockStatus.length;i++){
		setAirlockStatus(i,airlockStatus[i]);
		if(airlockStatus[i] != 1 && airlockStatus[i] != 0){
			isFluxing = true;
		}else{
			currentState = airlockStatus[i];
		}
	}
	if(isFluxing){
		setLightToStatus(airlockStatusLight,"yellow")
	}else{
		if(currentState){
			setLightToStatus(airlockStatusLight,"red")
		}else{
			setLightToStatus(airlockStatusLight,"green")
		}
	}
});

Interstellar.onDatabaseValueChange("docking.clampsDirection",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.clampsDirection",clampDirections);
		return;
	}
	clampDirections = newData;
});

Interstellar.onDatabaseValueChange("docking.clampsStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.clampsStatus",clampStatus);
		return;
	}
	clampStatus = newData;
	var currentState = 0,
		isFluxing = false;
	for(var i = 0;i < clampStatus.length;i++){
		drawClamp(i,clampStatus[i]);
		if(clampStatus[i] != 1 && clampStatus[i] != 0){
			isFluxing = true;
		}else{
			currentState = clampStatus[i];
		}
	}
	if(isFluxing){
		setLightToStatus(clampsStatusLight,"yellow")
	}else{
		if(currentState){
			setLightToStatus(clampsStatusLight,"red")
		}else{
			setLightToStatus(clampsStatusLight,"green")
		}
	}
});

Interstellar.onDatabaseValueChange("docking.airlockDirection",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.airlockDirection",airlockDirections);
		return;
	}
	airlockDirections = newData;
});

Interstellar.onDatabaseValueChange("docking.disembarkationAlarm",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.disembarkationAlarm",false);
		return;
	}
	disembarkationActive = newData;
	if(disembarkationAlarmInterval != undefined){
		clearInterval(disembarkationAlarmInterval);
		disembarkationAlarmInterval = undefined;
	}
	if(newData){
		let dotCount = 0;
		let originalText = "ALARM ACTIVE";
		disembarkationStatusText.css("color","rgb(255,179,0)");
		disembarkationStatusText.html("ALARM ACTIVE");
		disembarkationAlarmInterval = setInterval(function(){
			disembarkationStatusText.html("ALARM ACTIVE");
			dotCount++;
			if(dotCount > 3){
				dotCount = 0;
			}
			for(var i = 0;i < dotCount;i++){
				disembarkationStatusText.append(".");
			}
		},1000);
	}else{
		disembarkationStatusText.html("NO ALARM ACTIVE");
		disembarkationStatusText.css("color","rgb(255,255,255)");
	}
	if(disembarkationActive){
			setLightToStatus(disembarkationStatusLight,"yellow");
	}else{
		if(needsDisembarkation){
			setLightToStatus(disembarkationStatusLight,"red");
		}else{
			setLightToStatus(disembarkationStatusLight,"green");
		}
	}
});

//functions
function openView(view){
	if(view == clampsView){
		view.slideDown(function(){
			for(let i = 0;i < clampStatus.length;i++){
				setTimeout(function(){
					drawClamp(i,clampStatus[i]);
				},i * 300)
			}
		});
	}else{
		view.slideDown();
	}

	if(disembarkationView != view){
		disembarkationView.fadeOut();
	}
	if(fuelView != view){
		fuelView.fadeOut();
	}
	if(airlockView != view){
		airlockView.fadeOut();
	}
	if(rampsView != view){
		rampsView.fadeOut();
	}
	if(clampsView != view){
		clampsView.fadeOut();
	}
}

function drawClamp(index,status){
	var ctx = $('[clampId=' + index + ']')[0].getContext('2d');
	var height = $('[clampId=' + index + ']').height();
	var width = $('[clampId=' + index + ']').width();
	$('[clampId=' + index + ']').attr("width", width);
	$('[clampId=' + index + ']').attr("height", height);

	ctx.beginPath();
	ctx.rect(0,0,width,height);

	ctx.fillStyle = "black";
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	//our first rect will be the sides
	ctx.rect(0,0,width * .1,height);
	ctx.rect(width - width * .1,0,width * .1,height);
	//bottom
	ctx.rect(width * .1,height - height * .2,width * .8,height * .2);
	//top
	ctx.rect(0,0,width * .3,height * .2);
	ctx.rect(width - (width * .3),0,width * .3,height * .2);

	ctx.fillStyle = "#a3a3a3";
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();

	var clampYPosition = Math.min(status / 0.5,1.0) * (height * .77);
	var widthOfClamps = (width * .355 / 2);
	ctx.rect(width * 0.307,0,widthOfClamps,clampYPosition);
	ctx.rect(width * 0.335 + widthOfClamps,0,widthOfClamps,clampYPosition);

	if(status > .5){
		var clampXPosition = Math.min((status - 0.5) / 0.5,1.0);
		ctx.rect(width * 0.305 - (clampXPosition * (width * .18)),height * 0.21,clampXPosition * (width * .18),height * .55);
		ctx.rect(width * 0.335 + (widthOfClamps * 2) + (width * .005),height * 0.21,clampXPosition * (width * .18),height * .55);
	}
	ctx.fillStyle = "white";
	ctx.fill();
	ctx.stroke();
}
function setAirlockStatus(index,status){
	var door1 = $('[doorID=' + index + ']').children().eq(0);
	var door2 = $('[doorID=' + index + ']').children().eq(1);
	//1 is open, 0 is closed
	door1.css("left",-40 * Math.max(Math.min(status,1),0) + "%");
	door2.css("left",25 * Math.max(Math.min(status,1),0) + "%");
}
function setLightToStatus(light,status){
	if(status == "yellow")
	{
		light.removeClass("statusLight");
		light.removeClass("redStatusLight");
		light.addClass("yellowStatusLight");
	}else if(status == "red"){
		light.removeClass("statusLight");
		light.addClass("redStatusLight");
		light.removeClass("yellowStatusLight");
	}else{
		light.addClass("statusLight");
		light.removeClass("redStatusLight");
		light.removeClass("yellowStatusLight");
	}
}
//event handlers
disembarkationViewButton.click(function(){openView(disembarkationView)});
fuelViewButton.click(function(){openView(fuelView)});
airlockViewButton.click(function(){openView(airlockView)});
rampsViewButton.click(function(){openView(rampsView)});
clampsViewButton.click(function(){openView(clampsView)});

soundDisembarkationAlarmButton.click(function(event){
	Interstellar.setDatabaseValue('docking.disembarkationAlarm',true);
});

silenceDisembarkationAlarmButton.click(function(event){
	Interstellar.setDatabaseValue('docking.disembarkationAlarm',false);
});

$(".airlockControls_open").click(function(event){
	var doorIndex = Number($(event.target).attr("doorIndex"));
	var modifiedArray = [];
	for(var i = 0;i < airlockDirections.length;i++){
		if(i == doorIndex){
			modifiedArray[i] = 1;
		}else{
			modifiedArray[i] = airlockDirections[i];
		}
	}
	Interstellar.setDatabaseValue("docking.airlockDirection",modifiedArray);
});
$(".airlockControls_close").click(function(event){
	var doorIndex = Number($(event.target).attr("doorIndex"));
	var modifiedArray = [];
	for(var i = 0;i < airlockDirections.length;i++){
		if(i == doorIndex){
			modifiedArray[i] = 0;
		}else{
			modifiedArray[i] = airlockDirections[i];
		}
	}
	Interstellar.setDatabaseValue("docking.airlockDirection",modifiedArray);
});

$(".clampControls_attatch").click(function(event){
	var clampIndex = Number($(event.target).attr("clampIndex"));
	var modifiedArray = [];
	for(var i = 0;i < clampDirections.length;i++){
		if(i == clampIndex){
			modifiedArray[i] = 1;
		}else{
			modifiedArray[i] = clampDirections[i];
		}
	}
	Interstellar.setDatabaseValue("docking.clampsDirection",modifiedArray);
});
$(".clampControls_release").click(function(event){
	var clampIndex = Number($(event.target).attr("clampIndex"));
	var modifiedArray = [];
	for(var i = 0;i < clampDirections.length;i++){
		if(i == clampIndex){
			modifiedArray[i] = 0;
		}else{
			modifiedArray[i] = clampDirections[i];
		}
	}
	Interstellar.setDatabaseValue("docking.clampsDirection",modifiedArray);
});
$(".fuelContainer_disconnectButton").click(function(event){
	var index = Number($(event.target).attr("system"));
	if(fuelStatus[index]){
		fuelStatus[index] = 0;
	}else{
		fuelStatus[index] = 1;
	}
	Interstellar.setDatabaseValue("docking.fuelLines",fuelStatus);
});

$(".closeRampButton").click(function(event){
	var index = Number($(event.target).attr("rampIndex"));
	rampDirections[index] = 1;
	Interstellar.setDatabaseValue("docking.rampDirections",rampDirections);
});

$(".openRampButton").click(function(event){
	var index = Number($(event.target).attr("rampIndex"));
	rampDirections[index] = 0;
	Interstellar.setDatabaseValue("docking.rampDirections",rampDirections);
});
//intervals

//REMOVE THESE!  THESE ARE FOR CORE ONLY!
setInterval(function(event){
	var differenceDetected = false;
	for(var i = 0;i < clampDirections.length;i++){
		if(clampStatus[i] < clampDirections[i]){
			clampStatus[i] += .001;
			differenceDetected = true;
		}else if(clampStatus[i] > clampDirections[i]){
			clampStatus[i] -= .001;
			differenceDetected = true;
		}
		if(Math.abs(clampStatus[i] - clampDirections[i]) < .001){
			clampStatus[i] = clampDirections[i]; //if the difference between the two is minimal, just clamp it
		}
	}
	if(differenceDetected){
		Interstellar.setDatabaseValue("docking.clampsStatus",clampStatus);
	}
},0030);

setInterval(function(event){
	var differenceDetected = false;
	for(var i = 0;i < airlockDirections.length;i++){
		if(airlockStatus[i] < airlockDirections[i]){
			airlockStatus[i] += .005;
			differenceDetected = true;
		}else if(airlockStatus[i] > airlockDirections[i]){
			airlockStatus[i] -= .005;
			differenceDetected = true;
		}
		if(Math.abs(airlockStatus[i] - airlockDirections[i]) < .005){
			airlockStatus[i] = airlockDirections[i]; //if the difference between the two is minimal, just clamp it
		}
	}
	if(differenceDetected){
		Interstellar.setDatabaseValue("docking.airlockStatus",airlockStatus);
	}
},0030);

setInterval(function(event){
	var differenceDetected = false;
	for(var i = 0;i < rampDirections.length;i++){
		if(rampsStatus[i] < rampDirections[i]){
			rampsStatus[i] += .01;
			differenceDetected = true;
		}else if(rampsStatus[i] > rampDirections[i]){
			rampsStatus[i] -= .01;
			differenceDetected = true;
		}
		if(Math.abs(rampsStatus[i] - rampDirections[i]) < .01){
			rampsStatus[i] = rampDirections[i]; //if the difference between the two is minimal, just clamp it
		}
	}
	if(differenceDetected){
		Interstellar.setDatabaseValue("docking.rampsStatus",rampsStatus);
	}
},0080);