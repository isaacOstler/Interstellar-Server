//copyright Isaac Ostler, July 10th 2017, all rights reserved ©

//variables
var Sensor_Scans_Core_PresetDefaults = {
	"notifyOnAutoAnswer" : true,
	"notifyOnNewScan" : true,
	"speedBoosts" : 
	{
		"external" : 1,
		"internal" : 1
	},
	"presetButtons" : 
	[
	{
		"name" : "SPECIFY",
		"value" : "SCAN REQUEST IS TOO VAGUE, PLEASE SPECIFY WHAT YOU WISH TO SCAN FOR"
	},
	{
		"name" : "UNKNOWN",
		"value" : "REQUEST QUERY IS UNKNOWN AND OR AMBIGUOUS, PLEASE RESTATE"
	},
	{
		"name" : "INVALID",
		"value" : "SCAN REQUEST IS INVALID, SCAN CANNOT BE COMPLETED"
	},
	{
		"name" : "NONE DETECTED",
		"value" : "NONE DETECTED"
	}
	],
	"hotkeys" :
	[
	{
		"keyInfo" : {
			"key" : 48,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "SCANNERS CANNOT IDENTIFY LIFEFORMS VIA NAME, RANK, OR POLITICAL ALIGNMENT"
	},
	{
		"keyInfo" : {
			"key" : 49,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "NONE DETECTED"
	},
	{
		"keyInfo" : {
			"key" : 50,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "DETECTED"
	},
	{
		"keyInfo" : {
			"key" : 51,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "REQUEST QUERY IS UNKNOWN AND / OR AMBIGUOUS, PLEASE RESTATE"
	},
	{
		"keyInfo" : {
			"key" : 52,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "NONE DETECTED.  RECOMMEND USING EXTERNAL SENSORS"
	},
	{
		"keyInfo" : {
			"key" : 53,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "NONE DETECTED.  RECOMMEND USING INTERNAL SENSORS"
	},
	{
		"keyInfo" : {
			"key" : 54,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "SCANNERS CANNOT IDENTIFY LIFEFORMS VIA NAME, RANK, OR POLITICAL ALIGNMENT"
	},
	{
		"keyInfo" : {
			"key" : 55,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "EXPLOSIVE DEVICE DETECTED, DECK 1, BREFING ROOM"
	},
	{
		"keyInfo" : {
			"key" : 56,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "UNABLE TO PERFORM SCAN AT THIS TIME"
	},
	{
		"keyInfo" : {
			"key" : 57,
			"shift" : false,
			"cmd" : true,
			"control" : false,
			"alt" : false
		},
		"value" : "NOW DISPLAYING RESULTS ON MAIN VIEW SCREEN, PLEASE STANDBY..."
	}
	]
}
var Sensor_Scans_Core_Preset = {};

var Sensor_Scans_Core_HasInit = false;

//preset observers

onPresetValueChange("sensor-scans-core.generalPrefrences",function(newData){
	if(newData == null){
		console.log("general pref: " + JSON.stringify(Sensor_Scans_Core_PresetDefaults));
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_PresetDefaults);
		return;
	}

	Sensor_Scans_Core_Preset = newData;
	if(Sensor_Scans_Core_HasInit){
		sensor_scans_core_UpdateUserPrefs();
	}
	if(Sensor_Scans_Core_HasInit){
        return; // we've already init, don't init again.
    }
    Sensor_Scans_Core_HasInit = true;

    var sensorScansCore_internalScanInfo = null,
    sensorScansCore_externalScanInfo = null,
    sensorScanCore_internalScanAnnounced = false,
    sensorScanCore_externalScanAnnounced = false,
    sensorScanCore_internalScanWarningInterval = undefined,
    sensorScansCore_internalScanAnswer = "",
    sensorScansCore_externalScanAnswer = "",
sensorScansCore_ScanTypeSelected = "internal", //case sensitive, be careful!
sensorScansCore_InternalSpeedBoost = Sensor_Scans_Core_Preset.speedBoosts.internal,
sensorScansCore_ExternalSpeedBoost = Sensor_Scans_Core_Preset.speedBoosts.external,
sensorScansCore_InternalExternalButtonSelectColors = 
{
	"scanIsInProgress" :
	{
		"buttonSelected" : "#bc1616",
		"buttonNotSelected" : "#f91d1d"
	},
	"scanIsNotInProgress" :
	{
		"buttonSelected" : "#bababa",
		"buttonNotSelected" : "#ededed"
	},
	"scanHasBeenAnswered" :
	{
		"buttonSelected" : "#bfb226",
		"buttonNotSelected" : "#f7e733"
	}
},
sensorScansCore_internalAutoResponseItems = 
[
	/*{
		"query" : "intruders",
		"response" : "NONE DETECTED",
		"location" : "default",
		"isActive" : true
	},{
		"query" : "intruders",
		"response" : "1 DETECTED, DECK 3",
		"location" : "all decks, all rooms",
		"isActive" : true
	},{
		"query" : "intruders",
		"response" : "1 DETECTED, mr. williamson's office",
		"location" : "deck 3, all rooms",
		"isActive" : true
	},{
		"query" : "intruders",
		"response" : "1 DETECTED",
		"location" : "deck 3, mr. williamson's office",
		"isActive" : true
	}*/
	],
	sensorScansCore_internalAutoResponsePresets = 
	{
		"internal" : [],
		"external" : []
	},
	sensorScansCore_shipRooms = [],
	autoResponseDeleteMode = false,
	overrideAutoResponseOptions = false
	hotkeyDeleteMode = false;

//init functions

sensor_Scans_Core_UpdateBasedOnScanType();
sensor_scans_core_UpdateAutoResponseList();
sensor_scans_core_UpdateUserPrefs();

//database observers

onPresetValueChange("sensor-scans-core.autoResponseItemsPresets",function(presets){
	if(presets == null){
		console.log(presets);
		presets = 
		{
			"internal" : [
			{
				"presetName" : "Generic",
				"presets" : 
				[{
					"query" : "intruders",
					"response" : "NONE DETECTED",
					"location" : "default",
					"isActive" : true
				}]
			}
			],
			"external" : []
		}
		setDatabaseValue("sensor-scans-core.internalAutoResponseItems",presets);
		setPresetValue("sensor-scans-core.autoResponseItemsPresets",presets);
		sensorScansCore_internalAutoResponsePresets = presets;
	}else{
		sensorScansCore_internalAutoResponsePresets = presets;
		if(presets.internal[0].presets.length > 0){
			setDatabaseValue("sensor-scans-core.internalAutoResponseItems",presets.internal[0].presets);
		}else{
			setDatabaseValue("sensor-scans-core.internalAutoResponseItems",[]);
		}
	}
});

onDatabaseValueChange("sensor-scans-core.internalAutoResponseItems",function(newData){
	if(newData == null){
		getPresetValue("sensor-scans-core.autoResponseItemsPresets",function(presets){
			if(presets == null){
				console.log(presets);
				presets = 
				{
					"internal" : [
					{
						"presetName" : "Generic",
						"presets" : 
						[{
							"query" : "intruders",
							"response" : "NONE DETECTED",
							"location" : "default",
							"isActive" : true
						}]
					}
					],
					"external" : []
				}
				setDatabaseValue("sensor-scans-core.internalAutoResponseItems",presets);
				setPresetValue("sensor-scans-core.autoResponseItemsPresets",presets);
				sensorScansCore_internalAutoResponsePresets = presets;
			}else{
				sensorScansCore_internalAutoResponsePresets = presets;
				if(presets.internal[0].presets.length > 0){
					setDatabaseValue("sensor-scans-core.internalAutoResponseItems",presets.internal[0].presets);
				}else{
					setDatabaseValue("sensor-scans-core.internalAutoResponseItems",[]);
				}
			}
		});
	}else{
		console.log(newData);
		sensorScansCore_internalAutoResponseItems = newData;
		sensor_scans_core_UpdateAutoResponseList();
	}
});

onDatabaseValueChange("ship.rooms",function(newData){
	if(newData == null){
		return; //important, do not update rooms list here, this should
		//ONLY be done by the ship control core widget!
	}
	sensorScansCore_shipRooms = newData;
	sensor_scans_core_UpdateAutoResponseList();
});

onDatabaseValueChange("externalSensors.scanAnswer",function(newData){
	if(newData == null){
		setDatabaseValue("externalSensors.scanAnswer", "");
		return;
	}
	sensorScansCore_externalScanAnswer = newData;
	if(sensorScansCore_ScanTypeSelected == "external"){
		$("#Sensor-ScansCore_ScanAnswerTextarea").val(newData);
	}
	sensor_Scans_Core_UpdateBasedOnScanType();
});

onDatabaseValueChange("internalSensors.scanAnswer",function(newData){
	if(newData == null){
		setDatabaseValue("internalSensors.scanAnswer", "");
		return;
	}
	sensorScansCore_internalScanAnswer = newData;
	if(sensorScansCore_ScanTypeSelected == "internal"){
		$("#Sensor-ScansCore_ScanAnswerTextarea").val(newData);
	}
	sensor_Scans_Core_UpdateBasedOnScanType();
})

onDatabaseValueChange("internalSensors.scanSpeedBoost",function(newData){
	if(newData == null){
		setDatabaseValue("internalSensors.scanSpeedBoost",sensorScansCore_InternalSpeedBoost);
		return;
	}
	sensorScansCore_InternalSpeedBoost = newData;
})

onDatabaseValueChange("externalSensors.scanSpeedBoost",function(newData){
	if(newData == null){
		setDatabaseValue("externalSensors.scanSpeedBoost",sensorScansCore_ExternalSpeedBoost);
		return;
	}
	sensorScansCore_ExternalSpeedBoost = newData;
});

onDatabaseValueChange("sensors.externalScans.scanObject",function(newData){
	var shouldAnnounce = Sensor_Scans_Core_Preset.notifyOnNewScan;
	sensorScansCore_externalScanInfo = newData;
	sensor_Scans_Core_UpdateBasedOnScanType();
	if(newData == undefined){
		sensorScanCore_externalScanAnnounced = false;
		$("#Sensor-Scans-Core_ExternalSensorsProgressFill").css("width","0%");
		$("#Sensor-Scans-Core_ExternalSensorsProgressLabel").html("EXTERNAL SCAN PROGRESS (0%)");
		return;
	}
	if(sensorScansCore_externalScanInfo.time.timePassed >= sensorScansCore_externalScanInfo.time.timeRequired && sensorScansCore_externalScanAnswer == ""){
		interstellarSay("EXTERNAL SCAN PENDING ANSWER!");
	}
	if(newData == "canceled"){
		interstellarSay("EXTERNAL SCAN CANCELED");
		$("#Sensor-Scans-Core_ExternalSensorsProgressFill").css("width","0%");
		$("#Sensor-Scans-Core_ExternalSensorsProgressLabel").html("EXTERNAL SCAN PROGRESS (0%)");
		setDatabaseValue("sensors.externalScans.scanObject",undefined);
		sensorScanCore_externalScanAnnounced = false;
		if(sensorScansCore_ScanTypeSelected == "external"){
			$("#Sensor-Scans-Core_ScanQuerry").prepend("(CANCELED)");
		}
		return;
	}
	if(!sensorScanCore_externalScanAnnounced){
		if(shouldAnnounce){
			interstellarSay("NEW EXTERNAL SCAN");
		}
		sensorScanCore_externalScanAnnounced = true;

		//since we only want the auto response to apply initally, and not
		//ever time there as a percentage update, we also apply that here
	}

	var buttonElement = $("#Sensor-Scans-Core_ExternalSensorsProgressFill");
	var progress = (newData.time.timePassed / newData.time.timeRequired) * 100;
	if(sensorScansCore_externalScanAnswer == ""){
		if(progress > 60){
			if(progress > 95){
				buttonElement.removeClass("sensors-scans-core_scanProgressBarWarning");
				buttonElement.addClass("sensors-scans-core_scanProgressBarBigWarning");
				buttonElement.removeClass("sensors-scans-core_scanProgressBarAnswered");
			}else{
				buttonElement.removeClass("sensors-scans-core_scanProgressBarBigWarning");
				buttonElement.addClass("sensors-scans-core_scanProgressBarWarning");
				buttonElement.removeClass("sensors-scans-core_scanProgressBarAnswered");
			}
		}else{
			buttonElement.removeClass("sensors-scans-core_scanProgressBarBigWarning");
			buttonElement.removeClass("sensors-scans-core_scanProgressBarWarning");
			buttonElement.removeClass("sensors-scans-core_scanProgressBarAnswered");
		}
	}else{
		buttonElement.removeClass("sensors-scans-core_scanProgressBarBigWarning");
		buttonElement.removeClass("sensors-scans-core_scanProgressBarWarning");
		buttonElement.addClass("sensors-scans-core_scanProgressBarAnswered");
	}
	buttonElement.css("width",progress + "%");
	$("#Sensor-Scans-Core_ExternalSensorsProgressLabel").html("EXTERNAL SCAN PROGRESS (" + Math.floor(progress) + "%)");
});

onDatabaseValueChange("internalSensors.scanInfo",function(newData){
	var shouldAnnounce = Sensor_Scans_Core_Preset.notifyOnNewScan;
	var shouldAnnounceAutoAnswer = Sensor_Scans_Core_Preset.notifyOnAutoAnswer;

	sensorScansCore_internalScanInfo = newData;
	sensor_Scans_Core_UpdateBasedOnScanType();
	if(newData == null){
		sensorScanCore_internalScanAnnounced = false;
		$("#Sensor-Scans-Core_InternalSensorsProgressFill").css("width","0%");
		$("#Sensor-Scans-Core_InternalSensorsProgressLabel").html("INTERNAL SCAN PROGRESS (0%)");
		return;
	}
	if(sensorScansCore_internalScanInfo.timePassed >= sensorScansCore_internalScanInfo.timeRequired && sensorScansCore_internalScanAnswer == ""){
		interstellarSay("INTERNAL SCAN PENDING ANSWER!");
	}
	if(newData == "canceled"){
		interstellarSay("INTERNAL SCAN CANCELED");
		$("#Sensor-Scans-Core_InternalSensorsProgressFill").css("width","0%");
		$("#Sensor-Scans-Core_InternalSensorsProgressLabel").html("INTERNAL SCAN PROGRESS (0%)");
		setDatabaseValue("internalSensors.scanInfo",null);
		sensorScanCore_internalScanAnnounced = false;
		if(sensorScansCore_ScanTypeSelected == "internal"){
			$("#Sensor-Scans-Core_ScanQuerry").prepend("(CANCELED)");
		}
		return;
	}
	if(!sensorScanCore_internalScanAnnounced){

		//since we only want the auto response to apply initally, and not
		//ever time there as a percentage update, we also apply that here

		var queryWeight = 0;
		//queryWeight helps us to override other querys in the place
		//of ones that are more important.  For example, regardless of
		//order we always want a deck scan to override a default scan.
		//
		//so even if default says "no intruders detected", we always want
		//all decks to say "1 intruder detected, deck 1".
		for(var i = 0;i < sensorScansCore_internalAutoResponseItems.length;i++){
			if(sensorScansCore_internalAutoResponseItems[i].isActive){
				if(sensorScansCore_internalAutoResponseItems[i].query.toLowerCase() == sensorScansCore_internalScanInfo.scanQuerry.toLowerCase()){
					if(sensorScansCore_internalAutoResponseItems[i].location == "default" || sensorScansCore_internalAutoResponseItems[i].location.toLowerCase() == sensorScansCore_internalScanInfo.scanLocation.toLowerCase()){
						var thisQueryWeight = 0;
						if(sensorScansCore_internalAutoResponseItems[i].location != "default"){
							thisQueryWeight = 1;
						}
						if(queryWeight <= thisQueryWeight){
							queryWeight = thisQueryWeight;
							setDatabaseValue("internalSensors.scanAnswer",sensorScansCore_internalAutoResponseItems[i].response.toUpperCase());
							if(!sensorScanCore_internalScanAnnounced){
								if(shouldAnnounceAutoAnswer){
									interstellarSay("INTERNAL SCAN AUTOMATICALLY ANSWERED");
								}
								sensorScanCore_internalScanAnnounced = true;
							}
						}
					}
				}
			}
		}
		if(!sensorScanCore_internalScanAnnounced){
			if(shouldAnnounce){
				interstellarSay("NEW INTERNAL SCAN");
			}
			sensorScanCore_internalScanAnnounced = true;
		}
	}

	var progress = (newData.timePassed / newData.timeRequired) * 100;

	var buttonElement = $("#Sensor-Scans-Core_InternalSensorsProgressFill");
	if(sensorScansCore_internalScanAnswer == ""){
		if(progress > 60){
			if(progress > 95){
				buttonElement.removeClass("sensors-scans-core_scanProgressBarWarning");
				buttonElement.addClass("sensors-scans-core_scanProgressBarBigWarning");
				buttonElement.removeClass("sensors-scans-core_scanProgressBarAnswered");
			}else{
				buttonElement.removeClass("sensors-scans-core_scanProgressBarBigWarning");
				buttonElement.addClass("sensors-scans-core_scanProgressBarWarning");
				buttonElement.removeClass("sensors-scans-core_scanProgressBarAnswered");
			}
		}else{
			buttonElement.removeClass("sensors-scans-core_scanProgressBarBigWarning");
			buttonElement.removeClass("sensors-scans-core_scanProgressBarWarning");
			buttonElement.removeClass("sensors-scans-core_scanProgressBarAnswered");
		}
	}else{
		buttonElement.removeClass("sensors-scans-core_scanProgressBarBigWarning");
		buttonElement.removeClass("sensors-scans-core_scanProgressBarWarning");
		buttonElement.addClass("sensors-scans-core_scanProgressBarAnswered");
	}

	buttonElement.css("width",progress + "%");
	$("#Sensor-Scans-Core_InternalSensorsProgressLabel").html("INTERNAL SCAN PROGRESS (" + Math.floor(progress) + "%)");
});

//functions

function sensor_scans_core_UpdateUserPrefs(){
	if(Sensor_Scans_Core_Preset.notifyOnNewScan){
		$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-announceScansDropdown").val("Always");
	}else{
		$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-announceScansDropdown").val("Never");
	}
	if(Sensor_Scans_Core_Preset.notifyOnAutoAnswer){
		$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-announceAutoAnswerDropdown").val("Always");
	}else{
		$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-announceAutoAnswerDropdown").val("Never");
	}
	$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-externalSpeedBoostTextbox").val(Sensor_Scans_Core_Preset.speedBoosts.external + "x");
	$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-internalSpeedBoostTextbox").val(Sensor_Scans_Core_Preset.speedBoosts.internal + "x");
	var html = "";
	for(var i = 0;i < Sensor_Scans_Core_Preset.hotkeys.length;i++){
		var hotkey = String.fromCharCode((96 <= Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.key && Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.key <= 105)? Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.key-48 : Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.key);
		if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.cmd){
			hotkey = "Command + " + hotkey;
		}
		if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.shift){
			hotkey = "Shift + " + hotkey;
		}
		if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.alt){
			hotkey = "Alt + " + hotkey;
		}
		if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.control){
			hotkey = "Control + " + hotkey;
		}
		var hotkeyValue = Sensor_Scans_Core_Preset.hotkeys[i].value
		var style = "style='top:" + i * 60 + "px'";
		html += "<div class='Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem' " + style + " index='" + i + "'>";
		html += "Key <input type='text' keyIndex='" + i + "' value='" + hotkey + "' class='Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem-keyTextbox'>";
		html += "Value <textarea keyIndex='" + i + "' class='Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem-valueTextbox'>" + hotkeyValue + "</textarea>";
		html += "</div>"
	}
	$("#Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList").html(html);
	if(hotkeyDeleteMode){
		$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").addClass("sensor-scans-core_deleteMode");
		$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").off();
		$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").click(function(event){
			var index = $(event.target).attr("index")
			console.log(index);
			Sensor_Scans_Core_Preset.hotkeys.splice(index,1);
			setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
		});
	}else{
		$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").off();
		$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").removeClass("sensor-scans-core_deleteMode");
	}
	$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem-keyTextbox").off();
	$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem-keyTextbox").keydown(function(event){
		if(event.keyCode == 91 || event.keyCode == 16 || event.keyCode == 18 || event.keyCode == 17){
			//filter out function keys
			return;
		}

		var keyInfo = 
		{
			"key" : event.keyCode,
			"alt" : event.altKey,
			"control" : event.ctrlKey,
			"shift" : event.shiftKey,
			"cmd" : event.metaKey
		}
		var index = $(event.target).attr("keyIndex");
		Sensor_Scans_Core_Preset.hotkeys[index].keyInfo = keyInfo;
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});
	$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem-valueTextbox").off();
	$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem-valueTextbox").change(function(event){
		var index = $(event.target).attr("keyIndex");
		Sensor_Scans_Core_Preset.hotkeys[index].value = $(event.target).val();
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});
}

