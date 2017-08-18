/*
	Typical alarm:
	{
		"timePassed" : 0,
		"alarmInfo" : ""
	}
*/

//variables
var rooms = [],
	gasLevels = [],
	numberOfRoomsGeneratedLast = 0,
	currentDeck = 0,
	currentRoom = -1;
	doInitRooms = false,
	firstDraw = true;

//DOM references
var roomList = $("#roomListContainer"),
	deckList = $("#deckListContainer"),
	gasProgressBar = $("#deckControls_gasProgressBar"),
	gasProgressBarFill = $("#deckControls_gasProgressBar_fill"),
	gasProgressBarLabel = $("#deckControls_gasProgressBar_label"),
	lockAllRoomsButton = $("#deckControls_lockAllButton"),
	unlockAllRoomsButton = $("#deckControls_unlockAllbutton"),
	evacuateAllRoomsButton = $("#deckControls_evacAllButton"),
	returnPersonnelToStations = $("#deckControls_returnAllPersonnelButton");

//init calls

Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
	if(newData == null){
		return; // remove this warn for dev mode
		console.warn("WARN: Do not set room values on a station widget!");
		$.getJSON('/resource?path=public/rooms.json', function(roomsJSON) {
			Interstellar.setDatabaseValue("ship.rooms",roomsJSON);
			return;
		});
		return;
	}
	if(doInitRooms){
		doInitRooms = false;
		Interstellar.setDatabaseValue("security.roomInfo",formatRooms(newData));
		var newArray = [];
		for(var i = 0;i < newData.length;i++){
			newArray.splice(newArray.length,0,0);
		}
		Interstellar.setDatabaseValue("security.deckGasLevels",newArray);
	}
});

Interstellar.onDatabaseValueChange("security.deckGasLevels",function(newData){
	if(newData == null){
		return;
	}
	gasLevels = newData;
	if(rooms == undefined || rooms.length == 0){
		return;
	}
	updateRoomsList();
});

Interstellar.onDatabaseValueChange("security.roomInfo",function(newData){
	if(newData == null){
		doInitRooms = true;
		if(Interstellar.getDatabaseValue("ship.rooms") != null){
			Interstellar.setDatabaseValue("security.roomInfo",formatRooms(Interstellar.getDatabaseValue("ship.rooms")));
		}
		return;
	}
	rooms = newData;
	if(firstDraw){
		firstDraw = false;
		drawRoomList(currentDeck);
		drawDeckList();
	}else{
		updateRoomsList();
		updateDeckList();
	}
});

//functions
function updateDeckList(){
	for(var i = 0;i < rooms.length;i++){
		var alarmDetected = false;
		for(var j = 0;j < rooms[i].length;j++){
			if(rooms[i][j].alarms.length > 0){
				alarmDetected = true;
			}
		}
		if(alarmDetected){
			$("#deck_" + i).addClass("alertFlash");
		}else{
			$("#deck_" + i).removeClass("alertFlash");
		}
	}
}

