var randomVariantionInterval = null;
var displayedSystemStatus;
var displayType = 2;
var systemStatus;
var selectedSystem = "";
var levelOneDiagnostic = $("#levelOneDiagnostic");
var levelTwoDiagnostic = $("#levelTwoDiagnostic");
var levelThreeDiagnostic = $("#levelThreeDiagnostic");
var diagnosticTimeRequired = 0;
var selectedDiagnosticLevel = 1;
var checkTimer = undefined;

$.getJSON('/resource?path=public/systemStatus.json', function(systemStatusJSONFile) {
	onDatabaseValueChange("systems.efficency",function(newData){
		if(newData == null){
			setDatabaseValue("systems.efficency",systemStatusJSONFile);
			return;
		}
		systemStatus = newData;
		displayedSystemStatus = IFDeepCopyArray(newData);
		drawSystemEfficency();
		if(randomVariantionInterval == null){
			randomVariantionInterval = setInterval(function(){
				var variation = randomIntFromInterval(-1,1);
				var randomSystem = randomIntFromInterval(0,systemStatus.length - 1);
				var initalValue = systemStatus[randomSystem].systemEfficency;
				if(!((initalValue + variation) > 100)){
					var fluxValue = initalValue + variation;
					displayedSystemStatus[randomSystem].systemEfficency = fluxValue;
				}
				drawSystemVariations(randomSystem);
			},randomIntFromInterval(0100,0300));
		}
		for(var i = 0;i < displayedSystemStatus.length;i++){
			var systemName = displayedSystemStatus[i].systemName;
			var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
			$("#" + systemID).on("click",function(event){
				systemClicked(event);
			});
		}
	});
});

function findIndexForSystem(passedSystem){
	for(var i = 0;i < displayedSystemStatus.length;i++){
		var systemName = displayedSystemStatus[i].systemName;
		var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
		if(systemID == passedSystem){
			return i;
		}
	}
}

$("#runDiagnosticButton").on("click",function(){
	if(selectedSystem != ""){
		$("#changeDisplayViewButton").fadeOut("slow");
		$("#runDiagnosticButton").fadeOut("slow",function(){
			$("#backToSystemStatusButton").fadeIn("slow");
		});
		$("#pleaseSelectASystemFirst").css("display" , "none");
		console.log(findIndexForSystem(selectedSystem));
		for(let i = 0;i < displayedSystemStatus.length;i++){
			setTimeout(function(){
				console.log(i);
				var systemName = displayedSystemStatus[i].systemName;
				var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
				if(systemID != selectedSystem){
					$("#" + systemID).css("display","none");
					$("#" + systemID + "_ProgressBar").css("display","none");
				}
			},0100 * i);
			setTimeout(function(){
				let timer = setInterval(function(){
					var posTop = $("#" + selectedSystem).position().top;
					$("#" + selectedSystem).css("top",posTop - 1);
					$("#" + selectedSystem + "_ProgressBar").css("top",posTop - 1);
					if((posTop - 1) <= 130){
						clearInterval(timer);
						$("#diagnosticSystemName").html(displayedSystemStatus[findIndexForSystem(selectedSystem)].systemName);
						$("#diagnosticSystemName").fadeIn("slow");
						$("#diagnosticSystemEfficency").html(displayedSystemStatus[findIndexForSystem(selectedSystem)].systemEfficency + "%");
						$("#diagnosticSystemEfficency").fadeIn("slow");
						levelOneDiagnostic.fadeIn("slow");
						$("#levelOneDiagnosticContentArea").slideDown("slow",function(){
							levelTwoDiagnostic.fadeIn("slow");
							$("#levelTwoDiagnosticContentArea").slideDown("slow",function(){
								levelThreeDiagnostic.fadeIn("slow");
								$("#levelThreeDiagnosticContentArea").slideDown("slow",function(){

								});
							});
						});
					}
				},0010);
			},0100 * findIndexForSystem(selectedSystem));
		}
	}else{
		$("#pleaseSelectASystemFirst").css("display" , "block");
		setTimeout(function(){
			$("#pleaseSelectASystemFirst").css("display" , "none");
		},7000);
	}
});
function getTimePassedInSeconds(timeA,timeB){
	if(timeB == undefined){
		//if a timeB isn't specified, assume current time
		timeB = new Date();
	}
	return 0;
	var hours = timeA.getHours();
	var minutes = timeA.getMinutes();
	var seconds = timeA.getSeconds();
	var miliseconds = timeA.getMilliseconds();
	console.log("Hours: " + hours + " Minutes:" + minutes + " Seconds:" + seconds + " Miliseconds:" + miliseconds);
	return 0;
}
onDatabaseValueChange("systems.currentDiagnostic",function(newData){
	console.log(newData);
	var progress = (newData.timePassed / newData.timeRequired) * 100;
	$("#diagnosticProgress").html(progress + "% COMPLETE");
});
$("#startDiagnosticButton").on("click",function(){
	setDatabaseValue("systems.currentDiagnostic",
	{
		"system" : selectedSystem,
		"timeRequired" : diagnosticTimeRequired,
		"timePassed" : 0,
		"level" : selectedDiagnosticLevel
	});
	setDatabaseValue("systems.runningDiagnostic",true);
})
$("#changeDisplayViewButton").on("click",function(){
	if(displayType == 1){
		displayType = 2;
		$("#changeDisplayViewButton").html("<center>DISPLAY IN GRID VIEW</center>");
	}else{
		displayType = 1;
		$("#changeDisplayViewButton").html("<center>DISPLAY IN GRAPH VIEW</center>");
	}
	drawSystemEfficency();
});

