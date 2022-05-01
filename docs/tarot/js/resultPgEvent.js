
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

        $('#downloadText').click(function(){
            this.downloadText()
        }.bind(this))
        // $('#cutCard').click(function(){
        //     $('.page').hide()
        //     $('#cutPg').show()
        // })
        this.initCanvas()
    }

    resultPgEvent.prototype.downloadText = function (){
        var text = ''
        for (let i=0;i<card.defaultOption.currentPickCard.length;i++) {
            const idx = card.defaultOption.currentPickCard[i].index
            const cardName = card.cardList[idx].name
            const cardLangObj = card.getCardInfo(cardName)
            text += JSON.stringify(cardLangObj)
        }
        var pngData = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
        var a = $("<a>")
        .attr("href", pngData)
        .attr("download", "TarotResult")
        .appendTo("body");
        a[0].click();
        a[0].remove();
    }

    resultPgEvent.prototype.downloadImage = function (){
        const pngData = this.__canvasBack.toDataURL({
            format: 'jpeg',
            quality: 1
        });
        var a = $("<a>")
        .attr("href", pngData)
        .attr("download", "img.jpeg")
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
        this.__canvasBack = new fabric.Canvas('hImg');
        this.__canvas.on('after:render', function (opt) {
            const j = this.__canvas.toJSON()
            this.__canvasBack.loadFromJSON(j, this.__canvasBack.renderAll.bind(this.__canvasBack));
        }.bind(this));
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
        if (name === 'other') {
            this.otherJson()
            return false
        }
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
                            object.selectable = false
                            object.hasBorders = false
                            object.hasControls = false
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
            this.__canvasBack.loadFromJSON(this.data, this.__canvasBack.renderAll.bind(this.__canvasBack));
        }
    }

    resultPgEvent.prototype.otherJson = function () {
        const jsonData = {
            "version": "4.1.0",
            "objects": []
        }
        const card = this.card
        const srcList = []
        for (let i=0;i<card.defaultOption.currentPickCard.length;i++) {
            const idx = card.defaultOption.currentPickCard[i].index
            const cardName = card.cardList[idx].name
            // const cardLangObj = card.getCardInfo(cardName)
            const reversed = card.defaultOption.currentPickCard[i].reversed === -1
            const src = './tarot/img/'+card.defaultOption.model+'/'+cardName+'.png'
            srcList.push({'src': src, 'reversed': reversed})
            jsonData.objects.push({
                "type": "image",
                "version": "4.1.0",
                "originX": "center",
                "originY": "center",
                "left": 400 + Math.round(100 * Math.random()),
                "top": 400 + Math.round(100 * Math.random()),
                "width": 200,
                "height": 340,
                "fill": "rgb(37,53,73)",
                "stroke": null,
                "strokeWidth": 1,
                "strokeDashArray": null,
                "strokeLineCap": "butt",
                "strokeDashOffset": 0,
                "strokeLineJoin": "miter",
                "strokeMiterLimit": 4,
                "scaleX": 1,
                "scaleY": 1,
                "angle": reversed? 180 : 0,
                "flipX": false,
                "flipY": false,
                "opacity": 1,
                "shadow": null,
                "visible": true,
                "backgroundColor": "",
                "fillRule": "nonzero",
                "paintFirst": "fill",
                "globalCompositeOperation": "source-over",
                "skewX": 0,
                "skewY": 0,
                "rx": 0,
                "ry": 0,
                "src": src
            })
        }
        this.data = jsonData
        const canvas = this.__canvas
        this.drawCanvas(canvas)
    }
global.resultPgEvent = resultPgEvent
})(window)