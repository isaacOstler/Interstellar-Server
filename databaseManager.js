var colors = require('colors');
var runningIFDatabase = true,
	updateDatabaseInfoCallback = undefined,
	ifDatabase = [],
	lastUpdateTime = new Date(),
	lastResetTime = new Date(),
	clientCount = 0,
	saveMode = false;

colors.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

var consoleTagMessage = "[" + "DATABASE MANAGER".yellow + "] ";

var databaseIsOpen = false;
//returns all database values
module.exports.getDatabase = function(){
	return getDatabase();
}

module.exports.setDatabaseValue = function(dataKey,passedValue){
	//
	// IF DATABASE
	//
	if(runningIFDatabase){
		lastUpdateTime = new Date();
		updateGUICallback();
		for(var i = 0;i < ifDatabase.length;i++){
			if(ifDatabase[i].key == dataKey){
				ifDatabase[i].dataValue = passedValue;
				var message = "Successful wrote " + dataKey + " to the database with value '" + passedValue + "'";
				console.log("[" + "DATABASE MANAGER".yellow + "] [" + "WRITE".cyan + "] " + message.info);
				return;
			}
		}
		var dataObject = {
			"key" : dataKey,
			"dataValue" : passedValue
		}
		//if we get to this point, no data value has been created with that id.
		ifDatabase.splice(ifDatabase.length,0,dataObject);
		var message = "Successful wrote " + dataKey + " to the database with value '" + passedValue + "'";
		console.log("[" + "DATABASE MANAGER".yellow + "] [" + "WRITE".cyan + "] [" + "NEW".grey + "] " + message.info);
		return;
	}
}

module.exports.updateDatabaseInfoOnChange = function(callback){
	updateDatabaseInfoCallback = callback;
	console.log(consoleTagMessage + "Created GUI info callback");
	updateGUICallback();
}

module.exports.getDatabaseValue = function(dataKey,passedCallback){
	//
	// IF DATABASE
	//
				
	if(runningIFDatabase){
		for(var i = 0;i < ifDatabase.length;i++){
			if(ifDatabase[i].key == dataKey){
				console.log("[" + "DATABASE MANAGER".yellow + "] [" + "READ".blue + "] " + "key".bold + " '"  + dataKey + "' " + "value".bold + " '" + ifDatabase[i].dataValue + "'");
				passedCallback(ifDatabase[i].dataValue);
				return;
			}
		}
		console.log("[" + "DATABASE MANAGER".yellow + "] [" + "READ".blue + "] passing null for key '" + dataKey.toString().bold + "'");
		passedCallback(null);
		return;
	}
	DatabaseValue.findOne({ "key" : dataKey}, 'key dataValue' ,function (err, doc) {
		if(err){
			var message = "[!] There was an error reading " + value.key + " from the database... " + err;
			console.log(message.error);
			passedCallback(message);
		}else{
			if(doc == null){
				console.log("returning null for value " + dataKey);
				passedCallback(null);
				return;
			}
			var message = doc.key + " read as '" + doc.dataValue + "' on database";
			console.log("[" + "DATABASE MANAGER".yellow + "] [" + "READ".blue + "] " + "key".bold + " '"  + dataKey + "' " + "value".bold + " '" + message.info + "'");
			passedCallback(doc.dataValue);
		}
	});
}

module.exports.clearDatabase = function(callback){
	if(runningIFDatabase){
		ifDatabase = [];
		lastResetTime = new Date();
		updateGUICallback();
	}
}

function getDatabase(){
	return ifDatabase;
}

function updateGUICallback(){
	if(updateDatabaseInfoCallback != undefined){
		var data = 
		{
			"lastUpdate" : lastUpdateTime,
			"lastReset" : lastResetTime,
			"databaseValues" : getDatabase(),
			"clients" : clientCount,
			"saveMode" : saveMode
		}
		updateDatabaseInfoCallback(data);
	}
}

module.exports.setClientCount = function(count){
	clientCount = count;
	updateGUICallback();
}