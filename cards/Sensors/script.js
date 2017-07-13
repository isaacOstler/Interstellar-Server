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
requiredScanTime = 300;

drawSensorsGui();
init();
animate();

onDatabaseValueChange("sensors.externalScans.scanObject",function(newData){
    scanningObject = newData;
    if(newData == null || newData == undefined){
        //no scan
        $("#scanButton").html("SCAN");
    }else{
        //scan in progress
        $("#scanButton").html("CANCEL");
    }
    drawSensorsGui();
});

onDatabaseValueChange("sensors.externalScans.scanTime",function(newData){
    if(newData == null){
        return;
    }
    requiredScanTime = newData;
});

onDatabaseValueChange("sensors.processedData.doFlash",function(newData){
    if(newData == null){
        setDatabaseValue("sensors.processedData.doFlash",true);
        return;
    }
    shouldFlashWhenThereIsProcessedData = newData;
});
onDatabaseValueChange("sensors.processedData.flashFullScreen",function(newData){
    if(newData == null){
        setDatabaseValue("sensors.processedData.flashFullScreen",false);
        return;
    }
    flashFullScreen = newData;
});

onDatabaseValueChange("sensors.processedData.noFlashAndSend",function(newData){
    if(newData == null){
        setDatabaseValue("sensors.processedData.noFlashAndSend","");
        return;
    }
    $("#processedDataContainer").html(newData);
});

onDatabaseValueChange("sensors.processedData",function(newData){
    if(newData == null){
        setDatabaseValue("sensors.processedData","");
        return;
    }
    $("#processedDataContainer").html(newData);
    if(flashProcessedDataInterval != undefined){
        clearInterval(flashProcessedDataInterval);
        flashProcessedDataInterval == undefined;
    }
    if(newData == "" || !shouldFlashWhenThereIsProcessedData){
        return; //don't flash unless there is new data, and only if we have permission to flash
    }
    let flashState = false;
    let flashCount = 0;
    let flashDocument;
    if(flashFullScreen){
        flashDocument = $("body");
    }else{
        flashDocument = $("#processedData");
    }
    flashProcessedDataInterval = setInterval(function(){
        flashState = !flashState;
        if(flashState){
            flashDocument.addClass("flash");
            flashCount++;
        }else{
            flashDocument.removeClass("flash");
        }
        if(flashCount >= 10){
            clearInterval(flashProcessedDataInterval);
            flashProcessedDataInterval == undefined;
            flashDocument.removeClass("flash");
        }
    },0100);
})

