//variables
var heats = {
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
	heatVariance = {
		"impulse" :
		{
			"port" : 0,
			"starboard" : 0
		},
		"warp" :
		{
			"port" : 0,
			"starboard" : 0
		}
	}
	maxHeat = 1200,
	currentEngine = 0, //0 for impulse, 1 for warp
	currentSpeed = 0, //index of the speed (for the speed arrays)
	alertStatus = 5,
	impulseSpeeds = ["1/4","1/2","3/4","FULL"],
	warpSpeeds = [1,2,3,4,5,6,7,8,9,9.23],
	warpPower = 999, //until we know otherwise, assume we have enough power
	impulsePower = 999, //until we know otherwise, assume we have enough power
	flashNotEnoughPowerInterval = undefined,
	flushCoolantInterval = undefined,
	impulseOffline = false,
	warpOffline = false,
	coolant = [];

//DOM references
var heatDisplays = {
		"warp" : 
		{
			"starboardCanvas" : $("#warpStarboardCanvas"),
			"portCanvas" : $("#warpPortCanvas")
		},
		"impulse" :
		{
			"starboardCanvas" : $("#impulseStarboardCanvas"),
			"portCanvas" : $("#impulsePortCanvas")
		}
	},
	warpContainer = $("#warpButtonContainer"),
	impulseContainer = $("#impulseButtonContainer"),
	currentSpeedContainer = $("#currentSpeed"),
	notEnoughPowerElement = $("#notEnoughPower"),
	notEnoughPowerTextElement = $("#notEnoughPowerText"),
	currentSpeedLabel = $("#currentSpeed"),
	warpOfflineElement = $("#warpOffline"),
	impulseOfflineElement = $("#impulseOffline"),
	coolantFillBar = $("#coolantAmountFillBar");
//init calls
init();

//preset observers

//database observers

Interstellar.onDatabaseValueChange("engineControl.heat",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("engineControl.heat",heats);
		return;
	}
	heats = newData;
	drawHeatDisplays();
});

Interstellar.onDatabaseValueChange("coolant.systemCoolantLevels",function(newData){
	if(newData == null){
		//do not set this value!  We are not responsible for it!
		return;
	}
	coolant = newData;
	drawGUI();
});

Interstellar.onDatabaseValueChange("engineControl.engineInformation",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine" : 0,"currentSpeed" : -1});
		return;
	}
	currentSpeed = newData.currentSpeed;
	if(currentEngine != newData.currentEngine){
		currentEngine = newData.currentEngine;
		if(currentEngine == 0){
			heatDisplays.impulse.starboardCanvas.fadeIn();
			heatDisplays.impulse.portCanvas.fadeIn();
			heatDisplays.warp.starboardCanvas.fadeOut();
			heatDisplays.warp.portCanvas.fadeOut();
		}else{
			heatDisplays.impulse.portCanvas.fadeOut();
			heatDisplays.impulse.starboardCanvas.fadeOut();
			heatDisplays.warp.portCanvas.fadeIn();
			heatDisplays.warp.starboardCanvas.fadeIn();
		}
		drawHeatDisplays();
	}
	drawGUI();
});

Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("ship.alertStatus",5);
		return;
	}
	alertStatus = newData;
	drawGUI();
});

Interstellar.onDatabaseValueChange("ship.systems",function(newData){
	if(newData == null){
		//we do not set this.  Period.  Stop trying to change the code James.
		return;
	}
	var err = "Could not find warp engines!  (On ship system list)";
	for(var i = 0;i < newData.length;i++){
		if(newData[i].systemName.includes("WARP")){
			err = undefined;
			warpOffline = newData[i].isDamaged;
			if(warpOffline && currentEngine == 1 && currentSpeed > 0){
				flashWarpOffline();
				Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine":currentEngine,"currentSpeed":-1});
			}
			for(var j = 0;j < newData[i].requiredPower.length;j++){
				if(newData[i].requiredPower[j] <= newData[i].systemPower){
					warpPower = j;
				}
			}
		}
	}
	if(err != undefined){
		console.warn(err);
	}
	err = "Could not find impulse engines!  (On ship system list)";
	for(var i = 0;i < newData.length;i++){
		if(newData[i].systemName.includes("IMPULSE")){
			err = undefined;
			impulseOffline = newData[i].isDamaged;
			if(impulseOffline && currentEngine == 0 && currentSpeed > 0){
				flashImpulseOffline();
				Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine":currentEngine,"currentSpeed":-1});
			}
			for(var j = 0;j < newData[i].requiredPower.length;j++){
				if(newData[i].requiredPower[j] <= newData[i].systemPower){
					impulsePower = j;
				}
			}
		}
	}
	if(err != undefined){
		console.warn(err);
	}
	drawGUI();
});
//functions

