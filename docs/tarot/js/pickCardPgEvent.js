
(function(global){
    function pickCardPgEvent(card){
        this.card = card
        this.selectIndex = 0;
        this.cAnimateIdx = 0;
        this.iText = 0;
        this.txt = 'Ask your question silently in your mind or out loud. If you don’t have a specific question, you may simply ask your Tarot cards “what do I need to know right now?” or “What messages do you have for me today?”';
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
        $('#pickPgCoverTextOK').click(function(){
            $('#pickPgCover').fadeOut("slow")
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
                const pickIndex = card.defaultOption.cardArray[idx].index
                this.card.chooseCardByIndex(pickIndex)
            }
        }.bind(this))
    }
    pickCardPgEvent.prototype.beforeSelectCard = function (){
        var speed = 50;
        if (this.iText < this.txt.length) {
            $('#pickPgCover').removeClass('easeOutCover')
            document.getElementById("pickPgCoverTextP").innerHTML += this.txt.charAt(this.iText);
            this.iText++;
            setTimeout(function(){ this.beforeSelectCard() }.bind(this), speed);
        } else {
            // $('#pickPgCover').addClass('easeOutCover')
        }
    }
    pickCardPgEvent.prototype.resetSelect = function (){
        this.selectIndex = 0
    }
    pickCardPgEvent.prototype.cardListAnimation = function (){
        const card = this.card
        var speed = 60;
        let str = ''
        if (this.cAnimateIdx < card.defaultOption.cardArray.length) {
            const cardName = card.cardList[card.defaultOption.cardArray[this.cAnimateIdx].index].name
            str += '<div class="cardImgListflex">'
            str += '    <img class="singleCardImg backcover" src="./tarot/img/'+card.defaultOption.model+'/backImage.png">'
            str += '    <div class="selectCover"></div>'
            str += '</div>'
            $('#pickCardArea').html($('#pickCardArea').html() + str)
            this.cAnimateIdx++;
            setTimeout(function(){ this.cardListAnimation() }.bind(this), speed);
        }
    }
    pickCardPgEvent.prototype.createCardList = function (){
        this.iText = 0;
        this.cAnimateIdx = 0;
        $('#pickPgCover').fadeIn("slow")
        $('#pickPgCoverTextP').html('')
        this.beforeSelectCard()
        this.resetSelect()
        // $('#pickCardArea').html('')
        // this.cardListAnimation()
        const card = this.card
        let str = ''
        for (let i=0;i<card.defaultOption.cardArray.length;i++) {
            const cardName = card.cardList[card.defaultOption.cardArray[i].index].name
            str += '<div class="cardImgListflex">'
            str += '    <img class="singleCardImg backcover" src="./tarot/img/'+card.defaultOption.model+'/backImage.png">'
            // if (card.defaultOption.cardArray[i].reversed === -1) {
            //     str += '    <img class="singleCardImg frontcover reversed" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.png">'
            // } else {
            //     str += '    <img class="singleCardImg frontcover" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.png">'
            // }
            str += '<div class="selectCover"></div>'
            str += '</div>'
        }
        $('#pickCardArea').html(str)
    }
global.pickCardPgEvent = pickCardPgEvent
})(window)