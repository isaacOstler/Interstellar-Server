var ICR_CARD_CONTROLLER_CLASS = function(){
    var remote = require('electron').remote;
    var os = remote.require("os");

    //DOM references
    var canvas = $("#icr_popup_canvas"),
        phoneIcon_notConnected = $("#icr_popup_callbox_phoneIcon"),
        phoneIcon_connected = $("#icr_popup_callbox_phoneConnectedIcon"),
        phoneIcon_muted = $("#icr_popup_callbox_phoneMutedIcon"),
        header = $("#icr_popup_callbox_header"),
        subTitle = $("#icr_popup_callbox_roomHeader"),
        box = $("#icr_popup_callbox"),
        hangupButton = $("#icr_popup_callbox_hangUpButton"),
        muteButton = $("#icr_popup_callbox_muteButton"),
        answerButton = $("#icr_popup_callbox_answerButton");

    //variables
    var drawCanvasInterval = undefined,
        incomingHailInterval = undefined,
        textDrawInterval = undefined,
        ringSpeed = 3500,
        commLines = [],
        hostname = os.hostname(),
        thisDestination = 
        {
            "hostname" : hostname,
            "displayName" : hostname.replace(/.local/g,"").replace(/-/g," "),
            "callingFrom" : "UNKNOWN ROOM",
            "callState" : 0 //0 no call, 1 incoming call, 2 call connected, 3 call muted
        };

    //init calls

    //database observers
    Interstellar.onDatabaseValueChange("internalCommunications.commLines",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("internalCommunications.commLines",[thisDestination]);
            return;
        }
        commLines = newData;
        for(var i = 0;i < newData.length;i++){
            if(newData[i].hostname == thisDestination.hostname){
                //this is us
                thisDestination = newData[i];
                subTitle.html(thisDestination.callingFrom.toUpperCase());
                switch(thisDestination.callState){
                    case 0:
                        box.addClass("icr_flashRedAnimation");
                        setTimeout(function(event){
                            box.removeClass("icr_flashRedAnimation");
                        },3600);
                        //no call
                        header.html("CALL ENDED");
                        header.css("color","red");
                        clearCallAnimation();
                        box.fadeOut();
                        muteButton.html("MUTE");
                        hangupButton.html("REJECTED");
                    break;
                    case 1:
                        header.html("INCOMING CALL");
                        header.css("color","white");
                        //incoming call
                        muteButton.css("display","none");
                        answerButton.css("display","block");
                        phoneIcon_connected.css("display","none");
                        phoneIcon_notConnected.css("display","none");
                        phoneIcon_muted.css("display","none");

                        animateIncomingHail();
                        muteButton.html("MUTE");
                        hangupButton.html("REJECT");
                    break;
                    case 2:
                        header.html("LINE CONNECTED");
                        header.css("color","lime");
                        //call connected
                        muteButton.fadeIn();
                        answerButton.fadeOut();
                        phoneIcon_connected.fadeIn();
                        phoneIcon_notConnected.fadeOut();
                        phoneIcon_muted.fadeOut();
                        clearCallAnimation();
                        muteButton.html("MUTE");
                        hangupButton.html("HANG UP");
                    break;
                    case 3:
                        header.html("CALL MUTED");
                        header.css("color","orange");
                        //call muted

                        box.fadeIn();
                        phoneIcon_muted.fadeIn();
                        phoneIcon_notConnected.fadeOut();
                        phoneIcon_connected.fadeOut();
                        muteButton.html("UNMUTE");
                        hangupButton.html("HANG UP");
                    break;
                }
                return;
            }
        }
        //if we get to this point, our destination hasn't been listed
        newData.splice(newData.length,0,thisDestination);
        Interstellar.setDatabaseValue("internalCommunications.commLines",newData);
    });
    //preset observers

    //functions

    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function clearCallAnimation(){
        if(incomingHailInterval != undefined){
            clearInterval(incomingHailInterval);
            incomingHailInterval = undefined;
        }
        if(textDrawInterval != undefined){
            clearInterval(textDrawInterval);
            textDrawInterval = undefined;
        }
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
        for(var i = 0;i < commLines.length;i++){
            if(commLines[i].hostname == thisDestination.hostname){
                //this is us
                commLines[i].callState = 0;
                Interstellar.setDatabaseValue("internalCommunications.commLines",commLines);
            }
        }
    });
    answerButton.click(function(event){
        Interstellar.playSoundEffect("CallConnectLong.wav");
        for(var i = 0;i < commLines.length;i++){
            if(commLines[i].hostname == thisDestination.hostname){
                //this is us
                commLines[i].callState = 2;
                Interstellar.setDatabaseValue("internalCommunications.commLines",commLines);
            }
        }
    });
    muteButton.click(function(event){
        Interstellar.playSoundEffect("softCallDisconnect.wav");
        for(var i = 0;i < commLines.length;i++){
            if(commLines[i].hostname == thisDestination.hostname){
                //this is us
                if(commLines[i].callState == 2){
                    commLines[i].callState = 3;
                }else{
                    commLines[i].callState = 2;
                }
                Interstellar.setDatabaseValue("internalCommunications.commLines",commLines);
            }
        }
    });
    //intervals
}

var icrClassInstance = new ICR_CARD_CONTROLLER_CLASS();