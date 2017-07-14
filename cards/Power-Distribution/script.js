var shipSystems = [];
var eventListenerHasBeenCreated = false;
var selectedSystem = "";
var sizeOfCellsScaler = 70;
var widthOfCell = 20;
var totalPowerInUse = 0;
var totalPowerAvaliable = 140;
Interstellar.onDatabaseValueChange("ship.systems",function(newData){
	if(newData == null){
		$.getJSON('/resource?path=public/systemStatus.json', function(systemStatusJSONFile) {
			Interstellar.setDatabaseValue("ship.systems",systemStatusJSONFile);
			return;
		});
		return;
	}
	shipSystems = newData;
	drawSystemPower();
});

Interstellar.onDatabaseValueChange("reactor.output",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("reactor.output",140);
		return;
	}
	totalPowerAvaliable = newData;
	drawSystemPower();
})

function drawSystemPower(){
	var html = "";
	var widthOfBox = $('#systemArea').width();
	var colCount = 0;
	var rowCount = 0;
	totalPowerInUse = 0;
	for(var i = 0;i < shipSystems.length;i++){
		var systemName = shipSystems[i].systemName;
		var systemPower = shipSystems[i].systemPower;
		totalPowerInUse += systemPower;
		var requiredPowerLevels = shipSystems[i].requiredPower;
		var leftPos = (colCount * (widthOfBox / 8));

		var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
		var heightOfEachRow = ((($("#systemArea").height() - 100) - shipSystems.length * 2) / shipSystems.length);
		var color = "#edd147";

		html += "<div id='" + systemID + "' class='graphSystemName tooltip' style='top:" + ((rowCount * (heightOfEachRow + 5)) + 55) + "px;height:" + heightOfEachRow + "px;left: 0%;width:23%;text-align:right'>";
		html += "<span class='tooltiptext'>" + shipSystems[i].quickTooltip + "</span>"
		textColor = "white";
		if(systemPower == 0){
			textColor = "#606060";
			color = "#606060";
		}
		if(shipSystems[i].isDamaged){
			textColor = "#cc1616";
			color = "#cc1616";
		}
		html += "<span style='color:" + textColor + "'>" + systemName + "</span>";
		if(systemPower < 10){
			html += "&nbsp;"
		}
		html += "(<span style='color:" + color + "' id='" + systemID + "_systemEfficencyLabel'>" + systemPower + "</span>)  ";
		html += "</div>";
		html += "<div id='" + systemID + "_ProgressBar' class='progressBarBackground' style='top:" + ((rowCount * (heightOfEachRow + 5)) + 55) + "px;left: 25%;height:" + heightOfEachRow + "px;width:75%'>";
		widthOfCell = Math.floor(widthOfBox / sizeOfCellsScaler);
			html += "<div id='" + systemID + "|" + -1 + "' class='progressBarCell' style='left: " + -1 *((widthOfCell / 2) + 3) + "px; width:" + (widthOfCell / 2) + "px;background-color: #606060;height:" + heightOfEachRow + "px'>";
			html += "</div>"
		for(var j = 0;j < systemPower;j++){
			html += "<div id='" + systemID + "|" + j + "' class='progressBarCell glow' style='left: " + j * (widthOfCell + 3) + "px; width:" + widthOfCell + "px;background-color:" + color + ";height:" + heightOfEachRow + "px'>";
			html += "</div>"
		}
		for(var j = 0;j < requiredPowerLevels.length;j++){
			var requiredPowerLevelForSystem = requiredPowerLevels[j];
			html += "<div class='progressBarCell' id='" + systemID + "|!|" + requiredPowerLevelForSystem + "' style='left: " + (requiredPowerLevelForSystem * (widthOfCell + 3) - 3) + "px; width:" + 3 + "px;background-color:#c4c4c4; height:" + heightOfEachRow + "px'>";
			html += "</div>"
		}
		html += "</div>"
		$("#totalPowerUsageLabel").html(totalPowerInUse);
		$("#totalPowerAvaliableLabel").html(totalPowerAvaliable);
		$("#PowerDraw").html("POWER DRAW: " + (totalPowerAvaliable - totalPowerInUse));
		if(totalPowerAvaliable < totalPowerInUse){
			$("#totalPowerUsageLabel").css("color","red");
			$("#totalPowerAvaliableLabel").css("color","red");
			$("#totalPowerUsage").css("color","red");
			$("#totalPowerAvaliable").css("color","red");
			$("#PowerDraw").css("color","red");
			$("#PowerDraw").css("color","red");
		}else{
			$("#totalPowerUsageLabel").css("color","white");
			$("#totalPowerAvaliableLabel").css("color","white");
			$("#totalPowerUsage").css("color","white");
			$("#totalPowerAvaliable").css("color","white");
			$("#PowerDraw").css("color","white");
			$("#PowerDraw").css("color","white");
		}
		rowCount++;
	}
	elem = $('#systemArea');
	if ( elem.nodeType === 1 ) {
  		jQuery.cleanData( getAll( elem, false ) );
    	//elem.innerHTML = value;
	}
	$('#systemArea').empty().html(html);
	if(!eventListenerHasBeenCreated){
		$(".progressBarBackground").off();
		$(".progressBarBackground").on("mousedown",function(event){
			var id = event.target.id;
			var eventInfo = id.split("|");
			var systemClickedOn = eventInfo[0];
			if(eventInfo[1] == "!"){
			for(var i = 0; i < shipSystems.length;i++){
				let systemName = shipSystems[i].systemName;
				var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
				if(systemID == systemClickedOn){
						shipSystems[i].systemPower = parseInt(eventInfo[2]);
						Interstellar.setDatabaseValue("ship.systems",shipSystems);
						drawSystemPower();
						playRandomBeep();
						return;
					}
				}
			}
			var powerCell = parseInt(eventInfo[1]);
			console.log("Power cell " + (powerCell + 1) + " of " + systemClickedOn + " was selected");
			for(var i = 0; i < shipSystems.length;i++){
				let systemName = shipSystems[i].systemName;
				var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
				if(systemID == systemClickedOn){
					if(powerCell == -1 || (powerCell + 1) == shipSystems[i].systemPower){
						if(powerCell == -1){
							if(shipSystems[i].systemPower != 0){
								shipSystems[i].systemPower = 0;
								Interstellar.setDatabaseValue("ship.systems",shipSystems);
								drawSystemPower();
								return;
							}
						}
						selectedSystem = systemID;
						$("#systemArea").off();
						$("#systemArea").on("mousemove",function(event){
							var systemBox = $("#" + selectedSystem + "_ProgressBar");
							var widthOfBox = systemBox.width();
   							var parentPosition = systemBox.offset();
							var positionX = event.pageX - systemBox.offset().left;
							var numberOfCells = positionX / (widthOfCell + 3);
							$("#progress").html(widthOfBox / (widthOfCell + 3) + " (" + numberOfCells + ")");
							for(var k = 0;k < shipSystems.length;k++){
								if(shipSystems[k].systemName == systemName){
									if(numberOfCells <= 0){
										return;
									}
									shipSystems[k].systemPower = Math.round(numberOfCells);
									drawSystemPower();
									return;
								}
							}
						})
						$(document).off();
						$(document).on("mouseup",function(event){
							playRandomBeep();
							selectedSystem = "";
							$("#systemArea").off();
							for(var k = 0;k < shipSystems.length;k++){
								if(shipSystems[k].systemName == systemName){
									Interstellar.setDatabaseValue("ship.systems",shipSystems);
									return;
								}
							}
						})
						return;
					}
				}
			}
		});
	}
}