function updateRoomsList(){
	for(var i = 0;i < rooms[currentDeck].length;i++){
		if(gasLevels != undefined){
			gasProgressBarFill.css("width",(gasLevels[currentDeck] * 100) + "%");
			gasProgressBarLabel.html(Math.round(gasLevels[currentDeck] * 100) + "% - " + getGasMessage(gasLevels[currentDeck] * 100))
		}
		if(rooms[currentDeck][i].alarms.length > 0){
			$("#room_" + i).addClass("alertFlash");
		}else{
			$("#room_" + i).removeClass("alertFlash");
		}
		drawSwitch("roomDoor_" + i,rooms[currentDeck][i].doorsLocked);
		drawSwitch("roomEvac_" + i,rooms[currentDeck][i].evacuated);
		if(currentRoom == i){
			var newHTML = "";
			for(var k = 0;k < rooms[currentDeck][i].alarms.length;k++){
				newHTML += "TIME PASSED: " + formatTimeWithSeconds(rooms[currentDeck][i].alarms[k].timePassed);
				newHTML += "<br /><span style='color:red'>";
				newHTML += rooms[currentDeck][i].alarms[k].alarmInfo.toUpperCase();
				newHTML += "</span><br /><br />";
			}
			if(newHTML == ""){
				newHTML = "ALL CLEAR";
			}
			$("#alarm_" + i).html(newHTML);
			drawSwitch("unlockDoorsSwitch",rooms[currentDeck][currentRoom].doorsLocked);
			drawSwitch("evacSwitch",rooms[currentDeck][currentRoom].evacuated);
			if(rooms[currentDeck][currentRoom].doorsLocked){
				$(".roomsList_roomInfoItem_doorsLabel_unLocked").css("color" , "grey");
				$(".roomsList_roomInfoItem_doorsLabel_locked").css("color" , "white");
			}else{
				$(".roomsList_roomInfoItem_doorsLabel_unLocked").css("color" , "white");
				$(".roomsList_roomInfoItem_doorsLabel_locked").css("color" , "grey");
			}
			if(rooms[currentDeck][currentRoom].evacuated){
				$(".roomsList_roomInfoItem_evacLabel_onDuty").css("color" , "grey");
				$(".roomsList_roomInfoItem_evacLabel_evac").css("color" , "white");
			}else{
				$(".roomsList_roomInfoItem_evacLabel_onDuty").css("color" , "white");
				$(".roomsList_roomInfoItem_evacLabel_evac").css("color" , "grey");
			}
		}else{

		}
	}
}

function drawDeckList(){
	var html = "";
	for(var i = 0;i < rooms.length;i++){
		html += "<div class='deckList_item' index='" + i + "' id='deck_" + i + "'>DECK " + formatTwoDigitNumber(i + 1) + "</div>";
	}
	deckList.html(html);
	$(".deckList_item").off();
	$(".deckList_item").click(function(event){
		Interstellar.playRandomBeep();
		var index = Number($(event.target).attr("index"));
		currentDeck = index;
		drawRoomList(currentDeck);
	});
}

