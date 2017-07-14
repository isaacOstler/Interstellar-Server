/*var Login_LoginNamesArray = [];
Interstellar.onDatabaseValueChange("login.names",function(newValue){
	if(Array.isArray(newValue) == false){
		console.log("setting default value of login.names to [none]")
		setDatabaseValue("login.names",["none"]);
	}else{
		Login_LoginNamesArray = newValue;
		if(newValue != "none"){
			for(var i = 0;i < Login_LoginNamesArray.length;i++){
				if(Login_LoginNamesArray[i].station == getStation()){
					if(Login_LoginNamesArray[i].name != null && Login_LoginNamesArray[i].name != ""){
						$("#counter").html("<h1>LOGGED IN AS " + Login_LoginNamesArray[i].name + "</h1>");
						fadeMenuIn();
						return;
					}
				}
			}
		}
		$("#menu").css("opacity",0);
		$("#counter").html("NO USER LOGGED IN");
	}
});

var opacity = 0;
function fadeMenuIn(){
	if(opacity > 100){
		$("#menu").css("opacity",0);
		$("#contentArea").css("left","25%");
		//$("#contentArea").css("width","100%");
	}
	setTimeout(function(){
		opacity++;
		if(opacity > 100){
			return;
		}
		$("#menu").css("opacity",opacity/100);
		$("#contentArea").css("left",25 + (5*(opacity/100)) + "%");
		//$("#contentArea").css("width",100 - (50*(opacity/100)) + "%");
		fadeMenuIn();
	}, 0050);
}

$("#loginScreenLoginButton").on("click",function(event){
	for(var i = 0;i < Login_LoginNamesArray.length;i++){
		if(Login_LoginNamesArray[i].station == getStation()){
			if(Login_LoginNamesArray[i].name != null && Login_LoginNamesArray[i].name != ""){
				var stationName = {
					"station" : getStation(),
					"name" : $("#loginScreenLoginTextfield").val()
				};
				Login_LoginNamesArray[i] = stationName;
				setDatabaseValue("login.names",Login_LoginNamesArray);
				return;
			}
		}
	}
	if(Login_LoginNamesArray[0] == "none"){	
		var stationName = {
			"station" : getStation(),
			"name" : $("#loginScreenLoginTextfield").val()
		};
		Login_LoginNamesArray[0] = stationName;
		setDatabaseValue("login.names",Login_LoginNamesArray);
		return;
	}
	var stationName = {
		"station" : getStation(),
		"name" : $("#loginScreenLoginTextfield").val()
	};
	Login_LoginNamesArray.splice(Login_LoginNamesArray.length,0,stationName);
	setDatabaseValue("login.names",Login_LoginNamesArray);
})*/