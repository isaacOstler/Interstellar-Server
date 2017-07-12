$("#officersLogTimestamp").val(new Date());
setInterval(function(){
	$("#officersLogTimestamp").val(new Date());
},1000);

$("#clearLogDiv").on("click",function(){
	var audio = new Audio('/resource?path=public/Accessing1.wav');
	audio.play();
	$("#officersLogTextArea").val("");
});