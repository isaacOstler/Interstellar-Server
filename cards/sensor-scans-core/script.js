var sensorScansHasInit = false;
Interstellar.addCoreWidget("Sensor Scans",function(){
	if(sensorScansHasInit){
		return;
	}
	sensorScansHasInit = true;

	//DOM references
	
	var internalProgressBarFillLabel = $("#sensorScansWidget_scanTypeBar_progressBars_internal_label"),
		internalProgressBarFill = $("#sensorScansWidget_scanTypeBar_progressBars_internal_fill"),
		externalProgressBarFillLabel = $("#sensorScansWidget_scanTypeBar_progressBars_external_label"),
		externalProgressBarFill = $("#sensorScansWidget_scanTypeBar_progressBars_external_fill"),
		toggleButton_internal = $("#sensorScansWidget_scanTypeBar_internalButton"),
		toggleButton_external = $("#sensorScansWidget_scanTypeBar_externalButton"),
		scanRequestBox = $("#sensorScansWidget_requestBox"),
		presetMissionSelect = $("#sensorScansWidget_presetBox_missionSelect"),
		presetMissionOptgroup = $("#sensorScansWidget_presetBox_missionSelect_optgroup"),
		presetPresetSelect = $("#sensorScansWidget_presetBox_presetSelect"),
		presetPresetOptgroup = $("#sensorScansWidget_presetBox_presetSelect_optgroup"),
		responseTextarea = $("#sensorScansWidget_responseTextarea"),
		autoResponseButton = $("#sensorScansWidget_responseButtons_autoResponse"),
		unknownButton = $("#sensorScansWidget_responseButtons_unknownButton"),
		noneButton = $("#sensorScansWidget_responseButtons_noneButton"),
		timeBoostTextbox = $("#sensorScansWidget_responseButtons_speedTextbox"),
		sendButton = $("#sensorScansWidget_responseButtons_sendButton"),
		sendNowButton = $("#sensorScansWidget_responseButtons_sendNowButton"),
		gearIcon = $("#sensorScansWidget_responseButtons_gear");

	//variables
	var selectedColor_scan = "rgb(255,0,0)",
		selectedColor_noScan = "rgb(255,255,255)",
		notSelectedColor_scan = "rgb(200,0,0)",
		notSelectedColor_noScan = "rgb(170,170,170)",
		internalScanObject = null,
		externalScanObject = null,
		selectedScanType = "external",
		internalTextboxValue = "",
		externalTextboxValue = "",
		lastInternalScan = "NO SCAN",
		lastExternalScan = "NO SCAN",
		internalScanAnswer = null,
		externalScanAnswer = null,
		timeBoost = 1;
	
	//init calls
	drawGui();

	//preset observers

	//database observers
	Interstellar.onDatabaseValueChange("sensors.scanTimeBoost",function(newData){
		if(newData == null){
			return;
		}
		timeBoost = newData;
		drawGui();
	});

	Interstellar.onDatabaseValueChange("sensors.externalScans.scanObject",function(newData){
	    externalScanObject = newData;

	    if(newData != null){
	    	if(newData.timeFinished > Date.now()){
	    		Interstellar.say("New external sensors scan");
	    	}
	    	lastExternalScan = newData.query;
	    }
	    drawGui();
	});

	Interstellar.onDatabaseValueChange("sensors.externalScans.scanAnswer",function(newData){
		externalScanAnswer = newData;
		drawGui();
	});
	//functions

	function drawGui(){
		updateButtonColors();
		updateRequestAndTextbox();
		updateProgressBars();
		updateTimeBoost();
	}

	function updateTimeBoost(){
		timeBoostTextbox.val(timeBoost);
	}

	function updateProgressBars(){
		var progress = 0;
		if(internalScanObject != null){

	        var totalTime = (internalScanObject.timeFinished - internalScanObject.timeStarted);
	        progress = ((Date.now() - internalScanObject.timeStarted) / totalTime);

			internalProgressBarFill.css("width",progress * internalProgressBarFill.parent().width());
			internalProgressBarFillLabel.html("INTERNAL SCAN (" + Math.round(100 * progress) + "% COMPLETE)");
		}else{
			internalProgressBarFill.css("width","0px");
			internalProgressBarFillLabel.html("INTERNAL SCAN (NO SCAN)");
		}

		if(externalScanObject != null){

	        var totalTime = (externalScanObject.timeFinished - externalScanObject.timeStarted);
	        progress = ((Date.now() - externalScanObject.timeStarted) / totalTime);

			externalProgressBarFill.css("width",progress * externalProgressBarFill.parent().width());
			externalProgressBarFillLabel.html("EXTERNAL SCAN (" + Math.round(100 * progress) + "% COMPLETE)");
		}else{
			externalProgressBarFill.css("width","0px");
			externalProgressBarFillLabel.html("EXTERNAL SCAN (NO SCAN)");
		}
	}

	function updateRequestAndTextbox(){
		if(selectedScanType == "internal"){
			responseTextarea.val(internalTextboxValue);
			scanRequestBox.html("(<b>INTERNAL</b>) " + lastInternalScan);
		}else{
			responseTextarea.val(externalTextboxValue);
			scanRequestBox.html("(<b>EXTERNAL</b>) " + lastExternalScan);
		}
	}

	function updateButtonColors(){
		if(internalScanObject != null){
			if(internalScanAnswer == null){
				//internal scan in progress
				toggleButton_internal.css("background-color","red");
			}else{	
				//external scan in progress
				toggleButton_external.css("background-color","yellow");
			}
		}else{
			//no internal scan
			toggleButton_internal.css("background-color","");
		}

		if(externalScanObject != null){
			if(externalScanAnswer == null){
				//external scan in progress
				toggleButton_external.css("background-color","red");
			}else{	
				//external scan in progress
				toggleButton_external.css("background-color","yellow");
			}
		}else{
			//no external scan
			toggleButton_external.css("background-color","");
		}


		if(selectedScanType == "internal"){
			toggleButton_internal.attr("disabled",true);
		}else{
			toggleButton_internal.attr("disabled",false);
		}
		
		if(selectedScanType == "external"){
			toggleButton_external.attr("disabled",true);
		}else{
			toggleButton_external.attr("disabled",false);
		}
	}

	//event handlers
	toggleButton_external.click(function(event){
		selectedScanType = "external";
		drawGui();
	});

	toggleButton_internal.click(function(event){
		selectedScanType = "internal";
		drawGui();
	});

	sendButton.click(function(event){
		if(selectedScanType == "internal"){
			internalTextboxValue = responseTextarea.val();
			Interstellar.setDatabaseValue("sensors.internalScans.scanAnswer",internalTextboxValue);
		}else{
			externalTextboxValue = responseTextarea.val();
			Interstellar.setDatabaseValue("sensors.externalScans.scanAnswer",externalTextboxValue);
		}
	});

	sendNowButton.click(function(event){
		if(selectedScanType == "internal"){

		}else{
			externalTextboxValue = responseTextarea.val();
			Interstellar.setDatabaseValue("sensors.externalScans.scanAnswer",externalTextboxValue);
			externalScanObject.timeFinished = Date.now() + 50;
			Interstellar.setDatabaseValue("sensors.externalScans.scanObject",externalScanObject);
		}
	});

	responseTextarea.on("input",function(event){
		if(selectedScanType == "internal"){
			internalTextboxValue = event.target.value;
		}else{
			externalTextboxValue = event.target.value;
		}
	});

	timeBoostTextbox.on("change",function(event){
		var newValue = Number(event.target.value.replace(/[^\d.-]/g, '')),
			oldValue = timeBoost;
		if(!isNaN(newValue) && newValue != undefined && newValue != 0){
			Interstellar.setDatabaseValue("sensors.scanTimeBoost",newValue);
		}
		if(externalScanObject != null){
			var scaleValue = newValue / timeBoost;
			var timeRemaining = Math.max(0,externalScanObject.timeFinished - Date.now());
			timeRemaining *= scaleValue;
			externalScanObject.timeFinished = externalScanObject.timeStarted + timeRemaining;
			Interstellar.setDatabaseValue("sensors.externalScans.scanObject",externalScanObject);
		}
		if(internalScanObject != null){
			//internal placeholder
		}
	});

	noneButton.click(function(event){
		if(selectedScanType == "internal"){
			internalTextboxValue = "NONE DETECTED";
		}else{
			externalTextboxValue = "NONE DETECTED";
		}
		drawGui();
	});
	unknownButton.click(function(event){
		if(selectedScanType == "internal"){
			internalTextboxValue = "REQUEST QUERY WAS UNKNOWN AND/OR AMBIGUOUS, PLEASE RESTATE OR CLARIFY";
		}else{
			externalTextboxValue = "REQUEST QUERY WAS UNKNOWN AND/OR AMBIGUOUS, PLEASE RESTATE OR CLARIFY";
		}
		drawGui();
	});
	//intervals
	setInterval(function(){
		if(externalScanObject != null || internalScanObject != null){
			updateProgressBars();
		}
	},1000 / 30) //30 fps
});