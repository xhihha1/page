
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
            const src = './tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg'
            const reversed = card.defaultOption.currentPickCard[i].reversed === -1 ? 'reversed' : ''
            str += '<li class="singleCardInfo">'
            str += '    <div class="singleCardInfoLeft"><img class="singleCardInfoImg '+reversed+'" src="'+src+'"></div>'
            str += '    <div class="singleCardInfoRight">'+cardName+'</div>'
            str += '</li>'
        }
        $('#resultPg .cardInfo > ul').html(str)
    }
global.resultPgEvent = resultPgEvent
})(window)