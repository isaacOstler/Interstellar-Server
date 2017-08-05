//variables
var damagedSystemStatus = [],
	damagePings = [],
	selectedPing = -1;

//DOM references
var systemList = $("#SystemList"),
	pingList = $("#damagePingsContainer"),
	damagePingTextArea = $("#pingInfoTextContainer"),
	completePingButton = $("#completePingButton");
	

//init functions

//preset observers

//database observers

Interstellar.onDatabaseValueChange("damageControl.damagePings",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("damageControl.damagePings",[]);
		return;
	}
	/*
		Typical object,
		{
			"pingName" : "Whatever",
			"pingData" : "these are the instructions to fix this ping",
			"pingSystem" : "WARP ENGINES",
			"timePassed" : 0 //SECONDS, NOT MILISECONDS
		}
	*/
	var updateInsteadOfDraw = true;
	if(newData.length != damagePings.length){
		updateInsteadOfDraw = false;
	}else{
		for(var i = 0;i < damagePings.length;i++){
			if(damagePings[i].pingName != newData[i].pingName){
				updateInsteadOfDraw = false;
			}
		}
	}
	damagePings = newData;
	if(updateInsteadOfDraw){
		updatePingGUI();
	}else{
		drawPingGUI();
	}
});

Interstellar.onDatabaseValueChange("damageControl.damagedSystems",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("damageControl.damagedSystems",[]);
		return;
	}
	/*
		Typical object,
		{
			"systemName" : "Whatever",
			"timePassed" : 0,
			"timeRequired" : 100, //these are SECONDS, NOT MILISECONDS!!!!!
			"speed" : 1, //these are SECONDS, NOT MILISECONDS!!!!!
		}
	*/

	var updateInsteadOfDraw = true;
	if(newData.length != damagedSystemStatus.length){
		updateInsteadOfDraw = false;
	}else{
		for(var i = 0;i < damagedSystemStatus.length;i++){
			if(damagedSystemStatus[i].systemName != newData[i].systemName){
				updateInsteadOfDraw = false;
			}
		}
	}
	if(updateInsteadOfDraw){
		damagedSystemStatus = newData;
		updateGUI();
	}else{
		for(var i = 0;i < damagedSystemStatus.length;i++){
			$("#systemRow_" + i).off();
		}
		damagedSystemStatus = newData;
		drawGUI();
	}
});

//functions

function formatTime(timeInSeconds){
	var minutes = Math.floor(timeInSeconds / 60);
	var seconds = timeInSeconds - (minutes * 60);
	if(minutes < 10){
		minutes = "0" + minutes;
	}
	if(seconds < 10){
		seconds = "0" + seconds;
	}
	var string = minutes + ":" + seconds;
	return string;
}

function drawPingGUI(){
	var html = "";
	var i;
	for(i = 0;i < damagePings.length;i++){
		html += "<div index='" + i + "' id='damagePing_" + i + "' class='damagePingItem' style='top: " + ((i * 30) + 2) + "px'>";
			html += "<div id='damagePing_" + i + "_time' class='damagePingTime'>"
				html += formatTime(damagePings[i].timePassed);
			html += "</div>";
			html += "<div index='" + i + "' class='damagePingTitle'>";
				html += damagePings[i].pingName;
			html += "</div>";
		html += "</div>";
	}
	pingList.html(html);
	$(".damagePingItem").off();
	$(".damagePingItem").click(function(event){
		playRandomBeep();
		var index = Number($(event.target).attr("index"));
		var pingData = damagePings[index].pingData;
		
		pingData = pingData.replace('\n',"<br / >");
		var regex = new RegExp("\n", 'g');
		pingData = pingData.replace(regex, '<br />');

		selectedPing = index;
		completePingButton.animate({"opacity" : 1});
		damagePingTextArea.html(pingData);
	})
}

function updatePingGUI(){
	for(var i = 0;i < damagePings.length;i++){
		$("#damagePing_" + i + "_time").html(formatTime(damagePings[i].timePassed));
	}
}

