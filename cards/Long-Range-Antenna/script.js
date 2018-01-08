//DOM references
var powerDistCanvas = $("#powerDist");
//variables
var frequencys = 
	[
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [10,15,20,25,35],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [10,14,18,22],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [2,5,8],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [4,12,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [16,18,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [14,16,18],  //the required power levels
			"isDamaged" : true							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [8,10,12],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [10,15,20,25,35],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [10,14,18,22],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [2,5,8],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [4,12,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [16,18,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [14,16,18],  //the required power levels
			"isDamaged" : true							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [8,10,12],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [10,15,20,25,35],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [10,14,18,22],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [2,5,8],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [4,12,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [16,18,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [14,16,18],  //the required power levels
			"isDamaged" : true							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 20),			   				//the default power level
			"systemRequiredPowerLevels" : [8,10,12],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [10,15,20,25,35],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [10,14,18,22],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [2,5,8],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [4,12,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [16,18,20],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [14,16,18],  //the required power levels
			"isDamaged" : true							//is the system damaged?
		},
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : Math.floor(Math.random() * 35),			   				//the default power level
			"systemRequiredPowerLevels" : [8,10,12],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		}
	];

//class instances
var frequencyPowerLevels = new PowerDistributionDisplay(powerDistCanvas,frequencys);

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

//event handlers

//intervals