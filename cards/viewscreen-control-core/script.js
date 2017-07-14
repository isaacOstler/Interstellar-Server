	Interstellar.addCoreWidget("Viewscreen Control",function(){
	var ViewscreenControlCore_CurrentCard = 0;
	var ViewscreenControlCore_TaticalMaster;

	Interstellar.onDatabaseValueChange("viewscreen.tacticalMaster",function(newData){
		if(newData == null){
			return;
		}
		Interstellar.say("New viewscreen tactical, " + newData.tacticalName);
		ViewscreenControlCore_TaticalMaster = newData;
		$("#Viewscreen-Control-Core_taticalNameTextbox").val(newData.tacticalName);
	});

	function ViewscreenControlCore_drawCardsList(){
		var html = "";
		for(var i = 0; i < ViewscreenControlCore_TaticalMaster.cards.length;i++){
			if(ViewscreenControlCore_CurrentCard == i){
				html += "<div id='cardsViewscreenListNumber" + i + "' currentCard='" + i + "' class='Viewscreen-Control-Core_CardsListCard'  style='background-color:red'>" + (i + 1) + ": " + ViewscreenControlCore_TaticalMaster.cards[i].cardName + "</div>";
			}else{
				html += "<div id='cardsViewscreenListNumber" + i + "' currentCard='" + i + "' class='Viewscreen-Control-Core_CardsListCard'>" + (i + 1) + ": " + ViewscreenControlCore_TaticalMaster.cards[i].cardName + "</div>";
			}
		}
		$("#Viewscreen-Control-Core_CardsList").html(html);
		$(".Viewscreen-Control-Core_CardsListCard").off();
		$(".Viewscreen-Control-Core_CardsListCard").click(function(event){
			ViewscreenControlCore_CurrentCard = Number($(event.target).attr("currentCard"));
			Interstellar.setDatabaseValue("viewscreen.forceToTacticalCard",ViewscreenControlCore_CurrentCard);
		});
		$("#Viewscreen-Control-Core_CardsList").stop();
		$("#Viewscreen-Control-Core_CardsList").animate({scrollTop : ViewscreenControlCore_CurrentCard * 16 + "px"});
	}

	$("#Viewscreen-Control-Core_nextCardButton").click(function(event){
		ViewscreenControlCore_CurrentCard++;
		Interstellar.setDatabaseValue("viewscreen.forceToTacticalCard",ViewscreenControlCore_CurrentCard);
	});
	$("#Viewscreen-Control-Core_lastCardButton").click(function(event){
		ViewscreenControlCore_CurrentCard--;
		if(ViewscreenControlCore_CurrentCard == -1){
			ViewscreenControlCore_CurrentCard = ViewscreenControlCore_TaticalMaster.cards.length - 1;
		}
		Interstellar.setDatabaseValue("viewscreen.forceToTacticalCard",ViewscreenControlCore_CurrentCard);
	});
	Interstellar.onDatabaseValueChange("viewscreen.currentCard",function(newData){
		if(newData == null){
			return;
		}
		ViewscreenControlCore_CurrentCard = newData;
		$("#Viewscreen-Control-Core_currentCardTextbox").val(newData + 1);
		ViewscreenControlCore_drawCardsList();
	});

	$("#Viewscreen-Control-Core_currentCardTextbox").on("change",function(event){
		var card = event.target.value - 1;
		Interstellar.setDatabaseValue("viewscreen.forceToTacticalCard",card);
		event.target.value = ViewscreenControlCore_CurrentCard;
	});
});