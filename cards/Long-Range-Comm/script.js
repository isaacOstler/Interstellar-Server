var commMessages = [];
var cyphers = [];
var codeTypingInterval = undefined;
var selectedMessage = -1;
/* standard message:
	
	{
		"to" : "USS VOYAGER",
		"from" : "STARFLEET COMMAND",
		"cypher" : "AX-21",
		"hasBeenDecoded" : false,
		"priority" : 3,
		"message" : "Lorem Iplslamfajsdklfjaekwldnvskdf"
	}

	*/

	Interstellar.onDatabaseValueChange("communications.longRangeCommCyphers",function(newData){
		if(newData == null){
			$.getJSON('/resource?path=public/cyphers.json', function(cyphers) {
				Interstellar.setDatabaseValue("communications.longRangeCommCyphers",cyphers);
				return;
			});
			return;
		}
		cyphers = newData.Cyphers;
		var html = ""
		var row = 0;
		var column = -1;
		for(var i = 0;i < cyphers.length;i++){
			column++;
			if(column > 2){
				column = 0;
				row++;
			}
			html += "<div data-cypher-id='" + i + "' class='button cypherButton verticalAlign noselect' style='position:absolute;top:" + (row * 20) + "%;left:" + ((column * 31) + 5) + "%;'>"; 
			html += cyphers[i];
			html += "</div>"
		}
		$("#cypherBox").html(html);
		$(".cypherButton").off();
		$(".cypherButton").on("click",function(event){
			if(selectedMessage == -1)
				return; //no message selected
			var key = cyphers[event.target.getAttribute("data-cypher-id")];
			var formatedString = decodeMessage(encodeMessage(commMessages[selectedMessage].message,commMessages[selectedMessage].cypher),key);
			if(commMessages[selectedMessage].message == formatedString){
				commMessages[selectedMessage].hasBeenDecoded = true;
				Interstellar.setDatabaseValue("communications.longRangeMessages",commMessages) 
			}
			let finalMessage = "";
			let intervalCount = 0;
				if(codeTypingInterval != undefined){
					clearInterval(codeTypingInterval);
					codeTypingInterval = undefined;
				}
			let originalMessage = $("#messageBox").html();
			codeTypingInterval = setInterval(function(){
				intervalCount++;
				var message = "";
				if(intervalCount == formatedString.length){
					clearInterval(codeTypingInterval);
					$("#messageBox").html(replaceAll(formatedString,"\n","<br />"));
					return;
				}
				for(var i = 0;i < intervalCount;i++){
					if(i == intervalCount - 1){
						message += "<span style='color:lime;background-color:green'>" + formatedString[i] + "</span>";
					}else{
						message += formatedString[i];
					}
					finalMessage = formatedString[i];
				}
				for(var i = intervalCount;i < originalMessage.length;i++){
					message += originalMessage[i];
				}
				$("#messageBox").html(replaceAll(message,"\n","<br />"));
			},90);
		});
	});


	Interstellar.onDatabaseValueChange("communications.longRangeMessages",function(newData){
		if(newData == null){
			var template = [
				{
					"to" : "USS VOYAGER",
					"from" : "STARFLEET COMMAND",
					"cypher" : "A1-X2",
					"hasBeenDecoded" : false,
					"priority" : 3,
					"message" : "TO: USS VOYAGER \n FROM: STARFLEET COMMAND \n - \n VOYAGER,\n\nWHAT IS YOUR STATUS?\nPLEASE KEEP US UPDATED!\n\nGOOD LUCK VOYAGER!\n-\nSTARFLEET COMMAND OUT"
				}
			]
			Interstellar.setDatabaseValue("communications.longRangeMessages",template);
			return;
		}
		commMessages = newData;
		drawMessageGUI();
	});

	function drawMessageGUI(){
		$("#receivedMessages").html("");
		for(var i = 0;i < commMessages.length;i++){
			var html = "";
			var color = "white";
			if(commMessages[i].priority != 1){
				if(commMessages[i].priority == 2){
					color = "yellow";
				}else{
					color = "red";
				}
			}
			html += "<div data-message-id='" + i + "' id='recievedMessage_" + i + "' class='recievedMessage' ";
			if(commMessages[i].hasBeenDecoded == false){
				html += "style='background-color:#400000'"
			}
			html += ">"
			html += "<span data-message-id='" + i + "' style='color:" + color + "'>" + commMessages[i].from.toUpperCase() + "</span>";
			if(commMessages[i].hasBeenDecoded == false){
				html += "<span data-message-id='" + i + "' style='float: right;'>[<b><span style='color:grey' data-message-id='" + i + "'>NEW</span></b>]</span>";
			}
			html += "</div>";
			$("#receivedMessages").append(html);
			$(".recievedMessage").off();
			$(".recievedMessage").on("click",function(event){
				selectedMessage = event.target.getAttribute("data-message-id");
				if(codeTypingInterval != undefined){
					clearInterval(codeTypingInterval);
					codeTypingInterval = undefined;
				}
				var message = commMessages[event.target.getAttribute("data-message-id")].message;
				if(commMessages[event.target.getAttribute("data-message-id")].hasBeenDecoded == false){
					var key = commMessages[event.target.getAttribute("data-message-id")].cypher;
					var formatedString = encodeMessage(message,key);
					$("#messageBox").html(replaceAll(formatedString,"\n","<br />"));
				}else{
					$("#messageBox").html(replaceAll(message,"\n","<br />"));
				}
			});
		}
	}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

//the code below is freaking awesome, and was made 100% by Isaac Ostler!!  BOOOYAAAA

function encodeMessage(message,key){
	var cypherMessage = "";
	var keyIndex = 0;
	for(var i = 0;i < message.length;i++){
		if(keyIndex == key.length - 1){
			keyIndex = -1;
		}
		keyIndex++;
		cypherMessage += String.fromCharCode(modifyToBounds(message[i].charCodeAt(0) + key[keyIndex].charCodeAt(0),32,128,10));
	}
	return cypherMessage;
}

function decodeMessage(message,key){
	var cypherMessage = "";
	var keyIndex = 0;
	for(var i = 0;i < message.length;i++){
		if(keyIndex == key.length - 1){
			keyIndex = -1;
		}
		keyIndex++;
		cypherMessage += String.fromCharCode(modifyToBounds(message[i].charCodeAt(0) - key[keyIndex].charCodeAt(0),32,128,10));
	}
	return cypherMessage;
}

function modifyToBounds(number,min,max,exemption){ //bounds number to the specified min and max, but not by capping, by looping.
	if(arguments.length > 3){
		if(number == exemption){
			return number;
		}
	}
	if(number >= min && number <= max){
		return number;
	}else if(number < min){
		var placesOff = Math.abs(min - number);
		return modifyToBounds(max - placesOff,min,max);
	}else{
		var placesOff = number - max;
		return modifyToBounds(min + placesOff,min,max);
	}
}