function sensor_scans_core_UpdateAutoResponseList(){
	var html = "";
	for(var i = 0;i < sensorScansCore_internalAutoResponsePresets.internal.length;i++){
		html += "<option>" + sensorScansCore_internalAutoResponsePresets.internal[i].presetName + "</option>";
	}
	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-presetsDropdown").html(html);
	html = "";
	var internalRoomsList = "";
	internalRoomsList += "<optgroup><option>";
	internalRoomsList += "Default";
	internalRoomsList += "</option></optgroup>";
	internalRoomsList += "<optgroup><option>";
	internalRoomsList += "All Decks, All Rooms";
	internalRoomsList += "</option></optgroup";
	for(var i = 0;i < sensorScansCore_shipRooms.length;i++){
		internalRoomsList += "<optgroup><option>";
		internalRoomsList += "Deck " + (i + 1) + ", All Rooms";
		internalRoomsList += "</option></optgroup>";
		for(var j = 0;j < sensorScansCore_shipRooms[i].length;j++){
			internalRoomsList += "<option>";
			internalRoomsList += "Deck " + (i + 1) + ", " + sensorScansCore_shipRooms[i][j];
			internalRoomsList += "</option>";
		}
	}
	var i;
	for(i = 0;i < sensorScansCore_internalAutoResponseItems.length; i++){
		var query = sensorScansCore_internalAutoResponseItems[i].query;
		var response = sensorScansCore_internalAutoResponseItems[i].response;
		var location = sensorScansCore_internalAutoResponseItems[i].location;
		var isActive = sensorScansCore_internalAutoResponseItems[i].isActive;
		//sorry for the code below
		//it's super messy, I know
		var style = "top:" + (55 * i) + "px";
		var activeLight = "onLight";
		if(!isActive){
			activeLight = "offLight";
		}
		html += "<div class='Sensors-Scans-Core-AutoResponseOptions-tableItem' index='" + i + "' style='" + style + "'>";
		html += "<div queryType='internal' index='" + i + "' class='" + activeLight + " Sensors-Scans-Core-AutoResponseOptions-enabledLight'></div>";
		html += "<div class='Sensors-Scans-Core-AutoResponseOptions-queryLabel'>Query</div>";
		html += "<input queryType='internal' index='" + i + "' type='text' id='Sensors-Scans-Core-AutoResponseOptions-query-" + i + "' class='Sensors-Scans-Core-AutoResponseOptions-query' value='" + query + "'>";
		html += "<div class='Sensors-Scans-Core-AutoResponseOptions-responseLabel'>Response</div>";
		html += "<input queryType='internal' index='" + i + "' type='text' id='Sensors-Scans-Core-AutoResponseOptions-response-" + i + "' class='Sensors-Scans-Core-AutoResponseOptions-response' value='" + response + "'>"
		html += "<div class='Sensors-Scans-Core-AutoResponseOptions-locationLabel'>Location</div>";
		html += "<select queryType='internal' index='" + i + "' class='Sensors-Scans-Core-AutoResponseOptions-Location'><option>" + location + "</option>" + internalRoomsList + "</select>";
		html += "</div>";
	}
	$("#Sensors-Scans-Core-AutoResponseOptions-table").html(html);
	if(autoResponseDeleteMode){
		$(".Sensors-Scans-Core-AutoResponseOptions-tableItem").addClass("sensor-scans-core_deleteMode");
		$(".Sensors-Scans-Core-AutoResponseOptions-tableItem").click(function(event){
			var index = $(event.target).attr("index");
			sensorScansCore_internalAutoResponseItems.splice(index,1);
			setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
		});
	}
	//remove current event handlers
	//so that we don't have old ones firing.
	$(".Sensors-Scans-Core-AutoResponseOptions-enabledLight").off();
	//add the new ones
	$(".Sensors-Scans-Core-AutoResponseOptions-enabledLight").click(function(event){
		var index = $(event.target).attr("index");
		var type = $(event.target).attr("queryType");
		if(type == "internal"){
			sensorScansCore_internalAutoResponseItems[index].isActive = ! sensorScansCore_internalAutoResponseItems[index].isActive;
		}
		setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
	});
	//remove current event handlers
	//so that we don't have old ones firing.
	$(".Sensors-Scans-Core-AutoResponseOptions-Location").off();
	//add the new ones
	$(".Sensors-Scans-Core-AutoResponseOptions-Location").change(function(event){
		var index = $(event.target).attr("index");
		var type = $(event.target).attr("queryType");
		if(type == "internal"){
			sensorScansCore_internalAutoResponseItems[index].location = $(event.target).val();
		}
		setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
	});
	//remove current event handlers
	//so that we don't have old ones firing.
	$(".Sensors-Scans-Core-AutoResponseOptions-response").off();
	//add the new ones
	$(".Sensors-Scans-Core-AutoResponseOptions-response").change(function(event){
		var index = $(event.target).attr("index");
		var type = $(event.target).attr("queryType");
		if(type == "internal"){
			sensorScansCore_internalAutoResponseItems[index].response = $(event.target).val();
		}
		setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
	});
	//remove current event handlers
	//so that we don't have old ones firing.
	$(".Sensors-Scans-Core-AutoResponseOptions-query").off();
	//add the new ones
	$(".Sensors-Scans-Core-AutoResponseOptions-query").change(function(event){
		var index = $(event.target).attr("index");
		var type = $(event.target).attr("queryType");
		if(type == "internal"){
			sensorScansCore_internalAutoResponseItems[index].query = $(event.target).val();
		}
		setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
	});
}

