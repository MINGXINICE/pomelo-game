var chatRemote = require('../remote/chatRemote');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

var consts = require('../../../consts/consts');
var saver = require('../../../util/GameResultSaver');

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function (msg, session, next) {
    var rid = session.get('rid');
    var username = session.uid.split('*')[0];
    var channelService = this.app.get('channelService');
    var param = {
        msg: msg.content,
        from: username,
        target: msg.target
    };
    channel = channelService.getChannel(rid, false);

    //the target is all users
    if (msg.target == '*') {
        channel.pushMessage('onChat', param);
    }
    //the target is specific user
    else {
        var tuid = msg.target + '*' + rid;
        var tsid = channel.getMember(tuid)['sid'];
        channelService.pushMessageByUids('onChat', param, [{
            uid: tuid,
            sid: tsid
        }]);
    }
    next(null, {
        route: msg.route
    });
};

var records = {}
var percents = {}
var points = {}
var room_go_data = {}

var push = function (channelService, route, param, tuid, tsid) {
    channelService.pushMessageByUids(route, param, [{
        uid: tuid,
        sid: tsid
    }]);
}

handler.message = function (data, session, cb) {

    var channelService = this.app.get('channelService');
    var rid = session.get('rid');
    var channel = channelService.getChannel(rid, false);
    if (!channel) {
        cb(null, data);
        return;
    }
    var dt = JSON.parse(data.data);
    var msgId = dt.msgId;


    //get current userId from user's session. split by * because uid in session is concat with roomId
    var uid = session.uid;
    var userId = uid.split("*")[0];

    var content = JSON.parse(dt.content);
    content.userId = userId;

    console.info(" game handler message:" + JSON.stringify(content));

    var users = channel.getMembers();


    /**
     * 收到客户端给服务器发送一个探头的消息。供服务器获取老师探头发现消息。
     * */
    if (msgId == 2180) {
        var param = {
            msgId: 2180,
            content: JSON.stringify({})
        }
        channel.pushMessage("onmessage", param);
    }
    if (msgId == consts.double.msgId.request_enter) {
        //TODO 判断同房间两个人的101消息个数

        var record = records[rid];
        if (record == undefined) {
            console.log("in record == undefined *** , userId = " + userId)
            records[rid] = {count: 1}
        } else {
            console.log("request_enter  101 , records =" + JSON.stringify(records) + ", userId = " + userId)
            var param = {
                route: 'onmessage',
                msgId: consts.double.msgId.response_go,
                content: JSON.stringify({})
            };

            channel.pushMessage(param);
            console.log("push go message --------------")
        }
    }

    else if (msgId == consts.double.msgId.msgId_percent) {
        if (content.percent == 100) {
            var param = {
                route: 'onmessage',
                msgId: consts.double.msgId.response_jump,
                content: JSON.stringify({})
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);
        }
        //todo 判断两人进度。
        // var roomPercent = percents[rid];
        // if (roomPercent == undefined) {
        //     roomPercent = {};
        //     roomPercent[uid] = content.percent
        //
        //     percents[rid] = roomPercent;
        // } else {
        //     roomPercent[uid] = content.percent;
        //     percents[rid] = roomPercent;
        // }
        // if (users.length == 2) {
        //     var opUserId = users[0] == uid ? users[1] : users[0];
        //     if (roomPercent[uid] != undefined && roomPercent[uid] == 100 && roomPercent[opUserId] != undefined && roomPercent[opUserId] == 100) {
        //         var go_data = room_go_data[rid];
        //         if (go_data == undefined) {
        //             var param = {
        //                 route: 'onmessage',
        //                 msgId: consts.double.msgId.response_jump,
        //                 content: JSON.stringify({})
        //             };
        //             channel.pushMessage(param);
        //             cb(data);
        //             room_go_data[rid] = 1;
        //         }
        //
        //
        //     }
        // }
        //
        // var param = {
        //     route: 'onmessage',
        //     msgId: msgId,
        //     content: JSON.stringify(content)
        // };
        // channel.pushMessage(param);

    }
    else if (msgId == consts.double.msgId.response_Punish) {
        var param = {
            route: 'onmessage',
            msgId: msgId,
            content: JSON.stringify(content)
        };
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        channelService.pushMessageByUids('onmessage', param, [{
            uid: tuid,
            sid: tsid
        }]);
    }
    else if (msgId == consts.double.msgId.response_run) {
        var roomPoint = points[rid]
        if (roomPoint == undefined) {
            roomPoint = {uid: content.score}
            points[rid] = roomPoint;
        } else {
            roomPoint[uid] = content.score;
            points[rid] = roomPoint;
        }

        var param = {
            route: 'onmessage',
            msgId: msgId,
            content: JSON.stringify(content)
        };
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        channelService.pushMessageByUids('onmessage', param, [{
            uid: tuid,
            sid: tsid
        }]);
        //判断是否有人已经到达终点。
        if (content.score == 200) {
            var param = {
                route: "onmessage",
                msgId: consts.double.msgId.response_Win,
                content: JSON.stringify({"userId": userId})
            };
            saver.save(rid, userId);

            channel.pushMessage(param);
            channel.destroy();
        }

    } else if (msgId == consts.double.msgId.response_Throw) {
        var opUserId = users[0] == uid ? users[1] : users[0];
        var score = points[rid][opUserId];
        var score = score - 2;
        if (score < 0) {
            score = 0;
        }
        points[rid][opUserId] = score;
        content = {
            userId: userId,
            score: score
        }
        var param = {
            route: 'onmessage',
            msgId: msgId,
            content: JSON.stringify(content)
        };
        channel.pushMessage(param);
    }

    cb(null, data);
};