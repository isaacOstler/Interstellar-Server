//variables
var securityOfficers = [],
	defualtNumberOfSecurityOfficers = 18,
	rooms = [];

//jquery references

var avaliableOfficersList = $("#avaliableOfficerContainer_list"),
	enRouteOfficersList = $("#officersEnRouteContainer_list"),
	onSceneOfficersList = $("#officersOnSceneContainer_list"),
	recalledOfficerList = $("#officersRecalledContainer_list"),
	dispatchQueOfficerList = $("#dispatchControls_officerList");

//init calls

//database observers
Interstellar.onDatabaseValueChange("security.officers",function(newData){
	if(newData == null){
		securityOfficers = [];
		for(var i = 0;i < defualtNumberOfSecurityOfficers;i++){
			var newSecurityOfficer = 
			{
				"name" : "VOYAGER SECURITY 5" + addNumberPadding(i),
				"sayAs" : "VOYAGER SECURTIY 5 " + addNumberPadding(i),
				"currentLocation" :
				{
					"deck" : Math.floor(Math.random() * 15), //main security station, by default
					"room" : 1
				},
				"status" : 2, //0 free, 1 enroute, 2 on scene, 3 recalled
				"timeUntilArrival" : -1,
				"orders" :
				{
					"code" : -1,
					"text" : "" 
				},
				"equipment" : [],
				"isDead" : false,
				"isSOS" : false
			}
			securityOfficers.splice(securityOfficers.length,0,newSecurityOfficer);
		}
		Interstellar.setDatabaseValue("security.officers",securityOfficers);
		return;
	}
	securityOfficers = newData;
	drawList(newData);
});

//database observers
Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
	if(newData == null){
		return; //DO NOT SET THIS VALUE HERE!  JAMES!  STOP TOUCHING MY CODE!  This is closed source....  Don't make me encrypt it.
	}
	rooms = newData;
});


//functions

function addNumberPadding(number){
	if(number < 10){
		return "0" + number;
	}
	return number;
}

function drawList(officers){
	avaliableOfficersList.html("");
	enRouteOfficersList.html("");
	onSceneOfficersList.html("");
	recalledOfficerList.html("");

	for(var i = 0;i < officers.length;i++){
		var html = "<div class='listItem' index='" + i + "' id='security_" + i + "' draggable='true' ondragstart='drag(event)'>";
		html += officers[i].name;
		html += "</div>"
		if(officers[i].status == 0){ //avaliable
			avaliableOfficersList.append(html);
		}else if(officers[i].status == 1){ //en route
			enRouteOfficersList.append(html);
		}else if(officers[i].status == 2){ //at scene
			var deck = officers[i].currentLocation.deck,
				room = officers[i].currentLocation.room;
			if(rooms != undefined){
				if(document.getElementById("room" + deck + "" + room) != null){
					console.log("reuse");
					//use an old one
					console.log($("#room" + deck + "" + room));
					$("#room" + deck + "" + room).append(html);
					continue;
				}else{
					console.log("new");
					//create a new header
					var prependHTML = "<div class='room' id='room" + deck + "" + room + "'>",
						appendHTML = "</div>";

					prependHTML += "<div class='roomHeader'>" + rooms[deck][room].name + "</div>";

					html = prependHTML + html + appendHTML;
				}
			}
			onSceneOfficersList.append(html);
		}else if(officers[i].status == 3){ //recalled
			recalledOfficerList.append(html);
		}else{
			console.warn("WARN: " + officers[i].name + " has an unknown status of " + officers[i].status);
		}
	}

	$(".listItem").off();
	return;
	$(".listItem").mousedown(function(event){
		let element = $(event.target);
		$(document.body).on("mousemove.dragOfficer",function(dragEvent){
			element.css("position","absolute");
		});
	});
}

function drag(ev) {
    ev.dataTransfer.setData("officerDragged", ev.target.id);
}

function drop(ev) {
	//graphical
    ev.preventDefault();
    var data = ev.dataTransfer.getData("officerDragged");
    var element = ev.target;
    while($(element).attr("droplist") == undefined){
    	element = element.parentNode;
    }
    element.appendChild(document.getElementById(data));
    //logistical
    var index = Number($("#" + data).attr("index"));
    console.log(data);
    if($(element).attr("id") == avaliableOfficersList.attr("id")){
    	if(securityOfficers[index].status != 0){
    		//recall this officer
    		securityOfficers[index].status = 3;
    		Interstellar.setDatabaseValue("security.officers",securityOfficers);
    	}
    }else if($(element).attr("id")  == dispatchQueOfficerList.attr("id") ){
    	console.log("Qued!")
    }
}

//intervals