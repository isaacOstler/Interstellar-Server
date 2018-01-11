//class instances
var encrpyt = new Encryption();

//DOM references
var messageListContainer = $("#messageList_listContainer"),
	sendMessageToLabel = $("#messageEncoder_messageHeader_toLabel"),
	sendMessageToTextarea = $("#messageEncoder_messageHeader_toTextbox"),
	sendMessageFrequencyLabel = $("#messageEncoder_messageHeader_frequencyLabel"),
	sendMessageFrequencySelect = $("#messageEncoder_messageHeader_frequencySelect"),
	encodeWithKeyLabel = $("#messageEncoder_messageHeader_keyLabel"),
	encodeWithKeyTextbox = $("#messageEncoder_messageHeader_keyTextbox"),
	messageEncoderTextarea = $("#messageEncoder_textarea"),
	sendMessageButton = $("#messageEncoder_messageEncoder_sendControls_sendMessageButton"),
	clearMessageButton = $("#messageEncoder_messageEncoder_sendControls_clearMessageButton"),
	printMessageButton = $("#printMessageButton"),
	printCodeButton = $("#printCodeButton");
	selectAMessageMask = $("#messageDecoder_selectAMessage"),
	recievedMessage_messageInfoFromLabel = $("#messageDecoder_message_info_sender"),
	recievedMessage_frequencyLabel = $("#messageDecoder_message_info_frequency"),
	recievedMessage_messageInfoTimeLabel = $("#messageDecoder_message_info_time"),
	recievedMessage_messageDecodedAtLabel = $("#messageDecoder_message_info_openedAt"),
	recievedMessage_timeToDecodeLabel = $("#messageDecoder_message_info_timeChute"),
	recievedMessage_Textarea = $("#messageDecoder_message_body_textArea"),
	recievedMessage_keyTextbox = $("#messageDecoder_message_body_keyTextbox"),
	recievedMessage_hasBeenReportedLabel = $("#messageDecoder_reported"),
	recievedMessage_reportButton = $("#messageDecoder_reportButton"),
	recievedMessageContainer = $("#messageDecoder_message")
	popupContainer = $("#messageHasNotDownloadedMask"),
	popupHeader = $(".popupMask_messageBox_messageTitle"),
	popupSubtitle = $(".popupMask_messageBox_messageSubTitle"),
	popupCloseButton = $("#messageHasNotDownloadedMask_popupMessage_close");
//variables
var messages = [],
	frequencies = [],
	selectedMessage = undefined;

//init calls

//preset observers

//database observers
Interstellar.onDatabaseValueChange("longRangeComm.messages",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("longRangeComm.messages",messages);
		return;
	}
	messages = newData;
	var messagesToCrew = [];
	for(var i = 0;i < messages.length;i++){
		if(messages[i].sentByCore){
			messagesToCrew.splice(messagesToCrew.length,0,messages[i]);
		}
	}
	drawMessageList(messagesToCrew);
});
Interstellar.onDatabaseValueChange("longRangeAntenna.frequencies",function(newData){
	if(newData == null){
		//we don't set this (core does)
		return;
	}
	frequencies = newData;
	var html = "";
	for(var i = 0;i < frequencies.length;i++){
		console.log(frequencies[i]);
		html += "<option>";
			html += frequencies[i].systemName.toUpperCase();
		html += "</option>";
	}
	sendMessageFrequencySelect.html(html);
});

