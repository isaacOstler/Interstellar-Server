    //copyright Isaac Ostler, September 12th 2017, all rights reserved ©

/*

    "Wait!"  You might be saying...  "What is this!?"
    "didn't you already make sensors?  With the awesome graphics!?"
    YES I DID!  ... AND I DID IT WRONG!  I made many many many mistakes in my coding.
    Mistakes that I've set out to correct.  I've fundamentally rewritten sensors,
    and this is version 2.0.  New and improved!  Faster, more stable, and with
    the proper documentation and framework to support safe and effective expansion as time goes on!

    The old sensors was going to be a pain to fix bugs with that it was unrealistic to keep the old system.
    Even while I was designing it, I secretly new in my heart that it was going to have to be redone.

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
    thisWidgetName = "Sensors", //the name of this widget (since for a while, it was called new-sensors-core)
    scanningObject,
    scanAnswer = null,
    averageScanTime = 120;
    //DOM references
var canvas = $("#sensorsArray_Canvas"),
    canvasContainer = $("#sensorsArray"),
    maskElement = $("#mask"),
    maskElement_maskCircle = $("#mask_circle"),
    range = $("#range"),
    scanButton = $("#scanButton"),
    scanQueryTextbox = $("#scanTextbox"),
    scanAnswerTextArea = $("#scanAnswerTextArea"),
    scanDirectionDropdown = $("#directionDropdown");
//init calls

drawSensorsGui();

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
        }*/
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
        }
        Interstellar.setDatabaseValue("sensors.programs",programs);
        return;
    }
    programs = newData;
    if(noAnimationCycleInProgress){
        animationCycle(contacts);
    }
    noAnimationCycleInProgress = false;
});

Interstellar.onDatabaseValueChange("sensors.externalScans.scanObject",function(newData){
    scanningObject = newData;
    if(newData == null || newData == undefined){
        //no scan
        scanButton.html("SCAN");
    }else{
        //scan in progress
        scanButton.html("CANCEL");
    }
    if(!(scanningObject == undefined || scanningObject == null)){
        if((scanningObject.timePassed / scanningObject.timeRequired) >= 1){
            if(scanAnswer != null){
                flashElement(scanAnswerTextArea,10);
                Interstellar.setDatabaseValue("sensors.externalScans.scanObject",null);
                scanAnswerTextArea.html(scanAnswer); 
            }else{
                scanAnswerTextArea.html("NOW ANALYZING DATA<br />PLEASE STANDBY")
            }
        }else{
            scanAnswerTextArea.html("SCANNING... <br />(" + Math.round((scanningObject.timePassed / scanningObject.timeRequired) * 100) + "% COMPLETE)");
        }
    }
    drawSensorsGui();
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
//functions

//this function returns true if these values are within the passed variance
function withinRange(value1,value2,variance){
    return(value1 < value2 + variance && value1 > value2 - variance);
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
    var circleRadius = (canvas.width() * .8) / 2;
        center = circleRadius + (canvas.width() * .1); //this is the absolute center of the canvas
        
    /*maskElement.width(canvas.width());
    maskElement.height(canvas.height());
    maskElement.css("left",canvas.position().left);
    maskElement.css("top",canvas.position().top);
    maskElement_maskCircle.attr("cx",50 + "%");
    maskElement_maskCircle.attr("cy",50 + "%");*/

    document.getElementById(maskElement.attr("id")).setAttribute('width', canvas.width());
    document.getElementById(maskElement.attr("id")).setAttribute('height', canvas.height());
    maskElement_maskCircle.attr("r",(circleRadius / canvas.width()) * canvas.width() + 2 + "px");
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
        var x = (circleRadius * Math.cos(((2 * Math.PI / numberOfLines) * i) + degreesToRadians(15)) + center);
        var y = (circleRadius * Math.sin(((2 * Math.PI / numberOfLines) * i) + degreesToRadians(15)) + center);
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
        radius = circleRadius;
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
        "removeBy" : Date.now() + 3
    }
    effects.splice(effects.length,0,newExplosion);
    Interstellar.setDatabaseValue("sensors.effects",effects);
}

// Schedule the first frame.
requestAnimationFrame(animate);
//event handlers
scanButton.click(function(event){
    if(scanningObject != undefined){
        Interstellar.setDatabaseValue("sensors.externalScans.scanObject",undefined);
    }else{
        var direction = Number(scanDirectionDropdown.val());
        Interstellar.setDatabaseValue("sensors.externalScans.scanObject",{
            "query" : scanQueryTextbox.val(),
            "timePassed" : 0,
            "timeRequired" : averageScanTime,
            "direction" : direction,
            "answer" : undefined
        });
    }
});
//intervals
setInterval(function(){
    if(scanningObject != undefined){
        scanningObject.timePassed += .1;
        Interstellar.setDatabaseValue("sensors.externalScans.scanObject",scanningObject);
    }
},0100);