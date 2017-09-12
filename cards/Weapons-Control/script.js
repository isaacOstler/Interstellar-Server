//copyright Isaac Ostler, July 6th 2017, all rights reserved ©

var alertStatus = 5,
Sensors_Core_Sensors_Contacts = [], //yes, it says sensors core, I don't care to dig that out of everything
Sensors_Core_Sensors_ContactAttributes = [], //since I literally just coppied most of the drawing of this from core
Sensors_Core_Sensors_ContactAttributesLastChangedID,
Sensors_Core_Sensors_ContactAttributesLastChangedValue,
sensors_array_sensorsArrayContainer,
sensors_array_sensorsArrayCamera,
sensors_array_sensorsArrayScene,
sensors_array_sensorsArrayRenderer,
raycaster = new THREE.Raycaster(),
mouse = new THREE.Vector2(),
Sensors_Core_NebulaTexture = new THREE.TextureLoader().load( '/resource?path=public/nebula.png' ),
currentSensorsType = "normal",
maxFontSize = 28,
flashProcessedDataInterval = undefined,
shouldFlashWhenThereIsProcessedData = true,
flashEntireScreen = false,
scanningObject = undefined,
requiredScanTime = 300,
scanAnswer = "",
weapons = [],
targetPosition = 
{
    "degrees" : 0,
    "distance" : 50
}
isDraggingTarget = false;

drawSensorsGui();
init();
animate();

//DOM References
var canvas = $("#sensorsArray");

Interstellar.onDatabaseValueChange("weapons.targetPosition",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("weapons.targetPosition",targetPosition);
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
    weapons = newData;
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
//used to detect a change to the contacts on the database,
//when we do detect a change we fire Sensors_Array_Core_drawSensorsArray()
Interstellar.onDatabaseValueChange("sensors.contactAttributes",function(newData){
    if(newData == null){
        //set the database value "sensors.contacts" to an empty array []
        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : [],"contactLastEdited" : "","lastChangedValue" : ""});
        //terminate the execution of this function, so we don't get errors
        return;
    }
    Sensors_Core_Sensors_ContactAttributes = newData.contactAttributes;
    Sensors_Core_Sensors_ContactAttributesLastChangedID = newData.contactLastEdited;
    Sensors_Core_Sensors_ContactAttributesLastChangedValue = newData.lastChangedValue;
    Sensors_Array_Core_drawSensorsArray();
});
Interstellar.onDatabaseValueChange("sensors.contacts",function(newData){
    //if the database doesn't have the value "sensors.contacts" yet
    if(newData == null){
        //set the database value "sensors.contacts" to an empty array []
        Interstellar.setDatabaseValue("sensors.contacts",[]);
        //terminate the execution of this function, so we don't get errors
        return;
    }
    //set the array Sensors_Core_Sensors_Contacts equal to the newData
    /*while(Sensors_Core_RunningUnderCachedDatabase){
        //wait
    }*/
    Sensors_Core_Sensors_Contacts = newData;
});

function init() {
    sensors_array_sensorsArrayContainer = document.createElement( 'div' );
    //$(sensors_array_sensorsArrayContainer).addClass("SensorsArrayContactCanvas");
   // $("#sensorsArray").append( sensors_array_sensorsArrayContainer );
   var percentageOffset = $("#sensorsArrayCanvas").width() * .1;
   var width = $("#sensorsArrayCanvas").width();
   var height = $("#sensorsArrayCanvas").height();
   $("#mask").width(width);
   $("#mask").height(width);
   $(sensors_array_sensorsArrayContainer).width(width);
   $(sensors_array_sensorsArrayContainer).height(width);

   $(sensors_array_sensorsArrayContainer).css("left",$("#sensorsArrayCanvas").css("left") + percentageOffset + "px");
   $(sensors_array_sensorsArrayContainer).css("top",$("#sensorsArrayCanvas").css("top") + percentageOffset + "px");
   var near = 1;
   var far = 1000;
   var frustumSize = 100 / 3;
   var aspect = width / height;

   sensors_array_sensorsArrayCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
   sensors_array_sensorsArrayCamera.position.set(50,50,100);
   sensors_array_sensorsArrayScene = new THREE.Scene();

   sensors_array_sensorsArrayRenderer = new THREE.WebGLRenderer({ alpha: true, antialias:true });
   sensors_array_sensorsArrayRenderer.setClearColor( 0xffffff, 0);
   sensors_array_sensorsArrayRenderer.setPixelRatio( window.devicePixelRatio );
   sensors_array_sensorsArrayRenderer.setSize( $("#sensorsArrayCanvas").width(), $("#sensorsArrayCanvas").width() );
   $("#sensorsArray").append( sensors_array_sensorsArrayRenderer.domElement );
   $(sensors_array_sensorsArrayRenderer.domElement).addClass("SensorsArrayContactCanvas");
   Sensors_Array_Core_drawSensorsArray();
}

