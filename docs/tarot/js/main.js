(function(global){
  // https://www.wikihow.com/Set-up-Tarot-Cards
  function tarotClass () {
    this.defaultOption = {
      model: 'RiderWaite',
      language: 'tw',
      tarotDeck: 'All_Arcana', // 'All_Arcana', 'Major_Arcana', 'Minor_Arcana'
      totalCardNum: 78, // 78, 22, 56
      cardArray: [],
      currentPickCard: [],
      spreadType: 'one_card_spread',
      spreadNumber: 1
    }
    // this.language = {
    //   tw: {
    //     card: []
    //   },
    //   en: {
    //     card: []
    //   }
    // }
    this.cardList = []
    this.spreadList = []
    this.changeModel()
    this.getCardList()
    this.getSpreadList()
    this.chooseArcana()
    return this
  } 
  tarotClass.prototype.changeModelLanguage = function (modName) {
    if (modName === 'RiderWaite') {
      this.language = global.language[modName]
    } else if (modName === 'Voyager') {
      this.language = global.language[modName]
    } else {
      this.language = global.language['RiderWaite']
    }
  }
  tarotClass.prototype.changeModel = function (modName) {
    if (modName === 'RiderWaite') {
      this.defaultOption.model = 'RiderWaite'
    } else if (modName === 'Voyager') {
      this.defaultOption.model = 'Voyager'
    } else {
      this.defaultOption.model = 'RiderWaite'
    }
    this.changeModelLanguage(modName)
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
      { type: 'one_card_spread', num: 1, name: 'one'},
      { type: 'two_card_spread', num: 2, name: 'two'},
      { type: 'three_card_spread', num: 3, name: 'three'},
      { type: 'four_card_spread', num: 4, name: 'four'},
      { type: 'five_card_spread', num: 5, name: 'five'},
      { type: 'five1_card_spread', num: 5, name: 'five1'},
      { type: 'mental_healing', num: 5, name: 'mentalHealing'},
      { type: 'five_card_cross', num: 5, name: 'fiveCross'},
      { type: 'ellipse_spread', num: 7, name: 'ellipseSpread'},
      { type: 'horseshoe', num: 7, name: 'horseshoe'},
      { type: 'hexagram', num: 7, name: 'hexagram'},
      { type: 'work_dicision_making', num: 9, name: 'workDicisionMaking'},
      { type: 'celtic_cross_spread', num: 10, name: 'celticCross'},
      { type: 'relationship_spread', num: 10, name: 'relationship'},
      { type: 'zodiac_twelve_spread', num: 12, name: 'zodiac12'},
      { type: 'zodiac_thirteen_spread', num: 13, name: 'zodiac13'},
      { type: 'other_spread', num: 0, name: 'other'}
    ]
    return this
  }
  tarotClass.prototype.getSpreadByType = function (type) {
    return this.spreadList.find(item => {
      return item.type === type
    })
  }
  tarotClass.prototype.getCurrentSpread = function () {
    const type = this.defaultOption.spreadType
    return this.spreadList.find(item => {
      return item.type === type
    })
  }
  // 選牌牌陣
  tarotClass.prototype.chooseSpreadByIndex = function (spreadIndex) {
    const spreadObject = this.spreadList[spreadIndex]
    console.log('spreadObject', spreadObject)
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
      { name: 'fool' },
      { name: 'magician' },
      { name: 'highPriestess' },
      { name: 'empress' },
      { name: 'emperor' },
      { name: 'hierophant' },
      { name: 'lovers' },
      { name: 'chariot' },
      { name: 'strength' },
      { name: 'hermit' },
      { name: 'fortuneWheel' },
      { name: 'justice' },
      { name: 'hangedMan' },
      { name: 'death' },
      { name: 'temperance' },
      { name: 'devil' },
      { name: 'tower' },
      { name: 'stars' },
      { name: 'moon' },
      { name: 'sun' },
      { name: 'judgement' },
      { name: 'world' }
    ]
    const minorArcana = [
      { name: 'aceCups' },
      { name: 'twoCups' },
      { name: 'threeCups' },
      { name: 'fourCups' },
      { name: 'fiveCups' },
      { name: 'sixCups' },
      { name: 'sevenCups' },
      { name: 'eightCups' },
      { name: 'nineCups' },
      { name: 'tenCups' },
      { name: 'pageCups' },
      { name: 'knightCups' },
      { name: 'queenCups' },
      { name: 'kingCups' },
      // ---
      { name: 'aceSwords' },
      { name: 'twoSwords' },
      { name: 'threeSwords' },
      { name: 'fourSwords' },
      { name: 'fiveSwords' },
      { name: 'sixSwords' },
      { name: 'sevenSwords' },
      { name: 'eightSwords' },
      { name: 'nineSwords' },
      { name: 'tenSwords' },
      { name: 'pageSwords' },
      { name: 'knightSwords' },
      { name: 'queenSwords' },
      { name: 'kingSwords' },
      // ---
      { name: 'aceWands' },
      { name: 'twoWands' },
      { name: 'threeWands' },
      { name: 'fourWands' },
      { name: 'fiveWands' },
      { name: 'sixWands' },
      { name: 'sevenWands' },
      { name: 'eightWands' },
      { name: 'nineWands' },
      { name: 'tenWands' },
      { name: 'pageWands' },
      { name: 'knightWands' },
      { name: 'queenWands' },
      { name: 'kingWands' },
      // ---
      { name: 'acePentacles' },
      { name: 'twoPentacles' },
      { name: 'threePentacles' },
      { name: 'fourPentacles' },
      { name: 'fivePentacles' },
      { name: 'sixPentacles' },
      { name: 'sevenPentacles' },
      { name: 'eightPentacles' },
      { name: 'ninePentacles' },
      { name: 'tenPentacles' },
      { name: 'pagePentacles' },
      { name: 'knightPentacles' },
      { name: 'queenPentacles' },
      { name: 'kingPentacles' }
    ]
    if (this.defaultOption.tarotDeck === 'Major_Arcana') {
      this.cardList = majorArcana
    } else if (this.defaultOption.tarotDeck === 'Minor_Arcana') {
      this.cardList = minorArcana
    } else {
      this.cardList = majorArcana.concat(minorArcana)
    }
    return this
  }

  tarotClass.prototype.getCardInfo = function (name) {
    return this.language[this.defaultOption.language].card.find(function(i){
      return i.name === name
    }.bind(this))
  }

  global.tarotClass = tarotClass
})(window)