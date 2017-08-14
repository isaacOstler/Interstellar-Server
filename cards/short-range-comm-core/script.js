var shorRangeCommunicationsCoreHasInit = false;
Interstellar.addCoreWidget("Short Range Comm",function(){

	if(shorRangeCommunicationsCoreHasInit){
		return; //make sure we don't initilize this code more than once
	}
	shorRangeCommunicationsCoreHasInit = true;

	var thisWidget = this;

	//variables
	var hailTypes = [],
		hailTypeDefaults =
		[
			{
				"channelName" : "Dominion",
				"picture" : "dominionLogo.png",
				"top" : 0,
				"bottom" : 0.1
			},
			{
				"channelName" : "Starfleet",
				"picture" : "federationLogo.png",
				"top" : 0.1,
				"bottom" : 0.25
			},
			{
				"channelName" : "General Use",
				"picture" : "anonLogo.png",
				"top" : 0.25,
				"bottom" : 0.45
			},
			{
				"channelName" : "Klingon",
				"picture" : "klingonLogo.png",
				"top" : 0.45,
				"bottom" : 0.6
			},
			{
				"channelName" : "Romulan",
				"picture" : "romulanLogo.png",
				"top" : 0.6,
				"bottom" : 0.75
			},
			{
				"channelName" : "Cardassian",
				"picture" : "cardassianLogo.png",
				"top" : 0.75,
				"bottom" : 0.9
			},
			{
				"channelName" : "Ferengi",
				"picture" : "ferengiLogo.png",
				"top" : 0.9,
				"bottom" : 1
			}
		],
		incomingHails = [], //keep in mind this is in reference to the crew, so incoming is outgoing for core
		outgoingHail = "none",
		quickHailFrequency = null;

	//DOM References
	var thisWidgetElement = $("#short-range-comm-Core-Widget"),
		editGear = $("#short-range-comm-core_editGear"),
		incomingHailList = $("#short-range-comm-core_currentHails"),
		incomingHailButtons = $("#short-range-comm-core_incomingHailButtons"),
		incomingHailButtons_hailTypeTextbox = $("#short-range-comm-core_incomingHailButtons_hailTypeTextbox"),
		incomingHailButtons_acceptButton = $("#short-range-comm-core_incomingHailButtons_acceptButton"),
		incomingHailButtons_rejectButton = $("#short-range-comm-core_incomingHailButtons_rejectButton"),
		createHailDropdownSelect = $("#short-range-comm-core_hailControlContainer_hailSelectDropdown"),
		createNewHailButton = $("#short-range-comm-core_hailControlContainer_hailButton"),
		createQuickHailButton = $("#short-range-comm-core_hailControlContainer_quickHailButton");

	//init calls

	//interstellar calls
	thisWidget.onResize = function(){

	}

	//functions

	function drawPossibleHailTypes(){
		var html = "";
		for(var i = 0;i < hailTypes.length;i++){
			html += "<option>";
			html += hailTypes[i].channelName.toUpperCase() + " FREQUENCY";
			html += "</option>";
		}
		createHailDropdownSelect.html(html);
	}

	function drawHailList(){
		var html = "";
		for(var i = 0;i < incomingHails.length;i++){
			var channelName = "STARFLEET FREQUENCY";
			var adjustedFrequency = incomingHails[i].frequency / .2;

			for(var j = 0; j < hailTypes.length;j++){
				if(adjustedFrequency > hailTypes[j].top && adjustedFrequency < hailTypes[j].bottom){
					channelName = hailTypes[j].channelName + " frequency";
					channelName = channelName.toUpperCase();
				}
			}
			var backgroundColorStyle = "";
			if(incomingHails[i].isConnected){
				backgroundColorStyle = "background-color:lime;";
			}
            html += "<div index='" + i + "' class='short-range-comm-core_currentHails_hailItem' style='" + (i * 16) + "px;" + backgroundColorStyle + "'>";
            html += "<div class='short-range-comm-core_currentHails_hailItem_label'>"
            html += channelName;
            html += "</div>"
            //html += "<div class='short-range-comm-core_currentHails_hailItem_delete' index='" + i + "'>"
            html += "<svg class='short-range-comm-core_currentHails_hailItem_delete' index='" + i + "' fill='#FFFFFF' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path index='" + i + "' d='M0 0h24v24H0V0z' fill='none'/><path index='" + i + "' d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z'/><path index='" + i + "' d='M0 0h24v24H0z' fill='none'/></svg>";
            //html += "</div>";
            html += "</div>";
		}
		incomingHailList.html(html);
		$(".short-range-comm-core_currentHails_hailItem_delete").click(function(event){
			var index = Number($(event.target).attr("index"));
			console.log($(event.target).attr("index"));
			var newArray = [];
			for(var i = 0;i < incomingHails.length;i++){
				if(i != index){
					newArray.splice(newArray.length,0,incomingHails[i]);
				}
			}
			Interstellar.setDatabaseValue("shortRangeComm.incomingHails",newArray);
		});
	}

	//preset observers
	Interstellar.onPresetValueChange("shortRangeComm.channelPresets",function(presetValue){
		if(presetValue == null){
			Interstellar.setPresetValue("shortRangeComm.channelPresets",hailTypeDefaults);
			return;
		}
		hailTypes = presetValue;
		drawPossibleHailTypes();
		Interstellar.setDatabaseValue("shortRangeComm.hailChannels",hailTypes);
	});
	Interstellar.onPresetValueChange("shortRangeComm.quickHailFrequency",function(presetValue){
		if(presetValue == null){
			quickHailFrequency = null;
			createQuickHailButton.css("opacity",".5");
			createQuickHailButton.prop("disabled","disabled");
			return;
		}
		quickHailFrequency = presetValue;
		createQuickHailButton.css("opacity","1");
		createQuickHailButton.prop("disabled","");
	});
	//database observers
	
	Interstellar.onDatabaseValueChange("shortRangeComm.incomingHails",function(newData){
		if(newData == null){
			var incomingHailPresets = 
			[
				{
					"frequency" : Math.random() * .2,
					"amplitude" : Math.random() * .9,
					"phase" : 0,
					"isConnected" : false,
					"color" : "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",.7)"
				}
			]
			Interstellar.setDatabaseValue("shortRangeComm.incomingHails",incomingHailPresets);
			return;
		}
		incomingHails = newData;
		drawHailList();
	});

	Interstellar.onDatabaseValueChange("shortRangeComm.outgoingHail",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("shortRangeComm.outgoingHail","none");
			return;
		}
		outgoingHail = newData;
		if(outgoingHail == "none"){
			Interstellar.say("Outgoing hail canceled");
			incomingHailButtons.slideUp(500);
			incomingHailList.animate({height : thisWidgetElement.height() - 60},500);
		}else{
			var channelName = "",
				adjustedFrequency = outgoingHail.frequency / .2;
			for(var i = 0; i < hailTypes.length;i++){
				if(adjustedFrequency > hailTypes[i].top && adjustedFrequency < hailTypes[i].bottom){
					channelName = hailTypes[i].channelName + " frequency";
					channelName = channelName.toUpperCase();
				}
			}
			incomingHailButtons_hailTypeTextbox.val(channelName);
			incomingHailList.animate({height : thisWidgetElement.height() - 100},500,function(){
				incomingHailButtons.slideDown(500);
			});
			if(outgoingHail.isConnected){
				incomingHailButtons_acceptButton.fadeOut(500);
				incomingHailButtons_rejectButton.val("DISCONNECT")
				incomingHailButtons_rejectButton.animate({width : thisWidgetElement.width() - 4},500);
				Interstellar.say("Line Connected");
			}else{
				incomingHailButtons_acceptButton.fadeIn(500);
				incomingHailButtons_rejectButton.val("REJECT");
				incomingHailButtons_rejectButton.animate({width : (thisWidgetElement.width() * .5) - 1},500);
				Interstellar.say("Incoming hail,  " + channelName);
			}
		}
	});
	//event handlers
	incomingHailButtons_acceptButton.click(function(event){
		if(outgoingHail == "none"){
			return; //error checking
		}
		outgoingHail.isConnected = true;
		Interstellar.setDatabaseValue("shortRangeComm.outgoingHail",outgoingHail);
	});

	incomingHailButtons_rejectButton.click(function(event){
		if(outgoingHail == "none"){
			return; //error checking
		}
		outgoingHail = "none";
		Interstellar.setDatabaseValue("shortRangeComm.outgoingHail",outgoingHail);
	});
});