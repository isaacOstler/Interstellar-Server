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
	resetDatabaseButton = $("#resetDatabaseButton"),
	stationLayoutList = $("#serverControls_setups_list"),
	saveLayoutButton = $("#saveStationLayoutButton"),
	mask = $("#mask"),
	loadStationLayoutButton = $("#loadStationLayoutButton"),
	cancelLayoutButton = $("#setLayoutNamePopup_cancelLayout"),
	layoutNameTextbox = $("#setLayoutNamePopup_textbox"),
	confirmSaveNewLayoutButton = $("#setLayoutNamePopup_saveLayout"),
	setDefaultLayoutButton = $("#setDefaultLayoutButton"),
	allCardsContainer = $("#stationConfig_possibleCards"),
	openCardWindowButton = $("#openCardManagerButton"),
	stationCards = $("#stationConfig_stationCards"),
	cardSizeRangeSlider = $("#stationConfig_cardIconSize"),
	stationNameTextbox = $("#stationConfig_stationInfo_stationNameText"),
	stationTypeDropdown = $("#stationConfig_stationInfo_stationType"),
	interstellarTitle = $("#interstellarTitle"),
	setLayoutNamePopup = $("#setLayoutNamePopup"),
	stationThemeDropdown = $("#stationConfig_stationInfo_stationTheme");

//variables
var databaseWindow = null,
	cardWindow = null,
	numberOfBackgroundImages = 3,
	stations = [],
	themes = [];
	allCards = [],
	widgetSize = cardSizeRangeSlider.val(),
	selectedStation = -1,
	selectedStationLayout = -1,
	stationLayouts = [];

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
	interstellarTitle.fadeIn(6000);
	serverControlsContainer.slideDown(700);
	stationContainer.slideDown(700,function(){
		stationList.css("overflow","auto")
	});
	getStations(function(loadedStations){
		stations = loadedStations;
		listStations(stations);
	});
	getThemes(function(loadedThemes){
		console.log(loadedThemes);
		themes = loadedThemes;
	});
	getStationLayouts(function(obj){
		for(var i = 0;i < obj.stationLayouts.length;i++){
			if(obj.stationLayouts[i].isDefault){
				selectedStationLayout = i;
			}
		}
		stationLayouts = obj.stationLayouts;
		listStationLayouts(stationLayouts);
	});
	getCards(function(cards){
		allCards = cards;
	});
}

function getThemes(callback){
	ipcRenderer.send('getThemes');
	ipcRenderer.on('recieveThemes', (event, arg) => {
		callback(arg);
	});
}

function getStationLayouts(callback){
	ipcRenderer.send('getLayouts');
	ipcRenderer.on('recieveLayouts', (event, arg) => {
		callback(arg);
	});
}

function getStations(callback){
	ipcRenderer.send("getStations");
	ipcRenderer.on('recieveStations', (event, arg) => {
		callback(arg);
	});
}


function setLayouts(layouts){
	ipcRenderer.send('setStationLayouts', layouts);
}

function setStations(newStations){
	console.log(stationLayouts[selectedStationLayout],selectedStationLayout);
	stationLayouts[selectedStationLayout].stations = newStations;
	ipcRenderer.send('setStations', newStations);
	setLayouts(stationLayouts);
	stations = newStations;
	listStations(newStations);
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
	html += "<div class='spacer' style='height:10px'></div>";
	html += "<div class='createNewStationButton noselect'>Create New...</div>"
	stationList.html(html);
	$(".stationClass").off();
	$(".stationClass").click(function(event){
		selectedStation = Number($(event.target).attr("index"));
		loadStationInfoForStation(selectedStation);
	});
	$(".createNewStationButton").off();
	$(".createNewStationButton").click(function(event){
		createNewStation("STATION","bridge station", themes[0],[]);
	});
}

