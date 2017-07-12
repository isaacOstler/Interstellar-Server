var PowerDistributionshipSystems = [];
var PowerDistributionPowerInUse = 0;
var PowerDistributionReactorOutput = 140;

onDatabaseValueChange("ship.systems",function(newData){
	if(newData == null){
		$.getJSON('/resource?path=public/systemStatus.json&screen=Power-Distribution-Core', function(systemStatusJSONFile) {
			setDatabaseValue("ship.systems",systemStatusJSONFile);
			return;
		});
		return;
	}
	PowerDistributionshipSystems = newData;
	drawGUI();
});

onDatabaseValueChange("reactor.output",function(newData){
	if(newData == null){
		setDatabaseValue("reactor.output",140);
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
		setDatabaseValue("reactor.output",0);
		return;
	}
	setDatabaseValue("reactor.output",newValue);
});

$("#Power-Distribution-FluxPower").on("click",function(event){
	var randomAmount = Math.floor(Math.random() * (4 - -4 + 1)) + -4;
	PowerDistributionReactorOutput += randomAmount;
	setDatabaseValue("reactor.output",PowerDistributionReactorOutput);
});

function drawGUI(){
	PowerDistributionPowerInUse = 0;
	var shipSystems = PowerDistributionshipSystems;
	var html = "";
	var heightOfBox = $("#Power-Distribution-Core-Widget").height();
	var widthOfBox = $("#Power-Distribution-Core-Widget").width();
	console.log(heightOfBox);
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
			setDatabaseValue("ship.systems",PowerDistributionshipSystems);
			return;
		}
		PowerDistributionshipSystems[event.target.id.split("|")[1]].systemPower = newValue;
		setDatabaseValue("ship.systems",PowerDistributionshipSystems);
	});
	$(".Power-Distribution-systemName").off();
	$(".Power-Distribution-systemName").on("click",function(event){
		var html = $(event.target).html();
		for(var i = 0;i < shipSystems.length;i++){
			if(html == shipSystems[i].systemName){
				shipSystems[i].isDamaged = !shipSystems[i].isDamaged;
				setDatabaseValue("ship.systems",shipSystems);
				return;
			}
		}
	});
}