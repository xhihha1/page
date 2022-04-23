(function(global){
    function chooseArcanaEvent(card){
        this.card = card
        $('.backHome').click(function(){
            $('.page').hide()
            $('#home').show()
            $('#product-slider').slick('unslick');
        })
        $('#allCard,#allCardN').click(function(){
            card.chooseArcana('All_Arcana')
            card.shuffleCard()
            $('.page').hide()
            $('#shufflePg').show()
            shuffleObj.createCardList()
        })
        $('#onlyMajor,#onlyMajorN').click(function(){
            card.chooseArcana('Major_Arcana')
            card.shuffleCard()
            $('.page').hide()
            $('#shufflePg').show()
            shuffleObj.createCardList()
        })
        $('#onlyMinor,#onlyMinorN').click(function(){
            card.chooseArcana('Minor_Arcana')
            card.shuffleCard()
            $('.page').hide()
            $('#shufflePg').show()
            shuffleObj.createCardList()
        })
    }
global.chooseArcanaEvent = chooseArcanaEvent
})(window)