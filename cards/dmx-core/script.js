Interstellar.addCoreWidget("DMX Control",function(){
	$("#dmx-core_shakeLights").click(function(event){
		Interstellar.setDatabaseValue("lights.isShaking",true);
	});
	$("#dmx-core_blackout").click(function(event){
		Interstellar.setDatabaseValue("lights.blackout",true);
	});
});