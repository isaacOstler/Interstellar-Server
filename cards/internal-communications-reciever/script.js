var ICR_CARD_CONTROLLER_CLASS = function(){
    //DOM references
    var canvas = $("#icr_popup_canvas"),
        phoneIcon_notConnected = $("#icr_popup_callbox_phoneIcon"),
        phoneIcon_connected = $("#icr_popup_callbox_phoneConnectedIcon"),
        phoneIcon_muted = $("#icr_popup_callbox_phoneMutedIcon"),
        header = $("#icr_popup_callbox_header"),
        box = $("#icr_popup_callbox"),
        hangupButton = $("#icr_popup_callbox_hangUpButton"),
        muteButton = $("#icr_popup_callbox_muteButton"),
        answerButton = $("#icr_popup_callbox_answerButton");

    //variables
    var drawCanvasInterval = undefined,
        incomingHailInterval = undefined,
        textDrawInterval = undefined,
        ringSpeed = 3500;

    //init calls
    animateIncomingHail();
    //database observers
    
    //preset observers

    //functions

    function clearCallAnimation(){
        if(incomingHailInterval != undefined){
            clearInterval(incomingHailInterval);
        }
        if(textDrawInterval != undefined){
            clearInterval(textDrawInterval);
        }
        header.html("INCOMING CALL");
    }

    function animateIncomingHail(){
        box.fadeIn();
        if(incomingHailInterval == undefined){
            Interstellar.playSoundEffect("hailing.wav");
            phoneIcon_notConnected.addClass("icr_popup_phoneAnimation");
            setTimeout(function(){
                phoneIcon_notConnected.removeClass("icr_popup_phoneAnimation");
            },ringSpeed * .9);

            incomingHailInterval = setInterval(function(){
                Interstellar.playSoundEffect("hailing.wav");
                phoneIcon_notConnected.addClass("icr_popup_phoneAnimation");
                setTimeout(function(){
                    phoneIcon_notConnected.removeClass("icr_popup_phoneAnimation");
                },ringSpeed * .9);
            },ringSpeed);
        }
        if(textDrawInterval == undefined){
            let dots = 0;
            textDrawInterval = setInterval(function(){
                dots++;
                if(dots > 3){
                    dots = 0;
                    header.html("INCOMING CALL")
                }else{
                    header.append(".");
                }
            },0800);
        }
    }
    //event handlers
    hangupButton.click(function(event){
        Interstellar.playSoundEffect("CallDisconnect.wav");
        box.addClass("icr_flashRedAnimation");
        clearCallAnimation();
        box.fadeOut();
    });
    answerButton.click(function(event){
        muteButton.fadeIn();
        answerButton.fadeOut();
        Interstellar.playSoundEffect("CallConnectLong.wav");
        phoneIcon_connected.fadeIn();
        phoneIcon_notConnected.fadeOut();
        phoneIcon_muted.fadeOut();
        clearCallAnimation();
    });
    muteButton.click(function(event){
        Interstellar.playSoundEffect("softCallDisconnect.wav")
        phoneIcon_muted.fadeIn();
        phoneIcon_notConnected.fadeOut();
        phoneIcon_connected.fadeOut();
    });
    //intervals
}

var icrClassInstance = new ICR_CARD_CONTROLLER_CLASS();