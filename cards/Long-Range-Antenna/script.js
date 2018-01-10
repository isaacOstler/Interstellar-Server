//DOM references
var powerDistCanvas = $("#powerDist"),
	powerDistInfo = $("#powerDistInfo"),
	outgoingMessagesContainer = $("#outgoingMessages"),
	incomingMessagesContainer = $("#incomingMessages"),
	outgoingMessageList = $("#outgoingMessages_messageList"),
	incomingMessageList = $("#incomingMessages_messageList"),
	powerInUseLabel = $("#powerDistInfo_powerInUseLabel"),
	powerInUse = $("#powerDistInfo_powerInUse"),
	powerAvilableLabel = $("#powerDistInfo_totalPowerLabel"),
	powerAvilable = $("#powerDistInfo_totalPower"),
	powerDrawLabel = $("#powerDistInfo_powerDrawLabel"),
	powerDraw = $("#powerDistInfo_powerDraw");

//variables
var frequencies = [],
	systemPowerAvilable = 40,
	systemIsDamaged = false,
	systemHasNoPower = false,
	messages = [
		{
			"messageGUID" : uuidv4(),
			"timeSent" : new Date(),
			"downloadProgress" : 0,
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "federation frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		},
		{
			"messageGUID" : uuidv4(),
			"timeSent" : new Date(),
			"downloadProgress" : .6,
			"sentByCore" : false, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "federation frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "wubba wubba wub dub"
		},
		{
			"messageGUID" : uuidv4(),
			"timeSent" : new Date(),
			"downloadProgress" : .3,
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "federation frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : Math.PI
		},
		{
			"messageGUID" : uuidv4(),
			"timeSent" : new Date(),
			"downloadProgress" : 0,
			"sentByCore" : true, //control room sent this message, not the crew
			"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
			"frequency" : "federation frequency",
			"from" : "USS Washington",
			"key" : "key",
			"text" : "asdfasdffda"
		}
	];

/*

	Message object
	{
		"messageGUID" : guid,
		"timeSent" : Date Object,
		"downloadProgress" : .01,
		"sentByCore" : true, //control room sent this message, not the crew
		"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
		"frequency" : "Federation",
		"from" : "USS Washington",
		"key" : "key", (we won't use this, it's only for core to see)
		"text" : "asdfasdffda" (remember, this will probably be encoded)
	}

*/

//class instances

var frequencyPowerLevels = new PowerDistributionDisplay(powerDistCanvas,frequencies);

//init calls

//preset observers

//database observers

Interstellar.onDatabaseValueChange("ship.systems",function(newData){
	if(newData == null){
		return;
	}
	for(var i = 0;i < newData.length;i++){
		if(newData[i].systemName.toLowerCase() == "long range antenna"){
			systemPowerAvilable = Math.floor(newData[i].systemPower * 2.5);
			
			systemHasNoPower = systemPowerAvilable < newData[i].requiredPower[0];
			systemIsDamaged = newData[i].isDamaged;

			updateDamageState();
			listMessages();
			updatePower();
		}
	}
});

Interstellar.onDatabaseValueChange("longRangeComm.messages",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("longRangeComm.messages",messages);
		return;
	}
	messages = newData;
	listMessages();
});

Interstellar.onDatabaseValueChange("longRangeAntenna.frequencies",function(newData){
	if(newData == null){
		$.getJSON('/resource?path=public/frequencies.json', function(loadedJSON) {
		    Interstellar.setDatabaseValue("longRangeAntenna.frequencies",loadedJSON.frequencies);
		});
		return;
	}
	frequencies = newData;
	frequencyPowerLevels.setSystems(frequencies);
	updatePower();
});

//functions
function listMessages(){
	for(var i = 0;i < messages.length;i++){
		if(messages[i].sentByCore){
			//incoming message
			if(!messages[i].wasReceived && !systemIsDamaged){
				//message has not been received yet, let's put it in the in-box
				messages[i].wasReceived = true;
				//once it's received, it cannot be unreceived 
			}
		}
	}
	var ingoingHTML = '<div class="messageLabelBar"><div class="messageLabelBar_from">FROM</div><div class="messageLabelBar_frequency">FREQUENCY</div></div>',
		outgoingHTML = '<div class="messageLabelBar"><div class="messageLabelBar_from">TO</div><div class="messageLabelBar_frequency">FREQUENCY</div></div>';
	for(var i = 0;i < messages.length;i++){
		var html = "";
		if(messages[i].downloadProgress < 1){
			//message has not been downloaded yet
			html += '<div class="message">';
			html += '<div class="message_name">' + messages[i].from.toUpperCase() + '</div>';
			html += '<div class="message_frequency">' + messages[i].frequency.toUpperCase() + '</div>';
			html += '<div class="message_download"><div class="message_download_fill" style="width:' + (100 * messages[i].downloadProgress) + '%"></div><div class="message_download_progress">' + (100 * messages[i].downloadProgress) + '% Complete</div></div>'
			html += '</div>';
		}
		if(messages[i].sentByCore){
			if(messages[i].wasReceived){
				ingoingHTML += html;
			}
		}else{
			outgoingHTML += html;
		}
	}
	incomingMessageList.html(ingoingHTML);
	outgoingMessageList.html(outgoingHTML);
}

function updateDamageState(){
	if(systemHasNoPower){
		$(".noPower").fadeIn();
	}else{
		$(".noPower").fadeOut();
	}

	if(systemIsDamaged){
		$(".noPower").fadeOut();
		$(".damaged").fadeIn();
	}else{
		$(".damaged").fadeOut();
	}
}

function updatePower(){
	var totalPowerUsed = 0;
	for(var i = 0;i < frequencies.length;i++){
		totalPowerUsed += frequencies[i].systemPower;
	}
	powerInUse.html(totalPowerUsed);
	powerAvilable.html(systemPowerAvilable);
	powerDraw.html(totalPowerUsed - systemPowerAvilable);
	if(totalPowerUsed > systemPowerAvilable){
		powerInUse.css("color","red");
		powerAvilable.css("color","white");
		powerDraw.css("color","red");
	}else if(totalPowerUsed < systemPowerAvilable){
		powerInUse.css("color","white");
		powerAvilable.css("color","red");
		powerDraw.css("color","red");
	}else{
		//perfect!
		powerInUse.css("color","white");
		powerAvilable.css("color","white");
		powerDraw.css("color","lime");
	}
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

//event handlers

frequencyPowerLevels.on("dragStart",function(newFrequencies){
	frequencies = newFrequencies;
	updatePower();
});
frequencyPowerLevels.on("drag",function(newFrequencies){
	frequencies = newFrequencies;
	updatePower();
});

frequencyPowerLevels.on("dragFinish",function(newFrequencies){
	Interstellar.setDatabaseValue("longRangeAntenna.frequencies",newFrequencies);
});

//intervals

//CORE ONLY
setInterval(function(){
	var detectedChange = false;
	for(var i = 0;i < messages.length;i++){
		if(messages[i].downloadProgress < 1 && messages[i].wasReceived){
			var progressAmountPerFrequency = .00;
			for(var j = 0;j < frequencies.length;j++){
				if(!frequencies[i].isDamaged && frequencies[i].systemName == messages[i].systemName){
					progressAmountPerFrequency = frequencies[i].systemPower / 2;
				}
			}
			if(progressAmountPerFrequency != 0){
				detectedChange = true;
				messages[i].downloadProgress += progressAmountPerFrequency;
			}
		}
	}
	if(detectedChange){
		Interstellar.setDatabaseValue("longRangeComm.messages",messages);
	}
},1000 / 3);