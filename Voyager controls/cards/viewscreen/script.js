
var cardNumber = 0;
var picture = document.getElementById('picture');
var video = document.getElementById('video');
var source = document.createElement('source');

var timer;
var cardNumbersEntered = [];

var tacticalCards = getViewscreenTacticalCards();
var keyPressCallbacks = [];
var movingIconsObjects = 
[
    /*
        {
            "iconName" : "USS Voyager",
            "commands" : {xyz}
        }
        */
        ];
var tacticalMaster = getViewscreenTacticalMaster();
$(document).ready(function(event){
    loadCard(0); //load the first card
});

        function loadCard(index){
            console.log(tacticalMaster);
            keyPressCallbacks = [];
            var movingIcons = document.getElementById("movingIcons");
            while (movingIcons.hasChildNodes()) {
                movingIcons.removeChild(movingIcons.lastChild);
            }
            if(tacticalMaster.cards[index].auxType == "header"){
                $("#auxHeader").html(tacticalMaster.cards[index].auxMedia);
            }
            if(tacticalMaster.cards[index].cardType == "video"){
            //The card type is a video
            //display the video element
            $(picture).css("display","none");
            $(video).css("display","block");
            //remove any previous attributes
            while (video.hasChildNodes()) {
                video.removeChild(video.lastChild);
            }

            $(video).append("<source src='/tacticalCard?cardIndex=" + index + "'>");

                //does the video loop?
                if(tacticalMaster.cards[index].loop){
                    $(video).prop( "loop","loop")
                }else{
                    $(video).removeProp( "loop")
                }
                //does the video autoPlay?
                if(tacticalMaster.cards[index].autoPlay){
                    $(video).prop( "autoplay","autoplay")
                }else{
                    $(video).removeProp( "autoplay" )

                }
                //should we automatically move to the next card when we are done playing this card?
                if(tacticalMaster.cards[index].autoNext){
                    //if so, add an event listner for this video
                    $(video).on('ended',function(){
                        //video has ended
                        if(cardNumber + 1 > tacticalCards.length - 1){
                            cardNumber = 0;
                        }else{
                            cardNumber++;
                        }
                        console.log("Auto next to card " + cardNumber);
                        loadCard(cardNumber);
                    });
                }else{
                    //otherwise, remove it
                    $(video).off();
                }
                video.load();
            }else if(tacticalMaster.cards[index].cardType == "picture"){
                $(picture).css("display","block");
                $(video).css("display","none");
            //remove any previous attributes
                while (picture.hasChildNodes()) {
                    picture.removeChild(picture.lastChild);
                }
                var backgroundImageUrl = "'/tacticalCard?cardIndex=" + index + "'";
                $(picture).append("<div class='picture' style=\"background-image:url(" + backgroundImageUrl + ")\"></div");
        }
        for(var i = 0;i < tacticalMaster.cards[index].movingIcons.length;i++){
                    var iconInfo = tacticalMaster.cards[index].movingIcons[i];
                    var iconName = "movingIcon_" + i;
                    var position = "position:absolute;top:" + iconInfo.startYPos + ";left:" + iconInfo.startXPos;
                    var width = iconInfo.width;
                    var height = iconInfo.height;
                    var size = "width: " + width + "; height:" + height + ";z-index:2";
                    var icon = "<div id='" + iconName + "' style='background-repeat:no-repeat;background-size:contain;background-image:url(" + iconInfo.image + ");" + position + "; " + size + "'></div>";
                    var appendedIcon = $("#movingIcons").append(icon);
                    var iconElement = document.getElementById("movingIcon_" + i);
                    movingIconsObjects.splice(movingIconsObjects.length,0,{"name" : "USS Voyager","element" : iconElement,"commands" : iconInfo.commands});
                    pushKeypressCallback(function(e){
                        for(var i = 0;i < movingIconsObjects.length;i++){
                            var icon = movingIconsObjects[i];
                            for(var j = 0;j < icon.commands.length;j++){
                                var key = e.which || e.keyCode || 0;
                                console.log(key);
                                if(icon.commands[j].command == "up" && key == icon.commands[j].key){
                                    var newPosition = $(icon.element).position().top - 2;
                                    //console.log(newPosition + "px");
                                    $(icon.element).css("top",newPosition + "px");
                                }
                                if(icon.commands[j].command == "down" && key == icon.commands[j].key){
                                    var newPosition = $(icon.element).position().top + 2;
                                    //console.log(newPosition + "px");
                                    $(icon.element).css("top",newPosition + "px");
                                }
                                if(icon.commands[j].command == "left" && key == icon.commands[j].key){
                                    var newPosition = $(icon.element).position().left - 2;
                                    //console.log(newPosition + "px");
                                    $(icon.element).css("left",newPosition + "px");
                                }
                                if(icon.commands[j].command == "right" && key == icon.commands[j].key){
                                    var newPosition = $(icon.element).position().left + 2;
                                    //console.log(newPosition + "px");
                                    $(icon.element).css("left",newPosition + "px");
                                }
                            }
                        }
                    });
                }
    }

    function pushKeypressCallback(callback){
        keyPressCallbacks.splice(keyPressCallbacks.length,0,callback);
    }

    $(document).keypress(function(event){
        if($.isNumeric( String.fromCharCode(event.which) )){
            cardNumbersEntered.splice(cardNumbersEntered.length,0,String.fromCharCode(event.which));
            clearTimeout(timer);
            timer = setTimeout(function(){
                cardNumbersEntered = [];
            },7000);
        }
        for(var i = 0;i < keyPressCallbacks.length;i++){
            var callback = keyPressCallbacks[i];
            callback(event);
        }
    });

    document.onkeydown = function(event){
        var event = window.event ? window.event : e;
            //console.log(tacticalCards.length + " " + cardNumber);
            if(event.keyCode == 39){
                if(cardNumber + 1 > tacticalCards.length - 1){
                    cardNumber = 0;
                }else{
                    cardNumber++;
                }
            }else if(event.keyCode == 37){
                if(cardNumber - 1 < 0){
                    cardNumber = tacticalCards.length - 1;
                }else{
                    cardNumber--;
                }
            }else if(event.keyCode == 13){
                //enter
                var number = "";
                for(var i = 0;i < cardNumbersEntered.length;i++){
                    number += cardNumbersEntered[i].toString();
                }
                cardNumber = (parseInt(number) - 1); //card 0 is 1, so we always minus one number
                cardNumbersEntered = [];
                loadCard(cardNumber);
            }else{
                return;
            }
            loadCard(cardNumber)
        }

        function loadVideo(index){
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
        onDatabaseValueChange("shields.shieldStatus",function(newData){

            var c = document.getElementById("shieldCanvas");
            var ctx = c.getContext("2d");

            for(var i = 0; i < 1.8; i += .2){
                var style = "blue";
                ctx.beginPath();
                ctx.arc(105, 155, 95, i * Math.PI, (i + .18) * Math.PI);
                ctx.lineCap="round";
                ctx.strokeStyle=style;
                ctx.lineWidth = 3;
                ctx.stroke();
            }



        })
        onDatabaseValueChange("systems.efficency",function(newData){
            if(newData == null){
                return; //the viewscreen does not handle setting up the database.
            }
            var html = "";
            var heightOfContainer = $("#systemStatus").height();
            var heightOfEachBox = (heightOfContainer - (newData.length * 5)) / newData.length;
            for(var i = 0;i < newData.length;i++){
                html += "<div class=\"systemTab\" style='height: " + heightOfEachBox + "px'>";
                html += "<div class=\"systemEffeciency\" style='height: " + heightOfEachBox + "px'>" + newData[i].systemEfficency + "%</div>";
                if(i == 0){
                    html += "<div class=\"systemName\" style='border-radius: 0px 10px 0px 0px; height: " + heightOfEachBox + "px'>" + newData[i].systemName + "</div>"
                }else if(i == (newData.length - 1)){
                    html += "<div class=\"systemName\" style='border-radius: 0px 0px 10px 0px; height: " + heightOfEachBox + "px'>" + newData[i].systemName + "</div>"
                }else{
                    html += "<div class=\"systemName\" style='height: " + heightOfEachBox + "px'>" + newData[i].systemName + "</div>"
                }
                html += "</div>"
                if(i != (newData.length - 1)){
                    html += "<div class=\"spacer\"></div>";
                }
            }
            $("#systemStatus").html(html);
        })
        onDatabaseValueChange("ship.alertStatus",function(newData){
            var redAlertInverseCContainer = "url('/resource?path=/public/inverse_c_container_red.png')";
            var yellowAlertinverseCContainer = "url('/resource?path=/public/inverse_c_container_yellow.png')";
            var inverseCContainer = "url('/resource?path=/public/inverse_c_container.png')";

            var redAlertCContainer = "url('/resource?path=/public/c_container_red.png')";
            var yellowAlertCContainer = "url('/resource?path=/public/c_container_yellow.png')";
            var CContainer = "url('/resource?path=/public/c_container.png')";
            //document.getElementById("alertStatus").innerHTML = "ALERT STATUS: " + newData;
            if(newData == 1){
                $(".inverse_c_container").css("border-image-source",redAlertInverseCContainer);
                $(".c_container").css("border-image-source",redAlertCContainer);
            }else if(newData == 3){
                $(".inverse_c_container").css("border-image-source",yellowAlertinverseCContainer);
                $(".c_container").css("border-image-source",yellowAlertCContainer);
            }else{
                $(".inverse_c_container").css("border-image-source",inverseCContainer);
                $(".c_container").css("border-image-source",CContainer);

            }
        });
