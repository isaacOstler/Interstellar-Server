var transporterTargets = [];
var systemIsDamaged = false;
var systemIsPowered = true;
var sensorTimer = undefined;
var transportProgress = 0;
var transportAnimation = undefined;
var transportInProgress = false;
var lastDirection = 0;
var draggingX = false;
var selectedTarget = null;
var draggingY = false;
var xPosForXBar = 0;
var transportObjects = [];
var directionMoving = 1;
var xDirectionMoving = 1;
var isScanning = false;
var scanningAnimationInterval = undefined;
var noTargetsFound = false;

drawTargetLockGUI();
xPosForXBar = $("#xTarget").width() / 2;

Interstellar.onDatabaseValueChange("transporters.noTargetsFound",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.noTargetsFound",false);
		return;
	}
	noTargetsFound = newData;
	if(newData == true){
		Interstellar.setDatabaseValue("transporters.noTargetsFound",false);
		$("#scanningLabel").css("background-color","red");
		$("#scanningLabel").html("NO TARGET FOUND");
		setTimeout(function(){
			$("#scanningLabel").fadeOut("slow",function(){
				$("#scanningLabel").css("background-color","#4a8ea8");
				$("#scanningLabel").html("SCANNING FOR TRANSPORTER TARGET...");
			})
		},4000);
	}
})

Interstellar.onDatabaseValueChange("transporters.transportTargets",function(newData){
	if(newData == null){
		var newTransportObjects = [/*{
			"name" : "Isaac",
			"xPos" : .4,
			"yPos" : .8
		},{
			"name" : "Isaac",
			"xPos" : .25,
			"yPos" : .16
		},{
			"name" : "Isaac",
			"xPos" : .12,
			"yPos" : .53
		},{
			"name" : "Isaac",
			"xPos" : .12,
			"yPos" : .35
		}*/];
		Interstellar.setDatabaseValue("transporters.transportTargets",newTransportObjects);
		return;
	}
	transportObjects = newData;
	drawTargetLockGUI();
})

Interstellar.onDatabaseValueChange("transporters.isScanning",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.isScanning",false);
		return;
	}
	isScanning = newData;
	if(newData){
		document.getElementById("scanButton").className = "Button2Disabled noselect";
		document.getElementById("cancelButton").className = "Button2 noselect beepOnClick";
		$("#target").prop('disabled', true);
		$("#destination").prop('disabled', true);
		$("#scanningLabelContainer").fadeIn("slow");
		
		if(scanningAnimationInterval != undefined){
			return;
		}
		scanningAnimationInterval = setInterval(function(){
			var yPos = $("#xTarget").position().top;
			var maxYPos = $("#targetLock").height() - $("#xTarget").height() - 4;
			var maxXPos = $("#targetLock").width() - 24;
			if(yPos <= 0){
				directionMoving = 1;
			}else if(yPos >= maxYPos){
				directionMoving = -1;
			}

			if(xPosForXBar <= 0){
				xDirectionMoving = 1;
			}else if(xPosForXBar >= maxXPos){
				xDirectionMoving = -1;
			}
			xPosForXBar += xDirectionMoving;
			yPos += directionMoving;
			$("#xTarget").css("top",yPos + "px");
			drawTargetLockGUI();
		},0010);
	}else{
		document.getElementById("scanButton").className = "Button2 noselect beepOnClick";
		document.getElementById("cancelButton").className = "Button2Disabled noselect";
		if(!noTargetsFound){
			$("#scanningLabelContainer").fadeOut("slow");
		}
		$("#target").prop('disabled', false);
		$("#destination").prop('disabled', false);
		if(scanningAnimationInterval != undefined){
			clearInterval(scanningAnimationInterval);
			scanningAnimationInterval = undefined;
		}
	}
})

Interstellar.onDatabaseValueChange("transporters.destination",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("#transporters.destination","");
		return;
	}
	$("#destination").val(newData);
})

Interstellar.onDatabaseValueChange("transporters.target",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("#transporters.target","");
		return;
	}
	$("#target").val(newData);
})

