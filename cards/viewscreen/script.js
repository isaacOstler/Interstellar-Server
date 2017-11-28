var cardNumber = 0;
var picture = document.getElementById('picture');
var video = document.getElementById('video');
var source = document.createElement('source');

var binaryElement = $("#binary");
var progressBarFill = $("#progressBarFill"),
    progressBarElement = $("#progressBar"),
    progressBarTitle = $("#progressBarTitle"),
    contentArea = $("#contentArea"),
    gui = $("#GUI"),
    viewscreenArea = $("#viewscreenArea"),
    auxMedia = $("#auxMedia"),
    blackoutArea = $("#blackoutArea");

var binaryHTML = binaryElement.html();

var timer;
var systems = [];
var cardNumbersEntered = [];

var tacticalCards = getViewscreenTacticalCards();
var keyPressCallbacks = [];
var movingIconsObjects = [
    /*
        {
            "iconName" : "USS Voyager",
            "commands" : {xyz}
        }
    */
];
var tacticalMaster = getViewscreenTacticalMaster();
var velocity = {
        "x": 0,
        "y": 0
    },
    moveInterval = undefined,
    progressVelocity = 0,
    progressAmount = 0,
    progressInterval = undefined,
    defaultContentAreaStyle = 
    {
        "top" : 0,
        "left" : 0,
        "width" : 0,
        "height" : 0
    },
    typeInterval = undefined;

$(document).ready(function(event) {
    setDatabaseValue("viewscreen.tacticalMaster", tacticalMaster);
    loadCard(0); //load the first card
});

onDatabaseValueChange("viewscreen.forceToTacticalCard", function(newData) {
    if (newData == null) {
        return; //no command;
    }
    cardNumber = newData;
    loadCard(newData); //go to card
    setDatabaseValue("viewscreen.forceToTacticalCard", null); //reset
});

defaultContentAreaStyle.top = contentArea.position().top;
defaultContentAreaStyle.left = contentArea.position().left;
defaultContentAreaStyle.height = contentArea.height();
defaultContentAreaStyle.width = contentArea.width();

