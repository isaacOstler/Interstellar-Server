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
        maxNebulaCount = 50,
        tractorBeam = {"selectedContactGUID" : "","activated" : false},
        sensorsArraySizeMultipler = 1,
        defaultContactName = "UNKNOWN CONTACT", //the defualt contact name for new contacts
        defaultContactIcon = "Contacts/Generic.png", //defualt contact icon
        defaultContactImage = "", //default contact image
        duplicateMode = false,
        deleteMode = false,
        defaultContactSize = 3, //default height and width of new icons
        phaserSpeed = .15, //how fast phasers fire
        thisWidgetName = "sensors-core", //the name of this widget (since for a while, it was called new-sensors-core)
        animationInterval = undefined, //the variable pointing to the animation interval
        networkRefreshTimeout = undefined, //the variable pointing to the network update timeout
        frameRate = 45, //the frame rate for the sensors array (how many frames per second)
        networkRefreshRate = 100, //how many milliseconds until the network is updated on the contacts positions
        contacts = [], //sensor contacts
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
        moveAllPower = 0,
        askForSpeed = true,
        planetImages = [],
        moveAllDirection = degreesToRadians(180),
        moveContactSpeed = 0,
        presets = [],
        moveContactSpeeds = 
        [
            {
                "speedName" : "painfully slow",
                "speed" : 15000
            },
            {
                "speedName" : "very slow",
                "speed" : 7500
            },
            {
                "speedName" : "slow",
                "speed" : 5000
            },
            {
                "speedName" : "normal",
                "speed" : 2200
            },
            {
                "speedName" : "fast",
                "speed" : 700
            },
            {
                "speedName" : "very fast",
                "speed" : 350
            },
            {
                "speedName" : "warp",
                "speed" : 150
            },
            {
                "speedName" : "instant",
                "speed" : 1
            }
        ],
        possibleContacts = [],
        CompoundContactsArray = [],
        contactTextures = [], //these are loaded as needed
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
        lockContactsWithMoveAll,
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
        programs = [/*
            {
                "type" : "planet", //we have several different things that go on the sensors array, so we have to specify
                "GUID" : guidGenerator(),
                "icon" : "/resource?path=public/Planets/1Terran1.png&screen=" + thisWidgetName,
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
        sizeOfElementInContactList = 21,
        contactListScrollPosition = 0,
        presetWindow_selectedPresetIndex = -1,
        nebulaProgramInterval = undefined,
        contactListSelectedContact = undefined,
        //three.js stuff
        camera, scene, renderer,
        frustumSize = 100;
    //DOM references
    var canvas = $("#new_sensors-core_sensorsArray_Canvas"),
        canvasContainer = $("#new_sensors-core_sensorsArray"),
        moveSelect = $("#sensors_core_contactEditor_moveSelect"),
        contactList_container = $("#sensors_core_contactList_container"),
        nameTextbox = $("#sensors_core_contactEditor_nameTextbox"),
        imageDropdown = $("#sensors_core_contactEditor_imageDropdown"),
        iconDropdown = $("#sensors_core_contactEditor_iconDropdown"),
        sizeSlider = $("#sensors_core_contactEditor_sizeRange"),
        contactEditorMask = $("#sensors_core_contactEditor_container_mask"),
        duplicateContactButton = $("#sensors_core_contactEditor_duplicateContactButton"),
        deleteContactButton = $("#sensors_core_contactEditor_removeContactButton"),
        addContactButton = $("#sensors_core_contactEditor_addNewContactButton"),
        moveAllCanvas = $("#sensors_core_contactControls_moveAllControls_canvas"),
        planetIconContainer = $("#Sensor_Core_PlanetEditorWindow_icons"),
        planetControls_sizeSlider = $("#Sensor_Core_PlanetEditorWindow_options_sizeRange"),
        planetControls_rotationSlider = $("#Sensor_Core_PlanetEditorWindow_options_spinRange"),
        planetControls_nameTextbox = $("#Sensor_Core_PlanetEditorWindow_options_nameTextbox"),
        moveAllPowerSlider = $("#sensors_core_moveAllPowerSlider"),
        lockContactsWithMoveAllIcon = $("#sensors_core_contactControls_moveAllControls_lockIcon"),
        unlockContactsWithMoveAllIcon = $("#sensors_core_contactControls_moveAllControls_unlockedIcon"),
        askForSpeedCheckbox = $("#sensors_core_contactEditor_askSpeed_checkbox"),
        loadPresetButton = $("#sensors_core_presetControls_loadButton"),
        appendPresetButton = $("#sensors_core_presetControls_appendButton"),
        editPresetsButton = $("#sensors_core_presetControls_editButton"),
        presetSelect = $("#sensors_core_presetControls_presetSelect"),
        presetLoadWarningPopup = $("#sensors_corePresetLoadingWarningPopup"),
        presetWindow_presetList = $("#Sensor_Core_PresetEditorWindow_presetsList"),
        presetWindow_selectedPresetMask = $("#Sensor_Core_PresetEditorWindow_selectedPresetMask"),
        presetWindow_nameTextbox = $("#Sensor_Core_PresetEditorWindow_presetNameTextbox"),
        presetWindow_deleteButton = $("#Sensor_Core_PresetEditorWindow_removeButton"),
        presetWindow_saveButton = $("#Sensor_Core_PresetEditorWindow_saveButton"),
        presetLoadWarningPopup_cancelButton = $("#sensors_corePresetLoadingWarningPopup_popup_cancel"),
        presetLoadWarningPopup_continueButton = $("#sensors_corePresetLoadingWarningPopup_popup_continue"),
        speedPopup = $("#new_sensors_speedPopup");
    //init calls

    drawSensorsGui();
    initThreeJS();
    init();
    drawGUI();
    
    //preset observers
    Interstellar.onPresetValueChange("sensors.contactPresets",function(newData){
        if(newData == null){
            Interstellar.setPresetValue("sensors.contactPresets",presets);
            return;
        }
        presets = newData;
        console.log(presets);
        var html = "";
        html += "<optgroup label='Preset'>";
        for(var i = 0;i < presets.length;i++){
            html += "<option>";
            html += presets[i].presetName;
            html += "</option>";
        }
        html += "</optgroup>";
        presetSelect.html(html);

        html = "";
        for(var i = 0;i < presets.length;i++){
            html += '<div index="' + i + '" class="Sensor_Core_PresetEditorWindow_presetsList_option">';
            html += presets[i].presetName;
            html += "</div>";
        }
        presetWindow_presetList.html(html);
        $(".Sensor_Core_PresetEditorWindow_presetsList_option").off();
        $(".Sensor_Core_PresetEditorWindow_presetsList_option").click(function(event){
            presetWindow_selectedPresetIndex = Number($(event.target).attr("index"));
            presetWindow_selectedPresetMask.fadeOut();
            presetWindow_nameTextbox.val(presets[presetWindow_selectedPresetIndex].presetName);
        });
    });
    //database observers
    Interstellar.onDatabaseValueChange("tractorBeam.settings",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("tractorBeam.settings",tractorBeam);
            return;
        }
        tractorBeam = newData;
    });

    Interstellar.onDatabaseValueChange("sensors.lockContactsWithMoveAll",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("sensors.lockContactsWithMoveAll",false);
            return;
        }
        lockContactsWithMoveAll = newData;
        if(lockContactsWithMoveAll){
            lockContactsWithMoveAllIcon.css("display","none");
            unlockContactsWithMoveAllIcon.css("display","block");
        }else{
            unlockContactsWithMoveAllIcon.css("display","none");
            lockContactsWithMoveAllIcon.css("display","block");
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

            /*
            for(var j = 0;j < 128;j++){
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
            setTimeout(function(){
            var presetContacts =[];
            /*for(var k = 0;k < 0;k++){
                var newContact = {
                    "type" : "contact", //we have several different things that go on the sensors array, so we have to specify
                    "GUID" : guidGenerator(),
                    "xPos" : Math.random() * 100,
                    "height" : 4,
                    "name" : possibleContacts[Math.floor(possibleContacts.length * Math.random())],
                    "width" : 4,
                    "yPos" : Math.random() * 100,
                    "wantedX" : Math.random() * 85,
                    "wantedY" : Math.random() * 100,
                    "animationSpeed" : 1000,
                    "xStep" : undefined,
                    "yStep" : undefined,
                    "icon" : possibleContacts[Math.floor(possibleContacts.length * Math.random())],
                    "isActive" : false,//(Math.random() > .5) ? true : false,
                    "attributes" :
                    {
                        "infrared" : true
                    }
                }
                presetContacts.splice(presetContacts.length,0,newContact);
            }*/
            //set the default value
            Interstellar.setDatabaseValue("sensors.contacts",presetContacts);
            },0100);
            //terminate execution of this function
            return;
        }
        if(contacts.length == newData.length){
            contacts = newData;
            updateContactList();
        }else{
            contacts = newData;
            drawContactList();
        }
        noAnimationCycleInProgress = false;
        animationCycle(newData);
    });

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
                        //console.log("Hey!  That's pretty good!");
                    }
                    var scaler = frameRate / networkRefreshRate;
                    //let's also factor in the move all speed
                    //if the contacts are unlocked with moveall, OR this isn't a contact
                    if(!lockContactsWithMoveAll || CompoundContactsArray[i].type != "contact"){
                        CompoundContactsArray[i].xPos += (scaler * moveAllSpeeds.x);
                        CompoundContactsArray[i].wantedX += (scaler * moveAllSpeeds.x);
                        //same for the y
                        CompoundContactsArray[i].yPos += (scaler * moveAllSpeeds.y);
                        CompoundContactsArray[i].wantedY += (scaler * moveAllSpeeds.y);
                    }
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
                                Interstellar.say(CompoundContactsArray[impactedObject_index].name + ' Hit!');
                                //console.log(GUID_ofImpactedObject + " WAS HIT BY A " + CompoundContactsArray[i].type + "!");
                                createExplosionAtPoint(CompoundContactsArray[impactedObject_index].xPos,CompoundContactsArray[impactedObject_index].yPos,Math.random() * .04 + .01);
                                //remove this weapon
                                weapons.splice(l,1);
                                CompoundContactsArray.splice(i,1);
                                updateContactsEarly();
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
            //now we update the array!
            updateContactsOnArray(CompoundContactsArray);
        },1000 / frameRate); //this calculates the frame rate (remember, this is in milliseconds)

        //THIS PART IS ONLY FOR CORE!!!
        var i;
        var differenceDetected = false;
        for(i = 0;i < programs.length;i++){
            //if the program is a planet
            if(programs[i].type == "planet"){
                if(programs[i].rotationSpeed != 0 || moveAllSpeeds.x != 0 || moveAllSpeeds.y != 0){
                    differenceDetected = true;
                }
                //add the rotation
                programs[i].rotation += programs[i].rotationSpeed;
                //add the move-all speed to the position
                programs[i].xPos += moveAllSpeeds.x;
                programs[i].yPos += moveAllSpeeds.y;
            }else if(programs[i].type == "asteroid"){
                //add the rotation
                programs[i].rotation += programs[i].rotationSpeed;
                //add the move-all speed to the position
                programs[i].xPos += moveAllSpeeds.x;
                programs[i].yPos += moveAllSpeeds.y;
            }else if(programs[i].type == "nebula"){
                //add the rotation
                programs[i].rotation += programs[i].rotationSpeed;
                //add the move-all speed to the position
                programs[i].xPos += moveAllSpeeds.x;
                programs[i].yPos += moveAllSpeeds.y;
            }else{
                //add the move-all speed to the position
                programs[i].xPos += moveAllSpeeds.x;
                programs[i].yPos += moveAllSpeeds.y;
            }
        }
        for(i = 0;i < weapons.length;i++){
            differenceDetected = true;
            if(weapons[i].type == "torpedo"){
                var direction = getStepsFromAngle(weapons[i].direction);
                weapons[i].xPos -= direction.x;
                weapons[i].yPos += direction.y;
            }else if(weapons[i].type == "phaser"){
                weapons[i].distance += phaserSpeed;
            }
        }
        for(i = 0;i < contacts.length;i++){
            //we need to apply the move all speed to these contacts, if applicable
            if(!lockContactsWithMoveAll){
                    
                if(moveAllSpeeds.x != 0 || moveAllSpeeds.y != 0){
                    differenceDetected = true;
                    contacts[i].xPos += moveAllSpeeds.x;
                    contacts[i].wantedX += moveAllSpeeds.x;
                    contacts[i].yPos += moveAllSpeeds.y;
                    contacts[i].wantedY += moveAllSpeeds.y;
                }
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
            noAnimationCycleInProgress = true;
            return;
        }
        //if there is already a timeout
        if(networkRefreshTimeout != undefined){
            //clear it
            clearTimeout(networkRefreshTimeout);
        }
        networkRefreshTimeout = setTimeout(function(){
            for(i = 0;i < effects.length;i++){
                if(effects[i].removeBy <= Date.now()){
                    effects.splice(i,1);
                }
            }
            Interstellar.setDatabaseValue("sensors.weapons",weapons);
            Interstellar.setDatabaseValue("sensors.programs",programs);
            Interstellar.setDatabaseValue("sensors.contacts",contacts);
            Interstellar.setDatabaseValue("sensors.effects",effects);
        },networkRefreshRate)
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
        $(renderer.domElement).width(canvas.width());
        $(renderer.domElement).height(canvas.height());
        //add the DOM.
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

        if(tractorBeam.activated){
            ctx.setLineDash([]);
            //now we draw the tractor beam
            var tractorBeamCords = {
                "x" : 0,
                "y" : 0
            }
            var beamVariance = 1;
            for(var i = 0;i < CompoundContactsArray.length;i++){
                if(CompoundContactsArray[i].GUID == tractorBeam.selectedContactGUID){
                    var offsetX = (((canvas.width() * sensorsArraySizeMultipler) - canvas.width()) / 2) / canvas.width();
                    var offsetY = (((canvas.height() * sensorsArraySizeMultipler) - canvas.height()) / 2) / canvas.height();
                    var scaledPercentageX = (CompoundContactsArray[i].xPos * sensorsArraySizeMultipler);
                    var scaledPercentageY = ((100 -CompoundContactsArray[i].yPos) * sensorsArraySizeMultipler);
                    var correctPercentageX = ((scaledPercentageX - (100 * offsetX)) / 100);
                    var correctPercentageY = ((scaledPercentageY - (100 * offsetY)) / 100);
                    tractorBeamCords.x = correctPercentageX * canvas.width();
                    tractorBeamCords.y = correctPercentageY * canvas.height();
                }
            }
            ctx.beginPath();
            for(var i = 0;i < 100;i++){
                ctx.beginPath();
                var color = "rgba(0," + (100 + Math.round(Math.random() * 100)) + ",255," + (Math.random() * .2) + ")";
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.round(Math.random() * 4);
                ctx.moveTo(center,center);
                var polar = cartesian2Polar(tractorBeamCords.x,tractorBeamCords.y);
                polar.radians += degreesToRadians((Math.random() * (beamVariance * 2)) - beamVariance);
                polar.distance += (Math.random() * 10) - 10;
                var cords = polarToCartesian(polar);
                ctx.lineTo(cords.x,cords.y);
                ctx.stroke();
            }
            ctx.strokeStyle = "white";
        }
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
                    if(renderedContacts[j].type == "contact"){
                        if(!renderedContacts[j].isActive && scene.children[i].name != renderedContacts[j].GUID){
                            //if the contact isn't active, we don't want it's ghost and stuff
                            wasFound = false;
                        }
                    }
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
                var contactGhost = scene.getObjectByName(renderedContacts[i].GUID + "_GHOST");
                var line = scene.getObjectByName(renderedContacts[i].GUID + "_LINE");
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
                    var newContact = new THREE.Mesh(geometry, material);
                    //assign the GUID to the name of this new mesh
                    newContact.name = renderedContacts[i].GUID;
                    //add it to the scene
                    scene.add(newContact);
                    //save a reference
                    contact = newContact;
                    //great!  Let's add his ghost too!
                    //pretty much the same exact thing
                    material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : .5} );
                    var newGhost = new THREE.Mesh(geometry, material);
                    //assign the GUID to the name of this new mesh
                    newGhost.name = renderedContacts[i].GUID + "_GHOST";
                    //add it to the scene
                    scene.add(newGhost);
                    //save a reference
                    contactGhost = newGhost;
                    //now lets create the line between the two
                    //create a blue LineBasicMaterial
                    var material = new THREE.LineBasicMaterial({ color: 0xffffff * Math.random() });
                    var geometry = new THREE.Geometry();

                    geometry.vertices.push(contact.position);
                    geometry.vertices.push(contactGhost.position);

                    var newLine = new THREE.Line(geometry, material);
                    newLine.name = renderedContacts[i].GUID + "_LINE";
                    scene.add(newLine);

                    line = newLine;
                }
                if(renderedContacts[i].isActive){
                    if(contactGhost == undefined){
                        var geometry = new THREE.PlaneGeometry( 100, 100 );
                        //then we load the texture
                        var texture = new THREE.TextureLoader().load( '/resource?path=public/' + renderedContacts[i].icon + '&screen=' + thisWidgetName );
                        //now we need to make a material with that texture
                        var material = new THREE.MeshBasicMaterial( { map: texture,transparent: true,opacity : .5} );
                        var newGhost = new THREE.Mesh(geometry, material);
                        //assign the GUID to the name of this new mesh
                        newGhost.name = renderedContacts[i].GUID + "_GHOST";
                        //add it to the scene
                        scene.add(newGhost);
                        //save a reference
                        contactGhost = newGhost;
                    }
                    if(line == undefined){
                        var material = new THREE.LineBasicMaterial({ color: 0xffffff * Math.random() });
                        var geometry = new THREE.Geometry();

                        geometry.vertices.push(contact.position);
                        geometry.vertices.push(contactGhost.position);

                        var newLine = new THREE.Line(geometry, material);
                        newLine.name = renderedContacts[i].GUID + "_LINE";
                        scene.add(newLine);

                        line = newLine;
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
                    contact.material.map = texture;
                    contactGhost.material.map = texture;
                    //contacts first
                    //now let's update it's values
                    //set it's position to the proper xPos;
                    contact.position.x = renderedContacts[i].wantedX;
                    //set it's position to the proper yPos;
                    contact.position.y = renderedContacts[i].wantedY;
                    //set it's proper width
                    contact.scale.x = renderedContacts[i].width / 100; //we divide by 100, because we need to decimate the size
                    //set it's proper height
                    contact.scale.y = renderedContacts[i].height / 100; //we divide by 100, because we need to decimate the size

                    //now ghosts
                    //set it's position to the proper xPos;
                    contactGhost.position.x = renderedContacts[i].xPos;
                    //set it's position to the proper yPos;
                    contactGhost.position.y = renderedContacts[i].yPos;
                    //set it's proper width
                    contactGhost.scale.x = renderedContacts[i].width / 100; //we divide by 100, because we need to decimate the size
                    //set it's proper height
                    contactGhost.scale.y = renderedContacts[i].height / 100; //we divide by 100, because we need to decimate the size
                    //draw the line between the two

                    line.geometry.dynamic = true;
                    line.geometry.vertices.push(contact.position);
                    line.geometry.vertices.push(contactGhost.position);
                    line.geometry.verticesNeedUpdate = true;
                }else{
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
                    contact.material.map = texture;
                    //force to the side
                    contact.position.x = 95;
                    //force to the side
                    contact.position.y = (100 - ((100 * (sizeOfElementInContactList / contactList_container.height())) * (i + 1))) + (100 * (contactListScrollPosition / contactList_container.height())) + (100 * (sizeOfElementInContactList / contactList_container.height()) / 2);
                    //make them smaller
                    contact.scale.x = 3 / 100;
                    contact.scale.y = 3 / 100;
                }
            }else if(renderedContacts[i].type == "planet"){
                var contact = scene.getObjectByName(renderedContacts[i].GUID);
                if(contact == undefined ){
                    //this object hasn't been created!
                    //lets add it now!
                    //first we make the geometry (just a plane)
                    var geometry = new THREE.PlaneGeometry( 100, 100 );
                    //then we load the texture
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
    function init(){
        getFileNamesInFolder("/public/Contacts/","sensors-core",function(files){
            possibleContacts = files;
            var option = '';
            for (var i=0;i<possibleContacts.length;i++){
               option += '<option value="'+ possibleContacts[i] + '">' + possibleContacts[i] + '</option>';
            }
            iconDropdown.html(option);
        });

        //cheat solution, since getFileNamesInFolder seems to have problems with scope and callbacks
        setTimeout(function(){
            getFileNamesInFolder("/public/Images/","sensors-core",function(imageFiles){
                possibleImages = imageFiles;
                var imageOption = '';
                for (var i=0;i<possibleImages.length;i++){
                   imageOption += '<option value="'+ possibleImages[i] + '">' + possibleImages[i] + '</option>';
                }
                imageDropdown.html(imageOption);
            });
            //list all the planets
            setTimeout(function(){
                getFileNamesInFolder("/public/Planets/","sensors-core",function(files){
                    var planetsHTML = "";
                    planetImages = [];
                    for(var i = 0;i < files.length;i++){
                        planetImages.splice(planetImages.length,0,files[i]);
                        planetsHTML += '<div index="' + i + '" class="sensors_core_imagePreview customButton" style="background-image: url(\'/resource?path=public/Planets/' + files[i] + '&screen=sensors-core\');"></div>';
                    }
                    planetIconContainer.html(planetsHTML);
                    $(".sensors_core_imagePreview").off();
                    $(".sensors_core_imagePreview").click(function(event){
                        var index = Number($(event.target).attr("index"));
                        createPlanet(planetControls_nameTextbox.val(),Number(planetControls_sizeSlider.val()),planetImages[index],Number(planetControls_rotationSlider.val()));
                        Interstellar.closeCoreWindow("Sensor_Core_PlanetEditorWindow");
                    })
                });
            },0100);
        },0500);
    }

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
            "icon" : "Contacts/" + icon,
            "isActive" : true
        }
        programs.splice(programs.length,0,newContact);
        updateContactsEarly();
        //Interstellar.setDatabaseValue("sensors.programs",programs);
    }

    function addNewContact(name,xPos,yPos,wantedX,wantedY,height,width,animationSpeed,icon,image,isActive){
        if(isActive == undefined){
            isActive = true;
        }
        var guid = guidGenerator();
        var newContact = 
        {
            "type" : "contact", //we have several different things that go on the sensors array, so we have to specify
            "GUID" : guid,
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
            "image" : image,
            "isActive" : isActive,
            "attributes" :
            {
                "infrared" : true,
            }
        }
        contacts.splice(contacts.length,0,newContact);
        drawContactList();
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

        //this is also our chance to remove any contacts that are outside of the array
        var didModify = false,
            programToRemove = [];
        for(var i = 0;i < CompoundContactsArray.length;i++){
            if(CompoundContactsArray[i].type == "contact"){
                if(CompoundContactsArray[i].isActive){
                    if((CompoundContactsArray[i].xPos < 0 || CompoundContactsArray[i].xPos > 100) || (CompoundContactsArray[i].yPos < 0 || CompoundContactsArray[i].yPos > 100)){
                        CompoundContactsArray[i].isActive = false;
                        didModify = true;
                    }
                }
            }else{ //for other types of contacts, we allow them to be a bit off the array, and much farther ahead
                if((CompoundContactsArray[i].xPos < -50 || CompoundContactsArray[i].xPos > 150) || (CompoundContactsArray[i].yPos < -50 || CompoundContactsArray[i].yPos > 220)){
                    programToRemove.splice(programToRemove.length,0,CompoundContactsArray[i].GUID);
                }
            }
        }
        if(didModify){
            updateContactsEarly();
        }
        if(programToRemove.length > 0){
            for(var i = 0;i < programToRemove.length;i++){
                for(var x = 0;x < CompoundContactsArray.length;x++){
                    if(CompoundContactsArray[x].GUID == programToRemove[i]){
                        CompoundContactsArray.splice(x,1);
                    }
                }
            }
            for(var i = 0;i < programToRemove.length;i++){
                for(var x = 0;x < programs.length;x++){
                    if(programs[x].GUID == programToRemove[i]){
                        programs.splice(x,1);
                    }
                }
            }
            for(var i = 0;i < programToRemove.length;i++){
                for(var x = 0;x < weapons.length;x++){
                    if(weapons[x].GUID == programToRemove[i]){
                        weapons.splice(x,1);
                    }
                }
            }
            updateContactsEarly();
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
    function drawGUI(){
        var html = "";
        //list all the move options
        for(var i = 0;i < moveContactSpeeds.length;i++){
            html += "<option>";
            html += moveContactSpeeds[i].speedName;
            html += "</option>";
        }
        moveSelect.html(html);
        html = "";
        for(var i = 0;i < moveContactSpeeds.length;i++){
            if(moveContactSpeeds[i].speedName == "instant"){
                html += "<div index='" + i + "' style='background:linear-gradient(to right, rgba(255,158,0,.9),rgba(255,158,0,.7));'  class='new_sensors_speedPopupOption'>INSTANT</div>";
            }else{
                html += "<div index='" + i + "' class='new_sensors_speedPopupOption'>" + moveContactSpeeds[i].speedName + "</div>";
            }
        }
        html += "<div index='-1' style='background:linear-gradient(to right, rgba(255,0,0,.9),rgba(255,0,0,.7));' class=' new_sensors_speedPopupOption'>REMOVE</div>";
        speedPopup.html(html);

        var radius = Math.min((moveAllCanvas.width() / 2) * .85,(moveAllCanvas.height() / 2) * .85);

        var c = document.getElementById(moveAllCanvas.attr("id"));
        c.width = moveAllCanvas.width();
        c.height = moveAllCanvas.height();
        var ctx = c.getContext("2d");
        ctx.clearRect(0,0,moveAllCanvas.width(),moveAllCanvas.height());
        ctx.beginPath();
        ctx.strokeStyle="#FFFFFF";
        ctx.lineWidth = 1;
        var polarCords = polarToCartesian({"radians" : moveAllDirection - degreesToRadians(90),"distance" : radius});
        ctx.arc((moveAllCanvas.width() / 2),radius + 4,radius,0,2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle="#FF0000";
        ctx.lineWidth = 3;
        ctx.moveTo((moveAllCanvas.width() / 2),radius + 4);
        ctx.lineTo(polarCords.x + (moveAllCanvas.width() / 2),polarCords.y + radius + 4);
        ctx.stroke();
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
                        contacts[i].icon = CompoundContactsArray[l].icon;
                        contacts[i].name = CompoundContactsArray[l].name;
                    }
                }
            }
        }
        Interstellar.setDatabaseValue("sensors.weapons",weapons);
        Interstellar.setDatabaseValue("sensors.programs",programs);
        Interstellar.setDatabaseValue("sensors.contacts",contacts);
        Interstellar.setDatabaseValue("sensors.effects",effects);
    }
    function updateContactEditorMode(){
        deleteContactButton.removeClass("sensors_core_contactEditor_deleteContactModeActive");
        duplicateContactButton.removeClass("sensors_core_contactEditor_duplicateContactModeActive");
        contactList_container.removeClass("sensors_core_contactEditor_deleteContactModeActive");
        contactList_container.removeClass("sensors_core_contactEditor_duplicateContactModeActive");
        if(deleteMode){
            deleteContactButton.addClass("sensors_core_contactEditor_deleteContactModeActive");
            contactList_container.addClass("sensors_core_contactEditor_deleteContactModeActive");
        }
        if(duplicateMode){
            duplicateContactButton.addClass("sensors_core_contactEditor_duplicateContactModeActive");
            contactList_container.addClass("sensors_core_contactEditor_duplicateContactModeActive");
        }
    }

    function createPlanet(planetName,size,icon,spin){
        var newPlanet = {
            "type" : "planet", //we have several different things that go on the sensors array, so we have to specify
            "GUID" : guidGenerator(),
            "icon" : "Planets/" + icon,
            "xPos" : 50,
            "size" : size,
            "name" : planetName,
            "yPos" : 110,
            "rotation" : 0,
            "rotationSpeed" : spin
        }
        newPrograms = programs;
        newPrograms.splice(newPrograms.length,0,newPlanet);
        Interstellar.setDatabaseValue("sensors.programs",newPrograms);
    }

    function updateContactEditor(){
        for(var i = 0;i < CompoundContactsArray.length;i++){
            if(CompoundContactsArray[i].GUID == contactListSelectedContact){
                contactEditorMask.fadeOut();
                nameTextbox.val(CompoundContactsArray[i].name);
                iconDropdown.val(CompoundContactsArray[i].icon);
                sizeSlider.val(CompoundContactsArray[i].width);
                imageDropdown.val(CompoundContactsArray[i].image);
                return;
            }
        }
        nameTextbox.val("");
        iconDropdown.val("");
        sizeSlider.val("");
        imageDropdown.val("");
        contactEditorMask.fadeIn();
    }

    function updateContactList(){
        for(var i = 0;i < contacts.length;i++){
            $("#sensors_core_contactListElement_" + i).html(contacts[i].name);
        }
    }

    function drawContactList(){
        var html = "";
        for(var i = 0;i < contacts.length;i++){
            html += "<div class='sensors_core_contactListElement noselect' id='sensors_core_contactListElement_" + i + "' index='" + i + "'>";
            html += contacts[i].name;
            html += "</div>";
        }
        contactList_container.html(html);
        $(".sensors_core_contactListElement").off();
        $(".sensors_core_contactListElement").click(function(event){
            if(duplicateMode){
                var name = contacts[Number($(event.target).attr("index"))].name,
                    width = contacts[Number($(event.target).attr("index"))].width,
                    height = contacts[Number($(event.target).attr("index"))].height,
                    icon = contacts[Number($(event.target).attr("index"))].icon,
                    image = contacts[Number($(event.target).attr("index"))].image,
                    animationSpeed = contacts[Number($(event.target).attr("index"))].animationSpeed

                addNewContact(name,0,0,0,0,height,width,animationSpeed,icon,image,false);
                contactListSelectedContact = undefined;
                updateContactEditor();
            }else if(deleteMode){
                contacts.splice(Number($(event.target).attr("index")),1);
                updateContactsEarly();
                drawContactList();
                contactListSelectedContact = undefined;
                updateContactEditor();
            }else{
                contactListSelectedContact = contacts[Number($(event.target).attr("index"))].GUID;
                updateContactEditor();
            }
        });
    }

    // Schedule the first frame.
    requestAnimationFrame(animate);
    //event handlers
    appendPresetButton.click(function(event){
        var newContacts = [],
            nameOfPreset = presetSelect.val();

        for(var i = 0;i < presets.length;i++){
            if(presets[i].presetName == nameOfPreset){
                //this is the correct preset
                newContacts = presets[i].contacts;
            }
        }
        for(var i = 0;i < newContacts.length;i++){
            newContacts[i].isActive = false;
            newContacts[i].GUID = guidGenerator();
        }
        Interstellar.setDatabaseValue("sensors.contacts",contacts.concat(newContacts));
    });
    askForSpeedCheckbox.on("click",function(event){
        askForSpeed = $(event.target).is(":checked");
    });
    moveAllPowerSlider.on("dblclick",function(event){
        event.target.value = 0;
        moveAllSpeeds =
        {
            "x" : 0,
            "y" : 0
        }
        Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
    });
    moveAllPowerSlider.on("input",function(event){
        moveAllPower = event.target.value;
        var polarToCart = polarToCartesian({"radians" : moveAllDirection - degreesToRadians(90),"distance" : moveAllPower});
        moveAllSpeeds =
        {
            "x" : -polarToCart.x,
            "y" : polarToCart.y
        }
        Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
    });
    canvas.mousedown(function(event){
        //first we need to know if they are selecting one contact
        //in particular, or if they are trying to drag select
        var selectingContact = "";
        //cycle through each contact, if the offset lies within
        var i;
        var cursorXpercentage = (event.offsetX / canvas.width()) * 100,
            cursorYpercentage = 100 - ((event.offsetY / canvas.height() * 100));
        for(i = 0;i < CompoundContactsArray.length;i++){
            //it's bounds, then we are selecting it.
            if(
                cursorXpercentage > CompoundContactsArray[i].wantedX - (CompoundContactsArray[i].width / 2) &&
                cursorXpercentage < CompoundContactsArray[i].wantedX + (CompoundContactsArray[i].width / 2) &&
                cursorYpercentage > CompoundContactsArray[i].wantedY - (CompoundContactsArray[i].height / 2) &&
                cursorYpercentage < CompoundContactsArray[i].wantedY + (CompoundContactsArray[i].height / 2)
            ){
                //lastly, check to see if the contact is actually active
                if(CompoundContactsArray[i].isActive){
                    //set the selected contact to the GUID;
                    selectingContact = CompoundContactsArray[i].GUID;
                    //and stop the execution of this for loop, for the sake of speed
                    break;
                }
            }
        }
        //if there was a contact on our mouse click
        if(selectingContact != ""){
            //first we need to know if this contact has already been selected
            if(jQuery.inArray(selectingContact,selectedContacts) == -1){
                //since this contact wasn't in the array, we unselect every other contact
                selectedContacts = [selectingContact];
            }
            //set the flag that we are dragging contacts to true
            isDraggingContacts = true;
            //now record the mouse position
            draggingContactsMouseOffset.x = (event.offsetX / canvas.width()) * 100;
            draggingContactsMouseOffset.y = 100 - ((event.offsetY / canvas.height() * 100));
            //time to record the offsets
            //let's first clear them all
            selectedContactOffsets.splice(0,selectedContactOffsets.length);
            var i,
                j;
            for(i = 0;i < selectedContacts.length;i++){
                for(j = 0;j < CompoundContactsArray.length;j++){
                    if(selectedContacts[i] == CompoundContactsArray[j].GUID){
                        var contactOffsetX = CompoundContactsArray[j].wantedX - draggingContactsMouseOffset.x;
                        var contactOffsetY = CompoundContactsArray[j].wantedY - draggingContactsMouseOffset.y;
                        selectedContactOffsets.splice(selectedContactOffsets.length,0,
                        {
                            "x" : contactOffsetX,
                            "y" : contactOffsetY
                        });
                    }
                }
            }
            //clear old event listeners (so we don't leak them)
            $(document).off('mousemove.sensorsDragging');
            $(document).off('mouseup.sensorsDraggingEnd');
            //tell the document what to do when the mouse moves
            $(document).on('mousemove.sensorsDragging',function(event){
                //record the mouse positions, so that three.js can render the contacts moving
                draggingContactsMouseOffset.x = (event.offsetX / canvas.width()) * 100;
                draggingContactsMouseOffset.y = 100 - ((event.offsetY / canvas.height() * 100));
            });
            $(document).on('mouseup.sensorsDraggingEnd',function(event){
                var calculateMovements = function(speed){
                    isDraggingContacts = false;
                    //now we need to save these points and push to the database
                    var i,
                        j;
                    for(i = 0;i < selectedContacts.length;i++){
                        for(j = 0;j < CompoundContactsArray.length;j++){
                            if(CompoundContactsArray[j].GUID == selectedContacts[i]){
                                CompoundContactsArray[j].wantedX = draggingContactsMouseOffset.x + selectedContactOffsets[i].x;
                                CompoundContactsArray[j].wantedY = draggingContactsMouseOffset.y + selectedContactOffsets[i].y;
                                CompoundContactsArray[j].xStep = undefined;
                                CompoundContactsArray[j].yStep = undefined;
                                CompoundContactsArray[j].animationSpeed = speed;
                            }
                        }
                    }
                    selectedContacts = [];
                    $(document).off('mousemove.sensorsDragging');
                    $(document).off('mouseup.sensorsDraggingEnd');
                    var newContactsArray = [],
                        i;
                    for(i = 0;i < CompoundContactsArray.length;i++){
                        if(CompoundContactsArray[i].type == "contact"){
                            newContactsArray.splice(newContactsArray.length,0,CompoundContactsArray[i]);
                        }
                    }
                    updateContactsEarly();
                    //Interstellar.setDatabaseValue("sensors.contacts",newContactsArray);
                }
                if(askForSpeed){
                    $(document).off('mousemove.sensorsDragging');
                    $(document).off('mouseup.sensorsDraggingEnd');
                    speedPopup.css("left",event.pageX + "px");
                    speedPopup.css("top",event.pageY + "px");
                    speedPopup.css("display","block");
                    $("new_sensors_speedPopupOption").off();
                    $(".new_sensors_speedPopupOption").click(function(popupEvent){
                        var index = Number($(popupEvent.target).attr("index"));
                        if(index == -1){
                            //destroy the contact(s), instead of moving
                            for(i = 0;i < selectedContacts.length;i++){
                                for(j = 0;j < CompoundContactsArray.length;j++){
                                    if(CompoundContactsArray[j].GUID == selectedContacts[i]){
                                        CompoundContactsArray[j].isActive = false;
                                    }
                                }
                            }
                            updateContactsEarly();
                            drawContactList();
                            selectedContacts = [];
                            updateContactEditor();
                        }else{
                            calculateMovements(moveContactSpeeds[index].speed);
                        }
                        speedPopup.css("display","none");
                    });
                }else{
                    calculateMovements(moveContactSpeeds[moveContactSpeed].speed);
                }
            });
        }else{
            //are we trying to select an inactive contact?
            var isTryingToSelectInactiveContact = false;
            var mouseXPos = (event.offsetX / canvas.width()) * 100;
            var mouseYPos = 100 - ((event.offsetY / canvas.height()) * 100);
            if(mouseXPos > 92 && mouseXPos < 98){
                var realYPosition = Math.floor((100 - (mouseYPos - ((contactListScrollPosition / canvas.height()) * 100))) / (100 * (sizeOfElementInContactList / canvas.height())));
                isTryingToSelectInactiveContact = !contacts[realYPosition].isActive;
            }
            if(!isTryingToSelectInactiveContact){
                //we are drag selecting

                //define the start x and y points for the drag selection
                selectionDragPoints.startX = event.offsetX;
                selectionDragPoints.startY = event.offsetY;
                //when we click on the canvas
                //clear old event listeners (so we don't leak them)
                $(document).off('mousemove.sensorsSelection');
                $(document).off('mousemove.sensorsSelectionEnd');
                //tell the document what to do when the mouse moves
                $(document).on('mousemove.sensorsSelection',function(event){
                    //set the current end points
                    selectionDragPoints.endX = event.offsetX;
                    selectionDragPoints.endY = event.offsetY;
                    //and redraw the GUI
                    //now that we have finalized the box, lets convert it to a simple x,y,height width to make
                    //comparisons easier
                    var selectionX,selectionY,selectionHeight,selectionWidth;

                    //first figure out the X
                    if(selectionDragPoints.startX > selectionDragPoints.endX){
                        selectionX = (selectionDragPoints.endX / canvas.width()) * 100;
                    }else{
                        selectionX = (selectionDragPoints.startX  / canvas.width()) * 100;
                    }
                    //set the width
                    selectionWidth = (Math.abs(selectionDragPoints.startX - selectionDragPoints.endX) / canvas.width()) * 100;

                    //now for the Y!
                    if(selectionDragPoints.startY < selectionDragPoints.endY){
                        selectionY = 100 - ((selectionDragPoints.endY / canvas.height()) * 100); //we have to invert y
                    }else{
                        selectionY = 100 - ((selectionDragPoints.startY / canvas.height()) * 100); //we have to invert y
                    }
                    //set the height
                    selectionHeight = (Math.abs(selectionDragPoints.startY - selectionDragPoints.endY) / canvas.height()) * 100;
                    //add all the contacts in the drag selection box to the selected contacts array
                    selectedContacts = [];
                    var i;
                    for(i = 0;i < CompoundContactsArray.length;i++){
                        //see if it falls in the right bounds
                        if(
                            CompoundContactsArray[i].wantedX + (CompoundContactsArray[i].width / 2) >= selectionX &&
                            CompoundContactsArray[i].wantedX - (CompoundContactsArray[i].width / 2) <= selectionX + selectionWidth &&
                            CompoundContactsArray[i].wantedY + (CompoundContactsArray[i].height / 2) >= selectionY &&
                            CompoundContactsArray[i].wantedY - (CompoundContactsArray[i].height / 2) <= selectionY + selectionHeight
                        ){
                            //lastly, is the contact active?
                            if(CompoundContactsArray[i].isActive){
                                //the item falls in the selection box
                                selectedContacts.splice(selectedContacts.length,0,CompoundContactsArray[i].GUID);
                            }
                        }
                    }

                    drawSensorsGui();
                });
                //when we let go of the mouse
                $(document).on('mouseup.sensorsSelectionEnd',function(event){
                    //erase the selection box (by reseting it's values back to 0)
                    selectionDragPoints.startX = 0;
                    selectionDragPoints.startY = 0;
                    selectionDragPoints.endX = 0;
                    selectionDragPoints.endY = 0;
                    //and draw the canvas again
                    drawSensorsGui();
                    //clear all the event listeners (so the drawing stops)
                    $(document).off('mousemove.sensorsSelection');
                    $(document).off('mouseup.sensorsSelectionEnd');
                });
            }else{
                //we ARE selecting an inactive target
                //lets set the dragging contacts flag to true
                isDraggingContacts = true;
                draggingContactsMouseOffset = {"x" : 100 * (event.offsetX / canvas.width()),"y" : 100 - (100 * (event.offsetY / canvas.height()))};
                selectedContacts = [contacts[realYPosition].GUID];
                selectedContactOffsets = [{"x" : 0,"y" : 0}];
                $(document.body).on("mouseup.dropInactiveContact",function(event){
                    for(var n = 0;n < contacts.length;n++){
                        if(contacts[n].GUID == selectedContacts[0]){
                            contacts[n].xPos = draggingContactsMouseOffset.x;
                            contacts[n].yPos = draggingContactsMouseOffset.y;
                            contacts[n].wantedX = draggingContactsMouseOffset.x;
                            contacts[n].wantedY = draggingContactsMouseOffset.y;
                            contacts[n].isActive = true;

                            isDraggingContacts = false;
                            selectedContactOffsets = [];
                            selectedContacts = [];

                            updateContactsEarly();

                        }
                    }
                    $(document.body).off("mouseup.dropInactiveContact");
                    $(document.body).off("mousemove.dragInactiveContact");
                });
                $(document.body).on("mousemove.dragInactiveContact",function(event){
                    draggingContactsMouseOffset = {"x" : 100 * (event.offsetX / canvas.width()),"y" : 100 - (100 * (event.offsetY / canvas.height()))};
                });
            }
        }
    });
    sizeSlider.on("input",function(event){
        if(contactListSelectedContact != undefined){
            for(var i = 0;i < contacts.length;i++){
                if(contacts[i].GUID == contactListSelectedContact){
                    contacts[i].width = event.target.value;
                    contacts[i].height = event.target.value;
                }
            }
        }
    });
    imageDropdown.change(function(event){
        if(contactListSelectedContact != undefined){
            for(var i = 0;i < CompoundContactsArray.length;i++){
                if(CompoundContactsArray[i].GUID == contactListSelectedContact){
                    CompoundContactsArray[i].image = event.target.value;
                    updateContactsEarly();
                }
            }
        }
    });
    iconDropdown.change(function(event){
        if(contactListSelectedContact != undefined){
            for(var i = 0;i < CompoundContactsArray.length;i++){
                if(CompoundContactsArray[i].GUID == contactListSelectedContact){
                    CompoundContactsArray[i].icon = "Contacts/" + event.target.value;
                    updateContactsEarly();
                }
            }
        }
    });
    nameTextbox.change(function(event){
        if(contactListSelectedContact != undefined){
            for(var i = 0;i < CompoundContactsArray.length;i++){
                if(CompoundContactsArray[i].GUID == contactListSelectedContact){
                    CompoundContactsArray[i].name = event.target.value;
                    updateContactsEarly();
                }
            }
        }
    });
    canvas.contextmenu(function(event){
        var contactX = (event.offsetX / canvas.width()) * 100,
            contactY = (1 - (event.offsetY / canvas.height())) * 100;

        createExplosionAtPoint(contactX,contactY,.05);
        //addNewContact("odyssey",contactX,contactY,contactX,contactY,3,3,100,"Odyssey.png");
    });

    contactList_container.scroll(function(event){
        contactListScrollPosition = event.target.scrollTop;
    });

    duplicateContactButton.click(function(event){
        duplicateMode = !duplicateMode;
        deleteMode = false;
        updateContactEditorMode();
        if(duplicateMode){
            $(document).off("keyup.sensorsDuplicateDeleteCancel");
            $(document).on("keyup.sensorsDuplicateDeleteCancel",function(event){
               if(event.keyCode == 27){
                    duplicateMode = false;
                    updateContactEditorMode();
                    $(document).off("keyup.sensorsDuplicateDeleteCancel");
                }
            });
        }
    });

    unlockContactsWithMoveAllIcon.click(function(event){
        Interstellar.setDatabaseValue("sensors.lockContactsWithMoveAll",false);
    });
    lockContactsWithMoveAllIcon.click(function(event){
        Interstellar.setDatabaseValue("sensors.lockContactsWithMoveAll",true);
    });

    moveSelect.on("change",function(event){
        for(var i = 0;i < moveContactSpeeds.length;i++){
            if($(event.target).val() == moveContactSpeeds[i].speedName){
                moveContactSpeed = i;
            }
        }
    });

    deleteContactButton.click(function(event){
        duplicateMode = false;
        deleteMode = !deleteMode;
        updateContactEditorMode();
        if(deleteMode){
            $(document).off("keyup.sensorsDuplicateDeleteCancel");
            $(document).on("keyup.sensorsDuplicateDeleteCancel",function(event){
               if(event.keyCode == 27){
                    deleteMode = false;
                    updateContactEditorMode();
                    $(document).off("keyup.sensorsDuplicateDeleteCancel");
                }
            });
        }
    });
    editPresetsButton.click(function(event){ 
        presetWindow_selectedPresetIndex = -1;
        presetWindow_selectedPresetMask.css("display","block");
        Interstellar.openCoreWindow("Sensor_Core_PresetEditorWindow",event);
    });
    presetWindow_nameTextbox.on("change",function(event){
        if(presetWindow_selectedPresetIndex != -1){
            presets[presetWindow_selectedPresetIndex].presetName = event.target.value;
            Interstellar.setPresetValue("sensors.contactPresets",presets);
        }
    });
    presetWindow_deleteButton.click(function(event){
        if(presetWindow_selectedPresetIndex != -1){
            presets.splice(presetWindow_selectedPresetIndex,1);
            Interstellar.setPresetValue("sensors.contactPresets",presets);
        }
    });
    presetWindow_saveButton.click(function(event){
        var newPreset = {
            "presetName" : "Nameless Preset",
            "contacts" : contacts,
            "programs" : programs,
            "weapons" : weapons
        }
        presets.splice(presets.length,0,newPreset);
        presetWindow_selectedPresetIndex = presets.length - 1;
        Interstellar.setPresetValue("sensors.contactPresets",presets);
    });
    loadPresetButton.click(function(event){
        presetLoadWarningPopup.fadeIn();
        presetLoadWarningPopup_cancelButton.off();
        presetLoadWarningPopup_continueButton.off();
        let loadPreset = function(){
            var nameOfPreset = presetSelect.val();
            for(var i = 0;i < presets.length;i++){
                if(presets[i].presetName == nameOfPreset){
                    Interstellar.setDatabaseValue("sensors.contacts",presets[i].contacts);
                    Interstellar.setDatabaseValue("sensors.weapons",presets[i].weapons);
                    Interstellar.setDatabaseValue("sensors.programs",presets[i].programs);
                }
            }
        }
        $(document).off("keyup.sensorsConfirmLoadPreset");
        $(document).on("keyup.sensorsConfirmLoadPreset",function(event){
           if(event.keyCode == 13){
                loadPreset();
                $(document).off("keyup.sensorsConfirmLoadPreset");
                presetLoadWarningPopup_continueButton.off();
                presetLoadWarningPopup_cancelButton.off();
                presetLoadWarningPopup.fadeOut();
            }
        });
        presetLoadWarningPopup_cancelButton.click(function(event){
            $(document).off("keyup.sensorsConfirmLoadPreset");
            presetLoadWarningPopup_continueButton.off();
            presetLoadWarningPopup_cancelButton.off();
            presetLoadWarningPopup.fadeOut();
        });
        presetLoadWarningPopup_continueButton.click(function(event){
            $(document).off("keyup.sensorsConfirmLoadPreset");
            presetLoadWarningPopup_continueButton.off();
            presetLoadWarningPopup_cancelButton.off();
            presetLoadWarningPopup.fadeOut();
            loadPreset();
        });
    });
    $(".sensors_core_contactControls_programControls_programContainer").click(function(event){
        var programType = $(event.target).attr("programType");
        switch(programType){
            case "planet":
                Interstellar.openCoreWindow("Sensor_Core_PlanetEditorWindow",event);
            break;
            case "border":

            break;
            case "asteroid":

            break;
            case "nebula":
                if(nebulaProgramInterval != undefined){
                    $(event.target).css("filter", "brightness(1)");
                    clearInterval(nebulaProgramInterval);
                    nebulaProgramInterval = undefined;
                    return;
                }
                $(event.target).css("filter", "brightness(3)");
                let spawnFunction = function(){
                    var newPrograms = programs;
                    var nebulaCount = 0;
                    for(var i = 0;i < CompoundContactsArray.length;i++){
                        if(CompoundContactsArray[i].type == "nebula"){
                            nebulaCount++;
                        }
                    }
                    if(nebulaCount < maxNebulaCount){
                        for(var i = 0;i < Math.floor(Math.random() * 15) + 5;i++){
                            var size = (0.75 * Math.random()) + .5;
                            if(Math.random() > .7){
                                size = size * 3;
                            }
                            var newAsteroid = {
                                "GUID" : guidGenerator(),
                                "type" : "nebula",
                                "xPos" : 70 * Math.random() + 15,
                                "yPos" : 100 + (size * 100),
                                "size" : size,
                                "rotation" : 2 * Math.random(),
                                "rotationSpeed" : .003 * Math.random() - (.003 * Math.random()),
                                "nebulaIcon" : 0,
                                "color" : (-0.000005 * Math.random()) + (Math.PI * 2)
                            }
                            newPrograms.splice(programs.length,0,newAsteroid);
                        }
                        Interstellar.setDatabaseValue("sensors.programs",newPrograms);
                        updateContactsEarly();
                    }
                }  
                spawnFunction();
                nebulaProgramInterval = setInterval(function(){
                    spawnFunction();
                },10000);
            break;
            case "attackPattern":

            break;
            case "starbase":

            break;
        }
    });
    addContactButton.click(function(event){
        duplicateMode = false;
        deleteMode = false;
        addNewContact(defaultContactName,150,50,150,50,defaultContactSize,defaultContactSize,3000,defaultContactIcon,defaultContactImage,false);
        updateContactEditorMode();
    });
    moveAllCanvas.on("mousedown.moveAllCanvasDrag",function(event){
        let updateInterval = setInterval(function(){
            Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
        },0100);
        var radius = Math.min((moveAllCanvas.width() / 2) * .85,(moveAllCanvas.height() / 2) * .85);
        var mousePolarCords = cartesian2Polar(event.offsetX - radius - (radius / 2) + 4,event.offsetY - radius);
        moveAllDirection = mousePolarCords.radians + degreesToRadians(90);
        drawGUI();
        moveAllCanvas.on("mousemove.moveAllCanvasMouseMove",function(event){
            var radius = Math.min((moveAllCanvas.width() / 2) * .85,(moveAllCanvas.height() / 2) * .85);
            var mousePolarCords = cartesian2Polar(event.offsetX - radius - (radius / 2) + 4,event.offsetY - radius);
            moveAllDirection = mousePolarCords.radians + degreesToRadians(90);
            drawGUI();
            var polarToCart = polarToCartesian({"radians" : moveAllDirection - degreesToRadians(90),"distance" : moveAllPower});
            moveAllSpeeds =
            {
                "x" : -polarToCart.x,
                "y" : polarToCart.y
            }
        });
        moveAllCanvas.on("mouseup.endMoveAllCanvasDrag",function(event){
            moveAllCanvas.off("mousemove.moveAllCanvasMouseMove");
            moveAllCanvas.off("mouseup.endMoveAllCanvasDrag");
            var polarToCart = polarToCartesian({"radians" : moveAllDirection - degreesToRadians(90),"distance" : moveAllPower});
            moveAllSpeeds =
            {
                "x" : -polarToCart.x,
                "y" : polarToCart.y
            }
            Interstellar.setDatabaseValue("sensors.moveAllSpeeds",moveAllSpeeds);
            clearInterval(updateInterval);
        });
    });

    setInterval(function(){ 
        drawSensorsGui();
    },1000 / frameRate);
});