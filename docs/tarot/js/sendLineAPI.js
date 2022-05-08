(function (global) {


    function lineApi(url) {
        this.ws = {}

        var wsurl;
        url = 'wss://ken-line-bot.herokuapp.com/'
        if (url)
            wsurl = url;
        else
            wsurl = "wss://" + location.hostname + ":" + location.port + "/";

        console.log(wsurl);
        this.ws = new WebSocket(wsurl, 'echo-protocol');
        this.ws.onopen = function () {
            console.log("WS connected.");
            // setTimeout(function () {
            //     this.sendMsg('Welcome to Hi Tarot');
            // }.bind(this), 5000);

        }.bind(this);
        this.ws.onclose = function () {
            console.log("WS disconnected.");

        }.bind(this);

        this.ws.onmessage = function (event) {
            console.log("WS onmessage.", event);
        }.bind(this);

    }

    lineApi.prototype.sendMsg = function(req) {
        if (!req) {
            req = 'Welcome to Hi Tarot';
        }
        // console.log(JSON.stringify({'method':'string','content':req}));
        this.ws.send(JSON.stringify({
            'method': 'string',
            'content': req
        }));
    }

    lineApi.prototype.sendMsgAll = function(req) {
        // alert('send');
        if (!req) {
            req = 'send test Msg';
        }
        this.ws.send(JSON.stringify({
            'method': 'broadcastMsg',
            'content': req
        }));
    }

    global.lineApi = lineApi
})(window)