var messagingCoreHasInit = false;
Interstellar.addCoreWidget("Messaging",function(){
	if(messagingCoreHasInit){
		return;
	}
	messagingCoreHasInit = true;
	var thisWidget = this;


	//DOM References
	var channelsList = $("#messagingCore_channelsList"),
		textarea = $("#messagingCore_messageTextarea"),
		sendButton = $("#messagingCore_sendMessageButton"),
		fromInput = $("#messagingCore_fromTextbox"),
		presetMissionSelect = $("#messagingCore_channels_presetsContainer_missionSelect"),
		presetSelect = $("#messagingCore_channels_presetsContainer_presetSelect"),
		nextPresetButton = $("#messagingCore_channels_presetsContainer_nextButton"),
		editPresetButton = $("#messagingCore_channels_presetsContainer_editButton"),
		messageList = $("#messagingCore_channels_messageContainer");

	//variables
	var channels = [
		{
			"channelName" : "DAMAGE CONTROL",
			"channelGUID" : guidGenerator(),
			"availableTo" : ["DAMAGE CONTROL"],
			"messages" : []
		},
		{
			"channelName" : "SECURITY",
			"channelGUID" : guidGenerator(),
			"availableTo" : ["SECURITY TEAMS","SECURITY MONITORING","SECURITY DISPATCH","SECURITY SCANS","INTERNAL SCANS","INTERNAL SENSORS","SECURITY TRACKING","SECURITY"],
			"messages" : []
		},
		{
			"channelName" : "BRIDGE",
			"channelGUID" : guidGenerator(),
			"availableTo" : [null],
			"messages" : []
		}
	],
	senders = 
	[
		{ //0
			"name" : "SECURITY CONTROL",
			"type" : "control groups",
			"prefix" : "<span style='color:yellow'>(SECURITY STATION)</span>",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //1
			"name" : "DAMAGE CONTROL",
			"type" : "control groups",
			"prefix" : "<span style='color:red'>(DAMAGE STATION)</span>",
			"color" : "rgba(255,100,0,.1)"
		},
		{ //2
			"name" : "MEDICAL CONTROL",
			"type" : "control groups",
			"prefix" : "<span style='color:blue'>(MEDICAL STATION)</span>",
			"color" : "rgba(0,100,255,.1)"
		},
		{ //3
			"name" : "SECURITY STATION, DECK 11",
			"type" : "locations",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //4
			"name" : "PRIMARY BRIG, DECK 11",
			"type" : "locations",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //5
			"name" : "DAMAGE CONTROL STATION, DECK 12",
			"type" : "locations",
			"prefix" : "",
			"color" : "rgba(255,130,0,.1)"
		},
		{ //6
			"name" : "SICKBAY ALPHA, DECK 5",
			"type" : "locations",
			"prefix" : "",
			"color" : "rgba(0,150,255,.1)"
		},
		{ //7
			"name" : "ENSIGN CALDWELL",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //8
			"name" : "ENSIGN BUSK",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //9
			"name" : "ENSIGN OSTLER",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //10
			"name" : "ENSIGN BAIRD",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //11
			"name" : "ENSIGN DEBIRK",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //12
			"name" : "ENSIGN PAUL",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //12
			"name" : "ENSIGN HATCH",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //12
			"name" : "ENSIGN TEER",
			"type" : "officers",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		},
		{ //12
			"name" : "ADMIRAL WILLIAMSON",
			"type" : "legends",
			"prefix" : "",
			"color" : "rgba(255,200,0,.1)"
		}
	],
	messagePresets = [
		{
			"missionName" : "ISAAC PRESETS",
			"presets" :
			[
				{
					"name" : "startup",
					"preset" : "foo foo foo"
				},
				{
					"name" : "startup1",
					"preset" : "foo foo foo2"
				},
				{
					"name" : "startup2",
					"preset" : "foo foo foo3"
				},
				{
					"name" : "startup3",
					"preset" : "foo foo foo4"
				},
				{
					"name" : "startup4",
					"preset" : "foo foo foo5"
				},
				{
					"name" : "startup5",
					"preset" : "foo foo foo6"
				}
			]
		}
	],
	selectedPreset = 0,
	selectedChannel = 0,
	lockScroll = true;

	//init calls
	drawChannels();
	listLocations();
	listPresets();
	//interstellar calls
	thisWidget.onResize = function(){
		//do nothing
	}
	
	//preset observers

	//database observers
	
	Interstellar.onDatabaseValueChange("messaging.channels",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("messaging.channels",channels);
			return;
		}
		channels = newData;
		updateChannels();
		drawMessagesForChannel(selectedChannel);
	});

	//functions
    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
       };
       return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function listPresets(){
    	var html = "<optgroup label='MISSION'>",
    		i;
    	for(i = 0;i < messagePresets.length;i++){
    		html += "<option value='" + i + "'>" + messagePresets[i].missionName + "</option>";
    	}
    	html += "</optgroup>";
    	presetMissionSelect.html(html);
    	html = "<optgroup label='PRESET'>";
    	for(i = 0;i < messagePresets[selectedPreset].presets.length;i++){
    		html += "<option value='" + i + "'>" + messagePresets[selectedPreset].presets[i].name + "</option>";
    	}
    	html += "</optgroup>";
    	presetSelect.html(html);
    	presetMissionSelect.val(selectedPreset);
    }

    function drawChannels(){
    	var html = "";
		for(i = 0;i < channels.length;i++){
			html += "<div class='messagingCore_channels_channel' index='" + i + "' messaging_channelSelector_GUID='" + channels[i].channelGUID + "'>";
			html += channels[i].channelName.toUpperCase();
			html += "</div>";
		}
		channelsList.html(html);
		updateChannels();
		$(".messagingCore_channels_channel").off();
		$(".messagingCore_channels_channel").click(function(event){
			var index = Number($(event.target).attr("index"));
			selectedChannel = index;
			drawMessagesForChannel(selectedChannel);
		});
    }

    messageList.on("scroll",function(event){
    	lockScroll = messageList.scrollHeight - messageList.clientHeight <= messageList.scrollTop + 1;
    	console.log(lockScroll);
    })

    function drawMessagesForChannel(channel){
    	var html = '';

    	for(var i = 0;i < channels[channel].messages.length;i++){
    		html += '<div class="messagingCore_channels_messageContainer_message" messageIndex="' + i + '" messageChannel="' + channel + '">';
    			html += '<div class="messagingCore_channels_messageContainer_message_from">';
    				html += channels[channel].messages[i].messageFrom;
    			html += '</div>';
    			html += '<div class="messagingCore_channels_messageContainer_message_message" contenteditable="true">';
    				html += channels[channel].messages[i].message;
    				html += "<span class='messagingCore_channels_messageContainer_message_message_timestamp noselect' contenteditable='false'>" + toMilitaryTime(channels[channel].messages[i].sentAt) + "</span>";
    			html += '</div>';
    		html += '</div>';
    	}
    	messageList.html(html);
		if(lockScroll){
	    	messageList.scrollTop = messageList.scrollHeight - messageList.clientHeight;
		}
    }

	function Comparator(a, b) {
   		if (a.type < b.type) return -1;
		if (a.type > b.type) return 1;
		return 0;
	}

    function listLocations(){
    	senders = senders.sort(Comparator);
    	var currentType = undefined,
    		html = "",
    		closeTag = false;
    	for(var i = 0;i < senders.length;i++){
    		if(senders[i].type != currentType){
    			if(currentType != undefined){
    				closeTag = true;
    			}
    			currentType = senders[i].type;
    			if(closeTag){
    				html += "</optgroup>";
    			}
    			html += "<optgroup label='" + currentType.toUpperCase() + "'>";
    		}
    		html += "<option value='" + i + "'>" + senders[i].name + "</option>";
    	}
    	html += "</optgroup>";
    	fromInput.html(html);
    }

	function toMilitaryTime(date){
		var compiledDate = new Date(date);
		return formatTo2Digits(String(compiledDate.getHours())) + ":" + formatTo2Digits(String(compiledDate.getMinutes()));
	}

	function formatTo2Digits(string){
		if(string.length == 1){
			return "0" + string;
		}
		return string;
	}

	function updateChannels(){
		var updateWillBeRequired = false;

		for(var i = 0;i < channels.length;i++){
			var newMessageOnChannel = false;
			for(var j = 0;j < channels[i].messages.length;j++){
				var newMessage = true;
				for(var k = 0;k < channels[i].messages[j].hasBeenReadBy.length;k++){
					if(channels[i].messages[j].hasBeenReadBy[k] == Interstellar.getStation()){
						newMessage = false;
					}
				}
				if(newMessage){
					newMessageOnChannel = true;
					if(selectedChannel == j){
						updateWillBeRequired = true;
						channels[i].messages[j].hasBeenReadBy.splice(channels[i].messages[j].hasBeenReadBy.length,0,Interstellar.getStation());
					}
				}
			}
			if(newMessageOnChannel){
				$("[messaging_channelSelector_GUID=" + channels[i].channelGUID + "]").css("backgroundColor","red");
				Interstellar.say("New message on " + channels[i].channelName + " channel");
			}else{
				$("[messaging_channelSelector_GUID=" + channels[i].channelGUID + "]").css("backgroundColor","");
			}
		}
		if(updateWillBeRequired){
			setTimeout(function(){
				Interstellar.setDatabaseValue("messaging.channels",channels);
			},0300);
		}
	}

	function createMessageOnChannel(channel,message,prefix,from,color){
		var newMessage = 
		{
			"messageFrom" : from != undefined ? from : Interstellar.getStation(),
			"prefix" : prefix != undefined ? prefix : "",
			"sentAt" : new Date(),
			"color" : color != undefined ? color : "rgba(255,255,255,.1)",
			"message" : message != undefined ? message : "? UNABLE TO FIND MESSAGE ?",
			"hasBeenReadBy" : [Interstellar.getStation()]
		}
		var newChannels = [];
		for(var i = 0;i < channels.length;i++){
			if(i == channel){
				channels[i].messages.splice(channels[i].messages.length,0,newMessage);
			}
			newChannels.splice(newChannels.length,0,channels[i]);
		}
		Interstellar.setDatabaseValue("messaging.channels",newChannels);
	}
	function sendMessage(){
		var sender = senders[Number(fromInput.val())];
		createMessageOnChannel(selectedChannel,textarea.val().replace(/\n/g, "<br />"),sender.prefix,sender.name,sender.color);
		textarea.val("");
	}
	//event handlers
	$(".messagingCore_channels_messageContainer_message_message").on("cut paste input",function(event){
		console.log($(event.target).html());
	});

	presetMissionSelect.on("input",function(event){
		selectedPreset = Number(event.target.value);
		listPresets();
	});

	presetSelect.on("input",function(event){
		textarea.val(messagePresets[selectedPreset].presets[Number(event.target.value)].preset);
	});

    textarea.keypress(function(e) {
    	if(e.which == 13 && e.shiftKey != true) {
    	    sendMessage();
    		e.preventDefault();
    	}
	});
	sendButton.mousedown(function(event){
		if(event.which == 3){
			textarea.val(textarea.val().toUpperCase());
			event.preventDefault();
		}else{
			sendMessage();
		}
	});
	nextPresetButton.click(function(event){
		presetSelect.val(presetSelect[0].selectedIndex + 1);
		textarea.val(messagePresets[selectedPreset].presets[presetSelect.val()].preset);
	});
});