function init(){
	drawGUI();
	initHeatDisplays();
	drawHeatDisplays();
}

function drawGUI(){
	if(currentSpeed < 0){
		currentSpeedLabel.html("FULL STOP");
	}else{
		if(currentEngine == 0){
			currentSpeedLabel.css("font-size","36px");
			currentSpeedLabel.html(impulseSpeeds[currentSpeed] + " IMPULSE");
		}else{
			currentSpeedLabel.css("font-size","59px");
			currentSpeedLabel.html("WARP " + warpSpeeds[currentSpeed]);
		}
	}
	if(coolant != undefined){
		for(var i = 0;i < coolant.length;i++){
			if(coolant[i].systemName.includes("ENGINE")){
				var coolantAmount = coolant[i].coolantAmount;
				coolantFillBar.css("width",(coolantAmount * 100) + "%")
				break;
			}
		}
	}
	var html = "";
	var width = (warpContainer.width() + 2) / warpSpeeds.length;
	var i;
	var color;
	switch(Number(alertStatus)){
        case 5:
        color = 'rgba(66, 191, 244, 0.5)'; //set the color to white
        break;
        case 4:
        color = 'rgba(65, 244, 166, 0.5)'; //set the color to a greenish blue color
        break;
        case 3:
        color = 'rgba(244, 238, 66, 0.5)'; //set the color to yellow
        break;
        case 2:
        color = 'rgba(172, 119, 32, 0.6)'; //set the color to orange
        break;
        case 1:
        color = 'rgba(255, 0, 0, 0.5)'; //set the color to red
        break;
    	default: //in case the alert status is something wierd, default to this
    	color = 'rgba(66, 191, 244, 0.5)';
    	break;
	}
	if(warpOffline){
		warpOfflineElement.fadeIn();
	}else{
		warpOfflineElement.fadeOut();
	}
	for(i = 0;i < warpSpeeds.length;i++){
		var style = "'left:" + (i * width) + "px;width: " + width + "px;";
		if(i <= currentSpeed && currentEngine == 1){
			style += "background-color:" + color + ";"
		}else if(i <= warpPower){
			//style += "background-color:rgba(255,150,0,.6);"
		}
		style += "'";
		html += "<div style=" + style + " speed='" + i + "' class='speedButton warpButton verticalAlign'>";
		html += warpSpeeds[i];
		html += "</div>";
	}
	var style = "'width:" + (width * (warpPower + 1)) + "px'";
	html += "<div class='powerContainer' style=" + style + ">";
	html += "POWER"
	html += "</div>"
	warpContainer.html(html);
	html = "";

	if(impulseOffline){
		impulseOfflineElement.fadeIn();
	}else{
		impulseOfflineElement.fadeOut();
	}
	width = (impulseContainer.width() + 2) / impulseSpeeds.length;
	for(i = 0;i < impulseSpeeds.length;i++){
		var style = "'left:" + (i * width) + "px;width: " + width + "px;";
		if(i <= currentSpeed && currentEngine == 0){
			style += "background-color:" + color + ";"
		}else if(i <= impulsePower){
			//style += "background-color:rgba(255,150,0,.6);"
		}
		style += "'";
		html += "<div style=" + style + " speed='" + i + "' class='speedButton impulseButton verticalAlign'>";
		html += impulseSpeeds[i];
		html += "</div>";
	}
	var style = "'width:" + (width * (impulsePower + 1)) + "px'";
	html += "<div class='powerContainer' style=" + style + ">";
	html += "POWER"
	html += "</div>"
	impulseContainer.html(html);
	$(".impulseButton").off();
	$(".impulseButton").click(function(event){
		if(impulseOffline){
			flashImpulseOffline();
			return;
		}
		var speed = $(event.target).attr("speed");
		if(speed > impulsePower){
			flashNotEnoughPower();
			return;
		}
		playRandomBeep();
		notEnoughPowerElement.slideUp();
		Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine":0,"currentSpeed":speed});
	});

	$(".warpButton").off();
	$(".warpButton").click(function(event){
		if(warpOffline){
			flashWarpOffline();
			return;
		}
		var speed = $(event.target).attr("speed");
		if(speed > warpPower){
			flashNotEnoughPower();
			return;
		}
		playRandomBeep();
		notEnoughPowerElement.slideUp();
		Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine":1,"currentSpeed":speed});
	});
}

