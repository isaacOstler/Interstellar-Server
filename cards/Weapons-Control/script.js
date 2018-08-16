//copyright Isaac Ostler, July 6th 2017, all rights reserved ©

var alertStatus = 5,
phasersOnline = false,
torpedosOnline = true,
phasersHaveNoPower = false,
torpedosHaveNoPower = true,
isDraggingTarget = false,
weaponErrorDisplay_interval = undefined;

//DOM References
var canvas = $("#sensorsArrayCanvas"),
    weaponErrorDisplay = $("#weaponErrorDisplay"),
    weaponErrorDisplay_textArea = $("#weaponErrorDisplay_textArea");

Interstellar.onDatabaseValueChange("ship.systems",function(newData){
    if(newData == null){
        return; //do NOT set this value here!
    }
    for(var i = 0;i < newData.length;i++){
        if(newData[i].systemName.toLowerCase() == "torpedoes"){
            torpedosOnline = !newData[i].isDamaged;
            torpedosHaveNoPower = newData[i].requiredPower[0] <= newData[i].systemPower;
        }
        if(newData[i].systemName.toLowerCase() == "phasers"){
            phasersOnline = !newData[i].isDamaged;
            phasersHaveNoPower = newData[i].requiredPower[0] <= newData[i].systemPower;
        }
    }
    drawSensorsGui();
});

Interstellar.onDatabaseValueChange("weaponStatus.targetPosition",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("weaponStatus.targetPosition",targetPosition);
        return;
    }
    targetPosition = newData;
    drawSensorsGui();
});