function drawSensorsGui(){
      // Create gradient
    //we need the sensors array to be perfectly square, so set the height equal to the width
    $("#sensorsArray").height($("#sensorsArray").width());
    //grab the canvas element from the DOM
    var c = document.getElementById("sensorsArrayCanvas");
    //set the width of the canvas to the width of the sensors array
    c.width = $("#sensorsArray").width();
    //set the height of the canvas to the height of the sensors array
    c.height = $("#sensorsArray").height();
    //grab the context of the canvas
    var ctx = c.getContext("2d");
    //set the color of the sensors array depending on the alert status
    switch(Number(alertStatus)){
        case 5:
            ctx.strokeStyle="white"; //set the color to white
            break;
            case 4:
            ctx.strokeStyle="#00ffd8"; //set the color to a greenish blue color
            break;
            case 3:
            ctx.strokeStyle="#fff600"; //set the color to yellow
            break;
            case 2:
            ctx.strokeStyle="#ffb200"; //set the color to orange
            break;
            case 1:
            ctx.strokeStyle="red"; //set the color to red
            break;
        default: //in case the alert status is something wierd, default to this
            ctx.strokeStyle="white"; //set the color to white
            break;
        }
    //set the circle size to half the sensors array width
    var circleSize = ($("#sensorsArray").width() * .8) / 2;
    var center = ($("#sensorsArray").width() * 1) / 2
    //clear the canvas (in case this isn't the first time we have drawn)
    ctx.clearRect(0, 0, c.width, c.height);
    //set the line width to 1.5
    ctx.lineWidth = 1.5;
    //start drawing
    ctx.beginPath();
    //draw the first circle
    ctx.arc(center, center, circleSize, 0, 2 * Math.PI);
    ctx.moveTo(center,center);
    //set the number of lines (usually 12)
    var numberOfLines = 12;
    //draw each line
    for(var i = 0;i < numberOfLines;i++){
        //basic math here, set the line to it's position on the outer edge
        var x = (circleSize * Math.cos((2 * Math.PI / numberOfLines) * i)) + center;
        var y = (circleSize * Math.sin((2 * Math.PI / numberOfLines) * i)) + center;
        //move to to that position we just caluated
        ctx.lineTo(x,y);
        //go back to the center for the next line
        ctx.moveTo(center,center);
    }

    var innerRadius = circleSize * 1.5,
    outerRadius = 0,
        // Radius of the entire circle.
        radius = circleSize;

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

    ctx.arc(center, center, radius, 0, 2 * Math.PI);

    //ctx.fillStyle = gradient;
    //ctx.fill();
    ctx.stroke();

    //draw everything to the canvas
    ctx.stroke();
    //draw the weapons buttons
    var i;
    for(i = 0;i < weapons.length;i++){
        ctx.beginPath();
        var weaponsStartRadius = radius * 1.09;
        var weaponsEndRadius = radius * 1.01;
        if(weapons[i].type != "phaser"){
            weaponsStartRadius = radius * 1.2;
            weaponsEndRadius = radius * 1.1;
        }
        ctx.lineWidth = (radius * .1);
        ctx.strokeStyle = "white";

        ctx.arc(center,center,weaponsStartRadius,(Sensors_Array_DegreesToRadians(weapons[i].direction)) - Sensors_Array_DegreesToRadians(90),(Sensors_Array_DegreesToRadians(weapons[i].direction) + Sensors_Array_DegreesToRadians(weapons[i].angleOfFire)) - Sensors_Array_DegreesToRadians(90)); 
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = (radius * .085);


        var startPosition = weapons[i].direction;
        if(startPosition + weapons[i].angleOfFire > 360 && !(targetPosition.degrees > startPosition && targetPosition.degrees < startPosition + weapons[i].angleOfFire)){
            startPosition = startPosition - 360;
        }
        var endPosition = startPosition + weapons[i].angleOfFire;

        if(targetPosition.degrees > startPosition && targetPosition.degrees < endPosition){
            ctx.strokeStyle = "rgba(25,255,25,.9)";
        }else{
            ctx.strokeStyle = "rgba(25,25,25,.9)";
        }

        ctx.arc(center,center,weaponsStartRadius,(Sensors_Array_DegreesToRadians(weapons[i].direction + .4)) - Sensors_Array_DegreesToRadians(90),(Sensors_Array_DegreesToRadians(weapons[i].direction) + Sensors_Array_DegreesToRadians(weapons[i].angleOfFire - .4)) - Sensors_Array_DegreesToRadians(90));
        ctx.stroke();
    }

    for(var i = 0;i < weapons.length;i++){  
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.font = Math.min(18,(weapons[i].angleOfFire / (weapons[i].weaponName.length * .3))) +  "px Arial";
        var totalDegreesUsedForText = (3 - (10 / weapons[i].weaponName.length)) * weapons[i].weaponName.length;
        var textRadius = radius * 1.06;
        var textBuffer = (weapons[i].angleOfFire - totalDegreesUsedForText) / 2;//weapons[i].angleOfFire / 8;
        if(weapons[i].type != "phaser"){
            textRadius = radius * 1.17;
            //textBuffer = weapons[i].angleOfFire / 4;
        }
        var startPosition = weapons[i].direction;
        if(startPosition + weapons[i].angleOfFire > 360){
            startPosition = startPosition - 360;
        }
        var endPosition = startPosition + weapons[i].angleOfFire;

        if((startPosition > 90 || startPosition < -145) && startPosition < 200){
            textBuffer = -textBuffer;
            if(weapons[i].type != "phaser"){
                textBuffer = -textBuffer * .75;
            }
            textCircle(ctx,weapons[i].weaponName,center,center,textRadius,Math.PI/2.5,Sensors_Array_DegreesToRadians(weapons[i].direction + .4) + Sensors_Array_DegreesToRadians(220) + Sensors_Array_DegreesToRadians(textBuffer),0);
        }else{
            textCircle(ctx,weapons[i].weaponName,center,center,textRadius,Math.PI/2.5,Sensors_Array_DegreesToRadians(weapons[i].direction + .4) + Sensors_Array_DegreesToRadians(18) + Sensors_Array_DegreesToRadians(textBuffer),1);
        }
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = "red";
    var polarCordsOfTargetPosition =
    {
        "radians" : Sensors_Array_DegreesToRadians(targetPosition.degrees - 90),
        "distance" : targetPosition.distance
    }
    ctx.lineWidth = 2;
    var radiusOfTarget = polarCordsOfTargetPosition.distance / 5;
    ctx.arc(polarToCartesian(polarCordsOfTargetPosition).x + center,polarToCartesian(polarCordsOfTargetPosition).y + center,radiusOfTarget,Math.PI * 2,0);
    ctx.stroke();
}

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

function Sensors_Array_Core_drawSensorsArray(){
    if(Sensors_Core_Sensors_Contacts == undefined){
        return;
    }
    var contactsToDrawListElementFor = 0;
    for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
        var contact = Sensors_Core_Sensors_Contacts[i];
        var contactAttributes = Sensors_Core_Sensors_ContactAttributes[i];
        if(contactAttributes.contactType == "shockwave"){
            var sceneObject = sensors_array_sensorsArrayScene.getObjectByName(contact.contactID);
            if(sceneObject == undefined){
                //creating a shockwave
                var sceneObject = sensors_array_sensorsArrayScene.getObjectByName(contact.contactID);
                var texture = new THREE.TextureLoader().load( '/resource?path=public/shockwave.png' );
                var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );        
                var geometry = new THREE.BoxGeometry(3,3,-10);
                var cube = new THREE.Mesh(geometry, material);
                cube.name = "shockwave_EFFECT";
                cube.position.set(50,50,-10);
                sensors_array_sensorsArrayScene.add(cube);
            }else{
                //updating a shockwave

            }
        }else{
            var sceneObject = sensors_array_sensorsArrayScene.getObjectByName(contact.contactID);

            if(sceneObject == undefined){

                if(contactAttributes.contactType == "nebula"){
                    var geometry = new THREE.Geometry();
                    var vertex = new THREE.Vector3();
                    if(contactAttributes.icon == ""){
                        contactAttributes.icon = "Generic.png";
                    }
                    var texture = Sensors_Core_NebulaTexture;
                    var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : Math.random(), color: (Math.random() * .1) * 0x3594ff } );
                    var geometry = new THREE.BoxGeometry(3,3,0);
                    if(!contactAttributes.contactIsActive){
                        material.opacity = 0;
                    }else{
                        material.opacity = 1;
                    }
                    var cube = new THREE.Mesh(geometry, material);
                    cube.name = contactAttributes.contactID;
                    cube.position.set(contact.xPos,contact.yPos,Math.random() * 500);
                    cube.scale.x = contactAttributes.width;
                    cube.scale.y = contactAttributes.height;
                    sensors_array_sensorsArrayScene.add(cube);
                }else{
                    //draw a new contact
                    var geometry = new THREE.Geometry();
                    var vertex = new THREE.Vector3();
                    if(contactAttributes.icon == ""){
                        contactAttributes.icon = "Generic.png";
                    }
                    var texture = new THREE.TextureLoader().load( '/resource?path=public/Contacts/' + contactAttributes.icon );
                    if(contactAttributes.contactType == "planet"){
                        texture = new THREE.TextureLoader().load( '/resource?path=public/Planets/' + contactAttributes.icon );
                    }
                    var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                    if(!contactAttributes.contactIsActive){
                        material.opacity = 0;
                    }else{
                        material.opacity = 1;
                    }
                    var geometry = new THREE.BoxGeometry(3,3,0 - contactAttributes.width);
                    var cube = new THREE.Mesh(geometry, material);
                    cube.name = contactAttributes.contactID;
                    if(contactAttributes.contactType == "planet"){
                        cube.position.set(contact.xPos,contact.yPos,-250);
                    }else{
                        cube.position.set(contact.xPos,contact.yPos,- contactAttributes.width);
                    }
                    cube.scale.x = contactAttributes.width;
                    cube.scale.y = contactAttributes.height;
                    sensors_array_sensorsArrayScene.add(cube);
                }
            }else{
            //update an old one
            if(Sensors_Core_Sensors_ContactAttributesLastChangedID == contact.contactID || Sensors_Core_Sensors_ContactAttributesLastChangedID == "multiple"){
                sceneObject.scale.x = contactAttributes.width;
                sceneObject.scale.y = contactAttributes.height;
                sceneObject.position.z = contactAttributes.width;
                if(Sensors_Core_Sensors_ContactAttributesLastChangedValue == "icon"){
                    var texture = new THREE.TextureLoader().load( '/resource?path=public/Contacts/' + contactAttributes.icon);
                    var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                    sceneObject.material = material;
                }
                if(!contactAttributes.contactIsActive){
                    sceneObject.material.opacity = 0;
                }else{
                    sceneObject.material.opacity = 1;
                }
            }
        }
    }
}
}

