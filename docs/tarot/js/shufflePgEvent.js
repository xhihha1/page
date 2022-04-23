
(function(global){
    function shufflePgEvent(card){
        this.card = card
        this.flip = false
        $('#flipOne').click(function(){
            if(this.flip){
                this.flip = false
                $('#flipOne').css('color', 'rgb(200,166,118)')
            } else {
                this.flip = true
                $('#flipOne').css('color', 'rgb(200,0,0)')
            }
        }.bind(this))
        $('#chooseSpread').click(function(){
            $('.page').hide()
            $('#spreadPg').show()
            spreadObj.setSpreadList()
        })
        $('#cutCard').click(function(){
            $('.page').hide()
            $('#cutPg').show()
        })
        $('#shufflePgCardArea').click(function(e){
            let target = $(e.target)
            if(target.hasClass('cardImgList')){
                target = target
            } else if(target.parents('.cardImgList')) {
                target = target.parents('.cardImgList')
            } else {
                target = undefined
            }
            if(target && this.flip){
                target.children('.frontcover').hasClass('hide')? target.children('.frontcover').removeClass('hide') : target.children('.frontcover').addClass('hide');
                target.children('.backcover').hasClass('hide')? target.children('.backcover').removeClass('hide') : target.children('.backcover').addClass('hide');
            }
        }.bind(this))
    }
    shufflePgEvent.prototype.createCardList = function (){
        const card = this.card
        let str = ''
        for (let i=0;i<card.defaultOption.cardArray.length;i++) {
            const cardName = card.cardList[card.defaultOption.cardArray[i].index].name
            str += '<div class="cardImgList">'
            if (card.defaultOption.cardArray[i].reversed === -1) {
                str += '    <img class="singleCardImg frontcover hide reversed" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg">'
            } else {
                str += '    <img class="singleCardImg frontcover hide" src="./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg">'
            }
            str += '    <img class="singleCardImg backcover" src="./tarot/img/backImage.png">'
            str += '</div>'
        }
        $('#shufflePgCardArea').html(str)
        // const cardName = card.cardList[card.defaultOption.currentPickCard[i].index].name
        // "./tarot/img/'+card.defaultOption.model+'/'+cardName+'.jpg"
    }

global.shufflePgEvent = shufflePgEvent
})(window)