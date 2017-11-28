Interstellar.addCoreWidget("DMX Control",function(){
	var continuousShake = false,
		stopShakeTimeout = undefined;
	$("#dmx-core_keepShaking_checkbox").click(function(event){
		continuousShake = $(event.target)[0].checked;
	});
	$("#dmx-core_shakeLights").click(function(event){
		Interstellar.setDatabaseValue("lights.isShaking",true);
		if(stopShakeTimeout != undefined){
			clearTimeout(stopShakeTimeout);
		}
		setTimeout(function(){
			stopShakeTimeout = undefined;
			if(!continuousShake){
				Interstellar.setDatabaseValue("lights.isShaking",false);
			}
		},10000);
	});
	$("#dmx-core_blackout").click(function(event){
		if(stopShakeTimeout != undefined){
			clearTimeout(stopShakeTimeout);
		}
		Interstellar.setDatabaseValue("lights.blackout",true);
	});
	$("#dmx-core_uv").click(function(event){
		if(stopShakeTimeout != undefined){
			clearTimeout(stopShakeTimeout);
		}
		Interstellar.setDatabaseValue("lights.uv",true);
	});
	$("#dmx-core_disco").click(function(event){
		if(stopShakeTimeout != undefined){
			clearTimeout(stopShakeTimeout);
		}
		Interstellar.setDatabaseValue("lights.disco",true);
	});
	$("#dmx-core_smokeMachineSlider").on("change",function(event){
		Interstellar.setDatabaseValue("ship.fog",Number($(event.target).val()));
	});
});