function listStationLayouts(layouts){
	var html = "<div class='stationHeader'>";
	html += "<div class='stationHeader_title'>STATION LAYOUTS</div>";
	html += "</div>"
	for(var i = 0;i < layouts.length;i++){
		html += "<div class='layout' index='" + i + "'>";
		html += layouts[i].name;
		html += "</div>";
	}
	stationLayoutList.html(html);
	$(".layout").off();
	$(".layout").click(function(event){
		$(".layout").css("background-color","");
		$(event.target).css("background-color","red");
		selectedStationLayout = $(event.target).attr("index");
	});
}

function loadStationInfoForStation(index){
	stationConfigContainer.fadeIn();
	interstellarTitle.fadeOut();
	var html = "";
	for(var i = 0;i < themes.length;i++){
		html += "<option style='text-transform:capitalize'>" + themes[i].themeInfo.themeName + "</option>"
	}
	stationNameTextbox.val(stations[index].stationInfo.name);
	stationTypeDropdown.val(stations[index].stationType);
	stationThemeDropdown.html(html);
	listCardsInContainer(stationCards,stations[index].stationInfo.cards);
	var possibleCards = [];
	for(var i = 0;i < allCards.length;i++){
		var wasDetected = false;
		for(var j = 0;j < stations[index].stationInfo.cards.length;j++){
			if(stations[index].stationInfo.cards[j] == allCards[i].cardInfo.cardName){
				wasDetected = true;
			}
		}
		if(stations[index].stationType == "bridge station"){
			if(allCards[i].cardInfo.cardType == "coreWidget" || allCards[i].cardInfo.cardType == "viewscreen"){
				wasDetected = true;
			}
		}else if(stations[index].stationType == "core station"){
			if(allCards[i].cardInfo.cardType == "card" || allCards[i].cardInfo.cardType == "viewscreen"){
				wasDetected = true;
			}
		}
		if(allCards[i].cardInfo.cardName == "menu"){
			wasDetected = true;
		}
		if(!wasDetected){
			possibleCards.splice(possibleCards.length,0,allCards[i].cardInfo.cardName);
		}
	}
	listCardsInContainer(allCardsContainer,possibleCards);
}

function getLocalPortNumber(callback){
	let functionCallback = callback;
	ipcRenderer.send('getLocalPortNumber');
	ipcRenderer.on('recieveLocalPortNumber', (event, arg) => {
		functionCallback(arg);
	})
}

