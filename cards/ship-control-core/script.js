Interstellar.addCoreWidget("Ship Control",function(){
	var hasInit = false;
	Interstellar.onPresetValueChange("ship.presets",function(presetValues){
		if(presetValues == null){
			$.getJSON("/resource?path=public/presets.JSON&screen=ship-control-core",function(loadedPresets){
				var presets = 
				{
					"crew" : loadedPresets.crew,
					"rooms" : loadedPresets.rooms
				};
				Interstellar.setPresetValue("ship.presets",presets);
				return;
			});
		}
		var presets = presetValues;
		if(hasInit){
			return;
		}
		hasInit = true;
		var thisWidget = this;

		//varibles

		var lifeformCount = presets.crew.length,
		rooms = [],
		roomsBackup = [],
		selectedDeck = -1,
		selectedRoom = -1,
		deleteRoomMode = false,
		deleteDeckMode = false;

		//DOM references
		var crewCountTextbox = $("#ship-control-Core_crew-count_inputTextbox"),
		crewCountUpArrow = $("#ship-control-Core_crew-count_upArrow"),
		crewCountDownArrow = $("#ship-control-Core_crew-count_downArrow"),
		widgetElement = $("#ship-control-Core-Widget"),
		crewCountLabel = $("#ship-control-Core_crew-crew_count_label"),
		shipButton = $("#ship-control-Core_editShipButton"),
		layoutButton = $("#ship-control-Core_editLayoutButton"),
		deckList = $("#ship-control-core_shipControlWindow_shipRoomsTab_deckList"),
		roomsList = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomList"),
		roomNameTextbox = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomInformation_roomNameTextbox"),
		roomDeckSelect = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomInformation_roomDeckSelect"),
		securitySelect = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomInformation_roomSecuritySelect"),
		descriptionTextarea = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomInformation_roomDesc"),
		saveShipRoomsButton = $("#ship-control-core_shipControlWindow_shipRoomsTab_saveButton"),
		cancelShipRoomsButton = $("#ship-control-core_shipControlWindow_shipRoomsTab_cancelButton"),
		addRoomButton = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomListAddButton"),
		removeRoomButton = $("#ship-control-core_shipControlWindow_shipRoomsTab_roomListRemoveButton"),
		addDeckButton = $("#ship-control-core_shipControlWindow_shipRoomsTab_deckListAddButton"),
		removeDeckButton = $("#ship-control-core_shipControlWindow_shipRoomsTab_deckListRemoveButton");

		//init calls
		init();
		drawGUI();

		//Interstellar calls
		thisWidget.onResize = function(){
			drawGUI();
		}

		//functions

		function init(){

		}

		function drawGUI(){
			crewCountTextbox.css("font-size",crewCountTextbox.height() * .8);
			if(widgetElement.width() < 126){
				crewCountTextbox.css("width","calc(100% - 53px)");
				crewCountDownArrow.css("right","calc(100% - 36px)");
				crewCountLabel.html("LC");
				layoutButton.html("Layout");
				shipButton.html("Ship");
			}else{
				crewCountTextbox.css("width","calc(100% - 106px)");
				crewCountDownArrow.css("right","calc(100% - 91px)");
				crewCountLabel.html("Life Count");
				layoutButton.html("Edit Layout");
				shipButton.html("Edit Ship");
			}
			crewCountTextbox.val(numberWithCommas(lifeformCount));
		}

		function numberWithCommas(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		function drawWindowGUI(){
			var html = "";
			for(var i = 0;i < rooms.length;i++){
				var style = "'top:" + (16 * i) + "px'";
				var extraClasses = "";
				if(deleteDeckMode){
					extraClasses = "ship-control-core_shipControlWindow_deleteMode";
				}
				html += "<div class='ship-control-core_shipControlWindow_shipRoomsTab_ListClass ship-control-core_deckItem " + extraClasses + "' style=" + style + " index='" + i + "'>";
				html += "Deck " + (i + 1);
				html += "</div>";
			}
			deckList.html(html);
			if(selectedDeck == -1){
				roomsList.html("");
			}else{
				html = "";
				for(var i = 0;i < rooms[selectedDeck].length;i++){
					var style = "'top:" + (16 * i) + "px'";
					var extraClasses = "";
					if(deleteRoomMode){
						extraClasses = "ship-control-core_shipControlWindow_deleteMode";
					}
					html += "<div class='ship-control-core_shipControlWindow_shipRoomsTab_ListClass ship-control-core_roomItem " + extraClasses + "' style=" + style + " index='" + i + "'>";
					html += rooms[selectedDeck][i].name;
					html += "</div>";
				}
				roomsList.html(html);
			}

			roomNameTextbox.val("");
			roomDeckSelect.html("");
			securitySelect.html("");
			descriptionTextarea.val("");

			if(selectedRoom != -1){
				roomNameTextbox.val(rooms[selectedDeck][selectedRoom].name);
				for(var i = 0;i < rooms.length;i++){
					roomDeckSelect.append("<option>Deck " + (i + 1) + "</option>");
				}
				securitySelect.append("<option>Open Access</option>");
				for(var i = 0;i < 10;i++){
					securitySelect.append("<option>Level " + (i + 1) + " and up</option>");
				}
				roomDeckSelect.val("Deck " + Number((selectedDeck + 1)));
				if(rooms[selectedDeck][selectedRoom].security == 0){
					securitySelect.val("Open Access");
				}else{
					securitySelect.val("Level " + rooms[selectedDeck][selectedRoom].security + " and up");
				}
				descriptionTextarea.val(rooms[selectedDeck][selectedRoom].description);
			}

			$(".ship-control-core_deckItem").off();
			$(".ship-control-core_roomItem").off();
			$(".ship-control-core_deckItem").click(function(event){

				if(deleteDeckMode){
					rooms.splice(Number($(event.target).attr("index")),1);
					selectedDeck = -1;
					selectedRoom = -1;
					Interstellar.setDatabaseValue("ship.rooms",rooms);
				}else{
					selectedDeck = Number($(event.target).attr("index"));
					selectedRoom = -1;
				}
				drawWindowGUI();
			});
			$(".ship-control-core_roomItem").click(function(event){
				if(deleteRoomMode){
					rooms[selectedDeck].splice($(event.target).attr("index"),1);
					selectedRoom = -1;
				}else{
					selectedRoom = $(event.target).attr("index");
				}
				drawWindowGUI();
			});
		}

		//preset observers

		//database observers
		Interstellar.onDatabaseValueChange("ship.lifeformCount",function(newData){
			if(newData == null){
				Interstellar.setDatabaseValue("ship.lifeformCount",lifeformCount);
				return;
			}
			lifeformCount = newData;
			drawGUI();
		});

		/* Rooms object:

			name : "Bridge",
			security : 1, (int, 1-10, 10 being highest security)
			alarms :
			{
				"fire" : false,
				"intruder" : false
			}
			evacuated : false,
			description : ""
			*/
			Interstellar.onDatabaseValueChange("ship.rooms",function(newData){
				if(newData == null){
					Interstellar.setDatabaseValue("ship.rooms",presets.rooms);
					return;
				}
				rooms = newData;
				roomsBackup = newData;
				drawWindowGUI();
			});
		//event handlers
		crewCountTextbox.change(function(event){
			Interstellar.setDatabaseValue("ship.lifeformCount",Number(crewCountTextbox.val().replace(/[^\d.-]/g, '')));
		});
		crewCountUpArrow.click(function(event){
			Interstellar.setDatabaseValue("ship.lifeformCount",lifeformCount + 1);
		});
		crewCountDownArrow.click(function(event){
			Interstellar.setDatabaseValue("ship.lifeformCount",lifeformCount - 1);
		});
		shipButton.click(function(event){
			Interstellar.openCoreWindow("ship-control-core_shipControlWindow",event);
		});
		roomNameTextbox.change(function(event){
			rooms[selectedDeck][selectedRoom].name = $(event.target).val();
			drawWindowGUI();
		});
		roomDeckSelect.change(function(event){
			var room = rooms[selectedDeck][selectedRoom];
			var newDeck = Number(roomDeckSelect.val().replace(/[^\d.-]/g, '')) - 1;
			rooms[selectedDeck].splice(selectedRoom, 1);
			rooms[newDeck].splice(rooms[newDeck].length,0,room);
			selectedRoom = -1;
			drawWindowGUI();
		});
		securitySelect.change(function(event){
			var newSecurity = Number(securitySelect.val().replace(/[^\d.-]/g, ''));
			if(securitySelect == ""){
				newSecurity = 0;
			}
			rooms[selectedDeck][selectedRoom].security = newSecurity;
		});
		descriptionTextarea.change(function(event){
			rooms[selectedDeck][selectedRoom].description = $(event.target).val();
		});
		saveShipRoomsButton.click(function(event){
			Interstellar.setDatabaseValue("ship.rooms",rooms);
		});
		cancelShipRoomsButton.click(function(event){
			rooms = roomsBackup;
			selectedDeck = -1;
			selectedRoom = -1;
			drawWindowGUI();
		});
		addRoomButton.click(function(event){
			if(selectedDeck == -1){
				return;
			}
			var newRoom = {
				"name" : "New Room",
				"security" : 0,
				"description" : "",
				"alarms" :
				{
					"fire" : false,
					"intruder" : false
				},
				"lifeSupport" : 
				{
					"oxygen" : .78,
					"oxygen" : .2,
					"argon" : .009,
					"CO2" : .003,
					"humidity" : .45,
					"temperature" : 69,
					"gravity" : 1
				}
			}
			rooms[selectedDeck].splice(rooms[selectedDeck].length,0,newRoom);
			drawWindowGUI();
		});

		removeRoomButton.click(function(event){
			deleteRoomMode = !deleteRoomMode;
			drawWindowGUI();
		});
		removeDeckButton.click(function(event){
			deleteDeckMode = !deleteDeckMode;
			drawWindowGUI();
		});
		addDeckButton.click(function(event){
			rooms.splice(rooms.length,0,[]);
			Interstellar.setDatabaseValue("ship.rooms",rooms);
		});
	});
});