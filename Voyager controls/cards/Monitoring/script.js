
Interstellar.onDatabaseValueChange("systems.efficency",function(newData){
	if(newData == null){
		//we are not responsible for populating this field.  See the System-Status card
		return;
	}

	var canvas = document.getElementById("systemListCanvas");
	for(var i = 0;i < newData.length;i++){
		var ctx = canvas.getContext("2d");
		ctx.moveTo(600,100 * i);
		ctx.lineTo(300,100 * i);
		ctx.font = "30px Arial";
		ctx.fillText("Hello World",10,50);
		ctx.strokeStyle="#FFFFFF";
		ctx.stroke();
	}
});