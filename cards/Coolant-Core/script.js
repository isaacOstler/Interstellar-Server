var CoolantCoreCoolantFlowEnabled = false;
var CoolantCoreCoolantFlowInterval = undefined;
var CoolantCoreCoolantFlowRate = -0.001;
var CoolantCoreTotalCoolant = 1;
var CoolantCoreCoolantFlowSpeed = 0100; //miliseconds
var CoolantCoreIsDraggingFlowRate = false;

$("#Coolant-Core-EnableCoolantFlowCheckbox").on("click",function(event){
	CoolantCoreCoolantFlowEnabled = $("#Coolant-Core-EnableCoolantFlowCheckbox").is(':checked');
	if(CoolantCoreCoolantFlowInterval != undefined){
		clearInterval(CoolantCoreCoolantFlowInterval);
		CoolantCoreCoolantFlowInterval = undefined;
	}
	CoolantCoreCreateCoolantFlowInterval(CoolantCoreCoolantFlowSpeed);
});

function CoolantCoreCreateCoolantFlowInterval(speed){
	if(CoolantCoreCoolantFlowInterval != undefined){
		clearInterval(CoolantCoreCoolantFlowInterval);
		CoolantCoreCoolantFlowInterval = undefined;
	}
	if(CoolantCoreCoolantFlowEnabled){
		CoolantCoreCoolantFlowInterval = setInterval(function(){
			if(((CoolantCoreTotalCoolant + CoolantCoreCoolantFlowRate) > 1) || (CoolantCoreTotalCoolant + CoolantCoreCoolantFlowRate) < 0)
				return;

			CoolantCoreTotalCoolant += CoolantCoreCoolantFlowRate;
			setDatabaseValue("coolant.coolantInMainTank",CoolantCoreTotalCoolant);
		},speed);
	}
}

$("#Coolant-Core-FlowRateBar").mousedown(function(event){
	CoolantCoreIsDraggingFlowRate = true;
});

$(document).mouseup(function(event){
	CoolantCoreIsDraggingFlowRate = false;
});

$("#Coolant-Core-FlowRateBackground").on("click",function(e){
	var parentOffset = $(this).parent().offset(); 
	var relX = e.pageX - parentOffset.left;
	console.log(relX);
	$("#Coolant-Core-FlowRateBar").css("left",relX + "px");
	if(((relX / $("#Coolant-Core-FlowRateBackground").width()) - .5) > 0){
		CoolantCoreCoolantFlowRate = 0.001;
		$("#Coolant-Core-FlowRateBar").css("backgroundColor","#62f442");
	}else{
		CoolantCoreCoolantFlowRate = -0.001;
		$("#Coolant-Core-FlowRateBar").css("backgroundColor","red");
	}
	CoolantCoreCoolantFlowSpeed = 1 - (Math.abs((relX / $("#Coolant-Core-FlowRateBackground").width()) - .5) / .5);
	CoolantCoreCoolantFlowSpeed = 1000 * CoolantCoreCoolantFlowSpeed;
	CoolantCoreCreateCoolantFlowInterval(CoolantCoreCoolantFlowSpeed);
});

$("#Coolant-Core-FlowRateBackground").mousemove(function(e){
	if(CoolantCoreIsDraggingFlowRate){
		var parentOffset = $(this).parent().offset(); 
		var relX = e.pageX - parentOffset.left;
		console.log(relX);
		$("#Coolant-Core-FlowRateBar").css("left",relX + "px");
		CoolantCoreCoolantFlowRate = relX / $("#Coolant-Core-FlowRateBackground").width();
		if(((relX / $("#Coolant-Core-FlowRateBackground").width()) - .5) > 0){
			CoolantCoreCoolantFlowRate = 0.001;
			$("#Coolant-Core-FlowRateBar").css("backgroundColor","#62f442");
		}else{
			CoolantCoreCoolantFlowRate = -0.001;
			$("#Coolant-Core-FlowRateBar").css("backgroundColor","red");
		}
		CoolantCoreCoolantFlowSpeed = 1 - (Math.abs((relX / $("#Coolant-Core-FlowRateBackground").width()) - .5) / .5);
		CoolantCoreCoolantFlowSpeed = 1000 * CoolantCoreCoolantFlowSpeed;
		CoolantCoreCreateCoolantFlowInterval(CoolantCoreCoolantFlowSpeed);
	}
});

$("#Coolant-Core-TotalCoolantBox").on("change",function(event){
	var value = event.target.value;
	var rawValue = value.replace("%","");
	var castValue = parseFloat(rawValue) / 100;
	if(isNaN(castValue)){
		event.target.value = (Math.round(CoolantCoreTotalCoolant * 100) + "%") 
		return;
	}
	if(castValue > 1){
		castValue = 1;
	}else if(castValue < 0){
		castValue = 0;
	}
	setDatabaseValue("coolant.coolantInMainTank",castValue);
});

$("#Coolant-Core-TotalCoolantSlider").on("click",function(event){
	setDatabaseValue("coolant.coolantInMainTank",parseFloat(event.target.value));
});

onDatabaseValueChange("coolant.coolantInMainTank",function(newData){
	if(newData == null){
		setDatabaseValue("coolant.coolantInMainTank",1);
		return;
	}
	CoolantCoreTotalCoolant = newData;
	$("#Coolant-Core-TotalCoolantSlider").val(newData);
	$("#Coolant-Core-TotalCoolantBox").val(Math.round(newData * 100) + "%");
});