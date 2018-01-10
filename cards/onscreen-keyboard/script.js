var onScreenKeyboardClass = function(){
    var lastKnownElement = undefined,
        shiftActive = false;

    recalcEventListeners();

    $('body').on('DOMNodeInserted', function () {
        recalcEventListeners();
    });

    function recalcEventListeners(){
        $("input[type=text]","input[type=textarea]").off();
        $(".onscreen-keyboard_key").off();
        $("input[type=text]").click(function(event){
            lastKnownElement = event.target;
        });
        $(".onscreen-keyboard_key").click(function(event){
            Interstellar.playRandomBeep();
            var key = $(event.target).attr("key");
            if(key == undefined){
              key = $(event.target).html();
            }
            if(shiftActive){
              key.toUpperCase();
            }else{
              key.toLowerCase();
            }
            insertAtCaret(lastKnownElement,key);
        });

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
}

var InterstellarKeyboardClass = new onScreenKeyboardClass();