function animate() {
    requestAnimationFrame( animate );
    render();
    //stats.update();
}
function render() {
    for(var i = 0;i < sensors_array_sensorsArrayScene.children.length;i++){
        var threeJSObject = sensors_array_sensorsArrayScene.children[i];
        var sensorsContactObject = sensors_array_getContactByContactID(threeJSObject.name);
        var isEffect = false;
        if(threeJSObject.name.includes("_EFFECT")){
            isEffect = true;
        }
        if(sensorsContactObject == undefined && !isEffect){
            //this contact has been deleted
            sensors_array_sensorsArrayScene.remove(threeJSObject);
        }
        var sensorsContactObjectAttributes = sensors_array_getContactAttributesByContactID(threeJSObject.name);
        
        if(sensorsContactObject != undefined){
            var wantedX = sensorsContactObject.wantedXPos;
            var wantedY = sensorsContactObject.wantedYPos;
            var xPos = sensorsContactObject.xPos;
            var yPos = sensorsContactObject.yPos;
            threeJSObject.position.x = xPos;
            threeJSObject.position.y = yPos;
            if(sensorsContactObjectAttributes.attributes.isSpinning){
                var amount = 0;
                if(sensorsContactObjectAttributes.contactType == "nebula"){
                    amount = sensorsContactObjectAttributes.spinDirection;
                }else if(sensorsContactObjectAttributes.contactType == "planet"){
                    if(sensorsContactObjectAttributes.icon == "Zblackhole.png"){
                        amount = -.001;
                    }else{
                        amount = .0001;
                    }
                }else{
                    amount = .001;
                }
                threeJSObject.rotation.z += amount;
            }
        }
    }
    sensors_array_sensorsArrayCamera.lookAt(0,0,0);
    //sensors type (IR, Normal, Radiation, Etc)
    for(var i = 0;i < sensors_array_sensorsArrayScene.children.length;i++){
        var threeJSObject = sensors_array_sensorsArrayScene.children[i];
        var sensorsContactObjectAttributes = sensors_array_getContactAttributesByContactID(threeJSObject.name);
        var isEffect = false;
        if(threeJSObject.name.includes("_EFFECT")){
            isEffect = true;
        }
        if(sensorsContactObject != undefined && !isEffect){
            switch(currentSensorsType){
                case "normal":
                    if(sensorsContactObjectAttributes.attributes.isVisible){
                        threeJSObject.material.opacity = 1;
                    }else{
                        threeJSObject.material.opacity = 0;
                    }
                break;
                case "IR":
                    if(sensorsContactObjectAttributes.attributes.IR){
                        threeJSObject.material.opacity = 1;
                    }else{
                        threeJSObject.material.opacity = 0;
                    }
                break;
            }
            if(!sensorsContactObjectAttributes.contactIsActive){
                threeJSObject.material.opacity = 0;
            }else{
                threeJSObject.material.opacity = 1;
            }
        }
    }
    //Colors and whatnot
    for(var i = 0;i < sensors_array_sensorsArrayScene.children.length;i++){
        threeJSObject = sensors_array_sensorsArrayScene.children[i];
        var nameOfObject = threeJSObject.name;
        nameOfObject = nameOfObject.replace("_EFFECT","");
        var objectAttributes = sensors_array_getContactAttributesByContactID(nameOfObject);
        if(objectAttributes != undefined && objectAttributes.contactType != "nebula"){
            var normalColor = true;
            if(normalColor){
                sensors_array_sensorsArrayScene.children[i].material.color.set( 0xffffff);
            }
        }
    }

    sensors_array_sensorsArrayRenderer.render( sensors_array_sensorsArrayScene, sensors_array_sensorsArrayCamera );
}

