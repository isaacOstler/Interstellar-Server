var dockingWidgetHasInit = false;
Interstellar.addCoreWidget("Docking",function(){
	if(dockingWidgetHasInit){
		return;
	}
	dockingWidgetHasInit = true;

	//DOM references

	//variables
	var dockedState = 0, //the initial docking state... 0 is undocked, 1 is docked
		airlockStatus = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
		airlockDirections = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
		clampStatus = [dockedState,dockedState,dockedState],
		clampDirections = [dockedState,dockedState,dockedState],
		fuelStatus = [dockedState,dockedState,dockedState,dockedState,dockedState],
		rampsStatus = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState],
		rampDirections = [dockedState,dockedState,dockedState,dockedState,dockedState,dockedState];


	//init calls

	//preset observers

	//database observers

	Interstellar.onDatabaseValueChange("docking.rampDirections",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("docking.rampDirections",rampDirections)
			return;
		}
		rampDirections = newData;
	});

	Interstellar.onDatabaseValueChange("docking.rampsStatus",function(newData){
		Interstellar.say("Ramps Changed");
		if(newData == null){
			Interstellar.setDatabaseValue("docking.rampsStatus",rampsStatus);
			return;
		}
		rampsStatus = newData;
		for(var i = 0;i < rampsStatus.length;i++){
			if(rampsStatus[i] == 0){
				$("[docking_rampID=" + i + "]").html("RETRACTED");
				$("[docking_rampID=" + i + "]").css("background-color","lime");
			}else if(rampsStatus[i] == 1){
				$("[docking_rampID=" + i + "]").html("EXTENDED");
				$("[docking_rampID=" + i + "]").css("background-color","red");
			}else{
				if(rampDirections[i] == 0){
					$("[docking_rampID=" + i + "]").html(Math.round(100 * (1 - airlockStatus[i])) + "% - RETRACTING");
					$("[docking_rampID=" + i + "]").css("background-color","yellow");
				}else{
					$("[docking_rampID=" + i + "]").html(Math.round(100 * airlockStatus[i]) + "% - EXTENDING");
					$("[docking_rampID=" + i + "]").css("background-color","yellow");
				}
			}
		}
	});

	Interstellar.onDatabaseValueChange("docking.airlockStatus",function(newData){
		Interstellar.say("Airlocks Changed");
		if(newData == null){
			Interstellar.setDatabaseValue("docking.airlockStatus",airlockStatus);
			return;
		}
		airlockStatus = newData;
		for(var i = 0;i < airlockStatus.length;i++){
			if(airlockStatus[i] == 0){
				$("[docking_doorID=" + i + "]").html("CLOSED");
				$("[docking_doorID=" + i + "]").css("background-color","lime");
			}else if(airlockStatus[i] == 1){
				$("[docking_doorID=" + i + "]").html("OPEN");
				$("[docking_doorID=" + i + "]").css("background-color","red");
			}else{
				if(airlockDirections[i] == 0){
					$("[docking_doorID=" + i + "]").html(Math.round(100 * (1 - airlockStatus[i])) + "% - CLOSING");
					$("[docking_doorID=" + i + "]").css("background-color","yellow");
				}else{
					$("[docking_doorID=" + i + "]").html(Math.round(100 * airlockStatus[i]) + "% - OPENING");
					$("[docking_doorID=" + i + "]").css("background-color","yellow");
				}
			}
		}
	});

	Interstellar.onDatabaseValueChange("docking.fuelLines",function(newData){
		Interstellar.say("Fuel Lines Changed");
		if(newData == null){
			Interstellar.setDatabaseValue("docking.fuelLines",fuelStatus);
			return;
		}
		fuelStatus = newData;
		for(var i = 0;i < fuelStatus.length;i++){
			if(fuelStatus[i] == 0){
				$("[docking_fuelID=" + i + "]").html("DISCONNECTED");
				$("[docking_fuelID=" + i + "]").css("background-color","lime");
			}else{
				$("[docking_fuelID=" + i + "]").html("CONNECTED");
				$("[docking_fuelID=" + i + "]").css("background-color","red");
			}
		}
	});

	//functions

	//event handlers

	//intervals
	setInterval(function(event){
		var differenceDetected = false;
		for(var i = 0;i < clampDirections.length;i++){
			if(clampStatus[i] < clampDirections[i]){
				clampStatus[i] += .001;
				differenceDetected = true;
			}else if(clampStatus[i] > clampDirections[i]){
				clampStatus[i] -= .001;
				differenceDetected = true;
			}
			if(Math.abs(clampStatus[i] - clampDirections[i]) < .001){
				clampStatus[i] = clampDirections[i]; //if the difference between the two is minimal, just clamp it
			}
		}
		if(differenceDetected){
			Interstellar.setDatabaseValue("docking.clampsStatus",clampStatus);
		}
	},0030);

	setInterval(function(event){
		var differenceDetected = false;
		for(var i = 0;i < airlockDirections.length;i++){
			if(airlockStatus[i] < airlockDirections[i]){
				airlockStatus[i] += .005;
				differenceDetected = true;
			}else if(airlockStatus[i] > airlockDirections[i]){
				airlockStatus[i] -= .005;
				differenceDetected = true;
			}
			if(Math.abs(airlockStatus[i] - airlockDirections[i]) < .005){
				airlockStatus[i] = airlockDirections[i]; //if the difference between the two is minimal, just clamp it
			}
		}
		if(differenceDetected){
			Interstellar.setDatabaseValue("docking.airlockStatus",airlockStatus);
		}
	},0030);

	setInterval(function(event){
		var differenceDetected = false;
		for(var i = 0;i < rampDirections.length;i++){
			if(rampsStatus[i] < rampDirections[i]){
				rampsStatus[i] += .01;
				differenceDetected = true;
			}else if(rampsStatus[i] > rampDirections[i]){
				rampsStatus[i] -= .01;
				differenceDetected = true;
			}
			if(Math.abs(rampsStatus[i] - rampDirections[i]) < .01){
				rampsStatus[i] = rampDirections[i]; //if the difference between the two is minimal, just clamp it
			}
		}
		if(differenceDetected){
			Interstellar.setDatabaseValue("docking.rampsStatus",rampsStatus);
		}
	},0080);
});