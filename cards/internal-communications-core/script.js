var internalCommunicationsCoreHasInit = false;
Interstellar.addCoreWidget("Internal Communications",function(){

	if(internalCommunicationsCoreHasInit){
		return; //make sure we don't initilize this code more than once
	}
	internalCommunicationsCoreHasInit = true;

	var thisWidget = this;

	//variables

	var isCalling = false,
		isConnected = false,
		callRoom = "",
		isMuted = false;

	//DOM References
	var incomingCallTextbox = $("#internalCommunicationsCore_incomingCallTextfield"),
		incomingCallConnectButton = $("#internalCommunicationsCore_incomingCall_connectButton"),
		sortButton = $("#internalCommunicationsCore_sortButton"),
		deckDropdown = $("#internalCommunicationsCore_deckDropdown"),
		roomDropdown = $("#internalCommunicationsCore_roomDropdown"),
		callInfoLabel = $("#internalCommunicationsCore_callInfoLabel"),
		callButton = $("#internalCommunicationsCore_callButton");
	//init calls

	//interstellar calls
	thisWidget.onResize = function(){
		//this is like, the first widget that doesn't have a redraw! :D
	}

	//functions

	//preset observers

	//database observers
	Interstellar.onDatabaseValueChange("internalComm.crewCall.lineMuted",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",false);
			return;
		}
		lineMuted = newData;
		if(isConnected){
			if(lineMuted){
				callInfoLabel.html("MUTED");
				callInfoLabel.css("color","orange");
				incomingCallTextbox.css("background-color","orange");
				Interstellar.say("Internal call muted");
			}else{
				Interstellar.say("Internal call unmuted");
				callInfoLabel.html("CONNECTED");
				callInfoLabel.css("color","lime");
				incomingCallTextbox.css("background-color","green");
			}
		}
	});

	Interstellar.onDatabaseValueChange("internalComm.crewCall.LineConnected",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",false);
			return;
		}
		isConnected = newData;
		if(isConnected){
			callInfoLabel.html("NO CALL");
			callInfoLabel.css("color","lime");
			incomingCallTextbox.css("background-color","");
		}else{
			callInfoLabel.html("CONNECTED");
			callInfoLabel.css("color","lime");
			incomingCallTextbox.css("background-color","green");
		}
	});

	Interstellar.onDatabaseValueChange("internalComm.crewCall.currentCall",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("internalComm.crewCall.currentCall","NO CALL");
			return;
		}
		callRoom = newData;
		if(callRoom == "NO CALL"){
			incomingCallConnectButton.prop("disabled","disabled");
			isConnected = false;
			callInfoLabel.html("NO CALL");
			incomingCallTextbox.val("NO INCOMING HAIL");
			incomingCallTextbox.css("background-color","");
		}else{
			incomingCallConnectButton.prop("disabled","");
			incomingCallTextbox.val(callRoom.toString().toUpperCase());
			incomingCallTextbox.css("background-color","red");
			Interstellar.say("Internal call. " + callRoom);
			callInfoLabel.html("INCOMING CALL");
			callInfoLabel.css("color","gold");
		}
	});
	//event handlers
	incomingCallConnectButton.click(function(event){
		Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",true);
	});
});