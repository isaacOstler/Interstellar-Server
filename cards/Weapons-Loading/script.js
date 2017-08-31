//variables
var weapons,
	weaponsLastLength = -1;

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
	updateGUI();
});
//preset observers

//functions
function initCanvasGUI(){
	var c = document.getElementById("canvas");
	c.width = canvas.width();
	c.height = canvas.height();
}

function drawGUI(){
	var html = "";
	var i;
	for(i = 0;i < weapons.length;i++){
		var top = weapons[i].position.y * 100;
		var left = weapons[i].position.x * 100;
		var height = weapons[i].size.height * 100;
		var width = weapons[i].size.width * 100;
		html += "<div class='phaser' style='top:" + top + "%;left:" + left + "%;height:" + height + "%;width:" + width + "%;'>";
		html += "<div class='phaser_header'>"
		html += weapons[i].weaponName;
		html += "</div>";
		html += "<div class='phaser_chargeButton'>";
		html += "CHARGE";
		html += "</div>";
		html += "<div class='phaser_dischargeButton'>";
		html += "DISCHARGE";
		html += "</div>";
		html += "<div class='phaser_heatLabel'>";
		html += "HEAT";
		html += "</div>";
		html += "<div class='phaser_chargeLabel'>";
		html += "CHARGE";
		html += "</div>";
		html += "<div class='phaser_heatProgressBar'>";
		html += "<div class='phaser_heatProgressBar_fill'></div>";
		html += "</div>";
		html += "<div class='phaser_chargeProgressBar'>";
		html += "<div class='phaser_chargeProgressBar_fill'></div>";
		html += "</div>";
		html += "</div>";
	}
	weaponContainer.html(html);
}

function updateGUI(){

}

//event handlers

//intervals