//functions
function drawMessageList(messagesToDraw){
	var html = "";
	for(var i = 0;i < messagesToDraw.length;i++){
		var messageStatus = "";
		if(messagesToDraw[i].downloadProgress < 1){
			messageStatus = "downloadingMessage";
		}else if(!messagesToDraw[i].decoded){
			messageStatus = "newMessage";
		}
		html += '<div guid="' + messagesToDraw[i].messageGUID + '" class="message noselect ' + messageStatus + '">';
		html += '<div guid="' + messagesToDraw[i].messageGUID + '" class="message_from">' + messagesToDraw[i].from + '</div>';
		html += '<div guid="' + messagesToDraw[i].messageGUID + '" class="message_time">' + toMilitaryTime(messagesToDraw[i].timeRecieved) + '</div>';
		html += '</div>';
	}
	messageListContainer.html(html);
	$(".message").off();
	$(".message").click(function(event){
		Interstellar.playRandomBeep();
		for(var i = 0;i < messagesToDraw.length;i++){
			if(messagesToDraw[i].messageGUID == $(event.target).attr("guid")){
				if(messagesToDraw[i].downloadProgress >= 1){
					//this message has downloaded
					loadMessageWithGUID($(event.target).attr("guid"));
				}else{
					//this message hasn't downloaded yet!
					Interstellar.playErrorNoise();
					popupHeader.html("COULD NOT OPEN MESSAGE!");
					popupSubtitle.html("THIS MESSAGE IS STILL DOWNLOADING, CHECK THE LONG-RANGE-ANTENNA");
					popupContainer.fadeIn(300);
				}
			}
		}
	});
}

function formatTo2Digits(string){
	if(string.length == 1){
		return "0" + string;
	}
	return string;
}

function loadMessageWithGUID(guid){
	selectAMessageMask.fadeOut();
	recievedMessageContainer.fadeIn();
	var message = undefined;
	for(var i = 0;i < messages.length;i++){
		if(messages[i].messageGUID == guid){
			message = messages[i];
			selectedMessage = i;
			break;
		}
	}
	if(message == undefined){
		Throw(new Error("No message matches the guid of " + guid));
	}
	recievedMessage_messageInfoFromLabel.html("FROM: " + message.from.toUpperCase());
	recievedMessage_frequencyLabel.html("FREQUENCY: " + message.frequency.toUpperCase());
	recievedMessage_messageInfoTimeLabel.html("RECIEVED AT: " + toMilitaryTime(message.timeRecieved));
	if(message.decoded && message.timeDecoded != undefined){
		recievedMessage_keyTextbox.val(message.key);
		recievedMessage_hasBeenReportedLabel.fadeIn();
		if(message.reportedToCommand){
			recievedMessage_reportButton.fadeOut();
			recievedMessage_hasBeenReportedLabel.html("HAS BEEN REPORTED TO COMMANDING OFFICER: <span style='color:lime'>YES</span>");
		}else{
			recievedMessage_reportButton.fadeIn();
			recievedMessage_hasBeenReportedLabel.html("HAS BEEN REPORTED TO COMMANDING OFFICER: <span style='color:red'>NO</span>");
		}
		recievedMessage_messageDecodedAtLabel.html("DECODED AT: " + toMilitaryTime(message.timeDecoded));
		var timeDifference = new Date(message.timeDecoded) - new Date(message.timeRecieved);
		var msec = timeDifference;
		var hh = Math.floor(msec / 1000 / 60 / 60);
		msec -= hh * 1000 * 60 * 60;
		var mm = Math.floor(msec / 1000 / 60);

		var style = "<span style='color:lime'>";
		if(hh > 0 || mm > 7){
			style = "<span style='color:red'>"
		}else if(mm > 4){
			style = "<span style='color:yellow'>"
		}
		var decodedString = encrpyt.decode(message.text,message.key);
		recievedMessage_Textarea.html(decodedString.replace(/\n/g, "<br />"));
		recievedMessage_timeToDecodeLabel.html("TIME TO DECODE: " + style + formatTo2Digits(String(hh)) + ":" + formatTo2Digits(String(mm)) + "</span>");
	}else{
		recievedMessage_keyTextbox.val("");
		recievedMessage_Textarea.html(message.text.replace(/\n/g, "<br />"));
		recievedMessage_hasBeenReportedLabel.css("display" , "none");
		recievedMessage_reportButton.css("display" , "none");
		recievedMessage_messageDecodedAtLabel.html("DECODED AT: <span style='color:red'>NOT DECODED</div>");
		recievedMessage_timeToDecodeLabel.html("DECODED AT: <span style='color:red'>NOT DECODED</div>");
	}
}

