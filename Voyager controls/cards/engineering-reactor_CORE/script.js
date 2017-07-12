onDatabaseValueChange("engineering.reactorStatus.reactorStress",function(newValue){
	if(newValue == null){
		setDatabaseValue("engineering.reactorStatus.reactorStress", .1);
		return;
	}
	$("#Reactor_Control_Core-stressSlider").val(newValue * 100);
	$("#Reactor_Control_Core-stressInfoBox").val(Math.round((newValue * 100)) + "%");
});

$("#Reactor_Control_Core-stressSlider").on("input",function(event){
	var newValue = $("#Reactor_Control_Core-stressSlider").val() / 100;
	setDatabaseValue("engineering.reactorStatus.reactorStress",newValue);
})