$("#scanButton").on("click",function(event){
	if(isScanning != true){
		Interstellar.setDatabaseValue("transporters.target",$("#target").val());
		Interstellar.setDatabaseValue("transporters.destination",$("#destination").val());
		Interstellar.setDatabaseValue("transporters.transportTargets",[]);
		Interstellar.setDatabaseValue("transporters.isScanning",true);
	}
});
$("#cancelButton").on("click",function(event){
	if(isScanning != false){
		Interstellar.setDatabaseValue("transporters.target","");
		Interstellar.setDatabaseValue("transporters.destination","");
		Interstellar.setDatabaseValue("transporters.isScanning",false);
	}
})
function drawTargetLockGUI(){
	$('#targetLock').each(function(){$(this).closest('div').find('.possibleTransportObject').remove();});  
	for(var i = 0;i < transportObjects.length;i++){
		$("#targetLock").append("<div id='transportTarget_" + i + "' class='target possibleTransportObject' style='top: " + (transportObjects[i].yPos * 100) + "%;left: " + (transportObjects[i].xPos * 100) + "%;animation-duration: 2s;animation-iteration-count: infinite;'></div>");
		$("#targetLock").append("<div class='possibleTransportObject' style='top: " + ((transportObjects[i].yPos * 100) + 3) + "%;left: " + ((transportObjects[i].xPos * 100) - 1) + "%;width:20px;text-align:center;position:absolute;font-size:14px;'>" + transportObjects[i].name + "</div>")
	}
	var html = "";

	var heightOfBox = $("#xTarget").height();
	var widthOfBox = $("#xTarget").width();

	widthOfBox -= (widthOfBox * .02);
	var widthOfEachBar = (widthOfBox / 2) - (widthOfBox * .01);
	var percentageLeftForCircle = xPosForXBar / widthOfBox;
	selectedTarget = null;
	for(var i = 0;i < transportObjects.length;i++){
		var element = document.getElementById("transportTarget_" + i);
		if(percentageLeftForCircle > (transportObjects[i].xPos - .015) && percentageLeftForCircle < (transportObjects[i].xPos + .015)){
			var posTop = $("#xTarget").position().top + ($("#xTarget").height() / 2);
			console.log((transportObjects[i].yPos - .015) * $("#targetLock").height());
			if(posTop > ((transportObjects[i].yPos - .015) * $("#targetLock").height()) && posTop < ((transportObjects[i].yPos + .02) * $("#targetLock").height())){
				$("#transportTarget_" + i).css("border-color","red");
				element.style.webkitAnimationName = 'targeted';
				selectedTarget = i;
			}else{
				$("#transportTarget_" + i).css("border-color","white");
				element.style.webkitAnimationName = '';
			}
		}else{
			$("#transportTarget_" + i).css("border-color","white");
			element.style.webkitAnimationName = '';
		}
	}

	html += "<div id='xTarget' style='position:absolute;top:10%;left:0px;width:100%;height:20px;'></div>"
	html += "<div class='lockOnBar' style='width:" + ((percentageLeftForCircle - .01) * widthOfBox) + "px;left:1%;top:9px;height:2px'></div>";
	html += "<div class='target' style='width:20px;height:20px;left:" + (xPosForXBar) + "px;top:0px;cursor:crosshair'></div>";
	html += "<div class='lockOnBar' style='width:" + ((widthOfBox - ((percentageLeftForCircle - .01) * widthOfBox)) - 21) + "px;right:1%;top:9px;height:2px'></div>";
	html += "</div>";

	$("#xTarget").html(html);
	/*setInterval(function(){
		var maxYPos = $("#targetLock").height();
		var yPos = $("#xTarget").position().top;
		console.log(yPos + "/" + maxYPos);
		if(yPos > maxYPos){
			directionMoving = -1;
		}else if(yPos < 0){
			directionMoving = 1;
		}
		yPos += directionMoving;
		$("#xTarget").css("top",yPos + "px");
	},0010);*/
}
$("#xTarget").mousedown(function(event){
	draggingX = true;
});
$("#targetLock").mouseup(function(event){
	draggingX = false;
});
$("#targetLock").mousemove(function(event){
	if(draggingX){
		var top = event.pageY - $("#targetLock").offset().top;
		var heightOfBox = $("#xTarget").height();
		top -= heightOfBox / 2;
		$("#xTarget").css("top",top);
		xPosForXBar = (event.pageX - $("#targetLock").offset().left) - 10;
		drawTargetLockGUI();
	}
})

