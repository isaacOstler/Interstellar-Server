//copyright Isaac Ostler, July 6th 2017, all rights reserved ©

var alertStatus = 5,
tractorBeamOffline = false,
tractorBeamHasNoPower = false;

//DOM References
var canvas = $("#sensorsArrayCanvas"),
    activateButton = $("#activateTractorBeamButton");

Interstellar.onDatabaseValueChange("tractorBeam.settings",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("tractorBeam.settings",tractorBeam);
        return;
    }
    tractorBeam = newData;
    if(tractorBeam.selectedContactGUID == ""){
        activateButton.fadeOut();
    }else{
        if(tractorBeam.activated){
            activateButton.html("DEACTIVATE TRACTOR BEAM");
        }else{
            activateButton.html("ACTIVATE TRACTOR BEAM");
        }
        activateButton.fadeIn();
    }
});

Interstellar.onDatabaseValueChange("ship.systems",function(newData){
    if(newData == null){
        return; //do NOT set this value here!
    }
    for(var i = 0;i < newData.length;i++){
        if(newData[i].systemName.toLowerCase() == "tractor beam"){
            tractorBeamOffline = !newData[i].isDamaged;
            tractorBeamHasNoPower = newData[i].requiredPower[0] <= newData[i].systemPower;
        }
    }
    drawSensorsGui();
});

Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("ship.alertStatus",5);
        return;
    }
    alertStatus = newData;
    drawSensorsGui();
});

function textCircle(ctx,text,x,y,radius,space,position,top){
   space = space || 0;
   var numRadsPerLetter = Sensors_Array_DegreesToRadians(3 - (10 / text.length));//(Math.PI - space * 2) / text.length;
   ctx.save();
   ctx.translate(x,y);
   var k = (top) ? 1 : -1; 
   ctx.rotate((-k * ((Math.PI - numRadsPerLetter) / 2 - space))+ position);
   for(var i=0;i<text.length;i++){
        ctx.save();
        ctx.rotate(k*i*(numRadsPerLetter));
        ctx.textAlign = "center";
        ctx.textBaseline = (!top) ? "top" : "bottom";
        ctx.fillText(text[i],0,-k*(radius));
        ctx.restore();
   }
   ctx.restore();
}

function Sensors_Array_DegreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}

function Sensors_Array_RadiansToDegrees(radians){
    return radians * (180 / Math.PI);
}

function modifyToBounds(number,min,max,exemption){ //bounds number to the specified min and max, but not by capping, by looping.
    if(arguments.length > 3){
        if(number == exemption){
            return number;
        }
    }
    if(number >= min && number <= max){
        return number;
    }else if(number < min){
        var placesOff = Math.abs(min - number);
        return modifyToBounds(max - placesOff,min,max);
    }else{
        var placesOff = number - max;
        return modifyToBounds(min + placesOff,min,max);
    }
}

//name: cartesian2Polar
//purpse: converts cartesian cords to polar cords, assuming origin is x:0 y:0 (top left)
//takes: x cord, y cord
//returns: object, containing distance and radians

function cartesian2Polar(x, y){
    //pythagorean theorem
    distance = Math.sqrt(x*x + y*y);
    //trig ... yuck
    radians = Math.atan2(y,x) //This takes y first
    //create the polarCoor object
    polarCoor = { distance:distance, radians:radians }
    //return this value to the orignal caller
    return polarCoor;
}

function polarToCartesian(polarCord){
    return {
        "x" : polarCord.distance * Math.cos(polarCord.radians),
        "y" : polarCord.distance * Math.sin(polarCord.radians)
    }
}

//event listeners

canvas.on("click",function(event){
    var actualRadius = ((canvas.width() * .2) * sensorsArraySizeMultipler);// + (canvas.width() * .2);
    var parentOffset = $(this).parent().offset(); 
    //or $(this).offset(); if you really just want the current element's offset
    var relX = event.pageX - parentOffset.left;
    var relY = event.pageY - parentOffset.top;
    var offset = ((canvas.width() * sensorsArraySizeMultipler) - canvas.width()) / 2;
    var xPercentage = (relX + offset) / (canvas.width() + (offset * 2));
    var yPercentage = (relY + offset) / (canvas.height() + (offset * 2));
    for(var i = 0;i < CompoundContactsArray.length;i++){
        if(CompoundContactsArray[i].isActive){
            if(withinRange(CompoundContactsArray[i].xPos, xPercentage * 100,CompoundContactsArray[i].width / 2) && withinRange(100 - CompoundContactsArray[i].yPos, yPercentage * 100,CompoundContactsArray[i].height / 2)){
                var newTractorBeamObject = tractorBeam;
                newTractorBeamObject.selectedContactGUID = CompoundContactsArray[i].GUID;
                Interstellar.setDatabaseValue("tractorBeam.settings",newTractorBeamObject);
            }
        }
    }
});

activateButton.click(function(event){
    var newTractorBeamObject = tractorBeam;
    newTractorBeamObject.activated = !newTractorBeamObject.activated;
    Interstellar.setDatabaseValue("tractorBeam.settings",newTractorBeamObject);
});

//intervals

setInterval(function(){ 
    drawSensorsGui();
},1000 / frameRate);
