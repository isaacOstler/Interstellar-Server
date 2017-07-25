var courseCalculationHasInit = false;
Interstellar.addCoreWidget("Course Calculation",function(){
	var thisWidget = this;

	//ensure we have not already init
	if(courseCalculationHasInit){
		return;
	}
	//set the init flag to true, to ensure we don't init again
	courseCalculationHasInit = true;
	//variables
	var courseName = "",
		thrusters = undefined,
		requiredThrusters = undefined,
		courseNotSet = false;
	//DOM references
	var courseNameTextbox = $("#course-calculation-core_courseNameTextbox"),
		currentLabel = $("#course-calculation-core_thrusters_currentLabel"),
		calcLabel = $("#course-calculation-core_thrusters_calcLabel"),
		widgetElement = $("#course-calculation-core"),
		currentYawLabel = $("#course-calculation-core_thrusters_currentThrusters_yawLabel"),
		currentPitchLabel = $("#course-calculation-core_thrusters_currentThrusters_pitchLabel"),
		currentRollLabel = $("#course-calculation-core_thrusters_currentThrusters_rollLabel"),
		calcYawLabel = $("#course-calculation-core_thrusters_calcThrusters_yawLabel"),
		calcPitchLabel = $("#course-calculation-core_thrusters_calcThrusters_pitchLabel"),
		calcRollLabel = $("#course-calculation-core_thrusters_calcThrusters_rollLabel"),
		calcYawTextbox = $("#course-calculation-core_thrusters_calcThrusters_yaw"),
		calcPitchTextbox = $("#course-calculation-core_thrusters_calcThrusters_pitch"),
		calcRollTextbox = $("#course-calculation-core_thrusters_calcThrusters_roll"),
		currentYawTextbox = $("#course-calculation-core_thrusters_currentThrusters_yaw"),
		currentPitchTextbox = $("#course-calculation-core_thrusters_currentThrusters_pitch"),
		currentRollTextbox = $("#course-calculation-core_thrusters_currentThrusters_roll"),
		randomButton = $("#course-calculation-core_sendButtons_randomButton"),
		noneButton = $("#course-calculation-core_sendButtons_noneButton"),
		sendButton = $("#course-calculation-core_sendButtons_sendButton");

	//init functions
	drawGUI();

	//interstellar functions
	thisWidget.onResize = function(){
		drawGUI();
	}
	thisWidget.onReset = function(){

	}
	//preset observers

	//database observers

	Interstellar.onDatabaseValueChange("courseCalculation.courseName",function(newData){
		//if there is no database value yet
		if(newData == null){
			//set an empty string in it's place
			Interstellar.setDatabaseValue("courseCalculation.courseName","");
			//and end execution of this function
			return;
		}
		//if there is no course
		if(newData == ""){
			//set the course name textbox to say no course
			courseNameTextbox.val("NO COURSE");
		}else{
			//otherwise, drop the course name into the textbox
			courseNameTextbox.val(newData);
			//set the course name too
			courseName = newData;
		}
	});

	Interstellar.onDatabaseValueChange("courseCalculation.isScanning",function(newData){
		//if there is no database value yet
		if(newData == null){
			//set the default to false
			setDatabaseValue("courseCalculation.isScanning",false);
			//and end execution of this function
			return;
		}
		//if they are scanning
		if(newData){
			//set the background to red
			courseNameTextbox.css("background-color","red");
			Interstellar.say("Scanning for course to " + courseName);
		}else{
			//otherwise, set it to it's normal color
			courseNameTextbox.css("background-color","");
		}
	});

	Interstellar.onDatabaseValueChange("courseCalculation.thrusters",function(newData){
		//if there is no database value yet
		if(newData == null){
			//set the default value
			setDatabaseValue("courseCalculation.thrusters",{
				"yaw" : 0,
				"pitch" : 0,
				"roll" : 0
			});
			//and end execution of this function
			return;
		}
		thrusters = newData;
		drawGUI();
		if(requiredThrusters == undefined){
			return;
		}
		if((Math.round(radiansToDegrees(thrusters.yaw)) != Math.round(radiansToDegrees(requiredThrusters.yaw))) || (Math.round(radiansToDegrees(thrusters.pitch)) != Math.round(radiansToDegrees(requiredThrusters.pitch))) || (Math.round(radiansToDegrees(thrusters.roll)) != Math.round(radiansToDegrees(requiredThrusters.roll)))){
			courseNotSet = true;
		}else if(courseNotSet){
			courseNotSet = false;
			Interstellar.say("Course set to " + courseName);
		}
	});

	Interstellar.onDatabaseValueChange("courseCalculation.requiredThrusters",function(newData){
		//if there is no database value yet
		if(newData == null){
			//set the default value
			setDatabaseValue("courseCalculation.requiredThrusters",{
				"yaw" : 0,
				"pitch" : 0,
				"roll" : 0
			});
			//and end execution of this function
			return;
		}
		requiredThrusters = newData;
		drawGUI();
	});

	//functions
	function drawGUI(){
		//if we have thruster values
		if(thrusters != undefined){
			//display them
			currentYawTextbox.val(Math.round(radiansToDegrees(thrusters.yaw)) + "°");
			currentPitchTextbox.val(Math.round(radiansToDegrees(thrusters.pitch)) + "°");
			currentRollTextbox.val(Math.round(radiansToDegrees(thrusters.roll)) + "°");
		}
		//if we have required thruster values
		if(requiredThrusters != undefined){
			if(requiredThrusters.yaw == null){
				calcYawTextbox.val("NO");
				calcPitchTextbox.val("COURSE");
				calcRollTextbox.val("AVAILABLE");
			}else{
				//display them
				calcYawTextbox.val(Math.round(radiansToDegrees(requiredThrusters.yaw)) + "°");
				calcPitchTextbox.val(Math.round(radiansToDegrees(requiredThrusters.pitch)) + "°");
				calcRollTextbox.val(Math.round(radiansToDegrees(requiredThrusters.roll)) + "°");
			}
		}
		//resize the font size to be reactive to the height
		courseNameTextbox.css("font-size",(courseNameTextbox.height() - 4) + "px");
		var maxHeight = widgetElement.height() * .15;
		var normalHeight = widgetElement.width() * .075;
		//same with the current and calculated label
		if(!(normalHeight > maxHeight)){
			currentLabel.css("font-size",normalHeight);
			calcLabel.css("font-size",normalHeight);
		}else{
			currentLabel.css("font-size",maxHeight);
			calcLabel.css("font-size",maxHeight);
		}
		//and all the yaw pitch and roll labels
		if(!(normalHeight > maxHeight)){
			currentRollLabel.css("font-size",normalHeight);
			currentYawLabel.css("font-size",normalHeight);
			currentPitchLabel.css("font-size",normalHeight);
			calcRollLabel.css("font-size",normalHeight);
			calcYawLabel.css("font-size",normalHeight);
			calcPitchLabel.css("font-size",normalHeight);
		}else{
			currentRollLabel.css("font-size",maxHeight);
			currentYawLabel.css("font-size",maxHeight);
			currentPitchLabel.css("font-size",maxHeight);
			calcRollLabel.css("font-size",maxHeight);
			calcYawLabel.css("font-size",maxHeight);
			calcPitchLabel.css("font-size",maxHeight);
		}
		//the textboxes
		if(!(normalHeight > maxHeight)){
			calcYawTextbox.css("font-size",normalHeight);
			calcPitchTextbox.css("font-size",normalHeight);
			calcRollTextbox.css("font-size",normalHeight);
			currentYawTextbox.css("font-size",normalHeight);
			currentPitchTextbox.css("font-size",normalHeight);
			currentRollTextbox.css("font-size",normalHeight);
		}else{
			calcYawTextbox.css("font-size",maxHeight);
			calcPitchTextbox.css("font-size",maxHeight);
			calcRollTextbox.css("font-size",maxHeight);
			currentYawTextbox.css("font-size",maxHeight);
			currentPitchTextbox.css("font-size",maxHeight);
			currentRollTextbox.css("font-size",maxHeight);
		}
		//heck, lets get the buttons as well
		if(!(normalHeight > maxHeight)){
			randomButton.css("font-size",normalHeight);
			noneButton.css("font-size",normalHeight);
			sendButton.css("font-size",normalHeight);
		}else{
			randomButton.css("font-size",maxHeight);
			noneButton.css("font-size",maxHeight);
			sendButton.css("font-size",maxHeight);
		}
	}

	function degreesToRadians(degrees){
	    return Number(degrees * (Math.PI / 180));
	}

	function radiansToDegrees(radians){
	    return Number(radians * (180 / Math.PI));
	}

	function modifyToBounds(number,min,max,exemption){ //bounds number to the specified min and max, but not by capping, by looping.
		if(arguments.length > 3){
			if(number == exemption){
				return number;
			}
		}
		if(number >= min && number <= max){
			return number;
		}else if(number < min){
			var placesOff = Math.abs(min - number);
			return modifyToBounds(max - placesOff,min,max);
		}else{
			var placesOff = number - max;
			return modifyToBounds(min + placesOff,min,max);
		}
	}
	//event handlers
	randomButton.click(function(event){
		//set random yaw pitch and roll
		requiredThrusters.yaw = degreesToRadians(Math.random() * 360);
		requiredThrusters.roll = degreesToRadians(Math.random() * 360);
		requiredThrusters.pitch = degreesToRadians(Math.random() * 360);
		drawGUI();
	});
	randomButton.dblclick(function(event){
		//set random yaw pitch and roll, but make it close to what they already have
		requiredThrusters.yaw = degreesToRadians(thrusters.yaw + ((Math.random() * 45) - (Math.random() * 45)));
		requiredThrusters.roll = degreesToRadians(thrusters.roll + ((Math.random() * 45) - (Math.random() * 45)));
		requiredThrusters.pitch = degreesToRadians(thrusters.pitch + ((Math.random() * 45) - (Math.random() * 45)));
		drawGUI();
	});
	noneButton.click(function(event){
		//set null yaw pitch and roll
		requiredThrusters.yaw = null;
		requiredThrusters.pitch = null;
		requiredThrusters.roll = null;
		drawGUI();
	});
	sendButton.click(function(event){
		if(calcYawTextbox.val() == "NO"){
			requiredThrusters.yaw = null;
			requiredThrusters.pitch = null;
			requiredThrusters.roll = null;
		}else{
			requiredThrusters.yaw = degreesToRadians(calcYawTextbox.val().replace(/[^\d.-]/g, ''));
			requiredThrusters.pitch = degreesToRadians(calcPitchTextbox.val().replace(/[^\d.-]/g, ''));
			requiredThrusters.roll = degreesToRadians(calcRollTextbox.val().replace(/[^\d.-]/g, ''));
		}
		Interstellar.setDatabaseValue("courseCalculation.requiredThrusters",requiredThrusters);
		Interstellar.setDatabaseValue("courseCalculation.isScanning",false);
	});
	currentYawTextbox.change(function(event){
		thrusters.yaw = degreesToRadians(modifyToBounds(calcYawTextbox.val().replace(/[^\d.-]/g, ''),0,360));
		Interstellar.setDatabaseValue("courseCalculation.thrusters",thrusters);
	});
	currentPitchTextbox.change(function(event){
		thrusters.pitch = degreesToRadians(modifyToBounds(currentPitchTextbox.val().replace(/[^\d.-]/g, ''),0,360));
		Interstellar.setDatabaseValue("courseCalculation.thrusters",thrusters);
	});
	currentRollTextbox.change(function(event){
		thrusters.roll = degreesToRadians(modifyToBounds(currentRollTextbox.val().replace(/[^\d.-]/g, ''),0,360));
		Interstellar.setDatabaseValue("courseCalculation.thrusters",thrusters);
	});
	calcYawTextbox.change(function(event){
		var value = modifyToBounds($(event.target).val().replace(/[^\d.-]/g, ''),0,360);
		$(event.target).val(value + "°");
	});
	calcPitchTextbox.change(function(event){
		var value = modifyToBounds($(event.target).val().replace(/[^\d.-]/g, ''),0,360);
		$(event.target).val(value + "°");
	});
	calcRollTextbox.change(function(event){
		var value = modifyToBounds($(event.target).val().replace(/[^\d.-]/g, ''),0,360);
		$(event.target).val(value + "°");
	});
});