function drawRoomList(deck){
	for(var i = 0;i < numberOfRoomsGeneratedLast;i++){
		$("#room_" + i).off();
	}
	if(gasLevels != undefined){
		gasProgressBarFill.css("width",(gasLevels[currentDeck] * 100) + "%");
		gasProgressBarLabel.html(Math.round(gasLevels[currentDeck] * 100) + "% - " + getGasMessage(gasLevels[currentDeck] * 100));
	}
	var roomsForDeck = rooms[deck];
	numberOfRoomsGeneratedLast = roomsForDeck.length;
	var html = "<div class='roomsList_header'><div class='roomsList_header_roomLabel'>ROOM</div><div class='roomsList_header_doorLabel'>DOORS</div><div class='roomsList_header_personnelLabel'>PERSONNEL</div></div>";
	var i; //allocate i outside the for loop, it's faster this way
	for(i = 0;i < numberOfRoomsGeneratedLast;i++){
		var alert = "";
		if(rooms[currentDeck][i].alarms.length > 0){
			alert = "alertFlash";
		}
		html += "<div class='roomsList_item " + alert + "' id='room_" + i + "'>";
		html += roomsForDeck[i].name.toUpperCase() + ", DECK " + formatTwoDigitNumber(currentDeck + 1);
		html += "<canvas class='deckList_item_door switch' id='roomDoor_" + i + "'></canvas>";
		html += "<canvas class='deckList_item_evac switch' id='roomEvac_" + i + "'></canvas>";
		html += "</div>";
	}
	roomList.html(html);
	for(i = 0;i < numberOfRoomsGeneratedLast;i++){
		drawSwitch("roomDoor_" + i,rooms[currentDeck][i].doorsLocked);
		drawSwitch("roomEvac_" + i,rooms[currentDeck][i].evacuated);
		let index = i;
		$("#room_" + i).click(function(event){
			Interstellar.playRandomBeep();
			if(event.target.id != "room_" + index){
				if(event.target.id.includes("roomDoor_")){
					animateSwitch(event.target.id,!rooms[currentDeck][index].doorsLocked,function(){
						rooms[currentDeck][index].doorsLocked = !rooms[currentDeck][index].doorsLocked;
						Interstellar.setDatabaseValue("security.roomInfo",rooms);
					});
				}else if(event.target.id.includes("roomEvac_")){
					animateSwitch(event.target.id,!rooms[currentDeck][index].evacuated,function(){
						rooms[currentDeck][index].evacuated = !rooms[currentDeck][index].evacuated;
						Interstellar.setDatabaseValue("security.roomInfo",rooms);
					});
				}
				return;
			}
			if(index == currentRoom){
				$("#roomInfoItem").slideUp(500,function(){
					$("#roomInfoItem").remove();
					$(event.target).after(newElement);
					currentRoom = -1;
				});
				return;
			}
			currentRoom = index;
			var newElement = "<div id='roomInfoItem' class='roomsList_roomInfoItem'>";
				newElement += "<div class='roomsList_roomInfoItem_roomName'>"
					newElement += rooms[currentDeck][index].name.toUpperCase();// + ", DECK " + formatTwoDigitNumber(currentDeck);
				newElement += "</div>"
				newElement += "<div class='roomsList_roomInfoItem_securityClearance'>"
					newElement += "SECURITY CLEARANCE, LEVEL " + formatTwoDigitNumber(rooms[currentDeck][index].security);
				newElement += "</div>"
				newElement += "<div class='roomsList_roomInfoItem_DescriptionLabel'>";
					newElement += "DESCRIPTION";
				newElement += "</div>";
				newElement += "<div class='roomsList_roomInfoItem_Description'>";
				if(rooms[currentDeck][index].description == "" || rooms[currentDeck][index].description == null || rooms[currentDeck][index].description == undefined){
					newElement += "NO DESCRIPTION";
				}else{
					newElement += rooms[currentDeck][index].description.toUpperCase();
				}
				newElement += "</div>";
				newElement += "<div class='roomsList_roomInfoItem_AlertsLabel'>";
					newElement += "SECURITY ALARMS";
				newElement += "</div>";
				newElement += "<div class='roomsList_roomInfoItem_Alerts' id='alarm_" + index + "'>";
				if(rooms[currentDeck][index].alarms.length == 0){
					newElement += "ALL CLEAR";
				}else{
					for(var k = 0;k < rooms[currentDeck][index].alarms.length;k++){
						newElement += "TIME PASSED: " + rooms[currentDeck][index].alarms[k].timePassed;
						newElement += "<br /><span style='color:red'>"
						newElement += rooms[currentDeck][index].alarms[k].alarmInfo.toUpperCase();;
						newElement += "</span><br /><br />";
					}
				}
				newElement += "</div>";

				newElement += "<div class='roomsList_roomInfoItem_doorsLabel'>";
					newElement += "ROOM DOORS";
				newElement += "</div>";

				var style = "style='color:grey'";

				newElement += "<div class='roomsList_roomInfoItem_doorsLabel_locked'";
				if(!rooms[currentDeck][index].doorsLocked){
					newElement += style;
				}
				newElement += ">"
					newElement += "LOCKED";
				newElement += "</div>";

				newElement += "<div class='roomsList_roomInfoItem_doorsLabel_unLocked'";
				if(rooms[currentDeck][index].doorsLocked){
					newElement += style;
				}
				newElement += ">"
					newElement += "UNLOCKED";
				newElement += "</div>";


				newElement += "<div class='roomsList_roomInfoItem_evacLabel'>";
					newElement += "PERSONEL";
				newElement += "</div>";

				newElement += "<div class='roomsList_roomInfoItem_evacLabel_onDuty'";
				if(rooms[currentDeck][index].evacuated){
					newElement += style;
				}
				newElement += ">"
					newElement += "ON DUTY";
				newElement += "</div>";

				newElement += "<div class='roomsList_roomInfoItem_evacLabel_evac'";
				if(!rooms[currentDeck][index].evacuated){
					newElement += style;
				}
				newElement += ">"
					newElement += "EVACUATED";
				newElement += "</div>";

				newElement += "<div class='roomsList_roomInfoItem_doorsSwitch switch' index='" + index + "'><canvas id='unlockDoorsSwitch' index='" + index + "'></canvas></div>"
				newElement += "<div class='roomsList_roomInfoItem_evacSwitch switch' index='" + index + "'><canvas id='evacSwitch' index='" + index + "'></canvas></div>"
				newElement += "</div>";
			if($("#roomInfoItem").length == 0){
				$(event.target).after(newElement);
				configureEventHandlers();
				$("#roomInfoItem").slideDown(500);
			}else{
				$("#roomInfoItem").slideUp(500,function(){
					$("#roomInfoItem").remove();
					$(event.target).after(newElement);
					configureEventHandlers();
					$("#roomInfoItem").slideDown(500);
				});
			}

		});
	}
}

