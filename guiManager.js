var fs = require("fs");
var colors = require('colors');
var jsonfile = require('jsonfile');
var mkdirp = require('mkdirp');

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

var guiManagerHeaderText = "[" + "GUI MANAGER".verbose + "] ";
var ipcMain;
var stationChangeCallback,
	localPortNumber = 3000,
	stations = [],
	userPrefs = {},
	stationLayouts = [],
	databaseManager;

module.exports.init = function(ipc, databaseManagerRef, port, callback){
	ipcMain = ipc;
	databaseManager = databaseManagerRef;
	localPortNumber = port;
	console.log(guiManagerHeaderText + "Reading last server setups from saveFile.json......");
	jsonfile.readFile("./userPrefs/serverSetup.json", function(err, obj) {
		userPrefs = obj;
		console.log(guiManagerHeaderText + "Done!".info);
		if(err){
			console.log(guiManagerHeaderText + err.toString().error);
			console.log(guiManagerHeaderText + "CANCELING STARTUP DUE TO ERROR".bold);
			return;
		}
		stationLayouts = obj;
  		stations = obj.stationLayouts[0].stations;
		for(var i = 0;i < obj.stationLayouts.length;i++){
			if(obj.stationLayouts[i].isDefault){
  				stations = obj.stationLayouts[i].stations;
				break;
			}
		}
		callback(obj.port,stations);
	});

/*
	ipcMain.on('asynchronous-message', (event, arg) => {
	  console.log(arg)  // prints "ping"
	  event.sender.send('asynchronous-reply', 'pong')
	})

	ipcMain.on('synchronous-message', (event, arg) => {
	  console.log(arg)  // prints "ping"
	  event.returnValue = 'pong'
	})
*/
	module.exports.onStationChange = function(callback){
		stationChangeCallback = callback;
	}

	ipcMain.on('watchDatabaseInfo', (event, arg) => {
		databaseManager.updateDatabaseInfoOnChange(function(newData){
			event.sender.send('databaseInfoDidChange',newData);
		});
	});

	ipcMain.on('endDatabaseInfoWatch', (event, arg) => {
		databaseManager.updateDatabaseInfoOnChange(undefined);
	});

	ipcMain.on('resetDatabase', (event, arg) => {
		databaseManager.clearDatabase();
	});

	ipcMain.on('setStations', (event, arg) => {
		stationChangeCallback(arg);
	});

	ipcMain.on('setStationLayouts', (event, arg) => {
		userPrefs.stationLayouts = arg;
		jsonfile.writeFile("./userPrefs/serverSetup.json",userPrefs);
	});

	ipcMain.on('getStations', (event, arg) => {
		event.sender.send('recieveStations',stations);
	});

	ipcMain.on('getLayouts', (event, arg) => {
		event.sender.send('recieveLayouts',stationLayouts);
	});

	ipcMain.on('getDatabase',(event, arg) => {
		event.sender.send('recieveDatabase',databaseManager.getDatabase());
	});

	ipcMain.on('getLocalPortNumber',(event, arg) => {
		event.sender.send('recieveLocalPortNumber',localPortNumber);
	});
}