var scanningObject;
var scanningInterval = undefined;
var scanAnswer = "";
var updateSpeed = 100; // this is how long the interval to update the time passed will wait;

onDatabaseValueChange("externalSensors.scanAnswer",function(newData){
	if(newData == null){
		setDatabaseValue("externalSensors.scanAnswer","");
		return;
	}
	scanAnswer = newData;
	if(scanningObject == undefined){
		return;
	}
	if(scanningObject.timePassed >= scanningObject.timeRequired && scanAnswer != ""){
        setDatabaseValue("sensors.externalScans.scanObject",undefined);
	}
})

onDatabaseValueChange("sensors.externalScans.scanObject",function(newData){
	scanningObject = newData;
	if(scanningInterval != undefined){
		clearInterval(scanningInterval);
		scanningInterval = undefined;
	}
	if(newData == null){
		return;
	}
	scanningInterval = setInterval(function(){
		if(scanningObject.time.timePassed < scanningObject.time.timeRequired){
			scanningObject.time.timePassed += updateSpeed / 1000;
			setDatabaseValue("sensors.externalScans.scanObject",scanningObject)
		}else{;
			if(scanningObject.time.timePassed >= scanningObject.time.timeRequired && scanAnswer != ""){
				setDatabaseValue("internalSensors.scanInfo",null);
			}
		}
	},updateSpeed);
});