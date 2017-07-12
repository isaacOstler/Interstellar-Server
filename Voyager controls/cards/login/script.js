var Login_LoginNamesArray = [];
var animatedOnce = false;
var opacity = 0;
var loggingIn = false;

$("#Login_stationName").html(getStation().toUpperCase());

onDatabaseValueChange("login.names",function(newValue){
	if(Array.isArray(newValue) == false){
		console.log("setting default value of login.names to [none]")
		setDatabaseValue("login.names",["none"]);
	}else{
		Login_LoginNamesArray = newValue;
		if(newValue != "none"){
			for(var i = 0;i < Login_LoginNamesArray.length;i++){
				console.log(getStation());
				if(Login_LoginNamesArray[i].station == getStation()){
					console.log(1);
					if(Login_LoginNamesArray[i].name != null && Login_LoginNamesArray[i].name != ""){
						console.log(2);
						$("#name").html("<h1>LOGGED IN AS " + Login_LoginNamesArray[i].name + "</h1>");
						loggingIn = !loggingIn;
						fadeMenuIn();
						return;
					}
				}
			}
		}
		$("#menu").css("opacity",0);
		$("#name").html("");
		$("#contentArea").css("width","50%");
		$("#contentArea").css("left","25%");
	}
});

$("#login_popupCancelButton").on("click",function(event){
	$("#login_popup").slideUp("fast");
	$("#login_popupNameTextBox").val("");
})

function enterKitHitToSubmitName(event){
	if(event.keyCode == 13){
		playRandomBeep();
		submitName();
	}
}

function submitName(){
	$("#login_popup").slideUp("fast");
	for(var i = 0;i < Login_LoginNamesArray.length;i++){
			if(Login_LoginNamesArray[i].station == getStation()){
				if(Login_LoginNamesArray[i].name != null && Login_LoginNamesArray[i].name != ""){
					var stationName = {
						"station" : getStation(),
						"name" : $("#login_popupNameTextBox").val()
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
				"name" : $("#login_popupNameTextBox").val()
			};
			Login_LoginNamesArray[0] = stationName;
			setDatabaseValue("login.names",Login_LoginNamesArray);
			return;
		}
		var stationName = {
			"station" : getStation(),
			"name" : $("#login_popupNameTextBox").val()
		};
		Login_LoginNamesArray.splice(Login_LoginNamesArray.length,0,stationName);
		setDatabaseValue("login.names",Login_LoginNamesArray);
}

function fadeMenuIn(){
	if(opacity > 100){
		$("#menu").css("opacity",0);
			//$("#contentArea").css("width","100%");
		}
		setTimeout(function(){
			console.log(opacity);
			if(loggingIn){
				opacity++;
				if(opacity > 100){
					return;
				}
			}else{
				opacity--;
				if(opacity < 0){
					return;
				}
			}
			$("#menu").css("opacity",opacity/100);
			//$("#contentArea").css("width",100 - (50*(opacity/100)) + "%");
			$("#contentArea").css("left",25 + (5*(opacity/100)) + "%");
				//$("#contentArea").css("width",100 - (50*(opacity/100)) + "%");
				fadeMenuIn();
			}, 00025);
	}
	$("#login_popupContinueButton").on("click",function(event){
		submitName();
	});

	$("#loginScreenLoginButton").on("click",function(event){

		$("#login_popup").slideDown("fast");
		$("#login_popupNameTextBox").focus();
	})