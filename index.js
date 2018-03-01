var fs = require("fs");
var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var colors = require('colors');

const {autoUpdater} = require("electron-updater");
const log = require('electron-log');

var guiManager = require(__dirname + '/guiManager');

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

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//Start of modules
var cardManager = require(__dirname + '/cardManager');
var databaseManager = require(__dirname + '/databaseManager.js');
express.set("view engine", "ejs");

const electron = require('electron'),
    { ipcMain } = require('electron'),
    { app, BrowserWindow, webContents } = electron;

//do NOT let this application be throttled, the server always needs
//to be ready to respond to a client, regardless if it is the foremost
//application or not.  This may disable sleeping on the client's computer, however.
electron.powerSaveBlocker.start('prevent-app-suspension');

var stations,
    cardFolderLocation = __dirname + "/cards";
    rebuildCards = false,
    rebuildThemes = false,
    overidePort = false,
    overrideingPortNumber = 3000,
    httpAlreadyInit = false,
    portNumberFromUserPrefs = overrideingPortNumber,
    saveDatabase = false;

app.on('ready', function() {
    //check for updates
    autoUpdater.checkForUpdatesAndNotify();
    //start file management
    for (var i = 0; i < process.argv.length; i++) {
        //do we need to build cards?
        if (process.argv[i].includes("--buildCards=")) {
            rebuildCards = (process.argv[i].split("=")[1] == "true");
        }

        //shortcut for build cards command?
        if (process.argv[i] == ("--buildCards")) {
            rebuildCards = true;
        }

        //shortcut for build themes command?
        if (process.argv[i] == ("--buildThemes")) {
            rebuildThemes = true;
        }

        //saveDatabase?
        if (process.argv[i].includes("--saveDatabase=")) {
            saveDatabase = (process.argv[i].split("=")[1] == "true");
        }

        //shortcut for save database?
        if (process.argv[i] == ("--saveDatabase")) {
            saveDatabase = true;
        }

        //override port?
        if (process.argv[i].includes("--portOverride=")) {
            overidePort = true;
            overrideingPortNumber = parseInt(process.argv[i].split("=")[1]);
        }
    }
    if (saveDatabase == true) {
        console.log("-[WARNING]-\nWARNING!!!  THE SAVE DATABASE OPTION FOR IFDATABASE CURRENTLY DOESN'T WORK!\n(it won't crash anything, it just won't work)\n-[WARNING]-".error.bold);
    }
    if (overidePort == true) {
        portNumberFromUserPrefs = overrideingPortNumber;
    }
    guiManager.init(ipcMain, app, databaseManager, cardManager.getCards(),cardManager.getThemes(),portNumberFromUserPrefs, function(portNumberFromUserPrefs, loadedStations) {
        stations = loadedStations;
        guiManager.onStationChange(function(newData) {
            stations = newData;
            console.log("stations set to " + stations);
        });
        cardManager.init(rebuildCards,rebuildThemes, function() {
            if(httpAlreadyInit){
                return;
            }
            httpAlreadyInit = true;
            http.listen(portNumberFromUserPrefs, function(socket) {
                console.log('=====[' + 'listening on port '.bold + portNumberFromUserPrefs.toString().bold + ']=====');

                express.get('/', function(req, res) {
                    res.sendFile(__dirname + '/grabStations.html');
                });
                express.get('/databaseWindow', function(req, res) {
                    res.render('databaseView', {
                        'port': portNumberFromUserPrefs,
                        'cards': cardManager.getCards(),
                        'stations': stations
                    });
                });
                express.get('/cardWindow', function(req, res) {
                    res.render('cardView');
                });
                express.get('/stationServerSelect', function(req, res) {
                    res.sendFile(__dirname + '/stationServerSelect.html');
                });
                express.get("/jquery", function(req, res) {
                    console.log("Loading JQUERY For GUI...".grey);
                    res.sendFile(__dirname + "/public/jquery.js");
                });
                express.get('/public/:path', function(req, res) {
                    res.sendFile(__dirname + req.url);
                });
                express.get('/guiScript', function(req, res) {
                    console.log("Loading JavaScript For GUI...".grey);
                    res.sendFile(__dirname + "/guiScript.js");
                });
                express.get('/card/:cardName', function(req, res) {
                    //useless get request?
                    console.log(req.url);
                });
                express.get('/cardImage', function(req, res) {
                    console.log("LOADING CARD IMAGE " + req.query.card.toString());
                    res.sendFile(cardFolderLocation + "/" + req.query.card.toString() + "/preview.png");
                });
                express.get('/views/client', function(req, res) {
                    res.render('client.ejs', {
                        'port': portNumberFromUserPrefs,
                        'cards': cardManager.getCards(),
                        'stations': stations
                    });
                });
                express.get('/resource', function(req, res) {
                    console.log("LOADING RESOURCE " + __dirname + "/" + req.query.path.toString());
                    res.sendFile(__dirname + "/" + req.query.path);
                });

                io.on('connect', function(socket) {
                    let socketID = socket.id;
                    databaseManager.setClientCount(Object.keys(io.sockets.sockets));
                    console.log("[+] STATION CONNECTED (" + socketID + ")");
                    console.log("sending " + stations + " for client");
                    socket.emit('stationsSent', stations);
                    socket.on('disconnect', function(socket) {
                        databaseManager.setClientCount(Object.keys(io.sockets.sockets));
                        console.log("[!] STATION DISCONNECTED");
                    });
                    socket.on('getCardFiles', function(data) {
                        cardManager.serveCard(data, function(bufferStream) {
                            if (bufferStream) {
                                socket.emit('recieveCardFiles', {
                                    "cardName": data,
                                    "bufferStream": bufferStream
                                });
                            }
                        });
                    });
                    socket.on('getThemeFiles', function(data) {
                        cardManager.getThemeFiles(data, function(bufferStream) {
                            if (bufferStream) {
                                socket.emit('recieveThemeFiles', {
                                    "themeName": data,
                                    "folderName" : cardManager.getThemeFolderName(),
                                    "bufferStream": bufferStream
                                });
                            }
                        });
                    });
                    socket.on('getDatabaseValue', function(data) {
                        databaseManager.getDatabaseValue(data, function(databaseValueFromMongo) {
                            var databaseValue = {
                                "key": data,
                                "dataValue": databaseValueFromMongo
                            }
                            socket.emit("databaseValueForKey", databaseValue);
                        });
                    });
                    socket.on('getDatabaseValueForServerFunction', function(data) {
                        databaseManager.getDatabaseValue(data, function(databaseValueFromMongo) {
                            var databaseValue = {
                                "key": data,
                                "dataValue": databaseValueFromMongo
                            }
                            socket.emit("databaseValueForKeyForServerFunction", databaseValue);
                        });
                    });

                    socket.on('setDatabaseValue', function(data) {
                        databaseManager.setDatabaseValue(data.key, data.dataValue);
                        io.emit("databaseValueDidChange", data);
                        //socket.broadcast.emit("databaseValueDidChange",data);
                        //socket.emit("databaseValueDidChange",data);
                    });

                    socket.on('clearDatabase', function(data) {
                        databaseManager.clearDatabase()
                        io.emit("databaseValueDidChange", "all");
                    })

                    socket.on('getViewscreenCard', function(data) {
                        console.log("Sending viewscreen card...");
                        cardManager.serveCard("viewscreen", function(bufferStream) {
                            if (bufferStream) {
                                socket.emit('recieveViewscreenCard', {
                                    "cardName": "viewscreen",
                                    "bufferStream": bufferStream
                                });
                            }
                        });
                    });

                    socket.on('getDMXCard', function(data) {
                        console.log("Sending DMX card...");
                        cardManager.serveCard("dmx", function(bufferStream) {
                            if (bufferStream) {
                                socket.emit('recieveDMXCard', {
                                    "cardName": "dmx",
                                    "bufferStream": bufferStream
                                });
                            }
                        });
                    });

                    socket.on('getResourceFiles',function() {
                        cardManager.getResourceFiles(function(bufferStream) {
                            socket.emit('recieveResourceFiles', bufferStream);
                        });
                    });

                    socket.on('getMenu', function() {
                        cardManager.getMenu(function(bufferStream) {
                            if (bufferStream) {
                                socket.emit('recieveMenu', {
                                    "cardName": "menu",
                                    "bufferStream": bufferStream
                                });
                            }
                        });
                    });

                    socket.on('getCards', function(data) {
                        var stationNames = [];
                        for (var i = 0; i < stations.length; i++) {
                            stationNames.push(stations[i].stationInfo.name);
                        }
                        for (var i = 0; i < stationNames.length; i++) {
                            if (stationNames[i] == data) {
                                //station found
                                console.log('sending cards for station ' + data);
                                var cards = [];
                                for(var clientCards = 0;clientCards < stations[i].stationInfo.cards.length;clientCards++){
                                    for(var possibleCards = 0;possibleCards < cardManager.cards.length;possibleCards++){
                                        if(cardManager.cards[possibleCards].cardInfo.cardName == stations[i].stationInfo.cards[clientCards]){
                                            cards.splice(cards.length,0,cardManager.cards[possibleCards]);
                                        }
                                    }
                                }
                                socket.emit('recieveCards', cards);
                                return;
                            }
                        }
                        var errorMessage = "Client tried to call cards for nonexsistant station ".bold + data;
                        console.log(errorMessage.error);
                    });
                });
				var mainWindow = new BrowserWindow({
					width: 1100,
					height: 650,
                    center : true,
					minWidth: 1000,
					minHeight: 550
				});
				mainWindow.loadURL('http://localhost:' + portNumberFromUserPrefs +'/views/client');
            });
        });
    });
});