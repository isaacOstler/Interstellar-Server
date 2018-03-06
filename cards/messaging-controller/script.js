var MC_CARD_CONTROLLER_CLASS = function(){
	//DOM references
	var htmlElement = $("#mc_card_controller_container"),
		header = $("#mc_card_controller_container_header"),
		textarea = $("#mc_card_controller_textarea"),
		messageArea = $("#mc_card_controller_container_messages"),
		channelSelect = $("#mc_card_controller_container_channelSelect"),
		sendButton = $("#mc_card_controller_sendButton");
	//variables
	var percentageToOpenTo = .35,
		percentageWidthToOpenTo = .70,
    	heightOfPage = $(document).height(),
    	widthOfPage = $(document).width(),
    	selectedChannel = 0,
    	channels = 
    	[
			{
				"channelName" : "SECURITY",
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
					},
					{
						"messageFrom" : Interstellar.getStation(),
						"prefix" : "",
						"sentAt" : new Date(),
						"color" : "rgba(255,200,0,.1)",
						"message" : "AT 1749",
						"hasBeenReadBy" : []
					}
				]
			}
		],
    	originalMessagingElementPosition = htmlElement.position().top,
    	redBackgroundClearTimeout = undefined;

    /*
		EXAMPLE OF THE MESSAGE ARRAY
		[
			{
				"channelName" : "SECURITY",
				"availableTo" : ["Test Station","Tactical","Communications"],
				"messages" : 
				[
					{
						"messageFrom" : "LOWDER, JAMES",
						"prefix" : "<span style='color:yellow'>(SECURITY OFFICER)</span>",
						"sentAt" : date object,
						"color" : red,
						"message" : "I'M CODE 4",
						"hasBeenReadBy" : []
					}
				]
			}
		]

    */

	//init calls

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

	function updateChannels(){
		var html = "";
		for(var i = 0;i < channels.length;i++){
			for(var j = 0;j < channels[i].availableTo.length;j++){
				console.log(channels[i].availableTo[j],Interstellar.getStation());
				if(channels[i].availableTo[j] == Interstellar.getStation()){
					html += "<option value='" + i + "'>" + channels[i].channelName + "</option>";
				}
			}
		}
		channelSelect.html(html);
		channelSelect.attr("value",channels[selectedChannel].channelName);
	}

	function createMessageOnChannel(channel,message,from,prefix,color){
		var newMessage = 
		{
			"messageFrom" : from != undefined ? from : Interstellar.getStation(),
			"prefix" : prefix != undefined ? prefix : "",
			"sentAt" : new Date(),
			"color" : color != undefined ? color : "rgba(255,255,255,.1)",
			"message" : message != undefined ? message : "? UNABLE TO FIND MESSAGE ?",
			"hasBeenReadBy" : []
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

	function updateMessagesForChannel(channel){
		var html = "",
			messageAreaDOM = document.getElementById(messageArea.attr("id")),
			requireNewMessageUpdate = false,
			lockScroll = messageAreaDOM.scrollHeight - messageAreaDOM.clientHeight <= messageAreaDOM.scrollTop + 1;
		for(var i = 0;i < channels[channel].messages.length;i++){
			var newMessage = true;
			for(var j = 0;j < channels[channel].messages[i].hasBeenReadBy.length;j++){
				if(channels[channel].messages[i].hasBeenReadBy[j] == Interstellar.getStation()){
					newMessage = false;
				}
			}
			html += '<div class="mc_card_controller_message" style="' + (newMessage ? "background-color:rgba(255,0,0,.3)" : ("background-color:" + channels[channel].messages[i].color)) + '">';
				html += '<div class="mc_card_controller_message_sender">';
					html += channels[channel].messages[i].messageFrom == Interstellar.getStation() ? "YOU" : channels[channel].messages[i].prefix + " " + channels[channel].messages[i].messageFrom;
				html += '</div>';
				html += '<div class="mc_card_controller_message_message">';
					html += channels[channel].messages[i].message;
				html += '</div>';
			html += '</div>';
			if(newMessage && lockScroll && htmlElement.position().top != originalMessagingElementPosition){
				channels[channel].messages[i].hasBeenReadBy.splice(channels[channel].messages[i].hasBeenReadBy.length,0,Interstellar.getStation());
				requireNewMessageUpdate = true;
			}
		}
		messageArea.html(html);
		if(requireNewMessageUpdate){
			setTimeout(function(){
				Interstellar.setDatabaseValue("messaging.channels",channels);
			},1000);
		}
		if(lockScroll){
	    	messageAreaDOM.scrollTop = messageAreaDOM.scrollHeight - messageAreaDOM.clientHeight;
		}
	}

	//event handlers

	textarea.scroll(function(event){
		var newMessageDetected = false,
			lockScroll = messageAreaDOM.scrollHeight - messageAreaDOM.clientHeight <= messageAreaDOM.scrollTop + 1;
		for(var i = 0;i < channels[channel].messages.length;i++){
			var newMessage = true;
			for(var j = 0;j < channels[channel].messages[i].hasBeenReadBy.length;j++){
				if(channels[channel].messages[i].hasBeenReadBy[j] == Interstellar.getStation()){
					newMessage = false;
				}
			}
			if(newMessage){
				newMessageDetected = true;
			}
		}
		if(newMessageDetected && lockScroll){
			updateMessagesForChannel(selectedChannel);
		}
	})

    header.click(function(){
    	htmlElement.stop();
    	if(htmlElement.position().top == originalMessagingElementPosition){
    		//open
    		htmlElement.animate({"top" : heightOfPage * percentageToOpenTo,"width" : widthOfPage * percentageWidthToOpenTo - 10},function(){
    			textarea.focus();
    			updateMessagesForChannel(selectedChannel);
    		});
    	}else{
    		//close
    		htmlElement.animate({"top" : originalMessagingElementPosition,"width" : widthOfPage * .25});
    	}
    });

    sendButton.click(function(event){
    	var newMessage = textarea.val();
    	if(redBackgroundClearTimeout != undefined){
    		clearTimeout(redBackgroundClearTimeout);
    		redBackgroundClearTimeout = undefined;
    	}
    	textarea.css("background-color","rgba(0,0,0,.8)");
    	if(newMessage == ""){
    		textarea.css("background-color","rgba(100,0,0,.8)");
    		redBackgroundClearTimeout = setTimeout(function(){
    			textarea.css("background-color","rgba(0,0,0,.8)");
    			redBackgroundClearTimeout = undefined;
    		},5000);

    		textarea.on("input.removeBackground",function(event){
    			textarea.css("background-color","rgba(0,0,0,.8)");
		    	if(redBackgroundClearTimeout != undefined){
		    		clearTimeout(redBackgroundClearTimeout);
		    		redBackgroundClearTimeout = undefined;
		    	}
    			textarea.off("input.removeBackground");
    		});
    		return;
    	}
    	createMessageOnChannel(selectedChannel,newMessage);
    	textarea.val("");
    });

    textarea.keypress(function(e) {
    	if(e.which == 13 && e.shiftKey != true) {
    	    sendButton.trigger("click");
    		textarea.val("");
    		e.preventDefault();
    	}
	});

	//intervals
}

var mcClassInstance = new MC_CARD_CONTROLLER_CLASS();