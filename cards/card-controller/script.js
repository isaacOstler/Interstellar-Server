var cardControllerClass = function(){
    //DOM references
    blackoutMask = $("#card-controller_blackout"),
    offlineElement = $("#card-controller_stationOffline"),
    sparkElement = $("#card-controller_spark");
    //variables
    numberOfSparkImages = 5;

    //init calls

    //database observers
    Interstellar.onDatabaseValueChange("cardController.state",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("cardController.state",[]);
            return;
        }
        for(var i = 0;i < newData.length;i++){
            if(newData[i].station == Interstellar.getStation()){
                var state = newData[i].state;
                if(state == "blackout"){
                    blackoutMask.css("display","block");
                }else{
                    blackoutMask.css("display","none");
                }

                if(state == "offline"){
                    offlineElement.slideDown();
                }else{
                    offlineElement.slideUp();
                }
                return;
            }
        }
        //if we get to this point, the station hasn't been listed yet
        newData.splice(newData.length,0,{"station" : Interstellar.getStation(),"state" : "online"});
        Interstellar.setDatabaseValue("cardController.state",newData);
    });
    Interstellar.onDatabaseValueChange("cardController.flash",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("cardController.flash","");
            return;
        }
        if(newData == "all stations" || newData == Interstellar.getStation()){
            if(newData == Interstellar.getStation()){
                Interstellar.setDatabaseValue("cardController.flash","");
            }else{
                //give the other stations some time to catch up, just in case
                setTimeout(function(){
                    Interstellar.setDatabaseValue("cardController.flash","");
                },0750);
            }
            let flashState = false,
                flashInterval = setInterval(function(){
                    if(flashState){
                        $(document.body).addClass("card-controller_invert");
                    }else{
                        $(document.body).removeClass("card-controller_invert");
                    }
                    flashState = !flashState;
                },0075);

            setTimeout(function(){
                clearInterval(flashInterval);
                $(document.body).removeClass("card-controller_invert");
            },1050);
        }
    });
    Interstellar.onDatabaseValueChange("cardController.spark",function(newData){
        if(newData == null){
            Interstellar.setDatabaseValue("cardController.spark","");
            return;
        }
        if(newData == "all stations" || newData == Interstellar.getStation()){
            Interstellar.playSoundEffect("spark.wav");
            if(newData == Interstellar.getStation()){
                Interstellar.setDatabaseValue("cardController.spark","");
            }else{
                //give the other stations some time to catch up, just in case
                setTimeout(function(){
                    Interstellar.setDatabaseValue("cardController.spark","");
                },0750);
            }
            sparkElement.fadeIn(200);
            let lastSpark = -1;
                sparkInterval = setInterval(function(){
                    var newSpark;
                    do{
                        newSpark = Math.floor(Math.random() * numberOfSparkImages);
                    }while(newSpark == lastSpark);
                    sparkElement.css("background-image","url(/resource?path=public/sparks/spark" + newSpark + ".png&screen=card-controller");
                },0075);

            setTimeout(function(){
                sparkElement.fadeOut(200,function(){
                    clearInterval(sparkInterval);
                });
            },1550);
        }
    });
    //preset observers

    //functions

    //event handlers

    //intervals
}

var cardControllerClassInstance = new cardControllerClass();
