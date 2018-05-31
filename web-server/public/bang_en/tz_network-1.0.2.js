require('boot');
//全局变量gn
var global_isConnect = false;
var global_debug = false;
var is_connected = false;
var pomelo = window.pomelo;
var NetWork = function () {

};


function getValueByKey(key, defaultValue) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var strArray = window.location.href.split("?");
    var str = strArray[strArray.length - 1];
    var r = str.match(reg);
    if (r != null) return unescape(decodeURIComponent(r[2]));
    return defaultValue;
}

function init(self) {
    var username = getValueByKey("uid", "100009");
    var roomId = getValueByKey("rid", "000");
    var gameId = getValueByKey("gid", "000");
    var iconUrl = getValueByKey("iconUrl", "");
    var nickname = getValueByKey("nickname", "");
    var host = getValueByKey("host", "127.0.0.1");
    var port = getValueByKey("port", "3050");
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function () {
        is_connected = true;
        var route = "connector.C_bangHandler.join";
        pomelo.request(route, {
            username: username,
            rid: roomId,
            gid: gameId,
            iconUrl: iconUrl,
            nickname: nickname
        }, function (data) {
            console.log("connector.C_bangHandler.join success " + data.users)
            if (data.error) {
                return;
            }
        });
    });
    pomelo.on("onopen", function (data) {
        console.log("Send Text WS was opened ");
        is_connected = true;
        global_isConnect = true;
        cc.eventManager.dispatchCustomEvent(MsgId.msgId_connect);
    });

    pomelo.on("onclose", function (data) {
        if (!global_debug && !GM_INFO.isEnd) {
            cc.eventManager.dispatchCustomEvent(MsgId.msgId_webSocketClosed);
        }
    });

    pomelo.on("onLeave", function (data) {
        console.log("pomelo.onleave data: " + JSON.stringify(data));
    })
    pomelo.on("error", function (event) {
    });

    pomelo.on("onmessage", function (evt) {
        var json = JSON.stringify(evt);
        console.log("pomelo.on.message json:" + json);
        self.receiveMessage(json);
    });
};

NetWork.prototype = { // 定义Person的prototype域


    //开启连接
    openConnect: function () {
        var self = this;
        init(self);
    },

    //关闭连接
    closeConnect: function () {
        console.warn("close pomelo connection");
        pomelo.disconnect();
    },


    //发送消息
    sendMessage: function (data) {
        if (!!data.content.percent && data.content.percent != 100) {
            return;
        }
        if (is_connected) {
            console.log("sendMessage" + JSON.stringify(data))
            var content = JSON.stringify(data.content);
            data.content = content;
            var jsonStr = JSON.stringify(data);

            var route = "game.H_bangHandler.message";
            pomelo.request(route, {
                data: jsonStr
            }, function (data) {

            });
        } else {
            console.log("is_connected false ! !  skip message :" + JSON.stringify(data));
        }

    }
};

