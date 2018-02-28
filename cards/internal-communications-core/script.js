var internalCommunicationsCoreHasInit = false;
Interstellar.addCoreWidget("Internal Communications",function(){
	if(internalCommunicationsCoreHasInit){
		return; //make sure we don't initilize this code more than once
	}
	internalCommunicationsCoreHasInit = true;

	var thisWidget = this;

	//variables
	var rooms = [],
		internalCommRecievers = [],
		crewCallingCore_room = "NO CALL",
		crewCallingCore_muted = false,
		stationToCall = undefined,
		crewCallingCore_lineConnected = false,
		sortMethod = "numerical";

	//DOM References
	var incomingCallStatus = $("#internal_communciations_Core_Widget_incomingCallLabel"),
		connectButton = $("#internal_communciations_Core_Widget_incomingCallConnectButton"),
		stationToCallDropdown = $("#internal_communciations_Core_Widget_callDropdown"),
		roomCallingFromDropdown = $("#internal_communciations_Core_Widget_fromDropdown"),
		callButton = $("#internal_communciations_Core_Widget_callButton"),
		outgoingCallStatus = $("#internal_communciations_Core_Widget_statusBox");
	//init calls

	//interstellar calls
	thisWidget.onResize = function(){
		
	}
	//preset observers

	//database observers

	Interstellar.onDatabaseValueChange("internalCommunications.commLines",function(newData){
        if(newData == null){
            //as of version 2.0.0 of this widget, we are NOT technically a reciever, but we should be in future updates
            return;
        }
        internalCommRecievers = newData;
        drawRecieverDropdown();
        updateOutgoingHailProcess();
    });
	Interstellar.onDatabaseValueChange("internalComm.crewCall.currentCall",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("internalComm.crewCall.currentCall","NO CALL");
			return;
		}
		if(newData != "NO CALL"){
			Interstellar.say("Incoming Internal Call, " + newData);
		}
		crewCallingCore_room = newData;
		incomingCallStatus.html(crewCallingCore_room);
		drawIncomingHailStatus();
	});

	Interstellar.onDatabaseValueChange("internalComm.crewCall.LineConnected",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",false);
			return;
		}
		if(newData && crewCallingCore_room != "NO CALL"){
			connectButton.val("Disconnect");
		}else{
			connectButton.val("Connect");
		}
		crewCallingCore_lineConnected = newData;
		drawIncomingHailStatus();
	});
	Interstellar.onDatabaseValueChange("internalComm.crewCall.lineMuted",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",false);
			return;
		}
		if(crewCallingCore_room != "NO CALL" && newData == true){
			Interstellar.say("Internal Call Muted");
		}
		crewCallingCore_muted = newData;
		drawIncomingHailStatus();
	});

	Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
		if(newData == null){
			return; //DO NOT SET THIS VALUE HERE
		}
		rooms = newData;
		listRooms();
		updateOutgoingHailProcess();
	});

	//functions
	function updateOutgoingHailProcess(){
		outgoingCallStatus.css("background-color","");
		outgoingCallStatus.html("No Outgoing Hail");
		callButton.val("Call");
		for(var i = 0;i < internalCommRecievers.length;i++){
			if(internalCommRecievers[i].callState != 0){
				switch(internalCommRecievers[i].callState){
					case 1:
						outgoingCallStatus.css("background-color","red");
						outgoingCallStatus.html("Calling From " + internalCommRecievers[i].callingFrom + "...");
						callButton.val("Disconnect");
					break;
					case 2:
						Interstellar.say("Internal Line Connected");
						outgoingCallStatus.css("background-color","lime");
						outgoingCallStatus.html("Connected (" + internalCommRecievers[i].callingFrom + ")");
						callButton.val("Disconnect");
					break;
					case 3:
						Interstellar.say("Internal Line Muted");
						outgoingCallStatus.css("background-color","orange");
						outgoingCallStatus.html("MUTED (" + internalCommRecievers[i].callingFrom + ")");
						callButton.val("Disconnect");
					break;
				}
			}
		}
	}

	function drawRecieverDropdown(){
		var html = "";
		for(var i = 0;i < internalCommRecievers.length;i++){
			html += "<option>" + internalCommRecievers[i].displayName + "</option>";
		}
		stationToCallDropdown.html(html);
		if(stationToCall == undefined){
			stationToCall = internalCommRecievers[0].displayName;
		}
	}
	function listRooms(){
		var html = "";
		var roomsList = [];
		for(var i = 0;i < rooms.length;i++){
			if(sortMethod == "numerical"){
				roomsList.splice(roomsList.length,0,"<optgroup label='Deck " + (i + 1) +"'>");
			}
			for(var j = 0;j < rooms[i].length;j++){
				roomsList.splice(roomsList.length,0,"<option>" + rooms[i][j].name + ", Deck " + (i + 1) + "</option>");
			}
			if(sortMethod == "numerical"){
				roomsList.splice(roomsList.length,0,"</optgroup>");
			}
		}
		if(sortMethod == "alpha"){
			roomsList.sort(function(a, b){
				var nameA=a.toLowerCase(), nameB=b.toLowerCase();
				if (nameA < nameB) //sort string ascending
					return -1;
				if (nameA > nameB)
					return 1;
				return 0; //default return value (no sorting)
			});
			var lastChar = "",
				newRoomsList = [];
			for(var i = 0;i < roomsList.length;i++){
				if(roomsList[i][8] != lastChar){
					if(lastChar != ""){
						newRoomsList.splice(newRoomsList.length,0,"</optgroup>");
					}
					lastChar = roomsList[i][8];
					newRoomsList.splice(newRoomsList.length,0,"<optgroup label='" + lastChar.toUpperCase() + "'>");
					newRoomsList.splice(newRoomsList.length,0,roomsList[i]);
				}else{
					newRoomsList.splice(newRoomsList.length,0,roomsList[i]);
				}
			}
			roomsList = newRoomsList;
		}
		for(var i = 0;i < roomsList.length;i++){
			html += roomsList[i];
		}
		roomCallingFromDropdown.html(html);
	}

	function drawIncomingHailStatus(){
		incomingCallStatus.removeClass("internalComm_core_widget_incomingCallFlash");
		if(crewCallingCore_room == "NO CALL"){
			incomingCallStatus.css("background-color","");
		}else{
			if(crewCallingCore_lineConnected){
				if(crewCallingCore_muted){
					incomingCallStatus.css("background-color","orange");
				}else{
					incomingCallStatus.css("background-color","lime");
				}
			}else{
				incomingCallStatus.addClass("internalComm_core_widget_incomingCallFlash");
				incomingCallStatus.css("background-color","red");
			}
		}
	}

	//event handlers
	roomCallingFromDropdown.on("contextmenu",function(event){
		if(sortMethod == "alpha"){
			sortMethod = "numerical";
		}else{
			sortMethod = "alpha";
		}
		listRooms();
	});

	stationToCallDropdown.change(function(event){
		stationToCall = event.target.value;
	});

	callButton.click(function(event){
		for(var i = 0;i < internalCommRecievers.length;i++){
			if(internalCommRecievers[i].callState != 0){
				//we are ALERADY calling and need to stop
				internalCommRecievers[i].callState = 0;
			}else if(internalCommRecievers[i].displayName == stationToCall){
				internalCommRecievers[i].callState = 1;
				internalCommRecievers[i].callingFrom = roomCallingFromDropdown.val();
			}
		}
		Interstellar.setDatabaseValue("internalCommunications.commLines",internalCommRecievers);
	});

	connectButton.click(function(event){
		crewCallingCore_lineConnected = !crewCallingCore_lineConnected;
		Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",crewCallingCore_lineConnected);
		if(!crewCallingCore_lineConnected){
			Interstellar.setDatabaseValue("internalComm.crewCall.currentCall","NO CALL");
			Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",false);
			Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",false);
		}
	});
});