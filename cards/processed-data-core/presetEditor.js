//this script has it's own instance of a class to provide a private scope
//for the variables to operate in
var processedDataCorePresetEditorDidInit = false;
var ProcessedDataPresetEditor = function(){
	//do not allow this class to be instantiated more than one time (leaking event listeners)
	if(processedDataCorePresetEditorDidInit){
		return;
	}
	processedDataCorePresetEditorDidInit = true;

	//variables
	var presets = 
		[
			{
				"mission" : "Generic",
				"presets" : 
				[
					{
						"name" : "Successful Warp Jump",
						"message" : "INFORMATION: WARP ENGINES ARE NOW COMING ONLINE, THIS VESSEL HAS MADE A SUCCESSFUL JUMP TO WARP SPEEDS"
					},
					{
						"name" : "Slow Full Stop",
						"message" : "INFORMATION: THIS VESSEL IS NOW ARRIVING AT IT'S DESTINATION, RECOMMENDED SLOWING FULL STOP"
					},
					{
						"name" : "Targeted!",
						"message" : "WARNING!  THIS VESSEL HAS BEEN TARGETED!"
					}
				]
			},{
				"mission" : "Generic2",
				"presets" : 
				[
					{
						"name" : "Successful Warp2 Jump",
						"message" : "INFORMATION: WARP ENGINES ARE NOW COMING ONLINE, THIS VESSEL HAS MADE A SUCCESSFUL JUMP TO WARP SPEEDS"
					},
					{
						"name" : "Slow Fu2ll Stop",
						"message" : "INFORMATION: THIS VESSEL IS NOW ARRIVING AT IT'S DESTINATION, RECOMMENDED SLOWING FULL STOP"
					},
					{
						"name" : "Targe2ted!",
						"message" : "WARNING!  THIS VESSEL HAS BEEN TARGETED!"
					}
				]
			},
		],
		selectedMission = 0,
		selectedPreset = 0;

	//DOM references
	var missionList = $("#processedDataSettingsWindow_presetsSection_missionList_missions"),
		presetList = $("#processedDataSettingsWindow_presetsSection_presetList_presets"),
		missionNameTextbox = $("#processedDataSettingsWindow_presetsSection_presetEditor_missionNameTextbox"),
		presetNameTextbox = $("#processedDataSettingsWindow_presetsSection_presetEditor_presetNameTextbox"),
		presetTextarea = $("#processedDataSettingsWindow_presetsSection_presetEditor_presetTextarea"),
		saveButton = $("#processedDataSettingsWindow_presetsSection_saveButton"),
		deleteButton = $("#processedDataSettingsWindow_presetsSection_deleteButton");

	//init calls

	//interstellar functions

	//preset observers

	Interstellar.onPresetValueChange("processedData.presets",function(newData){
		if(newData == null){
			Interstellar.setPresetValue("processedData.presets",presets);
			return;
		}
		presets = newData;
		updatePresetList();
	});

	//database observers

	//functions

	//credit to https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
	function array_move(arr, old_index, new_index) {
	    if (new_index >= arr.length) {
	        var k = new_index - arr.length + 1;
	        while (k--) {
	            arr.push(undefined);
	        }
	    }
	    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	    return arr; // for testing
	};

	function updatePresetList(){
		var html = "",
			i = 0; //defining i outside of a loop is faster

		//first we will list all missions
		for(i = 0;i < presets.length;i++){
			html += '<div index="' + i + '" type="mission" class="processedDataSettingsWindow_missionListener processedDataSettingsWindow_listContainer_item">';
			html += '<div index="' + i + '" type="mission" class="processedDataSettingsWindow_missionListener processedDataSettingsWindow_listContainer_item_title">';
			html += 	presets[i].mission;
			html += '</div>';
			html += '<div index="' + i + '" type="mission" class="processedDataSettingsWindow_missionListener processedDataSettingsWindow_listContainer_item_delete" title="Delete Mission">';
			html += 	'🗑';
			html += '</div>';
			html += '<div index="' + i + '" type="mission" class="processedDataSettingsWindow_missionListener processedDataSettingsWindow_listContainer_item_up" title="Sort Up One Position">';
			html += 	'↑';
			html += '</div>';
			html += '<div index="' + i + '" type="mission" class="processedDataSettingsWindow_missionListener processedDataSettingsWindow_listContainer_item_down" title="Sort Down One Position">';
			html += 	'↓';
			html += '</div>';
			html += '</div>';
		}
		html += "<div type='mission' class='processedDataSettingsWindow_listContainer_addItem'>";
		html += "New Mission";
		html += "</div>"
		$(".processedDataSettingsWindow_missionListener").off();
		missionList.html(html);
		html = "";
		//then we will list all presets for the selected mission
		if(presets.length > 0 && presets.length > selectedMission){
			for(i = 0;i < presets[selectedMission].presets.length;i++){
				html += '<div index="' + i + '" type="preset" class="processedDataSettingsWindow_presetListener processedDataSettingsWindow_listContainer_item">';
				html += '<div index="' + i + '" type="preset" class="processedDataSettingsWindow_presetListener processedDataSettingsWindow_listContainer_item_title">';
				html += 	presets[selectedMission].presets[i].name;
				html += '</div>';
				html += '<div index="' + i + '" type="preset" class="processedDataSettingsWindow_presetListener processedDataSettingsWindow_listContainer_item_delete" title="Delete Mission">';
				html += 	'🗑';
				html += '</div>';
				html += '<div index="' + i + '" type="preset" class="processedDataSettingsWindow_presetListener processedDataSettingsWindow_listContainer_item_up" title="Sort Up One Position">';
				html += 	'↑';
				html += '</div>';
				html += '<div index="' + i + '" type="preset" class="processedDataSettingsWindow_presetListener processedDataSettingsWindow_listContainer_item_down" title="Sort Down One Position">';
				html += 	'↓';
				html += '</div>';
				html += '</div>';
			}
			html += "<div type='preset' class='processedDataSettingsWindow_listContainer_addItem'>";
			html += "New Preset";
			html += "</div>"
		}
		
		$(".processedDataSettingsWindow_listContainer_addItem").off();
		$(".processedDataSettingsWindow_presetListener").off();
		$(".processedDataSettingsWindow_missionListener").off();
		$(".processedDataSettingsWindow_listContainer_item_delete").off();
		$(".processedDataSettingsWindow_listContainer_item_up").off();
		$(".processedDataSettingsWindow_listContainer_item_down").off();
		presetList.html(html);

		$(".processedDataSettingsWindow_listContainer_item_up").click(function(event){
			var index = Number($(event.target).attr("index"));
			if($(event.target).attr("type") == "preset"){
				//move preset
				if(index != 0){
					array_move(presets[selectedMission].presets,index,index - 1);
				}
			}else{
				//move mission
				if(index != 0){
					array_move(presets,index,index - 1);
				}
			}
			Interstellar.setPresetValue("processedData.presets",presets);
		});
		$(".processedDataSettingsWindow_listContainer_item_down").click(function(event){
			var index = Number($(event.target).attr("index"));
			if($(event.target).attr("type") == "preset"){
				//move preset
				if(index != presets[selectedMission].presets.length - 1){
					array_move(presets[selectedMission].presets,index,index + 1);
				}
			}else{
				//move mission
				if(index != presets.length - 1){
					array_move(presets,index,index + 1);
				}
			}
			Interstellar.setPresetValue("processedData.presets",presets);
		});

		$(".processedDataSettingsWindow_listContainer_addItem").click(function(event){
			if($(event.target).attr("type") == "preset"){
				//new preset
				var newPreset = {
					"name" : "New Preset",
					"preset" : ""
				}
				presets[selectedMission].presets.splice(presets[selectedMission].presets.length,0,newPreset);
				selectedPreset = presets[selectedMission].presets.length - 1;
			}else{
				//new mission
				var newPreset = {
					"mission" : "New Mission",
					"presets" : []
				}
				presets.splice(presets.length,0,newPreset);
				selectedMission = presets.length - 1;
				selectedPreset = 0;
			}
			Interstellar.setPresetValue("processedData.presets",presets);
		});
		$(".processedDataSettingsWindow_missionListener").click(function(event){
			selectedMission = Number($(event.target).attr("index"));
			updatePresetList();
		});
		$(".processedDataSettingsWindow_presetListener").click(function(event){
			selectedPreset = Number($(event.target).attr("index"));
			presetTextarea.val(presets[selectedMission].presets[selectedPreset].message);
			presetNameTextbox.val(presets[selectedMission].presets[selectedPreset].name);
			missionNameTextbox.val(presets[selectedMission].mission);
			updatePresetList();
		});
		$(".processedDataSettingsWindow_listContainer_item_delete").click(function(event){
			var index = Number($(event.target).attr("index"));
			if($(event.target).attr("type") == "preset"){
				//delete preset
				presets[selectedMission].presets.splice(Number(index),1);
				selectedPreset--;
				if(selectedPreset == -1 && presets[selectedMission].presets.length > 0){
					selectedPreset = 0;
				}
			}else{
				//delete mission
				presets.splice(Number(index),1);
				selectedMission--;
				if(selectedMission == -1 && presets.length > 0){
					selectedMission = 0;
				}
				selectedPreset = 0;
			}
			Interstellar.setPresetValue("processedData.presets",presets);
		});
	}

	//event handlers
	saveButton.click(function(event){
		presets[selectedMission].mission = missionNameTextbox.val();
		presets[selectedMission].presets[selectedPreset].name = presetNameTextbox.val();
		presets[selectedMission].presets[selectedPreset].message = presetTextarea.val();
		Interstellar.setPresetValue("processedData.presets",presets);
	});
	deleteButton.click(function(event){
		presets[selectedMission].presets.splice(selectedPreset,1);
		Interstellar.setPresetValue("processedData.presets",presets);
	});
}

var processedDataPresetEditorInstance = new ProcessedDataPresetEditor();