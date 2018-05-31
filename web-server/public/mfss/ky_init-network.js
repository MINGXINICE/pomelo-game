require('boot');

// query connector
function queryEntry(uid, callback) {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: "127.0.0.1",
        port: 3014,
        log: true
    }, function () {
        pomelo.request(route, {
            uid: uid
        }, function (data) {
            // pomelo.disconnect();
            if (data.code === 500) {
                showError(LOGIN_ERROR);
                return;
            }
            callback(data.host, data.port);
        });
    });
};

function getValueByKey(key, defaultValue) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var strArray = window.location.href.split("?");
    var str = strArray[strArray.length - 1];
    var r = str.match(reg);
    if (r != null) return unescape(decodeURIComponent(r[2]));
    return defaultValue;
}

function init() {
    var username = getValueByKey("uid", "100009");
    var roomId = getValueByKey("rid", "000");
    var gameId = getValueByKey("gid", "000");
    var iconUrl = getValueByKey("iconUrl","");
    var nickname = getValueByKey("nickname","");
    queryEntry(username, function (host, port) {
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function () {
            var route = "connector.C_moFaShouShiHandler.join";
            pomelo.request(route, {
                username: username,
                rid: roomId,
                gid: gameId,
                iconUrl:iconUrl,
                nickname:nickname
            }, function (data) {
                console.log("connector.C_moFaShouShiHandler.join" + data.users)
                if (data.error) {
                    return;
                }
            });
        });
    });
}

init();