function sensors_array_getContactByContactID(contactID){
    for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
        if(Sensors_Core_Sensors_Contacts[i].contactID == contactID){
            return Sensors_Core_Sensors_Contacts[i];
        }
    }
    return undefined;
}

function sensors_array_getContactAttributesByContactID(contactID){
    for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
        if(Sensors_Core_Sensors_ContactAttributes[i].contactID == contactID){
            return Sensors_Core_Sensors_ContactAttributes[i];
        }
    }
    return undefined;
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
//event listeners
canvas.mousedown(function(event){
    var polarCords = cartesian2Polar(event.offsetX - ($(event.target).width() / 2),event.offsetY - ($(event.target).height() / 2));
    if(polarCords.distance <= (canvas.width() / 2) * .75){
        canvas.css("cursor","crosshair");
        isDraggingTarget = true;
        targetPosition.degrees = modifyToBounds(Sensors_Array_RadiansToDegrees(polarCords.radians) + 90,0,360,1000);
        targetPosition.distance = Math.min(polarCords.distance,(canvas.width() / 2) * .66);
        drawSensorsGui();
    }else{
        var i;
        var degree = modifyToBounds(Sensors_Array_RadiansToDegrees(polarCords.radians) + 90,0,360);
        var distance = polarCords.distance;
        for(i = 0;i < weapons.length;i++){
            var minDistance = (canvas.width() / 2) * .79;
            var maxDistance = (canvas.width() / 2) * .87;
            if(weapons[i].type != "phaser"){
                minDistance = (canvas.width() / 2) * .88;
                maxDistance = (canvas.width() / 2) * .95;
            }
            var startPosition = weapons[i].direction;
            if(startPosition + weapons[i].angleOfFire > 360 && !(degree > startPosition && degree < startPosition + weapons[i].angleOfFire)){
                startPosition = startPosition - 360;
            }
            var endPosition = startPosition + weapons[i].angleOfFire;

            if(degree > startPosition && degree < endPosition){
                if(distance > minDistance && distance < maxDistance){
                    console.log("Clicked " + weapons[i].weaponName + "!");
                    Interstellar.playRandomBeep();
                    return;
                }
            }
        }
        console.log("didn't click a button");
    }
});
canvas.mouseup(function(event){
    canvas.css("cursor","default");
    Interstellar.setDatabaseValue("weapons.targetPosition",targetPosition);
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
            for(i = 0;i < weapons.length;i++){
                var minDistance = (canvas.width() / 2) * .79;
                var maxDistance = (canvas.width() / 2) * .87;
                if(weapons[i].type != "phaser"){
                    minDistance = (canvas.width() / 2) * .88;
                    maxDistance = (canvas.width() / 2) * .95;
                }
                var startPosition = weapons[i].direction;
                if(startPosition + weapons[i].angleOfFire > 360 && !(degree > startPosition && degree < startPosition + weapons[i].angleOfFire)){
                    startPosition = startPosition - 360;
                }
                var endPosition = startPosition + weapons[i].angleOfFire;

                if(degree > startPosition && degree < endPosition){
                    if(distance > minDistance && distance < maxDistance){
                        canvas.css("cursor","pointer");
                        return;
                    }
                }

                /*if(degree > weapons[i].direction && degree < weapons[i].direction + weapons[i].angleOfFire){
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
//intervals
/*
setInterval(function(){
    targetPosition++;
    if(targetPosition >= 360){
        targetPosition = 0;
    }
    drawSensorsGui();
},0010);*/