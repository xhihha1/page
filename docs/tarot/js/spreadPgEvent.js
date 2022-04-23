
(function(global){
    function spreadPgEvent(){
        this.card = card
        // $('#flipOne').click(function(){})
        $('#submitSpread').click(function(){
            $('.page').hide()
            $('#pickCardPg').show()
            // Get the current slide
            var currentSlide = $('#product-slider').slick('slickCurrentSlide');
            this.card.chooseSpreadByIndex(currentSlide)
            $('#product-slider').slick('unslick');
            pickCardObj.createCardList()
        }.bind(this))
        // $('#cutCard').click(function(){
        //     $('.page').hide()
        //     $('#cutPg').show()
        // })
    }
    spreadPgEvent.prototype.setSpreadList = function (){
        const card = this.card
        let str = ''
        for (let i=0;i<card.spreadList.length;i++) {
            // const cardName = card.cardList[card.defaultOption.cardArray[i].index].name
            str += '<div class="spreadListCard">'
            // str += card.spreadList[i].type
            str += '    <div>'+card.spreadList[i].type+'</div>'
            str += '    <img class="spreadImgCard" src="./tarot/img/spread/'+card.spreadList[i].name+'.png">'
            str += '</div>'
        }
        $('#product-slider').html(str)
        this.resize()
        $('#product-slider').slick({
            dots: true
        });
    }
    spreadPgEvent.prototype.resize = function () {
        const imgSize = Math.min($('#product-slider').width(), $('#product-slider').height()) - 50;
        $('.spreadImgCard').width(imgSize)
        $('.spreadImgCard').height(imgSize)
    }
global.spreadPgEvent = spreadPgEvent
})(window)