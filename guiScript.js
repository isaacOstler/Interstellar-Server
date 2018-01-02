var ipc = require('electron').ipcMain;
const remote = require('electron').remote,
	{ipcRenderer} = require('electron'),
    BrowserWindow = remote.BrowserWindow;


//DOM references
var openDatabaseButton = $("#databaseManagerButton");

//variables
var databaseWindow = null;

/*
ipcRenderer.send('setStations', [{

	"stationInfo" : {
		"name" : "core",
		"cards" : ["engineering-reactor_CORE"]
	},
	"stationType" : "core"
}
]);*/

function getLocalPortNumber(callback){
	let functionCallback = callback;
	ipcRenderer.send('getLocalPortNumber');
	ipcRenderer.on('recieveLocalPortNumber', (event, arg) => {
		functionCallback(arg);
	})
}

function openDatabaseWindow(){
	if(databaseWindow == null){
		databaseWindow = new BrowserWindow({ title : "Interstellar - Database Manager", width: 400, height: 600, minWidth : 300, minHeight : 500, maxWidth : 800, maxHeight : 800,skipTaskbar : true,maximizable : false, fullscreenable : false });
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

$(".stationOption").on("click",function(event){
	console.log(event.currentTarget.outerText);
})

openDatabaseButton.click(function(event){
	openDatabaseWindow();
});

//intervals