function loadCard(index) {
    movingIconsObjects = [];
    velocity.x = 0;
    velocity.y = 0;
    setDatabaseValue("viewscreen.currentCard", index);
    console.log(tacticalMaster);
    keyPressCallbacks = [];
    var movingIcons = document.getElementById("movingIcons");
    progressBarElement.css("display", "none");
    $("#auxHeader").css("display", "none");
    progressBarTitle.css("display", "none");
    while (movingIcons.hasChildNodes()) {
        movingIcons.removeChild(movingIcons.lastChild);
    }
    if (tacticalMaster.cards[index].auxType == "header") {
        $("#auxHeader").css("display", "block");
        $("#auxHeader").html("");
        //tacticalMaster.cards[index].auxMedia);
        let letterIndex = 0;
        let currentHTML = "";
        if(typeInterval != undefined){
            clearInterval(typeInterval);
        }
        typeInterval = setInterval(function() {
            if (letterIndex > tacticalMaster.cards[index].auxMedia.length - 1) {
                clearInterval(typeInterval);
                typeInterval = undefined;
                return;
            }
            var isTag = false;
            currentHTML += tacticalMaster.cards[index].auxMedia[letterIndex];
            if (tacticalMaster.cards[index].auxMedia[letterIndex] == "<") {
                isTag = true;
            }
            letterIndex++;
            var string
            while (isTag) {
                currentHTML += tacticalMaster.cards[index].auxMedia[letterIndex];
                if (tacticalMaster.cards[index].auxMedia[letterIndex] == ">") {
                    isTag = false;
                }
                letterIndex++;
            }
            console.log(currentHTML);
            $("#auxHeader").html(currentHTML);
        }, 0060);
    }
    if (tacticalMaster.cards[index].auxType == "progress-bar") {
        progressBarTitle.css("display", "block");
        progressBarElement.css("display", "block");
        progressAmount = 0;
        if (progressInterval != undefined) {
            clearInterval(progressInterval);
        }
        progressInterval = setInterval(function() {
            progressAmount += progressVelocity;
            progressBarFill.css("width", progressAmount * 100 + "%");
            progressBarTitle.html((progressAmount * 100).toFixed(2) + "% COMPLETE");
        }, 0010);
        $(document).off("keypress.progressVelocityChange");
        $(document).on("keypress.progressVelocityChange", function(event) {
            if (event.key == "d" || event.key == "D") {
                progressVelocity += .000003;
            } else if (event.key == "a" || event.key == "A") {
                progressVelocity -= .000003;
            } else if (event.key == "s" || event.key == "S") {
                progressVelocity = 0;
            }
        });
    }
    if (tacticalMaster.cards[index].cardType == "video") {
        //The card type is a video
        //display the video element
        $(picture).css("display", "none");
        $(video).css("display", "block");
        //remove any previous attributes
        while (video.hasChildNodes()) {
            video.removeChild(video.lastChild);
        }

        $(video).append("<source src='/streamVideo?cardIndex=" + index + "'>");

        //does the video loop?
        if (tacticalMaster.cards[index].loop == true) {
            console.log("this card does loop");
            $(video).prop("loop", "loop")
        } else {
            console.log("this card does NOT loop");
            $(video).prop("loop", "")
        }
        //does the video autoPlay?
        if (tacticalMaster.cards[index].autoPlay) {
            $(video).prop("autoplay", "autoplay")
        } else {
            $(video).removeProp("autoplay")

        }
        //should we automatically move to the next card when we are done playing this card?
        if (tacticalMaster.cards[index].autoNext) {
            console.log("auto next")
            //if so, add an event listner for this video
            $(video).on('ended', function() {
                console.log("Auto next to card " + cardNumber);
                //video has ended
                if (cardNumber + 1 > tacticalCards.length - 1) {
                    cardNumber = 0;
                } else {
                    cardNumber++;
                }
                console.log("Auto next to card " + cardNumber);
                loadCard(cardNumber);
            });
        } else {
            //otherwise, remove it
            $(video).off();
        }
        video.load();
    } else if (tacticalMaster.cards[index].cardType == "picture") {
        $(picture).css("display", "block");
        $(video).css("display", "none");
        //remove any previous attributes
        while (picture.hasChildNodes()) {
            picture.removeChild(picture.lastChild);
        }
        var backgroundImageUrl = "'/tacticalCard?cardIndex=" + index + "'";
        $(picture).append("<div class='picture' style=\"background-image:url(" + backgroundImageUrl + ")\"></div");
    }
    for (var i = 0; i < tacticalMaster.cards[index].movingIcons.length; i++) {
        var iconInfo = tacticalMaster.cards[index].movingIcons[i];
        var iconName = "movingIcon_" + i;
        var position = "position:absolute;top:" + iconInfo.startYPos + ";left:" + iconInfo.startXPos;
        var width = iconInfo.width;
        var height = iconInfo.height;
        var size = "width: " + width + "; height:" + height + ";z-index:2";
        var icon = "<div id='" + iconName + "' style='background-repeat:no-repeat;background-size:contain;background-image:url(" + iconInfo.image + ");" + position + "; " + size + "'></div>";
        var appendedIcon = $("#movingIcons").append(icon);
        var iconElement = document.getElementById("movingIcon_" + i);
        movingIconsObjects.splice(movingIconsObjects.length, 0, { "name": "USS Voyager", "element": iconElement, "commands": iconInfo.commands });
        pushKeypressCallback(function(e) {
            for (var i = 0; i < movingIconsObjects.length; i++) {
                var icon = movingIconsObjects[i];
                for (var j = 0; j < icon.commands.length; j++) {
                    var key = e.which || e.keyCode || 0;
                    if(icon.commands[j].command == "stop" && key == icon.commands[j].key){
                        velocity.y = 0;
                        velocity.x = 0;
                    }
                    if (icon.commands[j].command == "up" && key == icon.commands[j].key) {
                        velocity.y -= .01;
                        //var newPosition = $(icon.element).position().top - 2;
                        //console.log(newPosition + "px");
                        //$(icon.element).css("top",newPosition + "px");
                    }
                    if (icon.commands[j].command == "down" && key == icon.commands[j].key) {
                        velocity.y += .01;
                        //var newPosition = $(icon.element).position().top + 2;
                        //console.log(newPosition + "px");
                        //$(icon.element).css("top",newPosition + "px");
                    }
                    if (icon.commands[j].command == "left" && key == icon.commands[j].key) {
                        velocity.x -= .01;
                        //var newPosition = $(icon.element).position().left - 2;
                        //console.log(newPosition + "px");
                        //$(icon.element).css("left",newPosition + "px");
                    }
                    if (icon.commands[j].command == "right" && key == icon.commands[j].key) {

                        velocity.x += .01;
                        //var newPosition = $(icon.element).position().left + 2;
                        //console.log(newPosition + "px");
                        //$(icon.element).css("left",newPosition + "px");
                    }
                }
            }
        });
        if(moveInterval != undefined){
            clearInterval(moveInterval);
        }
        if(movingIconsObjects.length > 0){
            moveInterval = setInterval(function() {
                for (var i = 0; i < movingIconsObjects.length; i++) {
                    console.log("Woo");
                    var icon = movingIconsObjects[i];
                    var newX = $(icon.element).position().left + velocity.x;
                    var newY = $(icon.element).position().top + velocity.y;
                    $(icon.element).css("top", newY + "px");
                    $(icon.element).css("left", newX + "px");
                }
            }, 1000 / 60);
        }
    }
}

