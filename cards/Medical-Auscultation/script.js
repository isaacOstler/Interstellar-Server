/*$("#heartSounds").prop("volume", 0);
$("#stomachSounds").prop("volume", 0);
$("#lungSounds").prop("volume", 0);

$("#patientBody").mousemove(function(event){
	var xPosInPercentage = event.originalEvent.offsetY / $("#patientBody").height();
	var heartVolume = 1 - (Math.abs(.25-xPosInPercentage)/.25);
	var stomachVolume = 1 - (Math.abs(.4-xPosInPercentage)/.4);
	var lungVolume = 1 - (Math.abs(.3-xPosInPercentage)/.4);
	//var heartVolume = (1 - Math.abs(.25 - xPosInPercentage) * 4);
	//var stomachVolume = (1 - Math.abs(.04 - xPosInPercentage) * 4);
	if(heartVolume < 0){
		heartVolume = 0;
	}
	if(stomachVolume < 0){
		stomachVolume = 0;
	}
	if(lungVolume < 0){
		lungVolume = 0;
	}
	$("#heartSounds").prop("volume", heartVolume);
	$("#stomachSounds").prop("volume", stomachVolume);
	$("#lungSounds").prop("volume", lungVolume);
	//$("#number").html("Heart Volume: " + (heartVolume * 100) + "%<br />Stomach Volume: " + (stomachVolume * 100) + "%<br />" + Math.abs(.25 - xPosInPercentage));
})*/


var heartEKGPastValuesArray = [0];
var heartEKG = document.getElementById("heartEKG");
var heartCTX = heartEKG.getContext("2d");
//drawing the heart EKG interval
var lastXCords = 0;
var heartEKGValue = 0;
var lastHeartEKGValue = 0;