setInterval(function(){
	heatVariance.impulse.port = (Math.random() * 1) + (Math.random() * -1);
	heatVariance.impulse.starboard = (Math.random() * 1) + (Math.random() * -1);
	heatVariance.warp.port = (Math.random() * 1) + (Math.random() * -1);
	heatVariance.warp.starboard = (Math.random() * 1) + (Math.random() * -1);
	drawHeatDisplays();
},0450);

function flashWarpOffline(){
	notEnoughPowerTextElement.html("WARP ENGINES OFFLINE");
	flashElement();
}

function flashImpulseOffline(){
	notEnoughPowerTextElement.html("IMPULSE ENGINES OFFLINE");
	flashElement();
}

function flashNotEnoughPower(){
	notEnoughPowerTextElement.html("ADDITIONAL POWER REQUIRED");
	flashElement();
}

function flashElement(){
	Interstellar.playErrorNoise();
	notEnoughPowerElement.slideDown();
	if(flashNotEnoughPowerInterval != undefined){
		clearInterval(flashNotEnoughPowerInterval);
		flashNotEnoughPowerInterval = undefined;
	}
	let flashState = 0;
	let timesFlashed = 0;
	let maxFlashes = 10;
	flashNotEnoughPowerInterval = setInterval(function(){
		if(timesFlashed >= maxFlashes){
			clearInterval(flashNotEnoughPowerInterval);
			flashNotEnoughPowerInterval = undefined;
			notEnoughPowerElement.slideUp();
			return;
		}
		if(flashState == 0){
			flashState = 1;
			notEnoughPowerTextElement.css("color","rgb(128,0,0)");
		}else{
			flashState = 0;
			notEnoughPowerTextElement.css("color","rgb(255,0,0)");
		}
		timesFlashed++;
	},0250);
}

function initHeatDisplays(){
	for(var i = 0;i < 4;i++){
		var element;
		var heat;
		var heatValueInPercentage;
		if(i == 0){
			element = heatDisplays.impulse.starboardCanvas;
		}else if(i == 1){
			element = heatDisplays.impulse.portCanvas;
		}else if(i == 2){
			element = heatDisplays.warp.starboardCanvas;
		}else{
			element = heatDisplays.warp.portCanvas;
		}
		element.css("left",((element.width() - element.height()) / 2) + "px");
		element.width(element.height());
	}
}

