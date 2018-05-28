//variables
var shipImage = new Image,
	dispatchModeActive = false,
	codes = [],
	rooms = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
	officers = [];

//DOM Refrences
var canvas = $("#canvas"),
	callsList_noCalls = $("#currentCalls_noCallsContainer"),
	callsList_calls = $("#currentCalls_callsContainer"),
	callsList = $("#currentCalls_callsContainer_list"),
	officersList = $("#officersList_list"),
	officersListContainer = $("#officersList"),
	dispatchTasksButton = $("#dispatchTasks"),
	newDispachButton = $("#dispatchButton"),
	reasignWarningPopup = $("#reasignWarning"),
	reasignWarningPopup_continueButton = $("#reasignWarning_continueButton"),
	reasignWarningPopup_cancelButton = $("#reasignWarning_cancelButton"),
	dispatchWindow = $("#dispatchScreen"),
	dispatchWindow_mask = $("#dispatchBlackoutArea"),
	dispatchWindow_ordersTextarea = $("#dispatchScreen_controls_orders"),
	dispatchWindow_deckSelect = $("#dispatchScreen_controls_deckSelect"),
	dispatchWindow_roomSelect = $("#dispatchScreen_controls_roomSelect"),
	dispatchWindow_codeSelect = $("#dispatchScreen_controls_codeSelect"),
	dispatchWindow_prioritySelect = $("#dispatchScreen_controls_prioritySelect"),
	dispatchWindow_dispatchButton = $("#dispatchScreen_controls_dispatchButton"),
	dispatchWindow_cancelButton = $("#dispatchScreen_controls_cancelButton"),
	dispatchTasksWindow = $("#dispatchTasksInfo"),
	dispatchTasksWindow_screenMask = $("#dispatchBlackoutArea_dispatchItemSpecific"),
	dispatchTasksWindow_closeButton = $("#dispatchTasksInfo_closeButton"),
	officerInformationBox = $("#securityOfficerInformation"),
	officerInformationBox_title = $("#securityOfficerInformation_label"),
	officerInformationBox_firstName = $("#securityInformation_firstName"),
	officerInformationBox_middleName = $("#securityInformation_middleName"),
	officerInformationBox_lastName = $("#securityInformation_lastName"),
	officerInformationBox_age = $("#securityInformation_age"),
	officerInformationBox_firstName = $("#securityInformation_firstName"),
	officerInformationBox_species = $("#securityInformation_species"),
	officerInformationBox_rank = $("#securityInformation_rank"),
	officerInformationBox_specialty = $("#securityInformation_specialty"),
	officerInformationBox_currentDeck = $("#securityInformation_currentDeck"),
	officerInformationBox_currentRoom = $("#securityInformation_currentRoom"),
	officerInformationBox_orders = $("#securityInformation_currentOrders"),
	officerInformationBox_recallButton = $("#securityInformation_recallButton"),
	officerInformationBox_postOffDutyButton = $("#securityInformation_postOffDutyButton");

//init

initCanvas();

//preset obeservers

//database observers
Interstellar.onDatabaseValueChange("securityDispatch.dispatchCodes",function(newData){
	if(newData == null){
		//i'm setting this value here for development purposes ONLY
		//ideally this will be handled by core
		$.getJSON( "/resource?path=public/codes.json", function( data ) {
			data.codes.sort(function(a, b) {
			    var textA = a.category.toUpperCase();
			    var textB = b.category.toUpperCase();
			    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			});
		  	Interstellar.setDatabaseValue("securityDispatch.dispatchCodes",data.codes);
		  	return;
		});
		return;
	}
	codes = newData;
	var html = "<optgroup label='0 - NO CODE'>";
	html += "<option value='-1,0'>0 - 00 - NO CODE</option>";
	html += "</optgroup>";
	for(var i = 0;i < codes.length;i++){
		html += "<optgroup label='" + (i + 1) + " - " + codes[i].category.toUpperCase() + "'>";
		for(var j = 0;j < codes[i].codes.length;j++){
			html += "<option value='" + i + "," + j + "'>";
			html += (i + 1) + " - " + toTwoDigitNumber(j) + " - " + codes[i].codes[j].name.toUpperCase();
			html += "</option>";
		}
		html += "</optgroup>";
	}
	dispatchWindow_codeSelect.html(html);
});
Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
	if(newData == null){
		return; //DO NOT SET THIS VALUE HERE!  THIS MUST BE SET ON CORE
	}
	rooms = newData;
	var html = "";
	for(var i = 0;i < rooms.length;i++){
		html += "<option value='" + i + "'>";
		html += "DECK " + (i + 1);
		html += "</option>";
	}
	dispatchWindow_deckSelect.html(html);
	setDispatchWindowRoomSelectToDeck(0);
});
Interstellar.onDatabaseValueChange("securityDispatch.officers",function(newData){
	if(newData == null){
		$.getJSON( "/resource?path=public/officers.json", function( data ) {
			console.log(data);
		  	Interstellar.setDatabaseValue("securityDispatch.officers",data.officers);
		  	return;
		});
		return;
	}
	if(officers.length == newData.length){
		//update
		officers = newData;
		updateOfficers();
	}else{
		//firstdraw
		officers = newData;
		listOfficers();
	}
	var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
	ctx.clearRect(0,0,canvas.width(),canvas.height());
	drawShip(ctx,-1,getShipImagePostingDensity());
});