Interstellar.onDatabaseValueChange("weapons.weaponStatus",function(newData){
    if(newData == null){
        $.getJSON("/resource?path=public/weapons.json", function(loadedJSON){
            Interstellar.setDatabaseValue("weapons.weaponStatus",loadedJSON);
        });
        return;
    }
    weaponStatus = newData;
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

function showErrorDisplay(errorText){
    weaponErrorDisplay.slideDown(250);
    weaponErrorDisplay_textArea.html(errorText);
    if(weaponErrorDisplay_interval != undefined){
        clearInterval(weaponErrorDisplay_interval);
    }
    let flashState = false;
    let flashCount = 0;
    weaponErrorDisplay_interval = setInterval(function(){
        flashCount++;
        if(flashCount > 22){
            clearInterval(weaponErrorDisplay_interval);
            weaponErrorDisplay_interval = undefined;
            weaponErrorDisplay.slideUp(250);
            return;
        }
        flashState = !flashState;
        if(flashState){
            weaponErrorDisplay_textArea.addClass("flash");
        }else{
            weaponErrorDisplay_textArea.removeClass("flash");
        }
    },0175);
}

//event listeners
canvas.mousedown(function(event){
    var polarCords = cartesian2Polar(event.offsetX - ($(event.target).width() / 2),event.offsetY - ($(event.target).height() / 2));
    if(polarCords.distance <= (canvas.width() / 2) * .64){
        canvas.css("cursor","crosshair");
        isDraggingTarget = true;
        targetPosition.degrees = modifyToBounds(Sensors_Array_RadiansToDegrees(polarCords.radians) + 90,0,360,1000);
        targetPosition.distance = Math.min(polarCords.distance,(canvas.width() / 2) * .66);
        drawSensorsGui();
    }else{
        var i;
        var degree = modifyToBounds(Sensors_Array_RadiansToDegrees(polarCords.radians) + 90,0,360);
        var distance = polarCords.distance;
        for(i = 0;i < weaponStatus.length;i++){
            var minDistance = (canvas.width() / 2) * .83;
            var maxDistance = (canvas.width() / 2) * .91;
            if(weaponStatus[i].type != "phaser"){
                minDistance = (canvas.width() / 2) * .92;
                maxDistance = (canvas.width() / 2) * 1;
            }
            var startPosition = weaponStatus[i].direction;
            if(startPosition + weaponStatus[i].angleOfFire > 360 && !(degree > startPosition && degree < startPosition + weaponStatus[i].angleOfFire)){
                startPosition = startPosition - 360;
            }
            var endPosition = startPosition + weaponStatus[i].angleOfFire;


            var weaponsTargetting_startPosition = weaponStatus[i].direction;
            if(weaponsTargetting_startPosition + weaponStatus[i].angleOfFire > 360 && !(targetPosition.degrees > weaponsTargetting_startPosition && targetPosition.degrees < weaponsTargetting_startPosition + weaponStatus[i].angleOfFire)){
                weaponsTargetting_startPosition = weaponsTargetting_startPosition - 360;
            }
            var weaponsTargetting_endPosition = weaponsTargetting_startPosition + weaponStatus[i].angleOfFire;
            var targetIsInFiringRange = false;
            if(targetPosition.degrees > weaponsTargetting_startPosition && targetPosition.degrees < weaponsTargetting_endPosition){
                targetIsInFiringRange = true;
            }
            if(degree > startPosition && degree < endPosition){
                if(distance > minDistance && distance < maxDistance){
                    //clicked a broken weapon!
                    if((weaponStatus[i].type == "phaser" && !phasersOnline) || (weaponStatus[i].type == "torpedo" && !torpedosOnline)){
                        Interstellar.playErrorNoise();
                        showErrorDisplay("CANNOT FIRE - WEAPON HAS BEEN DAMAGED");
                        return;
                    }
                    //clicked a weapon with no power!
                    if((weaponStatus[i].type == "phaser" && !phasersHaveNoPower) || (weaponStatus[i].type == "torpedo" && !torpedosHaveNoPower)){
                        Interstellar.playErrorNoise();
                        showErrorDisplay("CANNOT FIRE - WEAPON DOES NOT HAVE POWER");
                        return;
                    }
                    //clicked a valid weapon!
                    if(!targetIsInFiringRange){
                        Interstellar.playErrorNoise();
                        showErrorDisplay("CANNOT FIRE - OUT OF RANGE");
                        return;
                    }
                    if(weaponStatus[i].type == "phaser"){
                        if(weaponStatus[i].weaponStatus.phaserCharge > 0){
                            //phasers charged
                            Interstellar.playRandomBeep();
                            var guidOfWeapon = guidGenerator();
                            var newWeapon = {
                                "type" : "phaser",
                                "GUID" : guidOfWeapon,
                                "direction" : degreesToRadians(targetPosition.degrees + 90),
                                "distance" : 0,
                                "phaserLength" : null,
                                "source" : "friendly"
                            }
                            weapons = weapons.concat(newWeapon);
                            updateContactsEarly();
                            //Interstellar.setDatabaseValue("sensors.weapons",weapons.concat(newWeapon));
                            Interstellar.setDatabaseValue("weaponStatus.weaponNotification",weaponStatus[i].weaponName + " FIRING");
                            let weaponID = guidOfWeapon;
                            let indexOfWeapon = i;
                            let chargeInterval = setInterval(function(){
                                weaponStatus[indexOfWeapon].weaponStatus.phaserCharge -= 0.02;
                                //weaponStatus[indexOfWeapon].weaponStatus.phaserHeat += .07 + (Math.random() * 0.02);
                                if(weaponStatus[indexOfWeapon].weaponStatus.phaserCharge < 0){
                                    weaponStatus[indexOfWeapon].weaponStatus.phaserCharge = 0;
                                    clearInterval(chargeInterval);
                                    for(var m = 0;m < weapons.length;m++){
                                        if(weapons[m].GUID == weaponID){
                                            weapons[m].phaserLength = weapons[m].distance;
                                        }
                                    }
                                    Interstellar.setDatabaseValue("weapons.weaponStatus",weaponStatus);
                                    $(document).off("mouseup.phaserRelease");
                                    updateContactsEarly();
                                }
                                if(weaponStatus[indexOfWeapon].weaponStatus.phaserHeat > 1){
                                    weaponStatus[indexOfWeapon].weaponStatus.phaserHeat = 1;
                                }
                            },0100);
                            $(document).on("mouseup.phaserRelease",function(event){
                                clearInterval(chargeInterval);
                                for(var m = 0;m < weapons.length;m++){
                                    if(weapons[m].phaserLength == null){
                                        weapons[m].phaserLength = weapons[m].distance;
                                    }
                                }
                                Interstellar.setDatabaseValue("weapons.weaponStatus",weaponStatus);
                                $(document).off("mouseup.phaserRelease");
                                updateContactsEarly();
                                //Interstellar.setDatabaseValue("sensors.weapons",weapons);
                            });
                        }else{
                            //phasers not charged
                            Interstellar.playErrorNoise();
                            showErrorDisplay("CANNOT FIRE - PHASER MUST BE RECHARGED");
                        }
                    }else{
                        if(weaponStatus[i].weaponStatus.torpedoLoaded){
                            weaponStatus[i].weaponStatus.torpedoLoaded = false;
                            //torpedo loaded
                            Interstellar.playRandomBeep();
                            var newWeapon = {
                                "type" : "torpedo",
                                "GUID" : "torpedo_" + guidGenerator(),
                                "direction" : degreesToRadians(targetPosition.degrees + 90),
                                "xPos" : 50,
                                "yPos" : 50,
                                "source" : "friendly"
                            }
                            weapons = weapons.concat(newWeapon);
                            updateContactsEarly();
                            //Interstellar.setDatabaseValue("sensors.weapons",weapons.concat(newWeapon));
                            Interstellar.setDatabaseValue("weapons.weaponStatus",weaponStatus);
                            Interstellar.setDatabaseValue("weaponStatus.weaponNotification",weaponStatus[i].weaponName + " FIRED");
                        }else{
                            //torpedo not loaded
                            Interstellar.playErrorNoise();
                            showErrorDisplay("CANNOT FIRE - NO TORPEDO HAS BEEN LOADED")
                        }
                    }
                    return;
                }
            }
        }
        //no weapon clicked
    }
});
canvas.mouseup(function(event){
    canvas.css("cursor","default");
    Interstellar.setDatabaseValue("weaponStatus.targetPosition",targetPosition);
    isDraggingTarget = false;
});
canvas.mousemove(function(event){
    if(isDraggingTarget){
        var polarCords = cartesian2Polar(event.offsetX - ($(event.target).width() / 2),event.offsetY - ($(event.target).height() / 2));
        targetPosition.degrees = modifyToBounds(Sensors_Array_RadiansToDegrees(polarCords.radians) + 90,0,360,1000);
        targetPosition.distance = Math.min(polarCords.distance,(canvas.width() / 2) * .66);
        drawSensorsGui();
    }else{
        var polarCords = cartesian2Polar(event.offsetX - ($(event.target).width() / 2),event.offsetY - ($(event.target).height() / 2));
        if(polarCords.distance >= (canvas.width() / 2) * .75){
            var i;
            var degree = modifyToBounds(Sensors_Array_RadiansToDegrees(polarCords.radians) + 90,0,360);
            var distance = polarCords.distance;
            for(i = 0;i < weaponStatus.length;i++){
                var minDistance = (canvas.width() / 2) * .83;
                var maxDistance = (canvas.width() / 2) * .91;
                if(weaponStatus[i].type != "phaser"){
                    minDistance = (canvas.width() / 2) * .92;
                    maxDistance = (canvas.width() / 2) * 1;
                }
                var startPosition = weaponStatus[i].direction;
                if(startPosition + weaponStatus[i].angleOfFire > 360 && !(degree > startPosition && degree < startPosition + weaponStatus[i].angleOfFire)){
                    startPosition = startPosition - 360;
                }
                var endPosition = startPosition + weaponStatus[i].angleOfFire;

                if(degree > startPosition && degree < endPosition){
                    if(distance > minDistance && distance < maxDistance){
                        canvas.css("cursor","pointer");
                        return;
                    }
                }

                /*if(degree > weaponStatus[i].direction && degree < weaponStatus[i].direction + weaponStatus[i].angleOfFire){
                    if(distance > minDistance && distance < maxDistance){
                        canvas.css("cursor","pointer");
                        return;
                    }
                }*/
            }
            canvas.css("cursor","default");
        }else{
            canvas.css("cursor","crosshair");
        }
    }
});