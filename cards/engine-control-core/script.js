//copyright Isaac Ostler, July 27th 2017, all rights reserved ©

var EngineControlCoreHasInit = false;

Interstellar.addCoreWidget("Engine Control",function(){
	var thisWidget = this;
	//ensure we don't init twice
	if(EngineControlCoreHasInit){
		return;
	}
	EngineControlCoreHasInit = true;

	//variables
	var currentEngine = 0,
		currentSpeed = -1,
		impulseSpeeds = ["1/4","1/2","3/4","Full"],
		warpSpeeds = [1,2,3,4,5,6,7,8,9,9.23],
		impulseSpeedSpeech = ["1 Quarter","1 Half","3 Quarters","Full"],
		warpSpeedSpeech = [1,2,3,4,5,6,7,8,9,"Destructive"],
		heats = {
			"impulse" : 
				{
					"port" : 70,
					"starboard" : 70
				},
			"warp" : 
				{
					"port" : 70,
					"starboard" : 70
				}
		},
		maxHeat = 10000,
		heatLevels = 
		{
			"impulse" : 10,
			"warp" : 1
		},
		heatPans =
		{
			"impulse" : 0,
			"warp" : 0
		}
	//DOM references
	var thisWidgetElement = $("#engine-control-core-Core-Widget"),
		currentSpeedElement = $("#engine-control-core_currentSpeed"),
		forceToSpeedElement = $("#engine-control-core_forceToSpeed"),
		forceToStopButton = $("#engine-control-core_forceToStop"),
		impulseHeatLabelElement = $("#engine-control-core_impulseLabel"),
		warpHeatLabelElement = $("#engine-control-core_warpLabel"),
		impulsePortHeatLabelElement = $("#engine-control-core_impulsePort"),
		impulseStarboardHeatLabelElement = $("#engine-control-core_impulseStarboard"),
		warpPortHeatLabelElement = $("#engine-control-core_warpPort"),
		warpStarboardHeatLabelElement = $("#engine-control-core_warpStarboard"),
		impulsePanLabelElement = $("#core_heatControls_ImpulseControls_panLabel"),
		warpPanLabelElement = $("#core_heatControls_WarpControls_panLabel"),
		heatProgressBarFill = 
		{
			"impulse" :
			{
				"port" : $("#engine-control-core_impulsePortHeatFill"),
				"starboard" : $("#engine-control-core_impulseStarboardHeatFill")
			},
			"warp" :
			{
				"port" : $("#engine-control-core_warpPortHeatFill"),
				"starboard" : $("#engine-control-core_warpStarboardHeatFill")
			}
		}

	//init calls

	drawGUI();
	drawForceToSpeedGUI();

	//Interstellar functions
	thisWidget.onResize = function(){
		drawGUI();
	}

	thisWidget.afterResize = function(){
		drawGUI();
	}

	//database observers
	Interstellar.onDatabaseValueChange("engineControl.engineInformation",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine" : 0,"currentSpeed" : -1});
			return;
		}
		currentEngine = newData.currentEngine;
		currentSpeed = newData.currentSpeed;
		updateGUI();
	});

	Interstellar.onDatabaseValueChange("engineControl.heat",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("engineControl.heat",heats);
			return;
		}
		heats = newData;
		updateHeatGUI();
	});
	//preset observers

	//functions
	function drawGUI(){
		var width = thisWidgetElement.width();
		var height = thisWidgetElement.height();
		var fontSize;
		fontSize = height * .1;
		if(width * .1 < fontSize){
			fontSize = width * .1;
		}
		impulseHeatLabelElement.css("font-size",fontSize + "px");
		warpHeatLabelElement.css("font-size",fontSize + "px");
		fontSize = fontSize * .8;
		impulsePortHeatLabelElement.css("font-size",fontSize + "px");
		impulseStarboardHeatLabelElement.css("font-size",fontSize + "px");
		warpPortHeatLabelElement.css("font-size",fontSize + "px");
		warpStarboardHeatLabelElement.css("font-size",fontSize + "px");
		fontSize = fontSize * 1.32;
		impulsePanLabelElement.css("font-size",fontSize + "px");
		warpPanLabelElement.css("font-size",fontSize + "px");
		if(width < 129){
			impulsePanLabelElement.html("Pan");
			warpPanLabelElement.html("Pan");
		}else{
			impulsePanLabelElement.html("Heat Pan");
			warpPanLabelElement.html("Heat Pan");
		}
	}

	function updateGUI(){
		var html = "";
		var message = "";
		if(currentSpeed != -1){
			if(currentEngine == 1){
				html += "WARP ";
				html += warpSpeeds[currentSpeed];
				message += "WARP "
				message += warpSpeedSpeech[currentSpeed];
			}else{
				html += impulseSpeeds[currentSpeed];
				html += " IMPULSE";
				message += impulseSpeedSpeech[currentSpeed];
				message += " IMPULSE";
			}
		}else{
			html = "FULL STOP";
			message += "FULL STOP"
		}
		currentSpeedElement.html(html.toUpperCase());
		Interstellar.say("Speed change! " + message);
		if(currentSpeed == -1){
			forceToSpeedElement.prop('selectedIndex',0);
		}else if(currentEngine == 0){
			forceToSpeedElement.prop('selectedIndex',1 + currentSpeed);
		}else{
			forceToSpeedElement.prop('selectedIndex',1 + impulseSpeeds.length + currentSpeed);
		}
	}
	function updateHeatGUI(){
		heatProgressBarFill.impulse.port.css("width",((heats.impulse.port / maxHeat) * 100) + "%");
		heatProgressBarFill.impulse.starboard.css("width",((heats.impulse.starboard / maxHeat) * 100) + "%");
		heatProgressBarFill.warp.port.css("width",((heats.warp.port / maxHeat) * 100) + "%");
		heatProgressBarFill.warp.starboard.css("width",((heats.warp.starboard / maxHeat) * 100) + "%");
	}
	function drawForceToSpeedGUI(){
		var html = "";
		html += "<optgroup label='Full Stop'>";
		html += "<option>";
		html += "FULL STOP";
		html += "</option>";
		html += "<optgroup label='Impulse'>";
		for(var i = 0;i < impulseSpeeds.length;i++){
			html += "<option>";
			html += impulseSpeeds[i] + " Impulse";
			html += "</option>";
		}
		html += "<optgroup label='Warp'>";
		for(var i = 0;i < warpSpeeds.length;i++){
			html += "<option>";
			html += "Warp " + warpSpeeds[i];
			html += "</option>";
		}
		forceToSpeedElement.html(html);
	}
	//intervals
	setInterval(function(){
		if(currentSpeed == -1){
			return;
		}
		var heatToAdd = 0;
		if(currentEngine == 0){
			heatToAdd = heatLevels.impulse;
			heatToAdd = heatToAdd * ((currentSpeed - 1) / impulseSpeeds.length);
			heats.impulse.port += heatToAdd;
			heats.impulse.starboard += heatToAdd;
		}else{
			heatToAdd = heatLevels.warp;
			heatToAdd = heatToAdd * ((currentSpeed - 1) / warpSpeeds.length);
			heats.warp.port += heatToAdd;
			heats.warp.starboard += heatToAdd;
		}
		if(heatToAdd == 0)
		{
			return; //don't waste network traffic on heat levels that aren't changing
		}
		Interstellar.setDatabaseValue("engineControl.heat",heats);
	},0050);
	//event listeners
	forceToSpeedElement.change(function(event){
		var index = Number(forceToSpeedElement.prop('selectedIndex'));
		if(index == 0){
			Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine" : 0,"currentSpeed" : -1});
		}else if(index <= impulseSpeeds.length){
			index = index - 1;
			Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine" : 0,"currentSpeed" : index});
		}else{
			index = index - (impulseSpeeds.length + 1);
			console.log(index);
			Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine" : 1,"currentSpeed" : index});
		}
	});
	forceToStopButton.click(function(event){
		Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine" : 0,"currentSpeed" : -1});
	});
});