function drawHeatDisplays(){
	for(var i = 0;i < 2;i++){
		var element;
		var heat;
		var heatValueInPercentage;
		if(currentEngine == 0){
			if(i == 0){
				element = heatDisplays.impulse.starboardCanvas;
				heat = heats.impulse.starboard + heatVariance.impulse.starboard;
				heatValueInPercentage = Math.log((heats.impulse.starboard + heatVariance.impulse.starboard) - 50) / Math.log(maxHeat);
			}else{
				element = heatDisplays.impulse.portCanvas;
				heat = heats.impulse.port + heatVariance.impulse.port
				heatValueInPercentage = Math.log((heats.impulse.port + heatVariance.impulse.port) - 50) / Math.log(maxHeat);
			}
		}else{
			if(i == 0){
				element = heatDisplays.warp.starboardCanvas;
				heat = heats.warp.starboard + heatVariance.warp.starboard;
				heatValueInPercentage = Math.log((heats.warp.starboard + heatVariance.warp.starboard) - 50) / Math.log(maxHeat);
			}else{
				element = heatDisplays.warp.portCanvas;
				heat = heats.warp.port + heatVariance.warp.port;
				heatValueInPercentage = Math.log((heats.warp.port + heatVariance.warp.port) - 50) / Math.log(maxHeat);
			}
		}
		if(heatValueInPercentage <= 0){
			heatValueInPercentage = .001;
		}
		var ctx = document.getElementById($(element).attr('id')).getContext("2d");
		var center = element.height() / 2;
		document.getElementById($(element).attr('id')).width = center * 2;
		document.getElementById($(element).attr('id')).height = center * 2;
		ctx.clearRect(0,0,1000,1000); //clear old draws
      	ctx.lineWidth=2;
		var radius = center * .85;
		function drawMultiRadiantCircle(xc, yc, r, radientColors) {
		    var partLength = (2 * Math.PI) / radientColors.length;
		    var start = 0;
		    var gradient = null;
		    var startColor = null,
		        endColor = null;

		    for (var i = 0; i < radientColors.length; i++) {
		        startColor = radientColors[i];
		        endColor = radientColors[(i + 1) % radientColors.length];

		        // x start / end of the next arc to draw
		        var xStart = xc + Math.cos(start) * r;
		        var xEnd = xc + Math.cos(start + partLength) * r;
		        // y start / end of the next arc to draw
		        var yStart = yc + Math.sin(start) * r;
		        var yEnd = yc + Math.sin(start + partLength) * r;

		        ctx.beginPath();

		        gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
		        gradient.addColorStop(0, startColor);
		        gradient.addColorStop(1.0, endColor);

		        ctx.strokeStyle = gradient;
		        ctx.arc(xc, yc, r, start, start + partLength);
		        ctx.lineWidth = radius * .397;
		        ctx.stroke();
		        ctx.closePath();

		        start += partLength;
		    }
		}
	    var someColors = [];
	    someColors.push('#0F0');
	    someColors.push('#0F0');
	    someColors.push('#0F0');
	    someColors.push('#0F0');
	    someColors.push('#0F0');
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#F00');
	    someColors.push('#F00');
	    someColors.push('#F00');
	    someColors.push('#0F0');
	    someColors.push('#0F0');
	    someColors.push('#0F0');

	    drawMultiRadiantCircle(center, center, radius * .8, someColors);

		var color;
    	switch(Number(alertStatus)){
	        case 5:
	        	color = 'rgba(66, 191, 244, 0.3)'; //set the color to white
	        break;
	        case 4:
	        	color = 'rgba(65, 244, 166, 0.3)'; //set the color to a greenish blue color
	        break;
	        case 3:
	        	color = 'rgba(244, 238, 66, 0.3)'; //set the color to yellow
	        break;
	        case 2:
	        	color = 'rgba(172, 119, 32, 0.6'; //set the color to orange
	        break;
	        case 1:
	        	color = 'rgba(255, 0, 0, 0.5)'; //set the color to red
	        break;
	       	default: //in case the alert status is something wierd, default to this
	       		color = 'rgba(66, 191, 244, 0.3)';
	       	break;
    	}

		ctx.beginPath();
    	ctx.strokeStyle = "white";
	    ctx.lineWidth = 2;
		// Create gradient
	    grd = ctx.createRadialGradient(center, center, 0.000, center, center, center);
	      
	    // Add colors
	    grd.addColorStop(0.4995, 'rgba(0, 0, 0, 0.000)');
	    grd.addColorStop(0.5, 'rgba(25, 25, 25, 1.000)');
	    grd.addColorStop(1.000, 'rgba(0,0,0,0)');
	      
	    // Fill with gradient
	    ctx.fillStyle = grd;
		ctx.arc(center,center,radius,0,2*Math.PI);
		ctx.moveTo(center + (radius * .595),center);
		ctx.arc(center,center,radius * .595,0,2 * Math.PI);
		ctx.shadowBlur = 5;
    	ctx.shadowColor = color;
		ctx.fill();
		ctx.font = (radius * .3) + "px Arial";
      	ctx.textAlign = 'center';
      	ctx.fillStyle = "white";
      	ctx.fillText(Math.round(heat) + "° F",center,center + 15);
		ctx.stroke();
		ctx.beginPath();
    	ctx.strokeStyle = "rgba(255,0,0,.5)";
	    ctx.lineWidth = radius * .3965;
		ctx.arc(center,center,radius * 0.795,-0.5*Math.PI,(((heatValueInPercentage) * 2) - 0.5)*Math.PI);
		ctx.stroke();
	}
}
//event handlers

