Interstellar.addCoreWidget("Login Names",function(){
	var thisWidget = this;

	//variables
	var loginNames = [],
		flashInterval = undefined,
		captainName = "";

	//DOM References
	var widgetElement = $("#Login_Names-Core-Widget"),
		listElement = $("#Login_Names-Core-Widget_LoginList"),
		setCaptainsNameButtonElement = $("#Login_Names-Core-Widget_setCaptainNameButton"),
		setCaptainsNameTextboxElement = $("#Login_Names-Core-Window_setCaptainsName_textbox"),
		setCaptainsNameSubmitButton = $("#Login_Names-Core-Window_setCaptainsName_submitButton");
	//init calls
	drawGUI();

	//interstellar calls
	thisWidget.onResize = function(){
		drawGUI();
	}

	//functions

	function drawGUI(){
		listElement.css("font-size",listElement.width() / 12);
	}

	function flash(){
		if(flashInterval != undefined){
			clearInterval(flashInterval);
			flashInterval = undefined;
		}
		let flashState = false;
		let numberOfFlashes = 0;
		let maxNumberOfFlashes = 10;
		flashInterval = setInterval(function(){
			if(numberOfFlashes >= maxNumberOfFlashes){
				clearInterval(flashInterval);
				flashInterval = undefined;
				return;
			}
			if(flashState){
				widgetElement.removeClass("login_core_flashClass");
				numberOfFlashes++;
				flashState = false;
			}else{
				widgetElement.addClass("login_core_flashClass");
				flashState = true;
			}
		},0100);
	}

	function compare(a,b) {
  		if (a.station < b.station)
    		return -1;
  		if (a.station > b.station)
   			return 1;
  		return 0;
	}

	function drawList(){
		listElement.html("");
		for(var i = 0;i < loginNames.length;i++){
			listElement.append(loginNames[i].station + ": " + loginNames[i].loginName + "<br />");
		}
		if(captainName != ""){
			listElement.append("CAPTAIN: " + captainName);
		}
	}
	//preset observers

	//database observers
	Interstellar.onDatabaseValueChange("ship.loginNames",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("ship.loginNames", []);
			return;
		}
		if(newData.length > 0 && loginNames.length != newData.length){
			//something significant changed, flash
			//this widget to let the flight director know
			flash();
		}
		loginNames = newData;
		loginNames.sort(compare);
		drawList();
	});
	Interstellar.onDatabaseValueChange("ship.captainName",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("ship.captainName","");
			return;
		}
		captainName = newData;
		drawList();
	});

	//event handlers
	setCaptainsNameButtonElement.click(function(event){
		Interstellar.openCoreWindow("Login_Names-Core-Window_setCaptainsName",event);
	});

	setCaptainsNameSubmitButton.click(function(event){
		Interstellar.setDatabaseValue("ship.captainName",setCaptainsNameTextboxElement.val());
		Interstellar.closeCoreWindow("Login_Names-Core-Window_setCaptainsName",event);
	});
});