function getCards(callback){
	let functionCallback = callback;
	ipcRenderer.send('getCards');
	ipcRenderer.on('recieveCards', (event, arg) => {
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

function openCardWindow(){
	if(cardWindow == null){
		cardWindow = new BrowserWindow({ title : "Interstellar - Card Manager", width: 400, height: 110, minWidth : 400, minHeight : 110, maxWidth : 400, maxHeight : 110,skipTaskbar : true,maximizable : false, fullscreenable : false });
		cardWindow.once('ready-to-show', () => {
			cardWindow.show();
		});
		getLocalPortNumber(function(port){
			cardWindow.loadURL('http://localhost:' + port + '/cardWindow');
		});
		cardWindow.on('closed', () => {
			cardWindow = null;
		});
	}else{
		cardWindow.focus();
	}
}

function listCardsInContainer(container,cards){
	var html = "";
	for(var i = 0;i < cards.length;i++){
		html += '<div class="stationConfig_cardContainer">';
			html += '<div class="stationConfig_cardImage" ondragstart="drag(event)" transferFrom="' + container.attr("id") + '" cardName="' + cards[i] + '" draggable="true" style="background-image:url(/cardImage?card=' + cards[i] + ')"></div>';
			html += '<div class="stationConfig_cardTitle">' + cards[i] + "</div>";
		html += '</div>';
	}
	container.html(html);
	sizeCardsToValue(widgetSize);
}

function setStationLayouts(newLayout){
	ipcRenderer.send('setStationLayouts',newLayout);
}

function getDatabase(callback){
	let functionCallback = callback;
	ipcRenderer.send('getDatabase');
	ipcRenderer.on('recieveDatabase', (event, arg) => {
		functionCallback(arg);
	});
}

function sizeCardsToValue(value){
	$(".stationConfig_cardContainer").css("width",value);
	$(".stationConfig_cardContainer").css("height",value * .9);
	$(".stationConfig_cardTitle").css("font-size" , Math.round(value / 10));
}

function createNewStation(stationName,stationType,stationTheme,cards){
	var newStation = 
	{
		"stationInfo":
		{
			"cards": cards,
			"stationTheme" : stationTheme,
			"name": stationName
		},
		"stationType" : stationType
	}
	stations.splice(stations.length,0,newStation);
	setStations(stations);
	listStations(stations);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("cardName", $(event.target).attr("cardName"));
    event.dataTransfer.setData("transferFrom",$(event.target).attr("transferFrom"));
}

function drop(event) {
    var cardName = event.dataTransfer.getData("cardName");
    var transferFrom = event.dataTransfer.getData("transferFrom");
    if(transferFrom == "stationConfig_possibleCards"){
    	//adding a card to a station
    	stations[selectedStation].stationInfo.cards.splice(stations[selectedStation].stationInfo.cards.length,0,cardName);
    	setStations(stations);
    	loadStationInfoForStation(selectedStation);
    }else{
    	//removing it from a station
    	for(var i = 0;i < stations[selectedStation].stationInfo.cards.length;i++){
    		if(stations[selectedStation].stationInfo.cards[i] == cardName){
    			stations[selectedStation].stationInfo.cards.splice(i,1);
    		}
    	}
    	setStations(stations);
    	loadStationInfoForStation(selectedStation);
    }
    event.preventDefault();
}

//event handlers
openDatabaseButton.click(function(event){
	openDatabaseWindow();
});

openCardWindowButton.click(function(event){
	openCardWindow();
});

resetDatabaseButton.click(function(event){
	ipcRenderer.send('resetDatabase');
	alert("Database cleared!\n\n(This is different from a database reset)");
});

loadStationLayoutButton.click(function(event){
	setStations(stationLayouts[selectedStationLayout].stations);
});
setDefaultLayoutButton.click(function(event){
	for(var i = 0;i < stationLayouts.length;i++){
		stationLayouts[i].isDefault = false;
	}
	stationLayouts[selectedStationLayout].isDefault = true;
	setStationLayouts(stationLayouts);
});
cardSizeRangeSlider.on("input",function(event){
	widgetSize = event.target.value;
	sizeCardsToValue(widgetSize);
});
stationNameTextbox.on("input",function(event){
	stations[selectedStation].stationInfo.name = event.target.value;
	setStations(stations);
	listStations(stations);
});
stationThemeDropdown.on("change",function(event){
	stations[selectedStation].stationInfo.stationTheme = event.target.value;
	setStations(stations);
	listStations(stations);
});	
stationTypeDropdown.on("change",function(event){
	stations[selectedStation].stationType = event.target.value;
	setStations(stations);
	listStations(stations);
});
saveLayoutButton.click(function(event){
	setLayoutNamePopup.fadeIn();
	mask.fadeIn();
});
cancelLayoutButton.click(function(event){
	setLayoutNamePopup.fadeOut(1000,function(){
		layoutNameTextbox.val("");
	});
	mask.fadeOut();
});
confirmSaveNewLayoutButton.click(function(event){
	setLayoutNamePopup.fadeOut();
	mask.fadeOut();

	var newLayoutName = layoutNameTextbox.val() != "" ? layoutNameTextbox.val() : "MY LAYOUT";

	var newLayout = {
		"isDefault":true,
		"name":newLayoutName,
		"stations" : stations
	}
	stationLayouts.splice(stationLayouts.length,0,newLayout);
	setLayouts(stationLayouts);
	listStationLayouts(stationLayouts);
	layoutNameTextbox.val("");
});
//intervals

//timeouts

setTimeout(function(){
	backgroundImage.css("background-image","url('/resource?path=public/background" + Math.floor(Math.random() * numberOfBackgroundImages) + ".jpg')")
	//fade in the background image
	backgroundImage.fadeIn(4000);
},0500);