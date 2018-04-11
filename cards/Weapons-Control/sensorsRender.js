    //copyright Isaac Ostler, September 12th 2017, all rights reserved ©

/*

    "Wait!"  You might be saying...  "What is this!?"
    "didn't you already make sensors?  With the awesome graphics!?"
    YES I DID!  ... AND I DID IT WRONG!  I made many many many mistakes in my coding.
    Mistakes that I've set out to correct.  I've fundamentally rewritten sensors,
    and this is version 2.0.  New and improved!  Faster, more stable, and with
    the proper documentation and framework to support safe and effective expansion as time goes on!

    The old sensors was going to be a pain to fix bugs with that it was unrealistic to keep the old system.
    Even while I was designing it, I secretly knew in my heart that it was going to have to be redone.

    I've learned from my mistakes.  Done research, and actually followed good standards with this version.

    Here are the things I did different this time around:

    1) ACTUALLY MAPPED IT OUT!  (Which I'll explain how it works below)
    2) Instead of updating every... single.... position.... over the server (which actually worked surprisingly well last time),
       I instead LERP positions (https://en.wikipedia.org/wiki/Linear_interpolation).  This allows clients to effectively
       guess what position contacts should be at until the server gets a chance to unify everyone.  This means that instead
       of updating the server at 30 FPS, I can update the server at 10 FPS (or less) and client animations will still appear
       to be holding 30-60 FPS (or more!).  This puts the load on the clients instead of the network, which greatly reduces
       server load, and decreases the chance of collisions when updating.
    3) Proper documentation and commenting was a priority this time.  Which means sensors will be easier to upkeep.
       IF YOU ARE EDITING THIS CODE, FOLLOW THIS RULE!!!!  OR I WILL COME BACK TO PUNISH YOU!
    4) Simplified the "sensors engine".  I made it much easier to add and remove contacts, and functions only do one thing
       (instead of, like, 50 things... which caused strange bugs).
    5) Last but not least, the GUI followed better HTML and CSS standards.  Resizing actually worked with this build.

    Here is how sensors works.

        +---------+
    +-> |New Data!+
    |   +----+----+ 
    |        | 
    |        v     These arrays don't trigger the process (unless there are NO sensor contacts), but are updated the next cycle
    |  +-----+----------+ +-------------------------------------++-------------------------------------------------------+
    |  |Sensors Contacts| |Weapons Contacts|Program Contacts|etc||                                                       |
    |  +----------------+ +-------------------------------------+|  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  |
    |       |                                                    |  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  |
    |       v                                                    |  XXXXXXXXXXXXXXXXX LOCAL UPDATES XXXXXXXXXXXXXXXXXXX  |
    |  +-------------------------------------------------------+ |  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  |
    |  |                                                       | |  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  |
    |  | Merge all of these separate +-----------------------+ | |  +-------------------------------------------+        |
    |  | Contact arrays into one     | CompoundContactsArray | | |  | Update contacts with new LERPed positions |        |
    |  | compound contacts array     +-----------------------+ | |  +-+-----------------------------------------+        |
    |  |                                                       | |    ^                                                  |
    |  +-+-----------------------------------------------------+ |    |                                                  |
    |    |                                                       |  +-+------------------------------------+             |
    |    |    +--For Each Contact In CompoundContactsArray-----+ |  | LERP between the last data, and guess|             |
    |    |    |                                                | |  | where the next data will be.         |             |
    |    +--->+  Force their position to the new position.     | |  +-+------------------------------------+             |
    |         |  Update their size.  Update Infrared, etc etc. | |    ^                                                  |
    |         |  This has the potential to cause lag/jumps.    | |    |                                                  |
    |    +----+                                                | |  +-+---------------------------------+                |
    |    |    +------------------------------------------------+ |  |                                   |                |
    |    |                                                       |  | 30-60 FPS (Every 33 milliseconds) |                |
    |    v                                                       |  |                                   |                |
    |  +-+----------------------------+                          |  +-+---------------------------------+                |
    |  |                              |                          |    ^                                                  |
    |  | Clear old animation Interval +-------------------------------+                                                  |
    |  |                              |                          |                                                       |
    |  +--+---------------------------+                          +-------------------------------------------------------+
    |     |
    |     v
    |  +--+------------+      +------------+-------------------------------------------------------------------------------------------+
    |  | If core...Y/N +-YES->+Set Timeout | In 100 milliseconds (or whatever the update speed is) update the server with new positions|
    |  +---------------+      +----+-------+-------------------------------------------------------------------------------------------+
    |                              |
    +------------------------------+

    As you can see, it's actually a very simple process.  The above diagram simple shows how we keep track of contacts positions
    when they are animating.  With this solution, there is one potential problem though.

    Q) What if the network update comes too early or too late?  What if it isn't exactly 100 milliseconds... or
       whatever the update speed is?

    A) Unfortunately... you'll get a sudden jump.  That being said, the jump will probably be so small that it won't be noticed.
       During times with significant server load, this jump may become more noticeable and more frequent.

    That being said... dive into the code and see what you can figure out.  Here is a map of the code:
    (These line numbers might not be too accurate... just a heads up...  But the order should be right)

    (~99) Interstellar core widget setup
    (?) Interstellar definitions
    (?) Variable definitions
    (?) DOM references
    (?) init calls
    (?) preset observers
    (?) database observers
    (?) functions
    (?) three.js functions
    (?) event handlers
    (?) intervals

*/

