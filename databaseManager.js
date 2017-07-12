var mongoose = require('mongoose');
var colors = require('colors');
var Schema = mongoose.Schema;
var runningIFDatabase = false;
var ifDatabase = [];

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
var mongo;
var defaultSchema = mongoose.Schema({
	key : String,
	dataValue : Schema.Types.Mixed
});
var DatabaseValue = mongoose.model('DatabaseValue',defaultSchema);
//this function will automatically add the value to the database if it doesn't exist

//connect to the database
mongoose.connect('mongodb://localhost/interstellar');
//create a variable for that connection
var db = mongoose.connection;
//if there is an error
db.on('error', function(error){
	console.error.bind(console.error, 'connection error:'.error)
	console.log(consoleTagMessage + "Mongo DB connection error...".error + " Switching to IF database!".bold);
	runningIFDatabase = true;
});
//if the connection opens
db.once('open', function() {
   // we're connected to the database!
   databaseIsOpen = true;
   console.log("[" + "DATABASE MANAGER".yellow + "] " + "Connected to database".bold);
});

module.exports.setDatabaseValue = function(dataKey,passedValue){
	//
	// IF DATABASE
	//
	if(runningIFDatabase){
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
	//
	// MONGO DB \/
	//
	//var value = new DatabaseValue({ key : dataKey, dataValue : passedValue});
	var query = { key : dataKey };
	DatabaseValue.findOneAndUpdate(query, { dataValue: passedValue }, {upsert:true}, function(err, value){
		if(err){
			var message = "[!] There was an error writing " + value.key + " to the database... " + err;
			return console.log(message.error);
		}else{
			if(value == null)
				return;
			
			var message = "Successful wrote " + value.key + " to the database with value '" + value.dataValue + "'";
			console.log("[" + "DATABASE MANAGER".yellow + "] [" + "WRITE".cyan + "] " + message.info);
		}
	});
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