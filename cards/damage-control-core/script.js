var damageControlCoreWidgetDidInit = false;
Interstellar.addCoreWidget("Damage Control",function(){
	if(damageControlCoreWidgetDidInit){
		return;
	}
	damageControlCoreWidgetDidInit = true;
	var thisWidget = this;

	//variables
	var damagedSystemStatus = [],
		damagePings = [],
		shipSystems = [],
		updateSystemStatusInterval = undefined,
		updatePingStatusInterval = undefined,
		selectedDamageIndex = -1,
		selectedPingIndex = -1,
		defaultRepairTime = 60 * 15,
		doUpdateTimeRequiredTextbox = true,
		damagePingValues = [],
		defualtSecondarySystems = ["EPS POWER FAILURE","BURST WATER PIPES","FIRE","HULL BREACH","COMPUTER VIRUS","PLASMA LEAK","TURBOLIFT JAM","JAMMED DOOR"],
		secondarySystems = [],
		selectedSecondarySystemIndex = -1,
		selectedPingEditorIndex = -1;

	//DOM References
	var damagedSystemsList = $("#damage-control-core_damagedSystemList"),
		selectedSystemContainer = $("#damage-control-core_pingRequestControls_selectedSystem"),
		timeRemainingTextbox = $("#damage-control-core_pingRequestControls_timeRemainingTextbox"),
		instantFinishButton = $("#damage-control-core_pingRequestControls_instantFinishButton"),
		pingSystemButton = $("#damage-control-core_pingRequestControls_pingSystemButton"),
		damagedSystemMask = $("#damage-control-core_pingRequestControls_selectedSystemMask"),
		minorSystemDropdown = $("#damage-control-core_pingRequestControls_minorSystemDropdown"),
		addMinorDamageButton = $("#damage-control-core_pingRequestControls_addMinorDamageButton"),
		editPingButton = $("#damage-control-core_systemDamageControls_editPingButton"),
		damagePingList = $("#damage-control-core_pingList"),
		removePingButton = $("#damage-control-core_systemDamageControls_removePingButton"),
		damagePingDropdownSelect = $("#damage-control-core_systemDamageControls_pingSelectDropdown"),
		damagePingSystemDropdown = $("#damage-control-core_systemDamageControls_pingSystemSelectDropdown"),
		createPingButton = $("#damage-control-core_systemDamageControls_createSystemButton"),
		createRandomPing = $("#damage-control-core_systemDamageControls_pingSystemButton"),
		createRandomPingforSystemButton = $("#damage-control-core_pingRequestControls_pingSystemButton"),
		editMinorSystemsButton = $("#damage-control-core_pingRequestControls_editMinorDamageButton"),
		secondarySystemsEditWindowSystemsList = $("#damage-control-core_editSecondarySystemWindow_systemsList"),
		secondarySystemsEditWindowNewButton = $("#damage-control-core_editSecondarySystemWindow_newSystemButton"),
		secondarySystemsEditWindowRemoveButton = $("#damage-control-core_editSecondarySystemWindow_removeSystemButton"),
		secondarySystemsEditWindowEditButton = $("#damage-control-core_editSecondarySystemWindow_editSystemButton"),
		secondarySystemsEditWindowSystemsEditSystemTextbox = $("#damage-control-core_editSecondarySystemWindow_editSystemTextbox"),
		editPingWindow_pingList = $("#damage-control-core_editPingWindow_pingList"),
		editPingWindow_pingTitleTextbox = $("#damage-control-core_editPingWindow_pingTitle"),
		editPingWindow_pingDataTextarea = $("#damage-control-core_editPingWindow_pingData"),
		editPingWindow_newPingButton = $("#damage-control-core_editPingWindow_addButton"),
		editPingWindow_removePingButton = $("#damage-control-core_editPingWindow_removeButton");

	//init calls
	drawGUI();

	//interstellar functions

	//preset observers
	Interstellar.onPresetValueChange("damageControl.damagePings",function(newData){
		if(newData == null){
			Interstellar.setPresetValue("damageControl.damagePings",[]);
			return;
		}
		damagePingValues = newData;
		console.log(damagePingValues);
		var html = "";
		html += "<optgroup label='Ping Requests'>";
		for(var i = 0;i < newData.length;i++){
			html += "<option>" + damagePingValues[i].name + "</option>";
		}
		html += "</optgroup>";
		damagePingDropdownSelect.html(html);
		drawEditPingWindowGUI();
	});

	Interstellar.onPresetValueChange("damageControl.secondarySystems",function(newData){
		if(newData == null){
			Interstellar.setPresetValue("damageControl.secondarySystems",defualtSecondarySystems);
			return;
		}
		secondarySystems = newData;
		var html = "";
		for(var i = 0;i< newData.length;i++){
			html += "<div index='" + i +"' class='damage-control-core_editSecondarySystemWindow_systemsList_item' style='top:" + (i * 16) + "px'>";
			html += newData[i];
			html += "</div>";
		}
		secondarySystemsEditWindowSystemsList.html(html);
		$(".damage-control-core_editSecondarySystemWindow_systemsList_item").off();
		$(".damage-control-core_editSecondarySystemWindow_systemsList_item").click(function(event){
			var index = Number($(event.target).attr("index"));
			selectedSecondarySystemIndex = index;
			secondarySystemsEditWindowRemoveButton.prop("disabled","");
			secondarySystemsEditWindowEditButton.prop("disabled","");
			secondarySystemsEditWindowRemoveButton.removeClass("damage-control-core_editSecondarySystemWindow_disabledButton");
			secondarySystemsEditWindowEditButton.removeClass("damage-control-core_editSecondarySystemWindow_disabledButton");
		});
		drawPingSystemDropdown();
		drawMinorDamageDropdown();
	});

	//database observers

	Interstellar.onDatabaseValueChange("damageControl.damagePings",function(newData){
		if(newData == null){
	/*
		Typical object,
		{
			"pingName" : "Whatever",
			"pingData" : "these are the instructions to fix this ping",
			"pingSystem" : "WARP ENGINES",
			"timePassed" : 0 //SECONDS, NOT MILISECONDS
		}
	*/		
			Interstellar.setDatabaseValue("damageControl.damagePings",[]);
			return;
		}
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
			selectedPingIndex = -1;
			removePingButton.prop("disabled","disabled");
			removePingButton.css("opacity","0.5");
			drawPingGUI();
		}
	})

	Interstellar.onDatabaseValueChange("ship.systems",function(newData){
		if(newData == null){
			return; //DO NOT SET THIS VALUE HERE!  JAMES!  STOP TOUCHING MY CODE!
		}

		shipSystems = newData;
		var didChange = false;
		var newArray = [];
		for(var i = 0;i < newData.length;i++){
			var didFind = false;
			var indexFoundAt = -1;
			for(var j = 0;j < damagedSystemStatus.length;j++){
				if(newData[i].systemName.toLowerCase() == damagedSystemStatus[j].systemName.toLowerCase()){
					didFind = true;
					indexFoundAt = j;
				}
			}
			if(didFind != newData[i].isDamaged){
				didChange = true;
				if(newArray.length == 0){
					for(var k = 0;k < damagedSystemStatus.length;k++){
						newArray.splice(newArray.length,0,damagedSystemStatus[k]);
					}
				}
				if(didFind == false){
					//didn't find, is broken
					newArray.splice(newArray.length,0,{"systemName" : newData[i].systemName,"timePassed" : 0,"timeRequired" : defaultRepairTime + (100 * Math.random())});
				}else{
					//found, and wasn't broken
					newArray.splice(indexFoundAt,1);
				}
			}
		}
		if(didChange){
			Interstellar.setDatabaseValue("damageControl.damagedSystems",newArray);
		}
		drawPingSystemDropdown();
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
		if(newData.length == 0){	
			damagedSystemMask.stop();
			damagedSystemMask.fadeIn();
			selectedSystemContainer.html("None Selected");
			timeRemainingTextbox.val("0:00");
			selectedDamageIndex = -1;
			doUpdateTimeRequiredTextbox = true;
			timeRemainingTextbox.css("background-color","");
			timeRemainingTextbox.blur();
		}
		if(updateInsteadOfDraw){
			damagedSystemStatus = Interstellar.deepCopyArray(newData);
			updateGUI();
		}else{
			selectedDamageIndex = -1;
			damagedSystemStatus = Interstellar.deepCopyArray(newData);
			drawGUI();
		}
		if(updatePingStatusInterval != undefined){
			clearInterval(updatePingStatusInterval);
			updatePingStatusInterval = undefined;
		}
		updatePingStatusInterval = setInterval(function(){
			var newArray = [];
			for(var i = 0;i < damagePings.length;i++){
				newArray.splice(newArray.length,0,damagePings[i]);
				newArray[i].timePassed += 1;
			}
			Interstellar.setDatabaseValue("damageControl.damagePings",newArray);
		},1000);
		if(updateSystemStatusInterval != undefined){
			clearInterval(updateSystemStatusInterval);
			updateSystemStatusInterval = undefined;
		}
		updateSystemStatusInterval = setInterval(function(){
			var newArray = [];
			for(var i = 0;i < damagedSystemStatus.length;i++){
				newArray.splice(newArray.length,0,damagedSystemStatus[i]);
				var amount = Math.max(Math.min(0.75 - (Math.log(i) / 2),1),0);
				//first we need to make sure there aren't any pings
				var pingDetected = false;
				for(var j = 0;j < damagePings.length;j++){
					console.log(damagePings[i]);
					if(damagePings[j].pingSystem == damagedSystemStatus[i].systemName){
						pingDetected = true;
					}
				}
				if(!pingDetected){
					newArray[i].timePassed += amount;
				}
			}
			for(var i = 0;i < newArray.length;i++){
				if(newArray[i].timePassed >= newArray[i].timeRequired){
					var didFind = false;
					for(var j = 0;j < shipSystems.length;j++){
						if(newArray[i].systemName.toLowerCase() == shipSystems[j].systemName.toLowerCase()){
							didFind = true;
						}
					}
					if(didFind){
						Interstellar.say(newArray[i].systemName + " Repaired");
						repairSystem(i);
					}else{
						Interstellar.say(newArray[i].systemName + " Corrected");
						newArray.splice(i,1);
					}
				}
			}
			Interstellar.setDatabaseValue("damageControl.damagedSystems",newArray);
		},1000);
	});

	//functions

	function updatePingGUI(){
		for(i = 0;i < damagePings.length;i++){
			var timePassed = damagePings[i].timePassed;
			$("#damage-control-core_pingList_item_time_" + i).html(formatTime(timePassed));
		}
	}

	function drawPingGUI(){
		var html = "";
		var i;
		for(i = 0;i < damagePings.length;i++){
			html += "<div index='" + i + "' class='damage-control-core_pingList_item noselect' style='top:" + (20 * i) + "px'>";
			html += "<div index='" + i + "' class='damage-control-core_pingList_item_name'>" + damagePings[i].pingName + "</div>";
			html += "<div index='" + i + "' class='damage-control-core_pingList_item_system'>" + damagePings[i].pingSystem + "</div>";
			html += "<div index='" + i + "' class='damage-control-core_pingList_item_time' id='damage-control-core_pingList_item_time_" + i + "'>" + formatTime(damagePings[i].timePassed) + "</div>";
			html += "</div>";
		}
		damagePingList.html(html);
		$(".damage-control-core_pingList_item").off();
		$(".damage-control-core_pingList_item").click(function(event){
			selectedPingIndex = Number($(event.target).attr("index"));
			removePingButton.prop("disabled","");
			removePingButton.css("opacity","1");
		});
	}
	function drawMinorDamageDropdown(){
		html = "";
		html += "<optgroup label='Secondary Systems'>";
		for(var i = 0;i < secondarySystems.length;i++){
			html += "<option>" + secondarySystems[i] + "</option>";
		}
		html += "</optgroup>";
		minorSystemDropdown.html(html);
	}
	function drawEditPingWindowGUI(){
		var html = "";
		for(var i = 0;i < damagePingValues.length;i++){
			html += "<div index='" + i + "' class='damage-control-core_editPingWindow_pingItem' style='top:" + (i * 16) + "px'>";
			html += damagePingValues[i].name;
			html += "</div>"
		}
		editPingWindow_pingList.html(html);
		$(".damage-control-core_editPingWindow_pingItem").off();
		$(".damage-control-core_editPingWindow_pingItem").click(function(event){
			if(selectedPingEditorIndex != -1){
				var value = editPingWindow_pingDataTextarea.val();
				var regex = new RegExp("<br />", 'g');
				value = value.replace(regex, '\n');
				damagePingValues[selectedPingEditorIndex].data = value;
				var name = editPingWindow_pingTitleTextbox.val().toUpperCase();
				damagePingValues[selectedPingEditorIndex].name = name;
			}
			var index = Number($(event.target).attr("index"));
			editPingWindow_pingTitleTextbox.val(damagePingValues[index].name);
			var value = damagePingValues[index].data;
			var regex = new RegExp("<br />", 'g');
			value = value.replace(regex, '\n');
			editPingWindow_pingDataTextarea.val(value);
			selectedPingEditorIndex = index;
		});
	}
	function drawGUI(){
		var html = "";
		var i;
		for(i = 0;i < damagedSystemStatus.length;i++){
			html += "<div index='" + i + "' class='damage-control-core_damagedSystemList_item noselect' style='top:" + (20 * i) + "px'>";
			html += "<div index='" + i + "' class='damage-control-core_damagedSystemList_item_label'>" + damagedSystemStatus[i].systemName + "</div>";
			html += "<div index='" + i + "' class='damage-control-core_damagedSystemList_item_time' id='damage-control-core_damagedSystemList_item_time_" + i + "'>" + formatTime(calculateRemainingTimeAtIndex(i,damagedSystemStatus[i].timeRequired,damagedSystemStatus[i].timePassed)) + "</div>";
			html += "</div>";
		}
		damagedSystemsList.html(html);
		$(".damage-control-core_damagedSystemList_item").off();
		$(".damage-control-core_damagedSystemList_item").click(function(event){
			var index = Number($(event.target).attr("index"));
			selectedDamageIndex = index;
			damagedSystemMask.stop();
			damagedSystemMask.fadeOut();
			selectedSystemContainer.html(damagedSystemStatus[index].systemName);
			if(doUpdateTimeRequiredTextbox){
				timeRemainingTextbox.css("background-color","");
				timeRemainingTextbox.val(formatTime(calculateRemainingTimeAtIndex(index,damagedSystemStatus[index].timeRequired,damagedSystemStatus[index].timePassed)));
			}
		});
		drawPingSystemDropdown();
	}

	function drawPingSystemDropdown(){		
		html = "";
		html += "<optgroup label='Damaged Systems'>";
		for(var i = 0;i < damagedSystemStatus.length;i++){
			html += "<option>" + damagedSystemStatus[i].systemName + "</option>";
		}
		html += "</optgroup>";
		html += "<optgroup label='Primary Systems'>";
		for(var i = 0;i < shipSystems.length;i++){
			html += "<option>" + shipSystems[i].systemName + "</option>";
		}
		html += "</optgroup>";
		html += "<optgroup label='Secondary Systems'>";
		for(var i = 0;i < secondarySystems.length;i++){
			html += "<option>" + secondarySystems[i] + "</option>";
		}
		html += "</optgroup>";
		damagePingSystemDropdown.html(html);
	}

	function updateGUI(){
		var i;
		for(i = 0;i < damagedSystemStatus.length;i++){
			$("#damage-control-core_damagedSystemList_item_time_" + i).html(formatTime(calculateRemainingTimeAtIndex(i,damagedSystemStatus[i].timeRequired,damagedSystemStatus[i].timePassed)));
		}
		if(selectedDamageIndex != -1){
			var index = selectedDamageIndex;
			damagedSystemMask.stop();
			damagedSystemMask.fadeOut();
			selectedSystemContainer.html(damagedSystemStatus[index].systemName);
			if(doUpdateTimeRequiredTextbox){
				timeRemainingTextbox.css("background-color","");
				timeRemainingTextbox.val(formatTime(calculateRemainingTimeAtIndex(index,damagedSystemStatus[index].timeRequired,damagedSystemStatus[index].timePassed)));
			}
		}
	}

	function repairSystem(index){
		var newArray = [],
			didChange = false;
		for(var i = 0;i < damagedSystemStatus.length;i++){
			if(i != index){
				newArray.splice(newArray.length,0,damagedSystemStatus[i]);
			}
		}
		for(var i = 0;i < shipSystems.length;i++){
			if(damagedSystemStatus[index].systemName.toLowerCase() == shipSystems[i].systemName.toLowerCase()){
				shipSystems[i].isDamaged = false;
				didChange = true;
			}
		}
		if(didChange){
			Interstellar.setDatabaseValue("ship.systems",shipSystems);
		}newArray
		Interstellar.setDatabaseValue("damageControl.damagedSystems",newArray);
	}

	function damageSystem(name,repairTime){
		var newArray = [];
		for(var i = 0;i < damagedSystemStatus.length;i++){
			newArray.splice(newArray.length,0,damagedSystemStatus[i]);
		}
		newArray.splice(newArray.length,0,{"systemName" : name,"timePassed" : 0,"timeRequired" : repairTime + (100 * Math.random())});
		Interstellar.setDatabaseValue("damageControl.damagedSystems",newArray);
	}

	function setRemainingTimeAtIndex(index,timeRequired){
		var amount = Math.max(Math.min(0.75 - (Math.log(index) / 2),1),0);
		damagedSystemStatus[index].timeRequired = (timeRequired / amount) + damagedSystemStatus[index].timePassed;
		Interstellar.setDatabaseValue("damageControl.damagedSystems",damagedSystemStatus);
	}

	function calculateRemainingTimeAtIndex(index,timeRequired,timePassed){
		var amount = Math.max(Math.min(0.75 - (Math.log(index) / 2),1),0);
		return ((timeRequired - timePassed) / amount);
	}
	function formatTime(timeInSeconds){
		if(timeInSeconds >= 1.7976931348623157E+10308){
			return "Never";
		}
		var minutes = Math.floor(timeInSeconds / 60);
		var seconds = Math.floor(timeInSeconds - (minutes * 60));
		if(minutes < 10){
			minutes = "0" + minutes;
		}
		if(seconds < 10){
			seconds = "0" + seconds;
		}
		var string;
		if(minutes > 59){
			var hours = Math.floor(minutes / 60);
			minutes = minutes - (hours * 60);
			string = hours + ":" + minutes + ":" + seconds;
		}else{
			string = minutes + ":" + seconds;
		}
		return string;
	}

	//event listeners
	instantFinishButton.click(function(event){
		if(selectedDamageIndex == -1){
			return;
		}
		damagedSystemMask.stop();
		damagedSystemMask.fadeIn();
		selectedSystemContainer.html("None Selected");
		timeRemainingTextbox.val("0:00");
		repairSystem(selectedDamageIndex);
		selectedDamageIndex = -1;
	});
	addMinorDamageButton.click(function(event){
		damageSystem(minorSystemDropdown.val(),defaultRepairTime);
	});
	timeRemainingTextbox.on("focusin",function(event){
		doUpdateTimeRequiredTextbox = false;
		timeRemainingTextbox.css("background-color","red");
	})
	timeRemainingTextbox.on("focusout",function(event){
		doUpdateTimeRequiredTextbox = true;
	});
	timeRemainingTextbox.change(function(event){
		var value = $(event.target).val();
		var numericValue = 0;
		if(value.includes(":")){
			if(($(event.target).val().split(":")).length == 2){
				numericValue += Number(($(event.target).val().split(":")[0]).replace(/[^\d.-]/g, '')) * 60;
				numericValue += Number(($(event.target).val().split(":")[1]).replace(/[^\d.-]/g, ''));
			}else{
				var seconds = Number(($(event.target).val().split(":")[2]).replace(/[^\d.-]/g, ''));
				var minutes = Number(($(event.target).val().split(":")[1]).replace(/[^\d.-]/g, ''));
				var hours = Number(($(event.target).val().split(":")[0]).replace(/[^\d.-]/g, ''));
				minutes += (60 * hours);
				seconds += minutes * 60;
				numericValue = seconds;
			}
		}else{
			numericValue =  Number($(event.target).val().replace(/[^\d.-]/g, ''));
		}
		setRemainingTimeAtIndex(selectedDamageIndex,numericValue);
		doUpdateTimeRequiredTextbox = true;
		timeRemainingTextbox.blur();
	});
	removePingButton.click(function(event){
		if(selectedPingIndex == -1){
			return;
		}
		var newArray = [];
		for(var i = 0;i < damagePings.length;i++){
			if(i != selectedPingIndex){
				newArray.splice(newArray.length,0,damagePings[i]);
			}
		}
		Interstellar.setDatabaseValue("damageControl.damagePings",newArray);
	});
	createPingButton.click(function(event){
		var pingSystem = damagePingSystemDropdown.val();
		if(pingSystem == "" || pingSystem == null){
			return;
		}
		var pingName = damagePingDropdownSelect.val();
		if(pingName == "" || pingName == null){
			return;
		}
		var pingData = "Error loading ping message, please contact main engineering.";
		for(var i = 0;i < damagePingValues.length;i++){
			if(damagePingValues[i].name == pingName){
				pingData = damagePingValues[i].data;
			}
		}
		console.log(pingData);
		var newPing =
		{
			"pingSystem" : pingSystem,
			"pingName" : pingName,
			"pingData" : pingData,
			"timePassed" : 0
		}
		var newArray = [];
		for(var i = 0;i < damagePings.length;i++){
			newArray.splice(newArray.length,0,damagePings[i]);
		}
		newArray.splice(newArray.length,0,newPing);
		Interstellar.setDatabaseValue("damageControl.damagePings",newArray);
	});
	createRandomPing.click(function(event){
		var randomIndex = Math.floor(Math.random() * damagePingValues.length);
		var randomSystem = shipSystems[Math.floor(Math.random() * shipSystems.length)].systemName;
		var newPing =
		{
			"pingSystem" : randomSystem,
			"pingName" : damagePingValues[randomIndex].name,
			"pingData" : damagePingValues[randomIndex].data,
			"timePassed" : 0
		}
		var newArray = [];
		for(var i = 0;i < damagePings.length;i++){
			newArray.splice(newArray.length,0,damagePings[i]);
		}
		newArray.splice(newArray.length,0,newPing);
		Interstellar.setDatabaseValue("damageControl.damagePings",newArray);
	});

	createRandomPingforSystemButton.click(function(event){
		var randomIndex = Math.floor(Math.random() * damagePingValues.length);
		var systemName = damagedSystemStatus[selectedDamageIndex].systemName;
		var newPing =
		{
			"pingSystem" : systemName,
			"pingName" : damagePingValues[randomIndex].name,
			"pingData" : damagePingValues[randomIndex].data,
			"timePassed" : 0
		}
		var newArray = [];
		for(var i = 0;i < damagePings.length;i++){
			newArray.splice(newArray.length,0,damagePings[i]);
		}
		newArray.splice(newArray.length,0,newPing);
		Interstellar.setDatabaseValue("damageControl.damagePings",newArray);
	});

	editMinorSystemsButton.click(function(event){
		selectedSecondarySystemIndex = -1;
		secondarySystemsEditWindowRemoveButton.prop("disabled","disabled");
		secondarySystemsEditWindowEditButton.prop("disabled","disabled");
		secondarySystemsEditWindowRemoveButton.addClass("damage-control-core_editSecondarySystemWindow_disabledButton");
		secondarySystemsEditWindowEditButton.addClass("damage-control-core_editSecondarySystemWindow_disabledButton");
		Interstellar.openCoreWindow("damage-control-core_editSecondarySystemWindow",event);
	});

	secondarySystemsEditWindowEditButton.click(function(event){
		if(selectedSecondarySystemIndex == -1){
			return;
		}
		secondarySystemsEditWindowSystemsEditSystemTextbox.val(secondarySystems[selectedSecondarySystemIndex]);
		secondarySystemsEditWindowSystemsEditSystemTextbox.fadeIn(250);
		secondarySystemsEditWindowSystemsList.animate({height : secondarySystemsEditWindowSystemsList.height() - 21},250);
	});

	secondarySystemsEditWindowRemoveButton.click(function(event){
		if(selectedSecondarySystemIndex == -1){
			return;
		}
		var newArray = [];
		for(var i = 0;i < secondarySystems.length;i++){
			if(i != selectedSecondarySystemIndex){
				newArray.splice(newArray.length,0,secondarySystems[i]);
			}
		}
		secondarySystemsEditWindowRemoveButton.prop("disabled","disabled");
		secondarySystemsEditWindowEditButton.prop("disabled","disabled");
		secondarySystemsEditWindowRemoveButton.addClass("damage-control-core_editSecondarySystemWindow_disabledButton");
		secondarySystemsEditWindowEditButton.addClass("damage-control-core_editSecondarySystemWindow_disabledButton");
		Interstellar.setPresetValue("damageControl.secondarySystems",newArray);
	});

	secondarySystemsEditWindowNewButton.click(function(event){
		var newArray = [];
		var newSystem = "UNKNOWN SYSTEM";
		for(var i = 0;i < secondarySystems.length;i++){
			newArray.splice(newArray.length,0,secondarySystems[i]);
		}
		newArray.splice(newArray.length,0,newSystem);
		selectedSecondarySystemIndex = newArray.length - 1;
		secondarySystemsEditWindowSystemsEditSystemTextbox.val(newArray[selectedSecondarySystemIndex]);
		secondarySystemsEditWindowSystemsEditSystemTextbox.fadeIn(250);
		secondarySystemsEditWindowSystemsList.animate({height : secondarySystemsEditWindowSystemsList.height() - 21},250);
		secondarySystemsEditWindowSystemsEditSystemTextbox.focus();
		secondarySystemsEditWindowSystemsEditSystemTextbox.select();
		Interstellar.setPresetValue("damageControl.secondarySystems",newArray);
	});

	secondarySystemsEditWindowSystemsEditSystemTextbox.change(function(event){
		if($(event.target).val() == ""){
			return;
		}
		secondarySystemsEditWindowSystemsEditSystemTextbox.fadeOut(250);
		secondarySystemsEditWindowSystemsList.animate({height : secondarySystemsEditWindowSystemsList.height() + 21},250);
		var newArray = [];
		for(var i = 0;i < secondarySystems.length;i++){
			if(i != selectedSecondarySystemIndex){
				newArray.splice(newArray.length,0,secondarySystems[i]);
			}else{
				newArray.splice(newArray.length,0,$(event.target).val());
			}
		}
		Interstellar.setPresetValue("damageControl.secondarySystems",newArray);
	});
	editPingButton.click(function(event){
		selectedPingEditorIndex = -1;
		Interstellar.openCoreWindow("damage-control-core_editPingWindow",event);
	});
	editPingWindow_pingTitleTextbox.change(function(event){
		if(selectedPingEditorIndex == -1){
			return;
		}
		var newArray = [];
		for(var i = 0;i < damagePingValues.length;i++){
			newArray.splice(newArray.length,0,damagePingValues[i]);
		}
		newArray[selectedPingEditorIndex].name = $(event.target).val().toUpperCase();
		Interstellar.setPresetValue("damageControl.damagePings",newArray);
	});
	editPingWindow_newPingButton.click(function(event){
		var newArray = [],
			newPing = {
				"name" : "NEW PING",
				"data" : "NO INFORMATION"
			}
		for(var i = 0;i < damagePingValues.length;i++){
			newArray.splice(newArray.length,0,damagePingValues[i]);
		}
		newArray.splice(newArray.length,0,newPing);
		Interstellar.setPresetValue("damageControl.damagePings",newArray);
	});
	editPingWindow_pingDataTextarea.change(function(event){
		if(selectedPingEditorIndex == -1){
			return;
		}
		var newArray = [];
		for(var i = 0;i < damagePingValues.length;i++){
			newArray.splice(newArray.length,0,damagePingValues[i]);
		}
		var value = $(event.target).val();
		var regex = new RegExp("\n", 'g');
		text = value.replace(regex, '<br />');

		newArray[selectedPingEditorIndex].data = value;
		Interstellar.setPresetValue("damageControl.damagePings",newArray);
	});
	editPingWindow_removePingButton.click(function(event){
		if(selectedPingEditorIndex == -1){
			return;
		}
		var newArray = [];
		for(var i = 0;i < damagePingValues.length;i++){
			if(i != selectedPingEditorIndex){
				newArray.splice(newArray.length,0,damagePingValues[i]);
			}
		}
		selectedPingEditorIndex = -1;
		Interstellar.setPresetValue("damageControl.damagePings",newArray);
	})
	//intervals
});




