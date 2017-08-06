//variables
var shipRooms = [],
	currentDeck = 0,
	currentRoom = 0,
	sortByDeck = false,
	currentCall = "ROOM",
	callingAnimationIntervals = {
		"dots" : undefined,
		"canvasDraw" : undefined
	},
	canvasInterval = 0,
	canvasIteration = 1,
	doPlaySoundEffects = false,
	isCalling = false,
	lineConnected = false,
	lineMuted = false;
//DOM References
var callBar = $("#callBar"),
	shipImage = $("#ship"),
	deckList = $("#deckSelectTable"),
	roomList = $("#roomSelectTable"),
	deckListContainer = $("#deckSelectContainer"),
	roomListContainer = $("#roomSelectContainer"),
	changeSortButton = $("#sortAlphabeticallyButton"),
	deckLabel = $("#deckSelectHeader"),
	selectedRoomTextbox = $("#selectedRoomTextbox"),
	callButton = $("#callButton"),
	callBox = $("#callBox"),
	callboxHeader = $("#callBox_header"),
	phoneIcon = $("#callBox_phoneIcon"),
	phoneConnectedIcon = $("#callBox_phoneConnectedIcon"),
	phoneMutedIcon = $("#callBox_phoneMutedIcon"),
	hangUpButton = $("#callbox_hangUpButton"),
	muteButton = $("#callbox_muteButton"),
	callboxRoomHeader = $("#callBox_roomHeader"),
	callBoxMask = $("#callBoxMask");

//init calls

//preset observers

//database observers
Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
	if(newData == null){
		return; //DO NOT SET THIS VALUE HERE!  JAMES!  STOP TOUCHING MY CODE!  This is closed source....  Don't make me encrypt it.
	}
	shipRooms = newData;
	drawAllRooms();
});

Interstellar.onDatabaseValueChange("internalComm.crewCall.lineMuted",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",false);
		return;
	}
	lineMuted = newData;
	if(lineMuted){
		callboxHeader.css("color","rgb(255,128,0)");
		callboxHeader.html("LINE MUTED");
		muteButton.html("UNMUTE");
		phoneMutedIcon.fadeIn();
		phoneIcon.fadeOut();
		phoneConnectedIcon.fadeOut();
	}else{
		if(lineConnected){
			callboxHeader.css("color","lime");
			callboxHeader.html("LINE CONNECTED");
			muteButton.html("MUTED");
			phoneMutedIcon.fadeOut();
			phoneIcon.fadeOut();
			phoneConnectedIcon.fadeIn();
		}else{
			phoneMutedIcon.fadeOut();
			phoneIcon.fadeIn();
			phoneConnectedIcon.fadeOut();
		}
	}
})

Interstellar.onDatabaseValueChange("internalComm.crewCall.LineConnected",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",false);
		return;
	}
	lineConnected = newData;
	if(lineConnected){
		connectLine();
		phoneMutedIcon.fadeOut();
		phoneIcon.fadeOut();
		phoneConnectedIcon.fadeIn();
	}
});

Interstellar.onDatabaseValueChange("internalComm.crewCall.currentCall",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("internalComm.crewCall.currentCall","NO CALL");
		return;
	}
	if(newData == "NO CALL"){
		stopCalling();
	}else{
		callboxRoomHeader.html(newData);
		startCalling();
	}
});

//functions
function drawAllRooms(){
	deckLabel.fadeOut();
	deckListContainer.stop();
	deckListContainer.slideUp(function(){
		roomListContainer.stop();
		roomListContainer.animate({"width" : $("#contentArea").width()});
	});

	let allRoomsList = [];
	for(var i = 0;i < shipRooms.length;i++){
		for(var j = 0;j < shipRooms[i].length;j++){
			var roomName = shipRooms[i][j].name;
			var roomDeck = i;
			var room = {
				"name" : roomName,
				"deck" : roomDeck,
				"normalIndex" : j
			}
			allRoomsList.splice(allRoomsList.length,0,room);
		}
	}
	allRoomsList = sortArrayAlphabetically(allRoomsList);

	var html = "";
	html += "<div index='-2' class='tableItem' style='top:0px'>";
	html += "ALL ROOMS"
	html += "</div>"
	for(var i = 0;i < allRoomsList.length;i++){
		html += "<div deck='" + allRoomsList[i].deck + "' index='" + i + "' class='tableItem' style='top:" + (((i + 1) * 26) + 7) + "px'>";
		html += allRoomsList[i].name.toUpperCase() + ", DECK " + formatTwoDigitNumberToString(allRoomsList[i].deck + 1);
		html += "</div>"
	}
	roomList.html(html);
	$(".tableItem").off();
	$(".tableItem").click(function(event){
		currentRoom = allRoomsList[Number($(event.target).attr("index"))].normalIndex;
		currentDeck = allRoomsList[Number($(event.target).attr("index"))].deck;
		setCallMask(currentDeck);
		selectedRoomTextbox.val($(event.target).html());
		callButton.removeClass("Button2Disabled");
		callButton.addClass("Button2");
	});
}