onDatabaseValueChange("ship.alertStatus",function(newData){
    if(newData == null){
        setDatabaseValue("ship.alertStatus",5);
        return;
    }
    alertStatus = newData;
    drawSensorsGui();
});
//used to detect a change to the contacts on the database,
//when we do detect a change we fire Sensors_Array_Core_drawSensorsArray()
onDatabaseValueChange("sensors.contactAttributes",function(newData){
    if(newData == null){
        //set the database value "sensors.contacts" to an empty array []
        setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : [],"contactLastEdited" : "","lastChangedValue" : ""});
        //terminate the execution of this function, so we don't get errors
        return;
    }
    Sensors_Core_Sensors_ContactAttributes = newData.contactAttributes;
    Sensors_Core_Sensors_ContactAttributesLastChangedID = newData.contactLastEdited;
    Sensors_Core_Sensors_ContactAttributesLastChangedValue = newData.lastChangedValue;
    Sensors_Array_Core_drawSensorsArray();
});
onDatabaseValueChange("sensors.contacts",function(newData){
    //if the database doesn't have the value "sensors.contacts" yet
    if(newData == null){
        //set the database value "sensors.contacts" to an empty array []
        setDatabaseValue("sensors.contacts",[]);
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
    console.log($(sensors_array_sensorsArrayContainer));//sensorsPosition
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
   var frustumSize = 100;
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
    //move in a little bit
    ctx.moveTo(center + (center / 1.5),center);
    //draw again, this time make the circle smaller
    ctx.arc(center, center, circleSize / 1.5, 0, 2 * Math.PI);
    //move in a little bit more
    ctx.moveTo(center + (center / 3),center);
    //draw the last circle, a little bit smaller
    ctx.arc(center, center, circleSize / 3, 0, 2 * Math.PI);
    //move to the center
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

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.stroke();
    if(scanningObject != undefined){

        var innerRadius = circleSize * (scanningObject.time.timePassed / scanningObject.time.timeRequired),
        outerRadius = 0,
        // Radius of the entire circle.
        radius = circleSize;
        var segmentSize = Sensors_Array_DegreesToRadians(360 / 12);
        var position = scanningObject.direction - 3; //-3 so that 1 o'clock is actually 1 o'clock, not 3 o'clock

        var oldStyle = ctx.strokeStyle;
        var oldLineWidth = ctx.lineWidth;
        var style = "rgba(98, 244, 66,.9)";
        ctx.shadowBlur = 20;
        ctx.shadowColor = style;
        //ctx.lineCap="round";
        ctx.strokeStyle=style;
        var lineWidth = 0;
        lineWidth = (innerRadius * (1 - (innerRadius / circleSize))) * .5;
        
        ctx.lineWidth = lineWidth;
        ctx.closePath();
        ctx.moveTo(center,center);
        ctx.beginPath();
        if(scanningObject.direction == -1){
            ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
        }else{
            ctx.arc(center, center, innerRadius, segmentSize * position, (segmentSize * position) + segmentSize);
        }
        ctx.stroke();
    }
    return;

    //draw everything to the canvas
    ctx.stroke();
    //draw the outer ring
    ctx.moveTo(center + (circleSize * 1.06),center);
    ctx.arc(center, center, circleSize * 1.06, 0, 2 * Math.PI);
    //give the degrees
    for(var i = 0;i < numberOfLines;i++){
        //basic math here, set the line to it's position on the outer edge
        var x = (((circleSize * 1.025) * Math.cos((2 * Math.PI / numberOfLines) * i)) + center) + 1.5708;
        var y = (((circleSize * 1.025) * Math.sin((2 * Math.PI / numberOfLines) * i)) + center) + 1.5708;
        //minus 90°, so that 0° is the top
        var degrees = Math.round(Sensors_Array_RadiansToDegrees(2 * Math.PI / numberOfLines) * i) + 90;
        degrees = modifyToBounds(degrees,0,360);

        ctx.font= "10px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(degrees + "°", x, y);
        //move to to that position we just caluated°
        //ctx.lineTo(x,y);
        //go back to the center for the next line
        //ctx.moveTo(center,center);
    }
    ctx.stroke();
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

$(".fontSizeAdjustButton").click(function(event){
    var fontSize = Number($("#processedDataContainer").css("font-size").replace("px",""));
    if($(event.target).html() == "+"){
        fontSize++;
    }else{
        fontSize--;
    }
    if(fontSize > maxFontSize){
        fontSize = maxFontSize;
    }
    $("#processedDataContainer").css("font-size",fontSize + "px");
});

$(".viewTypeButton").click(function(event){
    if($(event.target).html() == "VISIBLE LIGHT"){
        if(currentSensorsType == "normal"){
            return;
        }
        currentSensorsType = "normal";
        $(event.target).addClass("selectedButton");
        $("#infraredButton").removeClass("selectedButton");
        $("#sensorsArray").removeClass("infraredSensors");
    }else{
        if(currentSensorsType == "IR"){
            return;
        }
        currentSensorsType = "IR";
        $(event.target).addClass("selectedButton");
        $("#visibleButton").removeClass("selectedButton");
        $("#sensorsArray").addClass("infraredSensors");
    }
});

$("#scanButton").click(function(event){
    if(scanningObject == undefined){
        //start a new scan
        var timeRequired = requiredScanTime;
        if(($("#directionDropdown").prop('selectedIndex') - 1) != -1){
            timeRequired = timeRequired / 3;
        }
        scanningObject = 
        {
            "querry" : $("#scanTextbox").val(),
            "direction" : $("#directionDropdown").prop('selectedIndex') - 1,
            "time" : 
            {
                "timePassed" : 0,
                "timeRequired" : timeRequired
            }
        }
        setDatabaseValue("sensors.externalScans.scanObject",scanningObject);
    }else{
        //cancel a scan
        setDatabaseValue("sensors.externalScans.scanObject",undefined);
    }
});
/*
setInterval(function(){
    if(scanningObject != undefined){
        scanningObject.time.timePassed += .05;
        drawSensorsGui();
        if(scanningObject.time.timePassed >= scanningObject.time.timeRequired){
            setDatabaseValue("sensors.externalScans.scanObject",undefined);
        }
    }
},0010);*/