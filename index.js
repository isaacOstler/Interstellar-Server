var fs = require("fs");
var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var colors = require('colors');

var guiManager = require('./guiManager');

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


//Start of modules
var cardManager = require('./cardManager');
var databaseManager = require('./databaseManager.js');
express.set("view engine","ejs");

/* fairly certain this is useless
require("jsdom").env("", function(err, window) {
	if (err) {
		console.error(err);
		return;
	}
	
	var $ = require("jquery")(window);
});
*/

const electron = require('electron');
const {ipcMain} = require('electron')
const {app, BrowserWindow, webContents} = electron;
var stations;
var rebuildCards = false;
var overidePort = false;
var overrideingPortNumber = 3000;
var saveDatabase = false;

app.on('ready',function(){

	for(var i = 0;i < process.argv.length;i++){
		//do we need to build cards?
		if(process.argv[i].includes("--buildCards=")){
			rebuildCards = (process.argv[i].split("=")[1] == "true");
		}

		//shortcut for build cards command?
		if(process.argv[i] == ("--buildCards")){
			rebuildCards = true;
		}

		//saveDatabase?
		if(process.argv[i].includes("--saveDatabase=")){
			saveDatabase = (process.argv[i].split("=")[1] == "true");
		}

		//shortcut for save database?
		if(process.argv[i] == ("--saveDatabase")){
			saveDatabase = true;
		}

		//override port?
		if(process.argv[i].includes("--portOverride=")){
			overidePort = true;
			overrideingPortNumber = parseInt(process.argv[i].split("=")[1]);
		}
	}
	if(saveDatabase == true){
		console.log("-[WARNING]-\nWARNING!!!  THE SAVE DATABASE OPTION FOR IFDATABASE CURRENTLY DOESN'T WORK!\n(it won't crash anything, it just won't work)\n-[WARNING]-".error.bold);
	}

	guiManager.init(ipcMain,function(portNumberFromUserPrefs,loadedStations){
		if(overidePort == true){
			portNumberFromUserPrefs = overrideingPortNumber;
		}
		stations = loadedStations;
		guiManager.onStationChange(function(newData){
			stations = newData;
			console.log("stations set to " + stations);
		})
		cardManager.init(rebuildCards,function(){
			var mainWindow = new BrowserWindow({
				width: 1100,
				height: 650,
				minWidth: 1000,
				minHeight: 550
			});
			mainWindow.loadURL('http://localhost:' + portNumberFromUserPrefs +'/views/client');
		});

		http.listen(portNumberFromUserPrefs, function(socket){
			console.log('=====[' + 'listening on port '.bold + portNumberFromUserPrefs.toString().bold + ']=====');

			express.get('/', function(req, res){
				res.sendFile(__dirname + '/grabStations.html');
			});
			express.get('/stationServerSelect', function(req, res){
				res.sendFile(__dirname + '/stationServerSelect.html');
			});
			express.get("/jquery", function(req, res){
				console.log("Loading JQUERY For GUI...".grey);
				res.sendFile(__dirname + "/public/jquery.js");
			});
			express.get('/public/:path', function(req, res){
				res.sendFile(__dirname + req.url);
			});
			express.get('/guiScript', function(req, res){
				console.log("Loading JavaScript For GUI...".grey);
				res.sendFile(__dirname + "/guiScript.js");
			});
			express.get('/card/:cardName', function(req, res){
			//useless get request?
			console.log(req.url);
		});
			express.get('/views/client', function(req, res){
				res.render('client',{ 
					'port' : portNumberFromUserPrefs,
					'cards' : cardManager.getCards(),
					'stations' : stations
				});
			});
			express.get('/resource', function(req, res){
				console.log("LOADING RESOURCE " + __dirname + "/" + req.query.path.toString);
				res.sendFile(__dirname + "/" + req.query.path);
			});

			io.on('connect', function(socket){
				let socketID = socket.id;
				console.log("[+] STATION CONNECTED (" + socketID + ")");
				console.log("sending " + stations + " for client");
				socket.emit('stationsSent',stations);
				socket.on('disconnect',function(socket){
					console.log("[!] STATION DISCONNECTED");
				});
				socket.on('getCardFiles',function(data){
					cardManager.serveCard(data,function(bufferStream){
						if(bufferStream){
							socket.emit('recieveCardFiles',{
								"cardName" : data,
								"bufferStream" : bufferStream
							});
						}
					});
				});
				socket.on('getDatabaseValue',function(data){
					databaseManager.getDatabaseValue(data,function(databaseValueFromMongo){
						var databaseValue = 
						{
							"key" : data,
							"dataValue" : databaseValueFromMongo
						}
						socket.emit("databaseValueForKey",databaseValue);
					});
				});
				socket.on('getDatabaseValueForServerFunction',function(data){
					databaseManager.getDatabaseValue(data,function(databaseValueFromMongo){
						var databaseValue = 
						{
							"key" : data,
							"dataValue" : databaseValueFromMongo
						}
						socket.emit("databaseValueForKeyForServerFunction",databaseValue);
					});
				});

				socket.on('setDatabaseValue',function(data){
					databaseManager.setDatabaseValue(data.key,data.dataValue);
					io.emit("databaseValueDidChange",data);
					//socket.broadcast.emit("databaseValueDidChange",data);
					//socket.emit("databaseValueDidChange",data);
				});

				socket.on('clearDatabase',function(data){
					databaseManager.clearDatabase()
					io.emit("databaseValueDidChange","all");
				})

				socket.on('getViewscreenCard',function(data){
					console.log("Sending viewscreen card...");
					cardManager.serveCard("viewscreen",function(bufferStream){
						if(bufferStream){
							socket.emit('recieveViewscreenCard',{
								"cardName" : "viewscreen",
								"bufferStream" : bufferStream
							});
						}
					});
				});

				socket.on('getDMXCard',function(data){
					console.log("Sending DMX card...");
					cardManager.serveCard("dmx",function(bufferStream){
						if(bufferStream){
							socket.emit('recieveDMXCard',{
								"cardName" : "dmx",
								"bufferStream" : bufferStream
							});
						}
					});
				});

				socket.on('getMenu',function(){
					cardManager.getMenu(function(bufferStream){
						if(bufferStream){
							socket.emit('recieveMenu',{
								"cardName" : "menu",
								"bufferStream" : bufferStream
							});
						}
					});
				});

				socket.on('getCards',function(data){
					var stationNames = [];
					for(var i = 0; i < stations.length;i++){
						stationNames.push(stations[i].stationInfo.name);
					}
					for(var i = 0; i < stationNames.length; i++){
						if(stationNames[i] == data){
						//station found
						console.log('sending cards for station ' + data);
						var cards = stations[i].stationInfo.cards;
						socket.emit('recieveCards',cards);
						return;
					}
				}
				var errorMessage = "Client tried to call cards for nonexsistant station ".bold + data;
				console.log(errorMessage.error);
				});
			});
		});
	});

});