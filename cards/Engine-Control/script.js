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
	maxHeat = 10000,
	currentEngine = 0, //0 for impulse, 1 for warp
	alertStatus = 5,
	impulseSpeeds = ["1/4","1/2","3/4","FULL"],
	warpSpeeds = [1,2,3,4,5,6,7,8,9,9.23];

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
	warpContainer = $("#warpContainer"),
	impulseContainer = $("#impulseContainer"),
	currentSpeedContainer = $("#currentSpeed");
//init calls
init();

//preset observers

//database observers

Interstellar.onDatabaseValueChange("engineControl.currentEngine",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("engineControl.currentEngine",0);
		return;
	}
	currentEngine = newData;
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
});

//functions

function init(){
	drawGUI();
	initHeatDisplays();
	drawHeatDisplays();
}

function drawGUI(){
	var html = "";
	var width = (warpContainer.width() + 2) / warpSpeeds.length;
	var i;
	for(i = 0;i < warpSpeeds.length;i++){
		var style = "'left:" + (i * width) + "px;width: " + width + "px'";
		html += "<div style=" + style + " speed='" + warpSpeeds[i] + "' class='speedButton warpButton verticalAlign beepOnClick'>";
		html += warpSpeeds[i];
		html += "</div>";
	}
	warpContainer.html(html);
	html = "";
	width = (impulseContainer.width() + 2) / impulseSpeeds.length;
	for(i = 0;i < impulseSpeeds.length;i++){
		var style = "'left:" + (i * width) + "px;width: " + width + "px'";
		html += "<div style=" + style + " speed='" + impulseSpeeds[i] + "' class='speedButton impulseButton verticalAlign beepOnClick'>";
		html += impulseSpeeds[i];
		html += "</div>";
	}
	impulseContainer.html(html);
}

setInterval(function(){
	heatVariance.impulse.port = (Math.random() * 1) + (Math.random() * -1);
	heatVariance.impulse.starboard = (Math.random() * 1) + (Math.random() * -1);
	heatVariance.warp.port = (Math.random() * 1) + (Math.random() * -1);
	heatVariance.warp.starboard = (Math.random() * 1) + (Math.random() * -1);
	drawHeatDisplays();
},0450);

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
				heatValueInPercentage = Math.log((heats.impulse.starboard + heatVariance.impulse.starboard) - 60) / Math.log(maxHeat);
			}else{
				element = heatDisplays.impulse.portCanvas;
				heat = heats.impulse.port + heatVariance.impulse.port
				heatValueInPercentage = Math.log((heats.impulse.port + heatVariance.impulse.port) - 60) / Math.log(maxHeat);
			}
		}else{
			if(i == 0){
				element = heatDisplays.warp.starboardCanvas;
				heat = heats.warp.starboard + heatVariance.warp.starboard;
				heatValueInPercentage = Math.log((heats.warp.starboard + heatVariance.warp.starboard) - 60) / Math.log(maxHeat);
			}else{
				element = heatDisplays.warp.portCanvas;
				heat = heats.warp.port + heatVariance.warp.port;
				heatValueInPercentage = Math.log((heats.warp.port + heatVariance.warp.port) - 60) / Math.log(maxHeat);
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
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#FF0');
	    someColors.push('#F00');
	    someColors.push('#F00');
	    someColors.push('#F00');
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
      	ctx.fillText(Math.round(heat) + "°",center,center + 15);
		ctx.stroke();
		ctx.beginPath();
    	ctx.strokeStyle = "rgba(255,0,0,.5)";
	    ctx.lineWidth = radius * .3965;
		ctx.arc(center,center,radius * 0.795,-0.5*Math.PI,(((heatValueInPercentage) * 2) - 0.5)*Math.PI);
		ctx.stroke();
	}
}
//event handlers
$(".impulseButton").click(function(event){
	var speed = $(event.target).attr("speed");
	for(var i = 0;i < impulseSpeeds.length;i++){
		if(impulseSpeeds[i] == speed){
			Interstellar.setDatabaseValue("engineControl.currentEngine",0);
			Interstellar.setDatabaseValue("engineControl.currentSpeed",impulseSpeeds[0]);
		}
	}
});

$(".warpButton").click(function(event){
	var speed = $(event.target).attr("speed");
	for(var i = 0;i < impulseSpeeds.length;i++){
		if(warpSpeeds[i] == speed){
			Interstellar.setDatabaseValue("engineControl.currentEngine",1);
			Interstellar.setDatabaseValue("engineControl.currentSpeed",warpSpeeds[0]);
		}
	}
});

$("#fullStopButton").click(function(event){
	Interstellar.setDatabaseValue("engineControl.currentSpeed",undefined);
});