Interstellar.addCoreWidget("Brig Control",function(){
	var brigState,
		hasAnnouncedConnection = false;

	//DOM references
	var toggleButton = $("#brig-bridge-core_toggleButton"),
		statusView = $("#brig-bridge-core_bridgeState");

	Interstellar.onDatabaseValueChange("brig.state",function(newData){
		if(newData == null){
			return;
		}
		if(!hasAnnouncedConnection){
			Interstellar.say("Brig Connected!");
			hasAnnouncedConnection = true;
		}
		brigState = newData;
		if(brigState){
			statusView.css("background-color","lime");
			statusView.html("BRIG FORCEFIELD RAISED");
			Interstellar.say("BRIG FORCEFIELD RAISED");
		}else{
			statusView.html("BRIG FORCEFIELD LOWERED");
			statusView.css("background-color","red");
			Interstellar.say("BRIG FORCEFIELD LOWERED");
		}
	});
	toggleButton.click(function(event){
		if(brigState == undefined || brigState == null){
			return;
		}
		Interstellar.setDatabaseValue("brig.state",!brigState);
	});
});