function stopCalling(){
	if(!isCalling){
		return;
	}
	isCalling = false;
	if(doPlaySoundEffects){
		Interstellar.playSoundEffect("CallDisconnect.wav");
	}
	callBox.fadeOut();
	callBoxMask.fadeOut();
	if(callingAnimationIntervals.dots != undefined){
		clearInterval(callingAnimationIntervals.dots);
		callingAnimationIntervals.dots = undefined;
	}
	if(callingAnimationIntervals.canvasDraw != undefined){
		clearInterval(callingAnimationIntervals.canvasDraw);
		callingAnimationIntervals.canvasDraw = undefined;
	}
}

function drawDeckList(){
	deckLabel.fadeIn();
	roomListContainer.stop();
	roomListContainer.animate({"width" : (($("#contentArea").width() * .7) - 5)},500,function(){
		deckListContainer.stop();
		deckListContainer.slideDown();
	});
	var html = "";
	html += "<div index='-2' class='tableItem' style='top:0px'>";
	html += "ALL DECKS"
	html += "</div>"
	for(var i = 0;i < shipRooms.length;i++){
		html += "<div index='" + i + "' class='tableItem' style='top:" + (((i + 1) * 26) + 7) + "px'>";
		html += "DECK " + formatTwoDigitNumberToString(i + 1);
		html += "</div>"
	}
	deckList.html(html);
	$(".tableItem").off();
	$(".tableItem").click(function(event){
		var index = Number($(event.target).attr("index"));
		currentDeck = index;
		setCallMask(currentDeck);
		drawRoomListForDeck(currentDeck);
	});
}

function drawRoomListForDeck(deck){
	var html = "";
	html += "<div index='-2' class='tableItem roomItem' style='top:0px'>";
	html += "ALL ROOMS"
	html += "</div>"
	for(var i = 0;i < shipRooms[currentDeck].length;i++){
		html += "<div index='" + i + "' class='tableItem roomItem' style='top:" + (((i + 1) * 26) + 7) + "px'>";
		html += shipRooms[currentDeck][i].name.toUpperCase();
		html += "</div>"
	}
	roomList.html(html);
	$(".roomItem").off();
	$(".roomItem").click(function(event){
		currentRoom = Number($(event.target).attr("index"));
		if(currentRoom > -1){
			selectedRoomTextbox.val($(event.target).html() + ", DECK " + formatTwoDigitNumberToString(currentDeck + 1));
		}else if(currentRoom == -2){
			selectedRoomTextbox.val("ALL ROOMS, DECK " + formatTwoDigitNumberToString(currentDeck));
		}
		callButton.removeClass("Button2Disabled");
		callButton.addClass("Button2");
	});
}

function setCallMask(deck){
	
	var height = ((shipImage.height() * .92) / shipRooms.length) / 2;
	var top = height * deck;

	var topPercentage = (top / callBar.height()) * 100;
	var heightPercentage = (height / callBar.height()) * 100;
	callBar.css("-webkit-clip-path","polygon(0 " + top + "%, 0 " + (top + height) + "%, 100% " + (top + height) + "%,100% " + top + "%)")
}

