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

function openDatabaseWindow(){
	if(databaseWindow == null){
		databaseWindow = new BrowserWindow({ width: 800, height: 600 });
		databaseWindow.once('ready-to-show', () => {
			databaseWindow.show();
		});
		
		databaseWindow.off();
		databaseWindow.on('close',function(event){
			databaseWindow = null;
			console.log("Database window closed");
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