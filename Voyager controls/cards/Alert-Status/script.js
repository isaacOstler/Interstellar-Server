var video = document.getElementById('video');
var source = document.createElement('source');

var trainingModeActive = true;

source.setAttribute('src', '/resource?path=public/AlertStatus1.mov');

video.appendChild(source);
video.play();

onDatabaseValueChange("ship.trainingMode",function(newData){
    trainingModeActive = newData;
    if(newData){
        $("#training").css("display","block");
        $("#contentArea").css("opacity",".5");
    }else{
        $("#training").css("display","none");
        $("#contentArea").css("opacity","1");
    }
})

$("#alertStatus5Button").on("click",function(){
    setDatabaseValue("ship.alertStatus",5);
    if(trainingModeActive && tutorialStep == 6){
        tutorialStep++;
        loadCurrentTutorialText(3);
    }
})
$("#alertStatus4Button").on("click",function(){
    setDatabaseValue("ship.alertStatus",4);
    if(trainingModeActive && tutorialStep == 2){
        tutorialStep++;
        loadCurrentTutorialText(3);
    }
})
$("#alertStatus3Button").on("click",function(){
    setDatabaseValue("ship.alertStatus",3);
    if(trainingModeActive && tutorialStep == 3){
        tutorialStep++;
        loadCurrentTutorialText(3);
    }
})
$("#alertStatus2Button").on("click",function(){
    setDatabaseValue("ship.alertStatus",2);
    if(trainingModeActive && tutorialStep == 4){
        tutorialStep++;
        loadCurrentTutorialText(3);
    }
})
$("#alertStatus1Button").on("click",function(){
    setDatabaseValue("ship.alertStatus",1);
    if(trainingModeActive && tutorialStep == 5){
        tutorialStep++;
        loadCurrentTutorialText(3);
    }
})

onDatabaseValueChange("ship.alertStatus",function(newData){
    loadCorrectVideo(newData);
    $("#alertStatus" + 1).css("background","");
    $("#alertStatus" + 2).css("background","");
    $("#alertStatus" + 3).css("background","");
    $("#alertStatus" + 4).css("background","");
    $("#alertStatus" + 5).css("background","");
    var cssBackground = "linear-gradient(to right, rgba(21, 150, 219,.55), rgba(99, 175, 216, .25))";
    var cssTextColor = "rgb(21, 150, 219)";
    switch(newData){
        case 1:
        cssBackground = "linear-gradient(to right, rgba(229, 44, 11,.55), rgba(183, 96, 80, .25))";
        cssTextColor = "rgb(229, 44, 11)";
        break
        case 2:
        cssBackground = "linear-gradient(to right, rgba(219, 92, 28,.55), rgba(188, 119, 84, .25))";
        cssTextColor = "rgb(219, 92, 28)";
        break;
        case 3:
        cssBackground = "linear-gradient(to right, rgba(247, 230, 49,.55), rgba(206, 197, 101, .25))";
        cssTextColor = "rgb(247, 230, 49)";
        break;
        case 4:
        cssBackground = "linear-gradient(to right, rgba(40, 239, 189,.55), rgba(136, 216, 196, .25))";
        cssTextColor = "rgb(40, 239, 189)";
        break;
    }
    $("#selectedAlertStatus").html("ALERT STATUS: " + newData);
    $("#selectedAlertStatus").css("color",cssTextColor);
    $("#alertStatus" + newData).css("background",cssBackground);
})

tutorialStep = 0;

function nextTutorialText(track){
    tutorialStep++;
    checkTutorialStepEvents(track);
    loadCurrentTutorialText(track);
}
function previousTutorialText(track){
    tutorialStep--;
    checkTutorialStepEvents(track);
    loadCurrentTutorialText(track);
}

function checkTutorialStepEvents(track){
    switch(track){
        case 1:

        break;
        case 2:

        break;
        case 3:
            if(tutorialStep == 0){
                $("#contentArea").css("opacity",".5");
                setDatabaseValue("ship.alertStatus",5);
            }
            if(tutorialStep == 2){
                $("#contentArea").css("opacity","1");
            }
        break;
    }
}

function loadCurrentTutorialText(track){
    switch(track){
        case 1:

        break;
        case 2:

        break;
        case 3:
            $("#tutorialStepAdvanced" + (tutorialStep - 1)).css("display","none");
            $("#tutorialStepAdvanced" + tutorialStep).css("display","block");
            $("#tutorialStepAdvanced" + (tutorialStep + 1)).css("display","none");
        break;
    }
}

function restartTutorial(track){
    $("#tutorialStepAdvanced" + tutorialStep).css("display","none");
    tutorialStep = 0;
    loadCurrentTutorialText(track);
}

function loadCorrectVideo(alertStatus){
    video.pause();
    while (video.hasChildNodes()) {
    	video.removeChild(video.lastChild);
    }
    source.setAttribute('src', "/resource?path=public/AlertStatus" + alertStatus + ".mov");
    video.appendChild(source);

    video.load();
    video.play();

}