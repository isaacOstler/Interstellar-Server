Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("ship.alertStatus",5);
		return;
	}
	$("#Alert_Status_Core_Alert_Label").html(newData);
	Interstellar.say("Alert Status " + newData);
	if(newData == 1){
		$("#Alert_Status_Core_Alert_Label").css("color","red");
	}
	if(newData == 2){
		$("#Alert_Status_Core_Alert_Label").css("color","#ff8a47");
	}
	if(newData == 3){
		$("#Alert_Status_Core_Alert_Label").css("color","#ffe947");
	}
	
	if(newData == 4){
		$("#Alert_Status_Core_Alert_Label").css("color","#49ffaa");
	}
	
	if(newData == 5){
		$("#Alert_Status_Core_Alert_Label").css("color","#49e6ff");
	}
});

$(".alertStatusButton").on("click",function(event){
	Interstellar.setDatabaseValue("ship.alertStatus",event.target.innerHTML);
})