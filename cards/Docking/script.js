//dom references
var disembarkationViewButton = $("#disembarkationViewButton"),
	fuelViewButton = $("#fuelViewButton"),
	airlockViewButton = $("#airlockViewButton"),
	rampsViewButton = $("#rampsViewButton"),
	clampsViewButton = $("#clampsViewButton"),
	airlockView = $("#airlockView"),
	fuelView = $("#fuelView"),
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
}
//event handlers
disembarkationViewButton.click(function(event){openView(disembarkationView)});
fuelViewButton.click(function(event){openView(fuelView)});
airlockViewButton.click(function(event){openView(airlockView)});
//intervals