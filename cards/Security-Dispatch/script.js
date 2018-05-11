//variables
var shipImage = new Image;

//DOM Refrences
var canvas = $("#canvas");

//init

initCanvas();

//preset obeservers

//database observers

//functions
function initCanvas(){
	//we have to allow the image to load before we set this event listener
	shipImage.onload = function(){
		//now that the image has loaded, create the event listner
		canvas.on("mousemove",function(event){
			canvas.attr("width",canvas.width());
			canvas.attr("height",canvas.height());
		    var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
		    //we must maintain the aspect ratio
		    var aspectRatio = shipImage.width / shipImage.height;
		    var imageHeight = Math.round(canvas.width() / aspectRatio);
		    ctx.imageSmoothingEnabled = true;
		    ctx.translate(0.5, 0.5);
		    ctx.drawImage(shipImage,0,(canvas.height() / 2) - (imageHeight / 2), Math.round(canvas.width()), imageHeight);
		});
	};
	//load the image at this address
	shipImage.src = '/ship?file=starboard.png';
}

//event listeners

//intervals