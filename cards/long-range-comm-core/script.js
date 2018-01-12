Interstellar.addCoreWidget("Long Range Comm",function(){
	//class instances

	var encrpyt = new Encryption();

	//DOM references
	var coreToCrew_messageList = $("#lrmCore_coreToCrewMessages"),
		crewToCore_messageList = $("#lrmCore_crewToCoreMessages"),
		crewMessageView_container = $("#lrmCore_crewToCoreMessageBox_body"),
		fromTextbox = $("#lrmCore_sendMessageControls_fromTextbox"),
		keyTextbox = $("#lrmCore_sendMessageControls_keyTextbox"),
		frequencySelect = $("#lrmCore_sendMessageControls_frequencySelect");

	//variables
	var frequencies = [],
		messages = [		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			},		
			{
				"messageGUID" : uuidv4(),
				"timeRecieved" : new Date(),
				"timeDecoded" : new Date(),
				"reportedToCommand" : false,
				"decoded" : false,
				"downloadProgress" : 0,
				"sentByCore" : Math.random() > .5 ? true : false, //control room sent this message, not the crew
				"wasReceived" : false, //has the crew received this message yet? (not possible when the system is damaged)
				"frequency" : "federation frequency",
				"from" : "STARFLEET COMMAND",
				"key" : "ZULU-TANGO-32",
				"text" : encrpyt.encode("some important text\n\nTesting 123\n\nThis is a test","ZULU-TANGO-32")
			}
		],
		presetMessages = [],
		presetKeys = [],
		systemIsDamaged = false,
		neverDrawn = true,
		systemHasNoPower = false;
	/*
		
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

	*/
	//init calls

	//preset observers

	//database observers

	Interstellar.onDatabaseValueChange("longRangeComm.messages",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("longRangeComm.messages",messages);
			return;
		}
		updateMessageLists(newData,(messages.length != newData.length) || neverDrawn);
		neverDrawn = false;
		messages = newData;
	});
	Interstellar.onDatabaseValueChange("longRangeAntenna.frequencies",function(newData){
		if(newData == null){
			//we don't set this (long-range-antenna-core does)
			return;
		}
		frequencies = newData;
	});
	//functions
	function updateMessageLists(messagesToDraw,redraw){
		if(!redraw){
			$(".lrmCore_message").each(function( index, element ) {
				var guid = String($(element).attr("guid"));
				for (var i = messagesToDraw.length - 1; i >= 0; i--) {
					//go backwards, it's probably faster
					if(messagesToDraw[i].messageGUID == guid){
						//found it
						if(messagesToDraw[i].sentByCore){
							if(messagesToDraw[i].wasReceived){
								if(messagesToDraw[i].downloadProgress < 1){
									$(element).css("background-color","rgba(0,128,255,.5)");
								}else if(!messagesToDraw[i].decoded){
									$(element).css("background-color","rgba(255,0,0,.5)");
								}else if(!messagesToDraw[i].reportedToCommand){
									$(element).css("background-color","rgba(255,255,0,.5)");
								}else{
									$(element).css("background-color","rgba(255,255,255,.2)");
								}
							}else{
								$(element).css("background-color","rgba(255,0,255,.5)");
							}
						}else if(messagesToDraw[i].downloadProgress < 1){
							$(element).css("background-color","rgba(0,128,255,.5)");
						}else{
							$(element).css("background-color","rgba(255,255,255,.2)");
						}
						break;
					}
				}
			});
		}else{
			var html_crewMessages = "",
			html_coreMessages = "";

			for(var i = messagesToDraw.length - 1;i >= 0;i--){
				//sort backwords, so the oldest messages come first
				var style = "style='background-color:rgba(255,0,0,.5)'";
				if(messagesToDraw[i].sentByCore){
					if(messagesToDraw[i].wasReceived){
						if(messagesToDraw[i].downloadProgress < 1){
							style = "style='background-color:rgba(0,128,255,.5)'";
						}else if(!messagesToDraw[i].decoded){
							style = "style='background-color:rgba(255,0,255,.5)'";
						}else if(!messagesToDraw[i].reportedToCommand){
							style = "style='background-color:rgba(255,255,0,.5)'";
						}else{
							style = "style='background-color:rgba(255,255,255,.2)'";
						}
					}
					var guid = messagesToDraw[i].messageGUID;
					html_crewMessages += '<div guid="' + guid + '" ' + style + ' class="lrmCore_message">';
					html_crewMessages += '<div guid="' + guid + '" class="lrmCore_message_from">' + messagesToDraw[i].from.toUpperCase() + '</div>';
					html_crewMessages += '<div guid="' + guid + '" class="lrmCore_message_time">' + toMilitaryTime(messagesToDraw[i].timeRecieved) + '</div>';
					html_crewMessages += '</div>';
				}else{
					if(messagesToDraw[i].downloadProgress < 1){
						style = "style='background-color:rgba(0,128,255,.5)'";
					}else{
						style = "style='background-color:rgba(255,255,255,.2)'";
					}
					var guid = messagesToDraw[i].messageGUID;
					html_coreMessages += '<div guid="' + guid + '" ' + style + ' class="lrmCore_message">';
					html_coreMessages += '<div guid="' + guid + '" class="lrmCore_message_from">' + messagesToDraw[i].from.toUpperCase() + '</div>';
					html_coreMessages += '<div guid="' + guid + '" class="lrmCore_message_time">' + toMilitaryTime(messagesToDraw[i].timeRecieved) + '</div>';
					html_coreMessages += '</div>';
				}
			}
			crewToCore_messageList.html(html_coreMessages);
			coreToCrew_messageList.html(html_crewMessages);
			$(".lrmCore_message").off();
			$(".lrmCore_message").click(function(event){
				var guid = String($(event.target).attr("guid"));
				for (var i = messages.length - 1; i >= 0; i--) {
					//go backwards, it's probably faster
					if(messages[i].messageGUID == guid){
						if(messages[i].sentByCore){
							//core message
							loadCoreMessageAtIndex(i);
						}else{
							//crew message
							loadCrewMessageAtIndex(i);
						}
						break;
					}
				}
			});
		}
	}

	function loadCoreMessageAtIndex(index){

	}

	function loadCrewMessageAtIndex(index){
		var text = "KEY: " + (messages[index].key != "" ? messages[index].key : "<span color='red'>NO KEY</span>");
		text += "\nSENT AT: " + toMilitaryTime(messages[index].timeRecieved) + "\n";
		text += "FREQUENCY: " + messages[index].frequency;
		text += "\n\nTO: <b>" + messages[index].from + "</b>\n";
		text += "\n" + encrpyt.decode(messages[index].text,messages[index].key.toUpperCase());
		crewMessageView_container.html(text.replace(/\n/g, "<br />"));
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

	function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
	  });
	}

	//event handlers

	sendMessageButton.click(function(event){

	});

	//intervals

	//This should actually be on the long-range-antenna widget, but that hadn't be made by the time i was working on this
	setInterval(function(){
		if(systemIsDamaged || systemHasNoPower){
			return;
		}
		var detectedChange = false;
		for(var i = 0;i < messages.length;i++){
			if(!messages[i].wasReceived){
				messages[i].wasReceived = true;
				detectedChange = true;
			}
			if(messages[i].downloadProgress < 1){
				var progressAmountPerFrequency = .00;
				for(var j = 0;j < frequencies.length;j++){
					if(!frequencies[j].isDamaged && frequencies[j].systemName.toLowerCase() == messages[i].frequency.toLowerCase()){
						progressAmountPerFrequency = (frequencies[j].systemPower / 4) / 1000;
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
});