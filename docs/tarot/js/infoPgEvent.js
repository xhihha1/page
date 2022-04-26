(function(global){
    function infoPgEvent(card){
        // this.card = card
        $("#selectModel").change(function(){
            card.changeModel($("#selectModel").val())
            $('#home .singleCardImg').attr('src', './tarot/img/'+card.defaultOption.model+'/backImage.png')
            $('#home .singleCardInfoImg').attr('src', './tarot/img/'+card.defaultOption.model+'/backImage.png')
        });
    }
    global.infoPgEvent = infoPgEvent
})(window)
