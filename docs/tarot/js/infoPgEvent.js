(function(global){
    function infoPgEvent(card){
        // this.card = card
        if (localStorage.getItem('tarotModel')) {
            card.changeModel(localStorage.getItem('tarotModel'))
            $('#home .singleCardImg').attr('src', './tarot/img/'+card.defaultOption.model+'/backImage.png')
            $('#home .singleCardInfoImg').attr('src', './tarot/img/'+card.defaultOption.model+'/backImage.png')
            $("#selectModel").val(localStorage.getItem('tarotModel'))
        }
        $("#selectModel").change(function(){
            card.changeModel($("#selectModel").val())
            localStorage.setItem('tarotModel', $("#selectModel").val())
            $('#home .singleCardImg').attr('src', './tarot/img/'+card.defaultOption.model+'/backImage.png')
            $('#home .singleCardInfoImg').attr('src', './tarot/img/'+card.defaultOption.model+'/backImage.png')
            // localStorage.getItem(key)
        });
    }
    global.infoPgEvent = infoPgEvent
})(window)