//variables
var alertStatus = 5, //the ships alert status
    weaponStatus = [],
    targetPosition = 
    {
        "degrees" : 0,
        "distance" : 50
    },
    phaserSpeed = .15, //how fast phasers fire
    thisWidgetName = "Weapons-Control", //the name of this widget (since for a while, it was called new-sensors-core)
    animationInterval = undefined, //the variable pointing to the animation interval
    networkRefreshTimeout = undefined, //the variable pointing to the network update timeout
    frameRate = 60, //the frame rate for the sensors array (how many frames per second)
    networkRefreshRate = 150, //how many milliseconds until the network is updated on the contacts positions
    contacts = [], //sensor contacts
    infraredActive = false,
    noAnimationCycleInProgress = false, //this variable helps us know if we need to restart the animation cycle (if it's been sleeping)
    selectionDragPoints = //these points are used to draw the drag selection box
    {
        "startX" : 0,
        "startY" : 0,
        "endX" : 0,
        "endY" : 0
    },
    selectedContacts = [], //selected contacts by the flight director, these can be dragged around
    selectedContactOffsets = [], //x and y offset objects from selectedContacts array;
    draggingContactsMouseOffset = 
    {
        "x" : 0,
        "y" : 0
    },
    isDraggingContacts = false,
    moveAllSpeeds = 
    {
        "x" : 0,
        "y" : 0
    },
    CompoundContactsArray = [],
    contactTextures = [],
    explosionTextures = [
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy1.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy1.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy1.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy2.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy2.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy2.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy2.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy3.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy3.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy3.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy3.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy4.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy4.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy4.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy5.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy5.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy5.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy5.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy6.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy6.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy6.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy7.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy7.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy7.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy8.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy8.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy8.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy9.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy9.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy9.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy10.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy10.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy10.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy11.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy11.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy11.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy12.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy12.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy12.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy13.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy13.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy13.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy14.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy14.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy14.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy14.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy15.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy15.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy15.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy15.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy16.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy16.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy16.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy17.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy17.png&screen=" + thisWidgetName),
        new THREE.TextureLoader().load("/resource?path=public/Explosion/Destroy17.png&screen=" + thisWidgetName)
    ],
    materialCount = [],
    effects = [],
    torpedoTextures = [
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Weapons/Torpedo.png&screen=" + thisWidgetName),transparent: true } ),
    ],
    asteroidTextures = [
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid1.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid2.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid3.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid4.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid5.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid6.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid7.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid8.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid9.png&screen=" + thisWidgetName),transparent: true } ),
        new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("/resource?path=public/Asteroids/Asteroid10.png&screen=" + thisWidgetName),transparent: true } )
    ],
    nebulaTextures = [
        new THREE.TextureLoader().load("/resource?path=public/Nebula/nebula1.png&screen=" + thisWidgetName)
    ],
    weapons = [],
    programs = [
        /*{
            "type" : "planet", //we have several different things that go on the sensors array, so we have to specify
            "GUID" : guidGenerator(),
            "icon" : "/resource?path=public/Planets/1Terran1.png",
            "xPos" : 50,
            "size" : .5,
            "yPos" : 90,
            "rotation" : 0,
            "rotationSpeed" : .0005
        },
        {
            "GUID" : guidGenerator(),
            "type" : "asteroid",
            "xPos" : 20,
            "yPos" : 20,
            "size" : .02,
            "rotation" : 2,
            "rotationSpeed" : .02,
            "asteroidIcon" : 1
        }*/
    ],
    scanningObject,
    scanAnswer = null,
    averageScanTime = 120,
    sensorsArraySizeMultipler = 3,
    //three.js stuff
    camera, scene, renderer,
    frustumSize = 100 / sensorsArraySizeMultipler;
//DOM references
var canvas = $("#sensorsArrayCanvas"),
    canvasContainer = $("#sensorsArray"),
    maskElement = $("#mask"),
    maskElement_maskCircle = $("#mask_circle");
//init calls

drawSensorsGui();
initThreeJS();

//preset observers

//database observers
Interstellar.onDatabaseValueChange("sensors.externalScans.scanAnswer",function(newData){
    //new scan answer, woo
    scanAnswer = newData;
    //if we are making a scan, and it's past 100%, answer
    if(scanAnswer != null && scanningObject.timePassed / scanningObject.timeRequired > 1){
        flashElement(scanAnswerTextArea,10);
        scanAnswerTextArea.html(scanAnswer);
        //and remove the old scan
        Interstellar.setDatabaseValue("sensors.externalScans.scanObject",null);
    }
});
Interstellar.onDatabaseValueChange("sensors.moveAllSpeeds",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
        return;
    }
    moveAllSpeeds = newData;
});
Interstellar.onDatabaseValueChange("sensors.weapons",function(newData){
    //if no weapons were found on the server
    if(newData == null){
        //set it to the default weapons value
        Interstellar.setDatabaseValue("sensors.weapons",weapons);
        //terminate execution of this function
        return;
    }
    //update the weapons array with the new data
    weapons = newData;
    if(noAnimationCycleInProgress){
        animationCycle(contacts);
    }
    noAnimationCycleInProgress = false;
});
Interstellar.onDatabaseValueChange("sensors.programs",function(newData){
    if(newData == null){
        /*
        for(var j = 0;j < 20;j++){
            for(var i = 0;i < 10;i++){
                var newAsteroid = {
                    "GUID" : guidGenerator(),
                    "type" : "nebula",
                    "xPos" : 70 * Math.random() + 15,
                    "yPos" : 20 * Math.random() + (100 + (j * 20)),
                    "size" : .5 * Math.random() + .5,
                    "rotation" : 2 * Math.random(),
                    "rotationSpeed" : .01 * Math.random() -.0075,
                    "nebulaIcon" : 0,
                    "color" : (0.00002 * Math.random()) + (Math.PI * 2)
                }
                programs.splice(programs.length,0,newAsteroid);
            }
        }
        for(var j = 0;j < 256;j++){
            var newAsteroid = {
                "GUID" : guidGenerator(),
                "type" : "asteroid",
                "xPos" : Math.random() * 80 + 10,
                "yPos" : Math.random() * 80 + 10,
                "size" : Math.random() * .02 + .02,
                "rotation" : Math.random() * 2,
                "rotationSpeed" : Math.random() * .06,
                "asteroidIcon" : Math.floor(Math.random() * asteroidTextures.length)
            }
            programs.splice(programs.length,0,newAsteroid);
        }*/
        Interstellar.setDatabaseValue("sensors.programs",programs);
        return;
    }
    programs = newData;
    if(noAnimationCycleInProgress){
        animationCycle(contacts);
    }
    noAnimationCycleInProgress = false;
});

Interstellar.onDatabaseValueChange("sensors.effects",function(newData){
    //if this value hasn't been set
    if(newData == null){
        //set it
        Interstellar.setDatabaseValue("sensors.effects",effects);
        return;
    }
    effects = newData;
    if(noAnimationCycleInProgress){
        animationCycle(contacts);
    }
    noAnimationCycleInProgress = false;
});

