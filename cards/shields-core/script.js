var shields_core_hasInit = false;
Interstellar.addCoreWidget("Shields Core",function(){
	var thisWidget = this;
	if(shields_core_hasInit){
		//don't allow this widget to init twice
		return;
	}
	shields_core_hasInit = true

	//variables
	var shields =
	[
	    {
	        "name" : "DORSAL",
	        "strength" : 1,
	        "isRaised" : false
	    },{
	        "name" : "FORWARD",
	        "strength" : 1,
	        "isRaised" : false
	    },{
	        "name" : "PORT",
	        "strength" : 1,
	        "isRaised" : false
	    },{
	        "name" : "AFT",
	        "strength" : 1,
	        "isRaised" : false
	    },{
	        "name" : "STARBOARD",
	        "strength" : 1,
	        "isRaised" : false
	    },{
	        "name" : "VENTRAL",
	        "strength" : 1,
	        "isRaised" : false
	    }
	],
	GUIhasDrawn = false,
	shipSystems = [],
	hitPower = 5,
	doAutoDamage = true,
	regenValue = 1;
	//DOM references
	var shieldsContainer = $("#shields-core_shieldContainer"),
		thisWidgetElement = $("#shields-core"),
		hitAllButton = $("#shields-core_shieldControls_hitAllButton"),
		hitPowerRange = $("#shields-core_shieldControls_hitStrengthRange"),
		autoDamageCheckbox = $("#shields-core_shieldControls_autoDamageCheckbox"),
		shieldRegenTextbox = $("#shields-core_shieldControls_shieldRegenTextbox"),
		changeAllTextbox = $("#shields-core_setShieldStrengthWindow_textbox"),
		changeAllSubmitButton = $("#shields-core_setShieldStrengthWindow_submitButton"),
		changeAllShieldsButton = $("#shields-core_shieldControls_changeAllButton");
	//init calls
	drawGUI();

	//Interstellar functions
	thisWidget.onResize = function(){
		drawGUI();
	}
	thisWidget.afterResize = function(){

	}
	//preset observers

	//database observers
	Interstellar.onDatabaseValueChange("shields.strength",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("shields.strength",shields);
			return;
		}
		shields = newData;
		if(!GUIhasDrawn){
			GUIhasDrawn = true;
			drawGUI();
		}else{
			updateGUI();
		}
	});
	Interstellar.onDatabaseValueChange("ship.systems",function(newData){
		if(newData == null){
			//DO NOT SET THIS VALUE HERE!  JAMES!  STOP TOUCHING MY CODE!
			return;
		}
		shipSystems = newData;
		updateGUI();
	})
	//functions
	function drawGUI(){
		var html = "";
		var height = shieldsContainer.height() / shields.length;
		for(var i = 0;i < shields.length;i++){
			html += "<div class='shields-core_shieldContainer_item' style='height:" + height + "px;top: " + Math.floor(height * i) + "px'>";
	    	html += "<div title='Right click to Raise/Lower shields' class='coreProgressBar shields-core_shieldContainer_item_progressBar' index='" + i + "' >";
	    	var hasEnoughPower = true;
	        if(shipSystems != undefined){
	            for(var j = 0;j < shipSystems.length;j++){
	                if(shipSystems[j].systemName.toLowerCase().includes(shields[i].name.toLowerCase()) && shipSystems[j].systemName.toLowerCase().includes("shields")){
	                    if(shipSystems[j].requiredPower[0] > shipSystems[j].systemPower){
	                        hasEnoughPower = false;
	                    }
	                }
	            }
	        }
			var backgroundColor = "rgba(0,255,0,.5)";
			var text = "(Raised)"
	    	if(!shields[i].isRaised){
	    		backgroundColor = "rgba(255,0,0,.5)";
				text = "(Lowered)"
	    	}
	    	if(!hasEnoughPower){
	    		backgroundColor = "rgba(128,128,128,.5)";
				text = "(No Power)"
	    	}
	    	html += "<div style='width:100%' id='shields-core_shieldContainer_item_label_id_" + i + "' index='" + i + "'>" + shields[i].name + " " + text + "</div>";
	    	html += "<div class='coreProgressBarFill' id='shields-core_shieldContainer_item_progressBar_id_" + i + "' style='width:" + (shields[i].strength * 100) + "%;background-color: " + backgroundColor + "' index='" + i + "'></div>";
	    	html += "</div>"
	    	html += "<input type='button' value='Hit' index='" + i + "' class='coreButton core_shieldContainer_item_hitButton'>";
	    	html += "<input type='text' index='" + i + "' id='shields-core_shieldContainer_item_shieldTextbox_id_" + i + "' value='" + Math.round(shields[i].strength * 100) + "%' class='shields-core_shieldContainer_item_percentage coreTextbox' onclick='this.select();'";
	    	html += "</div>"
	    	html += "</div>"
		}
		shieldsContainer.html(html);
		$(".core_shieldContainer_item_hitButton").off();
		$(".core_shieldContainer_item_hitButton").click(function(event){
			var index = $(event.target).attr("index");
			setShieldValue(index,shields[index].strength - (((Math.random() * (hitPower + 3)) + 3) / 100));
		});
		$(".shields-core_shieldContainer_item_percentage").off();
		$(".shields-core_shieldContainer_item_percentage").change(function(event){
			var newValue = $(event.target).val().replace(/[^\d.-]/g, '') / 100.0;
			var index = $(event.target).attr("index");
			setShieldValue(index,newValue);
		});
		$(".shields-core_shieldContainer_item_progressBar").off();
		$(".shields-core_shieldContainer_item_progressBar").mousedown(function(event) {
		    if (event.which == 3) {
		    	var index = $(event.target).attr("index");
		    	shields[index].isRaised = !shields[index].isRaised;
		    	Interstellar.setDatabaseValue("shields.strength",shields);
		    }
		});
		$(".shields-core_shieldContainer_item_progressBar").mousedown(function(event){
		    if (event.which == 3) {
		    	return;
		    }
			var index = Number($(event.target).attr("index"));
			var percentage = event.offsetX / $(".shields-core_shieldContainer_item_progressBar").width();
			setShieldValue(index,percentage);
			thisWidgetElement.append("<div class='core_shieldContainer_item_progressBar_MouseCatcher' index='" + index + "'></div>")
			$(".core_shieldContainer_item_progressBar_MouseCatcher").mousemove(function(event){
				var index = Number($(event.target).attr("index"));
				var percentage = event.offsetX / $(".shields-core_shieldContainer_item_progressBar").width();
				setShieldValue(index,percentage);
			});
			$(".core_shieldContainer_item_progressBar_MouseCatcher").mouseup(function(event){
				$(".core_shieldContainer_item_progressBar_MouseCatcher").remove();
			})
		});
	}

	function updateGUI(){
		for(var i = 0;i < shields.length;i++){
			var hasEnoughPower = true;
	        if(shipSystems != undefined){
	            for(var j = 0;j < shipSystems.length;j++){
	                if(shipSystems[j].systemName.toLowerCase().includes(shields[i].name.toLowerCase()) && shipSystems[j].systemName.toLowerCase().includes("shields")){
	                    if(shipSystems[j].requiredPower[0] > shipSystems[j].systemPower){
	                        hasEnoughPower = false;
	                    }
	                }
	            }
	        }
			var backgroundColor = "rgba(0,255,0,.5)";
			var text = "(Raised)"
	    	if(!shields[i].isRaised){
	    		backgroundColor = "rgba(255,0,0,.5)";
				text = "(Lowered)"
	    	}
	    	if(!hasEnoughPower){
	    		backgroundColor = "rgba(128,128,128,.5)";
				text = "(No Power)"
	    	}
			$("#shields-core_shieldContainer_item_label_id_" + i).html(shields[i].name + " " + text);
			$("#shields-core_shieldContainer_item_progressBar_id_" + i).css("width",(shields[i].strength * 100) + "%");
			$("#shields-core_shieldContainer_item_progressBar_id_" + i).css("backgroundColor",backgroundColor);
			$("#shields-core_shieldContainer_item_shieldTextbox_id_" + i).val(Math.round(shields[i].strength * 100) + "%");
		}
	}

	function setShieldValue(index,percentage){
		var damageState = false;
		var i;
		if(percentage > 1){
			percentage = 1;
		}
		if(percentage <= 0){
			percentage = 0;
			damageState = true;
		}
		if(doAutoDamage){
			for(i = 0;i < shipSystems.length;i++){
				if(shipSystems[i].systemName.toLowerCase().includes(shields[index].name.toLowerCase()) && shipSystems[i].systemName.toLowerCase().includes("shield")){
					if(shipSystems[i].isDamaged != damageState){
						shipSystems[i].isDamaged = damageState;
						Interstellar.setDatabaseValue("ship.systems",shipSystems);
					}
					break;
				}
			}
		}
		shields[index].strength = percentage;
		Interstellar.setDatabaseValue("shields.strength",shields);
	}

	//event listeners
	hitAllButton.click(function(event){
		for(var i = 0;i < shields.length;i++){
			setShieldValue(i,shields[i].strength - (((Math.random() * (hitPower + 3)) + 3) / 100));
		}
	});

	hitPowerRange.change(function(event){
		hitPower = $(event.target).val();
	});

	autoDamageCheckbox.change(function(event){
		doAutoDamage = $(event.target).prop('checked');
		if(doAutoDamage){
			for(var i = 0;i < shields.length;i++){
				setShieldValue(i,shields[i].strength);
			}
		}
	});

	shieldRegenTextbox.change(function(event){
		regenValue = Number($(event.target).val().replace(/[^\d.-]/g, ''));
	});
	//intervals
	setInterval(function(event){
		if(regenValue == 0){
			return;
		}
		for(var i = 0;i < shields.length;i++){
			var isDamaged = false;
			var hasEnoughPower = true;
	        if(shipSystems != undefined){
	            for(var j = 0;j < shipSystems.length;j++){
	                if(shipSystems[j].systemName.toLowerCase().includes(shields[i].name.toLowerCase()) && shipSystems[j].systemName.toLowerCase().includes("shields")){
	                    if(shipSystems[j].requiredPower[0] > shipSystems[j].systemPower){
	                        hasEnoughPower = false;
	                    }
	                    isDamaged = shipSystems[j].isDamaged;
	                }
	            }
	        }
	        if(!isDamaged && hasEnoughPower){
				setShieldValue(i,shields[i].strength + (regenValue / 100));
	        }
		}
	},30000);

	changeAllShieldsButton.click(function(event){
		Interstellar.openCoreWindow("shields-core_setShieldStrengthWindow",event);
		changeAllTextbox.val("");
		changeAllTextbox.focus();
	});

	changeAllTextbox.keypress(function(event){
		if(event.keyCode == 13){
			var newValue = changeAllTextbox.val().replace(/[^\d.-]/g, '') / 100.0;
			if(changeAllTextbox.val() == undefined || changeAllTextbox.val() == ""){
				newValue = 1;
			}
			for(var i = 0;i < shields.length;i++){
				setShieldValue(i,newValue);
			}
			Interstellar.closeCoreWindow("shields-core_setShieldStrengthWindow");
		}
	});
	changeAllSubmitButton.click(function(event){
		var newValue = changeAllTextbox.val().replace(/[^\d.-]/g, '') / 100.0;
		if(changeAllTextbox.val() == undefined || changeAllTextbox.val() == ""){
			newValue = 1;
		}
		for(var i = 0;i < shields.length;i++){
			setShieldValue(i,newValue);
		}
		Interstellar.closeCoreWindow("shields-core_setShieldStrengthWindow");
	})
});