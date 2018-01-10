var onScreenKeyboardClass = function(){
    var keyboard = $("#onscreen-keyboard");

    var lastKnownElement = undefined,
        keyboardOut = false,
        shiftActive = false,
        capsLockActive = false;

    recalcEventListeners();
    drawShiftGUI(false);

    $('body').on('DOMNodeInserted', function () {
        recalcEventListeners();
    });

    function recalcEventListeners(){
        $("input[type=text]","input[type=textarea]").off();
        $(".onscreen-keyboard_key").off();
        $("input[type=text]").click(function(event){
            lastKnownElement = event.target;
        });
        $("#showOnscreen-keyboardButton").off();
        $("#showOnscreen-keyboardButton").click(function(event){
            Interstellar.playRandomBeep();
            if(!keyboardOut){
                openKeyboard();
            }else{
                hideKeyboard();
            }
        });
        $(".onscreen-keyboard_key").click(function(event){
            Interstellar.playRandomBeep();
            var key = $(event.target).html();
            if(key == "SHIFT"){
                shiftActive = !shiftActive;
                drawShiftGUI(shiftActive);
                return;
            }
            if(key == "TAB"){
                insertAtCaret(lastKnownElement,"    ");
                return;
            }
            if(key == "SPACE"){
                insertAtCaret(lastKnownElement," ");
                return;
            }
            if(key == "CMD" || key == "ALT" || key == "FN" || key == "CTRL"){
                return;
            }
            if(key == "⌫ DELETE"){
                deleteCharacter(lastKnownElement);
                return;
            }
            if(key == "ENTER"){
                insertAtCaret(lastKnownElement,"\n");
                return;
            }
            if(key == "HIDE"){
                hideKeyboard();
                return;
            }
            if(key == "CAPS LOCK"){
                capsLockActive = !capsLockActive;
                drawCrapsGUI(capsLockActive);
                return;
            }
            if(key == undefined){
                key = $(event.target).html();
                if(shiftActive){
                  key = key.toUpperCase();
                }else{
                  key = key.toLowerCase();
                }
            }else{
                if(shiftActive){
                    key = $(event.target).attr("shiftKey");
                }
            }
            insertAtCaret(lastKnownElement,key);
        });
        $("#onscreen-keyboard_topMoveDetector").off();
        $("#onscreen-keyboard_topMoveDetector").on("mousedown.keyboardDrag",function(event){
            let initalOffsetX = event.offsetX;
                initalOffsetY = event.offsetY,
                updateFunction = function(passedEvent){
                var calculatedX = passedEvent.pageX - initalOffsetX;
                var calculatedY = passedEvent.pageY - initalOffsetY;
                keyboard.css("left",calculatedX + "px");
                keyboard.css("top",calculatedY + "px");
            }
            updateFunction(event);
            $(document.body).on("mousemove.keyboardDrag",function(event){
                updateFunction(event);
            });
            $(document.body).on("mouseup.keyboardDrag",function(event){
                updateFunction(event);
                $(document.body).off("mousemove.keyboardDrag");
                $(document.body).off("mouseup.keyboardDrag");
            });
        });
    }

    function drawCrapsGUI(state){
        shiftActive = false;
        drawShiftGUI(shiftActive);
        if(state){
            $(".onscreen-keyboard_key").each(function() {
                if($(this).attr("keyType") == "alpha" && $(this).attr("keyType") != "hide"){
                    $(this).html($(this).attr("shiftKey"));
                }
            });
            $("#onscreen-keyboard_alphaKeys_caps").css("background-color","rgba(255,255,255,.7)");
        }else{
            $(".onscreen-keyboard_key").each(function() {
                if($(this).attr("keyType") == "alpha" && $(this).attr("keyType") != "hide"){
                    $(this).html($(this).attr("key"));
                }
            });
            $("#onscreen-keyboard_alphaKeys_caps").css("background-color","");
        }
    }

    function drawShiftGUI(state){
        if(state){
            $(".onscreen-keyboard_key").each(function() {
                if($(this).attr("keyType") != "hide"){
                    $(this).html($(this).attr("shiftKey"));
                }
            });
            $("#onscreen-keyboard_alphaKeys_leftShift").css("background-color","rgba(255,255,255,.7)");
            $("#onscreen-keyboard_alphaKeys_rightShift").css("background-color","rgba(255,255,255,.7)");
        }else{
            $(".onscreen-keyboard_key").each(function() {
                if(capsLockActive && $(this).attr("keyType") == "alpha")
                {
                    if($(this).attr("keyType") != "hide"){
                        $(this).html($(this).attr("shiftKey"));
                    }
                }else{
                    if($(this).attr("keyType") != "hide"){
                        $(this).html($(this).attr("key"));
                    }
                }
            });
            $("#onscreen-keyboard_alphaKeys_leftShift").css("background-color","");
            $("#onscreen-keyboard_alphaKeys_rightShift").css("background-color","");
        }
    }

    function deleteCharacter(txtarea){
        if(txtarea == undefined){
            return;
        }
        var value = $(txtarea).val();
        if(value.length > 0){
            $(txtarea).val(value.substring(0,value.length - 1));
        }
    }

    function insertAtCaret(txtarea, text) {
        if (!txtarea) { return; }

        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
            "ff" : (document.selection ? "ie" : false ) );
        if (br == "ie") {
            txtarea.focus();
            var range = document.selection.createRange();
            range.moveStart ('character', -txtarea.value.length);
            strPos = range.text.length;
        } else if (br == "ff") {
            strPos = txtarea.selectionStart;
        }

        var front = (txtarea.value).substring(0, strPos);
        var back = (txtarea.value).substring(strPos, txtarea.value.length);
        txtarea.value = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            var ieRange = document.selection.createRange();
            ieRange.moveStart ('character', -txtarea.value.length);
            ieRange.moveStart ('character', strPos);
            ieRange.moveEnd ('character', 0);
            ieRange.select();
        } else if (br == "ff") {
            txtarea.selectionStart = strPos;
            txtarea.selectionEnd = strPos;
            txtarea.focus();
        }

        txtarea.scrollTop = scrollPos;
    }
    function hideKeyboard(){
        keyboardOut = false;
        keyboard.stop();
        keyboard.animate({"left" : -1215});
    }
    function openKeyboard(){
        keyboardOut = true;
        keyboard.stop();
        keyboard.animate({"left" : 200});
    }
}

var InterstellarKeyboardClass = new onScreenKeyboardClass();