Interstellar.onDatabaseValueChange("sensors.contacts",function(newData){
    //this entire function is plotted out in a diagram at the top of the document.

    //if there is no new data (the value hasn't been set on the database yet)
    if(newData == null){
        //for debugging purposes, I've generated a test value
        
        var presetContacts =[];/*
        for(var k = 0;k < 500;k++){
            var newContact = {
                    "GUID" : guidGenerator(),
                    "xPos" : Math.random() * 100,
                    "yPos" : Math.random() * 100,
                    "wantedX" : Math.random() * 100,
                    "wantedY" : Math.random() * 100,
                    "animationSpeed" : Math.random() * 3000,
                    "xStep" : undefined,
                    "yStep" : undefined,
                    "attributes" :
                    {
                        "isActive" : true
                    }
                }
            presetContacts.splice(presetContacts.length,0,newContact);
        }*/
        //set the default value
        Interstellar.setDatabaseValue("sensors.contacts",presetContacts);
        //terminate execution of this function
        return;
    }
    noAnimationCycleInProgress = false;
    animationCycle(newData);
});
function flashElement(element,numberOfFlashes){
    let flashCount = 0,
        flashState = false,
        interval = setInterval(function(){
            if(flashCount >= numberOfFlashes){
                clearInterval(interval);
                element.removeClass("flash");
                return;
            }
            if(!flashState){
                element.addClass("flash");
                flashCount++;
            }else{
                element.removeClass("flash");
            }
            flashState = !flashState;
    },0100);
}


function drawTextAlongArc(context, str, centerX, centerY, radius, angle,font){
    context.save();
    context.translate(centerX, centerY);
    context.rotate(3.14159);
    context.rotate(3.14159 * (angle / str.length) / 2);
    for (var n = 0; n < str.length; n++) {
        context.rotate(angle / str.length);
        context.save();
        context.translate(0, -1 * radius);
        var char = str[n];
        context.font= font;
        context.fillStyle= "white";
        context.fillText(char, 0, 0);
        context.restore();
    }
    context.restore();
}

function animationCycle(newData){
    contacts = newData;
    //compile all the arrays into one compoundArray
    CompoundContactsArray = newData.concat(programs,weapons,effects);
    //if there is already an animation interval
    if(animationInterval != undefined){
        //clear it
        clearInterval(animationInterval);
    }
    //define a new animation interval
    animationInterval = setInterval(function(){
        var i;
        //cycle through every object
        for(i = 0;i < CompoundContactsArray.length;i++){
            if(CompoundContactsArray[i].type == "contact"){
                //are they at their target destination
                if(!(withinRange(CompoundContactsArray[i].xPos,CompoundContactsArray[i].wantedX,.2)) || !(withinRange(CompoundContactsArray[i].yPos,CompoundContactsArray[i].wantedY,.2))){
                    //nope, let's move them closer

                    //do they have animation steps?
                    if(contacts[i].xStep == undefined || contacts[i].yStep == undefined){
                        //we must first calculate their steps
                        //what is the difference between them?
                        var differenceX = Number(CompoundContactsArray[i].wantedX - CompoundContactsArray[i].xPos);
                        var differenceY = Number(CompoundContactsArray[i].wantedY - CompoundContactsArray[i].yPos);
                        //now we divide their animation time by the distance (v=d/t...)
                        CompoundContactsArray[i].xStep = (differenceX / Number(CompoundContactsArray[i].animationSpeed));
                        CompoundContactsArray[i].yStep = (differenceY / Number(CompoundContactsArray[i].animationSpeed));
                    }

                    //the step values are how far they should travel for every refreshRate
                    //so we just have to divide the frameRate by the refresh rate to get a scaler
                    var scaler = frameRate / networkRefreshRate;
                    //now add the scaled xStep to the xPos
                    CompoundContactsArray[i].xPos += (scaler * CompoundContactsArray[i].xStep);
                    //same for the y
                    CompoundContactsArray[i].yPos += (scaler * CompoundContactsArray[i].yStep);
                }else{
                    //already at it's destination
                }
                var scaler = frameRate / networkRefreshRate;
                //let's also factor in the move all speed
                CompoundContactsArray[i].xPos += (scaler * moveAllSpeeds.x);
                CompoundContactsArray[i].wantedX += (scaler * moveAllSpeeds.x);
                //same for the y
                CompoundContactsArray[i].yPos += (scaler * moveAllSpeeds.y);
                CompoundContactsArray[i].wantedY += (scaler * moveAllSpeeds.y);
            }else if(CompoundContactsArray[i].type == "phaser" || CompoundContactsArray[i].type == "torpedo"){
                //we need to know if these weapons hit anyone
                var GUID_ofImpactedObject = undefined;
                //first we need to know our own X and our own Y
                var weaponCartCords = {"x" : 0,"y" : 0};
                if(CompoundContactsArray[i].type == "phaser"){
                    weaponCartCords = polarToCartesian({"radians" : CompoundContactsArray[i].direction, "distance" : CompoundContactsArray[i].distance});
                    weaponCartCords.x = -weaponCartCords.x;
                }else{
                    //torpedo
                    weaponCartCords.x = CompoundContactsArray[i].xPos - 50;
                    weaponCartCords.y = CompoundContactsArray[i].yPos - 50;
                }
                for(var l = 0;l < CompoundContactsArray.length;l++){
                    if(CompoundContactsArray[l].type != "phaser" && CompoundContactsArray[l].type != "torpedo" && CompoundContactsArray[l].type != "nebula" && CompoundContactsArray[l].type != "explosion"){
                        var polarCords = cartesian2Polar(CompoundContactsArray[l].xPos - (weaponCartCords.x + 50),CompoundContactsArray[l].yPos - (weaponCartCords.y + 50));
                        var hitDistance = 1;
                        /*if(CompoundContactsArray[i].type != "torpedo"){
                            hitDistance = 1;
                        }*/
                        if(!isNaN(polarCords.distance)){
                            /*
                            if(CompoundContactsArray[l].name == "odyssey"){
                                console.log(polarCords.distance);
                            }*/
                            if(polarCords.distance < hitDistance){
                                if(CompoundContactsArray[l].isActive){
                                    GUID_ofImpactedObject = CompoundContactsArray[l].GUID;
                                }
                            }
                        }
                    }
                }
                if(GUID_ofImpactedObject == undefined){
                    if(CompoundContactsArray[i].type == "phaser"){
                        CompoundContactsArray[i].distance += scaler * phaserSpeed;
                        var scaler = frameRate / networkRefreshRate;
                    }else{
                        //so we just have to divide the frameRate by the refresh rate to get a scaler
                        var scaler = frameRate / networkRefreshRate;
                        //now add the scaled xStep to the xPos
                        CompoundContactsArray[i].xPos -= (getStepsFromAngle(CompoundContactsArray[i].direction).x * scaler);
                        //same for the y
                        CompoundContactsArray[i].yPos += (getStepsFromAngle(CompoundContactsArray[i].direction).y * scaler);
                        //let's also factor in the move all speed
                        CompoundContactsArray[i].xPos += (scaler * moveAllSpeeds.x);
                        //same for the y
                        CompoundContactsArray[i].yPos += (scaler * moveAllSpeeds.y);
                    }
                }else{
                    var impactedObject_index = -1;
                    for(var l = 0;l < CompoundContactsArray.length;l++){
                        if(CompoundContactsArray[l].GUID == GUID_ofImpactedObject){
                            impactedObject_index = l;
                        }
                    }
                    for(var l = 0;l < weapons.length;l++){
                        //BOOOM!!! AAHAHAH (remove the contact and create an explosion)
                        if(weapons[l].GUID == CompoundContactsArray[i].GUID){
                            //console.log(GUID_ofImpactedObject + " WAS HIT BY A " + CompoundContactsArray[i].type + "!");
                            createExplosionAtPoint(CompoundContactsArray[impactedObject_index].xPos,CompoundContactsArray[impactedObject_index].yPos,Math.random() * .04 + .01);
                            //remove this weapon
                            weapons.splice(l,1);
                            CompoundContactsArray.splice(i,1);
                            break;
                        }
                    }
                }
            }else if(CompoundContactsArray[i].type == "explosion"){

                //let's factor in the move all speed
                var scaler = frameRate / networkRefreshRate;
                CompoundContactsArray[i].xPos += (scaler * moveAllSpeeds.x);
                //same for the y
                CompoundContactsArray[i].yPos += (scaler * moveAllSpeeds.y);
            }else if(CompoundContactsArray[i].type != "contact"){
                //programs are cool :)
                //let's factor in the move all speed
                var scaler = frameRate / networkRefreshRate;
                CompoundContactsArray[i].xPos += (scaler * moveAllSpeeds.x);
                //same for the y
                CompoundContactsArray[i].yPos += (scaler * moveAllSpeeds.y);
                if(CompoundContactsArray[i].yPos + (CompoundContactsArray[i].size * 100) < 0){
                    for(var l = 0;l < programs.length;l++){
                        if(programs[l].GUID == CompoundContactsArray[i].GUID){
                            programs.splice[l,1];
                        }
                    }
                }
                //might as well rotate the thing too
                CompoundContactsArray[i].rotation += (CompoundContactsArray[i].rotationSpeed * scaler);
            }
        }
        //now we cut out anything that shouldn't be there (if infrared is active)
        var finalContactsToRender = [];
        for(var j = 0;j < CompoundContactsArray.length;j++){
            if(CompoundContactsArray[j].type == "contact"){
                if(CompoundContactsArray[j].isActive){
                    finalContactsToRender.splice(finalContactsToRender.length,0,CompoundContactsArray[j]);
                }
            }else{
                finalContactsToRender.splice(finalContactsToRender.length,0,CompoundContactsArray[j]);
            }
        }
        updateContactsOnArray(finalContactsToRender);
    },1000 / frameRate); //this calculates the frame rate (remember, this is in milliseconds)
}
//functions

