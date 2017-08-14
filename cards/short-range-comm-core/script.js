var shorRangeCommunicationsCoreHasInit = false;
Interstellar.addCoreWidget("Short Range Comm",function(){

	if(shorRangeCommunicationsCoreHasInit){
		return; //make sure we don't initilize this code more than once
	}
	shorRangeCommunicationsCoreHasInit = true;

	var thisWidget = this;

	//variables
	var hailTypes = [],
		hailTypeDefaults =
		[
			{
				"channelName" : "Dominion",
				"picture" : "dominionLogo.png",
				"top" : 0,
				"bottom" : 0.1,
				"color" : changeHue("#FF0000",Math.random() * 360)
			},
			{
				"channelName" : "Starfleet",
				"picture" : "federationLogo.png",
				"top" : 0.1,
				"bottom" : 0.25,
				"color" : changeHue("#FF0000",Math.random() * 360)
			},
			{
				"channelName" : "General Use",
				"picture" : "anonLogo.png",
				"top" : 0.25,
				"bottom" : 0.45,
				"color" : changeHue("#FF0000",Math.random() * 360)
			},
			{
				"channelName" : "Klingon",
				"picture" : "klingonLogo.png",
				"top" : 0.45,
				"bottom" : 0.6,
				"color" : changeHue("#FF0000",Math.random() * 360)
			},
			{
				"channelName" : "Romulan",
				"picture" : "romulanLogo.png",
				"top" : 0.6,
				"bottom" : 0.75,
				"color" : changeHue("#FF0000",Math.random() * 360)
			},
			{
				"channelName" : "Cardassian",
				"picture" : "cardassianLogo.png",
				"top" : 0.75,
				"bottom" : 0.9,
				"color" : changeHue("#FF0000",Math.random() * 360)
			},
			{
				"channelName" : "Ferengi",
				"picture" : "ferengiLogo.png",
				"top" : 0.9,
				"bottom" : 1,
				"color" : changeHue("#FF0000",Math.random() * 360)
			}
		],
		incomingHails = [], //keep in mind this is in reference to the crew, so incoming is outgoing for core
		outgoingHail = "none",
		quickHailFrequency = null,
		channelPrefCanvasHeight = 318,
		channelPrefCanvasWidth = 143,
		selectedChannelOnCanvas = 
		{
			"index" : -1,
			"bound" : 0 //0 top, 1 bottom
		}

	//DOM References
	var thisWidgetElement = $("#short-range-comm-Core-Widget"),
		editGear = $("#short-range-comm-core_editGear"),
		incomingHailList = $("#short-range-comm-core_currentHails"),
		incomingHailButtons = $("#short-range-comm-core_incomingHailButtons"),
		incomingHailButtons_hailTypeTextbox = $("#short-range-comm-core_incomingHailButtons_hailTypeTextbox"),
		incomingHailButtons_acceptButton = $("#short-range-comm-core_incomingHailButtons_acceptButton"),
		incomingHailButtons_rejectButton = $("#short-range-comm-core_incomingHailButtons_rejectButton"),
		createHailDropdownSelect = $("#short-range-comm-core_hailControlContainer_hailSelectDropdown"),
		createNewHailButton = $("#short-range-comm-core_hailControlContainer_hailButton"),
		createQuickHailButton = $("#short-range-comm-core_hailControlContainer_quickHailButton"),
		addChannelButton = $("#short-range-comm-Core-Widget_UserPrefsWindow_addButton"),
		removeChannelButton = $("#short-range-comm-Core-Widget_UserPrefsWindow_removeButton"),
		quickHailChannelSelectDropdown = $("#short-range-comm-Core-Widget_UserPrefsWindow_defualtDropdown"),
		hailChannelCanvas = $("#short-range-comm-Core-Widget_UserPrefsWindow_sliderCanvas");

	//init calls
	initGUI();
	//interstellar calls
	thisWidget.onResize = function(){
		incomingHailList.stop();
		if(outgoingHail == "none"){
			incomingHailList.height(thisWidgetElement.height() - 60);
		}else{
			incomingHailList.height(thisWidgetElement.height() - 100);
		}
	}

	//functions

	function initGUI(){
		var canvas = document.getElementById(hailChannelCanvas.prop("id"));
		canvas.width = channelPrefCanvasWidth;
		canvas.height = channelPrefCanvasHeight;
	}

	function drawPossibleHailTypes(){
		var html = "";
		for(var i = 0;i < hailTypes.length;i++){
			html += "<option>";
			html += hailTypes[i].channelName.toUpperCase() + " FREQUENCY";
			html += "</option>";
		}
		createHailDropdownSelect.html(html);
		var canvas = document.getElementById(hailChannelCanvas.prop("id"));
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,channelPrefCanvasWidth,channelPrefCanvasHeight);
		ctx.beginPath();
		for(var i = 0;i < hailTypes.length;i++){
			ctx.fillStyle = hailTypes[i].color;
			ctx.fillRect(0,hailTypes[i].top * channelPrefCanvasHeight,channelPrefCanvasWidth,(hailTypes[i].bottom - hailTypes[i].top) * channelPrefCanvasHeight);
			var fontSize = (channelPrefCanvasWidth * .10);
			while((fontSize * .9) * hailTypes[i].channelName.length > channelPrefCanvasWidth){
				fontSize -= .1;
			}
			ctx.fillStyle = "#ffffff";
			ctx.font = fontSize + "px Arial";
			ctx.shadowBlur = 3;
			ctx.shadowColor = "#000000";
			var posY = Math.max((Number(hailTypes[i].top) * channelPrefCanvasHeight) + (channelPrefCanvasWidth * .15),25);
			ctx.fillText(hailTypes[i].channelName.toUpperCase(),1,posY);
		}
		ctx.stroke();
	}

	function drawHailList(){
		var html = "";
		for(var i = 0;i < incomingHails.length;i++){
			var channelName = "STARFLEET FREQUENCY";
			var adjustedFrequency = incomingHails[i].frequency / .2;

			for(var j = 0; j < hailTypes.length;j++){
				if(adjustedFrequency > hailTypes[j].top && adjustedFrequency < hailTypes[j].bottom){
					channelName = hailTypes[j].channelName + " frequency";
					channelName = channelName.toUpperCase();
				}
			}
			var backgroundColorStyle = "";
			if(incomingHails[i].isConnected){
				backgroundColorStyle = "background-color:lime;";
			}
            html += "<div index='" + i + "' class='short-range-comm-core_currentHails_hailItem' style='top:" + (i * 27) + "px;" + backgroundColorStyle + "'>";
            html += "<div class='short-range-comm-core_currentHails_hailItem_label'>"
            html += channelName;
            html += "</div>"
            //html += "<div class='short-range-comm-core_currentHails_hailItem_delete' index='" + i + "'>"
            html += "<svg class='short-range-comm-core_currentHails_hailItem_delete' index='" + i + "' fill='#FFFFFF' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path index='" + i + "' d='M0 0h24v24H0V0z' fill='none'/><path index='" + i + "' d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z'/><path index='" + i + "' d='M0 0h24v24H0z' fill='none'/></svg>";
            //html += "</div>";
            html += "</div>";
		}
		incomingHailList.html(html);
		$(".short-range-comm-core_currentHails_hailItem_delete").click(function(event){
			var index = Number($(event.target).attr("index"));
			var newArray = [];
			for(var i = 0;i < incomingHails.length;i++){
				if(i != index){
					newArray.splice(newArray.length,0,incomingHails[i]);
				}
			}
			Interstellar.setDatabaseValue("shortRangeComm.incomingHails",newArray);
		});
	}

	function getRandomArbitrary(min, max) {
  		return Math.random() * (max - min) + min;
	}
	//preset observers
	Interstellar.onPresetValueChange("shortRangeComm.channelPresets",function(presetValue){
		if(presetValue == null){
			Interstellar.setPresetValue("shortRangeComm.channelPresets",hailTypeDefaults);
			return;
		}
		hailTypes = presetValue;
		drawPossibleHailTypes();
		Interstellar.setDatabaseValue("shortRangeComm.hailChannels",hailTypes);
	});
	Interstellar.onPresetValueChange("shortRangeComm.quickHailFrequency",function(presetValue){
		return;
		if(presetValue == null){
			quickHailFrequency = null;
			createQuickHailButton.css("opacity",".5");
			createQuickHailButton.prop("disabled","disabled");
			return;
		}
		quickHailFrequency = presetValue;
		createQuickHailButton.css("opacity","1");
		createQuickHailButton.prop("disabled","");
	});
	//database observers
	
	Interstellar.onDatabaseValueChange("shortRangeComm.incomingHails",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("shortRangeComm.incomingHails",[]);
			return;
		}
		incomingHails = newData;
		drawHailList();
	});

	Interstellar.onDatabaseValueChange("shortRangeComm.outgoingHail",function(newData){
		if(newData == null){
			Interstellar.setDatabaseValue("shortRangeComm.outgoingHail","none");
			return;
		}
		outgoingHail = newData;
		if(outgoingHail == "none"){
			Interstellar.say("Outgoing hail canceled");
			incomingHailButtons.slideUp(500);
			incomingHailList.animate({height : thisWidgetElement.height() - 60},500);
		}else{
			var channelName = "",
				adjustedFrequency = outgoingHail.frequency / .2;
			for(var i = 0; i < hailTypes.length;i++){
				if(adjustedFrequency > hailTypes[i].top && adjustedFrequency < hailTypes[i].bottom){
					channelName = hailTypes[i].channelName + " frequency";
					channelName = channelName.toUpperCase();
				}
			}
			incomingHailButtons_hailTypeTextbox.val(channelName);
			incomingHailList.animate({height : thisWidgetElement.height() - 100},500,function(){
				incomingHailButtons.slideDown(500);
			});
			if(outgoingHail.isConnected){
				incomingHailButtons_acceptButton.fadeOut(500);
				incomingHailButtons_rejectButton.val("DISCONNECT")
				incomingHailButtons_rejectButton.animate({width : thisWidgetElement.width() - 4},500);
				Interstellar.say("Line Connected");
			}else{
				incomingHailButtons_acceptButton.fadeIn(500);
				incomingHailButtons_rejectButton.val("REJECT");
				incomingHailButtons_rejectButton.animate({width : (thisWidgetElement.width() * .5) - 1},500);
				Interstellar.say("Incoming hail,  " + channelName);
			}
		}
	});
	//event handlers

	createNewHailButton.click(function(event){
		var hailType = createHailDropdownSelect.val();
		if(hailType == "" || hailType == undefined){
			return; //error checking
		}
		var color = changeHue("#FF0000",Math.random() * 360);
		var top = 0;
		var bottom = 0;
		for(var i = 0; i < hailTypes.length;i++){
			if((hailTypes[i].channelName + " FREQUENCY").toLowerCase() == hailType.toLowerCase()){
				top = hailTypes[i].top * .2;
				bottom = hailTypes[i].bottom * .2;
			}
		}
		var frequency = getRandomArbitrary(top,bottom);
		var color = changeHue("#FF0000",Math.random() * 360);
		var newHail = 
		{
			"frequency" : frequency,
			"amplitude" : Math.random() * (1 - frequency),
			"phase" : 0,
			"isConnected" : false,
			"color" : color
		}
		var newArray = [];
		for(var i = 0;i < incomingHails.length;i++){
			newArray.splice(newArray.length,0,incomingHails[i]);
		}
		newArray.splice(newArray.length,0,newHail);
		Interstellar.setDatabaseValue("shortRangeComm.incomingHails",newArray);
	});

	incomingHailButtons_acceptButton.click(function(event){
		if(outgoingHail == "none"){
			return; //error checking
		}
		outgoingHail.isConnected = true;
		Interstellar.setDatabaseValue("shortRangeComm.outgoingHail",outgoingHail);
	});

	incomingHailButtons_rejectButton.click(function(event){
		if(outgoingHail == "none"){
			return; //error checking
		}
		outgoingHail = "none";
		Interstellar.setDatabaseValue("shortRangeComm.outgoingHail",outgoingHail);
	});

	editGear.click(function(event){
		//Interstellar.openCoreWindow("short-range-comm-Core-Widget_UserPrefsWindow",event);
	})

	hailChannelCanvas.mousedown(function(event){
		var posY = event.offsetY / channelPrefCanvasHeight;
		for(var i = 0;i < hailTypes.length;i++){
			console.log(posY,hailTypes[i].top);
			if(posY > hailTypes[i].top - .02 && posY < hailTypes[i].top + .02){
				selectedChannelOnCanvas.index = i;
				selectedChannelOnCanvas.bound = 0;
			}else if(posY > hailTypes[i].bottom - .02 && posY < hailTypes[i].bottom + .02){
				selectedChannelOnCanvas.index = i;
				selectedChannelOnCanvas.bound = 1;
			}
		}
	});

	hailChannelCanvas.mousemove(function(event){
		if(selectedChannelOnCanvas.index == -1){
			return;
		}
		var posY = event.offsetY / channelPrefCanvasHeight;
		if(hailTypes[selectedChannelOnCanvas.index].bound == 0){
			hailTypes[selectedChannelOnCanvas.index].bottom += hailTypes[selectedChannelOnCanvas.index].top - posY;
			hailTypes[selectedChannelOnCanvas.index].top = posY;
			drawPossibleHailTypes();
		}else{
			hailTypes[selectedChannelOnCanvas.index].bottom = posY;
			drawPossibleHailTypes();
		}
	})

	hailChannelCanvas.mouseup(function(event){
		selectedChannelOnCanvas.index = -1;
		Interstellar.setPresetValue("shortRangeComm.channelPresets",hailTypes);
	});

	createQuickHailButton.click(function(event){
		var frequency = 0;
		for(var i = 0; i < hailTypes.length;i++){
			if(hailTypes[i].channelName.toLowerCase() == "starfleet"){
				frequency = getRandomArbitrary(hailTypes[i].top,hailTypes[i].bottom);
			}
		}
		var newHail = 
		{
			"frequency" : frequency,
			"amplitude" : Math.random() * (1 - frequency),
			"phase" : 0,
			"isConnected" : false,
			"color" : changeHue("#FF0000",Math.random() * 360)
		}
		var newArray = [];
		for(var i = 0;i < incomingHails.length;i++){
			newArray.splice(newArray.length,0,incomingHails[i]);
		}
		newArray.splice(newArray.length,0,newHail);
		Interstellar.setDatabaseValue("shortRangeComm.incomingHails",newArray);
	})
	//colors crap

	function changeHue(rgb, degree) {
	    var hsl = rgbToHSL(rgb);
	    hsl.h += degree;
	    if (hsl.h > 360) {
	        hsl.h -= 360;
	    }
	    else if (hsl.h < 0) {
	        hsl.h += 360;
	    }
	    return hslToRGB(hsl);
	}

	// exepcts a string and returns an object
	function rgbToHSL(rgb) {
	    // strip the leading # if it's there
	    rgb = rgb.replace(/^\s*#|\s*$/g, '');

	    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	    if(rgb.length == 3){
	        rgb = rgb.replace(/(.)/g, '$1$1');
	    }

	    var r = parseInt(rgb.substr(0, 2), 16) / 255,
	        g = parseInt(rgb.substr(2, 2), 16) / 255,
	        b = parseInt(rgb.substr(4, 2), 16) / 255,
	        cMax = Math.max(r, g, b),
	        cMin = Math.min(r, g, b),
	        delta = cMax - cMin,
	        l = (cMax + cMin) / 2,
	        h = 0,
	        s = 0;

	    if (delta == 0) {
	        h = 0;
	    }
	    else if (cMax == r) {
	        h = 60 * (((g - b) / delta) % 6);
	    }
	    else if (cMax == g) {
	        h = 60 * (((b - r) / delta) + 2);
	    }
	    else {
	        h = 60 * (((r - g) / delta) + 4);
	    }

	    if (delta == 0) {
	        s = 0;
	    }
	    else {
	        s = (delta/(1-Math.abs(2*l - 1)))
	    }

	    return {
	        h: h,
	        s: s,
	        l: l
	    }
	}

	// expects an object and returns a string
	function hslToRGB(hsl) {
	    var h = hsl.h,
	        s = hsl.s,
	        l = hsl.l,
	        c = (1 - Math.abs(2*l - 1)) * s,
	        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
	        m = l - c/ 2,
	        r, g, b;

	    if (h < 60) {
	        r = c;
	        g = x;
	        b = 0;
	    }
	    else if (h < 120) {
	        r = x;
	        g = c;
	        b = 0;
	    }
	    else if (h < 180) {
	        r = 0;
	        g = c;
	        b = x;
	    }
	    else if (h < 240) {
	        r = 0;
	        g = x;
	        b = c;
	    }
	    else if (h < 300) {
	        r = x;
	        g = 0;
	        b = c;
	    }
	    else {
	        r = c;
	        g = 0;
	        b = x;
	    }

	    r = normalize_rgb_value(r, m);
	    g = normalize_rgb_value(g, m);
	    b = normalize_rgb_value(b, m);

	    return rgbToHex(r,g,b);
	}

	function normalize_rgb_value(color, m) {
	    color = Math.floor((color + m) * 255);
	    if (color < 0) {
	        color = 0;
	    }
	    return color;
	}

	function rgbToHex(r, g, b) {
	    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

});