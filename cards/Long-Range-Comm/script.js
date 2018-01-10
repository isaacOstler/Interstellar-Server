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
	recievedMessageContainer = $("#messageDecoder_message");
//variables
var messages = [
		{
			"messageGUID" : uuidv4(),
			"timeRecieved" : new Date(),
			"decodeTime" : new Date("Wed Jan 10 2018 13:20:15 GMT-0700 (MST)"),
			"reportedToCommand" : false,
			"decoded" : false,
			"downloadProgress" : Math.random(),
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "romulan frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		},
		{
			"messageGUID" : uuidv4(),
			"timeRecieved" : new Date(),
			"timeDecoded" : new Date(),
			"reportedToCommand" : false,
			"decoded" : false,
			"downloadProgress" : Math.random(),
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "romulan frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		},
		{
			"messageGUID" : uuidv4(),
			"timeRecieved" : new Date(),
			"timeDecoded" : new Date(),
			"reportedToCommand" : false,
			"decoded" : false,
			"downloadProgress" : Math.random(),
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "romulan frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		},
		{
			"messageGUID" : uuidv4(),
			"timeRecieved" : new Date(),
			"timeDecoded" : new Date(),
			"reportedToCommand" : false,
			"decoded" : false,
			"downloadProgress" : Math.random(),
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "romulan frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		},
		{
			"messageGUID" : uuidv4(),
			"timeRecieved" : new Date(),
			"timeDecoded" : new Date(),
			"reportedToCommand" : false,
			"decoded" : false,
			"downloadProgress" : Math.random(),
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "romulan frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		}
	],
	frequencies = [],
	selectedMessage = undefined;
//class instances
var encrpyt = new Encryption();

//init calls

//preset observers

//database observers
Interstellar.onDatabaseValueChange("longRangeComm.messages",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("longRangeComm.messages",messages);
		return;
	}
	messages = newData;
	drawMessageList(newData);
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
		loadMessageWithGUID($(event.target).attr("guid"));
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
	recievedMessage_Textarea.html(message.text);
	if(message.decoded && message.timeDecoded != undefined){
		recievedMessage_hasBeenReportedLabel.fadeIn();
		recievedMessage_reportButton.fadeIn();
		recievedMessage_messageDecodedAtLabel.html("DECODED AT: " + toMilitaryTime(message.timeDecoded));
		var timeDifference = new Date(message.timeDecoded) - new Date(message.timeRecieved);
		var msec = timeDifference;
		var hh = Math.floor(msec / 1000 / 60 / 60);
		msec -= hh * 1000 * 60 * 60;
		var mm = Math.floor(msec / 1000 / 60);

		var style = "<span color='green'>";
		if(hh > 0 || mm > 7){
			style = "<span color='red'>"
		}else if(mm > 4){
			style = "<span color='yellow'>"
		}

		recievedMessage_timeToDecodeLabel.html("TIME TO DECODE: " + style + formatTo2Digits(String(hh)) + ":" + formatTo2Digits(String(mm)) + "</span>");
	}else{
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

//event handlers

//intervals