//this function returns true if these values are within the passed variance
function withinRange(value1,value2,variance){
    return(value1 < value2 + variance && value1 > value2 - variance);
}

function initThreeJS(){
    //set the aspect ratio for the camera
    var aspect = canvas.width() / canvas.height();
    //create the new orthographic camera (orthographic cameras don't show depth)
    camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
    //set the camera position
    camera.position.z = 100;
    camera.position.x = 50;
    camera.position.y = 50;
    //create the scene
    scene = new THREE.Scene();
    //create the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    //set the renderer size
    renderer.setSize( canvas.width(), canvas.height() );
    //set the DOM element size
    $(renderer.domElement).css("left",$(canvas).css("left"));
    $(renderer.domElement).css("top",$(canvas).css("top"));
    $(renderer.domElement).width(canvas.width());
    $(renderer.domElement).height(canvas.height());
    //add the DOM.
    $(renderer.domElement).attr("id","sensorsArrayTHREE_CANVAS");
    canvasContainer.append(renderer.domElement);
    //now we need to preload materials that we load a lot, to save time

    /*
    Interstellar.getFileNamesInFolder("/public/Explosion",thisWidgetName,function(files){
        var i;
        for(i = 0;i < files.length;i++){
            //load that file
            var texture = new THREE.TextureLoader().load( '/resource?path=public/Explosion/' + files[i] + '&screen=' + thisWidgetName );
            //now we need to make a material with that texture
            var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
            explsionMaterials.splice(explsionMaterials.length,0,material);
        }
    });*/
    //boom.  Done.  Init-ed
}

