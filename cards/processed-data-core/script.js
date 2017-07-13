//copyright Isaac Ostler, July 12th 2017, all rights reserved ©

//the purpose of this variable is to ensure
//this widget's scripts are not initialized
//more than once
var _processedDataCoreWidgetHasInit = false;

//init script (to mimic private variables)
//also grab any presets relevant to this widget
onPresetValueChange("processedData.presets",function(newData){
	if(newData == null){
		//these are default preset values
		var processedDataDefaults = 
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
			}
		]
		//since we haven't defined the default presets, we will
		//set them to the value defined above
		setDatabaseValue("processedData.presets",processedDataDefaults);
		//end the execution of this function
		return;
	}
	//set the value of the presets variable to the new data
	var presets = processedDataDefaults;
	//have we already initialized this widget?
	if(_processedDataCoreWidgetHasInit){
		//we have, end the execution of this function
		return;
	}
	//we have not, set the _processedDataCoreWidgetHasInit
	//flag to true, so that we don't accidentally init again
	_processedDataCoreWidgetHasInit = true;

	//variables
	var drawFontSizeAdjustmentGUI = false,
		currentProcessedDataPreset = [],
		currentProcessedDataPresetIndex = 0,

	//DOM references (for speed and convenience)
		processedDataTextarea = $("#processedData-Core-Widget-processedDataTextfield"),
		presetDropdownMissionSelect = $("#processedData-Core-Widget-processedDataControls-missionDropdown"),
		presetDropdownPresetSelect = $("#processedData-Core-Widget-processedDataControls-presetDropdown"),
		sendButton = $("#processedData-Core-Widget-processedDataControls-sendButton"),
		flashAndSendButton = $("#processedData-Core-Widget-processedDataControls-flashAndSendButton"),
		nextButton = $("#processedData-Core-Widget-processedDataControls-nextButton"),
		backButton = $("#processedData-Core-Widget-processedDataControls-backButton"),
		editPresetsButton = $("#processedData-Core-Widget-processedDataControls-editPresetsButton"),
		altPresetsButton = $("#processedData-Core-Widget-processedDataControls-altEditPresetsButton"),
		fontSizeAdjustmentGUI = $("#processedData-Core-Widget-processedDataControls-allowFontSizeAdjust"),
		fontSizeAdjustmentCheckbox = $("#processedData-Core-Widget-processedDataControls-allowFontSizeAdjust-fontAdjustCheckbox");

	//init calls
	drawGUI();

	//functions

	/*
		NAME: drawGUI()
		TAKES: none
		RETURNS: none
		PURPOSE: draws the GUI for the widget, dependent on preset values
	*/
	function drawGUI(){
		//if we need to draw the font size adjustment option
		if(drawFontSizeAdjustmentGUI){
			//fade in that checkbox
			fontSizeAdjustmentGUI.fadeIn();
			//and the alternate "edit presets" button (the gear)
			altPresetsButton.fadeIn();
			//we also need to fade out the main preset button
			editPresetsButton.fadeOut();
			//lastly we need to edit the width of the preset dropdown
			presetDropdownPresetSelect.css("width","59%");
		}else{
			//fade out that checkbox
			fontSizeAdjustmentGUI.fadeOut();
			//and the alternate "edit presets" button (the gear)
			altPresetsButton.fadeOut();
			//we also need to fade in the main preset button
			editPresetsButton.fadeIn();
			//lastly we need to edit the width of the preset dropdown
			presetDropdownPresetSelect.css("width","65%");
		}
	}

	function handleNewProcessedData(newData){
		//if there is no value for "sensors.processedData"
    	if(newData == null){
    		//set the default value to an empty string
    	    setDatabaseValue("sensors.processedData","");
    	    //and end the execution of this function
    	    return;
    	}
    	//and update the processed data textarea
    	processedDataTextarea.val(newData);
	}
	//preset observers

	//database observers

	onDatabaseValueChange("sensors.processedData.noFlashAndSend",function(newData){
		//since this widget is also responsive to "sensors.processedData" in the
		//exact same manor, the function is shared
		handleNewProcessedData(newData);
	});

	onDatabaseValueChange("sensors.processedData",function(newData){
		//since this widget is also responsive to "sensors.processedData.noFlashAndSend"
		// in the exact same manor, the function is shared
		handleNewProcessedData(newData);
    });

	onDatabaseValueChange("sensors.processedData.allowFontSizeAdjustments",function(newData){
		if(newData == null){
    		//we are NOT responsible for update this value!
    		//this value is defined by the Sensors widget
    		//just standby for now

    	    //end the execution of this function
    	    return;
		}
		if(newData == 0){
			//Never allow the crew to adjust the font size
			allowFontSizeAdjustments = false;
			//save this to the database
			setDatabaseValue("sensors.processedData.crewCanAdjustFontSize",allowFontSizeAdjustments);
			//disable the font size adjustment GUI
			drawFontSizeAdjustmentGUI = false;
			//and redraw the GUI
			drawGUI();
		}else if(newData == 1){
			//allow the FD to allow the crew to adjust the font size
			//enable the font size adjustment GUI
			drawFontSizeAdjustmentGUI = true;
			//and redraw the GUI
			drawGUI();
		}else{
			//Always allow the crew to adjust the font size
			allowFontSizeAdjustments = true;
			//save this to the database
			setDatabaseValue("sensors.processedData.crewCanAdjustFontSize",allowFontSizeAdjustments);
			//disable the font size adjustment GUI
			drawFontSizeAdjustmentGUI = false;
			//and redraw the GUI
			drawGUI();
		}
	});

	//the difference between this database value below and the one above, is this one actually
	//determines if the crew can adjust the font size, this is the final decision, yes or no.
	//The database value above determines what the default value of this database value is,
	//and if can be controlled by the flight director

	onDatabaseValueChange("sensors.processedData.crewCanAdjustFontSize",function(newData){
		//if there is no value for "sensors.processedData.crewCanAdjustFontSize"
    	if(newData == null){
    		//until we know better, assume that the crew CAN
    		//adjust the font size
    		setDatabaseValue("sensors.processedData.crewCanAdjustFontSize",true);
    	    //end the execution of this function
    	    return;
    	}
    	//set the value of drawFontSizeAdjustmentGUI to the newData
    	allowFontSizeAdjustments = newData;
    	//set the font size adjust checkbox's "checked" state to this value
    	fontSizeAdjustmentCheckbox.prop('checked', newData);
	});

	//event handlers

	flashAndSendButton.click(function(event){
		//send the value of the processedData textarea to the database value
    	setDatabaseValue("sensors.processedData",processedDataTextarea.val());
	});

	//the difference between Flash and Send (F&S) and Send, is (if it was obvious)
	//flash and send flashes the screen, send does not
	sendButton.click(function(event){
		//send the value of the processedData textarea to the database value
    	setDatabaseValue("sensors.processedData.noFlashAndSend",processedDataTextarea.val());
	});
});