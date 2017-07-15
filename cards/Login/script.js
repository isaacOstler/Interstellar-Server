//variables
var isLoggedIn = false,
	loginNames = [];

//DOM Refrences

var loginButton = $("#loginButton"),
	loginBox = $("#loginBox"),
	loginBoxHeader = $("#loginBoxHeader"),
	loginBoxTextbox = $("#loginBoxTextbox"),
	loginBoxLoginButton = $("#loginBoxLoginButton"),
	logo = $("#logo"),
	loginNameHeader = $("#loginNameHeader");

//preset obeservers

//database observers
Interstellar.onDatabaseValueChange("ship.loginNames",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("ship.loginNames",[]);
		return;
	}
	loginNames = newData;
	station = Interstellar.getStation();
	for(var i = 0;i < loginNames.length;i++){
		if(loginNames[i].station == station){
			if(!isLoggedIn){
				logo.animate({top : "5%"});
				isLoggedIn = true;
				loginNameHeader.html("Welcome Aboard, " + (loginNames[i].loginName.charAt(0).toUpperCase() + loginNames[i].loginName.slice(1)));
				loginNameHeader.fadeIn();
				loginButton.html("LOGOUT");
			}
			return;
		}
	}
	if(isLoggedIn){
		logo.animate({top : "15%"});
		isLoggedIn = false;
		loginNameHeader.fadeOut();
		loginButton.html("LOGIN");
	}
});

//event listeners
loginButton.click(function(event){
	if(!isLoggedIn){
		//login
		loginBox.css("height","5%");
		loginBox.fadeIn();
		loginBox.animate({height : "22%"},0500,function(){
			loginBoxHeader.fadeIn();
			loginBoxTextbox.slideDown();
			loginBoxLoginButton.slideDown();
		});
	}else{
		//logout
		var station = Interstellar.getStation();
		for(var i = 0;i < loginNames.length;i++){
			if(loginNames[i].station == station){
				loginNames.splice(i,1);
				Interstellar.setDatabaseValue("ship.loginNames",loginNames);
				return;
			}
		}
	}
});
loginBoxLoginButton.click(function(event){
	var name = loginBoxTextbox.val();
	var station = Interstellar.getStation();
	var loginObject = {
		"station" : station,
		"loginName" : name
	}
	Interstellar.playSoundEffect("login.wav");
	loginBoxHeader.fadeOut();
	loginBoxTextbox.fadeOut();
	loginBoxLoginButton.fadeOut();
	loginBox.slideUp();
	for(var i = 0;i < loginNames.length;i++){
		if(loginNames[i].station == station){
			loginNames[i] = loginObject;
			Interstellar.setDatabaseValue("ship.loginNames",loginNames);
			return;
		}
	}
	loginNames.splice(loginNames.length,0,loginObject);
	Interstellar.setDatabaseValue("ship.loginNames",loginNames);
});