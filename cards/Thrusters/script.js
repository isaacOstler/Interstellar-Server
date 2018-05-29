//DOM Refrences
var directionalCanvas = $("#canvas"),
    verticalCanvas = $("#verticalCanvas");

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