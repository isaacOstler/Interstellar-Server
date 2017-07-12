
var interval;
var diagnosticObject = {};
var runningDiagnostic = false;

onDatabaseValueChange("systems.runningDiagnostic",function(newData){
	console.log("Running callback for systems.runningDiagnostic (" + newData + ")");
	if(newData == null){
		return;
	}
	console.log(newData.toString().bold);
	runningDiagnostic = newData;
	if(runningDiagnostic){
		if(interval != undefined){
			return;
		}
		startDiagnosticInterval();
	}
});

onDatabaseValueChange("systems.currentDiagnostic",function(newData){
	console.log("Running callback for systems.currentDiagnostic (" + newData + ")");
	if(newData == null){
		return;
	}
	diagnosticObject = newData;
	if(runningDiagnostic){
		if(interval != undefined){
			return;
		}
		startDiagnosticInterval();
	}
});

function startDiagnosticInterval(){
	console.log("diagnosticObject: ".bold + JSON.stringify(diagnosticObject));
	console.log("runningDiagnostic: ".error + runningDiagnostic);
	if(runningDiagnostic){
		interval = setInterval(function(){
			if(diagnosticObject.timePassed <= diagnosticObject.timeRequired){
				diagnosticObject.timePassed += .5;
				setDatabaseValue("systems.currentDiagnostic",diagnosticObject);
			}else{
				setDatabaseValue("systems.runningDiagnostic",false);
				clearInterval(interval);
			}
		},0500);
	}else{
		if(interval != undefined){
			clearInterval(interval);
		}
	}
}
