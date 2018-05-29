//copyright, isaac ostler, May 29th 2018

//use to create a thrusters user interface, specifically for UP AND DOWN THRUSTERS
//DOES NOT connect by default to a database.  You must set your own event listeners
//using the public functions (see definitions below).

//*** This widget requires JQuery!

// CLASS NAME: VerticalThrustersClass
// PURPOSE: to create a thrusters user interface
// TAKES:
//			HTML Canvas (Jquery DOM reference) - The canvas you want to use

//use .on('dragStart',function(){...}) for changes right as the user clicks, but has not started moving yet
//use .on('drag',function(){...}) for changes whenever the user drags the mouse
//use .on('dragFinish',function(){...}) for changes AFTER the user releases the mouse

var VerticalThrustersClass = function(passedCanvas){
	//public functions

	this.setThrust = function(newPower){
		power = newPower; //1 is all the way down, .5 is neutral, 0 is all the way up
		drawGUI();
	}

	this.refreshGUI = function(){
		drawGUI();
	}

	this.setLock = function(lockState){
		lock = lockState;
	}

	this.spring = function(springState){
		spring = springState;
	}

	this.getPower = function(){
		//becuase Isaac's brain was so fried when he
		//wrote this code, power is actually scaled strangley,
		//so we have to scale it here when returning the value
		return (power - .115) / (1 - .23);
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
	var power = .5,
		spring = true,
		lock = false,
		onDragStartCallback = null,
		onDragCallback = null,
		onDragFinishCallback = null;

	//init calls

	drawGUI();

	//preset observers

	//database observers

	//functions
	function drawGUI(){
		//draw top of arc
		var width = passedCanvas.width() * .98;
		var xOffset = (width * .01);
		var xCenter = (width / 2) + xOffset;
		var canvas = document.getElementById(passedCanvas.attr("id"));
		var ctx = canvas.getContext("2d");
		var grd = ctx.createLinearGradient(xCenter, 0, xCenter, passedCanvas.height());

		passedCanvas.attr("width",passedCanvas.width());
		passedCanvas.attr("height",passedCanvas.height());
		ctx.strokeStyle = "white";

		//outer ring
		ctx.beginPath();
		ctx.arc(xCenter,xCenter,width / 2,Math.PI,0);
		ctx.arc(xCenter,passedCanvas.height() - xCenter,width / 2,0,Math.PI);
		ctx.fillStyle = "#505050";
		ctx.closePath();
		ctx.stroke();

      	grd.addColorStop(0, '#888888');		//top
      	grd.addColorStop(0.5, '#FFFFFF');	//center
      	grd.addColorStop(1, '#888888');		//bottom
      	ctx.fillStyle = grd;
      	ctx.fill();

      	width = passedCanvas.width() * .9;
		grd = ctx.createLinearGradient(xCenter, 0, xCenter, passedCanvas.height());
		
		//inner ring
		ctx.beginPath();
		ctx.arc(xCenter,xCenter,width / 2,Math.PI,0);
		ctx.arc(xCenter,passedCanvas.height() - xCenter,width / 2,0,Math.PI);
		ctx.fillStyle = "#505050";
		ctx.closePath();
		ctx.stroke();

      	grd.addColorStop(0, '#151515');		//top
      	grd.addColorStop(0.5, '#323232');	//center
      	grd.addColorStop(1, '#151515');		//bottom
      	ctx.fillStyle = grd;
      	ctx.fill();

      	//now draw the text
      	var fontSize = width * .175;
	    ctx.font = fontSize + "px Arial";
	    ctx.fillStyle = "white"
	    ctx.textAlign = "center";
      	ctx.fillText("UP",xCenter,xCenter);
      	ctx.fillText("DOWN",xCenter,passedCanvas.height() - xCenter);

		//now we draw the actual thrusters handle
		ctx.beginPath();
		grd = ctx.createRadialGradient(xCenter, power * passedCanvas.height(), 0, xCenter, power * passedCanvas.height(), (width / 2) * .8);
	    // light grey
	    grd.addColorStop(0, '#606060');
	    // dark grey
	    grd.addColorStop(.9, '#303030');
	    grd.addColorStop(.92, '#FFFFFF');
		ctx.arc(xCenter, power * passedCanvas.height(),(width / 2) * .8,0,2*Math.PI);
		ctx.stroke();
	    ctx.fillStyle = grd;
	    ctx.fill();
	}

    function cartesianToPolar(cartcords){
        //Pythagorean theorem
        distance = Math.sqrt(cartcords.x*cartcords.x + cartcords.y*cartcords.y);
        //trig ... yuck
        radians = Math.atan2(cartcords.y,cartcords.x) //This takes y first
        //create the polarCoor object
        polarCoor = { distance:distance, radians:radians }
        //return this value to the original caller
        return polarCoor;
    }

    function polarToCartesian(polarCord){
        return {
            "x" : polarCord.distance * Math.cos(polarCord.radians),
            "y" : polarCord.distance * Math.sin(polarCord.radians)
        }
    }

	function degreesToRadians(degrees){
	    return degrees * (Math.PI / 180);
	}

	function radiansToDegrees(radians){
	    return radians * (180 / Math.PI);
	}

	//event handlers

	//remove old event handlers, in case this canvas isn't new
	
	passedCanvas.off('mousedown.verticalThrustersClass');
	passedCanvas.off('mouseup.verticalThrustersClass');

	passedCanvas.on('mousedown.verticalThrustersClass',function(event){
		if(!lock){
			var updateFunction = function(event){
				var percentage = (event.pageY - passedCanvas.offset().top) / passedCanvas.height();
				if(percentage < .115){
					percentage = .12;
				}else if(percentage > .885){
					percentage = .885;
				}
				power = percentage;
				drawGUI();
			}
			updateFunction(event);
			if(onDragStartCallback != null){
				onDragStartCallback();
			}
			$(document).off('mousemove.verticalThrustersClass');
			$(document).on('mousemove.verticalThrustersClass',function(event){
				updateFunction(event);
				if(onDragCallback != null){
					onDragCallback();
				}
			});
			$(document).off('mouseup.verticalThrustersClass');
			$(document).on('mouseup.verticalThrustersClass',function(event){
				if(spring){
					power = 0.5;
				}else{
					updateFunction(event);
				}
				drawGUI();
				if(onDragCallback != null){
					onDragCallback();
				}
				$(document).off('mousemove.verticalThrustersClass');
				$(document).off('mouseup.verticalThrustersClass');
			});
		}
	});

	//intervals
}