
(function(global){
    function spreadPgEvent(){
        this.card = card
        $('.backHomeSpread').click(function(){
            $('.page').hide()
            $('#home').show()
            $('#product-slider').slick('unslick');
        })
        // $('#flipOne').click(function(){})
        $('#submitSpread').click(function(){
            $('#product-slider').slick('unslick');
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
        let optionsStr = ''
        for (let i=0;i<card.spreadList.length;i++) {
            // const cardName = card.cardList[card.defaultOption.cardArray[i].index].name
            str += '<div class="spreadListCard">'
            // str += card.spreadList[i].type
            str += '    <div>'+card.spreadList[i].name+'</div>'
            str += '    <img class="spreadImgCard" src="./tarot/img/spread/'+card.spreadList[i].name+'.png">'
            str += '</div>'

            optionsStr += '<option value="'+i+'">'+card.spreadList[i].name+'</option>'
        }
        $('#product-slider').html(str)
        $('#spreadSelect').html(optionsStr)
        this.resize()
        $('#product-slider').slick({
            dots: false
        });
        $('#product-slider').on('beforeChange', function(event, slick, currentSlide, nextSlide){
            $('#spreadSelect').val(nextSlide)
        })
        $('#spreadSelect').off("change")
        $('#spreadSelect').on("change", function(){
            $('#product-slider').slick('slickGoTo', parseInt($('#spreadSelect').val()))
        });
    }
    spreadPgEvent.prototype.resize = function () {
        const imgSize = Math.min($('#product-slider').width(), $('#product-slider').height()) - 50;
        $('.spreadImgCard').width(imgSize)
        $('.spreadImgCard').height(imgSize)
    }
global.spreadPgEvent = spreadPgEvent
})(window)