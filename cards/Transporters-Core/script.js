var transporterTargets = [];
var isScanning = false;

Interstellar.onDatabaseValueChange("transporters.isTransporting",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.isTransporting",false);
		return;
	}
	if(newData){
		$("#Transporters-Core-TransportTarget").css("background-color","red");
		$("#Transporters-Core-TransportDestination").css("background-color","red");
		document.getElementById("Transporters-Core-AcceptButton").className = "disabled";
		document.getElementById("Transporters-Core-DenyButton").className = "disabled";
		Interstellar.say("TRANSPORTING");
	}else{
		$("#Transporters-Core-TransportTarget").css("background-color","#00FFFF");
		$("#Transporters-Core-TransportDestination").css("background-color","#00FFFF");
	}
})

Interstellar.onDatabaseValueChange("transporters.target",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.target","");
		return;
	}
	if(newData != ""){
		$("#Transporters-Core-TransportTarget").html(newData);
	}else{
		$("#Transporters-Core-TransportTarget").html("NO TARGET");
	}
})

Interstellar.onDatabaseValueChange("transporters.destination",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.destination","");
		return;
	}
	if(newData != ""){
		$("#Transporters-Core-TransportDestination").html(newData);
	}else{
		$("#Transporters-Core-TransportDestination").html("NO DESTINATION");
	}
})

$("#Transporters-Core-RemoveAllTargets").on("click",function(event){
	Interstellar.setDatabaseValue("transporters.transportTargets",[]);
})

Interstellar.onDatabaseValueChange("transporters.transportProgress",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.transportProgress",0);
		return;
	}
	$("#Transporters-Core-TransporterProgressLabel").html("TRANSPORT PROGRESS (" + Math.floor((newData * 100)) + "%)");
	$("#Transporters-Core-TransporterProgressFill").css("width",Math.floor((newData * 100)) + "%");
})

$("#Transporters-Core-AcceptButton").on("click",function(event){
	if(isScanning == true){
		if(parseInt($("#Transporters-Core-numberOfTargets").val()) <= 0){
			$("#Transporters-Core-numberOfTargets").val(1);
		}
		var newTransportObjects = [];
		for(var i = 0;i < parseInt($("#Transporters-Core-numberOfTargets").val());i++){
				var newTransportObject = {
				"name" : "",
				"xPos" : Math.random(),
				"yPos" : Math.random()
			}
			newTransportObjects.splice(newTransportObjects.length,0,newTransportObject);
		}
		Interstellar.setDatabaseValue("transporters.transportTargets",newTransportObjects);
		Interstellar.setDatabaseValue("transporters.isScanning",false);
	}
});
$("#Transporters-Core-DenyButton").on("click",function(event){
	if(isScanning == true){
		Interstellar.setDatabaseValue("transporters.transportTargets",[]);
		Interstellar.setDatabaseValue("transporters.isScanning",false);
		Interstellar.setDatabaseValue("transporters.noTargetsFound",true);
	}
});

Interstellar.onDatabaseValueChange("transporters.isScanning",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.isScanning",false);
		return;
	}
	isScanning = newData;
	if(newData){
		$("#Transporters-Core-TransportTarget").css("background-color","red");
		$("#Transporters-Core-TransportDestination").css("background-color","red");
		document.getElementById("Transporters-Core-AcceptButton").className = "enabledButton";
		document.getElementById("Transporters-Core-DenyButton").className = "enabledButton";
		Interstellar.say("TRANSPORT SCAN");
	}else{
		$("#Transporters-Core-TransportTarget").css("background-color","#00FFFF");
		$("#Transporters-Core-TransportDestination").css("background-color","#00FFFF");
		document.getElementById("Transporters-Core-AcceptButton").className = "disabled";
		document.getElementById("Transporters-Core-DenyButton").className = "disabled";
	}
});

$("#Transporters-Core-numberOfTargets").on("change",function(event){
	if(isScanning){
		//if they are scanning, wait for them to hit the accept button
		return;
	}
	var newTransportObjects = [];
	for(var i = 0;i < event.target.value;i++){
		var newTransportObject = {
			"name" : "",
			"xPos" : Math.random(),
			"yPos" : Math.random()
		}
		newTransportObjects.splice(newTransportObjects.length,0,newTransportObject);
	}
	Interstellar.setDatabaseValue("transporters.transportTargets",newTransportObjects);
});

Interstellar.onDatabaseValueChange("transporters.transportTargets",function(newData){
	if(newData == null){
		var newTransportObjects = [/*{
			"name" : "Isaac",
			"xPos" : .4,
			"yPos" : .8
		},{
			"name" : "Isaac",
			"xPos" : .25,
			"yPos" : .16
		},{
			"name" : "Isaac",
			"xPos" : .12,
			"yPos" : .53
		},{
			"name" : "Isaac",
			"xPos" : .12,
			"yPos" : .35
		}*/];
		Interstellar.setDatabaseValue("transporters.transportTargets",newTransportObjects);
		return;
	}
	transporterTargets = newData;
	$("#Transporters-Core-numberOfTargets").val(newData.length);
	if(newData.length > 0){
		document.getElementById("Transporters-Core-RemoveAllTargets").className = "enabledButton";
	}else{
		document.getElementById("Transporters-Core-RemoveAllTargets").className = "disabled";
	}
});