function configureEventHandlers(){
	drawSwitch("unlockDoorsSwitch",rooms[currentDeck][currentRoom].doorsLocked);
	drawSwitch("evacSwitch",rooms[currentDeck][currentRoom].evacuated);
	$(".roomsList_roomInfoItem_doorsSwitch").off();
	$(".roomsList_roomInfoItem_doorsSwitch").click(function(event){
		Interstellar.playRandomBeep();
		var index = Number($(event.target).attr("index"));
		animateSwitch("unlockDoorsSwitch",!rooms[currentDeck][index].doorsLocked,function(){
			rooms[currentDeck][index].doorsLocked = !rooms[currentDeck][index].doorsLocked;
			Interstellar.setDatabaseValue("security.roomInfo",rooms);
		});
	});

	$(".roomsList_roomInfoItem_evacSwitch").off();
	$(".roomsList_roomInfoItem_evacSwitch").click(function(event){
		Interstellar.playRandomBeep();
		var index = Number($(event.target).attr("index"));
		animateSwitch("evacSwitch",!rooms[currentDeck][index].evacuated,function(){
			rooms[currentDeck][index].evacuated = !rooms[currentDeck][index].evacuated;
			Interstellar.setDatabaseValue("security.roomInfo",rooms);
		});
	});
}

function animateSwitch(switchID,directionPassed,callback){
	let instance = 0;
	var canvas = document.getElementById(switchID);
	if(canvas == null || canvas == undefined){
		return;
	}
	let direction = directionPassed;
	var ctx = canvas.getContext("2d");

	let width = 75;
	let height = 25;
	ctx.strokeStyle = "white";
	let interval = setInterval(function(){
		instance++;
		ctx.clearRect(0,0,width,height);
		if(direction){
			ctx.fillStyle = "red";
			ctx.fillRect(52 - ((instance / 50) * 48), 2, height - 6, height - 6);
		}else{
			ctx.fillStyle = "lime";
			ctx.fillRect(2 + ((instance / 50) * 48), 2, height - 6, height - 6);
		}
		ctx.stroke();

		if(instance > 50){
			clearInterval(interval);
			callback();
		}
	},0001);
}

function drawSwitch(switchID,value){
	var canvas = document.getElementById(switchID);
	if(canvas == null || canvas == undefined){
		return;
	}
	var ctx = canvas.getContext("2d");
	var height = 25;
	var width = 75;
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0,0,width,height);
	ctx.strokeStyle = "white";
	if(value){
		ctx.fillStyle = "red";
		ctx.fillRect(2, 2, height - 6, height - 6);
	}else{
		ctx.fillStyle = "lime";
		ctx.fillRect(52, 2, height - 6, height - 6);
	}
	ctx.stroke();
}

