(function (global) {
    const info = [{
            type: 'one_card_spread',
            num: 1,
            name: 'one',
            info: '① 代表問題的解法或目前狀態。'
        },
        {
            type: 'two_card_spread',
            num: 2,
            name: 'two'
        },
        {
            type: 'three_card_spread',
            num: 3,
            name: 'three',
            info: '① 代表過去的情況與狀況。<br>② 代表現在的狀態與處境。<br>③ 代表未來的走向與趨勢。<br/>靈魂　　心理　　身體　　—身心靈牌陣<br/>前面　　中間　　後面　　—空間方位牌陣<br/>自己　　關係　　對方　　—愛情關係牌陣<br/>上司　　自己　　屬下　　—職場人際牌陣'
        },
        {
            type: 'four_card_spread',
            num: 4,
            name: 'four'
        },
        {
            type: 'five_card_spread',
            num: 5,
            name: 'five'
        },
        {
            type: 'five1_card_spread',
            num: 5,
            name: 'five1',
            info: '1. What are you avoiding that you need to face?<br/>2. How are you separating yourself from others?<br/>3. How can you get along better with others?<br/>4. What responsibilities do you need to accept and take on?<br/>5. How is guilt affecting your life and your decision making?<br/>'
        },
        {
            type: 'mental_healing',
            num: 5,
            name: 'mentalHealing',
            info: '1. What am I seeing in others that I can\'t seein myself?<br/>2. What is the source of this projection?<br/>3. What part of this projection can I reclaim?<br/>4. What feelings will I experience when I release this pattern?<br/>5. What could I gain, like a skill or knowledge, by reclaiming this projection?<br/>'
        },
        {
            type: 'five_card_cross',
            num: 5,
            name: 'fiveCross',
            info: '1. Past<br/>2. Present<br/>3. Future<br/>4. Core reason for circumstances<br/>5. Potential situation<br/>'
        },
        {
            type: 'five_card_spread2',
            num: 5,
            name: 'fiveCross2',
            info: '① 問題。<br/>② 內在心境。<br/>③ 外在情勢。<br/>④ 建議與理解。<br/>⑤ 洞見/綜觀全局。'
        },
        {
            type: 'ellipse_spread',
            num: 7,
            name: 'ellipseSpread',
            info: '算與他人的緣分<br/>1. 代表的是求問者過去的戀愛經驗。<br/>2. 則是求問者與對方目前的狀況。<br/>3. 是求問者與對方的未來狀況。<br/>4. 象徵的是這副牌建議求問者採取的行動。<br/>5. 是對方的個性、行事的特徵。<br/>6. 為兩人關係可能出現的阻礙。<br/>7. 代表兩人最終的結局。 <br/>'
        },
        {
            type: 'horseshoe',
            num: 7,
            name: 'horseshoe',
            info: '1. Past<br/>2. Present<br/>2. Future<br/>3. Future<br/>4. Attitude towards question<br/>5. Other influences<br/>6. Obstacles<br/>7. Likely outcome<br/>'
        },
        {
            type: 'hexagram',
            num: 7,
            name: 'hexagram',
            info: '① ：問題過去狀況。<br/>② ：問題現在狀況。<br/>③ ：問題未來狀況。<br/>④ ：解決此一問題的對應策略。<br/>⑤ ：目前的環境與周遭狀況。<br/>⑥ ：問卜者本人抱持的態度與心態。<br/>⑦ ：結果或可能發生的結局。'
        },
        {
            type: 'work_dicision_making',
            num: 9,
            name: 'workDicisionMaking',
            info: '請先設定工作A, B<br/>1. 就個人而言我在尋找什麼類型工作<br/>2. 若要選擇工作A所給的提示<br/>3. 若要選擇工作B所給的提示<br/>4.工作A對我的吸引力<br/>5.6. 工作A的優點、缺點<br/>7. 工作B對我的吸引力<br/>8.9. 工作B的優點、缺點<br/>'
        },
        {
            type: 'celtic_cross_spread',
            num: 10,
            name: 'celticCross',
            info: '① ：現況：代表問題的現狀。<br/>② ：影響因素 : 表示加在現況上的阻力或助力。橫放的牌，圖案的正面頂端朝右為正位，反之正面頂端朝左，則為逆位。<br/>③ ：理想 : 表示問卜者覺得最理想的狀況，或是對於事情的想法。<br/>④ ：基礎 : 表示目前已累積的成果或可以利用的資源，以及問題的成因。<br/>⑤ ：過去 : 問題的過去狀況。<br/>⑥ ：未來 : 表示問卜者未來會發生的事情。<br/>⑦ ：自我 : 問卜者本身的狀況。<br/>⑧ ：環境 : 表示外在環境因素或他人的觀點。<br/>⑨ ：希望或恐懼 : 表示問卜者希望發生或害怕發生的事情 (正面的牌為希望發生，負面的牌為害怕發生)。<br/>⑩ ：結局 : 事情最終的結果。'
        },
        {
            type: 'relationship_spread',
            num: 10,
            name: 'relationship',
            info: '1. Distant past influences<br/>2. Rcent past influences<br/>3. Current state of the relationship<br/>4. Future influences<br/>5. External influences<br/>6. Beliefs<br/>7.Favorable energy<br/>8.What\'s working against<br/>9.Hopes and/or fears<br/>10. Outcome for the relationship<br/>'
        },
        {
            type: 'zodiac_twelve_spread',
            num: 12,
            name: 'zodiac12',
            info: '牌序	宮序	星宮	對應牌	位置意義<br/>1	第一宮	白羊	4. The Emperor	性格, 外表<br/>2	第二宮	金牛	5. Hierophant	財政, 物質<br/>3	第三宮	雙子	6. The Lovers	溝通, 學習<br/>4	第四宮	巨蟹	7. The Chariot	家庭, 生活的根基<br/>5	第五宮	獅子	8. Strength	娛樂, 愛情生活<br/>6	第六宮	處女	9. Hermit	工作, 健康生活<br/>7	第七宮	天坪	11. Justice	合作, 合伙事宜<br/>8	第八宮	天蠍	13. The Death	死亡, 遺囑, 意願<br/>9	第九宮	射手	14. Temperance	旅行, 運動, 信仰, 哲理<br/>10	第十宮	山羊	15. The Devil	前途, 理想<br/>11	第十一宮	水瓶	17. The Star	友情, 團體, 社會<br/>12	第十二宮	雙魚	18. The Moon	內在自我, 靈性, 秘密<br/>'
        },
        {
            type: 'zodiac_thirteen_spread',
            num: 13,
            name: 'zodiac13',
            info: '求問運勢<br/>1. 個人特性、行事的風格<br/>2. 金錢運<br/>3. 和兄弟姊妹的關係<br/>4. 家庭狀況/和母親的關係<br/>5. 戀愛運/和子女的關係<br/>6. 身體健康的狀況<br/>7. 人際關係/婚姻運<br/>8. 性生活狀況<br/>9. 學業運/海外旅行機運<br/>10. 工作運/和父親的關係<br/>11. 朋友的狀態<br/>12. 意外的事件<br/>13. 整體運勢的走向<br/>'
        },
        {
            type: 'other_spread',
            num: 0,
            name: 'other'
        }
    ]
    global.getSpreadInfo = function(type) {
        const text = info.find((i) => {
            return i.type === type
        })
        if (text && text.info) {
            return text.info
        } else {
            return ''
        }
    }
    // global.language.Voyager.tw.card = majorArcana.concat(minorArcana)
})(window)