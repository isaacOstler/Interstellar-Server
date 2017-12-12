//dom references
var disembarkationViewButton = $("#disembarkationViewButton"),
	fuelViewButton = $("#fuelViewButton"),
	airlockViewButton = $("#airlockViewButton"),
	rampsViewButton = $("#rampsViewButton"),
	clampsViewButton = $("#clampsViewButton"),
	airlockView = $("#airlockView"),
	fuelView = $("#fuelView"),
	rampsView = $("#rampsView"),
	disembarkationView = $("#disembarkationView");

//variables

//init calls

//preset observers

//database observers

//functions
function openView(view){
	view.slideDown();
	if(disembarkationView != view){
		disembarkationView.fadeOut();
	}
	if(fuelView != view){
		fuelView.fadeOut();
	}
	if(airlockView != view){
		airlockView.fadeOut();
	}
	if(rampsView != view){
		rampsView.fadeOut();
	}
}
//event handlers
disembarkationViewButton.click(function(){openView(disembarkationView)});
fuelViewButton.click(function(){openView(fuelView)});
airlockViewButton.click(function(){openView(airlockView)});
rampsViewButton.click(function(){openView(rampsView)});
//intervals