var normalHeartRythum = [1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,6,6,6,6,6,5,5,5,4,4,4,3,3,3,2,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-2,-2,-2,-2,-2,-2,-3,-3,-3,-3,-3,-3,-3,-3,-3,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-5,-5,-5,-5,-5,-5,-3,-1,2,2,2,2,2,2,2,4,4,4,4,4,4,4,4,4,6,6,6,6,6,6,6,6,9,9,9,9,9,9,9,9,9,12,12,12,12,12,12,12,12,12,16,16,16,16,16,16,16,16,16,22,22,22,22,22,22,22,27,27,27,27,27,27,27,27,27,27,27,22,22,22,22,22,22,22,22,22,16,16,16,16,16,16,16,7,7,7,7,7,7,1,1,1,1,1,1,-3,-3,-3,-3,-3,-3,-5,-5,-5,-5,-5,-6,-6,-6,-6,-6,-6,-6,-7,-7,-7,-7,-7,-7,-7,-7,-7,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-9,-9,-9,-9,-9,-9,-9,-8,-8,-8,-7,-7,-7,-5,-5,-5,-5,-4,-4,-4,-4,-4,-4,-4,-3,-3,-3,-3,-3,-3,-3,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,6,6,6,6,6,5,5,5,4,4,4,3,3,3,2,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var cardiacArrest = [0];

var currentHeartRythum = normalHeartRythum;

var timeSinceLastHeartBeat = 0;
var heartRate = 80;
var didBeatForHeart = false;
var heartBeatTime = 0;
var alarmIsPlaying = false;
var alarmObject;
var timesAlarmHasLooped = 0;
var maxTimesAlarmCanLoop = 10;

var cardiacArrestFlashingTimer;
var cardiacArrestIsDisplayed = false;

var trueBeatsASecond = 0;
var firstTime = true;
//heartEKG.width(($(window).width() / 2)).height($(window).height() / 10);

document.getElementById("heartEKG").width = $("#pulseRate").width() * .8;

function drawGrid(graph){
	switch(graph){
		case 1:
	 	heartEKG = document.getElementById("heartEKG");
		var ctx = heartEKG.getContext("2d");
		ctx.setLineDash([5,2]);
		ctx.beginPath();
		for(var i = 0;i < ($("#heartEKG").height() / 10) + 1; i++){
			ctx.moveTo(0,i * 10);
			ctx.lineTo($("#heartEKG").width(),i * 10);
		}
		ctx.lineWidth = .1;
		ctx.stroke();
		break;
	}
}


var pulseRateBox = document.getElementById('pulseInformationBox');
var respRateBox = document.getElementById('respInformationBox');
//var So2RateBox = document.getElementById('S02InformationBox');

pulseRateBox.addEventListener('webkitAnimationEnd', function(){
    this.style.webkitAnimationName = '';
}, false);
respRateBox.addEventListener('webkitAnimationEnd', function(){
    this.style.webkitAnimationName = '';
}, false);
/*So2RateBox.addEventListener('webkitAnimationEnd', function(){
    this.style.webkitAnimationName = '';
}, false);*/

function flashVitalInformationBox(box){
	switch(box){
		case 1:
    		pulseRateBox.style.animationDuration = (58 / heartRate) + "s";
    		pulseRateBox.style.webkitAnimationName = 'pulseBackgroundGreen';
		break;
		case 2:
    		respRateBox.style.animationDuration = (58 / heartRate) + "s";
    		respRateBox.style.webkitAnimationName = 'pulseBackgroundBlue';
		break;
		case 3:
    		So2RateBox.style.animationDuration = (58 / heartRate) + "s";
    		So2RateBox.style.webkitAnimationName = 'pulseBackgroundPink';
		break;
	}
}

setInterval(function(){
	if(((currentHeartRythum.length == 1 && currentHeartRythum[0] == 0) || heartRate == 0) && alarmIsPlaying == false){
		
		cardiacArrestFlashingTimer = setInterval(function(){
			if(cardiacArrestIsDisplayed){
				$("#cardiacArrestWarning").css("display","none");
			}else{
				$("#cardiacArrestWarning").css("display","block");
			}
			cardiacArrestIsDisplayed = !cardiacArrestIsDisplayed;
		},500);

		alarmIsPlaying = true;
		heartEKGValue = $("#heartEKG").width() / 2;
		myAudio = new Audio("/resource?path=public/EKG flatline alarm.wav"); 
		myAudio.addEventListener('ended', function() {
			if(currentHeartRythum.length != 1 && currentHeartRythum[0] != 0){
				timesAlarmHasLooped = 0;
				return;
			}
			timesAlarmHasLooped++;
			if(!(timesAlarmHasLooped >= maxTimesAlarmCanLoop)){
				this.currentTime = 0;
				this.play();
			}
		}, false);
		myAudio.volume = 1;
		myAudio.play();
		alarmObject = myAudio;
		return;
	}else{
		if(currentHeartRythum.length != 1 && currentHeartRythum[0] != 0){
			clearInterval(cardiacArrestFlashingTimer);
			if(alarmObject != undefined){
				alarmIsPlaying = false;
				alarmObject.volume = 0;
				$("#cardiacArrestWarning").css("display","none");
			}
		}
	}
	timeSinceLastHeartBeat += .001;
	$("#pulseRatePerMinute").html(heartRate);
	if((60 / heartRate) - (currentHeartRythum.length * .001) <= timeSinceLastHeartBeat){
		heartEKGValue = (heartEKG.height / 1.5) - (currentHeartRythum[Math.floor(heartBeatTime)] * 3.5) + (Math.random() * 2);
		heartBeatTime += (heartRate / 60);
		if(currentHeartRythum[Math.floor(heartBeatTime)] == 1 && !didBeatForHeart){
			trueBeatsASecond++;
			didBeatForHeart = true;
			var snd = new Audio("/resource?path=public/EKG heart beat.wav");
			snd.play();
			flashVitalInformationBox(1);
			flashVitalInformationBox(2);
		}
		if(currentHeartRythum.length < heartBeatTime){
			didBeatForHeart = false;
			timeSinceLastHeartBeat = 0;
			heartBeatTime = 0;
			var newHeartValue = Math.round(Math.random() * 2)
			if(Math.random() > .5){
				heartRate += newHeartValue;
			}else{
				heartRate -= newHeartValue;
			}
		}
	}else{
		heartEKGValue = (heartEKG.height / 1.5) + Math.random() * 1.5;
	}
},1);
setInterval(function(){
	if(firstTime){
		firstTime = false;
		drawGrid(1);
	}
	if(lastXCords > $(heartEKG).width()){
		lastXCords = 0;
		drawGrid(1);
	}
	heartCTX.beginPath();
	heartCTX.setLineDash([]);
	heartCTX.moveTo(lastXCords, lastHeartEKGValue);
	heartCTX.lineTo(lastXCords + .1,heartEKGValue);
	heartCTX.clearRect(lastXCords + .2, 0, 30, $(heartEKG).height());
	lastHeartEKGValue = heartEKGValue;
	lastXCords += .1;
	heartCTX.strokeStyle = '#00ff04';
	heartCTX.lineWidth = 2;
	heartCTX.stroke();
},1);