function pushKeypressCallback(callback) {
    keyPressCallbacks.splice(keyPressCallbacks.length, 0, callback);
}

$(document).keypress(function(event) {
    if ($.isNumeric(String.fromCharCode(event.which))) {
        cardNumbersEntered.splice(cardNumbersEntered.length, 0, String.fromCharCode(event.which));
        clearTimeout(timer);
        timer = setTimeout(function() {
            cardNumbersEntered = [];
        }, 7000);
    }
    for (var i = 0; i < keyPressCallbacks.length; i++) {
        var callback = keyPressCallbacks[i];
        callback(event);
    }
});

document.onkeydown = function(event) {
    var event = window.event ? window.event : e;
    //console.log(tacticalCards.length + " " + cardNumber);
    if (event.keyCode == 39) {
        if (cardNumber + 1 > tacticalCards.length - 1) {
            cardNumber = 0;
        } else {
            cardNumber++;
        }
    } else if (event.keyCode == 37) {
        if (cardNumber - 1 < 0) {
            cardNumber = tacticalCards.length - 1;
        } else {
            cardNumber--;
        }
    } else if (event.keyCode == 13) {
        //enter
        var number = "";
        for (var i = 0; i < cardNumbersEntered.length; i++) {
            number += cardNumbersEntered[i].toString();
        }
        cardNumber = (parseInt(number) - 1); //card 0 is 1, so we always subtract one number
        cardNumbersEntered = [];
        loadCard(cardNumber);
    } else if(event.keyCode == 70){ //press the f key
        if(contentArea.position().left == defaultContentAreaStyle.left){
            viewscreenArea.fadeOut(1000,function(){
                contentArea.animate({left : 0},function(){
                    auxMedia.fadeOut(1000);
                    contentArea.animate({top : 0});
                    contentArea.animate({width : $(document).width(),height : $(document).height()});
                });
                gui.fadeOut();
            });
        }else{
            contentArea.animate({"width" : (defaultContentAreaStyle.width / $(document).width()) * $(document).width()});
            setTimeout(function(){
                auxMedia.fadeIn();
            },0100);
            contentArea.animate({"height" : (defaultContentAreaStyle.height / $(document).height()) * $(document).height()},function(){
                contentArea.animate({"left" : defaultContentAreaStyle.left});
                gui.fadeIn();
                contentArea.animate({"top" : defaultContentAreaStyle.top},function(){
                    viewscreenArea.fadeIn();
                });
            });
        }
        return;
    }else if(event.keyCode == 66){
        if(blackoutArea.css("display") == "none"){
            blackoutArea.css("display","block");
        }else{
            blackoutArea.css("display","none");
        }
    }else if(event.keyCode == 86){
        if(blackoutArea.css("display") == "none"){
            blackoutArea.css("display","block");
        }else{
            blackoutArea.css("display","none");
        }
    }else {
        return;
    }
    loadCard(cardNumber)
}

function loadVideo(index) {
    console.log("Loading video " + index);
    while (video.hasChildNodes()) {
        video.removeChild(video.lastChild);
    }
    source.setAttribute('src', '/tacticalCard?cardIndex=' + cardNumber);
    video.appendChild(source);

    video.load();
    video.play();
}

