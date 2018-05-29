Interstellar.addCoreWidget("Thrusters",function(){
	var thisWidget = this;

	//variables
	
	//DOM References
	var thrustersCanvas = $("#thrustersCore_thrustersCanvas"),
		verticalThrustersCanvas = $("#thrustersCore_verticalThrustersCanvas");
	//init calls
		
	//class instances
	var thrusterDisplay = new ThrustersDisplayClass(thrustersCanvas);
	var verticalDisplay = new VerticalThrustersClass(verticalThrustersCanvas);

	//interstellar calls
	thisWidget.onResize = function(){
		thrusterDisplay.refreshGUI();
		verticalDisplay.refreshGUI();
	}

	//functions

	//preset observers

	//database observers
	Interstellar.onDatabaseValueChange("thrusters.info",function(newData){
		if(newData == null){
			return;
		}
		thrusterDisplay.setThrust(Number(newData.thrusterDirection),Number(newData.thrusterPower));
		verticalDisplay.setThrust(Number(newData.verticalThrusterPower));
	});
	//event handlers
	
});