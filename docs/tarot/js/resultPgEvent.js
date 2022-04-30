
(function(global){
    function resultPgEvent(card){
        this.card = card
        // $('#flipOne').click(function(){})
        $('#flipAll').click(function(){
            // $('.page').hide()
            // $('#spreadPg').show()
        })
        $('#downloadImg').click(function(){
            // $('.page').hide()
            // $('#spreadPg').show()
            this.downloadImage()
        }.bind(this))
        // $('#cutCard').click(function(){
        //     $('.page').hide()
        //     $('#cutPg').show()
        // })
        this.initCanvas()
    }

    resultPgEvent.prototype.downloadImage = function (){
        console.log('??????')
        const pngData = this.__canvas.toDataURL({
            format: 'jpeg',
            quality: 0.8
        });
        var a = $("<a>")
        .attr("href", pngData)
        .attr("download", "img.png")
        .appendTo("body");
        a[0].click();
        a[0].remove();
        // let imageA = document.getElementById('imageLoader')
        // if(!imageA){
        //     imageA
        // }
        // this.href = canvas.toDataURL({
        //     format: 'jpeg',
        //     quality: 0.8
        // });
        // this.download = 'canvas.png'
        
    }
    resultPgEvent.prototype.showSelect = function (){
        const card = this.card
        const spreadObj = card.getCurrentSpread()
        // let str = ''
        // str += '<div class="resultSpreadName">'+spreadObj.type+'</div>'
        // str += '<img class="resultSpreadImg" src="./tarot/img/spread/'+spreadObj.name+'.png">'
        // $('#spreadArea').html(str)
        $('.resultSpreadName').html(spreadObj.type)
        this.loadJson(spreadObj.name)
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
        // $('#resultArea').html(str)
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
    resultPgEvent.prototype.initCanvas = function () {
        this.__canvas = new fabric.Canvas('c');
        $(window).resize(function() {
            this.__canvas.setDimensions({
                width: $('.resultSpreadCanvas').width() || 1,
                height: $('.resultSpreadCanvas').height() || 1
            });
            this.drawCanvas()
            this.__canvas.renderAll();
         }.bind(this))
    }
    resultPgEvent.prototype.loadJson = function (name){
        $.getJSON( "./tarot/json/" + name + '.json', function( data ) {
            // $.each( data, function( key, val ) {
            //   items.push( "<li id='" + key + "'>" + val + "</li>" );
            // });
            const card = this.card
            const srcList = []
            for (let i=0;i<card.defaultOption.currentPickCard.length;i++) {
                const idx = card.defaultOption.currentPickCard[i].index
                const cardName = card.cardList[idx].name
                // const cardLangObj = card.getCardInfo(cardName)
                const reversed = card.defaultOption.currentPickCard[i].reversed === -1
                const src = './tarot/img/'+card.defaultOption.model+'/'+cardName+'.png'
                srcList.push({'src': src, 'reversed': reversed})
            }
            $.each(data, function( key, value ) {
                if (key === 'objects') {
                    $.each(value, function( index, object ) {
                        if(srcList[index]){
                            object.type = 'image'
                            object.src = srcList[index].src
                            if(srcList[index].reversed){
                                object.angle = object.angle + 180
                            }
                        }
                    })
                }
            });
            this.data = data
            const canvas = this.__canvas
            this.drawCanvas(canvas)
        }.bind(this));
    }
    resultPgEvent.prototype.drawCanvas = function (){
        if (this.data) {
            const canvas = this.__canvas
            canvas.setWidth($('.resultSpreadCanvas').width())
            canvas.setHeight($('.resultSpreadCanvas').height())
            canvas.loadFromJSON(this.data, canvas.renderAll.bind(canvas));
            canvas.setZoom(canvas.width/1000)
        }
    }
global.resultPgEvent = resultPgEvent
})(window)