function sensor_Scans_Core_UpdateBasedOnScanType(){
	var scanIsInProgress = false;
	var scanHasBeenAnswered = false;
	var scanQuerry = "";
	var scanLocation = "";
	var scanType = 0;
	var scanProgress = 0;

	if(sensorScansCore_ScanTypeSelected == "internal"){
			//internal GUI
			if(sensorScansCore_internalScanInfo != undefined){
				scanIsInProgress = true;
				scanQuerry = sensorScansCore_internalScanInfo.scanQuerry;
				scanLocation = sensorScansCore_internalScanInfo.scanLocation;
				scanType = sensorScansCore_internalScanInfo.scanType;
				scanProgress = sensorScansCore_internalScanInfo.timePassed / sensorScansCore_internalScanInfo.timeRequired;
			}
			if(sensorScansCore_internalScanAnswer != ""){
				scanHasBeenAnswered = true;
			}
		}else{
			//external GUI
			if(sensorScansCore_externalScanInfo != undefined){
				scanIsInProgress = true;
				console.log(sensorScansCore_externalScanInfo);
				scanQuerry = sensorScansCore_externalScanInfo.querry;
				scanLocation = sensorScansCore_externalScanInfo.direction;
				scanProgress = sensorScansCore_externalScanInfo.time.timePassed / sensorScansCore_externalScanInfo.time.timeRequired;
			}
			if(sensorScansCore_externalScanAnswer != ""){
				scanHasBeenAnswered = true;
			}
		}

		if(scanIsInProgress){
			$("#Sensor-Scans-Core_ScanQuerry").html(scanQuerry);
			if(!scanHasBeenAnswered){
				$("#Sensor-Scans-Core_ScanQuerry").addClass("sensors-scans-core_scanQuerryBoxAttention");
			}else{
				$("#Sensor-Scans-Core_ScanQuerry").removeClass("sensors-scans-core_scanQuerryBoxAttention");
			}
		}

		var buttonElement = $("#Sensor-Scans-Core_InternalScansButton");
		var colors = sensorScansCore_InternalExternalButtonSelectColors;
		if(sensorScansCore_internalScanInfo != undefined){
			if(sensorScansCore_ScanTypeSelected == "internal"){
				//if there is a scan and internal is selected
				if(sensorScansCore_internalScanAnswer != ""){
					//already answered
					buttonElement.css("backgroundColor",colors.scanHasBeenAnswered.buttonSelected);
				}else{
					//no answer
					buttonElement.css("backgroundColor",colors.scanIsInProgress.buttonSelected);
				}
			}else{
				//if there is a scan and external is selected
				if(sensorScansCore_internalScanAnswer != ""){
					//already answered
					buttonElement.css("backgroundColor",colors.scanHasBeenAnswered.buttonNotSelected);
				}else{
					//no answer
					buttonElement.css("backgroundColor",colors.scanIsInProgress.buttonNotSelected);
				}
			}
		}else{
			if(sensorScansCore_ScanTypeSelected == "internal"){
				//if there is no scan and internal is selected
				buttonElement.css("backgroundColor",colors.scanIsNotInProgress.buttonSelected);
			}else{
				buttonElement.css("backgroundColor",colors.scanIsNotInProgress.buttonNotSelected);
			}
		}
		buttonElement = $("#Sensor-Scans-Core_ExternalScansButton");
		if(sensorScansCore_externalScanInfo != undefined){
			if(sensorScansCore_ScanTypeSelected == "external"){
				//if there is a scan and internal is selected
				if(sensorScansCore_externalScanAnswer != ""){
					//already answered
					buttonElement.css("backgroundColor",colors.scanHasBeenAnswered.buttonSelected);
				}else{
					//no answer
					buttonElement.css("backgroundColor",colors.scanIsInProgress.buttonSelected);
				}
			}else{
				//if there is a scan and external is selected
				if(sensorScansCore_externalScanAnswer != ""){
					//already answered
					buttonElement.css("backgroundColor",colors.scanHasBeenAnswered.buttonNotSelected);
				}else{
					//no answer
					buttonElement.css("backgroundColor",colors.scanIsInProgress.buttonNotSelected);
				}
			}
		}else{
			if(sensorScansCore_ScanTypeSelected == "external"){
				//if there is no scan and internal is selected
				buttonElement.css("backgroundColor",colors.scanIsNotInProgress.buttonSelected);
			}else{
				buttonElement.css("backgroundColor",colors.scanIsNotInProgress.buttonNotSelected);
			}
		}
	}

	//event handlers

	$("#Sensor-Scans-Core_InternalScansButton").click(function(event){
		sensorScansCore_ScanTypeSelected = "internal";
		$("#Sensor-ScansCore_ScanAnswerTextarea").val(sensorScansCore_internalScanAnswer);
		sensor_Scans_Core_UpdateBasedOnScanType();
	});

	$("#Sensor-Scans-Core_ExternalScansButton").click(function(event){
		sensorScansCore_ScanTypeSelected = "external";
		$("#Sensor-ScansCore_ScanAnswerTextarea").val(sensorScansCore_externalScanAnswer);
		sensor_Scans_Core_UpdateBasedOnScanType();
	});

	$("#Sensor-Scans-Core_AutoSendButton").click(function(event){
		
	});

	$("#Sensor-Scans-Core_AutoSendButton").contextmenu(function(event){
		openCoreWindow("Sensors-Scans-Core-AutoResponseOptions",event);
	});

	$("#Sensor-Scans-Core_specifyButton").click(function(event){
		$("#Sensor-ScansCore_ScanAnswerTextarea").val("SCAN REQUEST IS TOO VAGUE, PLEASE SPECIFY WHAT YOU WISH TO SCAN FOR");
	});

	$("#Sensor-Scans-Core_unknownButton").click(function(event){
		$("#Sensor-ScansCore_ScanAnswerTextarea").val("REQUEST QUERY IS UNKNOWN AND OR AMBIGUOUS, PLEASE RESTATE.");
	});

	$("#Sensor-Scans-Core_unableToScanButton").click(function(event){
		$("#Sensor-ScansCore_ScanAnswerTextarea").val("SCAN REQUEST IS INVALID, SCAN CANNOT BE COMPLETED");
	});

	$("#Sensor-Scans-Core_NoneDetectedButton").click(function(event){
		$("#Sensor-ScansCore_ScanAnswerTextarea").val("NONE DETECTED");
	});

	$("#Sensor-Scans-Core_ScanProgress").click(function(event){
		if(sensorScansCore_internalScanInfo == null){
			return;
		}
		var newProgress = event.offsetX / $(event.target).width();
		sensorScansCore_internalScanInfo.timePassed = newProgress * sensorScansCore_internalScanInfo.timeRequired;
		setDatabaseValue("internalSensors.scanInfo",sensorScansCore_internalScanInfo);
	});

	$("#Sensor-Scans-Core_InternalSensorsProgress").click(function(event){
		if(sensorScansCore_internalScanInfo == null){
			return;
		}
		var newProgress = event.offsetX / $(event.target).width();
		sensorScansCore_internalScanInfo.timePassed = newProgress * sensorScansCore_internalScanInfo.timeRequired;
		setDatabaseValue("internalSensors.scanInfo",sensorScansCore_internalScanInfo);
	});

	$("#Sensor-Scans-Core_InstantFinishButton").click(function(event){
		if(sensorScansCore_ScanTypeSelected == "internal"){
			if(sensorScansCore_internalScanInfo != null){
				sensorScansCore_internalScanInfo.timePassed = sensorScansCore_internalScanInfo.timeRequired;
				setDatabaseValue("internalSensors.scanInfo",sensorScansCore_internalScanInfo);
			}
		}else{
			if(sensorScansCore_externalScanInfo != null){
				sensorScansCore_externalScanInfo.time.timePassed = sensorScansCore_externalScanInfo.time.timeRequired;
				setDatabaseValue("sensors.externalScans.scanObject",sensorScansCore_externalScanInfo);
			}
		}
	});

	$("#Sensor-Scans-Core_SendAnswerButton").click(function(event){
		var scanAnswer = $("#Sensor-ScansCore_ScanAnswerTextarea").val();
		if(sensorScansCore_ScanTypeSelected == "internal"){
		//answer internal scan
		setDatabaseValue("internalSensors.scanAnswer",scanAnswer);
	}else{
		//answer external scan
		setDatabaseValue("externalSensors.scanAnswer",scanAnswer);
	}
});

	$("#Sensor-Scans-Core_UserPrefences").click(function(event){
		if($("#Sensor-Scans-Core-UserPrefsWindow").css("display") == "block"){
			closeCoreWindow("Sensor-Scans-Core-UserPrefsWindow",event)
		}else{
			interstellarDropDownMenu("password","PLEASE ENTER THE ADMIN PASSWORD",function(enteredData){
				getAdminPassword(function(password){
					if(enteredData == password){
						openCoreWindow("Sensor-Scans-Core-UserPrefsWindow",event);
					}
				});
			});
		}
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresetsButton").click(function(event){
		$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets").slideDown();
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-cancelButton").click(function(event){
		$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets").slideUp();
	})

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-createNewPresetButton").click(function(event){
		$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets").slideUp();
		$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset").slideDown();
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset-cancelButton").click(function(event){
		$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset").slideUp(function(){
			$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset-nameTextbox").val("");
		});
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-queryControls-removeButton").click(function(event){
		autoResponseDeleteMode = !autoResponseDeleteMode;
		if(autoResponseDeleteMode){
			$(".Sensors-Scans-Core-AutoResponseOptions-tableItem").addClass("sensor-scans-core_deleteMode");
			$(".Sensors-Scans-Core-AutoResponseOptions-tableItem").click(function(event){
				var index = $(event.target).attr("index");
				sensorScansCore_internalAutoResponseItems.splice(index,1);
				setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
			});
		}else{
			$(".Sensors-Scans-Core-AutoResponseOptions-tableItem").remove("sensor-scans-core_deleteMode")
			$(".Sensors-Scans-Core-AutoResponseOptions-tableItem").off();
		}
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset-createButton").click(function(event){
		var presetName = $("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset-nameTextbox").val();
		var presets = sensorScansCore_internalAutoResponseItems;
		var presetObject =
		{
			"presetName" : presetName,
			"presets" : presets
		}
		sensorScansCore_internalAutoResponsePresets.internal.splice(sensorScansCore_internalAutoResponsePresets.internal.length,0,presetObject);
		setPresetValue("sensor-scans-core.autoResponseItemsPresets",sensorScansCore_internalAutoResponsePresets);
		$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset").slideUp(function(){
			$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-editPresets-newPreset-nameTextbox").val("");
		});
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-queryControls-CreateNewButton").click(function(event){
		var newQuery = {
			"query" : "",
			"response" : "",
			"location" : "",
			"isActive" : false
		}
		sensorScansCore_internalAutoResponseItems.splice(sensorScansCore_internalAutoResponseItems.length,0,newQuery);
		setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponseItems);
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-overridePresetCheckbox").change(function(event){
		overrideAutoResponseOptions = $(event.target).prop("checked");
	});
	$("#Sensors-Scans-Core-UserPrefsWindow-hotKeysContainer-addRemoveButtons-remove").click(function(event){
		hotkeyDeleteMode = !hotkeyDeleteMode;
		if(hotkeyDeleteMode){
			$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").addClass("sensor-scans-core_deleteMode");
			$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").off();
			$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").click(function(event){
				var index = $(event.target).attr("index")
				console.log(index);
				Sensor_Scans_Core_Preset.hotkeys.splice(index,1);
				setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
			});
		}else{
			$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").off();
			$(".Sensor-Scans-Core-UserPrefsWindow-hotkeysContainer-hotKeysList-hotkeyItem").removeClass("sensor-scans-core_deleteMode");
		}
	});
	$("#Sensors-Scans-Core-UserPrefsWindow-hotKeysContainer-addRemoveButtons-add").click(function(event){
		event.preventDefault();
		var newHotkey = {
			"keyInfo" : {
				"key" : null,
				"shift" : false,
				"cmd" : false,
				"control" : false,
				"alt" : false
			},
			"value" : ""
		}
		Sensor_Scans_Core_Preset.hotkeys.splice(Sensor_Scans_Core_Preset.hotkeys.length,0,newHotkey);
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});

	$("#Sensors-Scans-Core-AutoResponseOptions-tableOptions-presetsDropdown").change(function(event){
		var newPresetToLoad = $(event.target).val();
		for(var i = 0;i < sensorScansCore_internalAutoResponsePresets.internal.length;i++){
			if(newPresetToLoad == sensorScansCore_internalAutoResponsePresets.internal[i].presetName){
				if(overrideAutoResponseOptions){
					setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponsePresets.internal[i].presets);
				}else{
					setDatabaseValue("sensor-scans-core.internalAutoResponseItems",sensorScansCore_internalAutoResponsePresets.internal[i].presets.concat(sensorScansCore_internalAutoResponseItems));
				}
			}
		}
	});

	$("#Sensor-ScansCore_ScanAnswerTextarea").keydown(function(event){
		var keyInfo = 
		{
			"key" : event.keyCode,
			"alt" : event.altKey,
			"control" : event.ctrlKey,
			"shift" : event.shiftKey,
			"cmd" : event.metaKey
		}
		for(var i = 0;i < Sensor_Scans_Core_Preset.hotkeys.length;i++){
			if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.key == keyInfo.key){
				if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.alt == keyInfo.alt){
					if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.control == keyInfo.control){
						if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.shift == keyInfo.shift){
							if(Sensor_Scans_Core_Preset.hotkeys[i].keyInfo.cmd == keyInfo.cmd){
								$("#Sensor-ScansCore_ScanAnswerTextarea").val(Sensor_Scans_Core_Preset.hotkeys[i].value);
								event.preventDefault();
								return;
							}
						}
					}
				}
			}
		}
	});

	$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-announceScansDropdown").change(function(event){
		if($(event.target).val() == "Always"){
			Sensor_Scans_Core_Preset.notifyOnNewScan = true;
		}else{
			Sensor_Scans_Core_Preset.notifyOnNewScan = false;
		}
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});

	$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-announceAutoAnswerDropdown").change(function(event){
		if($(event.target).val() == "Always"){
			Sensor_Scans_Core_Preset.notifyOnAutoAnswer = true;
		}else{
			Sensor_Scans_Core_Preset.notifyOnAutoAnswer = false;
		}
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});

	$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-externalSpeedBoostTextbox").on("change",function(event){
		Sensor_Scans_Core_Preset.speedBoosts.external = $(event.target).val().replace(/[^\d.-]/g, '');
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});

	$("#Sensor-Scans-Core-UserPrefsWindow-generalSettings-contentArea-internalSpeedBoostTextbox").on("change",function(event){
		Sensor_Scans_Core_Preset.speedBoosts.internal = $(event.target).val().replace(/[^\d.-]/g, '');
		setPresetValue("sensor-scans-core.generalPrefrences",Sensor_Scans_Core_Preset);
	});
});