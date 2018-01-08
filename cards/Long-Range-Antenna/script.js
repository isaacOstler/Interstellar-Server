//DOM references
var powerDistCanvas = $("#powerDist"),
	powerDistInfo = $("#powerDistInfo"),
	outgoingMessagesContainer = $("#outgoingMessages"),
	incomingMessagesContainer = $("#incomingMessages"),
	powerInUseLabel = $("#powerDistInfo_powerInUseLabel"),
	powerInUse = $("#powerDistInfo_powerInUse"),
	powerAvilableLabel = $("#powerDistInfo_totalPowerLabel"),
	powerAvilable = $("#powerDistInfo_totalPower"),
	powerDrawLabel = $("#powerDistInfo_powerDrawLabel"),
	powerDraw = $("#powerDistInfo_powerDraw");

//variables
var frequencies = 
	[
		{
			"systemName" : "federation frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),		//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  			//the required power levels
			"isDamaged" : false									//is the system damaged?
		},
		{
			"systemName" : "klingon frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),		//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  			//the required power levels
			"isDamaged" : false									//is the system damaged?
		},
		{
			"systemName" : "romulan frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),		//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  			//the required power levels
			"isDamaged" : false									//is the system damaged?
		},
		{
			"systemName" : "orion frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),			   				//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "general use frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),			   				//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "cardassian frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),			   				//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "ferengi frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),			   				//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "dominion frequency", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 9),			   				//the default power level
			"systemRequiredPowerLevels" : [3,6,50],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		}
	];

//class instances

var frequencyPowerLevels = new PowerDistributionDisplay(powerDistCanvas,frequencies);

	frequencyPowerLevels.on("dragStart",function(systems){
		console.log("dragStart");
	});
	frequencyPowerLevels.on("drag",function(systems){
		console.log("drag");
	});
	frequencyPowerLevels.on("dragFinish",function(systems){
		console.log("dragFinish");
	});

//init calls

//preset observers

//database observers

//functions
function drawGUI(){
	powerDistCanvas.height(frequencies.length * 20);
	powerDistInfo.height(outgoingMessagesContainer.height() - powerDistCanvas.height());
	powerDistInfo.css("top",40 + powerDistCanvas.height() + "px");
	frequencyPowerLevels.refresh();
}

//event handlers

//intervals