function drawSensorsGui(){
    //grab a reference to the canvas and it's drawing context
    var c = document.getElementById(canvas.attr("id"));
    var ctx = c.getContext("2d");

    //we need the canvas to be square
    //so if the width is greater than the height

    if(canvas.width() > canvas.height()){
        //set the width to the height
        canvas.width(canvas.height());
    //otherwise if the height is greater than the width
    }else if(canvas.height() > canvas.width()){
        //set the height to the width
        canvas.height(canvas.width());
    }

    canvas.css("left",(1 - (canvas.width() / canvasContainer.width())) / 2 * canvasContainer.width() + "px");
    canvas.css("top",(1 - (canvas.height() / canvasContainer.height())) / 2 * canvasContainer.height() + "px");
    //set the mask width and height to match the canvas width and height

    //set the array size to half of 80% of the sensor array width
    var circleRadius = ((canvas.width() * .8) / 2) * sensorsArraySizeMultipler;
        center = (circleRadius / sensorsArraySizeMultipler) + (canvas.width() * .1); //this is the absolute center of the canvas
        
    /*maskElement.width(canvas.width());
    maskElement.height(canvas.height());
    maskElement.css("left",canvas.position().left);
    maskElement.css("top",canvas.position().top);
    maskElement_maskCircle.attr("cx",50 + "%");
    maskElement_maskCircle.attr("cy",50 + "%");*/

    document.getElementById(maskElement.attr("id")).setAttribute('width', canvas.width());
    document.getElementById(maskElement.attr("id")).setAttribute('height', canvas.height());
    maskElement_maskCircle.attr("r",((circleRadius / sensorsArraySizeMultipler) / canvas.width()) * canvas.width() + 2 + "px");
    //html canvas elements need to be told what their working area
    //for their height and width is.  In this case we will just set
    //it to the element's width and height.
    c.width = canvas.width();
    c.height = canvas.height();
    //set the color of the sensors array depending on the alert status
    switch(alertStatus){
        case "5":
        ctx.strokeStyle="white"; //set the color to white
        break;
        case "4":
        ctx.strokeStyle="#00ffd8"; //set the color to a greenish blue color
        break;
        case "3":
        ctx.strokeStyle="#fff600"; //set the color to yellow
        break;
        case "2":
        ctx.strokeStyle="#ffb200"; //set the color to orange
        break;
        case "1":
        ctx.strokeStyle="red"; //set the color to red
        break;
        default: //in case the alert status is something wierd, default to this
        ctx.strokeStyle="white"; //set the color to white
        break;
    }
    //clear the canvas (in case this isn't the first time we have drawn)
    ctx.clearRect(0, 0, canvas.width(), canvas.height());
    //set the line width to 1.5
    ctx.lineWidth = 1.5;
    //start drawing
    ctx.beginPath();
    //draw the first circle
    ctx.arc(center, center, circleRadius, 0, 2 * Math.PI);
    //move in a little bit
    ctx.moveTo(center + (circleRadius / 1.5),center);
    //draw again, this time make the circle smaller
    ctx.arc(center, center, circleRadius / 1.5, 0, 2 * Math.PI);
    //move in a little bit more
    ctx.moveTo(center + (circleRadius / 3),center);
    //draw the last circle, a little bit smaller
    ctx.arc(center, center, circleRadius / 3, 0, 2 * Math.PI);
    //move to the center
    ctx.moveTo(center,center);
    //set the number of lines (usually 12)
    ctx.stroke();

    var numberOfLines = 12;
    //draw each line
    for(var i = 0;i < numberOfLines;i++){
        //basic math here, set the line to it's position on the outer edge
        var x = ((circleRadius / sensorsArraySizeMultipler) * Math.cos(((2 * Math.PI / numberOfLines) * i) + degreesToRadians(15)) + center);
        var y = ((circleRadius / sensorsArraySizeMultipler) * Math.sin(((2 * Math.PI / numberOfLines) * i) + degreesToRadians(15)) + center);
        //move to to that position we just valuated
        ctx.lineTo(x,y);
        //go back to the center for the next line
        ctx.moveTo(center,center);
    }
    var innerRadius = circleRadius * 1.5,
        outerRadius = 0;


    ctx.stroke();

    /*
    var gradient = ctx.createRadialGradient(center, center, innerRadius, center, center, outerRadius);
    switch(Number(alertStatus)){
        case 5:
        gradient.addColorStop(0, 'rgba(66, 191, 244, 0.3)'); //set the color to white
        break;
        case 4:
        gradient.addColorStop(0, 'rgba(65, 244, 166, 0.3)'); //set the color to a greenish blue color
        break;
        case 3:
        gradient.addColorStop(0, 'rgba(244, 238, 66, 0.3)'); //set the color to yellow
        break;
        case 2:
        gradient.addColorStop(0, 'rgba(172, 119, 32, 0.6)'); //set the color to orange
        break;
        case 1:
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)'); //set the color to red
        break;
        default: //in case the alert status is something wierd, default to this
        gradient.addColorStop(0, 'rgba(66, 191, 244, 0.3)');
        break;
    }
    gradient.addColorStop(.6, 'rgba(0, 0, 0, 0.7)');

    ctx.moveTo(center,center);
    //make the final circle
    ctx.arc(center, center, circleRadius, 0, 2 * Math.PI);
    //set the gradient
    ctx.fillStyle = gradient;
    //fill the gradient
    //ctx.fill();
    //draw everything to the canvas
    ctx.stroke();*/
    //now we need to draw the strokes for the drag selections
    //I like lime colored selections
    ctx.strokeStyle="rgba(25,255,25,.9)";
    //define the box height and width
    var dragSelectionWidth = selectionDragPoints.endX - selectionDragPoints.startX,
        dragSelectionHeight = selectionDragPoints.endY - selectionDragPoints.startY;
    //create the rect
    ctx.beginPath();
    ctx.rect(selectionDragPoints.startX,selectionDragPoints.startY,dragSelectionWidth,dragSelectionHeight);
    //we want a lime fill
    ctx.fillStyle = "rgba(25,255,25,.3)";
    ctx.fill();
    //and a dashed selection border
    ctx.setLineDash([3,1]);
    //and a smaller stroke style
    ctx.lineWidth = 1.5;
    //draw!
    ctx.stroke();
    //restore the stroke style back to white
    ctx.strokeStyle="white";

    ctx.setLineDash([1,.1]);
    //Now time for scanning objects!
    if(scanningObject != undefined){
        var innerRadius = circleRadius * (scanningObject.timePassed / scanningObject.timeRequired),
        outerRadius = 0,
        // Radius of the entire circle.
        radius = circleRadius / sensorsArraySizeMultipler;
        var segmentSize = degreesToRadians(360 / 12);
        var position = scanningObject.direction - 3; //-3 so that 1 o'clock is actually 1 o'clock, not 3 o'clock

        var oldStyle = ctx.strokeStyle;
        var oldLineWidth = ctx.lineWidth;
        var style = "rgba(98, 244, 66,.9)";
        ctx.shadowBlur = 20;
        ctx.shadowColor = style;
        //ctx.lineCap="round";
        ctx.strokeStyle=style;
        var lineWidth = 0;
        lineWidth = (innerRadius * (1 - (innerRadius / radius))) * .5;
        
        ctx.lineWidth = lineWidth;
        ctx.closePath();
        ctx.moveTo(center,center);
        ctx.beginPath();
        if(scanningObject.direction == -1){
            ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
        }else{
            ctx.arc(center, center, innerRadius, segmentSize * position - degreesToRadians(15), (segmentSize * position) + segmentSize- degreesToRadians(15));
        }
        ctx.stroke();
        //restore the stroke style back to white
        ctx.strokeStyle="white";
    }
    //draw the weaponStatus buttons
    var i;
    for(i = 0;i < weaponStatus.length;i++){
        radius = circleRadius / sensorsArraySizeMultipler;
        ctx.beginPath();
        var weaponsStartRadius = radius * 1.09;
        var weaponsEndRadius = radius * 1.01;
        if(weaponStatus[i].type != "phaser"){
            weaponsStartRadius = radius * 1.2;
            weaponsEndRadius = radius * 1.1;
        }
        ctx.lineWidth = (radius * .1);
        ctx.strokeStyle = "white";
        ctx.arc(center,center,weaponsStartRadius,(degreesToRadians(weaponStatus[i].direction)) - degreesToRadians(90),(degreesToRadians(weaponStatus[i].direction) + degreesToRadians(weaponStatus[i].angleOfFire)) - degreesToRadians(90)); 
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = (radius * .085);


        var startPosition = weaponStatus[i].direction;
        if(startPosition + weaponStatus[i].angleOfFire > 360 && !(targetPosition.degrees > startPosition && targetPosition.degrees < startPosition + weaponStatus[i].angleOfFire)){
            startPosition = startPosition - 360;
        }
        var endPosition = startPosition + weaponStatus[i].angleOfFire;

        if(targetPosition.degrees > startPosition && targetPosition.degrees < endPosition){
            if(weaponStatus[i].type == "phaser"){
                if(weaponStatus[i].weaponStatus.phaserCharge > 0){
                    //phasers charged
                    ctx.strokeStyle = "rgba(25,255,25,.9)";
                }else{
                    ctx.strokeStyle = "rgba(255,25,25,.9)";
                    //phasers not charged
                }
            }else{
                if(weaponStatus[i].weaponStatus.torpedoLoaded){
                    ctx.strokeStyle = "rgba(25,255,25,.9)";
                    //torpedo loaded
                }else{
                    ctx.strokeStyle = "rgba(255,25,25,.9)";
                    //torpedo not loaded
                }
            }
        }else{
            ctx.strokeStyle = "rgba(25,25,25,.9)";
        }
        ctx.arc(center,center,weaponsStartRadius,(degreesToRadians(weaponStatus[i].direction + .4)) - degreesToRadians(90),(degreesToRadians(weaponStatus[i].direction) + degreesToRadians(weaponStatus[i].angleOfFire - .4)) - degreesToRadians(90));
        ctx.stroke();
    }
    ctx.setLineDash([]);

    for(var i = 0;i < weaponStatus.length;i++){  
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.font = Math.min(18,(weaponStatus[i].angleOfFire / (weaponStatus[i].weaponName.length * .3))) +  "px Arial";
        var totalDegreesUsedForText = (3 - (10 / weaponStatus[i].weaponName.length)) * weaponStatus[i].weaponName.length;
        var textRadius = radius * 1.06;
        var textBuffer = (weaponStatus[i].angleOfFire - totalDegreesUsedForText) / 2;//weaponStatus[i].angleOfFire / 8;
        if(weaponStatus[i].type != "phaser"){
            textRadius = radius * 1.17;
            //textBuffer = weaponStatus[i].angleOfFire / 4;
        }
        var startPosition = weaponStatus[i].direction;
        if(startPosition + weaponStatus[i].angleOfFire > 360){
            startPosition = startPosition - 360;
        }
        var endPosition = startPosition + weaponStatus[i].angleOfFire;

        if((startPosition > 90 || startPosition < -145) && startPosition < 200){
            textBuffer = -textBuffer;
            if(weaponStatus[i].type != "phaser"){
                textBuffer = -textBuffer * .75;
            }
            textCircle(ctx,weaponStatus[i].weaponName,center,center,textRadius,Math.PI/2.5,degreesToRadians(weaponStatus[i].direction + .4) + degreesToRadians(220) + degreesToRadians(textBuffer),0);
        }else{
            textCircle(ctx,weaponStatus[i].weaponName,center,center,textRadius,Math.PI/2.5,degreesToRadians(weaponStatus[i].direction + .4) + degreesToRadians(18) + degreesToRadians(textBuffer),1);
        }
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = "red";
    var polarCordsOfTargetPosition =
    {
        "radians" : degreesToRadians(targetPosition.degrees - 90),
        "distance" : targetPosition.distance
    }
    ctx.lineWidth = 2;
    var radiusOfTarget = polarCordsOfTargetPosition.distance / 5;
    ctx.arc(polarToCartesian(polarCordsOfTargetPosition).x + center,polarToCartesian(polarCordsOfTargetPosition).y + center,radiusOfTarget,Math.PI * 2,0);
    ctx.stroke();
}

function updateContactsOnArray(renderedContacts){
    //first we need to remove any contacts that shouldn't be on the array
    var i;
    var j;
    //(declaring i outside of the for loop is faster)

    //since we are can't remove children from the array
    //while we are looping through it, we must make another
    //array to hold the names of children to be removed.
    var childrenToBeRemoved = [];
    for(i = 0;i < scene.children.length;i++){
    var wasFound = false;
        //cycle through each contact
        for(j = 0;j < renderedContacts.length;j++){
            //if the object id matches the GUID of a contact, mark found as true'
            if(scene.children[i].name.includes(renderedContacts[j].GUID)){
                wasFound = true;
            }
        }
        //we didn't find this ID, remove it.
        if(!wasFound){
            childrenToBeRemoved.splice(childrenToBeRemoved.length,0,scene.children[i]);
        }
    }
    //now that we have all the names of the children that need to be
    //removed, we can cycle through them and delete them all
    for(i = 0;i < childrenToBeRemoved.length;i++){
        scene.remove(childrenToBeRemoved[i]);
    }
    //now we need to add all the contacts
    for(i = 0;i < renderedContacts.length;i++){
        //first, lets see if the contact can be found
        if(renderedContacts[i].type == "contact"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined ){
                //this object hasn't been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 100, 100 );
                //then we load the texture
                var texture = new THREE.TextureLoader().load( '/resource?path=public/' + renderedContacts[i].icon + '&screen=' + thisWidgetName );
                //now we need to make a material with that texture
                var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material)
                //assign the GUID to the name of this new mesh
                newContact.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            } 
            var textureFound = false;
            var texture;
            for(var o = 0;o < contactTextures.length;o++){
                if(contactTextures[o].texture == renderedContacts[i].icon){
                    textureFound = true;
                    texture = contactTextures[o].map;
                }
            }
            if(!textureFound){
                var newTextureCache = 
                {
                    "texture" : renderedContacts[i].icon,
                    "map" : new THREE.TextureLoader().load("/resource?path=public/" + renderedContacts[i].icon + '&screen=' + thisWidgetName )
                }
                contactTextures.splice(contactTextures.length,0,newTextureCache);
                texture = newTextureCache.map;
            }
            //now we need to make a material with that texture
            contact.material.map = texture;
            //now let's update it's values
            //set it's position to the proper xPos;
            contact.position.x = renderedContacts[i].xPos;
            //set it's position to the proper yPos;
            contact.position.y = renderedContacts[i].yPos;
            //set it's proper width
            contact.scale.x = renderedContacts[i].width / 100; //we divide by 100, because we need to decimate the size
            //set it's proper height
            contact.scale.y = renderedContacts[i].height / 100; //we divide by 100, because we need to decimate the size
        }else if(renderedContacts[i].type == "planet"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined ){
                //this object hasn't been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 100, 100 );
                //then we load the texture
                var texture = new THREE.TextureLoader().load(renderedContacts[i].icon);
                //now we need to make a material with that texture
                var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material);
                //assign the GUID to the name of this new mesh
                newContact.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            }
            contact.scale.x = renderedContacts[i].size;
            contact.scale.y = renderedContacts[i].size;
            contact.position.x = renderedContacts[i].xPos;
            contact.position.y = renderedContacts[i].yPos;
            contact.rotation.z = renderedContacts[i].rotation;
        }else if(renderedContacts[i].type == "asteroid"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined ){
                //this object hasn't been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 100, 100 );
                //now we need to make a material with that texture
                var material = getMaterialForAsteroid(renderedContacts[i].asteroidIcon);
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material);
                //assign the GUID to the name of this new mesh
                newContact.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            }
            contact.scale.x = renderedContacts[i].size;
            contact.scale.y = renderedContacts[i].size;
            contact.position.x = renderedContacts[i].xPos;
            contact.position.y = renderedContacts[i].yPos;
            contact.rotation.z = renderedContacts[i].rotation;
        }else if(renderedContacts[i].type == "nebula"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined ){
                //this object hasn't been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 100, 100 );
                //now we need to make a material with that texture
                var material = new THREE.MeshBasicMaterial( { map: getMaterialForNebula(renderedContacts[i].nebulaIcon),transparent: true } );
                material.color.set(0xffffff * renderedContacts[i].color);
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material);
                //assign the GUID to the name of this new mesh
                newContact.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            }
            contact.scale.x = renderedContacts[i].size;
            contact.scale.y = renderedContacts[i].size;
            contact.position.x = renderedContacts[i].xPos;
            contact.position.y = renderedContacts[i].yPos;
            contact.rotation.z = renderedContacts[i].rotation;
        }else if(renderedContacts[i].type == "torpedo"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined ){
                //this object hasn't been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 100, 100 );
                //now we need to make a material with that texture
                var material = torpedoTextures[Math.floor(Math.random() * torpedoTextures.length)];
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material);
                //assign the GUID to the name of this new mesh
                newContact.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            }
            contact.scale.x = .03;
            contact.scale.y = .03;
            contact.position.x = renderedContacts[i].xPos;
            contact.position.y = renderedContacts[i].yPos;
        }else if(renderedContacts[i].type == "phaser"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined){
                //this object hasn't been created!
                //lets add it now!

                var material = new THREE.LineBasicMaterial({ color: 0xffee59 });
                var geometry = new THREE.Geometry();

                geometry.vertices.push(new THREE.Vector3(50,50,0));
                geometry.vertices.push(new THREE.Vector3(50,50,0));

                var newLine = new THREE.Line(geometry, material);
                newLine.name = renderedContacts[i].GUID;
                scene.add(newLine);

                //assign the GUID to the name of this new mesh
                newLine.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newLine);
                //save a reference
                contact = newLine;
            }
            contact.geometry.dynamic = true;
            //first set the end point
            var newPhaserPosition = polarToCartesian({"radians" : renderedContacts[i].direction, "distance" : renderedContacts[i].distance});
            contact.geometry.vertices[1].set(-newPhaserPosition.x + 50,newPhaserPosition.y + 50,0);
            //now the start
            if(renderedContacts[i].phaserLength == undefined){
                //still firing, which means it needs to originate from the ship
                contact.geometry.vertices[0].set(50,50,0);
            }else{
                var newPhaserEndPosition = polarToCartesian({"radians" : renderedContacts[i].direction, "distance" : renderedContacts[i].distance - renderedContacts[i].phaserLength});
                contact.geometry.vertices[0].set(-newPhaserEndPosition.x + 50,newPhaserEndPosition.y + 50,0);
            }
            contact.geometry.verticesNeedUpdate = true;
        }else if(renderedContacts[i].type == "explosion"){
            var contact = scene.getObjectByName(renderedContacts[i].GUID);
            if(contact == undefined ){
                //this object hasn't been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 100, 100 );
                //now we need to make a material with that texture
                var material = new THREE.MeshBasicMaterial( { map: explosionTextures[0],transparent: true } );
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material);
                //assign the GUID to the name of this new mesh
                newContact.name = renderedContacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            }
            contact.scale.x = renderedContacts[i].size;
            contact.scale.y = renderedContacts[i].size;
            contact.position.x = renderedContacts[i].xPos;
            contact.position.y = renderedContacts[i].yPos;

            var j,
                textureUpdated = false;
            for(j = 0;j < explosionTextures.length;j++){
                if(!textureUpdated){
                    if(contact.material.map == explosionTextures[j]){
                        if(j == explosionTextures.length){
                            //remove
                        }else{
                            textureUpdated = true;
                            if(j + 1 < explosionTextures.length){
                                contact.material.map = explosionTextures[j + 1];
                                contact.material.needsUpdate = true;
                            }
                        }
                    }
                }
            }
        }
    }
}
//name: cartesian2Polar
//purpose: converts Cartesian cords to polar cords, assuming origin is x:0 y:0 (top left)
//takes: x cord, y cord
//returns: object, containing distance and radians

