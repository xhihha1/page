(function (global) {
    if(global.modelSetting) {
        return true
    }
    global.modelSetting = {
        RiderWaite: {
            reversed: true
        },
        Voyager: {
            reversed: false
        }
    }
    console.log(global.modelSetting)
})(window)