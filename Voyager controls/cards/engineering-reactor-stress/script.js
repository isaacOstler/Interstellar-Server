Interstellar.onDatabaseValueChange("engineering.reactorStatus.reactorStress",function(newValue){
	if(newValue == null){
		setDatabaseValue("engineering.reactorStatus.reactorStress", .1);
		return;
	}
	var boxHeight = $("#stressBarFill").height();
	var MaskHeight = boxHeight * (1 - newValue);
	$("#stressBarMask").height(MaskHeight);
});