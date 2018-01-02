var ipc = require('electron').ipcMain;
const remote = require('electron').remote,
	{ipcRenderer} = require('electron'),
    BrowserWindow = remote.BrowserWindow;


//DOM references
var openDatabaseButton = $("#databaseManagerButton"),
	backgroundImage = $("#background"),
	stationContainer = $("#stations"),
	stationConfigContainer = $("#stationConfig"),
	serverControlsContainer = $("#serverControls"),
	stationList = $("#stations_list"),
	openDatabaseButton = $("#openDatabaseManagerButton"),
	resetDatabaseButton = $("#resetDatabaseButton");

//variables
var databaseWindow = null,
	numberOfBackgroundImages = 1,
	stations = [];

/*
ipcRenderer.send('setStations', [{

	"stationInfo" : {
		"name" : "core",
		"cards" : ["engineering-reactor_CORE"]
	},
	"stationType" : "core"
}
]);*/

//init calls

init();

//functions
function init(){
	stationList.css("overflow","hidden");
	stationConfigContainer.slideDown(700);
	serverControlsContainer.slideDown(700);
	stationContainer.slideDown(700,function(){
		stationList.css("overflow","auto")
	});
	getStations(function(loadedStations){
		stations = loadedStations;
		listStations(stations);
	});
}

function getStations(callback){
	ipcRenderer.send("getStations");
	ipcRenderer.on('recieveStations', (event, arg) => {
		callback(arg);
	})
}

function listStations(stations){
	var typesOfStations = [];
	for(var i = 0;i < stations.length;i++){
		var wasDetected = false;
		for(var j = 0;j < typesOfStations.length;j++){
			if(typesOfStations[j] == stations[i].stationType){
				wasDetected = true;
			}
		}
		if(!wasDetected){
			typesOfStations.splice(typesOfStations.length,0,stations[i].stationType);
		}
	}

	//now that we have all the station types, list them
	var html = "";
	for(var i = 0;i < typesOfStations.length;i++){
		html += "<div class='stationHeader'>";
			html += "<div class='stationHeader_title'>" + typesOfStations[i].toUpperCase() + "S</div>";
		html += "</div>";
		for(var j = 0;j < stations.length;j++){
			if(stations[j].stationType == typesOfStations[i]){
				html += "<div class='stationClass' index='" + j + "'>";
					html += "<div class='glowButton red' index='" + j + "'></div>";
					html += "<div class='stationClass_title' index='" + j + "'>" + stations[j].stationInfo.name + "</div>";
				html += "</div>";
			}
		}
	}
	stationList.html(html);
	$(".stationClass").off();
	$(".stationClass").click(function(event){
		var index = Number($(event.target).attr("index"));
		loadStationInfoForStation(index);
	});
}

function loadStationInfoForStation(index){

}

function getLocalPortNumber(callback){
	let functionCallback = callback;
	ipcRenderer.send('getLocalPortNumber');
	ipcRenderer.on('recieveLocalPortNumber', (event, arg) => {
		functionCallback(arg);
	})
}

function openDatabaseWindow(){
	if(databaseWindow == null){
		databaseWindow = new BrowserWindow({ title : "Interstellar - Database Manager",x : 0,y : 0, width: 400, height: 600, minWidth : 300, minHeight : 500, maxWidth : 800, maxHeight : 800,skipTaskbar : true,maximizable : false, fullscreenable : false });
		databaseWindow.once('ready-to-show', () => {
			databaseWindow.show();
		});
		getLocalPortNumber(function(port){
			databaseWindow.loadURL('http://localhost:' + port + '/databaseWindow');
		});
		databaseWindow.on('closed', () => {
			databaseWindow = null;
			ipcRenderer.send('endDatabaseInfoWatch');
		});
	}else{
		databaseWindow.focus();
	}
}

function getDatabase(callback){
	let functionCallback = callback;
	ipcRenderer.send('getDatabase');
	ipcRenderer.on('recieveDatabase', (event, arg) => {
		functionCallback(arg);
	})
}

//event handlers
openDatabaseButton.click(function(event){
	openDatabaseWindow();
});

resetDatabaseButton.click(function(event){
	ipcRenderer.send('resetDatabase');
	alert("Database cleared!\n\n(This is different from a database reset)");
});
//intervals

//timeouts

setTimeout(function(){
	backgroundImage.css("background-image","url('/resource?path=public/background" + Math.floor(Math.random() * numberOfBackgroundImages) + ".jpg')")
	//fade in the background image
	backgroundImage.fadeIn(4000);
},0500);