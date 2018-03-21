var messagingCoreHasInit = false;
Interstellar.addCoreWidget("Login Names",function(){
	if(messagingCoreHasInit){
		return;
	}
	messagingCoreHasInit = true;
	var thisWidget = this;

	//variables
	var channels = [
		{
			"channelName" : "DAMAGE CONTROL",
			"channelGUID" : guidGenerator(),
			"availableTo" : ["test station","Tactical","Communications"],
			"messages" : []
		},
		{
			"channelName" : "SECURITY",
			"channelGUID" : guidGenerator(),
			"availableTo" : ["test station","Tactical","Communications"],
			"messages" : 
			[
				{
					"messageFrom" : "LOWDER, JAMES",
					"prefix" : "<span style='color:yellow'>(SECURITY OFFICER)</span>",
					"sentAt" : new Date(),
					"color" : "rgba(255,200,0,.1)",
					"message" : "I'M CODE 4",
					"hasBeenReadBy" : []
				}
			]
		}
	],
	selectedChannel = 0;

	//DOM References
	var channelsList = $("#messagingCore_channelsList"),
		messageList = $("#messagingCore_channels_messageContainer");

	//init calls
	drawChannels();
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
		updateMessagesForChannel(selectedChannel);
	});

	//functions
    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
       };
       return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
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
		var newMessageDetected = false,
			channelsWithNewMessage = [],
			x = undefined;

		for(x = 0;x < channels.length;x++){
			for(i = 0;i < channels[x].messages.length;i++){
				var newMessage = true;
				for(var j = 0;j < channels[x].messages[i].hasBeenReadBy.length;j++){
					if(channels[x].messages[i].hasBeenReadBy[j] == Interstellar.getStation()){
						newMessage = false;
					}
				}
				if(newMessage){
					newMessageDetected = true;
					var detected = false;
					for(var b = 0;b < channelsWithNewMessage.length;b++){
						if(channelsWithNewMessage[b] == channels[x].channelName){
							detected = true;
						}
					}
					if(!detected){
						channelsWithNewMessage.splice(channelsWithNewMessage.length,0,channels[x].channelName);
						Interstellar.say("New Message On " + channels[x].channelName + " Channel");
						$("[messaging_channelSelector_GUID=" + channels[x].channelGUID + "]").css("backgroundColor","red");
					}
				}else{
					$("[messaging_channelSelector_GUID=" + channels[x].channelGUID + "]").css("backgroundColor","");
				}
			}
		}
	}
	//event handlers
	$(".messagingCore_channels_messageContainer_message_message").on("cut paste input",function(event){
		console.log($(event.target).html());
	});
});