$("#runLevel1DiagnosticButton").on("click",function(){
	selectedDiagnostic(1);
});
$("#runLevel2DiagnosticButton").on("click",function(){
	selectedDiagnostic(2);
});
$("#runLevel3DiagnosticButton").on("click",function(){
	selectedDiagnostic(3);
});

function getDifferenceBetweenTimes(timeA,timeB){
	//
	//credit: stack overflow (http://stackoverflow.com/a/1788084/3781277)
	//

	var date1 = timeA; // 9:00 AM
	var date2 = timeB; // 5:00 PM

	// the following is to handle cases where the times are on the opposite side of
	// midnight e.g. when you want to get the difference between 9:00 PM and 5:00 AM

	if (date2 < date1) {
		date2.setDate(date2.getDate() + 1);
	}

	return (date2 - date1);
}

function selectedDiagnostic(level){
	selectedDiagnosticLevel = level;
	switch(level){
		case 1:
		diagnosticTimeRequired = randomIntFromInterval(27,38);
		break;
		case 2:
		diagnosticTimeRequired = randomIntFromInterval(75,200);
		break;
		case 3:
		diagnosticTimeRequired = randomIntFromInterval(250,450);
		break;
	}
	var minutes = Math.floor(diagnosticTimeRequired / 60);
	var seconds = diagnosticTimeRequired - (minutes * 60);
	if(minutes > 0){
		$("#timeRequiredSpan").html(minutes + " MINUTES, " + seconds + " SECONDS");
	}else{
		$("#timeRequiredSpan").html(seconds + " SECONDS");
	}
	$("#runLevel1DiagnosticButton").fadeOut("fast");
	$("#runLevel2DiagnosticButton").fadeOut("fast");
	$("#runLevel3DiagnosticButton").fadeOut("fast");
	levelOneDiagnostic.fadeOut("slow");
	$("#levelOneDiagnosticContentArea").slideUp("fast",function(){
		levelTwoDiagnostic.fadeOut("slow");
		$("#levelTwoDiagnosticContentArea").slideUp("fast",function(){
			levelThreeDiagnostic.fadeOut("slow");
			$("#levelThreeDiagnosticContentArea").slideUp("fast",function(){
				$("#confirmDiagnosticStart").fadeIn("fast",function(){
					$("#timeRequiredBox").slideDown("slow",function(){
						$("#startDiagnosticButton").fadeIn("slow",function(){
							$("#cancelSelectedDiagnosticButton").fadeIn("slow");
						});
					});
				})
			});
		});
	});
}

function drawSystemVariations(systemIndex){
	if(displayType == 2){
		var systemName = displayedSystemStatus[systemIndex].systemName;
		var systemEfficency = displayedSystemStatus[systemIndex].systemEfficency;
		var redColor = 100 - systemEfficency;
		var greenColor = 75;
		var blueColor = systemEfficency;

		if(systemEfficency < 30){
			greenColor = 25;
		}
		if(redColor < 0){
			redColor = 0;
		}else if(redColor > 100){
			redColor = 100;
		}
		if(greenColor < 0){
			greenColor = 0;
		}else if(greenColor > 100){
			greenColor = 100;
		}
		if(blueColor < 0){
			blueColor = 0;
		}else if(blueColor > 100){
			blueColor = 100;
		}

		var widthOfBox = $('#systemArea').width() * .84;
		var heightOfEachRow = ((($("#systemArea").height() - 100) - displayedSystemStatus.length * 2) / displayedSystemStatus.length)
		var color = "rgb(" + redColor + "%," + greenColor + "%," + blueColor + "%)";
		var cellWidth = Math.floor(widthOfBox / 100);
		var html = "";
		for(var j = 0;j < systemEfficency;j++){
			html += "<div class='progressBarCell system' style='left: " + j * (cellWidth + 1) + "px; width:" + cellWidth + "px;background-color:" + color + ";height:" + heightOfEachRow + "px'>";
			html += "</div>"
		}
		var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
		$("#" + systemID + "_ProgressBar").html(html);
		html = "";
		$("#" + systemID + "_systemEfficencyLabel").html(systemEfficency + "%");
		$("#" + systemID + "_systemEfficencyLabel").css("color",color)
	}
}

