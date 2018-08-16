Interstellar.addCoreWidget("Weapons Control",function(){
	var thisWidget = this;

	//variables
	var weapons = [],
		weaponsLastLength = -1;

	//DOM References
	var phaserHeatContainer = $("#weaponsControlCore_phaserContainer_heat"),
		torpedoContainer = $("#weaponsControlCore_torpedoContainer_itemContainer");
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
		updateHeatAndChargeOfPhasers();
		updateStatusOfTorpedoLaunchers();
	});

	//functions
	function drawGUI(){
		var html = "",
			numberOfPhasers = 0,
			numberOfTorpedos = 0,
			numberOfPhasersInited = 0,
			numberOfTorpedosInited = 0;

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
		html = "";
		for(var i = 0;i < weapons.length;i++){
			if(weapons[i].type == "torpedo"){
				var style = 'style="height:' + Number(phaserHeatContainer.height() / numberOfPhasers) + 'px';
				numberOfTorpedosInited++;
				if(numberOfPhasersInited == numberOfPhasers){
					style = 'style="border-bottom:0px;height:' + ((phaserHeatContainer.height() / numberOfPhasers) - 5) + 'px';
				}
				
				html += '<div class="weaponsControlCore_torpedoContainer_itemContainer_item">';
					html += '<div class="weaponsControlCore_torpedoContainer_itemContainer_item_label">';
					html += weapons[i].weaponName
					html += '</div>';
					html += '<div class="weaponsControlCore_torpedoContaine_itemContainer_item_torpedos">';
						html += '<input weaponsCoreTorpedoLoadedTextbox="' + i + '" type="text" placeholder="50" value="' + weapons[i].weaponStatus.torpedoCount + '" class="weaponsControlCore_torpedoContainer_itemContainer_item_torpedos_textbox">';
						html += '<div class="weaponsControlCore_torpedoContainer_itemContainer_item_torpedos_slash">/</div>';
						html += '<div class="weaponsControlCore_torpedoContainer_itemContainer_item_torpedos_max">50</div>';
					html += '</div>';
					html += '<div weaponsCoreTorpedoLoadedIndex="' + i + '" class="weaponsControlCore_torpedoContainer_itemContainer_item_loaded">' + (weapons[i].weaponStatus.torpedoLoaded ? "YES" : "NO") + '</div>';
				html += '</div>';
			}
		}
		torpedoContainer.html(html);
		updateHeatAndChargeOfPhasers();
		updateStatusOfTorpedoLaunchers();
	}
	function updateHeatAndChargeOfPhasers(){
		for(var i = 0;i < weapons.length;i++){
			if(weapons[i].type == "phaser"){
				$("[weaponsCorePhaserHeatIndex=" + i + "]").css("width",weapons[i].weaponStatus.phaserHeat * 100 + "%");
				$("[weaponsCorePhaserChargeIndex=" + i + "]").val(Math.round(weapons[i].weaponStatus.phaserCharge * 100) + "%");
				var adjustedColor = Interstellar.rotateHue("#FF0000",120 * weapons[i].weaponStatus.phaserCharge);
				$("[weaponsCorePhaserChargeIndex=" + i + "]").css("background-color",adjustedColor);
			}
		}
	}
	function updateStatusOfTorpedoLaunchers(){
		for(var i = 0;i < weapons.length;i++){
			if(weapons[i].type == "torpedo"){
				$("[weaponsCoreTorpedoLoadedTextbox=" + i + "]").val(weapons[i].weaponStatus.torpedoCount);
				$("[weaponsCoreTorpedoLoadedIndex=" + i + "]").html(weapons[i].weaponStatus.torpedoLoaded ? "YES" : "NO");
				$("[weaponsCoreTorpedoLoadedIndex=" + i + "]").css("background-color",weapons[i].weaponStatus.torpedoLoaded ? "lime" : "red");
			}
		}
	}
	//event handlers

	//intervals

	/*
	setInterval(function(){
		var willUpdate = false;
		for(var i = 0;i < weapons.length;i++){
			if(weapons[i].type == "phaser"){
				if(weapons[i].weaponStatus.phaserHeat > 0){
					willUpdate = true;
					weapons[i].weaponStatus.phaserHeat -= .01 * Math.random();
				}else{
					willUpdate = true;
					weapons[i].weaponStatus.phaserHeat = 0;
				}
			}
		}
		if(willUpdate){
			Interstellar.setDatabaseValue("weapons.weaponStatus",weapons);
		}
	},0500);*/
});