//for warp and impulse event handlers, see DrawGUI()

$("#fullStopButton").click(function(event){
	Interstellar.setDatabaseValue("engineControl.engineInformation",{"currentEngine":currentEngine,"currentSpeed":-1});
});

$(".flushCoolant").mousedown(function(event){
	if(coolant == undefined || coolant.length == 0){
		Interstellar.playErrorNoise();
		return;
	}
	for(var i = 0;i < coolant.length;i++){
		if(coolant[i].systemName.includes("ENGINE")){
			coolantAmount = coolant[i].coolantAmount;
			coolantFillBar.css("width",(coolantAmount * 100) + "%")
			coolantAmount -= .0025;
			if(coolantAmount <= 0){
				Interstellar.playErrorNoise();
				return;
			}
			break;
		}
	}
	let engineFlushing = $(event.target).attr("engine");
	if(flushCoolantInterval != undefined){
		clearInterval(flushCoolantInterval);
		flushCoolantInterval = undefined;
	}
	flushCoolantInterval = setInterval(function(){
		var amountToChange = 0;
		for(var i = 0;i < coolant.length;i++){
			if(coolant[i].systemName.includes("ENGINE")){
				coolantAmount = coolant[i].coolantAmount;
				coolantFillBar.css("width",(coolantAmount * 100) + "%")
				coolantAmount -= .0025;
				coolant[i].coolantAmount = coolantAmount;
				Interstellar.setDatabaseValue("coolant.systemCoolantLevels",coolant);
				if(coolantAmount <= 0){
					if(flushCoolantInterval != undefined){
						clearInterval(flushCoolantInterval);
						flushCoolantInterval = undefined;
					}
					$(document).off();
					return;
				}
				break;
			}
		}
		if(currentEngine == 0){
			if(engineFlushing == "port"){
				amountToChange = ((heats.impulse.port - 58) / maxHeat) * 50;
			}else{
				amountToChange = ((heats.impulse.starboard - 58) / maxHeat) * 50;
			}
		}else{
			if(engineFlushing == "port"){
				amountToChange = ((heats.warp.port - 58) / maxHeat) * 50;
			}else{
				amountToChange = ((heats.warp.starboard - 58) / maxHeat) * 50;
			}
		}
		if(currentEngine == 0){
			if(engineFlushing == "port"){
				heats.impulse.port -= amountToChange;
				if(heats.impulse.port < 0){
					heats.impulse.port = 0;
				}
			}else{
				heats.impulse.starboard -= amountToChange;
				if(heats.impulse.starboard < 0){
					heats.impulse.starboard = 0;
				}
			}
		}else{
			if(engineFlushing == "port"){
				heats.warp.port -= amountToChange;
				if(heats.warp.port < 0){
					heats.warp.port = 0;
				}
			}else{
				heats.warp.starboard -= amountToChange;
				if(heats.warp.starboard < 0){
					heats.warp.starboard = 0;
				}
			}
		}
		Interstellar.setDatabaseValue("engineControl.heat",heats);
	},0040);
	$(document).mouseup(function(event){
		if(flushCoolantInterval != undefined){
			clearInterval(flushCoolantInterval);
			flushCoolantInterval = undefined;
		}
		$(document).off();
	})
});

