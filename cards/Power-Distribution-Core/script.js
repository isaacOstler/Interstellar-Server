Interstellar.addCoreWidget("Power Distribution",function(){	
	var thisWidget = this,
		PowerDistributionshipSystems = [],
		PowerDistributionPowerInUse = 0,
		PowerDistributionReactorOutput = 140,
		PowerDistributionDamagedSystems = [];

	Interstellar.onDatabaseValueChange("damageControl.damagedSystems",function(newData){
		if(newData == null){
			return;
		}
		PowerDistributionDamagedSystems = newData;
	})

	Interstellar.onDatabaseValueChange("ship.systems",function(newData){
		if(newData == null){
			$.getJSON('/resource?path=public/systemStatus.json&screen=Power-Distribution-Core', function(systemStatusJSONFile) {
				Interstellar.setDatabaseValue("ship.systems",systemStatusJSONFile);
				return;
			});
			return;
		}
		var old_damagedSystems = 0,
			damagedSystems = 0;
		for(var i = 0;i < PowerDistributionshipSystems.length;i++){
			if(PowerDistributionshipSystems[i].isDamaged){
				damagedSystems++;
			}
		}
		for(var i = 0;i < newData.length;i++){
			if(newData[i].isDamaged){
				old_damagedSystems++;
			}
		}
		if(old_damagedSystems == damagedSystems){
			Interstellar.say("Power");
		}
		PowerDistributionshipSystems = [];
		for(var i = 0;i < newData.length;i++){
			PowerDistributionshipSystems.splice(PowerDistributionshipSystems.length,0,newData[i]);
		}
		drawGUI();
	});

	thisWidget.onResize = function(){
		drawGUI();
	}
	
	Interstellar.onDatabaseValueChange("reactor.output",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("reactor.output",140);
			return;
		}
		$("#Power-Distribution-Reactor-Output").val(newData);
		PowerDistributionReactorOutput = newData;
		$("#Power-Distribution-PowerDraw").html(PowerDistributionReactorOutput - PowerDistributionPowerInUse);
		if((PowerDistributionReactorOutput - PowerDistributionPowerInUse) < 0){
			$("#Power-Distribution-PowerDraw").css("background-color","red");
			$("#Power-Distribution-PowerDrawLabel").css("color","red");
		}else{
			if((PowerDistributionReactorOutput - PowerDistributionPowerInUse) != 0){
				$("#Power-Distribution-PowerDraw").css("background-color","yellow");
				$("#Power-Distribution-PowerDrawLabel").css("color","yellow");
			}else{
				$("#Power-Distribution-PowerDraw").css("background-color","#00FFFF");
				$("#Power-Distribution-PowerDrawLabel").css("color","white");
			}
		}
	})
	$("#Power-Distribution-Reactor-Output").on("change",function(event){
		var newValue = parseInt(event.target.value);
		if(isNaN(newValue)){
			event.target.value = PowerDistributionReactorOutput;
			return;
		}
		if(newValue < 0){
			event.target.value = 0;
			Interstellar.setDatabaseValue("reactor.output",0);
			return;
		}
		Interstellar.setDatabaseValue("reactor.output",newValue);
	});

	$("#Power-Distribution-FluxPower").on("click",function(event){
		var randomAmount = Math.floor(Math.random() * (4 - -4 + 1)) + -4;
		PowerDistributionReactorOutput += randomAmount;
		Interstellar.setDatabaseValue("reactor.output",PowerDistributionReactorOutput);
	});

	function drawGUI(){
		PowerDistributionPowerInUse = 0;
		var shipSystems = PowerDistributionshipSystems;
		var html = "";
		var heightOfBox = $("#Power-Distribution-Core-Widget").height();
		var widthOfBox = $("#Power-Distribution-Core-Widget").width();
		for(var i = 0;i < PowerDistributionshipSystems.length;i++){
			var color = "white";
			PowerDistributionPowerInUse += shipSystems[i].systemPower;
			if(shipSystems[i].systemPower < shipSystems[i].requiredPower[0]){
				color = "#404040";
			}
			if(shipSystems[i].isDamaged){
				color = "red";
			}
			var fontSize = widthOfBox / 17;
			if((widthOfBox / 17) > (heightOfBox / 30)){
				fontSize = heightOfBox / 30;
			}
			var heightOfElements = (heightOfBox * 0.8) / shipSystems.length;
			html += "<div class='noselect' style='top: " + (i * heightOfElements) + "px;position:absolute;width:100%;cursor:pointer;overflow:hidden;height:" + heightOfElements +";padding-top:3px;'>";
			html += "<div class='Power-Distribution-systemName' style='color:" + color + ";width: 78%;text-align:right;font-size:" + fontSize + "px'>";
			html += shipSystems[i].systemName;
			html += "</div> <input type='input' onClick='this.select();' id='Power-Distribution|" + i + "' class='Power-Distribution-CurrentSystemPower' style='padding:0px;border-style:none;height:" + fontSize + "px;font-size:" + fontSize + "px' value='" + shipSystems[i].systemPower + "'><div class='Power-Distribution-RequiredSystemPower' style='height:" + fontSize + "px;font-size:" + fontSize + "px'>" + shipSystems[i].requiredPower[0] + "</div><br />";
			html += '</div>'
		}
		$("#Power-Distribution-PowerDraw").html(PowerDistributionReactorOutput - PowerDistributionPowerInUse);
		if((PowerDistributionReactorOutput - PowerDistributionPowerInUse) < 0){
			$("#Power-Distribution-PowerDraw").css("background-color","red");
			$("#Power-Distribution-PowerDrawLabel").css("color","red");
		}else{
			if((PowerDistributionReactorOutput - PowerDistributionPowerInUse) != 0){
				$("#Power-Distribution-PowerDraw").css("background-color","yellow");
				$("#Power-Distribution-PowerDrawLabel").css("color","yellow");
			}else{
				$("#Power-Distribution-PowerDraw").css("background-color","#00FFFF");
				$("#Power-Distribution-PowerDrawLabel").css("color","white");
			}
		}
		$("#Power-Distribution-PowerInUse").html(PowerDistributionPowerInUse);
		$("#Power-Distribution-SystemList").html(html);
		$(".Power-Distribution-CurrentSystemPower").off();
		$(".Power-Distribution-CurrentSystemPower").on("change",function(event){
			var newValue = parseInt(event.target.value);
			if(isNaN(newValue)){
				event.target.value = PowerDistributionshipSystems[event.target.id.split("|")[1]].systemPower;
				return;
			}
			if(newValue < 0){
				event.target.value = 0;
				PowerDistributionshipSystems[event.target.id.split("|")[1]].systemPower = 0;
				Interstellar.setDatabaseValue("ship.systems",PowerDistributionshipSystems);
				return;
			}
			PowerDistributionshipSystems[event.target.id.split("|")[1]].systemPower = newValue;
			Interstellar.setDatabaseValue("ship.systems",PowerDistributionshipSystems);
		});
		$(".Power-Distribution-systemName").off();
		$(".Power-Distribution-systemName").on("click",function(event){
			var html = $(event.target).html();
			for(var i = 0;i < shipSystems.length;i++){
				if(html == shipSystems[i].systemName){
					shipSystems[i].isDamaged = !shipSystems[i].isDamaged;
					/*if(shipSystems[i].isDamaged){
						var didFind = false;
						for(var j = 0;j < PowerDistributionDamagedSystems.length;j++){
							if(PowerDistributionDamagedSystems[j].systemName.toLowerCase() == shipSystems[i].systemName.toLowerCase()){
								didFind = true;
							}
						}
						if(!didFind){
							PowerDistributionDamagedSystems.push({"systemName" : shipSystems[i].systemName,"timeRequired" : 400, "timePassed" : 0});
							Interstellar.setDatabaseValue("damageControl.damagedSystems",PowerDistributionDamagedSystems);
						}
					}*/
					Interstellar.setDatabaseValue("ship.systems",shipSystems);
					return;
				}
			}
		});
	}
});