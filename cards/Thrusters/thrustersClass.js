//copyright, isaac ostler, May 29th 2018

//use to create a thrusters user interface
//DOES NOT connect by default to a database.  You must set your own event listeners
//using the public functions (see definitions below).

//*** This widget requires JQuery!  IMPORTANT!  IMPORATANT!   IMPORATANT!    IMPORATANT!  

// CLASS NAME: ThrustersDisplayClass
// PURPOSE: to create a thrusters user interface
// TAKES:
//			HTML Canvas (Jquery DOM reference) - The canvas you want to use

//use .on('dragStart',function(){...}) for changes right as the user clicks, but has not started moving yet
//use .on('drag',function(){...}) for changes whenever the user drags the mouse
//use .on('dragFinish',function(){...}) for changes AFTER the user releases the mouse

var ThrustersDisplayClass = function(passedCanvas){
	//public functions

	this.setThrust = function(newDirection,newPower){
		direction = newDirection;
		power = newPower;
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

	this.getDirection = function(){
		return direction;
	}

	this.getPower = function(){
		return power;
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
	var direction = 0,
		power = 0,
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
		var canvas = document.getElementById(passedCanvas.attr("id"));
		var ctx = canvas.getContext("2d");
		var radius = Math.min(passedCanvas.width() / 2,passedCanvas.height() / 2) - 2;
	    var grd;

		passedCanvas.attr("width",passedCanvas.width());
		passedCanvas.attr("height",passedCanvas.height());


		ctx.strokeStyle = "white";

		//first we draw the thrusters ring / container thing
		ctx.beginPath();
		grd = ctx.createRadialGradient(passedCanvas.width() / 2,passedCanvas.height() / 2, 0, passedCanvas.width() / 2,passedCanvas.height() / 2, radius);
	    // light grey
	    grd.addColorStop(0, '#505050');
	    // dark grey
	    grd.addColorStop(.95, '#101010');
	    grd.addColorStop(.955, '#FFFFFF');
	    grd.addColorStop(1, '#909090');
		ctx.arc(passedCanvas.width() / 2,passedCanvas.height() / 2,radius,0,2*Math.PI);
		ctx.stroke();
	    ctx.fillStyle = grd;
	    ctx.fill();

	    //now we draw the text
	    ctx.font = radius * .1 + "px Arial";
	    ctx.fillStyle = "white"

	    textCircle(ctx,"FORWARD",passedCanvas.width() / 2,passedCanvas.height() / 2, radius * .85,degreesToRadians(0),degreesToRadians(73),1,degreesToRadians(5));
	    textCircle(ctx,"REVERSE",passedCanvas.width() / 2,passedCanvas.height() / 2, radius * .85,degreesToRadians(0),degreesToRadians(287),0,degreesToRadians(5));

	    textCircle(ctx,"PORT",passedCanvas.width() / 2,passedCanvas.height() / 2, radius * .85,degreesToRadians(0),degreesToRadians(350),1,degreesToRadians(5));
	    textCircle(ctx,"STARBOARD",passedCanvas.width() / 2,passedCanvas.height() / 2, radius * .85,degreesToRadians(0),degreesToRadians(158),1,degreesToRadians(5));

		//now we draw the actual thrusters handle
		var cartCords = polarToCartesian({"radians" : direction,"distance" : power * ((radius * .95) - (radius * .2))});
		cartCords.x += passedCanvas.width() / 2;
		cartCords.y += passedCanvas.height() / 2;
		radius = radius * .2;
		ctx.beginPath();
		grd = ctx.createRadialGradient(cartCords.x,cartCords.y, 0, cartCords.x,cartCords.y, radius);
	    // light grey
	    grd.addColorStop(0, '#606060');
	    // dark grey
	    grd.addColorStop(.9, '#303030');
	    grd.addColorStop(.92, '#FFFFFF');
		ctx.arc(cartCords.x,cartCords.y,radius,0,2*Math.PI);
		ctx.stroke();
	    ctx.fillStyle = grd;
	    ctx.fill();
	}


	function textCircle(ctx,text,x,y,radius,space,position,top,letterSpacing){
	   space = space || 0;
	   var numRadsPerLetter = letterSpacing;
	   ctx.save();
	   ctx.translate(x,y);
	   var k = (top) ? 1 : -1; 
	   ctx.rotate((-k * ((Math.PI - numRadsPerLetter) / 2 - space))+ position);
	   for(var i=0;i<text.length;i++){
	        ctx.save();
	        ctx.rotate(k*i*(numRadsPerLetter));
	        ctx.textAlign = "center";
	        ctx.textBaseline = (!top) ? "top" : "bottom";
	        ctx.fillText(text[i],0,-k*(radius));
	        ctx.restore();
	   }
	   ctx.restore();
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
	
	passedCanvas.off('mousedown.thrustersClass');
	passedCanvas.off('mouseup.thrustersClass');

	passedCanvas.on('mousedown.thrustersClass',function(event){
		if(!lock){
			let radius = Math.min(passedCanvas.width() / 2,passedCanvas.height() / 2) - 2;
			var centerX = passedCanvas.offset().left + (passedCanvas.width() / 2);
			var centerY = passedCanvas.offset().top + (passedCanvas.height() / 2);
			var thrusterCartCords = polarToCartesian({"radians" : direction,"distance" : power * ((radius * .95) - (radius * .2))});
			thrusterCartCords.x += centerX;
			thrusterCartCords.y += centerY;
			var cartCords = {"x" : Number(event.pageX - thrusterCartCords.x), "y" : Number(event.pageY - thrusterCartCords.y)}
			var polarCords = cartesianToPolar(cartCords);
			if(polarCords.distance < radius * .2){
				//dragging
				var updateThrustPosition = function(event){
					var centerX = passedCanvas.offset().left + (passedCanvas.width() / 2);
					var centerY = passedCanvas.offset().top + (passedCanvas.height() / 2);
					//current cords
					var thrusterCartCords = polarToCartesian({"radians" : direction,"distance" : power * ((radius * .95) - (radius * .2))});
					thrusterCartCords.x += centerX;
					thrusterCartCords.y += centerY;
					//where the mouse is (cart)
					var cartCords = {"x" : Number(event.pageX - centerX), "y" : Number(event.pageY - centerY)}
					//where the mouse is (polar)
					var polarCords = cartesianToPolar(cartCords);
					//set the new direction and power
					direction = polarCords.radians;
					power = polarCords.distance / ((radius * .95) - (radius * .2));
					if(power > 1){
						power = 1;
					}
					//update
					drawGUI();
				}
				updateThrustPosition(event);
				if(onDragStartCallback != null){
					onDragStartCallback();
				}
				$(document).off('mousemove.thrustersClass');
				$(document).on('mousemove.thrustersClass',function(event){
					updateThrustPosition(event);
					if(onDragCallback != null){
						onDragCallback();
					}
				});
				$(document).off('mouseup.thrustersClass');
				$(document).on('mouseup.thrustersClass',function(event){
					if(spring){
						power = 0;
						direction = 0;
						drawGUI();
					}else{
						updateThrustPosition(event);
					}
					if(onDragFinishCallback != null){
						onDragFinishCallback();
					}
					$(document).off('mousemove.thrustersClass');
					$(document).off('mouseup.thrustersClass');
				});
			}else{
				//not dragging, just clicking randomly
			}
		}
	});

	//intervals
}