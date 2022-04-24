
(function(global){
    function pickCardPgEvent(card){
        this.card = card
        this.selectIndex = 0
        // $('#flipOne').click(function(){})
        $('#finishPick').click(function(){
            $('.page').hide()
            $('#resultPg').show()
            resultObj.showSelect()
        })
        $('#showSpread').click(function(){
            // $('.page').hide()
            // $('#cutPg').show()
        })
        $('#pickCardArea').click(function(e){
            let target = $(e.target)
            if(target.hasClass('cardImgListflex')){
                target = target
            } else if(target.parents('.cardImgListflex')) {
                target = target.parents('.cardImgListflex')
            } else {
                target = undefined
            }
            if(this.selectIndex < this.card.defaultOption.spreadNumber || this.card.defaultOption.spreadNumber === 0){
                this.selectIndex++
                target.find('.selectCover').text(this.selectIndex)
                target.find('.selectCover').show()
                const idx = target.prevAll('.cardImgListflex').length
                this.card.chooseCardByIndex(idx)
            }
        }.bind(this))
    }
    pickCardPgEvent.prototype.resetSelect = function (){
        this.selectIndex = 0
    }
    pickCardPgEvent.prototype.createCardList = function (){
        this.resetSelect()
        const card = this.card
        let str = ''
        for (let i=0;i<card.defaultOption.cardArray.length;i++) {
            const cardName = card.cardList[card.defaultOption.cardArray[i].index].name
            str += '<div class="cardImgListflex">'
            str += '    <img class="singleCardImg backcover" src="./tarot/img/backImage.png">'
            // if (card.defaultOption.cardArray[i].reversed === -1) {
            //     str += '    <img class="singleCardImg frontcover hide reversed" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg">'
            // } else {
            //     str += '    <img class="singleCardImg frontcover" hide src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg">'
            // }
            str += '<div class="selectCover"></div>'
            str += '</div>'
        }
        $('#pickCardArea').html(str)
    }
global.pickCardPgEvent = pickCardPgEvent
})(window)