function formatRooms(newData){
	if(newData == undefined){
		return;
	}
	//hopefully this will only ever set once!
	var newArray = [];
	for(var i = 0;i < newData.length;i++){
		newArray.splice(newArray.length,0,[]);
		for(var j = 0;j < newData[i].length;j++){
			var roomData = 
			{
				"name" : newData[i][j].name,
				"security" : newData[i][j].security,
				"description" : newData[i][j].description,
				"alarms" : [],
				"doorsLocked" : false,
				"evacuated" : false,
				"gasLevels" : 0
			}
			newArray[i].splice(newArray[i].length,0,roomData);
		}
	}
	return newArray;
}

function getGasMessage(level){
	if(level > 85){
		return "EXTREMELY TOXIC LEVELS";
	}else if(level > 60){
		return "LIFE THREATENING LEVELS";
	}else if(level > 40){
		return "HARMFUL LEVELS";
	}else if(level > 20){
		return "POTENTIALLY HARMFUL LEVELS";
	}else if(level > 9){
		return "UNCONSCIOUSNESS";
	}else if(level > 3){
		return "HEADACHE AND MINOR SYMPTOMS";
	}else if(level > 0.1){
		return "NEGLIGIBLE EFFECTS";
	}
	return "NO EFFECT";
}

function formatTimeWithSeconds(seconds){
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(minutes / 60);
	seconds = seconds - (minutes * 60);
	minutes = minutes - (hours * 60);
	return formatTwoDigitNumber(hours) + ":" + formatTwoDigitNumber(minutes) + ":" + formatTwoDigitNumber(seconds);
}

function formatTwoDigitNumber(number){
	if(number > 9){
		return number;
	}else{
		return "0" + number;
	}
}

//event handlers

lockAllRoomsButton.click(function(event){
	for(var i = 0;i < rooms[currentDeck].length;i++){
		rooms[currentDeck][i].doorsLocked = true;
	}
	Interstellar.setDatabaseValue("security.roomInfo",rooms);
});
unlockAllRoomsButton.click(function(event){
	for(var i = 0;i < rooms[currentDeck].length;i++){
		rooms[currentDeck][i].doorsLocked = false;
	}
	Interstellar.setDatabaseValue("security.roomInfo",rooms);
});
evacuateAllRoomsButton.click(function(event){
	for(var i = 0;i < rooms[currentDeck].length;i++){
		rooms[currentDeck][i].evacuated = true;
	}
	Interstellar.setDatabaseValue("security.roomInfo",rooms);
});
returnPersonnelToStations.click(function(event){
	for(var i = 0;i < rooms[currentDeck].length;i++){
		rooms[currentDeck][i].evacuated = false;
	}
	Interstellar.setDatabaseValue("security.roomInfo",rooms);
});

gasProgressBar.mousedown(function(event){
	var offsetX = gasProgressBar.offset().left;
	var width = gasProgressBar.width();
	$(document).mousemove(function(event){
		//for some reason, this is inverted?
		var newProgress = ((offsetX - event.clientX) / width) * -1;
		if(newProgress < 0){
			newProgress = 0;
		}else if(newProgress > 1){
			newProgress = 1;
		}
		gasProgressBarFill.css("width",(newProgress * 100) + "%");
		gasProgressBarLabel.html(Math.round(newProgress * 100) + "% - " + getGasMessage(newProgress * 100))
	});
	$(document).mouseup(function(event){
		var newProgress = ((offsetX - event.clientX) / width) * -1;
		if(newProgress < 0){
			newProgress = 0;
		}else if(newProgress > 1){
			newProgress = 1;
		}
		gasLevels[currentDeck] = newProgress;
		console.log(gasLevels);
		Interstellar.setDatabaseValue("security.deckGasLevels",gasLevels);
		$(document).off();
	});
});