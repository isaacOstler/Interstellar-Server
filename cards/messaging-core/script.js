var messagingCoreHasInit = false;
Interstellar.addCoreWidget("Login Names",function(){
	if(messagingCoreHasInit){
		return;
	}
	messagingCoreHasInit = true;
	var thisWidget = this;

	//variables

	//DOM References

	//init calls

	//interstellar calls
	thisWidget.onResize = function(){
		//do nothing
	}
	
	//functions

	//preset observers

	//database observers
	
	//event handlers
	$(".messagingCore_channels_messageContainer_message_message").on("cut paste input",function(event){
		console.log($(event.target).html());
	});
});