function cartesian2Polar(x, y){
    //Pythagorean theorem
    distance = Math.sqrt(x*x + y*y);
    //trig ... yuck
    radians = Math.atan2(y,x) //This takes y first
    //create the polarCoor object
    polarCoor = { distance:distance, radians:radians }
    //return this value to the original caller
    return polarCoor;
}

function polarToCartesian(polarCord){
    return {
        "x" : polarCord.distance * Math.cos(polarCord.radians),
        "y" : polarCord.distance * Math.sin(polarCord.radians)
    }
}
//creates a unique*** global ID (technically, there COUUULLDLDDDD be more than one GUID with the same value, but the
//chances of that are so low it's not even realistic to worry about)
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
   };
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function addSpecialContact(type,name,xPos,yPos,size,icon){
    var newContact = 
    {
        "type" : type, //we have several different things that go on the sensors array, so we have to specify
        "GUID" : guidGenerator(),
        "xPos" : xPos,
        "size" : size,
        "name" : name,
        "yPos" : yPos,
        "icon" : icon,
        "attributes" :
        {
            "isActive" : true
        }
    }
    programs.splice(programs.length,0,newContact);
    updateContactsEarly();
    //Interstellar.setDatabaseValue("sensors.programs",programs);
}

function addNewContact(name,xPos,yPos,wantedX,wantedY,height,width,animationSpeed,icon){
    var newContact = 
    {
        "type" : "contact", //we have several different things that go on the sensors array, so we have to specify
        "GUID" : guidGenerator(),
        "xPos" : xPos,
        "height" : height,
        "name" : name,
        "width" : width,
        "yPos" : yPos,
        "wantedX" : wantedX,
        "wantedY" : wantedY,
        "animationSpeed" : animationSpeed,
        "xStep" : undefined,
        "yStep" : undefined,
        "icon" : icon,
        "attributes" :
        {
            "isActive" : true
        }
    }
    contacts.splice(contacts.length,0,newContact);
    updateContactsEarly();
    //Interstellar.setDatabaseValue("sensors.contacts",contacts);
}

