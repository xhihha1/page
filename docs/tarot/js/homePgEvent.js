(function(global){
    function homePageEvnt () {
        $('.backHome').click(function(){
            $('.page').hide()
            $('#home').show()
            // $('#product-slider').slick('unslick');
        })
        $('#info').click(function(){
            $('.page').hide()
            $('#infoPg').show()
        })
        $('#start').click(function(){
            $('.page').hide()
            $('#chooseArcanaPg').show()
        })
        $('#autoPick').click(function(){
            card.shuffleCard()
            // console.log(JSON.stringify(card.defaultOption.cardArray))
            // console.log(JSON.stringify(card.defaultOption.cardArray[0]))
            card.chooseCard(card.defaultOption.cardArray[0])
            // console.log(JSON.stringify(card.defaultOption.currentPickCard))
            $('.cardInfo').find('li').remove()
            for (var i = 0; i < card.defaultOption.currentPickCard.length; i++) {
                const cardName = card.cardList[card.defaultOption.currentPickCard[i].index].name
                const cardLangObj = card.getCardInfo(cardName)
                let str = ''
                str += '<li class="singleCardInfo">'
                if (card.defaultOption.currentPickCard[i].reversed === -1) {
                    str += '    <div class="singleCardInfoLeft"><img class="singleCardInfoImg reversed" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.png"></div>'
                } else {
                    str += '    <div class="singleCardInfoLeft"><img class="singleCardInfoImg" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.png"></div>'
                }
                
                str += '    <div class="singleCardInfoRight">'
                str += '        <div>Name: '+cardLangObj.title+'</div>'
                if(cardLangObj.mean) { str += '        <div>Mean: '+cardLangObj.mean+'</div>' }
                if(cardLangObj.keyword) { str += '        <div>Keyword: '+cardLangObj.keyword+'</div>' }
                if(cardLangObj.lovedKeyword) { str += '        <div>Love: '+cardLangObj.lovedKeyword+'</div>' }
                if (card.defaultOption.currentPickCard[i].reversed === -1 && cardLangObj.reversed) {
                    str += '        <div>Reverse:</div>'
                    if(cardLangObj.reversed.keyword) { str += '        <div>- Keyword: '+cardLangObj.reversed.keyword+'</div>' }
                    if(cardLangObj.reversed.lovedKeyword) { str += '        <div>- Love: '+cardLangObj.reversed.lovedKeyword+'</div>' }
                }
                if(cardLangObj.past) { str += '        <div>Past: '+cardLangObj.past+'</div>' }
                if(cardLangObj.current) { str += '        <div>Current: '+cardLangObj.current+'</div>' }
                if(cardLangObj.future) { str += '        <div>Future: '+cardLangObj.future+'</div>' }
                if(cardLangObj.text) { str += '        <div>'+cardLangObj.text+'</div>' }
                str += '    </div>'
                str += '</li>'
                $('.cardInfo').children('ul').append(str)
            }
            $('.singleCardImg').attr('src', './tarot/img/'+card.defaultOption.model+'/'+card.cardList[card.defaultOption.currentPickCard[0].index].name+'.png')
            if(card.defaultOption.currentPickCard[0].reversed === -1) {
                $('.singleCardImg').addClass('reversed')
            } else {
                $('.singleCardImg').removeClass('reversed')
            }
        })

        $('#home .singleCardImg').attr('src', './tarot/img/backImage.png')
        $('#home .singleCardInfoImg').attr('src', './tarot/img/backImage.png')
    }
  global.homePageEvnt = homePageEvnt
})(window)