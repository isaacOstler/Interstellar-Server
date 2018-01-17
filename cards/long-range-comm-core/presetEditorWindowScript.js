Interstellar.addCoreWidget(undefined,function(){
	//class instances
	
	//DOM references
	var missionsList = $("#lrmCode-Core_editPresetsWindow_missions"),
		presetsList = $("#lrmCode-Core_editPresetsWindow_presets"),
		addMissionButton = $("#lrmCode-Core_editPresetsWindow_addMissionButton"),
		removeMissionButton = $("#lrmCode-Core_editPresetsWindow_removeMissionButton"),
		addPresetButton = $("#lrmCode-Core_editPresetsWindow_addPresetButton"),
		removePresetButton = $("#lrmCode-Core_editPresetsWindow_removePresetButton"),
		saveButton = $("#lrmCode-Core_editPresetsWindow_messageControls_saveButton");

		missionTextbox = $("#lrmCode-Core_editPresetsWindow_messageControls_missionTextboxArea_textbox");
		nameTextbox = $("#lrmCode-Core_editPresetsWindow_messageControls_nameTextbox"),
		fromTextbox = $("#lrmCode-Core_editPresetsWindow_messageControls_fromTextbox"),
		frequencySelect = $("#lrmCode-Core_editPresetsWindow_messageControls_frequencyTextbox"),
		keyTextbox = $("#lrmCode-Core_editPresetsWindow_messageControls_keyTextbox"),
		textarea = $("#lrmCode-Core_editPresetsWindow_messageControls_textarea");

	//variables
var presets = [],
	selectedMission = 0,
	selectedPreset = 0,
	selectedColor = "rgba(0,128,255,.6)";
	//init calls

	//preset observers
	Interstellar.onPresetValueChange("lrm.messages",function(newData){
		if(newData == null){
			Interstellar.setPresetValue("lrm.messages",presets);
			return;
		}
		presets = newData;
		drawGUI();
		loadPreset(selectedMission,selectedPreset);
	});

	//database observers

	//functions
	function loadPreset(mission,preset){
		textarea.val(presets[mission].messages[preset].text);
		fromTextbox.val(presets[mission].messages[preset].from);
		keyTextbox.val(presets[mission].messages[preset].key);
		frequencySelect.val(presets[mission].messages[preset].frequency);
		nameTextbox.val(presets[mission].messages[preset].name);
		missionTextbox.val(presets[mission].name);
	}

	function drawGUI(){
		var missionsHTML = "",
			presetsHTML = "";
		for(var i = 0;i < presets.length;i++){
			var style = '';
			if(i == selectedMission){
				style = 'style="background-color:' + selectedColor + '"';
			}
			missionsHTML += "<div " + style + " index='" + i + "' class='lrmCode-Core_editPresetsWindow_mission noselect lrmCode-Core_editPresetsWindow_list_container_message'>";
			missionsHTML += presets[i].name;
			missionsHTML += "</div>";
		}
		if(selectedMission < presets.length){
			for(var j = 0;j < presets[selectedMission].messages.length;j++){
				var style = '';
				if(j == selectedPreset){
					style = 'style="background-color:' + selectedColor + '"';
				}
				presetsHTML += "<div " + style + " index='" + j + "' class='lrmCode-Core_editPresetsWindow_preset noselect lrmCode-Core_editPresetsWindow_list_container_message'>";
				presetsHTML += presets[selectedMission].messages[j].name;
				presetsHTML += "</div>";
			}
		}
		presetsList.html(presetsHTML);
		missionsList.html(missionsHTML);

		$(".lrmCode-Core_editPresetsWindow_mission").off();
		$(".lrmCode-Core_editPresetsWindow_preset").off();
		$(".lrmCode-Core_editPresetsWindow_mission").click(function(event){
			selectedMission = Number($(event.target).attr("index"));
			selectedPreset = 0;
			drawGUI();
			loadPreset(selectedMission,selectedPreset);
		});
		$(".lrmCode-Core_editPresetsWindow_preset").click(function(event){
			selectedPreset = Number($(event.target).attr("index"));
			drawGUI();
			loadPreset(selectedMission,selectedPreset);
		});
	}

	//event handlers

	saveButton.click(function(event){
		presets[selectedMission].messages[selectedPreset].name = nameTextbox.val();
		presets[selectedMission].messages[selectedPreset].key = keyTextbox.val();
		presets[selectedMission].messages[selectedPreset].frequency = frequencySelect.val();
		presets[selectedMission].messages[selectedPreset].text = textarea.val();
		presets[selectedMission].messages[selectedPreset].from = fromTextbox.val();
		Interstellar.setPresetValue("lrm.messages",presets);
	});

	missionTextbox.on("change",function(event){
		presets[selectedMission].name = event.target.value;
		Interstellar.setPresetValue("lrm.messages",presets);
	});

	addMissionButton.click(function(event){
		presets.unshift({"name" : "NEW MISSION","messages" : []});
		Interstellar.setPresetValue("lrm.messages",presets);
	});

	//intervals
});