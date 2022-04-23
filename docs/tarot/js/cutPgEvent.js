
(function(global){
    function cutPgEvent(){
        // $('#flipOne').click(function(){})
        $('#finishCut').click(function(){
            $('.page').hide()
            $('#shufflePg').show()
        })
        $('#cutCardAgain').click(function(){
            // $('.page').hide()
            // $('#cutPg').show()
        })
    }
global.cutPgEvent = cutPgEvent
})(window)