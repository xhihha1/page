(function(global){
    function homePageEvnt () {
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
                    str += '    <div class="singleCardInfoLeft"><img class="singleCardInfoImg reversed" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg"></div>'
                } else {
                    str += '    <div class="singleCardInfoLeft"><img class="singleCardInfoImg" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg"></div>'
                }
                
                str += '    <div class="singleCardInfoRight">'
                str += '        <div>Name: '+cardLangObj.title+'</div>'
                str += '        <div>Mean: '+cardLangObj.mean+'</div>'
                str += '        <div>Keyword: '+cardLangObj.keyword+'</div>'
                str += '        <div>Love: '+cardLangObj.lovedKeyword+'</div>'
                if (card.defaultOption.currentPickCard[i].reversed === -1 && cardLangObj.reversed) {
                    str += '        <div>Reverse:</div>'
                    str += '        <div>- Keyword: '+cardLangObj.reversed.keyword+'</div>'
                    str += '        <div>- Love: '+cardLangObj.reversed.lovedKeyword+'</div>'
                }
                str += '        <div>Past: '+cardLangObj.past+'</div>'
                str += '        <div>Current: '+cardLangObj.current+'</div>'
                str += '        <div>Future: '+cardLangObj.future+'</div>'
                str += '    </div>'
                str += '</li>'
                $('.cardInfo').children('ul').append(str)
            }
            $('.singleCardImg').attr('src', './tarot/img/'+card.defaultOption.model+'/'+card.cardList[card.defaultOption.currentPickCard[0].index].name+'.jpg')
            if(card.defaultOption.currentPickCard[0].reversed === -1) {
                $('.singleCardImg').addClass('reversed')
            } else {
                $('.singleCardImg').removeClass('reversed')
            }
        })
        $('#info').click(function(){})
    }
  global.homePageEvnt = homePageEvnt
})(window)