function getMaterialForNebula(icon){
    return nebulaTextures[Number(icon)];
}

function getMaterialForAsteroid(icon){
    return asteroidTextures[Number(icon)];
}

function getStepsFromAngle(direction){
    return {
        "x" : .2 * Math.cos(direction),
        "y" : .2 * Math.sin(direction)
    }
}

//three.js functions

function animate() {
    if(isDraggingContacts){
        var i;
        for(i = 0;i < selectedContacts.length;i++){
            var contact = scene.getObjectByName(selectedContacts[i]);
            if(contact != undefined){
                contact.position.x = draggingContactsMouseOffset.x + selectedContactOffsets[i].x;
                contact.position.y = draggingContactsMouseOffset.y + selectedContactOffsets[i].y;
            }
        }
    }
    var i;
    for(i = 0;i < contacts.length;i++){
        var contactObject = scene.getObjectByName(contacts[i].GUID);
        if(contactObject != undefined && contacts[i].type != "nebula"){
            contactObject.material.color.set("#ffffff");
        }
    }
    var i;
    for(i = 0;i < selectedContacts.length;i++){
        var contactObject = scene.getObjectByName(selectedContacts[i]);
        if(contactObject != undefined){
            contactObject.material.color.set("#2fff00");
        }
    }
    requestAnimationFrame( animate );
    render();
}
function render() {
    renderer.render( scene, camera );
}
function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians){
    return radians * (180 / Math.PI);
}

