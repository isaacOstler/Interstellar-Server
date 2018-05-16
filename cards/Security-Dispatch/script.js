//variables
var shipImage = new Image,
	rooms = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
	officers = [];

//DOM Refrences
var canvas = $("#canvas"),
	officersList = $("#officersList");

//init

initCanvas();

//preset obeservers

//database observers
Interstellar.onDatabaseValueChange("securityTeams.officers",function(newData){
	if(newData == null){
		$.getJSON( "/resource?path=public/officers.json", function( data ) {
			console.log(data);
		  	Interstellar.setDatabaseValue("securityTeams.officers",data.officers);
		  	return;
		});
		return;
	}
	if(officers.length == newData.length){
		//update
		officers = newData;
		updateOfficers();
	}else{
		//firstdraw
		officers = newData;
		listOfficers();
	}
});

//functions
function updateOfficers(){
	for(var i = 0;i < officers.length;i++){
		$("[officerIndex=" + i + "]").css("filter","brightness(0.65)");
	}
}
function listOfficers(){
	var html = "";
	for(var i = 0;i < officers.length;i++){
		html += '<div officerIndex="' + i + '" class="officerItem">';
		html += officers[i].name.last.toUpperCase();
		html += ", ";
		html += officers[i].name.first.toUpperCase();
		html += "</div>";
		officers[i].postedDeck = Math.floor(Math.random() * rooms.length);
	}
	officersList.html(html);
	$(".officerItem").on("mouseover",function(event){
		var index = Number($(event.target).attr("officerIndex"));
    	var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
    	ctx.clearRect(0,0,canvas.width(),canvas.height());
		drawShip(ctx,officers[index].postedDeck);
	});
}
function initCanvas(){
	//we have to allow the image to load before we set this event listener
	shipImage.onload = function(){
		//now that the image has loaded, create the event listner
		canvas.on("mousemove",function(event){
    		var ctx = document.getElementById(canvas.attr("id")).getContext("2d");
   			var aspectRatio = shipImage.width / shipImage.height;
    		var imageHeight = Math.round(canvas.width() / aspectRatio);
    		var imageStartY = (canvas.height() / 2) - (imageHeight / 2);
    		var currentDeckSelected = -1;

			canvas.attr("width",canvas.width());
			canvas.attr("height",canvas.height());

			ctx.strokeStyle = "white";
		    ctx.strokeWidth = 2;

			if(imageStartY < event.offsetY && event.offsetY < imageHeight + imageStartY){
				//we are within the image
				var offsetOfCursorOverImage = event.offsetY - imageStartY;
				currentDeckSelected = Math.floor((offsetOfCursorOverImage / imageHeight) * rooms.length);
				ctx.fillStyle = "white";
				ctx.font = "14px Arial";
				ctx.fillText("DECK " + (currentDeckSelected + 1),canvas.width() - 100,imageStartY + (imageHeight * .75)); 
			}else{
				//we are not within the image
				currentDeckSelected = -1;
			}

			drawShip(ctx,currentDeckSelected);
			//drawLineToPoint(ctx,0,0,event.offsetX,event.offsetY);
			updateOfficers();
			for(var i = 0;i < officers.length;i++){
				if(officers[i].postedDeck == currentDeckSelected){
					$("[officerIndex=" + i + "]").css("filter","brightness(1.0)");
				}
			}
		});
	};
	//load the image at this address
	shipImage.src = '/ship?file=starboard.png';
}

function drawShip(ctx,highlightedDeck){
	//we must maintain the aspect ratio
    var aspectRatio = shipImage.width / shipImage.height;
    var imageHeight = Math.round(canvas.width() / aspectRatio);
    var imageStartY = (canvas.height() / 2) - (imageHeight / 2);
    ctx.drawImage(shipImage,0,imageStartY, Math.round(canvas.width()), imageHeight);
    if(highlightedDeck != -1){
    	var deckHeight = imageHeight / rooms.length;

    	//mask to the image
        ctx.globalCompositeOperation = "source-atop";

        ctx.fillStyle = "rgba(255,0,0,.6)";
        ctx.fillRect(0,imageStartY + (highlightedDeck * deckHeight),canvas.width(),deckHeight);

        // change the composite mode to destination-atop
        // any new drawing will not overwrite any existing pixels
        ctx.globalCompositeOperation = "destination-atop";
        // restore the context to it's original state
        ctx.restore();
    }
}
function drawLineToPoint(ctx,startX,startY,x,y){
    ctx.moveTo(startX,startY);
    ctx.lineTo(x,y);
    ctx.stroke();
}

//event listeners

//intervals