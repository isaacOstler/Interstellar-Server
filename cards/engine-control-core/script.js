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
		restingHeat = 70,
		heatLevels = 
		{
			"impulse" : 0.5,
			"warp" : 0.5
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
		},
		impulseHeatLevelRangeElement = $("#engine-control-core_heatControls_ImpulseControls_heatRate"),
		warpHeatLevelRangeElement = $("#engine-control-core_heatControls_WarpControls_heatRate"),
		impulseHeatLevelTextboxElement = $("#engine-control-core_heatControls_ImpulseControls_heatRateTextbox"),
		warpHeatLevelTextboxElement = $("#engine-control-core_heatControls_WarpControls_heatRateTextbox"),
		warpPanLevelTextboxElement = $("#engine-control-core_heatControls_WarpControls_heatPanTextbox"),
		impulsePanLevelTextboxElement = $("#engine-control-core_heatControls_ImpulseControls_heatPanTextbox");


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
		heatProgressBarFill.impulse.port.stop();
		heatProgressBarFill.impulse.port.animate({"width":((heats.impulse.port / maxHeat) * 100) + "%"});
		heatProgressBarFill.impulse.starboard.stop();
		heatProgressBarFill.impulse.starboard.animate({"width":((heats.impulse.starboard / maxHeat) * 100) + "%"});
		heatProgressBarFill.warp.port.stop();
		heatProgressBarFill.warp.port.animate({"width":((heats.warp.port / maxHeat) * 100) + "%"});
		heatProgressBarFill.warp.starboard.stop();
		heatProgressBarFill.warp.starboard.animate({"width":((heats.warp.starboard / maxHeat) * 100) + "%"});
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
		var heatToAdd = 0;
		if(currentSpeed == -1){
			//impulse (move to resting)
			heatToAdd = -(heats.impulse.port / restingHeat) + 1;
			heats.impulse.port += heatToAdd;
			heatToAdd = -(heats.impulse.starboard / restingHeat) + 1;
			heats.impulse.starboard += heatToAdd;
			//warp (move to resting)
			heatToAdd = -(heats.warp.port / restingHeat) + 1;
			heats.warp.port += heatToAdd;
			heatToAdd = -(heats.warp.starboard / restingHeat) + 1;
			heats.warp.starboard += heatToAdd;
		}
		if(currentEngine == 0){
			heatToAdd = heatLevels.impulse;
			heatToAdd = heatToAdd * ((currentSpeed + 1) / impulseSpeeds.length);
			var heatToAddWithPan = (heatToAdd * (1 + heatPans.impulse));
			if(heatToAddWithPan < 0){
				heatToAddWithPan = 0;
			}
			heats.impulse.starboard += heatToAddWithPan;
			heatToAddWithPan = (heatToAdd * (1 - heatPans.impulse));
			if(heatToAddWithPan < 0){
				heatToAddWithPan = 0;
			}
			heats.impulse.port += heatToAddWithPan;
			//warp (move to resting)
			heatToAdd = -(heats.warp.port / restingHeat) + 1;
			heats.warp.port += heatToAdd;
			heatToAdd = -(heats.warp.starboard / restingHeat) + 1;
			heats.warp.starboard += heatToAdd;
		}else{
			heatToAdd = heatLevels.warp;
			heatToAdd = heatToAdd * ((currentSpeed + 1) / warpSpeeds.length);
			var heatToAddWithPan = (heatToAdd * (1 + heatPans.warp));
			if(heatToAddWithPan < 0){
				heatToAddWithPan = 0;
			}
			heats.warp.starboard += heatToAddWithPan;
			heatToAddWithPan = (heatToAdd * (1 - heatPans.warp));
			if(heatToAddWithPan < 0){
				heatToAddWithPan = 0;
			}
			heats.warp.port += heatToAddWithPan;
			//impulse (move to resting)
			heatToAdd = -(heats.impulse.port / restingHeat) + 1;
			heats.impulse.port += heatToAdd;
			heatToAdd = -(heats.impulse.starboard / restingHeat) + 1;
			heats.impulse.starboard += heatToAdd;
		}
		if(heats.warp.port > maxHeat){
			heats.warp.port = maxHeat;
		}
		if(heats.warp.starboard > maxHeat){
			heats.warp.starboard = maxHeat;
		}
		if(heats.impulse.port > maxHeat){
			heats.impulse.port = maxHeat;
		}
		if(heats.impulse.starboard > maxHeat){
			heats.impulse.starboard = maxHeat;
		}
		Interstellar.setDatabaseValue("engineControl.heat",heats);
	},0500);
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
	impulseHeatLevelRangeElement.on("input",function(event){
		heatLevels.impulse = $(event.target).val();
		impulseHeatLevelTextboxElement.val(heatLevels.impulse);
	});
	impulseHeatLevelTextboxElement.on("input",function(event){
		heatLevels.impulse = Number($(event.target).val().replace(/[^\d.-]/g, ''));
		impulseHeatLevelRangeElement.val(heatLevels.impulse);
	});
	warpHeatLevelRangeElement.on("input",function(event){
		heatLevels.warp = $(event.target).val();
		warpHeatLevelTextboxElement.val(heatLevels.warp);
	});
	warpHeatLevelTextboxElement.on("input",function(event){
		heatLevels.warp = Number($(event.target).val().replace(/[^\d.-]/g, ''));
		warpHeatLevelRangeElement.val(heatLevels.warp);
	});
	warpPanLevelTextboxElement.on("input",function(event){
		heatPans.warp = Number($(event.target).val().replace(/[^\d.-]/g, ''));
		if(heatPans.warp == undefined || heatPans.warp == null || isNaN(heatPans.warp)){
			heatPans.warp = 0;
		}
		if(heatPans.warp > 1){
			heatPans.warp = 1;
			$(event.target).val(heatPans.warp);
		}else if(heatPans.warp < -1){
			heatPans.warp = -1;
			$(event.target).val(heatPans.warp);
		}
	});
	impulsePanLevelTextboxElement.on("input",function(event){
		heatPans.impulse = Number($(event.target).val().replace(/[^\d.-]/g, ''));
		if(heatPans.impulse == undefined || heatPans.impulse == null || isNaN(heatPans.impulse)){
			heatPans.impulse = 0;
		}
		if(heatPans.impulse > 1){
			heatPans.impulse = 1;
			$(event.target).val(heatPans.impulse);
		}else if(heatPans.impulse < -1){
			heatPans.impulse = -1;
			$(event.target).val(heatPans.impulse);
		}
	});
	$(".engine-control-core_heatLevel").dblclick(function(event){
		var engine = $(event.target).attr("engine");
		var side = $(event.target).attr("side");
		if(engine == "impulse"){
			if(side == "port"){
				heats.impulse.port = restingHeat;
			}else{
				heats.impulse.starboard = restingHeat;
			}
		}else{
			if(side == "port"){
				heats.warp.port = restingHeat;
			}else{
				heats.warp.starboard = restingHeat;
			}
		}
		Interstellar.setDatabaseValue("engineControl.heat",heats);
	});
	$(".engine-control-core_heatLevel").click(function(event){
		var engine = $(event.target).attr("engine");
		var side = $(event.target).attr("side");
		var value = (event.offsetX / $(event.target).width()) * maxHeat;
		if(engine == "impulse"){
			if(side == "port"){
				heats.impulse.port = value;
			}else{
				heats.impulse.starboard = value;
			}
		}else{
			if(side == "port"){
				heats.warp.port = value;
			}else{
				heats.warp.starboard = value;
			}
		}
		Interstellar.setDatabaseValue("engineControl.heat",heats);
	});
});