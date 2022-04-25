(function(global){
    function infoPgEvent(card){
        // this.card = card
        $("#selectModel").change(function(){
            card.changeModel($("#selectModel").val())
        });
    }
    global.infoPgEvent = infoPgEvent
})(window)
