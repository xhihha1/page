
  
(function (global) {

    // 'use strict';
  
    var fabric = global.fabric || (global.fabric = {});
  
    if (fabric.NumCard) {
      fabric.warn('fabric.NumCard is already defined');
      return;
    }
  
    fabric.NumCard = fabric.util.createClass(fabric.Rect, {
      type: "NumCard",
      initialize(options) {
        // 使用原方法匯入屬性
        this.callSuper('initialize', options)
        // this.height = height || 100
        // this.width = width || 100
      },
      toObject: function (propertiesToInclude) {
        return this.callSuper('toObject', ['radius', 'startAngle', 'endAngle'].concat(propertiesToInclude));
      },
      getArea() {
        return this.height * this.width
      },
      _render(ctx) {
        // 先畫出原本的圖形
        const color = this.color? this.color : 'rgb(200,166,118)'
        ctx.fillStyle = this.fill? this.fill : 'rgb(37,53,73)'
        this.callSuper('_render', ctx)
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.beginPath()
        const w = this.width / 2
        const h = this.height / 2
        const shift5 = 5
        const left = 0 // this.left
        const top = 0 // this.top
        // ctx.rect( left - w + shift5, top - h + shift5, this.width - shift5 * 2, this.height - shift5 * 2);
        ctx.rect( left - w + shift5, top - h + shift5, this.width - shift5 * 2, this.height - shift5 * 2);
        ctx.stroke()
        const fontSize = 100
        ctx.font = '900 '+fontSize+'px Arial'
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const text = this.index? this.index: 0
        ctx.fillText(text, top, left)
      }
    })
  
    fabric.NumCard.fromObject = function (object, callback) {
      // This function is used for deserialize json and convert object json into button object again. (called when we call loadFromJson() fucntion on canvas)
      return fabric.Object._fromObject("NumCard", object, callback);
    };

  
  })(typeof exports !== 'undefined' ? exports : this);