function drawGUI(){
	var html = "";
	html += "<div id='moveBar'></div>"
	for(var i = 0;i < damagedSystemStatus.length;i++){
		html += "<div id='systemRow_" + i + "' index='" + i  + "' class='damagedSystemRow' style='top:" + ((i * 40) + 10) + "px'>"
			html += "<div index='" + i  + "' class='damagedSystemRow_label'>" + damagedSystemStatus[i].systemName + "</div>";
			html += "<div index='" + i  + "' class='damagedSystemRow_progress'>";
				html += "<div index='" + i  + "' id='systemProgressLabel_" + i + "' class='damagedSystemRow_progressLabel'>" + roundToFirstDecimal((damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired) * 100) + "%</div>";
				html += "<div index='" + i  + "' id='systemProgressFill_" + i + "' class='damagedSystemRow_progressFill' style='width:" + ((damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired) * 100) + "%;background-color:" + changeHue("#ff0000",(90 * damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired)) + ";'></div>";
			html += "</div>";
		html += "</div>";
	}
	systemList.html(html);
	for(let i = 0;i < damagedSystemStatus.length;i++){
		$("#systemRow_" + i).mousedown(function(event){
			let movingRow = $("#systemRow_" + i);
			var originalPos = movingRow.position().top;
			let offsetX = event.clientX - movingRow.offset().left;
			let offsetY = event.clientY - movingRow.offset().top;
			$("#moveBar").fadeIn("fast");
			$(document).mousemove(function(event){
				var posY = ((event.clientY - systemList.offset().top) - offsetY);
				if(posY < 10){
					posY = 10;
				}
				//movingRow.css("left",((event.clientX - systemList.offset().left) - offsetX) + "px");
				movingRow.css("top",posY + "px");

				var position = Math.floor((posY -  10) / 40);
				if(position > damagedSystemStatus.length){
					position = damagedSystemStatus.length;
				}
				if(position < 0){
					position = 0;
				}
				$("#moveBar").css("top",((position * 40) + 10) + "px");
			});
			$(document).mouseup(function(event){
				var posY = ((event.clientY - systemList.offset().top) - offsetY);
				var position = Math.floor((posY -  10) / 40);
				if(position > Number(movingRow.attr("index"))){
					position--;
				}
				if(position > damagedSystemStatus.length - 1){
					position = damagedSystemStatus.length - 1;
				}
				if(position < 0){
					position = 0;
				}
				var newSystemArray = [];
				var movedSystem = damagedSystemStatus[Number(movingRow.attr("index"))];
				for(var i = 0;i< damagedSystemStatus.length;i++){
					if(damagedSystemStatus[i].systemName != movedSystem.systemName){
						newSystemArray.push(damagedSystemStatus[i]);
					}
				}
				newSystemArray.splice(position,0,movedSystem);
				var differenceDetected = false;
				for(var i = 0;i < damagedSystemStatus.length;i++){
					if(damagedSystemStatus[i].systemName != newSystemArray[i].systemName){
						differenceDetected = true;
					}
				}
				if(differenceDetected){
					Interstellar.setDatabaseValue("damageControl.damagedSystems",newSystemArray);
				}else{
					movingRow.stop();
					movingRow.animate({"top" : originalPos + "px"},0500);
				}
				$(document).off();
				$("#moveBar").fadeOut();
			});
		});
	}
}

function updateGUI(){
	for(var i = 0;i < damagedSystemStatus.length;i++){
		$("#systemProgressFill_" + i ).css("width",roundToFirstDecimal((damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired) * 100) + "%");
		$("#systemProgressFill_" + i).css("background-color",changeHue("#ff0000",(90 * damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired)));
		$("#systemProgressLabel_" + i ).html(roundToFirstDecimal((damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired) * 100) + "%");
		if(damagedSystemStatus[i].timePassed / damagedSystemStatus[i].timeRequired > .17){
			$("#systemProgressLabel_" + i ).css("color","black");
		}else{
			$("#systemProgressLabel_" + i ).css("color","white");
		}
	}
}

function roundToFirstDecimal(num){
   return Math.round( num * 10) / 10;
}

//other crap (hue rotation functions)

function changeHue(rgb, degree) {
    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string and returns an object
function rgbToHSL(rgb) {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(rgb.length == 3){
        rgb = rgb.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(rgb.substr(0, 2), 16) / 255,
        g = parseInt(rgb.substr(2, 2), 16) / 255,
        b = parseInt(rgb.substr(4, 2), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return rgbToHex(r,g,b);
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

//event handlers

completePingButton.click(function(event){
	var newDamagePings = [];
	for(var i = 0;i < damagePings.length;i++){
		if(i != selectedPing){
			newDamagePings.push(damagePings[i]);
		}
	}
	Interstellar.setDatabaseValue("damageControl.damagePings",newDamagePings);
	damagePingTextArea.html("");
	completePingButton.stop();
	completePingButton.animate({"opacity" : 0});
});

//intervals