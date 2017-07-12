var ipc = require('electron').ipcMain;

$(".stationOption").on("click",function(event){
	console.log(event.currentTarget.outerText);
})

const {ipcRenderer} = require('electron')
/*
ipcRenderer.send('setStations', [{

	"stationInfo" : {
		"name" : "core",
		"cards" : ["engineering-reactor_CORE"]
	},
	"stationType" : "core"
}
]);*/