function sortArrayAlphabetically(array){
	return array.sort(function(a, b){
 	var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
 	if (nameA < nameB) //sort string ascending
  		return -1;
 	if (nameA > nameB)
    	return 1;
 	return 0; //default return value (no sorting)
	});
}
function formatTwoDigitNumberToString(number){
	if(number > 9){
		return number;
	}else{
		return "0" + number;
	}
}
function startCalling(){
	if(isCalling){
		return;
	}
	phoneMutedIcon.fadeOut();
	phoneIcon.fadeIn();
	phoneConnectedIcon.fadeOut();
	canvasIteration = 0;
	canvasInterval = 0;
	muteButton.css("display","none");
	callboxHeader.css("color","white");
	isCalling = true;
	callBoxMask.fadeIn();
	Interstellar.playSoundEffect("hailing.wav");
	phoneIcon.addClass("phoneAnimation");
	setTimeout(function(){
		phoneIcon.removeClass("phoneAnimation");
	},2000);
	callBox.fadeIn();
	if(callingAnimationIntervals.dots != undefined){
		clearInterval(callingAnimationIntervals.dots);
		callingAnimationIntervals.dots = undefined;
	}
	if(callingAnimationIntervals.canvasDraw != undefined){
		clearInterval(callingAnimationIntervals.canvasDraw);
		callingAnimationIntervals.canvasDraw = undefined;
	}
	callingAnimationIntervals.canvasDraw = setInterval(function(){
		drawCanvasInterval();
	},0040);

	let dots = ".";

	callingAnimationIntervals.dots = setInterval(function(){
		if(dots.length < 4){
			dots += ".";
		}else{
			dots = "";
		}
		callboxHeader.html("CALLING ROOM" + dots);
	},0750);
}
function drawCanvasInterval(){
	if(canvasInterval == 100){
		if(!lineConnected){
			phoneIcon.addClass("phoneAnimation");
			setTimeout(function(){
				phoneIcon.removeClass("phoneAnimation");
			},2000);
			Interstellar.playSoundEffect("hailing.wav");
		}
		canvasInterval = 0;
		canvasIteration++;
	}
	if(canvasIteration > 6){
		canvasIteration = 6;
	}
	canvasInterval++;
	var c = document.getElementById("callBox_canvas");
	var height = callBox.height();
	var width = callBox.width();
	$(c).width(width);
	$(c).height(height);
	c.width = width;
	c.height = height;
	var ctx = c.getContext("2d");
	var xPos = -75;
	var yPos = height + 75;
	for(var i = 0;i < canvasIteration;i++){
		ctx.beginPath();
		ctx.shadowBlur = (100 * ((canvasInterval + (i * 100)) / 500));
		ctx.shadowColor = "rgba(255,255,255," + (1 - (1 * ((canvasInterval + (i * 100)) / 500))) + ")";
		ctx.strokeStyle = "rgba(255,255,255," + (1 - (1 * ((canvasInterval + (i * 100)) / 500))) + ")";
		ctx.arc(xPos,yPos,canvasInterval + (i * 100),0,2*Math.PI);
		ctx.stroke();
	}
}

function connectLine(){
	phoneMutedIcon.fadeOut();
	phoneIcon.fadeOut();
	phoneConnectedIcon.fadeIn();
	Interstellar.playSoundEffect("CallConnectLong.wav");
	lineConnected = true;
	if(callingAnimationIntervals.dots != undefined){
		clearInterval(callingAnimationIntervals.dots);
		callingAnimationIntervals.dots = undefined;
	}
	callboxHeader.css("color","lime");
	callboxHeader.html("LINE CONNECTED");
	muteButton.fadeIn();
}

//event handlers

changeSortButton.click(function(event){
	playRandomBeep();
	sortByDeck = !sortByDeck;
	if(sortByDeck){
		changeSortButton.html("SORT ALPHABETICALLY");
		drawDeckList();
		drawRoomListForDeck(currentDeck);
	}else{
		changeSortButton.html("SORT BY DECK");
		drawAllRooms();
	}
});

callButton.click(function(event){
	if(callButton.hasClass("Button2Disabled")){
		Interstellar.playErrorNoise();
		return;
	}
	Interstellar.playRandomBeep();
	Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",false);
	Interstellar.setDatabaseValue("internalComm.crewCall.currentCall",selectedRoomTextbox.val());
	Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",false);
});

hangUpButton.click(function(event){
	Interstellar.setDatabaseValue("internalComm.crewCall.currentCall","NO CALL");
	Interstellar.setDatabaseValue("internalComm.crewCall.LineConnected",false);
	Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",false);
});

muteButton.click(function(event){
	Interstellar.setDatabaseValue("internalComm.crewCall.lineMuted",!lineMuted);
})
//intervals
//prevent all the sound effects from playing upon page load
setTimeout(function(){
	doPlaySoundEffects = true;
},0500);