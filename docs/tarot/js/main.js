(function(global){
  // https://www.wikihow.com/Set-up-Tarot-Cards
  function tarotClass () {
    this.defaultOption = {
      tarotDeck: 'All_Arcana', // 'All_Arcana', 'Major_Arcana', 'Minor_Arcana'
      totalCardNum: 78, // 78, 22, 56
      cardArray: [],
      currentPickCard: [],
      spreadType: 'one_card_spread',
      spreadNumber: 1
    }
    this.cardList = []
    this.spreadList = []
    this.getCardList()
    this.getSpreadList()
    this.chooseArcana()
    return this
  } 
  tarotClass.prototype.generateCardArray = function (num) {
    const ary = []
    for (var i = 0; i < num; i++) {
      ary.push({index: i, reversed: 1})
    }
    this.defaultOption.cardArray = ary
    return this
  }
  tarotClass.prototype.chooseArcana = function (tarotDeck) {
    // Major/Minor Arcana
    if (tarotDeck === 'Major_Arcana') {
      this.defaultOption.tarotDeck = 'Major_Arcana'
      this.defaultOption.totalCardNum = 22
    } else if (tarotDeck === 'Minor_Arcana') {
      this.defaultOption.tarotDeck = 'Minor_Arcana'
      this.defaultOption.totalCardNum = 56
    } else {
      this.defaultOption.tarotDeck = 'All_Arcana'
      this.defaultOption.totalCardNum = 78
    }
    this.getCardList()
    this.generateCardArray(this.defaultOption.totalCardNum)
  }
  tarotClass.prototype.shuffleCard = function () {
    this.defaultOption.currentPickCard = []
    this.defaultOption.cardArray.sort(function (i) {
      i.reversed = Math.random() > 0.5? 1: -1
      return Math.random() > 0.5? 1: -1
    })
    return this
  }
  tarotClass.prototype.cutCard = function () {

  }
  tarotClass.prototype.getSpreadList = function () {
    this.spreadList = [
      { type: 'one_card_spread', num: 1},
      { type: 'three_card_spread', num: 3},
      { type: 'five_card_spread', num: 5},
      { type: 'ellipse_spread', num: 7},
      { type: 'celtic_cross_spread', num: 10},
      { type: 'thirteen_spread', num: 13},
      { type: 'other_spread', num: 0}
    ]
    return this
  }
  // 選牌牌陣
  tarotClass.prototype.chooseSpreadByIndex = function (spreadIndex) {
    const spreadObject = this.spreadList[spreadIndex]
    if (spreadObject) {
      this.defaultOption.spreadType = spreadObject.type
      this.defaultOption.spreadNumber = spreadObject.num
    }
    this.defaultOption.currentPickCard = []
    return this
  }
  tarotClass.prototype.chooseCard = function (item) {
    // check card num
    if (this.defaultOption.spreadNumber !== 0 &&
        this.defaultOption.currentPickCard.length >= this.defaultOption.spreadNumber) {
      return this
    }
    const itemIdx = item.index
    // check unique
    const exist = this.defaultOption.currentPickCard.find(function(i){
      return i.index === itemIdx
    })
    if (!exist) {
      this.defaultOption.currentPickCard.push(item)
    }
    return this
  }
  tarotClass.prototype.chooseCardByIndex = function (index) {
    // check card num
    if (this.defaultOption.spreadNumber !== 0 &&
        this.defaultOption.currentPickCard.length >= this.defaultOption.spreadNumber) {
      return this
    }
    const itemIdx = index
    // check unique
    const exist = this.defaultOption.currentPickCard.find(function(i){
      return i.index === itemIdx
    })
    if (!exist) {
      const item = this.defaultOption.cardArray.find(function(i){
        return i.index === itemIdx
      })
      if (item) {
        this.defaultOption.currentPickCard.push(item)
      }
    }
    return this
  }
  tarotClass.prototype.getCardList = function () {
    // Major_Arcana, Minor_Arcana
    const majorArcana = [
      { name: 'chariot' },
      { name: 'death' },
      { name: 'devil' },
      { name: 'emperor' },
      { name: 'empress' },
      { name: 'fool' },
      { name: 'fortuneWheel' },
      { name: 'hangedMan' },
      { name: 'hermit' },
      { name: 'hierophant' },
      { name: 'hightPriestess' },
      { name: 'judgment' },
      { name: 'justice' },
      { name: 'lovers' },
      { name: 'magician' },
      { name: 'moon' },
      { name: 'star' },
      { name: 'strength' },
      { name: 'sun' },
      { name: 'temperance' },
      { name: 'tower' },
      { name: 'world' }
    ]
    const minorArcana = []
    if (this.defaultOption.tarotDeck === 'Major_Arcana') {
      this.cardList = majorArcana
    } else if (this.defaultOption.tarotDeck === 'Minor_Arcana') {
      this.cardList = minorArcana
    } else {
      this.cardList = majorArcana.concat(minorArcana)
    }
    
    return this
  }

  global.tarotClass = tarotClass
})(window)