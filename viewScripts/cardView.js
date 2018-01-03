var ipc = require('electron').ipcMain;
const remote = require('electron').remote,
	{ipcRenderer} = require('electron'),
    BrowserWindow = remote.BrowserWindow;

//DOM Refs
var rebuildCardsButton = $("#rebuildCardsButton"),
	rebuildThemesButton = $("#rebuildThemesButton");

//variables

//init calls

//functions

//event handlers

rebuildCardsButton.click(function(event){
	ipcRenderer.send('restartAndRebuildCards');
});

rebuildThemesButton.click(function(event){
	ipcRenderer.send('restartAndRebuildThemes');
});

//intervals