//document.getElementById("stationName").innerHTML = getStation().toUpperCase();
onDatabaseValueChange("shields.shieldStrength", function(newData) {
    if (newData == null) {
        setDatabaseValue("shields.shieldStrength", [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        return;
    }
    shieldCanvas.width = $("#shipView").width() * .8;
    shieldCanvas.height = $("#shipView").height() * .8;
    var c = document.getElementById("shieldCanvas");
    var ctx = c.getContext("2d");

    var shieldNumber = 0;
    for (var i = 0; i < 1.8; i += .2) {
        var style = changeHue("#42d7f4", -220 - (-220 * newData[shieldNumber]));
        if (newData[shieldNumber] == 0) {
            style = "";
        }
        ctx.shadowBlur = 10;
        ctx.shadowColor = style;
        ctx.beginPath();
        ctx.arc(105, 155, 95, i * Math.PI, (i + .18) * Math.PI);
        ctx.lineCap = "round";
        ctx.strokeStyle = style;
        ctx.lineWidth = 3;
        ctx.stroke();
        shieldNumber++;
    }
});


onDatabaseValueChange("ship.systems", function(newData) {
    if (newData == null) {
        return; //the viewscreen does not handle setting up the database.
    }
    systems = newData;
    var html = "";
    var heightOfContainer = $("#systemStatus").height();
    var heightOfEachBox = (heightOfContainer - (newData.length * 5)) / newData.length;
    for (var i = 0; i < newData.length; i++) {
        var backgroundColor = "background-color:rgb(255, 209, 58)";
        if (systems[i].isDamaged) {
            var backgroundColor = "background-color:rgb(255, 0, 0)";
        }
        html += "<div class=\"systemTab\" style='height: " + heightOfEachBox + "px'>";
        html += "<div class=\"systemEffeciency\" style='height: " + heightOfEachBox + "px;" + backgroundColor + ";'></div>";
        if (i == 0) {
            html += "<div class=\"systemName\" style='border-radius: 0px 10px 0px 0px;height: " + heightOfEachBox + "px;" + backgroundColor + ";'>" + newData[i].systemName + "</div>"
            //html += "<div class=\"systemName\" style='border-radius: 0px 10px 0px 0px; height: " + heightOfEachBox + "px;" + backgroundColor + ";>" + newData[i].systemName + "</div>"
        } else if (i == (newData.length - 1)) {
            html += "<div class=\"systemName\" style='border-radius: 0px 0px 10px 0px; height: " + heightOfEachBox + "px;" + backgroundColor + "'>" + newData[i].systemName + "</div>"
        } else {
            html += "<div class=\"systemName\" style='height: " + heightOfEachBox + "px;" + backgroundColor + ";'>" + newData[i].systemName + "</div>"
        }
        html += "</div>"
        if (i != (newData.length - 1)) {
            html += "<div class=\"spacer\"></div>";
        }
    }

    $("#systemStatus").html(html);
    //add animation here
});

onDatabaseValueChange("ship.alertStatus", function(newData) {
    var redAlertInverseCContainer = "url('/resource?path=/public/inverse_c_container_red.png')";
    var yellowAlertinverseCContainer = "url('/resource?path=/public/inverse_c_container_yellow.png')";
    var inverseCContainer = "url('/resource?path=/public/inverse_c_container.png')";

    var redAlertConsole = "url('/resource?path=/public/o_container_red.png')";
    var yellowAlertConsole = "url('/resource?path=/public/o_container_yellow.png')";
    var Console = "url('/resource?path=/public/o_container.png')";

    var redAlertCContainer = "url('/resource?path=/public/c_container_red.png')";
    var yellowAlertCContainer = "url('/resource?path=/public/c_container_yellow.png')";
    var CContainer = "url('/resource?path=/public/c_container.png')";
    //document.getElementById("alertStatus").innerHTML = "ALERT STATUS: " + newData;
    if (newData == 1) {
        $(".inverse_c_container").css("border-image-source", redAlertInverseCContainer);
        $(".c_container").css("border-image-source", redAlertCContainer);
        $(".console_container").css("border-image-source", redAlertConsole);
    } else if (newData == 3) {
        $(".inverse_c_container").css("border-image-source", yellowAlertinverseCContainer);
        $(".c_container").css("border-image-source", yellowAlertCContainer);
        $(".console_container").css("border-image-source", yellowAlertConsole);
    } else {
        $(".inverse_c_container").css("border-image-source", inverseCContainer);
        $(".c_container").css("border-image-source", CContainer);
        $(".console_container").css("border-image-source", Console);

    }
});

function randomNumberBetweenBounds(min, max) {
    return Math.round(Math.random() * max) + min;
}
//setInterval(function(){
//    var randomNumber = randomNumberBetweenBounds(0,1);
//    binaryHTML = randomNumber += binaryHTML;
//    binaryElement.html(binaryHTML);

//},0100);

function changeHue(rgb, degree) {
    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    } else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string and returns an object
function rgbToHSL(rgb) {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (rgb.length == 3) {
        rgb = rgb.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(rgb.substr(0, 2), 16) / 255,
        g = parseInt(rgb.substr(2, 2), 16) / 255,
        b = parseInt(rgb.substr(4, 2), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    } else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    } else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    } else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    } else {
        s = (delta / (1 - Math.abs(2 * l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return rgbToHex(r, g, b);
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}