//functions
function updateOfficers(){
	for(var i = 0;i < officers.length;i++){
		var color;
		switch(officers[i].currentAction){
			case 0: //officer unassigned
				color = "rgba(255,255,255,.4)";
			break;
			case 1: //officer off duty
				color = "rgba(55,55,55,.4)";
			break;
			case 2: //officer en route
				color = "rgba(255,128,0,.4)";
			break;
			case 3: //officer on scene
				color = "rgba(0,128,255,.4)";
			break;
			case 4: //officer returning
				color = "rgba(255,255,0,.4)";
			break;
			case 5: //officer status unknown
				color = "rgba(255,0,0,.4)";
			break;
			default: //something funky
				color = "rgba(255,255,255,.4)";
			break;
		}
		$("[officerIndex=" + i + "]").css("color","");
		$("[officerIndex=" + i + "]").css("background-color",color);
	}
}

function getShipImagePostingDensity(){
	var denisty = [];
	var i;
	for(i = 0;i < rooms.length;i++){
		denisty.splice(denisty.length,0,[]);
	}
	for(i = 0;i < officers.length;i++){
		if(officers[i].postedDeck != -1){
			denisty[officers[i].postedDeck]++;
		}
	}
	return denisty;
}

function listOfficers(){
	var html = "";
	for(var i = 0;i < officers.length;i++){
		html += '<div officerIndex="' + i + '" class="officerItem">';
		html += officers[i].name.last.toUpperCase();
		html += ", ";
		html += officers[i].name.first.toUpperCase();
		html += "</div>";
	}
	officersList.html(html);
	$(".officerItem").off();
	$(".officerItem").on("mouseover",function(event){
		var index = Number($(event.target).attr("officerIndex"));
    	var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
    	ctx.clearRect(0,0,canvas.width(),canvas.height());
		drawShip(ctx,officers[index].postedDeck,getShipImagePostingDensity());
	});
	$(".officerItem").on("click",function(event){
		if(dispatchModeActive){
			if($(event.target).hasClass("dispatchWindow_unselectedOfficer")){
				$(event.target).removeClass("dispatchWindow_unselectedOfficer");
				$(event.target).css("filter","brightness(4)");
			}else{
				$(event.target).addClass("dispatchWindow_unselectedOfficer");
				$(event.target).css("filter","");
			}
			if($('.dispatchWindow_unselectedOfficer').length != officers.length){
				dispatchWindow_dispatchButton.removeClass("disabledButton");
				dispatchWindow_dispatchButton.addClass("customButton");
			}else{
				dispatchWindow_dispatchButton.addClass("disabledButton");
				dispatchWindow_dispatchButton.removeClass("customButton");
			}
		}else{
			var index = Number($(event.target).attr("officerIndex"));
			officerInformationBox_title.html(officers[index].name.last.toUpperCase() + ", " + officers[index].name.first.toUpperCase() + " - PROFILE");
			officerInformationBox_firstName.html(officers[index].name.first.toUpperCase());
			officerInformationBox_lastName.html(officers[index].name.last.toUpperCase());
			officerInformationBox_middleName.html(officers[index].name.middle.toUpperCase());
			officerInformationBox_age.html(officers[index].age);
			officerInformationBox_species.html(officers[index].race.toUpperCase());
			officerInformationBox_rank.html(officers[index].rank.toUpperCase());
			officerInformationBox_specialty.html(officers[index].specialty.toUpperCase());
			officerInformationBox_currentRoom.html(officers[index].postedRoom);
			officerInformationBox_currentDeck.html("Deck " + (officers[index].postedDeck + 1));
			officerInformationBox_orders.html(officers[index].orders.toUpperCase());
			officerInformationBox.slideDown();
		}
	});
	updateOfficers();
}
function toTwoDigitNumber(number){
	if(number < 10){
		return "0" + number;
	}else{
		return number;
	}
}
function initCanvas(){
	//we have to allow the image to load before we set this event listener
	shipImage.onload = function(){
		var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
		canvas.attr("width",canvas.width());
		canvas.attr("height",canvas.height());
		drawShip(ctx,-1,getShipImagePostingDensity());


		//now that the image has loaded, create the event listner
		canvas.on("mousemove",function(event){
    		var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
   			var aspectRatio = shipImage.width / shipImage.height;
    		var imageHeight = Math.round(canvas.width() / aspectRatio);
    		var imageStartY = (canvas.height() / 2) - (imageHeight / 2);
    		var currentDeckSelected = -1;

			canvas.attr("width",canvas.width());
			canvas.attr("height",canvas.height());

			ctx.strokeStyle = "white";
		    ctx.strokeWidth = 2;

			if(imageStartY < event.offsetY && event.offsetY < imageHeight + imageStartY){
				//we are within the image
				var offsetOfCursorOverImage = event.offsetY - imageStartY;
				currentDeckSelected = Math.floor((offsetOfCursorOverImage / imageHeight) * rooms.length);
				ctx.fillStyle = "white";
				ctx.font = "14px Arial";
				ctx.fillText("DECK " + (currentDeckSelected + 1),canvas.width() - 100,imageStartY + (imageHeight * .75)); 
			}else{
				//we are not within the image
				currentDeckSelected = -1;
			}

			drawShip(ctx,currentDeckSelected,getShipImagePostingDensity());
			//drawLineToPoint(ctx,0,0,event.offsetX,event.offsetY);
			updateOfficers();
			for(var i = 0;i < officers.length;i++){
				if(officers[i].postedDeck == currentDeckSelected){
					$("[officerIndex=" + i + "]").css("color","rgba(255,255,255,1)");
				}
			}
		});
	}
	//load the image at this address
	shipImage.src = '/ship?file=starboard.png';
}

