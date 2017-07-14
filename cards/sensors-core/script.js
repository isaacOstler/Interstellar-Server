    //copyright Isaac Ostler, June 13th 2017, all rights reserved ©

    //
    //my documentation is a joke.  Sorry.
    //
    //this card is 10% super well documented
    //and 90% not at all... super sorry ahead of time!
    //
    //sometimes, your not quite sure what your doing, and
    //forget to write down psudeo code as you experiment
    //
    //I will try to go back and document this code as soon as possible
    //
    //-Isaac Ostler

Interstellar.addCoreWidget("Sensors",function(){
    var thisWidget = this;

    var Sensors_Core_PresetDefaults = {
        "processedDataFlash" : 1, //0, no flash, 1, just processed data box, 2, flash the entire screen
        "allowFontSizeAdjustments" : 2, //0 never, 1 with FD approval, 2 always
        "typeProcessedData" : 0, //0, no type on effect, 1 ignore HTML, 2 type on effect
        "processedDataSoundEffect" : undefined, //sound effect to play when there is new processed data
        "defaultContactName" : "UNKNOWN CONTACT", //what is the name of the default contact?
        "defaultContactSize" : 1.7, //this is a percentage.  What is the size of the default contact?
        "defaultContactImage" : undefined, //image of the default contact
        "defaultContactIcon" : "generic.png", //icon of the default contact
        "defaultContactNormal" : true, //can we see this contact with normal sensors?
        "defaultContactInfrared" : true, //does the default contact have infrared?
        "drawGradient" : true, //do we draw the gradient on the sensors array?
        "cameraType" : 0, //0 is orthograpic, 1 is prospective
        "sensorsArrayColorType" : 0, //0 is RGBA, 1 is grayscale, 2 is sepia, 3 is inverted, 4 is inverted (BW),
        "sensorsArrayHueRotate" : 0, //360 degree hue rotation.  0deg is defualt (no change in color)
        "sensorsArrayDrawDegrees" : false, //do we draw the degree guides? (On the station)
        "sensorsArrayIsResponsiveToAlertStatus" : true, //does the alert status change our color?
        "defaultSpeed" : "Slow", //Default contact move speed
        "defaultAskForSpeed" : false, //do we ask for speed by default?
        "snapYaw" : true, //does the yaw adjust snap back to zero when we let go?
        "defaultHeading" : 180, //which direction does everything move with the move all feature?  (180 is straight down)
        "weaponsRange" : 1, //0 is disabled, 1 is 1st ring, 2 is 2nd ring, 3 is 3rd ring
        "scanType" : 0, //0 is timed, 1 is traditional
        "scanTime" : 30000, //time in miliseconds an average scan takes
        "updateInterval" : 70, //advanced feature, this is how often the Sensors_Array_Update_Animations_Interval() function fires in miliseconds
    }
    var Sensors_Core_HasInit = false;

    Interstellar.onPresetValueChange("sensors.sensorsPrefrences",function(newData){
        if(newData == null){
            Interstellar.setPresetValue("sensors.sensorsPrefrences",Sensors_Core_PresetDefaults);
            return;
        }

        if(Sensors_Core_HasInit){
            return; // we've already started, don't start again.
        }
        Sensors_Core_HasInit = true;
        var Sensors_Core_Presets = newData;

        Sensors_core_updateDatabaseValuesRelatedToUserPrefs();

        Interstellar.onDatabaseValueChange("sensors.graphical.colorType",function(newData){
            if(newData == null){
                Interstellar.setDatabaseValue("sensors.graphical.colorType",Sensors_Core_Presets.sensorsArrayColorType);
                return;
            }
            Sensors_Core_Presets.sensorsArrayColorType = newData;
            var elementsToUpdate = [$("#sensors-core-sensorsArrayCanvas"),$("#sensors-core-sensorsArray")];
            for(var i = 0;i < elementsToUpdate.length;i++){
                elementsToUpdate[i].removeClass("Sensors_Core_colorType0");
                elementsToUpdate[i].removeClass("Sensors_Core_colorType1");
                elementsToUpdate[i].removeClass("Sensors_Core_colorType2");
                elementsToUpdate[i].removeClass("Sensors_Core_colorType3");
                elementsToUpdate[i].removeClass("Sensors_Core_colorType4");
                elementsToUpdate[i].addClass("Sensors_Core_colorType" + newData);
            }
        });
        Interstellar.onDatabaseValueChange("sensors.graphical.drawGradient",function(newData){
            if(newData == null){
                Interstellar.setDatabaseValue("sensors.graphical.drawGradient",Sensors_Core_Presets.drawGradient);
                return;
            }
            Sensors_Core_Presets.drawGradient = newData;
            drawSensorsGui();
        });

    var Sensors_Core_SensorPrograms = [];
    var Sensors_Core_SensorPresets = [];
    var Sensors_Core_ContactListScrollPosition = 0;
    var Sensors_Core_RunningUnderCachedDatabase = false;
    var Sensors_Core_SelectedPlanetIcon = undefined;
    var Sensors_Core_Icons = [];
    var Sensors_Core_Sensors_Contacts = [];
    var Sensors_Core_Sensors_ContactAttributes = [];
    var Sensors_Core_Sensors_ContactAttributesLastChangedID = "";
    var Sensors_Core_Sensors_ContactAttributesLastChangedValue = "";
    var Sensors_Core_Alert_Status = 5; //assume until we know otherwise that the alert status is 5
    var Sensors_Core_CurrentDragTarget = undefined;
    var Sensors_Core_CurrentDragTargetPosition = {"x" : undefined,"y" : undefined};
    var Sensors_Core_CurrentDragTargetIsDragging = false;
    var Sensors_Core_CurrentDragTargetIsDraggingListItem = false;
    var Sensors_Core_YawAdjust = 0;
    var Sensors_Core_ContactEditorCurrentContact;
    var Sensors_Core_UpdatePositionIntervals = [];
    var Sensors_Core_firstDraw = true;
    var Sensors_Core_deleteContactMode = false;
    var Sensors_Core_copyContactMode = false;
    var Sensors_Core_MouseDragSelectionOrigin = {"xPos" : undefined, "yPos" : undefined};
    var Sensors_Core_MouseDragSelectionFinalPosition = {"xStart" : undefined, "xEnd" : undefined, "yStart" : undefined, "yEnd" : undefined}
    var Sensors_Core_MouseDragSelectionSelectedContacts = [];
    var Sensors_Core_ContactMoveSpeed = Sensors_Array_getSpeedForValue(Sensors_Core_Presets.defaultSpeed);
    var Sensors_Core_isAdjustingMoveAllDirection = false;
    var Sensors_Core_MoveAllContactsAngleInRadians = Sensors_Array_DegreesToRadians(Sensors_Core_Presets.defaultHeading);
    var Sensors_Core_MoveAllContactsDistanceToMove = 0;//defaults to 0
    var Sensors_Core_AnimationInterval = undefined;
    var Sensors_Core_ProgramIntervals = [];
    var Sensors_Core_NebulaTexture = new THREE.TextureLoader().load( '/resource?path=public/nebula.png&screen=sensors-core' );
    var Sensors_Core_AskForSpeed = Sensors_Core_Presets.defaultAskForSpeed;
    var Sensors_core_isSelectingMoveSpeed = false;
    //var Sensors_Core_time = 8401481;

    //when the document finishes loading
    $(document).ready(function(){
        //draw the gui
        drawSensorsGui();
    })

    thisWidget.onResize = function(){
        drawSensorsGui();
    }

    thisWidget.afterResize = function(){
        init();
    }
    
    Interstellar.onPresetValueChange("sensors.sensorContacts",function(newData){
        if(newData == null){
            var genericContacts = 
            [
            {
                "mission" : "Generic Contacts",
                "color" : "black",
                "contacts" : 
                [
                {
                    "name" : "HOSTILE FIGHTER",
                    "icon" : "generic.png",
                    "width" : 3,
                    "height" : 3
                }
                ]
            }
            ]
            Interstellar.setPresetValue("sensors.sensorContacts",genericContacts);
            return;
        }
        Sensors_Core_SensorPresets = newData;
        return;
        var i;
        var html = "";
        for(i = 0;i < Sensors_Core_SensorPresets.contacts.length;i++){
            html += "<option>" + Sensors_Core_SensorPresets.contacts[i] + "</option>";
        }
    });

    //watch the ship.alertStatus on the database,
    //when it fires run this function
    Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
        //if ship.alertStatus is null on the database 
        if(newData == null){
            //stop execution of this function, we will wait for it to be updated by somebody later
            return;
        }
        if(!Sensors_Core_Presets.sensorsArrayIsResponsiveToAlertStatus){
            return; //if the sensors array isn't responsive to the alert status, stop this function
        }
        //set Sensors_Core_Alert_Status to the new value
        Sensors_Core_Alert_Status = newData;
        //and redraw the GUI
        drawSensorsGui();
    })

    //name: drawSensorsGui
    //purpose: draws the circles and lines for the sensors array (draws the clock)
    //takes: none
    //returns: none

    function drawSensorsGui(){
        //we need the sensors array to be perfectly square, so set the height equal to the width
        $("#sensors-core-sensorsContainer").width($("#sensors-core-sensorsContainer").height());
        $("#sensors-core-sensorsArrayCanvas").width($("#sensors-core-sensorsArray").width());
        $("#sensors-core-sensorsArrayCanvas").height($("#sensors-core-sensorsArray").height());
        $("#sensors-coreMoveAllDirectionControls").width($("#sensors-coreMoveAllDirectionControls").height());
        //set the position of the contacts list to right next to the sensors canvas
        $("#sensors-core-senorsContactsList").css("left",$("#sensors-core-sensorsContainer").width());
        //set the position of the contact editor to right next to the contacts list
        $("#sensors-core-ContactEditor").css("left",$("#sensors-core-senorsContactsList").width() + $("#sensors-core-senorsContactsList").position().left + 1);
        //and scale it up to the edge of the widget
        $("#sensors-core-ContactEditor").width($("#Sensor-Array-Core-Widget").width() - $("#sensors-core-ContactEditor").position().left);
        //grab the canvas element from the DOM
        var c = document.getElementById("sensors-core-sensorsArrayCanvas");
        //set the width of the canvas to the width of the sensors array
        c.width = $("#sensors-core-sensorsArray").width();
        //set the height of the canvas to the height of the sensors array
        c.height = $("#sensors-core-sensorsArray").height();
        //grab the context of the canvas
        var ctx = c.getContext("2d");
        //set the color of the sensors array depending on the alert status
        switch(Sensors_Core_Alert_Status){
            case "5":
                ctx.strokeStyle="white"; //set the color to white
                $("#sensors-core-senorsContactsList").css("backgroundColor","rgba(255,255,255,.1)"); //set the contacts list color
                $("#sensors-core-ContactEditor").css("backgroundColor","rgba(255,255,255,.1)"); //set the contact editor color
                break;
                case "4":
                ctx.strokeStyle="#00ffd8"; //set the color to a greenish blue color
                $("#sensors-core-senorsContactsList").css("backgroundColor","rgba(0, 255, 216,.2)"); //set the contacts list color
                $("#sensors-core-ContactEditor").css("backgroundColor","rgba(0, 255, 216,.2)"); //set the contact editor color
                break;
                case "3":
                ctx.strokeStyle="#fff600"; //set the color to yellow
                $("#sensors-core-senorsContactsList").css("backgroundColor","rgba(255, 246, 0,.2)"); //set the contacts list color
                $("#sensors-core-ContactEditor").css("backgroundColor","rgba(255, 246, 0,.2)"); //set the contact editor color
                break;
                case "2":
                ctx.strokeStyle="#ffb200"; //set the color to orange
                $("#sensors-core-senorsContactsList").css("backgroundColor","rgba(255, 178, 0,.2)"); //set the contacts list color
                $("#sensors-core-ContactEditor").css("backgroundColor","rgba(255, 178, 0,.2)"); //set the contact editor color
                break;
                case "1":
                ctx.strokeStyle="red"; //set the color to red
                $("#sensors-core-senorsContactsList").css("backgroundColor","rgba(255, 0, 0,.2)"); //set the contacts list color
                $("#sensors-core-ContactEditor").css("backgroundColor","rgba(255, 0, 0,.2)"); //set the contact editor color
                break;
            default: //in case the alert status is something wierd, default to this
                ctx.strokeStyle="white"; //set the color to white
                $("#sensors-core-senorsContactsList").css("backgroundColor","rgba(255,255,255,.1)"); //set the contacts list color
                $("#sensors-core-ContactEditor").css("backgroundColor","rgba(255,255,255,.1)"); //set the contact editor color
                break;
            }
        //set the circle size to half the sensors array width
        var circleSize = ($("#sensors-core-sensorsArray").width() * .8) / 2;
        var center = ($("#sensors-core-sensorsArray").width() * .9) / 2
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
            switch(Number(Sensors_Core_Alert_Status)){
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

        if(Sensors_Core_Presets.drawGradient){
            ctx.fillStyle = gradient;
        }
        ctx.fill();

        //draw everything to the canvas
        ctx.stroke();
        $("#sensors-coreMoveAllDirectionCanvasContainer").width($("#sensors-coreMoveAllDirectionCanvasContainer").height());
        c = document.getElementById("sensors-coreMoveAllDirectionCanvas");
        //set the width of the canvas to the width of the sensors array
        c.width = $("#sensors-coreMoveAllDirectionCanvasContainer").width();
        //set the height of the canvas to the height of the sensors array
        c.height = $("#sensors-coreMoveAllDirectionCanvasContainer").height();
        //grab the context of the canvas
        var ctx = c.getContext("2d");

        switch(Number(Sensors_Core_Alert_Status)){
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
            ctx.lineWidth = 1.5;
        //set the width and height
        circleSize = ($("#sensors-coreMoveAllDirectionCanvasContainer").width() * .95) / 2;
        //set the center
        center = $("#sensors-coreMoveAllDirectionCanvasContainer").width() / 2;
        //clear the canvas (in case this isn't the first time we're drawing)
        ctx.clearRect(0, 0, c.width, c.height);
        //start drawing
        ctx.beginPath();
        //draw the outer circle
        ctx.arc(center, center, circleSize, 0, 2 * Math.PI);
        //time to draw the angle
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle="red"; //set the color to red
        ctx.moveTo(center,center);
        var directionX = 0;
        var directionY = 0;

        var polarCord = {"radians" : 0, "distance" : 0};
        polarCord.radians = Sensors_Core_MoveAllContactsAngleInRadians - 1.5708; //we want 0 to be straight up, so we have to subtract 90 degrees (1.5708 rads)
        polarCord.distance = circleSize;
        // Convert polar to cartesian
        var cartX = polarCord.distance * Math.cos(polarCord.radians);
        var cartY = polarCord.distance * Math.sin(polarCord.radians);
        //move the origin to the center of the sensors array, not the top left
        var directionX = cartX + center;
        var directionY = cartY + center;
        ctx.lineTo(directionX,directionY);
        //stroke
        ctx.stroke();
        var html = Math.round(Sensors_Array_RadiansToDegrees(Sensors_Core_MoveAllContactsAngleInRadians));
        if(Math.round(Sensors_Array_RadiansToDegrees(Sensors_Core_MoveAllContactsAngleInRadians)) < 0){
            html = Math.round(Sensors_Array_RadiansToDegrees(Sensors_Core_MoveAllContactsAngleInRadians)) + 360;
        }
        $("#coreMoveAllDirectionDegreesLabel").html(html + "°");
        polarCord.distance = -(circleSize / 2)
        cartX = polarCord.distance * Math.cos(polarCord.radians);
        cartY = polarCord.distance * Math.sin(polarCord.radians);
        directionX = cartX + (center / 2);
        directionY = cartY + center;
        $("#coreMoveAllDirectionDegreesLabel").css("top",directionY + "px"); 
        $("#coreMoveAllDirectionDegreesLabel").css("left",directionX + "px");
    }

    $("#sensors-coreMoveAllDirectionCanvasContainer").mousedown(function(event){
        var halfOfWidth = $("#sensors-coreMoveAllDirectionCanvasContainer").width() / 2;
        var halfOfHeight = $("#sensors-coreMoveAllDirectionCanvasContainer").height() / 2;
        var polarCord = cartesian2Polar(event.offsetX - halfOfWidth,event.offsetY - halfOfHeight);
        if(polarCord.distance > halfOfWidth){
            return;
        }
        Sensors_Core_MoveAllContactsAngleInRadians = polarCord.radians + 1.5708;
        drawSensorsGui();
        $('#sensors-coreMoveAllDirectionCanvasContainer').append("<div class='sensors-core-moveAllDirectionMouseCatcher' style='position:absolute;top:0px;left:0px;width:100%;height:100%;cursor:-webkit-grabbing;z-index: 2100000;'></div>");
        $(".sensors-core-moveAllDirectionMouseCatcher").mousemove(function(event){
            var halfOfWidth = $("#sensors-coreMoveAllDirectionCanvasContainer").width() / 2;
            var halfOfHeight = $("#sensors-coreMoveAllDirectionCanvasContainer").height() / 2;
            var polarCord = cartesian2Polar(event.offsetX - halfOfWidth,event.offsetY - halfOfHeight);
            if(polarCord.distance > halfOfWidth){
                return;
            }
            Sensors_Core_MoveAllContactsAngleInRadians = polarCord.radians + 1.5708;
            drawSensorsGui();
            $(".sensors-core-moveAllDirectionMouseCatcher").mouseup(function(event){
                $(".sensors-core-moveAllDirectionMouseCatcher").off();
                $(".sensors-core-moveAllDirectionMouseCatcher").remove();
            });
            $(".sensors-core-moveAllDirectionMouseCatcher").mouseleave(function(event){
                $(".sensors-core-moveAllDirectionMouseCatcher").off();
                $(".sensors-core-moveAllDirectionMouseCatcher").remove();
            });
        });
    });

    function Sensors_Array_Update_Animations_Interval(){
        if(Sensors_Core_AnimationInterval != undefined){
            return;
        }

        clearInterval(Sensors_Core_AnimationInterval);
        Sensors_Core_AnimationInterval = undefined;
        var doneAnimating = true;
        for(var i = 0;i< Sensors_Core_Sensors_Contacts.length;i++){
            var currentX = Sensors_Core_Sensors_Contacts[i].xPos;
            var currentY = Sensors_Core_Sensors_Contacts[i].yPos;
            var wantedX = Sensors_Core_Sensors_Contacts[i].wantedXPos;
            var wantedY = Sensors_Core_Sensors_Contacts[i].wantedYPos;
            if(!(Math.round(currentX) == Math.round(wantedX) && Math.round(currentY) == Math.round(wantedY))){
                doneAnimating = false;
            }
        }
        if(Sensors_Core_MoveAllContactsDistanceToMove != 0){
            doneAnimating = false;
        }
        if(Sensors_Core_YawAdjust != 0){
            doneAnimating = false;
        }
        if(doneAnimating){
            return;
        }
        Sensors_Core_AnimationInterval = setInterval(function(){
            var didChangeAttributes = false;
            var doneAnimating = true;
            Sensors_Core_RunningUnderCachedDatabase = true;
            if(Sensors_Core_MoveAllContactsDistanceToMove){
                doneAnimating = false;
                Sensors_Array_moveAllContacts(Sensors_Core_MoveAllContactsAngleInRadians,Sensors_Core_MoveAllContactsDistanceToMove);
                for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
                    var currentY = Sensors_Core_Sensors_Contacts[i].yPos;
                    var currentX = Sensors_Core_Sensors_Contacts[i].xPos;
                    var contactAttributes = sensors_array_getContactAttributesByContactID(Sensors_Core_Sensors_Contacts[i].contactID);
                    if(contactAttributes.contactIsActive && (currentY < -50 || currentX < -100 - (contactAttributes.width * 2) || currentX > 200 + (contactAttributes.width * 2))){
                        if(contactAttributes.contactType == "contact"){
                            for(var k = 0;k < Sensors_Core_Sensors_ContactAttributes.length;k++){
                                if(Sensors_Core_Sensors_ContactAttributes[k].contactID == contactAttributes.contactID){
                                    Sensors_Core_Sensors_ContactAttributes[k].contactIsActive = false;
                                    Sensors_Array_Core_drawContactsList();
                                    Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : contactAttributes.contactID});
                                }
                            }
                        }else{
                            Sensors_Array_RemoveContact(Sensors_Core_Sensors_Contacts[i].contactID);
                            //these contacts shouldn't even be on the list, so I don't know why we would update the contact list
                            //Sensors_Array_Core_drawContactsList();
                        }
                    }
                }
            }
            if(Sensors_Core_YawAdjust != 0){
                doneAnimating = false;
                //save height and width of array now, so we only have to make one call
                var widthOfSensorsArray = $("#sensors-core-sensorsArrayCanvas").width();
                var heightOfSensorsArray = $("#sensors-core-sensorsArrayCanvas").height();

                //check if there are sensors contacts
                if(Sensors_Core_Sensors_Contacts == undefined || Sensors_Core_Sensors_Contacts.length <= 0){
                //if there are no contacts, end this function
                return;
            }
                // for each sensor contact
                for(var i = 0;i < Sensors_Core_Sensors_Contacts.length; i++){
                    // convert their cartesian cords to polar cords
                    var polarX = (((Sensors_Core_Sensors_Contacts[i].wantedXPos) - 50) * 2) / 100;
                    var polarY = ((((Sensors_Core_Sensors_Contacts[i].wantedYPos) - 50) * 2) / 100) * -1;
                    var polarCord = cartesian2Polar(polarX * widthOfSensorsArray,polarY * heightOfSensorsArray);
                    // adjust yaw (theta)
                    polarCord.radians += Sensors_Core_YawAdjust;
                    // Convert polar to cartesian
                    var cartX = polarCord.distance * Math.cos(polarCord.radians);
                    var cartY = polarCord.distance * Math.sin(polarCord.radians);
                    //move the origin to the center of the sensors array, not the top left
                    var x = (cartX / 2) + (widthOfSensorsArray / 2);
                    var y = heightOfSensorsArray - ((cartY / 2) + (heightOfSensorsArray / 2));
                    // save
                    Sensors_Core_Sensors_Contacts[i].wantedXPos = (x / widthOfSensorsArray) * 100; //convert back to percentage
                    Sensors_Core_Sensors_Contacts[i].wantedYPos = (y / heightOfSensorsArray) * 100; //convert back to percentage

                    //do the same for the actual x and y, not the wanted x and y
                    // convert their cartesian cords to polar cords
                    polarX = (((Sensors_Core_Sensors_Contacts[i].xPos) - 50) * 2) / 100;
                    polarY = ((((Sensors_Core_Sensors_Contacts[i].yPos) - 50) * 2) / 100) * -1;
                    polarCord = cartesian2Polar(polarX * widthOfSensorsArray,polarY * heightOfSensorsArray);
                    // adjust yaw (theta)
                    polarCord.radians += Sensors_Core_YawAdjust;
                    // Convert polar to cartesian
                    cartX = polarCord.distance * Math.cos(polarCord.radians);
                    cartY = polarCord.distance * Math.sin(polarCord.radians);
                    //move the origin to the center of the sensors array, not the top left
                    x = (cartX / 2) + (widthOfSensorsArray / 2);
                    y = heightOfSensorsArray - ((cartY / 2) + (heightOfSensorsArray / 2));
                    // save
                    Sensors_Core_Sensors_Contacts[i].xPos = (x / widthOfSensorsArray) * 100; //convert back to percentage
                    Sensors_Core_Sensors_Contacts[i].yPos = (y / heightOfSensorsArray) * 100; //convert back to percentage
                    didChangeAttributes = true;
                    Sensors_Core_Sensors_ContactAttributes[i].xStep = 0;
                    Sensors_Core_Sensors_ContactAttributes[i].yStep = 0;
                    Sensors_Core_Sensors_ContactAttributes[i].animationSpeed = Sensors_Core_ContactMoveSpeed;
                }
            }
            for(var i = 0;i< Sensors_Core_Sensors_Contacts.length;i++){
                var currentX = Sensors_Core_Sensors_Contacts[i].xPos;
                var currentY = Sensors_Core_Sensors_Contacts[i].yPos;
                var wantedX = Sensors_Core_Sensors_Contacts[i].wantedXPos;
                var wantedY = Sensors_Core_Sensors_Contacts[i].wantedYPos;
                if(!(Math.round(currentX) == Math.round(wantedX) && Math.round(currentY) == Math.round(wantedY))){
                    doneAnimating = false;
                    var xStep = Sensors_Core_Sensors_ContactAttributes[i].xStep;
                    var yStep = Sensors_Core_Sensors_ContactAttributes[i].yStep;
                    if(xStep == 0){
                        //we have not calculated our steps yet, we need
                        //to do that now so that our animmation is in a
                        //straight linear line
                        var speed = Sensors_Core_Sensors_ContactAttributes[i].animationSpeed;
                        var xDiffrence = wantedX - currentX;
                        var yDiffrence = wantedY - currentY;
                        xStep = xDiffrence / speed;
                        yStep = yDiffrence / speed;
                        didChangeAttributes = true;
                        Sensors_Core_Sensors_ContactAttributes[i].xStep = xStep;
                        Sensors_Core_Sensors_ContactAttributes[i].yStep = yStep;
                    }
                    if(Math.abs(wantedX - currentX) <= Math.abs(xStep) && Math.abs(wantedY - currentY) <= Math.abs(yStep)){
                        currentX = wantedX;
                        currentY = wantedY;
                    }else{
                        currentX += xStep;
                        currentY += yStep;
                    }
                }else{
                    didChangeAttributes = true;
                    Sensors_Core_Sensors_ContactAttributes[i].xStep = 0;
                    Sensors_Core_Sensors_ContactAttributes[i].yStep = 0;
                }
                Sensors_Core_Sensors_Contacts[i].yPos = currentY;
                Sensors_Core_Sensors_Contacts[i].xPos = currentX;
            }

            //now that we have updated all the positions, we
            //need to update the database

            if(Sensors_Core_Sensors_Contacts.length < Sensors_Core_Sensors_ContactAttributes.length){
                console.log("There are more contact attributes than contacts... deleting excess...");
                var newContactAttributes = [];
                for(var i = 0; i < Sensors_Core_Sensors_ContactAttributes.length;i++){
                    var contactsObject = sensors_array_getContactByContactID(Sensors_Core_Sensors_ContactAttributes[i].contactID);
                    if(contactsObject != undefined){
                        newContactAttributes.splice(newContactAttributes.length,0,Sensors_Core_Sensors_ContactAttributes[i]);
                    }
                }
                Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : newContactAttributes, "contactLastEdited" : "multiple"});
            }
            if(Sensors_Core_Sensors_Contacts.length > Sensors_Core_Sensors_ContactAttributes.length){
                console.log("There are more contacts than contacts attributes... deleting excess...");
                var newContactAttributes = [];
                for(var i = 0; i < Sensors_Core_Sensors_Contacts.length;i++){
                    var contactsObject = sensors_array_getContactAttributesByContactID(Sensors_Core_Sensors_Contacts[i].contactID);
                    if(contactsObject != undefined){
                        newContactAttributes.splice(newContactAttributes.length,0,Sensors_Core_Sensors_Contacts[i]);
                    }
                }
                Sensors_Core_Sensors_Contacts = newContactAttributes;
            }
            Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
            if(doneAnimating){
                clearInterval(Sensors_Core_AnimationInterval);
                Sensors_Core_AnimationInterval = undefined;
            }
        },Sensors_Core_Presets.updateInterval);
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

    /*
    name: Sensors_Array_Core_addNewContactToDatabase
    purpse: adds a new contact to the database, so it can be seen by all clients
    takes: name, the name of the icon (example, USS WASHINGTON)
        xPos, the xPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact xPos can be beyond 0 or 100)
        yPos, the yPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact yPos can be beyond 0 or 100)
        icon, the icon of the contact, this is the picture that shows up on the array.  MUST BE ON ICONS.JSON!!
        image, the image of the contact, this is the picture that shows up when they click the contact.  MUST BE ON IMAGES.JSON!!
        width, the width of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
        height, the height of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
        attributes, this object contains information like "isVisible" and "isInfared"
    returns: none
    */
    function Sensors_Array_Core_addNewContactToDatabase(name,xPos,yPos,icon,image,width,height,attributes){
        if(icon == ""){
            icon = "Generic.png";
        }
        var contactID = guidGenerator();
        //create the new contact Attributes
        var newContactAttributes = 
        {
            "contactType" : "contact", //used to differentiate between contacts and programs
            "contactIsActive" : false,
            "xStep" : 0, //calcuated before animations start to ensure a linear line with animations
            "yStep" : 0, //calcuated before animations start to ensure a linear line with animations
            "width" : width, //width, the width of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
            "height" : height, //height, the height of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
            "name" : name, //name, the name of the icon (example, USS WASHINGTON)
            "icon" : icon, //icon, the icon of the contact, this is the picture that shows up on the array.  MUST BE ON ICONS.JSON!!
            "image" : image, //image, the image of the contact, this is the picture that shows up when they click the contact.  MUST BE ON IMAGES.JSON!!
            "attributes" : attributes, //this object contains information like "isVisible" and "isInfared"
            "animationSpeed" : 100, //this controls how fast the object moves from it's position to it's wanted position
            "contactID" : contactID //this is a unique id that helps to seperate contacts
        }
        //then it's position data
        var newContact = 
        {
            "xPos" : xPos, //xPos, the xPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact xPos can be beyond 0 or 100) 
            "yPos" : yPos, //yPos, the yPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact yPos can be beyond 0 or 100)
            "wantedXPos" : xPos, //this has to do with animations
            "wantedYPos" : yPos, //this has to do with animations
            "contactID" : contactID
        }
        //insert it into the Sensors_Core_Sensors_Contacts array
        Sensors_Core_Sensors_Contacts.splice(Sensors_Core_Sensors_Contacts.length,0,newContact);
        Sensors_Core_Sensors_ContactAttributes.splice(Sensors_Core_Sensors_ContactAttributes.length,0,newContactAttributes);
        Sensors_Core_ContactEditorCurrentContact = newContactAttributes;
        //update the database
        Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : contactID});
    }

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
        Sensors_Array_Core_Update_Contact_Editor();
        if(Sensors_Core_Sensors_ContactAttributesLastChangedValue == "contactIsActive"){
            return;
        }
        Sensors_Array_Core_drawContactsList();
    });
    Interstellar.onDatabaseValueChange("sensors.contacts",function(newData){
        //if the database doesn't have the value "sensors.contacts" yet
        if(newData == null){
            //set the database value "sensors.contacts" to an empty array []
            Interstellar.setDatabaseValue("sensors.contacts",[]);
            //terminate the execution of this function, so we don't get errors
            return;
        }
        $("#serverLoad").html("CONTACTS COUNT: " + newData.length);
        //set the array Sensors_Core_Sensors_Contacts equal to the newData
        /*while(Sensors_Core_RunningUnderCachedDatabase){
            //wait
        }*/
        Sensors_Core_Sensors_Contacts = newData;
        Sensors_Array_Update_Animations_Interval();
    });

    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
       };
       return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    //name: Sensors_Array_Core_drawContactsList
    //purpse: lists all the contacts on the database
    //takes: none
    //returns: none

    $("#sensors-core-senorsContactsListItemsContainer").scroll(function(event){
        Sensors_Core_ContactListScrollPosition = $("#sensors-core-senorsContactsListItemsContainer").scrollTop();
        Sensors_Core_ContactListScrollPosition = (Sensors_Core_ContactListScrollPosition / $("#sensors-core-senorsContactsListItemsContainer").height()) * (($("#sensors-core-senorsContactsListItemsContainer").height() / $("#sensors-core-senorsContactsList").height()) * 100);
    });

    function Sensors_Array_Core_drawContactsList(){
        var heightOfProgramsTab = (((Sensors_Core_SensorPrograms.length * 22) / $("#sensors-core-senorsContactsList").height()) * 100);
        var heightOfContactsTab = (93 - heightOfProgramsTab);
        $("#sensors-core-sesnorsProgramsListItemsContainer").animate({"height" : heightOfProgramsTab + "%"});
        $("#sensors-core-senorsContactsListItemsContainer").animate({"height" : heightOfContactsTab + "%"});
        var html = "";
        for(var i = 0;i < Sensors_Core_SensorPrograms.length;i++){
            //create a new div and set the class to a list item
            html += "<div class='sensors-core-senorsProgramListItem'";
            html += " programID='" + Sensors_Core_SensorPrograms[i].programID + "'";
            html += ">";
            html += Sensors_Core_SensorPrograms[i].programType;
            html += "</div>";
        }
        $("#sensors-core-sesnorsProgramsListItemsContainer").html(html);
        $(".sensors-core-senorsProgramListItem").off();
        $(".sensors-core-senorsProgramListItem").click(function(event){
            if(Sensors_Core_deleteContactMode){
                Sensors_Array_endProgram($(event.target).attr("programID"));
            }
        });
        //set the width of each listItem
        var heightOfEachItem = 25;
        //create the new html string
        var html = "";
        var numberOfContactsCreated = 0;
        //cycle through each sensor contact
        for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
            if(Sensors_Core_Sensors_ContactAttributes[i].contactType == "contact"){
                numberOfContactsCreated++;
            //create a new div and set the class to a list item
            html += "<div class='sensors-core-senorsContactsListItem sensors-core-senorsContactListContainer'";
            //set the index to i (the contact index)
            html += " contactListIndex='" + i + "'";
            //set the top position and height of the item
            html += " style='top:" + (numberOfContactsCreated - 1) * heightOfEachItem + "px;height: " + heightOfEachItem + "px'>";
            //if we are in delete mode, the name box needs to shift slightly
            //the the left, so we need to create a variable for this now
            var nameBoxLeftPosition = "left:2%;width 68%;";
            //if we are in delete mode
            if(Sensors_Core_deleteContactMode){
                //create a garbage can class
                html += "<div class='sensors-core-removeContactGarbageCan' contactListIndex='" + i + "'>"
                //i apologize for the really long line of code below
                //this adds a trash can next to the name
                html += "<svg fill='red' height='24' contactListIndex='" + i + "' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path contactListIndex='" + i + "' d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/><path contactListIndex='" + i + "' d='M0 0h24v24H0z' fill='none'/></svg>";
                //last, let's close the div
                html += "</div>"
                //and let's also move the name box over a tad bit, to make room
                nameBoxLeftPosition = "left:12%;width 58%;";
            }
            if(Sensors_Core_copyContactMode){
                //create a copy class
                html += "<div class='sensors-core-copyContactIcon' contactListIndex='" + i + "'>"
                //i apologize for the really long line of code below
                //this adds a copy icon next to the name
                html += "<svg fill='#75d5ff' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h24v24H0z' fill='none'/><path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/></svg>";
                //last, let's close the div
                html += "</div>"
                //and let's also move the name box over a tad bit, to make room
                nameBoxLeftPosition = "left:12%;width 58%;";
            }
            //insert the name of the contact
            html += "<div style='" + nameBoxLeftPosition + "' contactListIndex='" + i + "' class='sensors-core-senorsContactsListTitle'>" + Sensors_Core_Sensors_ContactAttributes[i].name + "</div>";
            //if the contact is visable,
            if(Sensors_Core_Sensors_ContactAttributes[i].attributes.isVisible){
                //add a true circle
                html += "<div contactListIndex='" + i + "' class='sensors-core-senorsContactsListTrueAttribute sensors-core-senorsAttribute isVisibleAttributeToggle'";
            }else{
                //add a false circle
                html += "<div contactListIndex='" + i + "' class='sensors-core-senorsContactsListFalseAttribute sensors-core-senorsAttribute isVisibleAttributeToggle'";
            }
            //set the id to the index of the sensorsContact
            html += " id='" + i + "'"
            //set the position
            html += " style='right:5%;'";
            //close the div
            html += "></div>";
            //close the div
            html += "</div>";
        }
    }
        //update the DOM with the new html we created
        $("#sensors-core-senorsContactsListItemsContainer").html(html);
        //clear all event listeners
        $(".isVisibleAttributeToggle").off()
        $(".isVisibleAttributeToggle").click(function(event){
            Sensors_Core_Sensors_ContactAttributes[event.target.id].attributes.isVisible = !Sensors_Core_Sensors_ContactAttributes[event.target.id].attributes.isVisible;
            Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : Sensors_Core_Sensors_ContactAttributes[event.target.id].contactID}); 
        });
        $(".sensors-core-senorsContactsListItem").off();
        $(".sensors-core-senorsContactsListItem").click(function(event){
            Sensors_Core_ContactEditorCurrentContact = Sensors_Core_Sensors_ContactAttributes[event.target.getAttribute("contactListIndex")];
            Sensors_Array_Core_Update_Contact_Editor();
            Sensors_Array_Core_UpdateContactEditorSizeSliderMessage(Sensors_Core_ContactEditorCurrentContact.width * 5);
            $("#sensors-core-ContactEditor-SizeRangeFill").animate({"width" : (Sensors_Core_ContactEditorCurrentContact.width * 5) + "%"});
            if(Sensors_Core_deleteContactMode){
                var contactIDChanged = "";
                if(Sensors_Core_ContactEditorCurrentContact == undefined){
                    Sensors_Core_ContactEditorCurrentContact = Sensors_Core_Sensors_ContactAttributes[event.target.getAttribute("contactlistindex")];
                }
                for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
                    Sensors_Core_ContactEditorCurrentContact = Sensors_Core_Sensors_ContactAttributes[event.target.getAttribute("contactListIndex")];
                    if(Sensors_Core_ContactEditorCurrentContact.contactID == Sensors_Core_Sensors_ContactAttributes[i].contactID){
                        if(Sensors_Core_ContactEditorCurrentContact.contactID == Sensors_Core_ContactEditorCurrentContact.contactID){
                            Sensors_Core_ContactEditorCurrentContact = undefined;
                        }
                        contactIDChanged = Sensors_Core_Sensors_Contacts[i].contactID;
                        Sensors_Array_RemoveContact(contactIDChanged);
                    }
                }
                Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
                Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : contactIDChanged});
            }
            if(Sensors_Core_copyContactMode){
                var contactIDChanged = "";
                if(Sensors_Core_ContactEditorCurrentContact == undefined){
                    Sensors_Core_ContactEditorCurrentContact = Sensors_Core_Sensors_ContactAttributes[event.target.getAttribute("contactlistindex")];
                }
                var name = Sensors_Core_ContactEditorCurrentContact.name;
                var width = Sensors_Core_ContactEditorCurrentContact.width;
                var height = Sensors_Core_ContactEditorCurrentContact.height;
                var attributes = Sensors_Core_ContactEditorCurrentContact.attributes;
                var icon = Sensors_Core_ContactEditorCurrentContact.icon;
                var image = Sensors_Core_ContactEditorCurrentContact.image;
                Sensors_Array_Core_addNewContactToDatabase(name,0,0,icon,image,width,height,attributes);
            }
        });
    }

    function Sensors_Array_Core_UpdateContactEditorSizeSliderMessage(size){
        var message = Math.round(size) + "% (";
        var sizeComparison = "";
        if(size > 90){
            sizeComparison = "Borg Cube";
        }else if(size > 70){
            sizeComparison = "Moon";
        }else if(size > 60){
            sizeComparison = "Starbase";
        }else if(size > 40){
            sizeComparison = "Outpost";
        }else if(size > 26){
            sizeComparison = "Large Asteroid";
        }else if(size > 23){
            sizeComparison = "Asteroid";
        }else if(size > 20){
            sizeComparison = "Small Asteroid";
        }else if(size > 14){
            sizeComparison = "Galaxy Class";
        }else if(size > 11){
            sizeComparison = "Constitution Class";
        }else if(size > 9){
            sizeComparison = "Nebula Class";
        }else if(size > 7){
            sizeComparison = "Intrepid Class";
        }else if(size > 5){
            sizeComparison = "Defiant Class";
        }else if(size > 3.5){
            sizeComparison = "Fighter";
        }else if(size > 2){
            sizeComparison = "Debris";
        }else if(size >= 1){
            sizeComparison = "Human";
        }
        message += sizeComparison + " Sized)";
        $("#sensors-core-ContactEditor-SizeRangeLabel").html(message);
    }

    function Sensors_Array_Core_Update_Contact_Editor(){
        if(Sensors_Core_ContactEditorCurrentContact == undefined){
            return;
        }
        $("#sensors-core-ContactEditor-EditIconImage").attr("src","/resource?path=public/Contacts/" + Sensors_Core_ContactEditorCurrentContact.icon + "&screen=sensors-core");
        $("#sensors-core-ContactEditor-NameTextbox").val(Sensors_Core_ContactEditorCurrentContact.name);
        $("#sensors-core-ContactEditor-NameTextbox").off();
        $("#sensors-core-ContactEditor-NameTextbox").on("change",function(event){
            for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
                if(Sensors_Core_ContactEditorCurrentContact.contactID == Sensors_Core_Sensors_ContactAttributes[i].contactID){
                    Sensors_Core_Sensors_ContactAttributes[i].name = event.target.value.toString().toUpperCase();
                    Sensors_Core_ContactEditorCurrentContact.name = event.target.value.toString().toUpperCase();
                    Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : Sensors_Core_Sensors_ContactAttributes[i].contactID, "lastChangedValue" : "name"});
                }
            }
        });
        $("#sensors-core-ContactEditor-SizeRange").off();
        $("#sensors-core-ContactEditor-SizeRange").mousedown(function(event){
            var newSize = (event.offsetX / $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").width()) * 100;
            Sensors_Array_Core_UpdateContactEditorSizeSliderMessage(newSize);
            $("#sensors-core-ContactEditor-SizeRangeFill").css("width",newSize + "%")
            for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
                if(Sensors_Core_ContactEditorCurrentContact.contactID == Sensors_Core_Sensors_ContactAttributes[i].contactID){
                    Sensors_Core_Sensors_ContactAttributes[i].height = newSize * .2;
                    Sensors_Core_Sensors_ContactAttributes[i].width = newSize * .2;
                    Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : Sensors_Core_Sensors_ContactAttributes[i].contactID});
                }
            }
            $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").mousemove(function(event){
                var newSize = (event.offsetX / $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").width()) * 100;
                $("#sensors-core-ContactEditor-SizeRangeFill").css("width",newSize + "%")
                
                Sensors_Array_Core_UpdateContactEditorSizeSliderMessage(newSize);
                for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
                    if(Sensors_Core_ContactEditorCurrentContact.contactID == Sensors_Core_Sensors_ContactAttributes[i].contactID){
                        Sensors_Core_Sensors_ContactAttributes[i].height = newSize * .2;
                        Sensors_Core_Sensors_ContactAttributes[i].width = newSize * .2;
                        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : Sensors_Core_Sensors_ContactAttributes[i].contactID});
                    }
                }
            });
            $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").mouseup(function(event){
                $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").off();
            });
            $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").mouseleave(function(event){
                $("#sensors-core-ContactEditor-SizeRangeMouseCatcher").off();
            });
        });
    }

    function Sensors_Array_CorehexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
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
                    var texture = new THREE.TextureLoader().load( '/resource?path=public/shockwave.png&screen=sensors-core' );
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
                    //now create the ghost
                    var texture = Sensors_Core_NebulaTexture;
                    var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : 0 } );

                    var geometry = new THREE.BoxGeometry(3,3,0);
                    var cube = new THREE.Mesh(geometry, material);
                    cube.name = contactAttributes.contactID + "_GHOST";
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
                        var texture = new THREE.TextureLoader().load( '/resource?path=public/Contacts/' + contactAttributes.icon + '&screen=sensors-core' );
                        if(contactAttributes.contactType == "planet"){
                            texture = new THREE.TextureLoader().load( '/resource?path=public/Planets/' + contactAttributes.icon + '&screen=sensors-core' );
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
                //now create the ghost
                material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : .5 } );
                if(!contactAttributes.contactIsActive){
                    material.opacity = 0;
                }else{
                    material.opacity = .5;
                }

                geometry = new THREE.BoxGeometry(3,3,-100 - contactAttributes.width);
                cube = new THREE.Mesh(geometry, material);
                cube.name = contactAttributes.contactID + "_GHOST";
                cube.position.set(contact.xPos,contact.yPos,-100 - contactAttributes.width);
                cube.scale.x = contactAttributes.width;
                cube.scale.y = contactAttributes.height;
                sensors_array_sensorsArrayScene.add(cube);

    /*
                //now create the line between the ghost, and give it it's own random color
                var geometry = new THREE.Geometry();

                geometry.vertices.push(0,30,0);
                geometry.vertices.push(50,13,0);

                var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({}));
                line.name = contactAttributes.contactID + "_LINE";
                sensors_array_sensorsArrayScene.add(line);
                */
                //now draw it's list contact icon
                var opacity = 1;
                if(contactAttributes.contactIsActive){
                    opacity = 0;
                }
                material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : opacity } );

                geometry = new THREE.BoxGeometry(5,5,3);
                cube = new THREE.Mesh(geometry, material);
                cube.name = contactAttributes.contactID + "_LIST_VIEW";
                if(contactAttributes.contactType == "contact"){
                    contactsToDrawListElementFor++;
                }
                cube.position.set(95,(97 - (contactsToDrawListElementFor * 5)) + Sensors_Core_ContactListScrollPosition,200);
                sensors_array_sensorsArrayScene.add(cube);

            }
        }else{
                //update an old one
                if(Sensors_Core_Sensors_ContactAttributesLastChangedID == contact.contactID || Sensors_Core_Sensors_ContactAttributesLastChangedID == "multiple"){
                    sceneObject.scale.x = contactAttributes.width;
                    sceneObject.scale.y = contactAttributes.height;
                    sceneObject.position.z = contactAttributes.width;
                    if(Sensors_Core_Sensors_ContactAttributesLastChangedValue == "icon"){
                        var texture = new THREE.TextureLoader().load( '/resource?path=public/Contacts/' + contactAttributes.icon + '&screen=sensors-core' );
                        var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                        sceneObject.material = material;
                    }

                    if(!contactAttributes.contactIsActive){
                        sceneObject.material.opacity = 0;
                    }else{
                        sceneObject.material.opacity = 1;
                    }
                    //lets get it's ghost too
                    sceneObject = sensors_array_sensorsArrayScene.getObjectByName(contact.contactID + "_GHOST");
                    sceneObject.scale.x = contactAttributes.width;
                    sceneObject.scale.y = contactAttributes.height;
                    sceneObject.position.z = -100 - contactAttributes.width;
                    if(Sensors_Core_Sensors_ContactAttributesLastChangedValue == "icon"){
                        var texture = new THREE.TextureLoader().load( '/resource?path=public/Contacts/' + contactAttributes.icon + '&screen=sensors-core' );
                        var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : .58 } );
                        sceneObject.material = material;
                    }

                    if(!contactAttributes.contactIsActive){
                        sceneObject.material.opacity = 0;
                    }else{
                        sceneObject.material.opacity = .58;
                    }
                    //update the list view
                    if(contactAttributes.contactType == "contact"){
                        sceneObject = sensors_array_sensorsArrayScene.getObjectByName(contact.contactID + "_LIST_VIEW");
                        if(contactAttributes.contactType == "contact"){
                            contactsToDrawListElementFor++;
                            sceneObject.position.set(95,(97 - (contactsToDrawListElementFor * 5)) - Sensors_Core_ContactListScrollPosition,98);
                            if(Sensors_Core_Sensors_ContactAttributesLastChangedValue == "icon"){
                                var texture = new THREE.TextureLoader().load( '/resource?path=public/Contacts/' + contactAttributes.icon + '&screen=sensors-core' );
                                var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true } );
                                sceneObject.material = material;
                            }
                            if(contactAttributes.contactIsActive){
                                sceneObject.material.opacity = 0;
                            }else{
                                sceneObject.material.opacity = 1;
                            }
                        }
                    }
                }
            }
        }
    }
    }

    var sensors_array_sensorsArrayContainer;
    var sensors_array_sensorsArrayCamera, sensors_array_sensorsArrayScene, sensors_array_sensorsArrayRenderer;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    init();
    animate();

    $("#sensors-core-sensorsArray").mouseleave(function(event){
        if(Sensors_Core_CurrentDragTargetIsDragging && !Sensors_core_isSelectingMoveSpeed){
            var contactAttributes = sensors_array_getContactAttributesByContactID(Sensors_Core_CurrentDragTarget);
            contactAttributes.contactIsActive = false;
            var contactLastEdited = Sensors_Core_CurrentDragTarget;
            if(Sensors_Core_MouseDragSelectionSelectedContacts.length > 0){
                contactLastEdited = "multiple";
                for(var i = 0;i < Sensors_Core_MouseDragSelectionSelectedContacts.length;i++){
                    for(var j = 0;j < Sensors_Core_Sensors_ContactAttributes.length;j++){
                        if(Sensors_Core_Sensors_ContactAttributes[j].contactID == Sensors_Core_MouseDragSelectionSelectedContacts[i].contactID){
                            Sensors_Core_Sensors_ContactAttributes[j].contactIsActive = false;
                        }
                    }
                }
            }
            Sensors_Core_MouseDragSelectionSelectedContacts = [];
            Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
            Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : contactLastEdited});
            Sensors_Core_CurrentDragTarget = undefined;
            Sensors_Core_CurrentDragTargetIsDragging = false;
        }
    });
    $("#sensors-core-sensorsArray").mousemove(function(event){
        if(!Sensors_core_isSelectingMoveSpeed){
            mouse.x = ( event.offsetX / $("#sensors-core-sensorsArray").width() ) * 2 - 1;
            mouse.y = - ( event.offsetY / $("#sensors-core-sensorsArray").height() ) * 2 + 1;
            Sensors_Core_CurrentDragTargetPosition.x = (event.offsetX / $("#sensors-core-sensorsArray").width()) * 100;
            Sensors_Core_CurrentDragTargetPosition.y = (event.offsetY / $("#sensors-core-sensorsArray").width()) * 100;
        }
    });
    $("#sensors-core-sensorsArray").mousedown(function(event){
        if(Sensors_core_isSelectingMoveSpeed){
            return;
        }
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, sensors_array_sensorsArrayCamera);
        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects( sensors_array_sensorsArrayScene.children );
        var selectingNotDragging = false;
        for ( var i = 0; i < intersects.length; i++ ) {
            var lookupName = intersects[ i ].object.name;
            lookupName = lookupName.replace("_GHOST","");
            lookupName = lookupName.replace("_LIST_VIEW","");
            lookupName = lookupName.replace("_LINE","");
            lookupName = lookupName.replace("_LINE_VIEW","");
            if(!intersects[ i ].object.name.includes("GHOST") && intersects[ i ].object.material.opacity != 0 && sensors_array_getContactAttributesByContactID(lookupName).contactType == "contact"){
                selectingNotDragging = true;
                if(intersects[ i ].object.name.includes("_LIST_VIEW")){
                    Sensors_Core_CurrentDragTarget = intersects[ i ].object.name;
                    Sensors_Core_ContactEditorCurrentContact = sensors_array_getContactByContactID(intersects[ i ].object.name.replace("_LIST_VIEW",""));
                    Sensors_Core_CurrentDragTargetIsDraggingListItem = true;
                }else{
                    if(sensors_array_getContactAttributesByContactID(intersects[ i ].object.name).contactType == "contact" || sensors_array_getContactAttributesByContactID(intersects[ i ].object.name).contactType == "asteroid"){
                        Sensors_Core_CurrentDragTarget = intersects[ i ].object.name;
                        Sensors_Core_ContactEditorCurrentContact = sensors_array_getContactByContactID(intersects[ i ].object.name);
                        Sensors_Core_CurrentDragTargetIsDragging = true;
                    }
                }
            }
        }
        if(!selectingNotDragging){
            //dragging, not selecting
            Sensors_Core_MouseDragSelectionSelectedContacts = [];
            Sensors_Core_MouseDragSelectionFinalPosition = {"xStart" : 0, "xEnd" : 0, "yStart" : 0, "yEnd" : 0};
            $("#sensors-core-sensorsArrayMouseDragSelectBox").remove();
            Sensors_Core_MouseDragSelectionOrigin.xPos = event.offsetX;
            Sensors_Core_MouseDragSelectionOrigin.yPos = event.offsetY;
            var html = "<div id='sensors-core-sensorsArrayMouseDragSelectBox'";
            html += " style='top:" + Sensors_Core_MouseDragSelectionOrigin.yPos + "px;left: " + Sensors_Core_MouseDragSelectionOrigin.xPos + "px'></div>";
            $('#sensors-core-sensorsArray').append("<div class='sensors-core-sensorsArrayMouseSelectionDraggingMouseCatcher' style='cursor:default;position:absolute;top:0px;left:0px;width:100%;height:100%;z-index: 2100000;'></div>");
            $("#sensors-core-sensorsArrayDragSelectionLayer").append(html);
            $(".sensors-core-sensorsArrayMouseSelectionDraggingMouseCatcher").mousemove(function(event){
                var xStart = 0;
                var yStart = 0;
                var xEnd = 0;
                var yEnd = 0;
                if(event.offsetY > Sensors_Core_MouseDragSelectionOrigin.yPos){
                    yStart = Sensors_Core_MouseDragSelectionOrigin.yPos;
                    yEnd = event.offsetY - Sensors_Core_MouseDragSelectionOrigin.yPos;
                    $("#sensors-core-sensorsArrayMouseDragSelectBox").css("height",yEnd + "px");
                }
                if(event.offsetX > Sensors_Core_MouseDragSelectionOrigin.xPos){
                    xStart = Sensors_Core_MouseDragSelectionOrigin.xPos;
                    xEnd = event.offsetX - Sensors_Core_MouseDragSelectionOrigin.xPos;
                    $("#sensors-core-sensorsArrayMouseDragSelectBox").css("width",xEnd + "px");
                }
                if(event.offsetX < Sensors_Core_MouseDragSelectionOrigin.xPos){
                    xStart = event.offsetX;
                    xEnd = Sensors_Core_MouseDragSelectionOrigin.xPos - event.offsetX;
                    $("#sensors-core-sensorsArrayMouseDragSelectBox").css("left",xStart + "px");
                    $("#sensors-core-sensorsArrayMouseDragSelectBox").css("width",xEnd + "px");
                }
                if(event.offsetY < Sensors_Core_MouseDragSelectionOrigin.yPos){
                    yStart = event.offsetY;
                    yEnd = Sensors_Core_MouseDragSelectionOrigin.yPos - event.offsetY;
                    $("#sensors-core-sensorsArrayMouseDragSelectBox").css("top",yStart + "px");
                    $("#sensors-core-sensorsArrayMouseDragSelectBox").css("height",yEnd + "px");
                }
                Sensors_Core_MouseDragSelectionFinalPosition.xStart = $("#sensors-core-sensorsArrayMouseDragSelectBox").position().left;
                Sensors_Core_MouseDragSelectionFinalPosition.xEnd = $("#sensors-core-sensorsArrayMouseDragSelectBox").position().left + $("#sensors-core-sensorsArrayMouseDragSelectBox").width();
                Sensors_Core_MouseDragSelectionFinalPosition.yStart = $("#sensors-core-sensorsArrayMouseDragSelectBox").position().top;

                Sensors_Core_MouseDragSelectionFinalPosition.yEnd = $("#sensors-core-sensorsArrayMouseDragSelectBox").position().top + $("#sensors-core-sensorsArrayMouseDragSelectBox").height();
                Sensors_Core_MouseDragSelectionSelectedContacts = [];
                var widthOfSensorsArray = $("#sensors-core-sensorsArrayCanvas").width();
                var heightOfSensorsArray = $("#sensors-core-sensorsArrayCanvas").height();
                for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
                    var isInXSelection = false;
                    var isInYSelection = false;

                    var wantedXPos = widthOfSensorsArray * (Sensors_Core_Sensors_Contacts[i].wantedXPos / 100);
                    var wantedYPos = heightOfSensorsArray - (heightOfSensorsArray * (Sensors_Core_Sensors_Contacts[i].wantedYPos / 100));
                    var widthOfContact = widthOfSensorsArray * (Sensors_Core_Sensors_ContactAttributes[i].width / 100);
                    var heightOfContact = heightOfSensorsArray * (Sensors_Core_Sensors_ContactAttributes[i].height / 100);

                    if(wantedXPos > Sensors_Core_MouseDragSelectionFinalPosition.xStart && wantedXPos < Sensors_Core_MouseDragSelectionFinalPosition.xEnd){
                        isInXSelection = true;
                    }else if(wantedXPos + widthOfContact > Sensors_Core_MouseDragSelectionFinalPosition.xStart && wantedXPos + widthOfContact < Sensors_Core_MouseDragSelectionFinalPosition.xEnd){
                        isInXSelection = true;
                    }
                    if(wantedYPos > Sensors_Core_MouseDragSelectionFinalPosition.yStart && wantedYPos < Sensors_Core_MouseDragSelectionFinalPosition.yEnd){
                        isInYSelection = true;
                    }else if(wantedYPos + heightOfContact < Sensors_Core_MouseDragSelectionFinalPosition.yEnd && wantedYPos + heightOfContact > Sensors_Core_MouseDragSelectionFinalPosition.yStart){
                        isInYSelection = true;
                    }
                    if(isInXSelection && isInYSelection && (Sensors_Core_Sensors_ContactAttributes[i].contactType == "contact" || Sensors_Core_Sensors_ContactAttributes[i].contactType == "asteroid")){
                        Sensors_Core_MouseDragSelectionSelectedContacts.splice(Sensors_Core_MouseDragSelectionSelectedContacts.length,0,{"contactID" : Sensors_Core_Sensors_Contacts[i].contactID,"index" : i});
                    }

                }
            });
    $(".sensors-core-sensorsArrayMouseSelectionDraggingMouseCatcher").mouseup(function(event){
        $("#sensors-core-sensorsArrayMouseDragSelectBox").remove();
        $(".sensors-core-sensorsArrayMouseSelectionDraggingMouseCatcher").off();
        $(".sensors-core-sensorsArrayMouseSelectionDraggingMouseCatcher").remove();
    });
    }
    });

    $("#sensors-core-sensorsArray").mouseup(function(event){
        if(Sensors_core_isSelectingMoveSpeed){
            return;
        }
        if(Sensors_Core_CurrentDragTarget == undefined){
            Sensors_Core_CurrentDragTargetIsDragging = false;
            Sensors_Core_CurrentDragTargetIsDraggingListItem = false;
            return;
        }
        if(Sensors_Core_CurrentDragTargetIsDraggingListItem){
            var attributes = sensors_array_getContactAttributesByContactID(Sensors_Core_CurrentDragTarget.replace("_LIST_VIEW",""));
            var contactInformation = sensors_array_getContactByContactID(Sensors_Core_CurrentDragTarget.replace("_LIST_VIEW",""));
            Sensors_Core_CurrentDragTargetIsDraggingListItem = false;
            attributes.contactIsActive = true;
            var newX = Sensors_Core_CurrentDragTargetPosition.x;
            var newY = 100 - Sensors_Core_CurrentDragTargetPosition.y;
            contactInformation.xPos = newX;
            contactInformation.yPos = newY;
            contactInformation.wantedXPos = newX;
            contactInformation.wantedYPos = newY;
            Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
            Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : Sensors_Core_CurrentDragTarget.replace("_LIST_VIEW",""), "lastChangedValue" : "contactIsActive"});
            Sensors_Core_CurrentDragTarget = undefined;
        }else{
            var speedToMoveContact = Sensors_Core_ContactMoveSpeed
            if(Sensors_Core_AskForSpeed){
                Sensors_core_isSelectingMoveSpeed = true;
                $("#Sensors-Core-SpeedSelectionDropdown").css("top",event.offsetY);
                $("#Sensors-Core-SpeedSelectionDropdown").css("left",event.offsetX);
                $("#Sensors-Core-SpeedSelectionDropdown").slideDown();
                $(".Sensors-Core-SpeedSelectionDropdownItem").off();
                $(".Sensors-Core-SpeedSelectionDropdownItem").click(function(event){
                    sensors_array_core_moveDraggedTarget(Sensors_Array_getSpeedForValue($(event.target).html()));
                    $("#Sensors-Core-SpeedSelectionDropdown").slideUp("fast",function(){
                        Sensors_core_isSelectingMoveSpeed = false;
                    });
                });
            }else{
                sensors_array_core_moveDraggedTarget(speedToMoveContact);
            }
        }
    });

    function sensors_array_core_moveDraggedTarget(speedToMoveContact){
        var dragSelectionPosX;
        var dragSelectionPosY;
        var newX = Sensors_Core_CurrentDragTargetPosition.x;
        var newY = 100 - Sensors_Core_CurrentDragTargetPosition.y;
        for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
            if(Sensors_Core_Sensors_Contacts[i].contactID == Sensors_Core_CurrentDragTarget){
                dragSelectionPosX = Sensors_Core_Sensors_Contacts[i].wantedXPos;
                dragSelectionPosY = Sensors_Core_Sensors_Contacts[i].wantedYPos;
            }
        }
        for(var i = 0;i < Sensors_Core_MouseDragSelectionSelectedContacts.length;i++){
            for(var j = 0;j < Sensors_Core_Sensors_Contacts.length;j++){
                if(Sensors_Core_Sensors_Contacts[j].contactID == Sensors_Core_MouseDragSelectionSelectedContacts[i].contactID){
                    //find it's xOffset
                    var xOffset = dragSelectionPosX - Sensors_Core_Sensors_Contacts[j].wantedXPos;
                    //find it's yOffset
                    var yOffset = dragSelectionPosY - Sensors_Core_Sensors_Contacts[j].wantedYPos;
                    Sensors_Core_Sensors_Contacts[j].wantedXPos = newX - xOffset;
                    Sensors_Core_Sensors_Contacts[j].wantedYPos = newY - yOffset;
                    Sensors_Core_Sensors_ContactAttributes[j].xStep = 0;
                    Sensors_Core_Sensors_ContactAttributes[j].yStep = 0;
                    Sensors_Core_Sensors_ContactAttributes[j].animationSpeed = speedToMoveContact;
                }
            }
        }

        for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
            if(Sensors_Core_Sensors_Contacts[i].contactID == Sensors_Core_CurrentDragTarget){
                dragSelectionPosX = Sensors_Core_Sensors_Contacts[i].wantedXPos;
                dragSelectionPosY = Sensors_Core_Sensors_Contacts[i].wantedYPos;
                Sensors_Core_Sensors_Contacts[i].wantedXPos = newX;
                Sensors_Core_Sensors_Contacts[i].wantedYPos = newY;
                Sensors_Core_Sensors_ContactAttributes[i].xStep = 0;
                Sensors_Core_Sensors_ContactAttributes[i].yStep = 0;
                Sensors_Core_Sensors_ContactAttributes[i].animationSpeed = speedToMoveContact;
            }
        }
        Sensors_Core_CurrentDragTargetIsDragging = false;
        Sensors_Core_CurrentDragTarget = undefined;
        Sensors_Core_MouseDragSelectionSelectedContacts = [];
        Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : "multiple"});
    }

    function init() {
        $("#Sensors-Core-SensorsArraySpeedControlAskForSpeedCheckbox").prop("checked", Sensors_Core_Presets.defaultAskForSpeed);
        $("#Sensors-Core-SensorsArraySpeedControlMenu").val(Sensors_Core_Presets.defaultSpeed);
        sensors_array_sensorsArrayContainer = document.createElement( 'div' );
        var dropdownSelectElement = $("#Sensors-Core-SpeedSelectionDropdown");
        $("#sensors-core-sensorsArray").html( sensors_array_sensorsArrayContainer );
        $("#sensors-core-sensorsArray").append(dropdownSelectElement);
        var width = $("#sensors-core-sensorsArray").width();
        var height = $("#sensors-core-sensorsArray").width();
        var near = 1;
        var far = 1000;
        var frustumSize = 100;
        var aspect = width / height;
        if(Sensors_Core_Presets.cameraType == 0){
            sensors_array_sensorsArrayCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
        }else{
            sensors_array_sensorsArrayCamera = new THREE.PerspectiveCamera( 45, width / height, near, far );
        }
        sensors_array_sensorsArrayCamera.position.set(50,50,100);
        sensors_array_sensorsArrayScene = new THREE.Scene();

        sensors_array_sensorsArrayRenderer = new THREE.WebGLRenderer({ alpha: true });
        sensors_array_sensorsArrayRenderer.setClearColor( 0xffffff, 0);
        sensors_array_sensorsArrayRenderer.setPixelRatio( window.devicePixelRatio );
        sensors_array_sensorsArrayRenderer.setSize( $("#sensors-core-sensorsArray").width(), $("#sensors-core-sensorsArray").height() );
        sensors_array_sensorsArrayContainer.appendChild( sensors_array_sensorsArrayRenderer.domElement );
        Sensors_Array_Core_drawSensorsArray();
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
        //stats.update();
    }
    function render() {
        var contactsToDrawListElementFor = -1;
        for(var i = 0;i < sensors_array_sensorsArrayScene.children.length;i++){
            var threeJSObject = sensors_array_sensorsArrayScene.children[i];
            var sensorsContactObject = sensors_array_getContactByContactID(threeJSObject.name);
            var isGhost = false;
            var isLine = false;
            var isListView = false;
            var isEffect = false;
            if(threeJSObject.name.includes("_GHOST")){
                //ghost
                isGhost = true
                var name = threeJSObject.name;
                name = name.replace("_GHOST","");
                sensorsContactObject = sensors_array_getContactByContactID(name);
            }
            if(threeJSObject.name.includes("_LINE")){
                //line
                isLine = true
            }
            if(threeJSObject.name.includes("_LIST_VIEW")){
                isListView = true;
            }
            if(threeJSObject.name.includes("_EFFECT")){
                isEffect = true;
            }
            if(sensorsContactObject == undefined && !isLine && !isListView && !isEffect){
                //this contact has been deleted
                sensors_array_sensorsArrayScene.remove(threeJSObject);
                var listViewItem = sensors_array_getContactByContactID(threeJSObject.name + "_LIST_VIEW");
                if(listViewItem != undefined){
                    sensors_array_sensorsArrayScene.remove(listViewItem);
                }
            }
            if(isListView){

                if(sensors_array_getContactByContactID(threeJSObject.name.replace("_LIST_VIEW","")) == undefined){
                    sensors_array_sensorsArrayScene.remove(threeJSObject);
                    continue;
                }
                var index = -1;
                var j = 0;
                for(j = 0;j < Sensors_Core_Sensors_Contacts.length;j++){
                    if(Sensors_Core_Sensors_Contacts[j].contactID == threeJSObject.name.replace("_LIST_VIEW","")){
                        //index = j;
                        //if(contactAttributes.contactType == "contact"){
                            contactsToDrawListElementFor++;
                        //}
                        threeJSObject.position.set(95,(97 - (contactsToDrawListElementFor * 5)) + Sensors_Core_ContactListScrollPosition,90);
                    }
                }
            }
            var sensorsContactObjectAttributes = sensors_array_getContactAttributesByContactID(threeJSObject.name);
            if(Sensors_Core_CurrentDragTargetIsDraggingListItem && Sensors_Core_CurrentDragTarget == threeJSObject.name){
                threeJSObject.position.x = Sensors_Core_CurrentDragTargetPosition.x;
                threeJSObject.position.y = 100 - Sensors_Core_CurrentDragTargetPosition.y;
            }
            if(sensorsContactObject != undefined){
                var wantedX = sensorsContactObject.wantedXPos;
                var wantedY = sensorsContactObject.wantedYPos;
                var xPos = sensorsContactObject.xPos;
                var yPos = sensorsContactObject.yPos;
                var dragTargetObject = sensors_array_getContactByContactID(Sensors_Core_CurrentDragTarget);
                if(isGhost){
                    threeJSObject.position.x = xPos;
                    threeJSObject.position.y = yPos;
                }else{
                    /*
                    if(threeJSObject.position.y < -4){
                        for(var i = 0; i < Sensors_Core_Sensors_Contacts.length;i++){
                            if(threeJSObject.name == Sensors_Core_Sensors_Contacts[i].contactID){
                                //we can delete this contact, for the sake of speed
                                //Sensors_Core_Sensors_Contacts.splice(i,1);
                                //Sensors_Core_Sensors_ContactAttributes.splice(i,1);
                            }
                        }
                    }else{*/
                        threeJSObject.position.x = wantedX;
                        threeJSObject.position.y = wantedY;
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
                            var ghostObject = sensors_array_sensorsArrayScene.getObjectByName(sensorsContactObjectAttributes.contactID + "_GHOST");
                            ghostObject.rotation.z = threeJSObject.rotation.z;
                        }
                    //}
                }
                if(Sensors_Core_CurrentDragTargetIsDragging && !isGhost){
                    if(sensorsContactObject == dragTargetObject){
                        threeJSObject.position.x = Sensors_Core_CurrentDragTargetPosition.x;
                        threeJSObject.position.y = 100 - Sensors_Core_CurrentDragTargetPosition.y;
                    }else{
                        for(var j = 0;j < Sensors_Core_MouseDragSelectionSelectedContacts.length;j++){
                            if(sensorsContactObject.contactID == Sensors_Core_MouseDragSelectionSelectedContacts[j].contactID){
                                //drag this object
                                //find it's xOffset
                                console.log(Sensors_Core_CurrentDragTarget);
                                var xOffset = sensors_array_getContactByContactID(Sensors_Core_CurrentDragTarget).wantedXPos - sensorsContactObject.wantedXPos;
                                //find it's yOffset
                                var yOffset = sensors_array_getContactByContactID(Sensors_Core_CurrentDragTarget).wantedYPos - sensorsContactObject.wantedYPos;
                                threeJSObject.position.x = Sensors_Core_CurrentDragTargetPosition.x - xOffset;
                                threeJSObject.position.y = (100 - Sensors_Core_CurrentDragTargetPosition.y) - yOffset;
                            }
                        }
                    }
                }
            }
        }
        sensors_array_sensorsArrayCamera.lookAt(0,0,0);
        //Colors and whatnot
        for(var i = 0;i < sensors_array_sensorsArrayScene.children.length;i++){
            threeJSObject = sensors_array_sensorsArrayScene.children[i];
            var nameOfObject = threeJSObject.name;
            nameOfObject = nameOfObject.replace("_GHOST","");
            nameOfObject = nameOfObject.replace("_LINE","");
            nameOfObject = nameOfObject.replace("_LIST_VIEW","");
            var objectAttributes = sensors_array_getContactAttributesByContactID(nameOfObject);
            if(objectAttributes != undefined && objectAttributes.contactType != "nebula"){
                var normalColor = true;
                for(var j = 0;j < Sensors_Core_MouseDragSelectionSelectedContacts.length;j++){
                    if(threeJSObject.name == Sensors_Core_MouseDragSelectionSelectedContacts[j].contactID){
                        normalColor = false;
                        sensors_array_sensorsArrayScene.children[i].material.color.set( 0x00ff00);
                    }
                }
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
    $("#sensors-core-RemoveContactButton").click(function(event){
        Sensors_Core_deleteContactMode = !Sensors_Core_deleteContactMode;
        if(Sensors_Core_deleteContactMode){
            Sensors_Core_copyContactMode = false;
            Sensors_Core_removeAllButtonAnimations();
            $("#sensors-core-RemoveContactButton").css("box-shadow","0 0 20px red");
            $("#sensors-core-RemoveContactButton").css("z-index","5");
            $("#sensors-core-RemoveContactButton").css("animation","sensors-core-pulseButton 1s infinite");

        }else{
            $("#sensors-core-RemoveContactButton").css("box-shadow","0 0 0px red");
            $("#sensors-core-RemoveContactButton").css("z-index","1");
            $("#sensors-core-RemoveContactButton").css("animation","");
        }
        Sensors_Array_Core_drawContactsList();
    });
    $("#sensors-core-createNewContactButton").click(function(event){

        Sensors_Array_Core_addNewContactToDatabase(Sensors_Core_Presets.defaultContactName,0,0,Sensors_Core_Presets.defaultContactIcon,"",Sensors_Core_Presets.defaultContactSize,Sensors_Core_Presets.defaultContactSize,{"isVisible" : Sensors_Core_Presets.defaultContactNormal,"isSpinning" : false,"IR" : Sensors_Core_Presets.defaultContactInfrared,"radiation" : 0,"gravity" : .1,"magnetism" : 0,"other" : []});
        setTimeout(function(){ 
            $("#sensors-core-ContactEditor-NameTextbox").select();
        },0100);
    });
    $("#Sensors-Core-SensorsArraySpeedControlAskForSpeedCheckbox").on("change",function(event){
        Sensors_Core_AskForSpeed = $(this).is(":checked");
    });
    $("#Sensors-Core-SensorsArraySpeedControlMenu").on("change",function(event){
        Sensors_Core_ContactMoveSpeed = Sensors_Array_getSpeedForValue(event.target.value);
    });
    function Sensors_Array_getSpeedForValue(value){
        switch(value.toString().toLowerCase()){
            case "very slow":
            return 1600;
            break;
            case "slow":
            return 800;
            break;
            case "moderate":
            return 400;
            break;
            case "fast":
            return 200;
            break;
            case "very fast":
            return 100;
            break;
            case "warp":
            return 50;
            break;
            case "instantly":
            return 1;
            break;
            default:
            return Sensors_Core_ContactMoveSpeed;
            break;
        }
    }
    function Sensors_Array_createBorder(width,name){
        var contactID = guidGenerator();
        //create the new contact Attributes
        var newContactAttributes = 
        {
            "contactType" : "border", //used to differentiate between contacts and programs
            "contactIsActive" : true,
            "xStep" : 0, //calcuated before animations start to ensure a linear line with animations
            "yStep" : 0, //calcuated before animations start to ensure a linear line with animations
            "width" : 160, //width, the width of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
            "height" : width, //height, the height of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
            "name" : name, //name, the name of the icon (example, USS WASHINGTON)
            "icon" : "rgba(255,128,30,.7)", //icon, the icon of the contact, this is the picture that shows up on the array.  MUST BE ON ICONS.JSON!!
            "image" : "", //image, the image of the contact, this is the picture that shows up when they click the contact.  MUST BE ON IMAGES.JSON!!
            "attributes" : {"isVisible" : true, "isSpinning" : false}, //this object contains information like "isVisible" and "isInfared"
            "animationSpeed" : 100, //this controls how fast the object moves from it's position to it's wanted position
            "contactID" : contactID //this is a unique id that helps to seperate contacts
        }
        //then it's position data
        var newContact = 
        {
            "xPos" : -30, //xPos, the xPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact xPos can be beyond 0 or 100) 
            "yPos" : 120, //yPos, the yPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact yPos can be beyond 0 or 100)
            "wantedXPos" : -30, //this has to do with animations
            "wantedYPos" : 120, //this has to do with animations
            "contactID" : contactID
        }
        //insert it into the Sensors_Core_Sensors_Contacts array
        Sensors_Core_Sensors_Contacts.splice(Sensors_Core_Sensors_Contacts.length,0,newContact);
        Sensors_Core_Sensors_ContactAttributes.splice(Sensors_Core_Sensors_ContactAttributes.length,0,newContactAttributes);
        //update the database
        Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : contactID});
    }

    $("#Sensors-Core-ProgramsTabButton").click(function(){
        $("#Sensors-Core-ProgramsTab").stop();
        $("#Sensors-Core-ProgramsTab").slideToggle("fast");
    });

    $(".sensors-coreProgramButton").click(function(event){
        $("#Sensors-Core-ProgramsTab").stop();
        $("#Sensors-Core-ProgramsTab").slideUp("fast");
        var programType = $(event.target).attr("programType");
        switch(programType){
            case "planet":
            getFileNamesInFolder("/public/Planets","sensors-core",function(files){
                openCoreWindow("Sensor-Core-PlanetEditorWindow",event);
                icons = files;
                $("#Sensor-Core-PlanetEditorWindowTitle").html("Select a planet")
                var widthOfPictures = $("#Sensor-Core-PlanetEditorWindowIcons").width() / 10;
                var column = 0;
                var row = 0;
                $("#Sensor-Core-PlanetEditorWindowIcons").html("");
                for(var i = 0;i < icons.length;i++){
                    if(column == 8){
                        row++;
                        column = 0;
                    }
                    var html = "<div icon='" + i + "' ";
                    html += "class='Sensor-Core-IconEditorIcons'";
                    html += "id='Sensor-Core-PlanetEditorIcon" + i + "' "
                    html += "style='";
                    html += "top: " + (row * (widthOfPictures + 10)) + "px;";
                    html += "left: " + (((widthOfPictures + 10) * column) + 10) + "px;";
                    html += "width: " + widthOfPictures + "px;";
                    html += "height: " + widthOfPictures + "px;";
                    html += "'>";
                    html += "</div>";
                    column++;
                    $("#Sensor-Core-PlanetEditorWindowIcons").append(html);
                    $("#Sensor-Core-PlanetEditorIcon" + i).css("backgroundImage","url('/resource?path=public/Planets/" + icons[i] + "&screen=sensors-core')");
                }
                //remove event listeners, in case any were made in the past
                $(".Sensor-Core-IconEditorIcons").off();
                $(".Sensor-Core-IconEditorIcons").click(function(event){
                    var iconIndex = $(event.target).attr("icon");
                    Sensors_Core_SelectedPlanetIcon = icons[iconIndex];
                });
                $("#Sensors-Core-PlanetEditorCreatePlanetButton").off();
                $("#Sensors-Core-PlanetEditorCreatePlanetButton").on("click",function(event){
                    var name = $("#Sensors-Core-PlanetEditionNameTextbox").val();
                    var size = $("#Sensors-Core-PlanetEditionSizeRange").val();
                    closeCoreWindow("Sensor-Core-PlanetEditorWindow",event);
                    Sensors_Core_createPlanet(size,name,Sensors_Core_SelectedPlanetIcon,"");
                });
            });
            break;
            case "nebula":
            Sensors_Core_createNebula(18000,15);
            break;
            case "asteroid":
            Sensors_Array_generateAsteroidField(10000,15);
            break;
            case "border":
            Sensors_Array_createBorder(5,"BORDER");
            break;
        }
    });
    function Sensors_Array_endProgram(programID){
        for(var i = 0;i < Sensors_Core_SensorPrograms.length;i++){
            if(Sensors_Core_SensorPrograms[i].programID == programID){
                switch(Sensors_Core_SensorPrograms[i].programType){
                    case "asteroid field":
                    console.log("Ending Asteroid Program")
                    clearInterval(Sensors_Core_SensorPrograms[i].interval);
                    Sensors_Core_SensorPrograms.splice(i,1);
                    Sensors_Array_Core_drawContactsList();
                    break;
                    case "nebula":
                    console.log("Ending Nebula Program")
                    clearInterval(Sensors_Core_SensorPrograms[i].interval);
                    Sensors_Core_SensorPrograms.splice(i,1);
                    Sensors_Array_Core_drawContactsList();
                    break;
                    default:
                    console.log("Unknown program type!  Cannot end!")
                    break;
                }
            }
        }
    }

    function Sensors_Array_generateAsteroidField(densityFactor,asteroidsToSpawnAtATime){
        var programID = guidGenerator();
        var programIntervalInformation = 
        {
            "programType" : "asteroid field",
            "programID" : programID,
            "interval" : setInterval(function(){
                var asteroidContacts = [];
                var asteroidContactAttributes = [];
                for(i = 0;i < asteroidsToSpawnAtATime;i++){
                    var randomWidth = (Math.random() * 3) + 1;
                    var randomHeight = randomWidth;
                    var randomAsteroid = "asteroid" + (Math.floor(Math.random() * 10) + 1) + ".png";
                    var xPos = (Math.random() * 100) + 0;
                    var yPos = 100 + (Math.random() * 100);
                    var contactID = guidGenerator();
                    var newContactAttributes =
                    {
                        "contactType" : "asteroid", //this is an asteroid, so don't list it with normal contacts
                        "contactIsActive" : true,
                        "xStep" : 0, //calcuated before animations start to ensure a linear line with animations
                        "yStep" : 0, //calcuated before animations start to ensure a linear line with animations
                        "width" : randomWidth, //width, the width of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
                        "height" : randomHeight, //height, the height of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
                        "name" : "ASTEROID", //name, the name of the icon (example, USS WASHINGTON)
                        "icon" : randomAsteroid, //icon, the icon of the contact, this is the picture that shows up on the array.  MUST BE ON ICONS.JSON!!
                        "image" : "", //image, the image of the contact, this is the picture that shows up when they click the contact.  MUST BE ON IMAGES.JSON!!
                        "attributes" : {"isVisible" : true, "isSpinning" : true}, //this object contains information like "isVisible" and "isInfared"
                        "animationSpeed" : 100, //this controls how fast the object moves from it's position to it's wanted position
                        "contactID" : contactID //this is a unique id that helps to seperate contacts
                    }
                    var newContact = 
                    {
                        "xPos" : xPos, //xPos, the xPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact xPos can be beyond 0 or 100) 
                        "yPos" : yPos, //yPos, the yPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact yPos can be beyond 0 or 100)
                        "wantedXPos" : xPos, //this has to do with animations
                        "wantedYPos" : yPos, //this has to do with animations
                        "rotation" : 0, //rotation of the object
                        "contactID" : contactID //this is a unique id that helps to seperate contacts
                    }
                    //insert it into the Sensors_Core_Sensors_Contacts array
                    asteroidContacts.splice(Sensors_Core_Sensors_Contacts.length,0,newContact);
                    asteroidContactAttributes.splice(Sensors_Core_Sensors_ContactAttributes.length,0,newContactAttributes);
                }
                Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts.concat(asteroidContacts));
                Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes.concat(asteroidContactAttributes), "contactLastEdited" : "multiple"});
            },densityFactor)
        }
        Sensors_Core_SensorPrograms.splice(Sensors_Core_SensorPrograms.length,0,programIntervalInformation);
        Sensors_Array_Core_drawContactsList();
        return programID;
    }

    function Sensors_Array_RemoveContact(contactID){
        for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
            if(Sensors_Core_Sensors_Contacts[i].contactID == contactID){
                Sensors_Core_Sensors_Contacts.splice(i,1);
            }
        }
        for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
            if(Sensors_Core_Sensors_ContactAttributes[i].contactID == contactID){
                Sensors_Core_Sensors_ContactAttributes.splice(i,1);
            }
        }
    }

    function Sensors_Array_DegreesToRadians(degrees){
        return degrees * (Math.PI / 180);
    }

    function Sensors_Array_RadiansToDegrees(radians){
        return radians * (180 / Math.PI);
    }

    function Senors_Array_GenerateRandomHEXColor(){
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    }

        //this function DOES NOT update the database!!
        //this function DOES NOT update the database!!
        //this function DOES NOT update the database!!
        function Sensors_Array_moveAllContacts(angle,amount){
        //we want 0 degrees to be straight up,
        //we can acomplish this by subtracting 90 degrees
        //(but we use radians, so it's 1.5708)
        angle -= 1.5708;
        var widthOfSensorsArray = $("#sensors-core-sensorsArrayCanvas").width();
        var heightOfSensorsArray = $("#sensors-core-sensorsArrayCanvas").height();

        //check if there are sensors contacts
        if(Sensors_Core_Sensors_Contacts == undefined || Sensors_Core_Sensors_Contacts.length <= 0){
            //if there are no contacts, end this function
            return;
        }
        if(Sensors_Core_MoveAllContactsDistanceToMove == 0){
            return;
        }
        // convert their cartesian cords to polar cords
        var polarCord = cartesian2Polar(0,0);
        // adjust yaw (theta)
        polarCord.radians += angle;
        polarCord.distance += amount;
        // Convert polar to cartesian
        var cartX = polarCord.distance * Math.cos(polarCord.radians);
        var cartY = polarCord.distance * Math.sin(polarCord.radians);

        for(var i = 0;i < Sensors_Core_Sensors_Contacts.length; i++){
            if((Sensors_Core_Sensors_Contacts[i] != sensors_array_getContactByContactID(Sensors_Core_CurrentDragTarget)) && sensors_array_getContactAttributesByContactID(Sensors_Core_Sensors_Contacts[i].contactID).contactIsActive){
                // convert their cartesian cords to polar cords
                Sensors_Core_Sensors_Contacts[i].wantedXPos += cartX;
                Sensors_Core_Sensors_Contacts[i].wantedYPos -= cartY;
                Sensors_Core_Sensors_Contacts[i].xPos += cartX;
                Sensors_Core_Sensors_Contacts[i].yPos -= cartY;
            }
        }
        //this function DOES NOT update the database!!
    }
    $(".sensors-coreArrowKey").on("click",function(event){
        var key = $(event.target).attr("key");
        var xDirection = 0;
        var yDirection = 0;
        switch(key){
            case "up":
            yDirection = 5;
            break;
            case "down":
            yDirection = -5;
            break;
            case "right":
            xDirection = 5;
            break;
            case "left":
            xDirection = -5;
            break;
            case "upLeft":
            yDirection = 5;
            xDirection = -5;
            break;
            case "downLeft":
            yDirection = -5;
            xDirection = -5;
            break;
            case "upRight":
            yDirection = 5;
            xDirection = 5;
            break;
            case "downRight":
            yDirection = -5;
            xDirection = 5;
            break;
            case "stop":
            for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
                Sensors_Core_Sensors_Contacts[i].wantedXPos = Sensors_Core_Sensors_Contacts[i].xPos;
                Sensors_Core_Sensors_Contacts[i].wantedYPos = Sensors_Core_Sensors_Contacts[i].yPos;
                Sensors_Core_Sensors_ContactAttributes[i].xStep = 0;
                Sensors_Core_Sensors_ContactAttributes[i].yStep = 0;
            }
            return;
            break;
        }
        for(var i = 0;i < Sensors_Core_Sensors_Contacts.length;i++){
            Sensors_Core_Sensors_Contacts[i].wantedXPos += xDirection;
            Sensors_Core_Sensors_Contacts[i].wantedYPos += yDirection;
            Sensors_Core_Sensors_ContactAttributes[i].xStep = 0;
            Sensors_Core_Sensors_ContactAttributes[i].yStep = 0;
        }
        Sensors_Array_Update_Animations_Interval();
    })
    $("#sensors-coreYawAmountSlider").on("input",function(event){
        Sensors_Core_YawAdjust = -Number(event.target.value) / 40.0;
        Sensors_Array_Update_Animations_Interval();
    });
    $("#sensors-coreYawAmountSlider").on("change",function(event){
        if(Sensors_Core_Presets.snapYaw){
            event.target.value = 0;
            Sensors_Core_YawAdjust = 0;
        }
    });
    $("#sensors-coreYawAmountSlider").dblclick("change",function(event){
        event.target.value = 0;
        Sensors_Core_YawAdjust = 0;
    });
    $("#sensors-coreMoveAllDirectionsDirectionAmountSlider").dblclick(function(event){
        event.target.value = 0;
        Sensors_Core_MoveAllContactsDistanceToMove = 0;
    });
    $("#sensors-coreMoveAllDirectionCanvas").dblclick(function(event){
        Sensors_Core_MoveAllContactsAngleInRadians = 3.14159;
        drawSensorsGui();
    })
    $("#sensors-coreMoveAllDirectionsDirectionAmountSlider").on("input",function(event){
        Sensors_Core_MoveAllContactsDistanceToMove = Number(event.target.value);
        Sensors_Array_Update_Animations_Interval();
    });
    $("#sensors-core-ContactEditorChangeIconButton").click(function(event){
        getFileNamesInFolder("/public/Contacts","sensors-core",function(files){
            icons = files;
            $("#Sensor-Core-ImageEditorWindowTitle").html("Select a new icon for \"" + Sensors_Core_ContactEditorCurrentContact.name + "\"")
            openCoreWindow("Sensor-Core-IconEditorWindow",event);
            var widthOfPictures = $("#Sensor-Core-ImageEditorWindowIcons").width() / 10;
            var column = 0;
            var row = 0;
            $("#Sensor-Core-ImageEditorWindowIcons").html("");
            for(var i = 0;i < icons.length;i++){
                if(column == 8){
                    row++;
                    column = 0;
                }
                var html = "<div icon='" + i + "' ";
                html += "class='Sensor-Core-IconEditorIcons'";
                html += "id='Sensor-Core-IconEditorIcon" + i + "' "
                html += "style='";
                html += "top: " + (row * (widthOfPictures + 10)) + "px;";
                html += "left: " + (((widthOfPictures + 10) * column) + 10) + "px;";
                html += "width: " + widthOfPictures + "px;";
                html += "height: " + widthOfPictures + "px;";
                html += "'>";
                html += "</div>";
                column++;
                $("#Sensor-Core-ImageEditorWindowIcons").append(html);
                $("#Sensor-Core-IconEditorIcon" + i).css("backgroundImage","url('/resource?path=public/Contacts/" + icons[i] + "&screen=sensors-core')");
            }
            //remove event listeners, in case any were made in the past
            $(".Sensor-Core-IconEditorIcons").off();
            $(".Sensor-Core-IconEditorIcons").click(function(event){
                var iconIndex = $(event.target).attr("icon");
                closeCoreWindow("Sensor-Core-IconEditorWindow",event);
                for(var i = 0;i < Sensors_Core_Sensors_ContactAttributes.length;i++){
                    if(Sensors_Core_Sensors_ContactAttributes[i].contactID == Sensors_Core_ContactEditorCurrentContact.contactID){
                        Sensors_Core_Sensors_ContactAttributes[i].icon = icons[iconIndex];
                        $("#sensors-core-ContactEditor-EditIconImage").attr("src","/resource?path=public/Contacts/" + icons[iconIndex] + "&screen=sensors-core");
                        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : Sensors_Core_Sensors_ContactAttributes[i].contactID, "lastChangedValue" : "icon"}); 
                        return;
                    }
                }
            });
        });
    });
    $("#Sensors-Core-PlanetEditionRotationRange").on("input",function(event){
        $("#Sensors-Core-PlanetEditionRotationTextbox").val(Math.round(event.target.value));
    });
    $("#Sensors-Core-PlanetEditionSizeRange").on("input",function(event){
        $("#Sensors-Core-PlanetEditionSizeTextbox").val(Math.round(event.target.value) + "%");
    });
    $("#Sensors-Core-PlanetEditorCancelButton").on("click",function(event){
        closeCoreWindow("Sensor-Core-PlanetEditorWindow",event);
    });
    function Sensors_Core_createPlanet(size,name,icon,image){
        var contactID = guidGenerator();
        var newContactAttributes =
        {
            "contactType" : "planet", //this is an nebula, so don't list it with normal contacts
            "contactIsActive" : true,
            "xStep" : 0, //calcuated before animations start to ensure a linear line with animations
            "yStep" : 0, //calcuated before animations start to ensure a linear line with animations
            "width" : size, //width, the width of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
            "height" : size, //height, the height of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
            "name" : name, //name, the name of the icon (example, USS WASHINGTON)
            "icon" : icon, //icon, the icon of the contact, this is the picture that shows up on the array.  MUST BE ON ICONS.JSON!!
            "image" : image, //image, the image of the contact, this is the picture that shows up when they click the contact.  MUST BE ON IMAGES.JSON!!
            "attributes" : {"isVisible" : true, "isSpinning" : true}, //this object contains information like "isVisible" and "isInfared"
            "animationSpeed" : 100, //this controls how fast the object moves from it's position to it's wanted position
            "contactID" : contactID //this is a unique id that helps to seperate contacts
        }
        var newContact = 
        {
            "xPos" : 50, //xPos, the xPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact xPos can be beyond 0 or 100) 
            "yPos" : 100 + Number(size * 1.25), //yPos, the yPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact yPos can be beyond 0 or 100)
            "wantedXPos" : 50, //this has to do with animations
            "wantedYPos" : 100 + Number(size * 1.25), //this has to do with animations
            "contactID" : contactID //this is a unique id that helps to seperate contacts
        }
        Sensors_Core_Sensors_ContactAttributes.splice(Sensors_Core_Sensors_ContactAttributes.length,0,newContactAttributes);
        Sensors_Core_Sensors_Contacts.splice(Sensors_Core_Sensors_Contacts.length,0,newContact);
        Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts);
        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes, "contactLastEdited" : contactID});
    }
    function Sensors_Core_InstantiateNewNebula(spawnAmount,firstSpawn){
        var nebulaContacts = [];
        var nebulaContactAttributes = [];
        for(i = 0;i < spawnAmount;i++){
            var randomWidth = (Math.random() * 40) + 20;
            var randomHeight = randomWidth;
            var xPos = (Math.random() * 130) - 30;
            var yPos = (200 + (randomHeight / 2)) + (Math.random() * 100);
            if(firstSpawn){
                yPos = 200 + (randomHeight / 2);
            }
            var contactID = guidGenerator();
            var randomDirection = 1;
            if(Math.random() > .5){
                randomDirection = -1;
            }
            var newContactAttributes =
            {
                "contactType" : "nebula", //this is an nebula, so don't list it with normal contacts
                "contactIsActive" : true,
                "spinDirection" : ((Math.random() * .5) * randomDirection) * .0025, //nebulas spin in a special way
                "xStep" : 0, //calcuated before animations start to ensure a linear line with animations
                "yStep" : 0, //calcuated before animations start to ensure a linear line with animations
                "width" : randomWidth, //width, the width of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
                "height" : randomHeight, //height, the height of the contact, this is a PERCENTAGE, and is from 0-100 NOT 0-1!!
                "name" : "NEBULA", //name, the name of the icon (example, USS WASHINGTON)
                "icon" : undefined, //icon, the icon of the contact, this is the picture that shows up on the array.  MUST BE ON ICONS.JSON!!
                "image" : undefined, //image, the image of the contact, this is the picture that shows up when they click the contact.  MUST BE ON IMAGES.JSON!!
                "attributes" : {"isVisible" : true, "isSpinning" : true}, //this object contains information like "isVisible" and "isInfared"
                "animationSpeed" : 100, //this controls how fast the object moves from it's position to it's wanted position
                "contactID" : contactID //this is a unique id that helps to seperate contacts
            }
            var newContact = 
            {
                "xPos" : xPos, //xPos, the xPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact xPos can be beyond 0 or 100) 
                "yPos" : yPos, //yPos, the yPos of the new icon, this is a PERCENTAGE, and is from 0-100 NOT 0-1!! (contact yPos can be beyond 0 or 100)
                "wantedXPos" : xPos, //this has to do with animations
                "wantedYPos" : yPos, //this has to do with animations
                "rotation" : 0, //rotation of the object
                "contactID" : contactID //this is a unique id that helps to seperate contacts
            }
            nebulaContacts.splice(nebulaContacts.length,0,newContact);
            nebulaContactAttributes.splice(nebulaContactAttributes.length,0,newContactAttributes);
        }
        Interstellar.setDatabaseValue("sensors.contacts",Sensors_Core_Sensors_Contacts.concat(nebulaContacts));
        Interstellar.setDatabaseValue("sensors.contactAttributes",{"contactAttributes" : Sensors_Core_Sensors_ContactAttributes.concat(nebulaContactAttributes), "contactLastEdited" : "multiple"});
    }
    function Sensors_Core_createNebula(densityFactor,nebulaElementsToSpawnAtATime){
        Sensors_Core_InstantiateNewNebula(nebulaElementsToSpawnAtATime,true);
        var programID = guidGenerator();
        var programIntervalInformation = 
        {
            "programType" : "nebula",
            "programID" : programID,
            "interval" : setInterval(function(){
                Sensors_Core_InstantiateNewNebula(nebulaElementsToSpawnAtATime,false)
            },densityFactor)
        }
        Sensors_Core_SensorPrograms.splice(Sensors_Core_SensorPrograms.length,0,programIntervalInformation);
        return programID;
    }

    function Sensors_Core_removeAllButtonAnimations(){
        $("#sensors-core-CopyContactButton").css("animation","");
        $("#sensors-core-CopyContactButton").css("box-shadow","0 0 0px #75d5ff");
        $("#sensors-core-CopyContactButton").css("z-index","1");
        $("#sensors-core-RemoveContactButton").css("animation","");
        $("#sensors-core-RemoveContactButton").css("box-shadow","0 0 0px red");
        $("#sensors-core-RemoveContactButton").css("z-index","1");
    }

    $("#sensors-core-CopyContactButton").on("click",function(event){
        Sensors_Core_copyContactMode = !Sensors_Core_copyContactMode;
        if(Sensors_Core_copyContactMode){
            Sensors_Core_deleteContactMode = false;
            Sensors_Core_removeAllButtonAnimations();
            $("#sensors-core-CopyContactButton").css("box-shadow","0 0 20px #75d5ff");
            $("#sensors-core-CopyContactButton").css("z-index","5");
            $("#sensors-core-CopyContactButton").css("animation","sensors-core-pulseButton 1s infinite");

        }else{
            $("#sensors-core-CopyContactButton").css("box-shadow","0 0 0px #75d5ff");
            $("#sensors-core-CopyContactButton").css("z-index","1");
            $("#sensors-core-CopyContactButton").css("animation","");
        }
        Sensors_Array_Core_drawContactsList();
    });
    $("#Sensor-core-editSettingsButton").click(function(event){
        if($("#Sensors-core-UserPrefsWindow").css("display") == "block"){
            closeCoreWindow("Sensor-core-UserPrefsWindow",event)
        }else{
        interstellarDropDownMenu("password","PLEASE ENTER THE ADMIN PASSWORD",function(enteredData){
            getAdminPassword(function(password){
                if(enteredData == password){
    //Sensors_Core_Presets
    /*
    {
        "processedDataFlash" : 1, //0, no flash, 1, just processed data box, 2, flash the entire screen
        "allowFontSizeAdjustments" : 2, //0 never, 1 with FD approval, 2 always
        "typeProcessedData" : false, //type on effect
        "processedDataSoundEffect" : undefined, //sound effect to play when there is new processed data
        "defaultContactName" : "UNKNOWN CONTACT", //what is the name of the default contact?
        "defaultContactSize" : 6, //this is a percentage.  What is the size of the default contact?
        "defaultContactImage" : undefined, //image of the default contact
        "defaultContactIcon" : "Generic.png", //icon of the default contact
        "defaultContactNormal" : true, //can we see this contact with normal sensors?
        "defaultContactInfrared" : true, //does the default contact have infrared?
        "drawGradient" : false, //do we draw the gradient on the sensors array?
        "cameraType" : 0, //0 is orthograpic, 1 is prospective
        "sensorsArrayColorType" : 0, //0 is RGBA, 1 is grayscale, 2 is sepia, 3 is inverted, 4 is inverted (BW),
        "sensorsArrayHueRotate" : 0, //360 degree hue rotation.  0deg is defualt (no change in color)
        "sensorsArrayDrawDegrees" : false, //do we draw the degree guides? (On the station)
        "sensorsArrayIsResponsiveToAlertStatus" : true, //does the alert status change our color?
        "defaultSpeed" : "Slow", //Default contact move speed
        "defaultAskForSpeed" : false, //do we ask for speed by default?
        "snapYaw" : true, //does the yaw adjust snap back to zero when we let go?
        "defaultHeading" : 180, //which direction does everything move with the move all feature?  (180 is straight down)
        "weaponsRange" : 1, //0 is disabled, 1 is 1st ring, 2 is 2nd ring, 3 is 3rd ring
        "scanType" : 0, //0 is timed, 1 is traditional
        "scanTime" : 30000, //time in miliseconds an average scan takes
        "updateInterval" : 0100, //advanced feature, this is how often the Sensors_Array_Update_Animations_Interval() function fires in miliseconds
    }
                    */
                    if(Sensors_Core_Presets.processedDataFlash == 0){
                        $("#Sensor-Core-processedDataSettings-flashSettings").val("No Flash")
                    }else if(Sensors_Core_Presets.processedDataFlash == 1){
                        $("#Sensor-Core-processedDataSettings-flashSettings").val("Flash Processed Data Box")
                    }else{
                        $("#Sensor-Core-processedDataSettings-flashSettings").val("Flash Entire Screen")
                    }
                    
                    if(Sensors_Core_Presets.allowFontSizeAdjustments == 0){
                        $("#Sensor-Core-processedDataSettings-fontSizeSettings").val("Never");
                    }else if(Sensors_Core_Presets.allowFontSizeAdjustments == 1){
                        $("#Sensor-Core-processedDataSettings-fontSizeSettings").val("With FD Approval");
                    }else{
                        $("#Sensor-Core-processedDataSettings-fontSizeSettings").val("Always");
                    }

                    if(Sensors_Core_Presets.typeProcessedData == 0){
                        $("#Sensor-Core-processedDataSettings-typeOnSettings").val("Never");
                    }else if(Sensors_Core_Presets.typeProcessedData == 1){
                        $("#Sensor-Core-processedDataSettings-typeOnSettings").val("Without HTML");
                    }else{
                        $("#Sensor-Core-processedDataSettings-typeOnSettings").val("Always");
                    }
                    if(Sensors_Core_Presets.processedDataSoundEffect == undefined){
                        $("#Sensor-Core-processedDataSettings-procssedDataSoundEffect").val("None");
                    }else{
                        $("#Sensor-Core-processedDataSettings-procssedDataSoundEffect").val(Sensors_Core_Presets.processedDataSoundEffect);
                    }

                    $("#Sensor-Core-defaultContactSettings-DefaultContactName").val(Sensors_Core_Presets.defaultContactName);

                    $("#Sensor-Core-defaultContactSettings-DefaultContactSize").val(Sensors_Core_Presets.defaultContactSize);

                    if(Sensors_Core_Presets.defaultContactImage == undefined){
                        $("#Sensor-Core-defaultContactSettings-imageDropdown").val("None");
                    }else{
                        $("#Sensor-Core-defaultContactSettings-imageDropdown").val(Sensors_Core_Presets.defaultContactImage);
                    }

                    if(Sensors_Core_Presets.defaultContactNormal){
                        $("#Sensor-Core-defaultContactSettings-NormalCheckbox").attr("checked");
                    }else{
                        $("#Sensor-Core-defaultContactSettings-NormalCheckbox").attr("");
                    }

                    if(Sensors_Core_Presets.drawGradient){
                        $("#Sensor-Core-graphicalSettings-gradientSettings").val("Always");
                    }else{
                        $("#Sensor-Core-graphicalSettings-gradientSettings").val("Never");
                    }

                    if(Sensors_Core_Presets.cameraType == 0){
                        $("#Sensor-Core-graphicalSettings-cameraSettings").val("Orthographic");
                    }else{
                        $("#Sensor-Core-graphicalSettings-cameraSettings").val("Perspective");
                    }

                    $("#Sensor-Core-defaultContactSettings-NormalCheckbox").prop('checked', Sensors_Core_Presets.defaultContactNormal);
                    $("#Sensor-Core-defaultContactSettings-IRCheckbox").prop('checked', Sensors_Core_Presets.defaultContactInfrared);

                    if(Sensors_Core_Presets.sensorsArrayColorType == 0){
                        $("#Sensor-Core-graphicalSettings-colorTypeSettings").val("RGBA");
                    }else if(Sensors_Core_Presets.sensorsArrayColorType == 1){
                        $("#Sensor-Core-graphicalSettings-colorTypeSettings").val("Sepia");
                    }else if(Sensors_Core_Presets.sensorsArrayColorType == 2){
                        $("#Sensor-Core-graphicalSettings-colorTypeSettings").val("Grayscale");
                    }else if(Sensors_Core_Presets.sensorsArrayColorType == 3){
                        $("#Sensor-Core-graphicalSettings-colorTypeSettings").val("Inverted");
                    }else{
                        $("#Sensor-Core-graphicalSettings-colorTypeSettings").val("Inverted (BW)");
                    }

                    $("#Sensor-Core-graphicalSettings-hueRotateTextbox").val(Sensors_Core_Presets.sensorsArrayHueRotate + "°");

                    if(Sensors_Core_Presets.sensorsArrayDrawDegrees){
                        $("#Sensor-Core-graphicalSettings-degreesDropdown").val("Always");
                    }else{
                        $("#Sensor-Core-graphicalSettings-degreesDropdown").val("Never");
                    }

                    if(Sensors_Core_Presets.sensorsArrayIsResponsiveToAlertStatus){
                        $("#Sensor-Core-graphicalSettings-alertStatus").val("Affects Color");
                    }else{
                        $("#Sensor-Core-graphicalSettings-alertStatus").val("No Affect");
                    }

                    $("#Sensor-Core-functionalitySettings-defaultSpeed").val(Sensors_Core_Presets.defaultSpeed);

                    if(Sensors_Core_Presets.defaultAskForSpeed){
                        $("#Sensor-Core-functionalitySettings-askForSpeed").val("Always");
                    }else{
                        $("#Sensor-Core-functionalitySettings-askForSpeed").val("Never");
                    }

                    if(Sensors_Core_Presets.snapYaw){
                        $("#Sensor-Core-functionalitySettings-snapYaw").val("Always");
                    }else{
                        $("#Sensor-Core-functionalitySettings-snapYaw").val("Never");
                    }

                    $("#Sensor-Core-functionalitySettings-defaultHeading").val(Sensors_Core_Presets.defaultHeading + "°");

                    if(Sensors_Core_Presets.weaponsRange == 0){
                        $("#Sensor-Core-functionalitySettings-WeaponsRange").val("Disabled");
                    }else if(Sensors_Core_Presets.weaponsRange == 1){
                        $("#Sensor-Core-functionalitySettings-WeaponsRange").val("1st Ring");
                    }else if(Sensors_Core_Presets.weaponsRange == 2){
                        $("#Sensor-Core-functionalitySettings-WeaponsRange").val("2nd Ring");
                    }else {
                        $("#Sensor-Core-functionalitySettings-WeaponsRange").val("3rd Ring");
                    }

                    if(Sensors_Core_Presets.scanType == 0){
                        $("#Sensor-Core-functionalitySettings-ScanType").val("Timed");
                    }else{
                        $("#Sensor-Core-functionalitySettings-ScanType").val("Traditional");
                    }
                    var scanSeconds = (Sensors_Core_Presets.scanTime / 1000) % 60;
                    var minutes = Math.floor((Sensors_Core_Presets.scanTime/ 1000) / 60);
                    if(scanSeconds < 10){
                        scanSeconds = "0" + scanSeconds;
                    }
                    var scanTimeInSeconds = minutes + ":" + scanSeconds;
                    $("#Sensor-Core-functionalitySettings-ScanTime").val(scanTimeInSeconds);

                    $("#Sensors-Core-functionalitySettings-UpdateInterval").val(Sensors_Core_Presets.updateInterval);

                    getFileNamesInFolder("/public/Contacts","sensors-core",function(files){
                        var html = "";
                        for(var i = 0;i < files.length;i++){
                            html += "<option>" + files[i] + "</option>";
                        }
                        $("#Sensor-Core-defaultContactSettings-iconDropdown").html(html);

                        if(Sensors_Core_Presets.defaultContactIcon == undefined){
                            $("#Sensor-Core-defaultContactSettings-iconDropdown").val("None");
                        }else{
                            $("#Sensor-Core-defaultContactSettings-iconDropdown").val(Sensors_Core_Presets.defaultContactIcon);
                        }
                        openCoreWindow("Sensor-core-UserPrefsWindow",event);
                    });
                    }
                });
            });
        }
    });
    $("#Sensor-Core-processedDataSettings-cancelbutton").click(function(event){
        closeCoreWindow("Sensor-core-UserPrefsWindow",event);
    });
    $("#Sensor-Core-processedDataSettings-defaultbutton").click(function(event){
        Sensors_Core_Presets = Sensors_Core_PresetDefaults;
        Sensors_core_updateDatabaseValuesRelatedToUserPrefs();
        Interstellar.setPresetValue("sensors.sensorsPrefrences",Sensors_Core_PresetDefaults);
        closeCoreWindow("Sensor-core-UserPrefsWindow",event);
    });
    $("#Sensor-Core-processedDataSettings-savebutton").click(function(event){
        if($("#Sensor-Core-processedDataSettings-flashSettings").val() == "No Flash"){
            Sensors_Core_Presets.processedDataFlash = 0;
        }else if($("#Sensor-Core-processedDataSettings-flashSettings").val() == "Flash Processed Data Box"){
            Sensors_Core_Presets.processedDataFlash = 1;
        }else{
            Sensors_Core_Presets.processedDataFlash = 2;
        }

        if($("#Sensor-Core-processedDataSettings-fontSizeSettings").val() == "Never"){
            Sensors_Core_Presets.allowFontSizeAdjustments = 0;
        }else if($("#Sensor-Core-processedDataSettings-fontSizeSettings").val() == "With FD Approval"){
            Sensors_Core_Presets.allowFontSizeAdjustments = 1;
        }else{
            Sensors_Core_Presets.allowFontSizeAdjustments = 2;
        }

        if($("#Sensor-Core-processedDataSettings-typeOnSettings").val() == "Never"){
            Sensors_Core_Presets.typeProcessedData = 0;
        }else if($("#Sensor-Core-processedDataSettings-typeOnSettings").val() == "Without HTML"){
            Sensors_Core_Presets.typeProcessedData = 1;
        }else{
            Sensors_Core_Presets.typeProcessedData = 2;
        }

        if($("#Sensor-Core-processedDataSettings-procssedDataSoundEffect").val() == "" || $("#Sensor-Core-processedDataSettings-procssedDataSoundEffect").val() == "None"){
            Sensors_Core_Presets.processedDataSoundEffect = undefined;
        }else{
            Sensors_Core_Presets.processedDataSoundEffect = $("#Sensor-Core-processedDataSettings-procssedDataSoundEffect").val();
        }
        var name = $("#Sensor-Core-defaultContactSettings-DefaultContactName").val();
        //if(name == ""){
        //    name = "UNKNOWN CONTACT";
        //}
        Sensors_Core_Presets.defaultContactName = name;
        Sensors_Core_Presets.defaultContactSize = $("#Sensor-Core-defaultContactSettings-DefaultContactSize").val();

        if($("#Sensor-Core-defaultContactSettings-imageDropdown").val() == "" || $("#Sensor-Core-defaultContactSettings-imageDropdown").val() == null || $("#Sensor-Core-defaultContactSettings-imageDropdown").val() == "None"){
            Sensors_Core_Presets.defaultContactImage = undefined;
        }else{
            Sensors_Core_Presets.defaultContactImage = $("#Sensor-Core-defaultContactSettings-imageDropdown").val();
        }

        if($("#Sensor-Core-defaultContactSettings-iconDropdown").val() == "" || $("#Sensor-Core-defaultContactSettings-iconDropdown").val() == "None"){
            Sensors_Core_Presets.defaultContactIcon = "Generic.png";
        }else{
            Sensors_Core_Presets.defaultContactIcon = $("#Sensor-Core-defaultContactSettings-iconDropdown").val();
        }

        Sensors_Core_Presets.defaultContactNormal = $("#Sensor-Core-defaultContactSettings-NormalCheckbox").prop("checked");
        Sensors_Core_Presets.defaultContactInfrared = $("#Sensor-Core-defaultContactSettings-IRCheckbox").prop("checked");

        Sensors_Core_Presets.cameraType = $("#Sensor-Core-graphicalSettings-cameraSettings").prop('selectedIndex');
        Sensors_Core_Presets.sensorsArrayColorType = $("#Sensor-Core-graphicalSettings-colorTypeSettings").prop('selectedIndex');
        Sensors_Core_Presets.drawGradient = $("#Sensor-Core-graphicalSettings-gradientSettings").prop('selectedIndex') == 1;
        Sensors_Core_Presets.sensorsArrayHueRotate = $("#Sensor-Core-graphicalSettings-hueRotateTextbox").val().replace(/[^\d.-]/g, '');
        Sensors_Core_Presets.sensorsArrayDrawDegrees = $("#Sensor-Core-graphicalSettings-degreesDropdown").prop('selectedIndex') == 1;
        Sensors_Core_Presets.sensorsArrayIsResponsiveToAlertStatus = $("#Sensor-Core-graphicalSettings-alertStatus").prop('selectedIndex') == 0;

        Sensors_Core_Presets.defaultSpeed = $("#Sensor-Core-functionalitySettings-defaultSpeed").val();
        Sensors_Core_Presets.defaultAskForSpeed = $("#Sensor-Core-functionalitySettings-askForSpeed").prop('selectedIndex') == 1;
        Sensors_Core_Presets.snapYaw = $("#Sensor-Core-functionalitySettings-snapYaw").prop('selectedIndex') == 1;
        Sensors_Core_Presets.defaultHeading = $("#Sensor-Core-functionalitySettings-defaultHeading").val().replace(/[^\d.-]/g, '');

        Sensors_Core_Presets.weaponsRange = $("#Sensor-Core-functionalitySettings-WeaponsRange").prop('selectedIndex');
        Sensors_Core_Presets.scanType = $("#Sensor-Core-functionalitySettings-ScanType").prop('selectedIndex');

        var timeString = $("#Sensor-Core-functionalitySettings-ScanTime").val();
        if(timeString.includes(":")){
            var minutes = Number(timeString.split(":")[0]); //get the part before the : (minutes)
            var seconds = Number(timeString.split(":")[1]); //get the part after the : (seconds)

            seconds += minutes * 60; //add minutes
            Sensors_Core_Presets.scanTime = seconds * 1000; //convert to miliseconds
        }else{
            Sensors_Core_Presets.scanTime = Number(timeString) * 1000;
        }

        Sensors_Core_Presets.updateInterval = Number($("#Sensors-Core-functionalitySettings-UpdateInterval").val().replace(/\D/g,''));

        Sensors_core_updateDatabaseValuesRelatedToUserPrefs();
        Interstellar.setPresetValue("sensors.sensorsPrefrences",Sensors_Core_Presets);
        closeCoreWindow("Sensor-core-UserPrefsWindow",event)
    });
    $("#Sensors-Core-functionalitySettings-AdvancedUpdateButton").click(function(event){
        $(event.target).fadeOut(function(event){
            $("#Sensors-Core-functionalitySettings-AdvancedUpdateDropDown").slideDown();
        });
    });
    function Sensors_core_updateDatabaseValuesRelatedToUserPrefs(){
        if(Sensors_Core_Presets.processedDataFlash == 0){
            Interstellar.setDatabaseValue("sensors.processedData.doFlash",false);
        }else if(Sensors_Core_Presets.processedDataFlash == 1){
            Interstellar.setDatabaseValue("sensors.processedData.doFlash",true);
            Interstellar.setDatabaseValue("sensors.processedData.flashFullScreen",false);
        }else{
            Interstellar.setDatabaseValue("sensors.processedData.doFlash",true);
            Interstellar.setDatabaseValue("sensors.processedData.flashFullScreen",true);
        }
        Interstellar.setDatabaseValue("sensors.processedData.typeOn",Sensors_Core_Presets.typeProcessedData);

        Interstellar.setDatabaseValue("sensors.processedData.allowFontSizeAdjustments",Sensors_Core_Presets.allowFontSizeAdjustments);

        Interstellar.setDatabaseValue("sensors.graphical.drawGradient",Sensors_Core_Presets.drawGradient);
        Interstellar.setDatabaseValue("sensors.graphical.colorType",Sensors_Core_Presets.sensorsArrayColorType);
    }
    });
});