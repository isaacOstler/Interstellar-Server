//DOM Refrences
var alertStatusContainer = $("#alertStatusContainer"),
    alertStatusHeader_text = $("#alertStatusHeader_text");

//variables
var alertStatus = 5,
    alertStatusTypes = [];

//init calls

$.getJSON('/resource?path=public/alertStatus.json', function(jsonFile) {
    alertStatusTypes = jsonFile.alertStatusTypes;
    drawAlertStatus();
    return;
});
//preset obeservers

//database observers
Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
    if(newData == null){
        Interstellar.setDatabaseValue("ship.alertStatus",alertStatus);
        return;
    }
    alertStatus = newData;
    drawAlertStatus();
});
//functions
function drawAlertStatus(){
    var html = "";
    for(var i = 0;i < alertStatusTypes.length;i++){
        html += '<div index="' + alertStatusTypes[i].value + '" class="alertStatus beepOnClick" style="background: linear-gradient(-90deg, ' + alertStatusTypes[i].color1 + ', ' + alertStatusTypes[i].color2 + ');' + (alertStatus == alertStatusTypes[i].value ? "filter:brightness(1.5);" : "") + '">';
        html += '<div index="' + alertStatusTypes[i].value + '" class="alertStatus_header beepOnClick">' + alertStatusTypes[i].name + '</div>';
        html += '<div index="' + alertStatusTypes[i].value + '" class="alertStatus_body beepOnClick">' + alertStatusTypes[i].text + '</div>'
        html += '</div>';
        if(alertStatus == alertStatusTypes[i].value){
            alertStatusHeader_text.html(alertStatusTypes[i].name.toUpperCase());
            alertStatusHeader_text.css("color",alertStatusTypes[i].color1);
        }
    }
    alertStatusContainer.html(html);
    $(".alertStatus").off();
    $(".alertStatus").click(function(event){
        Interstellar.playRandomBeep();
        Interstellar.setDatabaseValue("ship.alertStatus",Number($(event.target).attr("index")));
    });
}

//event listeners

//intervals