Interstellar.onDatabaseValueChange("ship.systems",function(newData){
	console.log(newData);
	if(newData == null){
		return;
	}
	for(var i = 0;i< newData.length;i++){
		if(newData[i].systemName == "TRANSPORTERS"){
			systemIsDamaged = newData[i].isDamaged;
			if(systemIsDamaged){
				$("#systemStatusHeader").html("TRANSPORTERS OFFLINE");
				$("#systemStatusHeader").fadeIn("slow");
			}else{
				if(newData[i].systemPower > (newData[i].requiredPower[0] - 1)){
					systemIsPowered = true;
					$("#systemStatusHeader").fadeOut("slow",function(){
						$("#systemStatusHeader").html("");
					});
				}else{
					systemIsPowered = false;
					$("#systemStatusHeader").html("ADDITIONAL POWER REQUIRED");
					$("#systemStatusHeader").fadeIn("slow");
				}
			}
			return;
		}
	}
});

$("#sensor").mouseover(function(event){
	$("#sensor").css("height","2%");
	$("#sensor").css("bottom",((100 * transportProgress) - 0.5) + "%");
	if(sensorTimer != undefined){
		clearInterval(sensorTimer);
		sensorTimer = undefined;
	}
});

Interstellar.onDatabaseValueChange("transporters.isTransporting",function(newData){
	if(newData == null){
		Interstellar.setDatabaseValue("transporters.isTransporting",false);
		return;
	}
	if(newData){
		$("#isTransporting").html("TRANSPORTING...");
	}else{
		$("#isTransporting").html("");
	}
})

$("#sensor").mousemove(function(event){
	if(transportInProgress){
		lastDirection = event.pageY;
		return;
	}
	if(event.pageY > lastDirection){
		//movingDown
		if(transportProgress - .002 < 0){
			lastDirection = event.pageY;
			return;
		}
		transportProgress -= .002;
		$("#powerLevels").css("height",100 * transportProgress + "%");
		$("#sensor").css("bottom",((100 * transportProgress) - 0.5) + "%");
		Interstellar.setDatabaseValue("transporters.transportProgress",transportProgress);
	}else if(event.pageY < lastDirection){
		//movingUp
		transportProgress += .002;
		$("#powerLevels").css("height",100 * transportProgress + "%");
		$("#sensor").css("height","2%");
		$("#sensor").css("bottom",((100 * transportProgress) - 0.5) + "%");
		Interstellar.setDatabaseValue("transporters.transportProgress",transportProgress);
	}
	if(transportProgress >= .96){
		transportInProgress = true;
		if(selectedTarget != null){
			var arrayOfTransporterTargets = [];
			for(var i = 0;i < transportObjects.length;i++){
				if(selectedTarget != i){
					arrayOfTransporterTargets.splice(arrayOfTransporterTargets.length,0,transportObjects[i]);
				}
			}
			if(arrayOfTransporterTargets.length == 0){
				$("#target").val("");
				$("#destination").val("");
			}
			Interstellar.setDatabaseValue("transporters.transportTargets",arrayOfTransporterTargets);
		}
		Interstellar.setDatabaseValue("transporters.isTransporting",true);
		Interstellar.setDatabaseValue("transporters.transportProgress",0);
		transportAnimation = setInterval(function(){
			transportProgress -= .002;
			$("#powerLevels").css("height",100 * transportProgress + "%");
			$("#sensor").css("height","2%");
			$("#sensor").css("bottom",((100 * transportProgress) - 0.5) + "%");
			if(transportProgress < 0){
				transportProgress = 0;
				transportInProgress = false;
				clearInterval(transportAnimation);
				transportAnimation = undefined;
				$("#sensor").css("bottom",1 + "%");
				Interstellar.setDatabaseValue("transporters.isTransporting",false);
			}
		},0010);
		lastDirection = 0;
		clearInterval(sensorTimer);
		return;
	}
	lastDirection = event.pageY;
})

$("#sensor").mouseout(function(event){
	$("#sensor").css("height","2%");
	$("#sensor").css("bottom",((100 * transportProgress) - 0.5) + "%");
	sensorTimer = setInterval(function(){
		if(transportProgress - .00075 < 0){
			return;
		}
		transportProgress -= .00075;
		Interstellar.setDatabaseValue("transporters.transportProgress",transportProgress);
		$("#powerLevels").css("height",100 * transportProgress + "%");
		$("#sensor").css("bottom",((100 * transportProgress) - 0.5) + "%");
	},0003);
})