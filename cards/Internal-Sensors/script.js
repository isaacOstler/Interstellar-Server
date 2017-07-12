var scanInfo;
var roomScanTime = {"light" : 10,"normal" : 20,"heavy" : 30};
var timeRequired = 10;
var shipRooms = [];

onDatabaseValueChange("ship.roomScanTime",function(newData){
	if(newData == null){
		return;
	}
	roomScanTime = newData;
})

onDatabaseValueChange("ship.rooms",function(newData){
	if(newData == null){
		return; //it's not our job to update this, wait for it to update.  (Typically this is core)
		//you don't want this on more than one station though, or you can get conflicting room inits.
	}
	shipRooms = newData;
	var html = "<option>ALL DECKS</option>";
	for(var i = 0;i < newData.length;i++){
		html += "<option>DECK " + (i + 1) + "</option>";
	}
	$("#deckDropdown").html(html);
	html = "<option>ALL ROOMS</option>";
	for(var i = 0;i < newData[0].length;i++){
		html += "<option>" + newData[0][i] + "</option>";
	}
	$("#roomDropdown").html(html);
});
$("#roomDropdown").on("change",function(event){
	if(event.target.value == "ALL ROOMS"){
		var index = $("#deckDropdown :selected").index() - 1;
		calculateEstimatedScanTime(shipRooms[index].length);
	}else{
		calculateEstimatedScanTime(1);
	}
});
$("#deckDropdown").on("change",function(event){
	var index = $("#deckDropdown :selected").index();
	if(index == 0){
		var numberOfRooms = 0;
		$("#roomDropdown").html("<option>ALL ROOMS</option>");
		for(var i = 0;i < shipRooms.length;i++){
			numberOfRooms += shipRooms[i].length;
		}
		calculateEstimatedScanTime(numberOfRooms);
		return;
	}
	html = "<option>ALL ROOMS</option>";
	for(var i = 0;i < shipRooms[index - 1].length;i++){
		html += "<option>" + shipRooms[index - 1][i] + "</option>";
	}
	calculateEstimatedScanTime(shipRooms[index - 1].length);
	$("#roomDropdown").html(html);
})

$("#scanType").on("change",function(event){
	var index = $("#deckDropdown :selected").index();
	if(index == 0){
		var numberOfRooms = 0;
		for(var i = 0;i < shipRooms.length;i++){
			numberOfRooms += shipRooms[i].length;
		}
		calculateEstimatedScanTime(numberOfRooms);
		return;
	}
	calculateEstimatedScanTime(shipRooms[index - 1].length);
})

function calculateEstimatedScanTime(numberOfRooms){
	var roomScanTimeRequired = 10;
	switch($("#scanType :selected").index()){
		case 0:
		roomScanTimeRequired = roomScanTime.light;
		break;
		case 1:
		roomScanTimeRequired = roomScanTime.normal;
		break;
		case 2:
		roomScanTimeRequired = roomScanTime.heavy;
		break;
	}
	timeRequired = roomScanTimeRequired * numberOfRooms;
	$("#amountOfSeconds").html(timeRequired + " SECONDS");
}

onDatabaseValueChange("internalSensors.scanAnswer",function(newData){
	if(newData == null){
		setDatabaseValue("internalSensors.scanAnswer","");
		return;
	}
	$("#scanAnswerText").html(newData);
})

$('#shipPicture').on('dragstart', function(event) { event.preventDefault(); });

/*

	scan info object =
	{
		"timePassed" : 0,
		"timeRequired" : 100,
		"scanQuerry" : "intruders",
		"scanLocation" : "all decks",
		"scanType" : "light scan"
	}

	*/
	$("#cancelScanButton").on("click",function(event){
		setDatabaseValue("internalSensors.scanInfo","canceled");
		$("#queryTextbox").val("");
	});

	$("#beginScanButton").on("click",function(event){
		var scanInfo =
		{
			"timePassed" : 0,
			"timeRequired" : timeRequired,
			"scanQuerry" : $("#queryTextbox").val(),
			"scanLocation" : $("#deckDropdown").val() + ", " + $("#roomDropdown").val(),
			"scanType" : $("#scanType").val()
		}
		console.log(scanInfo);
		setDatabaseValue("internalSensors.scanAnswer","");
		setDatabaseValue("internalSensors.scanInfo",scanInfo);
	});

	onDatabaseValueChange("internalSensors.scanInfo",function(newData){
		if(newData == null || newData == "canceled"){
			$("#scanAnswerView").slideDown();
			$("#beginScanButton").removeClass("disabledButton");
			$("#beginScanButton").addClass("button");
			$("#cancelScanButton").removeClass("button");
			$("#cancelScanButton").addClass("disabledButton");
			$("#shipScanner").fadeOut();
			$("#progressBar").fadeOut();
			return;
		}
		$("#scanAnswerView").slideUp();
		$("#beginScanButton").removeClass("button");
		$("#beginScanButton").addClass("disabledButton");
		$("#cancelScanButton").removeClass("disabledButton");
		$("#cancelScanButton").addClass("button");
		scanInfo = newData;
		$("#shipScanner").fadeIn();
		$("#progressBar").fadeIn();
		var timePassed = newData.timePassed;
		var timeRequired = newData.timeRequired;
		$("#shipScanner").css("left",(((timePassed / timeRequired) - .01) * 100) + "%");
		$("#progressBarFill").css("width",(100 * (timePassed / timeRequired)) + "%");
		$("#progressBarText").html(Math.floor(timePassed) + " SECONDS PASSED, " + Math.floor(timeRequired - timePassed) + " SECONDS REMAINING (" + Math.floor((100 * (timePassed / timeRequired))) + "% COMPLETE)");
	});