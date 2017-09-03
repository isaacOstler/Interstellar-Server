//variables
var weapons,
	weaponsLastLength = -1,
	chargeInterval,
	currentChargedInterval = -1;

//DOM References
var canvas = $("#canvas"),
	weaponContainer = $("#weaponContainers");

//init calls

initCanvasGUI();

//database observers
Interstellar.onDatabaseValueChange("weapons.weaponStatus",function(newData){
	if(newData == null){
		$.getJSON("/resource?path=public/weapons.json", function(loadedJSON){
        	Interstellar.setDatabaseValue("weapons.weaponStatus",loadedJSON);
    	});
		return;
	}
	weapons = newData;
	if(weapons.length > weaponsLastLength){
		weaponsLastLength = weapons.length;
		drawGUI();
		return;
	}
	updateCharge(currentChargedInterval);
	updateHeat();
});
//preset observers

//functions
function initCanvasGUI(){
	var c = document.getElementById("canvas");
	c.width = canvas.width();
	c.height = canvas.height();
}

function drawCanvas(){
	var c = document.getElementById("canvas");
	canvasWidth = canvas.width();
	canvasHeight = canvas.height();
	ctx = c.getContext("2d");
	var i;
	for(i = 0;i < weapons.length;i++){
		ctx.beginPath();
		ctx.strokeStyle = "white";
		var startX = (weapons[i].position.x + weapons[i].size.width) * canvasWidth,
			startY = (weapons[i].position.y + (weapons[i].size.height / 2)) * canvasHeight,
			endX = weapons[i].point.x * canvasWidth,
			endY = weapons[i].point.y * canvasHeight,
			yDirection = 1, //1 is up, 0 is down
			xDirection = 1; //1 is right, 0 is left
		if(startX > endX){
			xDirection = 0
			startX = weapons[i].position.x * canvasWidth;
		}
		if(startY < endY){
			yDirection = 0;
		}
		ctx.moveTo(startX,startY);
		if(xDirection == 1){
			ctx.lineTo(endX - 20,startY);
			ctx.moveTo(endX - 20,startY);
		}else{
			ctx.lineTo(endX + 20,startY);
			ctx.moveTo(endX + 20,startY);
		}
		if(yDirection == 0){
			ctx.lineTo(endX,startY + 20);
			ctx.moveTo(endX,startY + 20);
		}else{
			ctx.lineTo(endX,startY - 20);
			ctx.moveTo(endX,startY - 20);
		}
		ctx.lineTo(endX,endY);
		ctx.lineWidth= "1";
		ctx.arc(endX, endY + 2, 4, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

function drawGUI(){
	var html = "";
	var i;
	for(i = 0;i < weapons.length;i++){
		if(weapons[i].type == "phaser")
		{
			var top = weapons[i].position.y * 100;
			var left = weapons[i].position.x * 100;
			var height = weapons[i].size.height * 100;
			var width = weapons[i].size.width * 100;
			var phaserChargeStyle = "style='width:" + (weapons[i].weaponStatus.phaserCharge * 100) + "%'";
			var phaserHeatStyle = "style='width:" + (weapons[i].weaponStatus.phaserHeat * 100) + "%'";
			html += "<div class='phaser' style='top:" + top + "%;left:" + left + "%;height:" + height + "%;width:" + width + "%;'>";
			html += "<div class='phaser_header'>";
			html += weapons[i].weaponName;
			html += "</div>";
			html += "<div id='weapon_charge_" + i + "' index='" + i + "' class='phaser_chargeButton'>";
			html += "CHARGE";
			html += "</div>";
			html += "<div id='weapon_discharge_" + i + "' index='" + i + "' class='phaser_dischargeButton'>";
			html += "DISCHARGE";
			html += "</div>";
			html += "<div class='phaser_heatLabel'>";
			html += "HEAT";
			html += "</div>";
			html += "<div class='phaser_chargeLabel'>";
			html += "CHARGE";
			html += "</div>";
			html += "<div class='phaser_heatProgressBar'>";
			html += "<div id='phaser_heatFill_" + i + "' class='phaser_heatProgressBar_fill' " + phaserHeatStyle + "></div>";
			html += "</div>";
			html += "<div class='phaser_chargeProgressBar'>";
			html += "<div id='phaser_chargeFill_" + i + "' class='phaser_chargeProgressBar_fill' " + phaserChargeStyle + "></div>";
			html += "</div>";
			html += "</div>";
		}else if(weapons[i].type == "torpedo"){
			var top = weapons[i].position.y * 100;
			var left = weapons[i].position.x * 100;
			var height = weapons[i].size.height * 100;
			var width = weapons[i].size.width * 100;
			html += "<div class='torpedo' style='top:" + top + "%;left:" + left + "%;height:" + height + "%;width:" + width + "%;'>";
			html += "<div class='torpedo_header'>" + weapons[i].weaponName + "</div>";
			html += "<object type='image/svg+xml' class='torpedo_tube' data='/resource?path=public/torpedoLauncher.svg'>";
			html += "</object>";
			html += "<div class='torpedo_torpedoContainer'>";
			var j;
			var maxRows = 6;
			var row = 0;
			var column = 0;
			var columnWidth = weapons[i].size.width * 80;
			var rowHeight = weapons[i].size.height * 35;
			for(j = 0;j < weapons[i].weaponStatus.torpedoCount;j++){
				if(j == weapons[i].weaponStatus.torpedoCount - 1 && weapons[i].weaponStatus.torpedoLoaded){
					html += "<div id='torpedo_" + i + "_" +  j + "' class='torepdoIcon' style='top:2px;left:228px'></div>";
				}else{
					html += "<div id='torpedo_" + i + "_" + j + "' class='torepdoIcon' style='top:" + ((row * rowHeight) + 35) + "px;left:" + ((columnWidth * column) + 20) + "px'></div>";
					row++;
					if(row > maxRows){
						column++;
						row = 0;
					}
				}
			}
			html += "</div>";
			html += "<div index='" + i + "' id='torpedo_loadButton_" + i + "' class='torpedo_loadButton'>LOAD TORPEDO</div>";
			html += "<div index='" + i + "' id='torpedo_unloadButton_" + i + "' class='torpedo_unloadButton'>UNLOAD TORPEDO</div>";
			html += "</div>";
		}else{
			console.warn("WARN: Unknown weapon type! " + weapons[i].type);
		}
	}
	weaponContainer.html(html);
	var i = 0;
	for(i = 0;i < weapons.length;i++){
		if(weapons[i].type == "phaser"){
			$("#weapon_charge_" + i).off();
			$("#weapon_charge_" + i).mousedown(function(event){
				currentChargedInterval = $(event.target).attr("index");
				if(chargeInterval != undefined){
					clearInterval(chargeInterval);
				}
				chargeInterval = setInterval(function(){
					if(weapons[currentChargedInterval].weaponStatus.phaserCharge >= 1){
						clearInterval(chargeInterval);
						return;
					}
					weapons[currentChargedInterval].weaponStatus.phaserCharge += .001;
					updateCharge();
				},0010);
			});
		}else if(weapons[i].type == "torpedo"){
			$("#torpedo_loadButton_" + i).off();
			$("#torpedo_loadButton_" + i).click(function(event){
				let index = $(event.target).attr("index");
				let torpedo = $("#torpedo_" + index + "_" +  (weapons[index].weaponStatus.torpedoCount - 1));
				var columnWidth = weapons[index].size.width * 80;
				var rowHeight = weapons[index].size.height * 35;
				torpedo.stop();
				torpedo.animate({"left" : 228},5000,function(){
					torpedo.stop();
					torpedo.animate({"top" : 2},5000,function(){
						weapons[index].weaponStatus.torpedoLoaded = true;
        				Interstellar.setDatabaseValue("weapons.weaponStatus",weapons);
					});
				});
			});
		}
	}
	for(i = 0;i < weapons.length;i++){
		if(weapons[i].type == "phaser"){
		$("#weapon_discharge_" + i).off();
			$("#weapon_discharge_" + i).mousedown(function(event){
				currentChargedInterval = $(event.target).attr("index");
				if(chargeInterval != undefined){
					clearInterval(chargeInterval);
				}
				chargeInterval = setInterval(function(){
					if(weapons[currentChargedInterval].weaponStatus.phaserCharge <= 0){
						clearInterval(chargeInterval);
						return;
					}
					weapons[currentChargedInterval].weaponStatus.phaserCharge -= .001;
					updateCharge();
				},0010);
			});
		}else if(weapons[i].type == "torpedo"){
			$("#torpedo_unloadButton_" + i).off();
			$("#torpedo_unloadButton_" + i).click(function(event){
				let index = $(event.target).attr("index");
				let torpedo = $("#torpedo_" + index + "_" +  (weapons[index].weaponStatus.torpedoCount - 1));
				
				var columnWidth = weapons[index].size.width * 80;
				var rowHeight = weapons[index].size.height * 35;

				var torpedoCount = weapons[index].weaponStatus.torpedoCount;

				var calculatedColumn = Math.floor((torpedoCount - 1) / 7);
				var calculatedRow;
				console.log(calculatedColumn);
				if(calculatedColumn < 1){
					calculatedRow = torpedoCount - 1;
				}else{
					calculatedRow = (torpedoCount - 1) % (calculatedColumn * 7);
				}

				torpedo.stop();
				torpedo.animate({"top" : ((calculatedRow * rowHeight) + 35)},5000,function(){
					torpedo.stop();
					torpedo.animate({"left" : ((columnWidth * calculatedColumn) + 20)},5000,function(){
						weapons[index].weaponStatus.torpedoLoaded = false;
        				Interstellar.setDatabaseValue("weapons.weaponStatus",weapons);
					});
				});
			});
		}
	}
	$(document).mouseup(function(event){
		if(chargeInterval != undefined){
			clearInterval(chargeInterval);
			chargeInterval = undefined;
        	Interstellar.setDatabaseValue("weapons.weaponStatus",weapons);
		}
	});
	drawCanvas();
}

function updateCharge(exception){
	var i;
	for(i = 0;i < weapons.length;i++){
		if(i != exception){
			$("#phaser_chargeFill_" + i).css("width",(weapons[i].weaponStatus.phaserCharge * 100) + "%");
		}
	}
}

function updateHeat(){
	var i;
	for(i = 0;i < weapons.length;i++){
		$("#phaser_heatFill_" + i).css("width",(weapons[i].weaponStatus.phaserHeat * 100) + "%");
	}
}

//event handlers

//intervals
