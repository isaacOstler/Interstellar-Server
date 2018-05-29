Interstellar.addCoreWidget("Security Dispatch",function(){
	var thisWidget = this;

	//variables
	var officers = [],
		rooms = [],
		teams = [],
		codes = [],
		isShowingShipView = false,
		hidePostings = false,
		shipImage = new Image;

	//DOM References
	var offDutyList = $("#securityDispatchCore_offDutyList_items"),
		noAssignmentList = $("#securityDispatchCore_noAssignmentList_items"),
		enRouteList = $("#securityDispatchCore_enRouteList_items"),
		onSceneList = $("#securityDispatchCore_onSceneList_items"),
		returningList = $("#securityDispatchCore_returningList_items"),
		teamsList = $("#securityDispatchCore_teams_list"),
		teamsContainer = $("#securityDispatchCore_teams"),
		toggleShipViewButton = $("#securityDispatchCore_settings_toggleShipViewButton"),
		coverageLabel = $("#securityDispatchCore_coverage_percentageLabel"),
		coverageFill = $("#securityDispatchCore_coverage_percentageFill"),
		canvas = $("#securityDispatchCore_shipView"),
		hidePostingsButton = $("#securityDispatchCore_settings_hidePostingButton"),
		editCodesButton = $("#securityDispatchCore_settings_codesButton"),
		officerInfo_name = $("#securityDispatchCore_officerControls_name"),
		officerInfo_rank = $("#securityDispatchCore_officerControls_rank"),
		officerInfo_race = $("#securityDispatchCore_officerControls_race"),
		officerInfo_specialty = $("#securityDispatchCore_officerControls_specialty"),
		officerInfo_location = $("#securityDispatchCore_officerControls_location"),
		officerInfo_orders = $("#securityDispatchCore_officerControls_orders");

	//init calls
	initCanvas();
	
	//interstellar calls
	thisWidget.onResize = function(){
		drawGUI();
		drawShip();
	}

	//preset observers

	//database observers

	Interstellar.onDatabaseValueChange("securityDispatch.dispatchCodes",function(newData){
		if(newData == null){
			$.getJSON( "/resource?path=public/codes.json&screen=security-dispatch-core", function( data ) {
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
	});
	Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
		if(newData == null){
			return; //DO NOT SET THIS VALUE HERE!  THIS MUST BE SET ON CORE
		}
		rooms = newData;
	});
	Interstellar.onDatabaseValueChange("securityDispatch.teams",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("securityDispatch.teams",teams);
			return;
		}
		teams = newData;
		updateTeams();
		updateCurrentIncidentsGUI();
	});
	Interstellar.onDatabaseValueChange("securityDispatch.officers",function(newData){
		if(newData == null){
			$.getJSON( "/resource?path=public/officers.json&screen=security-dispatch-core", function( data ) {
				Interstellar.setDatabaseValue("securityDispatch.officers",data.officers);
			  	return;
			});
			return;
		}
		officers = newData;
		listOfficers();
		updateTeams();
		updateCurrentIncidentsGUI();
		var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
		canvas.attr("width",canvas.width());
		canvas.attr("height",canvas.height());
		drawShip(ctx,-1,getShipImagePostingDensity());
	});

	//functions
	function drawGUI(){
		var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
		canvas.attr("width",canvas.width());
		canvas.attr("height",canvas.height());
		drawShip(ctx,-1,getShipImagePostingDensity());
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
				if(imageHeight > canvas.height()){
					imageHeight = canvas.height();
				}
	    		var x = 0;
			    var shipWidth = Math.round(canvas.width());
			    if(shipWidth > shipImage.width){
			    	x = (shipWidth - shipImage.width) / 2;
			    	shipWidth = shipImage.width;
			    }
			    
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
			});
		}
		//load the image at this address
		shipImage.src = '/ship?file=starboard.png';
	}

	function getShipImagePostingDensity(){
		var numberOfDecksCovered = 0;
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
		for(var i = 0;i < denisty.length;i++){
			if(denisty[i] > 0){
				numberOfDecksCovered++;
			}
		}
		var percentage = Math.round(100 * (numberOfDecksCovered / rooms.length));
		coverageLabel.html(percentage + "%");
		coverageFill.css("width",percentage + "%");
		return denisty;
	}

	function drawShip(ctx,highlightedDeck,density){
		//we must maintain the aspect ratio
	    var aspectRatio = shipImage.width / shipImage.height;
	    var imageHeight = Math.round(canvas.width() / aspectRatio);
		if(imageHeight > canvas.height()){
			imageHeight = canvas.height();
		}
	    var imageStartY = (canvas.height() / 2) - (imageHeight / 2);
	    var x = 0;
	    var shipWidth = Math.round(canvas.width());
	    if(shipWidth > shipImage.width){
	    	x = (shipWidth - shipImage.width) / 2;
	    	shipWidth = shipImage.width;
	    }
	    ctx.drawImage(shipImage,x,imageStartY, shipWidth, imageHeight);
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

	function updateCurrentIncidentsGUI(){
		if(rooms.length == 0){
			setTimeout(function(){ //we have to wait for rooms to be populated before we can do anything here
				updateCurrentIncidentsGUI();
			},0500);
			return;
		}
		var html = "";
		for(var i = 0;i < teams.length;i++){
			if(!(hidePostings && teams[i].isPosting)){
				var officerNames = "";
				for(var j = 0;j < teams[i].officers.length;j++){
					officerNames += teams[i].officers[j].name.last;
					if(j + 1 < teams[i].officers.length){
						officerNames += ", ";
					}
				}

				html += '<div class="securityDispatchCore_teams_list_item">';
					html += '<div class="securityDispatchCore_teams_list_item_incident">';
						html += teams[i].incident.toUpperCase();
					html += '</div>';
					html += '<div class="securityDispatchCore_teams_list_item_priority">';
						html += teams[i].priority;
					html += '</div>';
					html += '<div class="securityDispatchCore_teams_list_item_location">';
						html += "Deck " + (teams[i].deck + 1) + ", " + rooms[teams[i].deck][teams[i].room].name;
					html += '</div>';
					html += '<div class="securityDispatchCore_teams_list_item_officers">';
						html += officerNames;
					html += '</div>';
					html += '<div class="securityDispatchCore_teams_list_item_time">';
						html += getTimeDifferenceInFormatedString(new Date(teams[i].timeDispatched),new Date());
					html += '</div>';
				html += '</div>';
			}
		}
		teamsList.html(html);
	}

	function listOfficers(){
		var html = "";
		for(var i = 0;i < 5;i++){
			//0 = officer unassigned
			//1 = officer off duty
			//2 = officer en route
			//3 = officer on scene
			//4 = officer returning
			//5 = officer status unknown
			var normalStatusHTML = "",
				waitingActionHTML = "";
			for(var j = 0;j < officers.length;j++){
				if(officers[j].currentAction == i){
					var html = "";
					if(officers[j].currentAction != officers[j].currentRequestedAction){
						if(officers[j].estimatedTimeFromLastAction != null && getTimeDifferenceInSeconds(new Date(officers[j].timeSinceLastRequestedAction),new Date()) > officers[j].estimatedTimeFromLastAction){
							html += '<div index="' + j + '" class="securityDispatchCore_list_items_item_actionRequired securityDispatchCore_list_items_itemEventHandler">';
						}else{
							html += '<div index="' + j + '" class="securityDispatchCore_list_items_item_actionPending securityDispatchCore_list_items_itemEventHandler">';
						}
					}else{
						html += '<div index="' + j + '" class="securityDispatchCore_list_items_item securityDispatchCore_list_items_itemEventHandler">';
					}
					html += '<div index="' + j + '" class="securityDispatchCore_list_items_item_name">';
					html += officers[j].name.last.toUpperCase();
					html += '</div>';
					if(officers[j].currentAction != officers[j].currentRequestedAction){
						html += '<div index="' + j + '" class="securityDispatchCore_list_items_item_time">';
						html += getTimeDifferenceInFormatedString(new Date(officers[j].timeSinceLastRequestedAction),new Date());
						html += '</div>';
						html += '<input index="' + j + '" class="securityDispatchCore_list_items_item_button coreButton" type="button" value=">>">';
					}
					html += '</div>';
					if(officers[j].currentAction != officers[j].currentRequestedAction){
						waitingActionHTML += html;
					}else{
						normalStatusHTML += html;
					}
				}
			}
			var html = "";
			if(waitingActionHTML != ""){
				html = waitingActionHTML + (normalStatusHTML != "" ? "<div class='securityDispatchCore_list_items_itemBreak'></div>" : "") + normalStatusHTML;
			}else{
				html = normalStatusHTML;
			}
			switch(i){
				case 0:
					noAssignmentList.html(html);
				break;
				case 1:
					offDutyList.html(html);
				break;
				case 2:
					enRouteList.html(html);
				break;
				case 3:
					onSceneList.html(html);
				break;
				case 4:
					returningList.html(html);
				break;
			}
		}
		$(".securityDispatchCore_list_items_item_button").off();
		$(".securityDispatchCore_list_items_item_button").click(function(event){
			var index = Number($(event.target).attr("index"));
			officers[index].currentAction = officers[index].currentRequestedAction;
			officers[index].timeSinceLastRequestedAction = new Date();
			switch(officers[index].currentAction){
				case 0:
					//no assignment, no further action
					officers[index].estimatedTimeFromLastAction = null;
					officers[index].postedDeck = -1; //let's remove them from any current calls by reseting their posted room/deck
					officers[index].postedRoom = -1; //let's remove them from any current calls by reseting their posted room/deck
				break;
				case 1:
					//off duty, no further action
					officers[index].estimatedTimeFromLastAction = null;
					officers[index].postedDeck = -1; //let's remove them from any current calls by reseting their posted room/deck
					officers[index].postedRoom = -1; //let's remove them from any current calls by reseting their posted room/deck
				break;
				case 2:
					//en route, should arrive within 7-8 minutes
					officers[index].estimatedTimeFromLastAction = Math.floor(Math.random() * (60) * 4) + ((60) * 4);
					officers[index].currentRequestedAction = 3;
				break;
				case 3:
					//on scene, should do something within 25 minutes
					officers[index].estimatedTimeFromLastAction = (60) * 25;
					officers[index].currentRequestedAction = 4;
				break;
				case 4:
					//returning.  Should arrive within 10-11 minutes.
					officers[index].estimatedTimeFromLastAction = Math.floor(Math.random() * (60) * 7) + ((60) * 4);
					officers[index].currentRequestedAction = 0;
					officers[index].postedDeck = -1; //let's remove them from any current calls by reseting their posted room/deck
					officers[index].postedRoom = -1; //let's remove them from any current calls by reseting their posted room/deck
				break;
			}
			Interstellar.setDatabaseValue("securityDispatch.officers",officers);
		});
		$(".securityDispatchCore_list_items_itemEventHandler").off();
		$(".securityDispatchCore_list_items_itemEventHandler").click(function(event){
			var index = Number($(event.target).attr("index"));
			displaySecurityOfficerInformation(index);
		});
	}

	function getTimeDifferenceInSeconds(time1, time2){
		return Number(Math.abs(Math.floor((time1.getTime() - time2.getTime()) / 1000)));
	}

	function getTimeDifferenceInFormatedString(startDate,endDate){
		var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
		var minutes = Math.floor(seconds / 60);
		var hours = Math.floor(minutes / 60);
		seconds = seconds - (minutes * 60);
		minutes = minutes - (hours * 60);
		return (toTwoDigitNumber(hours) + ":" + toTwoDigitNumber(minutes) + ":" + toTwoDigitNumber(seconds));
	}

	function updateOfficers(){
		$(".securityDispatchCore_list_items_item_time").each(function(i,obj){
			var index = Number($(obj).attr("index"));
			$(obj).html(getTimeDifferenceInFormatedString(new Date(officers[index].timeSinceLastRequestedAction),new Date()));
			if(officers[index].estimatedTimeFromLastAction != null && getTimeDifferenceInSeconds(new Date(officers[index].timeSinceLastRequestedAction),new Date()) > officers[index].estimatedTimeFromLastAction){
				listOfficers(); //redraw
			}
		});
	}

	function updateTeams(){
		var updateRequired = false;
		var teamsToRemove = [];
		for(var i = 0;i < teams.length;i++){
			var officersToRemove = [];
			for(var j = 0;j < teams[i].officers.length;j++){
				//we are cycling through the officers in this team
				//if the officer in this team is no longer posted to this team
				for(var x = 0;x < officers.length;x++){
					if(officers[x].name.last == teams[i].officers[j].name.last && officers[x].name.first == teams[i].officers[j].name.first && officers[x].name.middle == teams[i].officers[j].name.middle && officers[x].age == teams[i].officers[j].age){
						//this is them
						if(officers[x].postedRoom != teams[i].room || officers[x].postedDeck != teams[i].deck){
							updateRequired = true;
							//we need to remember to remove this officer;
							officersToRemove.splice(officersToRemove.length,0,teams[i].officers[j]);
						}
					}
				}
			}
			//remove any officers from this list
			for(var j = 0;j < officersToRemove.length;j++){
				for(var x = 0;x < teams[i].officers.length;x++){
					if(officersToRemove[j] == teams[i].officers[x]){
						teams[i].officers.splice(x,1);
					}
				}
			}

			if(teams[i].officers.length == 0){
				teamsToRemove.splice(teamsToRemove,0,teams[i]);
				updateRequired = true;
			}
		}
		for(var i = 0;i < teamsToRemove.length;i++){
			for(var j = 0;j < teams.length;j++){
				if(teamsToRemove[i] == teams[j]){
					teams.splice(j,1);
				}
			}
		}
		if(updateRequired){
			Interstellar.setDatabaseValue("securityDispatch.teams",teams);
			return;
		}
	}

	function displaySecurityOfficerInformation(index){
		officerInfo_name.html(officers[index].name.last.toUpperCase() + ", " + officers[index].name.first.toUpperCase() + ", " + officers[index].name.middle.toUpperCase());
		officerInfo_rank.html(officers[index].rank.toUpperCase());
		officerInfo_race.html(officers[index].race.toUpperCase());
		officerInfo_specialty.html(officers[index].specialty.toUpperCase());
		officerInfo_location.html(officers[index].postedDeck != -1 ? "DECK " + (Number(officers[index].postedDeck) + 1) + ", " + rooms[Number(officers[index].postedDeck)][Number(officers[index].postedRoom)].name.toUpperCase() : "NO POSTED LOCATION");
		officerInfo_orders.html(officers[index].orders != "" ? "ORDERS: " + officers[index].orders : "ORDERS: NO ORDERS");
	}

	function toTwoDigitNumber(number){
		if(number < 10){
			return "0" + number;
		}else{
			return number;
		}
	}

	//event handlers
	toggleShipViewButton.click(function(event){
		isShowingShipView = !isShowingShipView;
		canvas.stop();
		teamsContainer.stop();
		if(isShowingShipView){
			var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
			canvas.attr("width",canvas.width());
			canvas.attr("height",canvas.height());
			drawShip(ctx,-1,getShipImagePostingDensity());
			canvas.fadeIn();
			teamsContainer.fadeOut();
		}else{
			canvas.fadeOut();
			teamsContainer.fadeIn();
		}
	});

	hidePostingsButton.click(function(event){
		hidePostings = !hidePostings;
		updateCurrentIncidentsGUI();
		if(hidePostings){
			hidePostingsButton.attr("value","Show Postings");
		}else{
			hidePostingsButton.attr("value","Hide Postings");
		}
	});

	editCodesButton.click(function(event){
		Interstellar.openCoreWindow("securityDispatchCoreCodeEditor",event);
	});

	//intervals
	setInterval(function(){
		updateOfficers();
	},1000);
});