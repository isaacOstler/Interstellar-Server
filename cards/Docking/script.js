//dom references
var disembarkationViewButton = $("#disembarkationViewButton"),
	fuelViewButton = $("#fuelViewButton"),
	airlockViewButton = $("#airlockViewButton"),
	rampsViewButton = $("#rampsViewButton"),
	clampsViewButton = $("#clampsViewButton"),
	airlockView = $("#airlockView"),
	fuelView = $("#fuelView"),
	rampsView = $("#rampsView"),
	clampsView = $("#clampsView"),
	disembarkationView = $("#disembarkationView"),

	soundDisembarkationAlarmButton = $("#disembarkationView_soundAlarm"),
	silenceDisembarkationAlarmButton = $("#disembarkationView_silenceAlarm"),
	disembarkationStatusText = $("#disembarkationView_disembarkationState");

//variables
var disembarkationAlarmInterval = undefined,
	airlockStatus = [0,0,0,0,0,0],
	airlockDirections = [0,0,0,0,0,0],
	clampStatus = [0,0,0],
	clampDirections = [0,0,0];

//init calls

//preset observers

//database observers

Interstellar.onDatabaseValueChange("docking.airlockStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("docking.airlockStatus",airlockStatus);
		return;
	}
	airlockStatus = newData;
	for(var i = 0;i < airlockStatus.length;i++){
		setAirlockStatus(i,airlockStatus[i]);
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
	for(var i = 0;i < clampStatus.length;i++){
		drawClamp(i,clampStatus[i]);
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

	ctx.clearRect(0,0,width,height);//clear, in case this isn't our first draw
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
}
function setAirlockStatus(index,status){
	var door1 = $('[doorID=' + index + ']').children().eq(0);
	var door2 = $('[doorID=' + index + ']').children().eq(1);
	//1 is open, 0 is closed
	door1.css("left",-40 * Math.max(Math.min(status,1),0) + "%");
	door2.css("left",25 * Math.max(Math.min(status,1),0) + "%");
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
$(".airlock_controls_open").click(function(event){
	var index = Number($(event.target).attr("doorIndex"));
});
//intervals