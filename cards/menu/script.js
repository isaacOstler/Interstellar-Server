document.getElementById("stationName").innerHTML = Interstellar.getStation().toUpperCase();
Interstellar.onDatabaseValueChange("ship.alertStatus",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("ship.alertStatus",5);
		return;
	}
	var alertStatusURL = "/resource?path=public/alertStatus" + newData + ".png&screen=menu";

	$("#bodyFrame").css("border-image-source","url(" + alertStatusURL + ")");

	switch(Number(newData)){
		case 1:
			$("#menu_background").css("background","linear-gradient(to bottom, rgba(62, 14, 14, 0.87), rgba(49, 57, 60, 0.5))");
			$(document.body).css("background","linear-gradient(to bottom, #380000, black)");
			$("#menu_alertStatus_element").css("background","linear-gradient(to right, rgb(134, 25, 25), rgba(125, 0, 0, 0.53))");
		break;
		case 2:
			$("#menu_background").css("background","linear-gradient(to bottom, rgba(76, 52, 32, 0.87), rgba(49, 57, 60, 0.5))");
			$(document.body).css("background","linear-gradient(to bottom, #381d05, black)");
			$("#menu_alertStatus_element").css("background","linear-gradient(to right, rgba(208, 173, 0, 0.6), rgba(125, 75, 0, 0.53))");
		break;
		case 3:
			$("#menu_background").css("background","inear-gradient(to bottom, rgba(60, 56, 39, 0.87), rgba(49, 57, 60, 0.5))");
			$(document.body).css("background","linear-gradient(to bottom, #382805, black)");
			$("#menu_alertStatus_element").css("background","linear-gradient(to right, rgba(208, 192, 0, 0.6), rgba(125, 81, 0, 0.53))");
		break;
		case 4:
			$("#menu_background").css("background","linear-gradient(to bottom, rgba(39, 60, 58, 0.87), rgba(49, 57, 60, 0.5))");
			$(document.body).css("background","linear-gradient(to bottom, #00323e, black)");
			$("#menu_alertStatus_element").css("background","linear-gradient(to right, rgba(0, 208, 170, 0.6), rgba(0, 125, 120, 0.53))");
		break;
		case 5:
			$("#menu_background").css("background","");
			$(document.body).css("background","");
			$("#menu_alertStatus_element").css("background","");
		break;
		default:
			$("#menu_background").css("background","");
			$(document.body).css("background","");
			$("#menu_alertStatus_element").css("background","");
		break;
	}
	$(document.body).css("background-repeat","no-repeat");
	$(document.body).css("background-attachment","fixed");
	$("#menu_alertStatus_element").html("ALERT STATUS " + newData);
});
var MENU_IS_LOGGED_IN_BOOL = true;
Interstellar.onDatabaseValueChange("ship.loginNames",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("ship.loginNames",[]);
		return;
	}
	var loginNames = newData;
	var station = Interstellar.getStation();
	for(var i = 0;i < loginNames.length;i++){
		if(loginNames[i].station == station){
			if(!MENU_IS_LOGGED_IN_BOOL){
				//just logged in!
				MENU_IS_LOGGED_IN_BOOL = true;
				$("#contentArea").animate({width : $(window).width() * .88 - 310});
				$("#menu").animate({right : 0});
				$("#mc_card_controller_container").fadeIn();
			}
			return;
		}
	}
	if(MENU_IS_LOGGED_IN_BOOL){
		//just logged out!
		if(false){
			console.warn("Menu set screen when login not found has been disabled!");
			return;
		}
		MENU_IS_LOGGED_IN_BOOL = false;
		var currentScreen = Interstellar.getCurrentScreen();
		setTimeout(function(){
			$("#contentArea").animate({width : $(document).width() * .88});
		},0100);
		$("#menu").animate({right : -310});
		$("#mc_card_controller_container").fadeOut();
		if(currentScreen != "Login"){
			Interstellar.setCurrentScreen("Login");
		}
	}
});
$("#menu_notificationFeed").css("height", ($("#menu").height() - 120 - ($("#realMenu").height() + 160)) + "px");