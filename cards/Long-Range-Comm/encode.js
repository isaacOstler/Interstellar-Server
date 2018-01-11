var Encryption = function(){
	//the code below is freaking awesome, and was made 100% by Isaac Ostler!!

	//seriously though, it's probably crap, don't use it for anything secure.  Just a fun
	//little encryption thing I made.  I've never done any research into encryption, so use
	//at your own risk.  At least in my mind it seems kinda secure.

	this.encode = function(message,key){
		return encodeMessage(message,key);
	}
	this.decode = function(message,key){
		return decodeMessage(message,key);
	}
	function encodeMessage(message,key){
		var cypherMessage = "";
		var keyIndex = 0;
		for(var i = 0;i < message.length;i++){
			if(keyIndex == key.length - 1){
				keyIndex = -1;
			}
			keyIndex++;
			cypherMessage += String.fromCharCode(modifyToBounds(message[i].charCodeAt(0) + key[keyIndex].charCodeAt(0),0,128,13));
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
			cypherMessage += String.fromCharCode(modifyToBounds(message[i].charCodeAt(0) - key[keyIndex].charCodeAt(0),0,128,13));
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
}