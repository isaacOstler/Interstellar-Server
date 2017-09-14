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
       to be holding 30 FPS (or more!).  This puts the load on the clients instead of the network, which greatly reduces
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
var sensorsHasInitOnCore = false;
Interstellar.addCoreWidget("Sensors",function(){
    //if we have already init
    if(sensorsHasInitOnCore){
        //return
        return;
    }
    //otherwise set the flag so we don't accidentally
    //init twice.
    sensorsHasInitOnCore = true;
    //save a reference to this widget (a class definition)
    var thisWidget = this;
    //on resize
    thisWidget.onResize = function(){
        //draw the gui
        drawSensorsGui();
    }

    //after resize
    thisWidget.afterResize = function(){
        //do nothing
    }

    //variables
    var alertStatus = 5, //the ships alert status
        thisWidgetName = "new-sensors-core", //the name of this widget (since for a while, it was called new-sensors-core)
        animationInterval = undefined, //the variable pointing to the animation interval
        networkRefreshTimeout = undefined, //the variable pointing to the network update timeout
        frameRate = 60, //the frame rate for the sensors array (how many frames per second)
        networkRefreshRate = 360, //how many milliseconds until the network is updated on the contacts positions
        contacts = [], //sensor contacts
        moveAllSpeeds = 
        {
            "x" : 0,
            "y" : -.05
        },
        //three.js stuff
        camera, scene, renderer,
        frustumSize = 100;

    //DOM references
    var canvas = $("#new_sensors-core_sensorsArray_Canvas"),
        canvasContainer = $("#new_sensors-core_sensorsArray"),
        range = $("#range");
    //init calls

    drawSensorsGui();
    initThreeJS();
    
    //preset observers

    //database observers
    Interstellar.onDatabaseValueChange("sensors.moveAllSpeeds",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
            return;
        }
        moveAllSpeeds = newData;
    });
    Interstellar.onDatabaseValueChange("sensors.contacts",function(newData){
        //this entire function is plotted out in a diagram at the top of the document.

        //if there is no new data (the value hasn't been set on the database yet)
        if(newData == null){
            //for debugging purposes, I've generated a test value
            var presetContacts =[]
            /*
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
        contacts = newData;
        //compile all the arrays into one compoundArray
        let CompoundContactsArray = newData;
        //forcibly update all values on the array
        //updateContactsOnArray(CompoundContactsArray);
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
                //are they at their target destination?
                if(!(withinRange(CompoundContactsArray[i].xPos,CompoundContactsArray[i].wantedX,.2)) || !(withinRange(CompoundContactsArray[i].yPos,CompoundContactsArray[i].wantedY,.2))){
                    //nope, let's move them closer

                    //the step values are how far they should travel for every refreshRate
                    //so we just have to divide the frameRate by the refresh rate to get a scaler
                    var scaler = frameRate / networkRefreshRate;
                    //now add the scaled xStep to the xPos
                    CompoundContactsArray[i].xPos += (scaler * CompoundContactsArray[i].xStep);
                    //same for the y
                    CompoundContactsArray[i].yPos += (scaler * CompoundContactsArray[i].yStep);
                }else{
                    //already at it's destination
                    //console.log("Hey!  That's pretty good!");
                }
                var scaler = frameRate / networkRefreshRate;
                //let's also factor in the move all speed
                CompoundContactsArray[i].xPos += (scaler * moveAllSpeeds.x);
                //same for the y
                CompoundContactsArray[i].yPos += (scaler * moveAllSpeeds.y);
            }
            //now we update the array!
            updateContactsOnArray(CompoundContactsArray);
        },1000 / frameRate); //this calculates the frame rate (remember, this is in milliseconds)

        //THIS PART IS ONLY FOR CORE!!!
        var i;
        var differenceDetected = false;
        for(i = 0;i < contacts.length;i++){
            //we need to apply the move all speed to these contacts, if applicable
            if(moveAllSpeeds.x != 0 || moveAllSpeeds.y != 0){
                differenceDetected = true;
                contacts[i].xPos += moveAllSpeeds.x;
                contacts[i].wantedX += moveAllSpeeds.x;
                contacts[i].yPos += moveAllSpeeds.y;
                contacts[i].wantedY += moveAllSpeeds.y;
            }
            //are they at their target destination?
            if(!(withinRange(contacts[i].xPos,contacts[i].wantedX,.2)) || !(withinRange(contacts[i].yPos,contacts[i].wantedY,.2))){
                //nope, let's move them closer
                //do they have animation steps?
                if(contacts[i].xStep == undefined || contacts[i].yStep == undefined){
                    //we must first calculate their steps

                    //what is the difference between them?
                    var differenceX = Number(contacts[i].wantedX - contacts[i].xPos);
                    var differenceY = Number(contacts[i].wantedY - contacts[i].yPos);
                    //now we divide their animation time by the distance (v=d/t...)
                    contacts[i].xStep = (differenceX / Number(contacts[i].animationSpeed));
                    contacts[i].yStep = (differenceY / Number(contacts[i].animationSpeed));
                    //console.log("Calculate!");
                }
                //add their velocity to their position
                differenceDetected = true;
                contacts[i].xPos += contacts[i].xStep;
                contacts[i].yPos += contacts[i].yStep;
            }else{
                //the contacts are already fairly close to their positions, let's remove their steps
                //and force them to their exact position
                contacts[i].xPos = contacts[i].wantedX;
                contacts[i].yPos = contacts[i].wantedY;
                contacts[i].xStep = undefined;
                contacts[i].yStep = undefined;
            }
        }
        //if there was no difference detected from the last network update,
        //then there is no need to update the server again!
        if(!differenceDetected){
            return;
        }
        //if there is already a timeout
        if(networkRefreshTimeout != undefined){
            //clear it
            clearTimeout(networkRefreshTimeout);
        }

        networkRefreshTimeout = setTimeout(function(){
            Interstellar.setDatabaseValue("sensors.contacts",contacts);
        },networkRefreshRate)
    });
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
        $(renderer.domElement).width(canvas.width());
        $(renderer.domElement).height(canvas.height());
        //add the DOM.
        canvasContainer.append(renderer.domElement);
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
        //set the array size to half of 80% of the sensor array width
        var circleRadius = (canvas.width() * .8) / 2;
            center = circleRadius + (canvas.width() * .1); //this is the absolute center of the canvas
        //clear the canvas (in case this isn't the first time we have drawn)
        ctx.clearRect(0, 0, canvas.width(), canvas.height());
        //set the line width to 1.5
        ctx.lineWidth = 1.5;
        //start drawing
        ctx.beginPath();
        //draw the first circle
        ctx.arc(center, center, circleRadius, 0, 2 * Math.PI);
        //move in a little bit
        ctx.moveTo(center + (center / 1.5),center);
        //draw again, this time make the circle smaller
        ctx.arc(center, center, circleRadius / 1.5, 0, 2 * Math.PI);
        //move in a little bit more
        ctx.moveTo(center + (center / 3),center);
        //draw the last circle, a little bit smaller
        ctx.arc(center, center, circleRadius / 3, 0, 2 * Math.PI);
        //move to the center
        ctx.moveTo(center,center);
        //set the number of lines (usually 12)
        var numberOfLines = 12;
        //draw each line
        for(var i = 0;i < numberOfLines;i++){
            //basic math here, set the line to it's position on the outer edge
            var x = (circleRadius * Math.cos((2 * Math.PI / numberOfLines) * i)) + center;
            var y = (circleRadius * Math.sin((2 * Math.PI / numberOfLines) * i)) + center;
            //move to to that position we just valuated
            ctx.lineTo(x,y);
            //go back to the center for the next line
            ctx.moveTo(center,center);
        }
        var innerRadius = circleRadius * 1.5,
            outerRadius = 0;

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

        //make the final circle
        ctx.arc(center, center, circleRadius, 0, 2 * Math.PI);
        //set the gradient
        ctx.fillStyle = gradient;
        //fill the gradient
        //ctx.fill();
        //draw everything to the canvas
        ctx.stroke();
    }

    function updateContactsOnArray(contacts){
        //first we need to remove any contacts that shouldn't be on the array
        var i;
        var j;
        //(declaring i outside of the for loop is faster)

        //since we are can't remove children from the array
        //while we are looping through it, we must make another
        //array to hold the names of children to be removed.
        var childrenToBeRemoved = [];

        for(i = 0;i < scene.children.length;i++){
            //cycle through each contact
            var found = false;
            for(j = 0;j < contacts.length;j++){
                //if the object id matches the GUID of a contact, mark found as true
                if(contacts[j].GUID == scene.children[i].name){
                    found = true;
                }
            }
            //we didn't find this ID, remove it.
            if(!found){
                childrenToBeRemoved.splice(childrenToBeRemoved.length,0,scene.children[i].name);
            }
        }
        //now that we have all the names of the children that need to be
        //removed, we can cycle through them and delete them all
        for(i = 0;i < childrenToBeRemoved.length;i++){
            scene.remove(scene.getObjectByName(childrenToBeRemoved[i]));
        }
        //now we need to add all the contacts
        for(i = 0;i < contacts.length;i++){
            //first, lets see if the contact can be found
            var contact = scene.getObjectByName(contacts[i].GUID);
            if(contact == undefined){
                //this object has been created!
                //lets add it now!
                //first we make the geometry (just a plane)
                var geometry = new THREE.PlaneGeometry( 10, 10 );
                //then we load the texture
                var texture = new THREE.TextureLoader().load( '/resource?path=public/generic.png&screen=' + thisWidgetName );
                //now we need to make a material with that texture
                var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                //now make the actual mesh
                var newContact = new THREE.Mesh(geometry, material);
                //assign the GUID to the name of this new mesh
                newContact.name = contacts[i].GUID;
                //add it to the scene
                scene.add(newContact);
                //save a reference
                contact = newContact;
            }
            //now let's update it's values

            //set it's position to the proper xPos;
            contact.position.x = contacts[i].xPos;
            //set it's position to the proper yPos;
            contact.position.y = contacts[i].yPos;
        }
    }
    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
       };
       return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function addNewContact(xPos,yPos,wantedX,wantedY,animationSpeed){
        var newContact = 
        {
            "GUID" : guidGenerator(),
            "xPos" : xPos,
            "yPos" : yPos,
            "wantedX" : wantedX,
            "wantedY" : wantedY,
            "animationSpeed" : animationSpeed,
            "xStep" : undefined,
            "yStep" : undefined,
            "attributes" :
            {
                "isActive" : true
            }
        }
        contacts.splice(contacts.length,0,newContact);
        Interstellar.setDatabaseValue("sensors.contacts",contacts);
    }

    //three.js functions

    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    function render() {
        renderer.render( scene, camera );
    }

    // Schedule the first frame.
    requestAnimationFrame(animate);
    //event handlers
    range.on("input",function(event){
        moveAllSpeeds.y = ($(event.target).val() - 5) * .1;
        Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
    });
    canvas.click(function(event){
        addNewContact((event.offsetX / canvas.width()) * 100,(1 - (event.offsetY / canvas.height())) * 100,Math.random() * 100,Math.random() * 100,Math.random() * 3000);
    });
    //intervals
});