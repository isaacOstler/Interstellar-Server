//copyright, isaac ostler, january 8th 2018

//use to create power distribution displays, (drag the power bar up and down).
//DOES NOT connect by default to a database.  You must set your own event listeners
//using the public functions (see definitions below).

//*** This widget requires JQuery!

// CLASS NAME: PowerDistributionDisplay
// PURPOSE: to draw a user interface for power levels
// TAKES:
//			HTML Canvas (Jquery DOM reference) - The canvas you want to use
//			ARRAY 							   - The list of systems to use (see example below)

/*
	SYSTEMS ARRAY
	[
		{
			"systemName" : "warp engines", 				//the name of the system
			"systemPower" : 0,			   				//the default power level
			"systemRequiredPowerLevels" : [10,15,...],  //the required power levels
			"isDamaged" : false							//is the system damaged?
		}
	]
*/

//use .on('dragStart',function(){...}) for changes BEFORE the user releases the mouse
//use .on('drag',function(){...}) for changes whenever the user drags the mouse
//use .on('dragFinish',function(){...}) for changes AFTER the user releases the mouse

var PowerDistributionDisplay = function(passedCanvas,passedSystems){
	//public functions

	this.getSystems = function(){
		return getSystems();
	}

	this.setSystems = function(newSystems){
		setSystems(newSystems);
	}

	this.getGUID = function(){
		return classGUID;
	}

	this.on = function(event,callback){
		if(event == "dragStart"){
			onDragStartCallback = callback;
		}else if(event == "drag"){
			onDragCallback = callback;
		}else if(event == "dragFinish"){
			onDragFinishCallback = callback;
		}else{
            throw new Error("Unrecognized event handler: '" + event + "'");
		}
	}

	//DOM references

	//variables
	var canvas = passedCanvas,
		systems = passedSystems,
		charWidth = 7,
		powerBoxPosition,
		cellWidth,
		classGUID = uuidv4(),
		onDragFinishCallback = undefined,
		onDragStartCallback = undefined,
		onDragCallback = undefined;

	//init calls
	drawCanvas(systems);
	//preset observers

	//database observers

	//functions
	function drawCanvas(displayedSystems){
		var ctx = canvas[0].getContext('2d');
		var height = canvas.height();
		var width = canvas.width();

		canvas.attr("width",width);
		canvas.attr("height",height);

		var lineHeight = height / displayedSystems.length,
			highestPowerLevel = -1;
			longestSystemName = -1;

		//clear the canvas (in case this isn't the first draw)
		ctx.clearRect(0,0,width,height);

		//first we draw the names of the systems
		ctx.strokeStyle = "white";
		for(var i = 0;i < displayedSystems.length;i++){
			if(displayedSystems[i].systemName.length > longestSystemName){
				longestSystemName = displayedSystems[i].systemName.length;
			}
			if(displayedSystems[i].systemRequiredPowerLevels[displayedSystems[i].systemRequiredPowerLevels.length - 1] + 1 > highestPowerLevel){
				highestPowerLevel = displayedSystems[i].systemRequiredPowerLevels[displayedSystems[i].systemRequiredPowerLevels.length - 1] + 1;
			}
			ctx.fillStyle = "white";
			if(displayedSystems[i].isDamaged){
				ctx.fillStyle = "red";
			}
			ctx.font = (lineHeight * .7) + "px Arial";
			charWidth = (lineHeight * .5);
			ctx.fillText(displayedSystems[i].systemName.toUpperCase(),2,lineHeight * (i + 1) - (lineHeight * .2));
			ctx.fill();
		}
		//draw a dividing line
		ctx.moveTo(longestSystemName * charWidth,0);
		ctx.lineTo(longestSystemName * charWidth,height);

		//now draw the power levels

		ctx.beginPath();

		powerBoxPosition = (longestSystemName * charWidth);
		cellWidth = (width - powerBoxPosition) / highestPowerLevel;

		for(var i = 0;i < displayedSystems.length;i++){
			ctx.fillStyle = "#fff700";
			if(displayedSystems[i].isDamaged){
				ctx.fillStyle = "red";
			}
			for(var j = 0;j < displayedSystems[i].systemPower;j++){
				ctx.fillRect(powerBoxPosition + (cellWidth * j),lineHeight * i + (lineHeight * .05),cellWidth * .9,lineHeight * .9);
			}
			ctx.fill();
		}
		ctx.stroke();
	}

	function getSystems(){
		return systems;
	}

	function setSystems(newSystems){
		systems = newSystems;
		drawCanvas(systems);
	}

	function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
	  });
	}

	//event handlers

	//remove old power dist event handlers, in case this canvas isn't new
	canvas.off("mousedown.powerDistClass." + classGUID);
	canvas.on("mousedown.powerDistClass." + classGUID,function(event){
		let height = canvas.height(),
			width = canvas.width(),
			lineHeight = height / systems.length,
			relativeMouseY = event.pageY - canvas.offset().top,
			relativeMouseX = event.pageX - canvas.offset().left,
			selectedSystem = Math.floor(relativeMouseY / lineHeight),
			onChange = function(event){
				relativeMouseX = event.pageX - canvas.offset().left;
				relativeMouseY = event.pageY - canvas.offset().top;

				let	newPowerLevel = Math.floor((relativeMouseX - powerBoxPosition) / cellWidth);

				systems[selectedSystem].systemPower = newPowerLevel;

				drawCanvas(systems);
			}
		onChange(event);
		if(onDragStartCallback != undefined){
			onDragStartCallback(systems);
		}
		$(document.body).off("mousemove.powerDistClass." + classGUID);
		$(document.body).off("mouseup.powerDistClass." + classGUID);
		$(document.body).on("mousemove.powerDistClass." + classGUID,function(event){
			onChange(event);
			if(onDragCallback != undefined){
				onDragCallback(systems);
			}
		});
		$(document.body).on("mouseup.powerDistClass." + classGUID,function(event){
			onChange(event);
			$(document.body).off("mousemove.powerDistClass." + classGUID);
			$(document.body).off("mouseup.powerDistClass." + classGUID);
			if(onDragFinishCallback != undefined){
				onDragFinishCallback(systems);
			}
		});
	});
	//intervals
}