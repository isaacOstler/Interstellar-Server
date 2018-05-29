Interstellar.addCoreWidget("Security Dispatch",function(){
	var thisWidget = this;

	//variables
	var officers = [],
		rooms = [],
		teams = [],
		codes = [];

	//DOM References
	var offDutyList = $("#securityDispatchCore_offDutyList_items"),
		noAssignmentList = $("#securityDispatchCore_noAssignmentList_items"),
		enRouteList = $("#securityDispatchCore_enRouteList_items"),
		onSceneList = $("#securityDispatchCore_onSceneList_items"),
		returningList = $("#securityDispatchCore_returningList_items"),
		teamsList = $("#securityDispatchCore_teams_list");


	//init calls
	
	//interstellar calls
	thisWidget.onResize = function(){
		drawGUI();
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
	});

	//functions
	function drawGUI(){

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
							html += '<div class="securityDispatchCore_list_items_item_actionRequired">';
						}else{
							html += '<div class="securityDispatchCore_list_items_item_actionPending">';
						}
					}else{
						html += '<div class="securityDispatchCore_list_items_item">';
					}
					html += '<div class="securityDispatchCore_list_items_item_name">';
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
				html = waitingActionHTML + "<div class='securityDispatchCore_list_items_itemBreak'></div>" + normalStatusHTML;
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

	function toTwoDigitNumber(number){
		if(number < 10){
			return "0" + number;
		}else{
			return number;
		}
	}

	//event handlers
	

	//intervals
	setInterval(function(){
		updateOfficers();
	},1000);
});