function createExplosionAtPoint(xCord,yCord,size){
    var newExplosion = 
    {
        "type" : "explosion",
        "GUID" : guidGenerator(),
        "xPos" : xCord,
        "yPos" : yCord,
        "size" : size,
        "removeBy" : Date.now() + 3000
    }
    effects.splice(effects.length,0,newExplosion);
    updateContactsEarly();
    //Interstellar.setDatabaseValue("sensors.effects",effects);
}

function updateContactsEarly(){
    for(var l = 0;l < CompoundContactsArray.length;l++){
        if(CompoundContactsArray[l].type == "planet" || CompoundContactsArray[l].type == "asteroid" || CompoundContactsArray[l].type == "nebula"){     
            for(i = 0;i < programs.length;i++){
                if(programs[i].GUID == CompoundContactsArray[l].GUID){
                    programs[i].xPos = CompoundContactsArray[l].xPos;
                    programs[i].yPos = CompoundContactsArray[l].yPos;
                    programs[i].rotation = CompoundContactsArray[l].rotation;
                }
            }
        }
        if(CompoundContactsArray[l].type == "torpedo" || CompoundContactsArray[l].type == "phaser"){
            for(i = 0;i < weapons.length;i++){
                if(weapons[i].GUID == CompoundContactsArray[l].GUID){
                    if(weapons[i].type == "torpedo"){
                        weapons[i].xPos = CompoundContactsArray[l].xPos;
                        weapons[i].yPos = CompoundContactsArray[l].yPos;
                    }else if(weapons[i].type == "phaser"){
                        weapons[i].distance = CompoundContactsArray[l].distance;
                    }
                }
            }
        }
        if(CompoundContactsArray[l].type == "explosion"){
            for(i = 0;i < effects.length;i++){
                if(effects[i].removeBy <= Date.now()){
                    effects.splice(i,1);
                }
            }
        }
        if(CompoundContactsArray[l].type == "contact"){
            for(i = 0;i < contacts.length;i++){
                if(contacts[i].GUID == CompoundContactsArray[l].GUID){
                    contacts[i].xPos = CompoundContactsArray[l].xPos;
                    contacts[i].yPos = CompoundContactsArray[l].yPos;
                    contacts[i].wantedX = CompoundContactsArray[l].wantedX;
                    contacts[i].wantedY = CompoundContactsArray[l].wantedY;
                }
            }
        }
    }
    Interstellar.setDatabaseValue("sensors.weapons",weapons);
    Interstellar.setDatabaseValue("sensors.programs",programs);
    Interstellar.setDatabaseValue("sensors.contacts",contacts);
    Interstellar.setDatabaseValue("sensors.effects",effects);
}

// Schedule the first frame.
requestAnimationFrame(animate);