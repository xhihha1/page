
(function(global){
    function resultPgEvent(card){
        this.card = card
        // $('#flipOne').click(function(){})
        $('#flipAll').click(function(){
            // $('.page').hide()
            // $('#spreadPg').show()
        })
        // $('#cutCard').click(function(){
        //     $('.page').hide()
        //     $('#cutPg').show()
        // })
    }
    resultPgEvent.prototype.showSelect = function (){
        const card = this.card
        const spreadObj = card.getCurrentSpread()
        let str = ''
        str += '<div class="resultSpreadName">'+spreadObj.type+'</div>'
        str += '<img class="resultSpreadImg" src="./tarot/img/spread/'+spreadObj.name+'.png">'
        $('#spreadArea').html(str)
        str = ''
        for (let i=0;i<card.defaultOption.currentPickCard.length;i++) {
            const idx = card.defaultOption.currentPickCard[i].index
            const reversed = card.defaultOption.currentPickCard[i].reversed === -1 ? true : false
            const cardName = card.cardList[idx].name
            str += '<div class="white">'
            str += '<span>'+cardName+'</span>'
            if (reversed) {
                str += '<i class="downIcon"></i>'
            } else {
                str += '<i class="upIcon"></i>'
            }
            str += '</div>'
        }
        $('#resultArea').html(str)
        str = ''
        for (let i=0;i<card.defaultOption.currentPickCard.length;i++) {
            const idx = card.defaultOption.currentPickCard[i].index
            const cardName = card.cardList[idx].name
            const cardLangObj = card.getCardInfo(cardName)
            const src = './tarot/img/'+card.defaultOption.model+'/'+cardName+'.png'
            const reversed = card.defaultOption.currentPickCard[i].reversed === -1 ? 'reversed' : ''
            str += '<li class="singleCardInfo">'
            str += '    <div class="singleCardInfoLeft"><img class="singleCardInfoImg '+reversed+'" src="'+src+'"></div>'
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
        }
        $('#resultPg .cardInfo > ul').html(str)
    }
global.resultPgEvent = resultPgEvent
})(window)