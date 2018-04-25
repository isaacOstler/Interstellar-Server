Interstellar.addCoreWidget("Weapons Control",function(){
	var thisWidget = this;

	//variables
	var weapons = [],
		weaponsLastLength = -1;

	//DOM References
	var phaserHeatContainer = $("#weaponsControlCore_phaserContainer_heat");
	//init calls

	//interstellar calls
	thisWidget.onResize = function(){
		drawGUI();
	}

	//preset observers

	//database observers
	Interstellar.onDatabaseValueChange("weapons.weaponStatus",function(newData){
		if(newData == null){
			$.getJSON("/resource?path=public/weapons.json&screen=weapons-control-core", function(loadedJSON){
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
		updateCharge();
		updateHeat();
	});

	//functions
	function drawGUI(){
		var html = "",
			numberOfPhasers = 0,
			numberOfTorpedos = 0,
			numberOfPhasersInited = 0;

		for(var i = 0;i < weapons.length;i++){
			if(weapons[i].type == "phaser"){
				numberOfPhasers++;
			}else{
				numberOfTorpedos++;
			}
		}

		for(var i = 0;i < weapons.length;i++){
			if(weapons[i].type == "phaser"){
				var style = 'style="height:' + Number(phaserHeatContainer.height() / numberOfPhasers) + 'px';
				numberOfPhasersInited++;
				if(numberOfPhasersInited == numberOfPhasers){
					style = 'style="border-bottom:0px;height:' + ((phaserHeatContainer.height() / numberOfPhasers) - 5) + 'px';
				}
				style += '"';
				html += '<div index="' + i + '" class="weaponsControlCore_phaserContainer_heat_item" ' + style + '>';
				html += '<div index="' + i + '" class="weaponsControlCore_phaserContainer_heat_item_label">';
					html += weapons[i].weaponName;
				html += '</div>';
				html += '<div index="' + i + '" class="weaponsControlCore_phaserContainer_heat_item_barContainer">';
					html += '<div weaponsCorePhaserHeatIndex="' + i + '" index="' + i + '" style="width:' + weapons[i].weaponStatus.phaserHeat * 100 + '%" class="weaponsControlCore_phaserContainer_heat_item_barContainer_fill"></div>';
				html += '</div>';
				html += '<input weaponsCorePhaserChargeIndex="' + i + '" index="' + i + '" type="text" value="' + weapons[i].weaponStatus.phaserCharge * 100 + '%" placeholder="0%" class="weaponsControlCore_phaserContainer_heat_item_chargeTextbox">';
				html += '</div>';
			}
		}
		phaserHeatContainer.html(html);
	}
	function updateCharge(){
		for(var i = 0;i < weapons.length;i++){
			$("[weaponsCorePhaserHeatIndex=" + i + "]").css("width",weapons[i].weaponStatus.phaserHeat * 100 + "%");
			$("[weaponsCorePhaserChargeIndex=" + i + "]").val(weapons[i].weaponStatus.phaserCharge * 100 + "%");
		}
	}
	function updateHeat(){

	}
	//event handlers

});