function drawShip(ctx,highlightedDeck,density){
	//we must maintain the aspect ratio
    var aspectRatio = shipImage.width / shipImage.height;
    var imageHeight = Math.round(canvas.width() / aspectRatio);
    var imageStartY = (canvas.height() / 2) - (imageHeight / 2);
    ctx.drawImage(shipImage,0,imageStartY, Math.round(canvas.width()), imageHeight);
    var deckHeight = imageHeight / rooms.length;
    
    if(density != null){
    	//mask to the image
		ctx.globalCompositeOperation = "source-atop";
	    for(var i = 0;i < density.length;i++){
	    	if(i != highlightedDeck){
	    		for(var j = 0;j < density[i];j++){

			        ctx.fillStyle = "rgba(0,120,255,.45)";
			        ctx.fillRect(0,imageStartY + (i * deckHeight),canvas.width(),deckHeight);

	    		}
	    	}
	    }
		// change the composite mode to destination-atop
		// any new drawing will not overwrite any existing pixels
		ctx.globalCompositeOperation = "destination-atop";
    }
    if(highlightedDeck != -1){

    	//mask to the image
        ctx.globalCompositeOperation = "source-atop";

        ctx.fillStyle = "rgba(255,0,0,.6)";
        ctx.fillRect(0,imageStartY + (highlightedDeck * deckHeight),canvas.width(),deckHeight);

        // change the composite mode to destination-atop
        // any new drawing will not overwrite any existing pixels
        ctx.globalCompositeOperation = "destination-atop";
    }
}
function drawLineToPoint(ctx,startX,startY,x,y){
    ctx.moveTo(startX,startY);
    ctx.lineTo(x,y);
    ctx.stroke();
}
function setDispatchMode(state){
	dispatchModeActive = state;
	dispatchWindow_ordersTextarea.val("");
	$(".officerItem").removeClass("dispatchWindow_unselectedOfficer");
	officersSelected = [];
	dispatchWindow_mask.stop();
	officersListContainer.stop();
	dispatchWindow.stop();
	if(state){
		$(".officerItem").addClass("dispatchWindow_unselectedOfficer");
		dispatchWindow_mask.fadeIn();
		officersListContainer.animate({"left" : $("#contentArea").width() * .12},1000,function(){
			dispatchWindow.fadeIn();
		});
	}else{
		dispatchWindow.fadeOut();
		officersListContainer.animate({"left" : $("#contentArea").width() * .0},1000,function(){
			dispatchWindow_mask.fadeOut();
		});
	}
}
function setDispatchWindowRoomSelectToDeck(deck){
	var html = "";
	for(var i = 0;i < rooms[deck].length;i++){
		html += "<option value='" + i + "'>";
		html += rooms[deck][i].name;
		html += "</option>";
	}
	dispatchWindow_roomSelect.html(html);
}
//event listeners
dispatchWindow_codeSelect.change(function(event){
	var category = Number($(event.target).val().split(",")[0]),
		specific = Number($(event.target).val().split(",")[1]),
		code =  codes[category].codes[specific].code;

	if(code != null){
		switch(code.toLowerCase()){
			case "alpha":
				dispatchWindow_prioritySelect.val(1);
			break;
			case "bravo":
				dispatchWindow_prioritySelect.val(2);
			break;
			case "charlie":
				dispatchWindow_prioritySelect.val(3);
			break;
			case "delta":
				dispatchWindow_prioritySelect.val(4);
			break;
			case "echo":
				dispatchWindow_prioritySelect.val(5);
			break;
			case "omega":
				dispatchWindow_prioritySelect.val(0);
			break;
		}
	}
});
dispatchWindow_deckSelect.change(function(event){
	setDispatchWindowRoomSelectToDeck(Number(event.target.value));
});
newDispachButton.click(function(event){
	setDispatchMode(true);
});
dispatchWindow_dispatchButton.click(function(event){
	let orders = dispatchWindow_ordersTextarea.val();
	let deck = Number(dispatchWindow_deckSelect.val());
	let deckText = Number(deck + 1);
	let room = Number(dispatchWindow_roomSelect.val());
	let code = codes[Number(dispatchWindow_codeSelect.val().split(",")[0])].category;
	let specificCode = Number(dispatchWindow_codeSelect.val().split(",")[1]);
	let priority = "";
	let officersSelected = [];
	let officerNames = [];
	let officerAlreadyOnDuty = false;

	switch(Number(dispatchWindow_prioritySelect.val())){
		case 1:
			priority = "ALPHA";
		break;
		case 2:
			priority = "BRAVO";
		break;
		case 3:
			priority = "CHARLIE";
		break;
		case 4:
			priority = "DELTA";
		break;
		case 5:
			priority = "ECHO";
		break;
		case 0:
			priority = "OMEGA";
		break;
	}

	$(".officerItem").each(function(i, obj) {
	    if(!$(obj).hasClass("dispatchWindow_unselectedOfficer")){
	    	officersSelected.splice(officersSelected.length,0,Number($(obj).attr("officerindex")));
	    }
	});
	for(var i = 0;i < officersSelected.length;i++){
		officerNames.splice(officerNames.length,0,officers[officersSelected[i]].name.last);
		if(officers[officersSelected[i]].currentRequestedAction != 0){
			officerAlreadyOnDuty = true;
		}
	}


	var dispatchFunction = function(){
		var speak = "";
		for(var i = 0;i < officerNames.length;i++){
			speak += "SECURITY OFFICER " + officerNames[i] + ", ";
		}
		speak += ", " + code + ", ";
		speak += " RESPOND TO DECK ";
		speak += deckText;
		speak += ".  " + rooms[Number(deck)][Number(room)].name;
		speak += ".  " + speak;
		speak += ".  CODE.  " + Number(dispatchWindow_codeSelect.val().split(",")[0]) + ", " + priority + ", " + specificCode;
		Interstellar.say(speak);
		Interstellar.setDatabaseValue("securityDispatch.dispatchRadioSpeech",speak);
		setDispatchMode(false);
		dispatchFunction = null;

		for(var i = 0;i < officersSelected.length;i++){
			officers[officersSelected[i]].currentRequestedAction = 2;
			officers[officersSelected[i]].orders = orders;
			officers[officersSelected[i]].postedDeck = Number(deck);
			officers[officersSelected[i]].postedRoom = Number(room);
			officers[officersSelected[i]].timeOnCall = new Date();
		}
		Interstellar.setDatabaseValue("securityDispatch.officers",officers);
	}

	if(officerAlreadyOnDuty){
		reasignWarningPopup.fadeIn();
		reasignWarningPopup_cancelButton.off();
		reasignWarningPopup_continueButton.off();
		reasignWarningPopup_cancelButton.click(function(event){
			reasignWarningPopup.fadeOut();
			reasignWarningPopup_cancelButton.off();
		});
		reasignWarningPopup_continueButton.click(function(event){
			reasignWarningPopup.fadeOut();
			reasignWarningPopup_continueButton.off();
			dispatchFunction();
		});
	}else{
		dispatchFunction();
	}
});
dispatchWindow_cancelButton.click(function(event){
	setDispatchMode(false);
});
dispatchTasksButton.click(function(event){
	dispatchTasksWindow.fadeIn(1000);
	dispatchTasksWindow_screenMask.fadeIn(0500);
});
dispatchTasksWindow_closeButton.click(function(event){
	dispatchTasksWindow.fadeOut(0500);
	dispatchTasksWindow_screenMask.fadeOut(1000);
});
//intervals