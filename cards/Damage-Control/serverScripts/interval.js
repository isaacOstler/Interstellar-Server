var damagedSystemStatus = [],
	damagePings = [],
	updateSystemStatusInterval = undefined,
	updatePingStatusInterval = undefined,
	doUpdate = false;

//reset function
Interstellar.onDatabaseClear(function(){
	doUpdate = false;
	if(updatePingStatusInterval != undefined){
		clearInterval(updateSystemStatusInterval);
		updateSystemStatusInterval = undefined;
	}
	if(updatePingStatusInterval != undefined){
		clearInterval(updatePingStatusInterval);
		updatePingStatusInterval = undefined;
	}
});

//database observers

Interstellar.onDatabaseValueChange("damageControl.damagedSystems",function(newData){
	if(newData == null){
		damagedSystems = [];
		doUpdate = false;
		if(updateSystemStatusInterval != undefined){
			clearInterval(updateSystemStatusInterval);
			updateSystemStatusInterval = undefined;
		}
		return;
	}
	doUpdate = true;
	damagedSystemStatus = newData;
	if(updateSystemStatusInterval == undefined){
		updateSystemStatusInterval = setInterval(function(){
			var newSystemArray = [];
			var noChangesMade = true;
			for(var i = 0;i < damagedSystemStatus.length;i++){
				if(damagedSystemStatus[i].timePassed >= damagedSystemStatus[i].timeRequired){
					noChangesMade = false;
					continue;
				}
				newSystemArray.push(damagedSystemStatus[i]);
			}
			var amount = 0;
			for(var i = 0;i < newSystemArray.length;i++){
				amount = 2 - Math.log(i + 2);
				if(amount < 0){
					amount = 0;
				}
				noChangesMade = false;
				newSystemArray[i].timePassed += amount;
			}
			if(!noChangesMade && doUpdate){
				Interstellar.setDatabaseValue("damageControl.damagedSystems",newSystemArray);
			}
		},1000);
	}
});
Interstellar.onDatabaseValueChange("damageControl.damagePings",function(newData){
	if(newData == null){
		damagePings = [];
		if(updatePingStatusInterval != undefined){
			clearInterval(updatePingStatusInterval);
			updatePingStatusInterval = undefined;
		}
		return;
	}
	doUpdate = true;
	damagePings = newData;
	if(updatePingStatusInterval == undefined){
		updatePingStatusInterval = setInterval(function(){
			var noChangesMade = true;
			for(var i = 0;i < damagePings.length;i++){
				damagePings[i].timePassed++;
				noChangesMade = false;
			}
			if(!noChangesMade && doUpdate){
				Interstellar.setDatabaseValue("damageControl.damagePings",damagePings);
			}
		},1000);
	}
});