function toMilitaryTime(date){
	var compiledDate = new Date(date);
	return formatTo2Digits(String(compiledDate.getHours())) + ":" + formatTo2Digits(String(compiledDate.getMinutes()));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function clearEncoder(){
	sendMessageToTextarea.val("");
	sendMessageFrequencySelect.val(frequencies[0].systemName);
	messageEncoderTextarea.val("");
	encodeWithKeyTextbox.val("");
	messageEncoderTextarea.css("background-color","");
	sendMessageToLabel.css("color","");
}

//event handlers
recievedMessage_keyTextbox.on("input",function(event){
	var key = event.target.value.toUpperCase(),
		messageText = messages[selectedMessage].text,
		decodedString = encrpyt.decode(messageText,key);

	recievedMessage_Textarea.html(decodedString.replace(/\n/g, "<br />"));
	if(key == messages[selectedMessage].key){
		messages[selectedMessage].decoded = true;
		messages[selectedMessage].timeDecoded = new Date();
		Interstellar.setDatabaseValue("longRangeComm.messages",messages);
		loadMessageWithGUID(messages[selectedMessage].messageGUID);
	}
});

recievedMessage_reportButton.click(function(event){
	if(selectedMessage != undefined){
		Interstellar.playRandomBeep();
		messages[selectedMessage].reportedToCommand = true;
		Interstellar.setDatabaseValue("longRangeComm.messages",messages);
		recievedMessage_reportButton.fadeOut();
		recievedMessage_hasBeenReportedLabel.html("HAS BEEN REPORTED TO COMMANDING OFFICER: <span style='color:lime'>YES</span>");
	}
});

sendMessageButton.click(function(event){
	var to = sendMessageToTextarea.val(),
		key = encodeWithKeyTextbox.val(),
		frequency = sendMessageFrequencySelect.val(),
		text = messageEncoderTextarea.val();

	if(to == ""){
		sendMessageToLabel.css("color","red");
		Interstellar.playErrorNoise();
		popupHeader.html("CANNOT SEND MESSAGE")
		popupSubtitle.html("THIS MESSAGE HAS NO DESTINATION, PLEASE SPECIFY ONE");
		popupContainer.fadeIn(100);
		return;
	}

	if(text == ""){
		messageEncoderTextarea.css("background-color","rgba(255,0,0,.2)");
		Interstellar.playErrorNoise();
		popupHeader.html("CANNOT SEND MESSAGE")
		popupSubtitle.html("NO MESSAGE HAS BEEN INPUTED, PLEASE ENTER ONE");
		popupContainer.fadeIn(100);
		return;
	}

	var newMessage =
	{
		"messageGUID" : uuidv4(),
		"timeRecieved" : new Date(),
		"timeDecoded" : new Date(),
		"reportedToCommand" : false,
		"decoded" : key != "" ? false : true,
		"downloadProgress" : 0,
		"sentByCore" : false, //control room sent this message, not the crew
		"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
		"frequency" : frequency.toLowerCase(),
		"from" : to.toLowerCase(),
		"key" : key.toUpperCase(),
		"text" : key != "" ? encrpyt.encode(text,key.toLowerCase()) : text
	}

	Interstellar.playRandomBeep();

	messages.splice(messages.length,0,newMessage);
	Interstellar.setDatabaseValue("longRangeComm.messages",messages);
	clearEncoder();
});

clearMessageButton.click(function(event){
	Interstellar.playRandomBeep();
	clearEncoder();
});

popupCloseButton.click(function(){
	Interstellar.playRandomBeep();
	popupContainer.fadeOut();
});

//intervals