function drawDiagnosticInfo(){
	var html = "<div id='diagnosticSystemName'>NO SYSTEM</div><div id='diagnosticSystemEfficency'>0%</div>";
	$("#systemArea").append(html);
}

function drawSystemEfficency(){

	if(displayType == 1){
		//BOX SYSTEM
		var html = "";
		var widthOfBox = $('#systemArea').width();
		var colCount = 0;
		var rowCount = 0;
		for(var i = 0;i < displayedSystemStatus.length;i++){
			var systemName = displayedSystemStatus[i].systemName;
			var systemEfficency = displayedSystemStatus[i].systemEfficency;
			var leftPos = (colCount * (widthOfBox / 8));
			if((leftPos + 125) > widthOfBox){
				colCount = 0;
				rowCount++;
				var leftPos = (colCount * (widthOfBox / 8));
			}
			var redColor = 100 - systemEfficency;
			var greenColor = 75;
			var blueColor = systemEfficency;

			if(systemEfficency < 30){
				greenColor = 25;
			}
			var color = "background-color:rgb(" + redColor + "%," + greenColor + "%," + blueColor + "%)";
			html += "<div id='" + systemName + "_System' class='systemBox' style='top:" + ((rowCount * 125) + 100) + "px;left:" + leftPos + "px;width:" + 125 + "px'>";
			html += "<div id'" + systemName + "_Box' class='systemEfficency' style='" + color + "'>" + systemEfficency + "</div>";
			html += "<div id='" + systemName + "_Title' class='systemTitle'>" + systemName + "</div>";
			html += "</div>";
			colCount++;
		}
		$('#systemArea').html(html);
	}else{
		//BAR SYSTEM
		
		var html = "";
		var widthOfBox = $('#systemArea').width() * .84;
		var rowCount = 0;
		for(var i = 0;i < displayedSystemStatus.length;i++){
			var systemName = displayedSystemStatus[i].systemName;
			var systemEfficency = displayedSystemStatus[i].systemEfficency;
			var redColor = 100 - systemEfficency;
			var greenColor = 75;
			var blueColor = systemEfficency;

			if(systemEfficency < 30){
				greenColor = 25;
			}
			if(redColor < 0){
				redColor = 0;
			}else if(redColor > 100){
				redColor = 100;
			}
			if(greenColor < 0){
				greenColor = 0;
			}else if(greenColor > 100){
				greenColor = 100;
			}
			if(blueColor < 0){
				blueColor = 0;
			}else if(blueColor > 100){
				blueColor = 100;
			}
			var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
			var heightOfEachRow = ((($("#systemArea").height() - 100) - displayedSystemStatus.length * 2) / displayedSystemStatus.length)
			var color = "rgb(" + redColor + "%," + greenColor + "%," + blueColor + "%)";
			html += "<div id='" + systemID + "' class='graphSystemName' style='top:" + ((rowCount * (heightOfEachRow + 5)) + 55) + "px;height:" + heightOfEachRow + "px;left: 0%;width:17%'>";
			html += "(<span style='color:" + color + "' id='" + systemID + "_systemEfficencyLabel'>" + systemEfficency + "%</span>)  " + systemName;
			html += "</div>";
			html += "<div id='" + systemID + "_ProgressBar' class='progressBarBackground' style='top:" + ((rowCount * (heightOfEachRow + 5)) + 55) + "px;left: 17%;height:" + heightOfEachRow + "px'>";
			var cellWidth = Math.floor(widthOfBox / 100);
			for(var j = 0;j < systemEfficency;j++){
				html += "<div class='progressBarCell' style='left: " + j * (cellWidth + 1) + "px; width:" + cellWidth + "px;background-color:" + color + ";height:" + heightOfEachRow + "px'>";
				html += "</div>"
			}
			html += "</div>"
			rowCount++;
		}
		html += "<div id='systemAreaLabelDiv'>";
		html += "SHIPWIDE SYSTEM EFFICIENCY";
		html += "</div>";
		$('#systemArea').html(html);
		drawDiagnosticInfo();
	}
}

function systemClicked(event){
	if(selectedSystem == event.currentTarget.id){
		//deselect
		selectedSystem = event.currentTarget.id;
		selectedSystem = "";
		for(var i = 0;i< displayedSystemStatus.length;i++){
			var systemName = displayedSystemStatus[i].systemName;
			var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
			$("#" + systemID).css("color", "white");
		}
	}else{
		selectedSystem = event.currentTarget.id;
		$(event.currentTarget).css("color", "#42b3f4");
		for(var i = 0;i< displayedSystemStatus.length;i++){
			var systemName = displayedSystemStatus[i].systemName;
			var systemID = systemName.replace(/\s+/g, '-').toLowerCase();
			if(systemID != selectedSystem){

				$("#" + systemID).css("color", "#868889");
			}
		}
	}
}

function randomIntFromInterval(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}
