//DOM Refrences
var directionalCanvas = $("#canvas"),
    verticalCanvas = $("#verticalCanvas"),
    systemOfflineElement = $("#systemOffline"),
    systemOfflineElement_header = $("#systemOffline_header"),
    systemOfflineElement_subtitle = $("#systemOffline_subtitle");

//variables
var thrusterPower = 0,
    thrusterDirection = 0,
    verticalThrusterPower = 0.5,
    lastUpdated_thrusterPower = 0,
    lastUpdated_thrusterDirection = 0,
    lastUpdated_verticalThrusterPower = 0.5;
//init calls

//class instances
var thrusterDisplay = new ThrustersDisplayClass(directionalCanvas);
var verticalDisplay = new VerticalThrustersClass(verticalCanvas);

//preset obeservers

//database observers
Interstellar.onDatabaseValueChange("ship.systems",function(newData){
    if(newData == null){
        return; //DO NOT SET THIS VALUE HERE!
    }
    for(var i = 0;i < newData.length;i++){
        if(newData[i].systemName.toLowerCase() == "thrusters"){
            if(newData[i].isDamaged){
                systemOfflineElement.fadeIn();
                systemOfflineElement_header.html("SYSTEM OFFLINE");
                systemOfflineElement_subtitle.html("THIS SYSTEM HAS BEEN DAMAGED AND IS UNRESPONSIVE");
            }else if(newData[i].requiredPower[0] > newData[i].systemPower){
                systemOfflineElement.fadeIn();
                systemOfflineElement_header.html("INSUFFICIENT POWER");
                systemOfflineElement_subtitle.html("THIS SYSTEM HAS INSUFFICIENT POWER TO OPERATE");
            }else{
                systemOfflineElement.fadeOut();
            }
        }
    }
});

//functions

//event listeners
thrusterDisplay.on("drag",function(event){
    thrusterPower = thrusterDisplay.getPower();
    thrusterDirection = thrusterDisplay.getDirection();
});

thrusterDisplay.on("dragFinish",function(event){
    thrusterPower = thrusterDisplay.getPower();
    thrusterDirection = thrusterDisplay.getDirection();
});

verticalDisplay.on("drag",function(event){
    verticalThrusterPower = verticalDisplay.getPower();
});

verticalDisplay.on("dragFinish",function(event){
    verticalThrusterPower = verticalDisplay.getPower();
});

//intervals
setInterval(function(){
    var updateRequired = false;
    if(Number(lastUpdated_thrusterPower) != thrusterPower){
        updateRequired = true;
    }
    if(Number(lastUpdated_thrusterDirection) != thrusterDirection){
        updateRequired = true;
    }
    if(Number(lastUpdated_verticalThrusterPower) != verticalThrusterPower){
        updateRequired = true;
    }
    if(updateRequired){
        console.log({"thrusterPower" : thrusterPower,"thrusterDirection" : thrusterDirection,"verticalThrusterPower" : verticalThrusterPower});
        Interstellar.setDatabaseValue("thrusters.info",{"thrusterPower" : thrusterPower,"thrusterDirection" : thrusterDirection,"verticalThrusterPower" : verticalThrusterPower});
        lastUpdated_thrusterPower = Number(thrusterPower);
        lastUpdated_thrusterDirection = Number(thrusterDirection);
        lastUpdated_verticalThrusterPower = Number(verticalThrusterPower);
    }
},0100);