var securityMonitorCoreHasInit = false;

Interstellar.addCoreWidget("Login Names",function(){

	if(securityMonitorCoreHasInit){
		return;
	}
	securityMonitorCoreHasInit = true;

	//variables
	var thisWidget = this,
		rooms = [],
		gasLevels = [],
		doInitRooms = false,
		hasDrawn = false,
		currentDeck = 0,
		currentRoom = 0,
		oldAlarmLength = 0,
		lastRoomsSpawned = 0,
		loadedAlarms = [],
		timerInterval = undefined,
		defaultAlarmPresets =
		[
			{
				"name" : "Intruder detected".toUpperCase(),
				"alarmInfo" : "a crew member has reported that an intruder was seen in this location, a security team should be deployed immediately.".toUpperCase()
			},
			{
				"name" : "suspicious individual".toUpperCase(),
				"alarmInfo" : "a crew member has reported a suspicious individual in the area, a security team should be deployed immediately.".toUpperCase()
			},
			{
				"name" : "medical emergency".toUpperCase(),
				"alarmInfo" : "a crew member has reported a medical emergency for this room, the ship's sickbay should be alerted immediately and security personnel should be deployed for emergency medical care.".toUpperCase()
			},
			{
				"name" : "plasma leak".toUpperCase(),
				"alarmInfo" : "a plasma leak has been detected in this room.  all nearby rooms should be evacuated due to toxic fumes, and damage control should be notified.".toUpperCase()
			},
			{
				"name" : "fire".toUpperCase(),
				"alarmInfo" : "a fire has been detected in this location.  the fire will continue to spread if this room is not sealed.  all nearby personnel should be evacuated from this room.".toUpperCase()
			},
			{
				"name" : "hull breach".toUpperCase(),
				"alarmInfo" : "a hull breach (a hole in the ship's wall), was detected in this location.  oxygen will be drained from this room until the doors are sealed.  any personnel in this room were likely vented.".toUpperCase()
			},
			{
				"name" : "unauthorized transport".toUpperCase(),
				"alarmInfo" : "an unauthorized transport to this room was detected, unauthorized intruders could be present.".toUpperCase()
			},
			{
				"name" : "bomb".toUpperCase(),
				"alarmInfo" : "an armed explosive device was detected in this room, time until detonation could not be detected.".toUpperCase()
			}
		];

	//DOM References
	var deckList = $("#Security-Monitor-Core_deckList"),
		roomList = $("#Security-Monitor-Core_roomList"),
		alarmList = $("#Security-Monitor-Core_alarmControls_currentAlarmsList"),
		sortByAlpha = $("#Security-Monitor-Core_alarmControls_sortType_alpha"),
		sortByDeck = $("#Security-Monitor-Core_alarmControls_sortType_deck"),
		alarmSelectDropdown = $("#Security-Monitor-Core_alarmControls_alarmDropdown"),
		alarmLocationSelectDropdown = $("#Security-Monitor-Core_alarmControls_locationDropdown"),
		editAlarmsButton = $("#Security-Monitor-Core_alarmControls_editButton"),
		createAlarmButton = $("#Security-Monitor-Core_alarmControls_createButton"),
		alarmEditorWindow_addButton = $("#security_monitor_core_editAlarmWindow_addButton"),
		alarmEditorWindow_removeButton = $("#security_monitor_core_editAlarmWindow_removeButton"),
		alarmEditorWindow_alarmsList = $("#security_monitor_core_editAlarmWindow_pingList"),
		alarmEditorWindow_alarmTitleTextbox = $("#security_monitor_core_editAlarmWindow_pingTitle"),
		alarmEditorWindow_alarmTextbox = $("#security_monitor_core_editAlarmWindow_pingData");

		
	//init calls
	drawDeckList();
	//interstellar calls
	thisWidget.onResize = function(){

	}

	//functions

	function drawAlarms(){
		var i;
		var j;
		var k;
		var alarms = [];
		/*object: 
			{
				"room" : "MAIN ENGINEERING, DECK 12",
				"name" : "Inturders detected",
				"alarmInfo" : "aaaa, there are intruders here",
				"timePassed" : 0
			}
		*/
		for(i = 0;i < rooms.length;i++){
			for(j = 0;j < rooms[i].length;j++){
				for(k = 0;k < rooms[i][j].alarms.length;k++){
					var alarmFound =
					{
						"room" : rooms[i][j].name.toUpperCase() + ", DECK " + (i + 1),
						"name" : rooms[i][j].alarms[k].name,
						"alarmInfo" : rooms[i][j].alarms[k].alarmInfo,
						"timePassed" : rooms[i][j].alarms[k].timePassed,
						"guid" : rooms[i][j].alarms[k].guid
					}
					alarms.splice(alarms.length,0,alarmFound);
				}
			}
		}
		/*for(i = 0;i < oldAlarmLength;i++){
			$("#Security-Monitor-Core_alarmControls_currentAlarmsList_item_" + i).off();
		}*/
		oldAlarmLength = alarms.length;
		var html = "";
		for(i = 0;i < oldAlarmLength;i++){
			var guid = alarms[i].guid;
			console.log(alarms[i]);
			html += "<div guid='" + guid + "' id='Security-Monitor-Core_alarmControls_currentAlarmsList_item_" + i + "' class='Security-Monitor-Core_alarmControls_currentAlarmsList_item'>";
    		html += "<div guid='" + guid + "' class='Security-Monitor-Core_alarmControls_currentAlarmsList_item_alarmLabel'>" + alarms[i].name + "</div>";
    		html += "<div guid='" + guid + "' class='Security-Monitor-Core_alarmControls_currentAlarmsList_item_roomLabel'>" + alarms[i].room + "</div>";
    		html += "<div guid='" + guid + "' class='Security-Monitor-Core_alarmControls_currentAlarmsList_item_timeLabel'>" + formatTimeWithSeconds(alarms[i].timePassed) + "</div>";
    		html += "<div guid='" + guid + "' class='Security-Monitor-Core_alarmControls_currentAlarmsList_item_delete'>";
    		html += "<svg guid='" + guid + "' fill='#FFFFFF' height='14' viewBox='0 0 24 24' width='14' xmlns='http://www.w3.org/2000/svg'>";
    		html += "<path guid='" + guid + "' d='M0 0h24v24H0V0z' fill='none'/>";
    		html += "<path guid='" + guid + "' d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z'/>";
    		html += "<path guid='" + guid + "' d='M0 0h24v24H0z' fill='none'/>";
			html += "</svg>";
			html += "</div>";
    		html += "</div>";
    		html += "</div>";
		}
		alarmList.html(html);
		$(".Security-Monitor-Core_alarmControls_currentAlarmsList_item_delete").off();
		$(".Security-Monitor-Core_alarmControls_currentAlarmsList_item_delete").click(function(event){
			var guid = $(event.target).attr("guid");
			var i;
			var j;
			var k;
			for(i = 0;i < rooms.length;i++){
				for(j = 0;j < rooms[i].length;j++){
					for(k = 0;k < rooms[i][j].alarms.length;k++){
						if(rooms[i][j].alarms[k].guid == guid){
							rooms[i][j].alarms.splice(k,1);
							Interstellar.setDatabaseValue("security.roomInfo",rooms);
							return;
						}
					}
				}
			}
		});
	}

	function updateAlarms(){

	}

	function drawDeckList(){

		//header

    	html = "<div class='Security-Monitor-Core_deckList_header'>";
    	html += "<div class='Security-Monitor-Core_deckList_header_deck' id='Security-Monitor-Core_deckList_header_deck_" + i + "'>";
    	html += "Deck";
    	html += "</div>";
    	html += "<div class='Security-Monitor-Core_deckList_header_doors' id='Security-Monitor-Core_deckList_header_doors_" + i + "'>";
    	html += "Doors";
    	html += "</div>";
    	html += "<div class='Security-Monitor-Core_deckList_header_evac' id='Security-Monitor-Core_deckList_header_evac_" + i + "'>";
    	html += "Evac";
    	html += "</div>";
    	html += "<div class='Security-Monitor-Core_deckList_header_gas' id='Security-Monitor-Core_deckList_header_gas_" + i + "'>";
    	html += "Gas";
    	html += "</div>";
    	html += "</div>";

    	//each deck

    	for(var i = 0;i < rooms.length;i++){
    		var doorsSealed = 0.0;
    		var roomsEvac = 0.0;
    		var totalDoors = rooms[i].length;
    		for(var j = 0;j < rooms[i].length;j++){
    			if(rooms[i][j].doorsLocked){
    				doorsSealed++;
    			}
    			if(rooms[i][j].evacuated){
    				roomsEvac++;
    			}
    		}
    		var percentageDoors = doorsSealed / totalDoors;
    		var percentageEvac = roomsEvac / totalDoors;
    		var percentageGas = 0;
    		if(!(gasLevels == undefined || gasLevels.length == 0)){
    			percentageGas = gasLevels[i];
    		}
    		html += "<div index='" + i + "' id='securityMonitorCore_deck_" + i + "' class='Security-Monitor-Core_deckList_item'>";
    		html += "<div index='" + i + "' id='Security-Monitor-Core_deckList_item_deck_" + i + "' class='Security-Monitor-Core_deckList_item_deck'>";
    		html += "Deck " + (i + 1);
    		html += "</div>";
    		html += "<div index='" + i + "' class='Security-Monitor-Core_deckList_item_doors'>";
    		html += "<input index='" + i + "' type='text' id='Security-Monitor-Core_deckList_header_doors_" + i + "' class='security-monitor-core_deckTextbox' value='" + Math.round(percentageDoors * 100) + "%' style='background-color:" + Interstellar.rotateHue("#FF0000",90 - (90 * percentageDoors)) + "' readonly>";
    		html += "</div>";
    		html += "<div index='" + i + "' class='Security-Monitor-Core_deckList_item_evac'>";
    		html += "<input index='" + i + "' id='Security-Monitor-Core_deckList_header_evac_" + i + "' type='text' class='security-monitor-core_deckTextbox' value='" + Math.round(percentageEvac * 100) + "%' style='background-color:" + Interstellar.rotateHue("#FF0000",90 - (90 * percentageEvac)) + "' readonly>";
    		html += "</div>";
    		html += "<div index='" + i + "' ' class='Security-Monitor-Core_deckList_item_gas'>";
    		html += "<input index='" + i + "' id='Security-Monitor-Core_deckList_header_gas_" + i + "' type='text' class='security-monitor-core_deckTextbox' value='" + Math.round(percentageGas * 100) + "%' style='cursor: pointer;background-color:" + Interstellar.rotateHue("#FF0000",90 - (90 * Math.min(1,(percentageGas * 10)))) + "' onclick='this.select()'>";
    		html += "</div>";
    		html += "</div>";
    	}
    	deckList.html(html);
    	for(var i = 0;i < rooms.length;i++){
    		$("#securityMonitorCore_deck_" + i).click(function(event){
    			event.stopPropagation();
    			var index = Number($(event.target).attr("index"));
    			currentDeck = index;
    			drawRoomsForDeck(index);
    		});
    	}
    	$(".Security-Monitor-Core_deckList_item_gas").off();
    	$(".Security-Monitor-Core_deckList_item_gas").change(function(event){
    		var index = Number($(event.target).attr("index"));
    		var newValue = Math.max(0,Math.min(1,(Number(event.target.value.replace(/[^\d.-]/g, ''))) / 100));
    		gasLevels[index] = newValue;
    		Interstellar.setDatabaseValue("security.deckGasLevels",gasLevels);
    	});
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

	function updateLocationDropdown(){
		var i;
		var k;
		var html;
		for(i = 0;i < rooms.length;i++){
			html += "<optgroup label='DECK " + (i + 1) + "'>"
			for(k = 0;k < rooms[i].length;k++){
				html += "<option value='" + i + "," + k + "'>";
				html += rooms[i][k].name + ", deck " + (i + 1);
				html += "</option>";
			}
			html += "</optgroup>";
		}
		alarmLocationSelectDropdown.html(html);
	}

	function drawRoomsForDeck(deck){
		var i;
		for(i = 0;i < lastRoomsSpawned;i++){
			$("#securityMonitorCore_RoomList_Room_" + i).off();
		}
		var html = "";
		lastRoomsSpawned = rooms[deck].length;
		for(i = 0;i < lastRoomsSpawned;i++){
			html += "<div id='securityMonitorCore_RoomList_Room_" + i + "' class='security-monitor-core_roomItem noselect'>";
			if(rooms[deck][i].alarms.length > 0){
    			html += "<div id='securityMonitorCore_RoomList_Room_roomName_" + i + "' class='security-monitor-core_roomItem_roomName' style='color:red'>" + rooms[deck][i].name + "</div>";
			}else{
    			html += "<div id='securityMonitorCore_RoomList_Room_roomName_" + i + "' class='security-monitor-core_roomItem_roomName'>" + rooms[deck][i].name + "</div>";
			}
    		if(rooms[deck][i].evacuated){
    			html += "<div id='securityMonitorCore_RoomList_Room_EvacStatus_" + i + "' class='security-monitor-core_roomItem_roomEvac verticalAlign' style='background-color:red;font-size:14px'>EVACUATED</div>";
    		}else{
    			html += "<div id='securityMonitorCore_RoomList_Room_EvacStatus_" + i + "' class='security-monitor-core_roomItem_roomEvac verticalAlign'>ON DUTY</div>";
    		}
    		if(rooms[deck][i].doorsLocked){
    			html += "<div id='securityMonitorCore_RoomList_Room_DoorStatus_" + i + "' class='security-monitor-core_roomItem_roomDoor verticalAlign' style='background-color:red;'>LOCKED</div>";
    		}else{
    			html += "<div id='securityMonitorCore_RoomList_Room_DoorStatus_" + i + "' class='security-monitor-core_roomItem_roomDoor verticalAlign'>OPEN</div>";
    		}
    		html += "</div>";
		}
		roomList.html(html);
		for(i = 0;i < lastRoomsSpawned;i++){
			let index = i;
			$("#securityMonitorCore_RoomList_Room_" + i).click(function(event){
				if($(event.target).hasClass("security-monitor-core_roomItem_roomEvac")){
					//clicked on the evac label
					rooms[currentDeck][index].evacuated = !rooms[currentDeck][index].evacuated;
					Interstellar.setDatabaseValue("security.roomInfo",rooms);
					return;
				}
				if($(event.target).hasClass("security-monitor-core_roomItem_roomDoor")){
					//clicked on the door label
					rooms[currentDeck][index].doorsLocked = !rooms[currentDeck][index].doorsLocked;
					Interstellar.setDatabaseValue("security.roomInfo",rooms);
					return;
				}
				//clicked on a room
			});
		}
	}

	function updateDeckList(){
		var i;
		for(i = 0;i < rooms.length;i++){
			var doorsSealed = 0.0;
			var roomsEvac = 0.0;
			var totalDoors = rooms[i].length;
			for(var j = 0;j < rooms[i].length;j++){
				if(rooms[i][j].doorsLocked){
					doorsSealed++;
				}
				if(rooms[i][j].evacuated){
					roomsEvac++;
				}
			}
			var percentageDoors = doorsSealed / totalDoors;
			var percentageEvac = roomsEvac / totalDoors;
			var percentageGas = 0;
			if(!(gasLevels == undefined || gasLevels.length == 0)){
				percentageGas = gasLevels[i];
			}
			
			var deckLabel = $("#Security-Monitor-Core_deckList_item_deck_" + i);
			var doorText = $("#Security-Monitor-Core_deckList_header_doors_" + i);
			var evacText = $("#Security-Monitor-Core_deckList_header_evac_" + i);
			var gasText = $("#Security-Monitor-Core_deckList_header_gas_" + i);
			doorText.val(Math.round(percentageDoors * 100) + "%");
			evacText.val(Math.round(percentageEvac * 100) + "%");
			gasText.val(Math.round(percentageGas * 100) + "%");

			var alarmDetected = false;
			for(var j = 0;j < rooms[i].length;j++){
				if(rooms[i][j].alarms.length > 0){
					alarmDetected = true;
				}
			}
			if(alarmDetected){
				deckLabel.css("color","red");
			}else{
				deckLabel.css("color","white");
			}
			doorText.css("background-color",Interstellar.rotateHue("#FF0000",90 - (90 * percentageDoors)));
			evacText.css("background-color",Interstellar.rotateHue("#FF0000",90 - (90 * percentageEvac)));
			gasText.css("background-color",Interstellar.rotateHue("#FF0000",90 - (90 * percentageGas)));
		}
	}

	function drawAlarmOptionGUI(){
		var i;
		var html = "";
		for(i = 0;i < loadedAlarms.length;i++){
			html += "<option>";
			html += loadedAlarms[i].name;
			html += "</option>";
		}
		alarmSelectDropdown.html(html);
	}

	function updateRoomList(){
		var i;
		for(i = 0;i < lastRoomsSpawned;i++){
			if(rooms[currentDeck][i].alarms.length > 0){
				$("#securityMonitorCore_RoomList_Room_roomName_" + i).css("color","red");
			}else{
				$("#securityMonitorCore_RoomList_Room_roomName_" + i).css("color","white");
			}
			if(rooms[currentDeck][i].evacuated){
				$("#securityMonitorCore_RoomList_Room_EvacStatus_" + i).html("EVACUATED")
				$("#securityMonitorCore_RoomList_Room_EvacStatus_" + i).css("background-color","red");
			}else{
				$("#securityMonitorCore_RoomList_Room_EvacStatus_" + i).html("ON DUTY")
				$("#securityMonitorCore_RoomList_Room_EvacStatus_" + i).css("background-color","");
			}
			if(rooms[currentDeck][i].doorsLocked){
				$("#securityMonitorCore_RoomList_Room_DoorStatus_" + i).html("LOCKED")
				$("#securityMonitorCore_RoomList_Room_DoorStatus_" + i).css("background-color","red");
			}else{
				$("#securityMonitorCore_RoomList_Room_DoorStatus_" + i).html("OPEN")
				$("#securityMonitorCore_RoomList_Room_DoorStatus_" + i).css("background-color","");
			}
		}
	}

	function generateUUID() {
    	var d = new Date().getTime();
    	return uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        	var r = (d + Math.random()*16)%16 | 0;
        	d = Math.floor(d/16);
        	return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    	});
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


    function startTimer(){
    	if(timerInterval != undefined){
    		return;
    	}
    	timerInterval = setInterval(function(){
    		var i;
    		var k;
    		var j;
    		var didChange = false;
    		for(i = 0;i < rooms.length;i++){
    			for(k = 0;k < rooms[i].length;k++){
    				for(j = 0;j < rooms[i][k].alarms.length;j++){
    					didChange = true;
    					rooms[i][k].alarms[j].timePassed++;
    				}
    			}
    		}
    		if(!didChange){
    			clearInterval(timerInterval);
    			timerInterval = undefined;
    			return;
    		}
    		Interstellar.setDatabaseValue("security.roomInfo",rooms);
    	},1000);
    }

	//preset observers

	Interstellar.onPresetValueChange("security.roomAlarms",function(newData){
		if(newData == null){
			Interstellar.setPresetValue("security.roomAlarms",defaultAlarmPresets);
			return;
		}
		loadedAlarms = newData;
		drawAlarmOptionGUI();
	});

	//database observers

	Interstellar.onDatabaseValueChange("security.roomInfo",function(newData){
		if(newData == null){
			doInitRooms = true;
			if(Interstellar.getDatabaseValue("ship.rooms") != null){
				Interstellar.setDatabaseValue("security.roomInfo",formatRooms(Interstellar.getDatabaseValue("ship.rooms")));
			}
			return;
		}
		rooms = newData;

		var alarmDetected = false;
		var i;
		var j;
		for(i = 0;i < rooms.length;i++){
			for(j = 0;j < rooms[i].length;j++){
				if(rooms[i][j].alarms.length > 0){
					alarmDetected = true;
				}
			}
		}
		if(alarmDetected && timerInterval == undefined){
			startTimer();
		}else if(!alarmDetected && timerInterval != undefined){
			clearInterval(timerInterval);
			timerInterval = undefined;
		}
		if(!hasDrawn){
			hasDrawn = true;
			drawDeckList();
			drawRoomsForDeck(0);
			drawAlarms();
			updateLocationDropdown();
		}else{
			updateDeckList();
			updateRoomList();
			drawAlarms();
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
		drawDeckList();
	});

	Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
		if(newData == null){
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
	//event handlers
	createAlarmButton.click(function(event){
		var i;
		var loadedAlarmName = alarmSelectDropdown.val();
		var alarm;
		for(i = 0;i < loadedAlarms.length;i++){
			if(loadedAlarmName == loadedAlarms[i].name){
				alarm = loadedAlarms[i];
			}
		}
		var newAlarm = 
		{
			"name" : loadedAlarmName,
			"alarmInfo" : alarm.alarmInfo,
			"timePassed" : 0,
			"guid" : generateUUID()
		}
		var deckIndex = Number(alarmLocationSelectDropdown.val().split(",")[0]);
		var roomIndex = Number(alarmLocationSelectDropdown.val().split(",")[1]);
		rooms[deckIndex][roomIndex].alarms.splice(rooms[deckIndex][roomIndex].alarms.length,0,newAlarm);
		Interstellar.setDatabaseValue("security.roomInfo",rooms);
	});

	editAlarmsButton.click(function(event){
		Interstellar.openCoreWindow("security_monitor_core_editAlarmWindow",event);
	})
	/*
	setInterval(function(){
		var genericObject = 
			{
				"room" : "MAIN ENGINEERING, DECK 12",
				"name" : "Inturders detected",
				"alarmInfo" : "aaaa, there are intruders here",
				"timePassed" : 0
			}
		

		var newAlarm = 
		{
			"room" : "MAIN ENGINEERING, DECK 12",
			"name" : "Inturders detected",
			"alarmInfo" : "aaaa, there are intruders here",
			"timePassed" : 0,
			"guid" : generateUUID()
		}
		var randomDeck = Math.floor(Math.random() * rooms.length);
		var randomRoom = Math.floor(Math.random() * rooms[randomDeck].length);
		rooms[randomDeck][randomRoom].alarms.splice(rooms[randomDeck][randomRoom].alarms.length,0,newAlarm);
		Interstellar.setDatabaseValue("security.roomInfo",rooms);
	},2000);*/
});