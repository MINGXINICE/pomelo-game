module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;
var consts = require('../../../consts/consts');
var saver = require('../../../util/GameResultSaver');
var stringUtil = require('../../../util/StringUtils');
var go_ms = {};
var seeds = {};
/**
 * push message by user name function
 * @param channelService
 * @param route
 * @param param
 * @param tuid
 * @param tsid
 */
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
    var dt = JSON.parse(data.data);
    var msgId = dt.msgId;


    if (!channel) {
        cb();
        return;
    }
    var users = channel.getMembers();
    //get current userId from user's session. split by * because uid in session is concat with roomId
    var uid = session.uid;
    var userId = uid.split("*")[0];

    var content = JSON.parse(dt.content);

    /**
     * 两方都发送105后，广播一个205
     */

    if (msgId == consts.xzk.MsgId.request_enter) { // 105
        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.xzk.MsgId.response_go, // 205
                content: "{}"
            }
            channel.pushMessage("onmessage", param);
        }
    }

    /**
     * 收到106
     */

    if (msgId == consts.xzk.MsgId.request_line) { //106

        var param = {
            msgId: consts.xzk.MsgId.response_line, //206
            content: JSON.stringify(content)
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid)

    }

    /**
     * 游戏结束，显示输赢
     */
    if (msgId == consts.xzk.MsgId.request_lose) { // 114


        var param = {
            msgId: consts.xzk.MsgId.response_lose, // 214
            content: JSON.stringify({})
        }

        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid)

        param = {
            msgId: consts.xzk.MsgId.response_win, // 215
            content: JSON.stringify({})
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];

        push(channelService, "onmessage", param, tuid, tsid)

        saver.save(rid, tuid, uid);

        delete go_ms[rid];
        delete seeds[rid];
        channel.destroy();

    }

    /**
     * 处理加载进度事件
     */

    if (msgId == consts.xzk.MsgId.progress) { // 104

        if (content.progress == 100) {
            var seed = seeds[rid];
            if (!seed) {
                seed = stringUtil.randomSeed();
                seeds[rid] = seed;
            }
            var content = {
                seed: seed
            }

            var param = {
                route: 'onmessage',
                msgId: consts.xzk.MsgId.response_start, //201
                content: JSON.stringify(content)
            };

            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);
        }

        //     var roomPercent = percents[rid];
        //     if (roomPercent == undefined) {
        //         roomPercent = {};
        //         roomPercent[uid] = content.progress;
        //         percents[rid] = roomPercent;
        //     } else {
        //         roomPercent[uid] = content.progress;
        //         percents[rid] = roomPercent;
        //     }
        //     console.log(JSON.stringify(percents[rid]))
        //     if (users.length == 2) {
        //         var opUid = users[0] == uid ? users[1] : users[0];
        //         var opSid = channel.getMember(opUid)['sid'];
        //         console.log(" roomPercent[uid] =" + uid + " : " + roomPercent[uid] + ", roomPercent[opUid] =" + opUid + " : " + roomPercent[opUid]);
        //         if (roomPercent[uid] != undefined && roomPercent[uid] == 100 && roomPercent[opUid] != undefined && roomPercent[opUid] == 100) {
        //
        //             var content = {
        //                 seed: 123456789
        //             }
        //
        //             var param = {
        //                 route: 'onmessage',
        //                 msgId: consts.xzk.MsgId.response_start, //201
        //                 content: JSON.stringify(content)
        //             };
        //             // push(channelService, "onmessage", param, uid, sid);
        //             //
        //             // content.seed = 234123344;
        //             //
        //             // push(channelService, "onmessage", param, opUid, opSid);
        //
        //             channel.pushMessage("onmessage",param);
        //
        //             cb(data);
        //         } else {
        //             var cnt = {
        //                 progress: content.progress
        //             };
        //             var param = {
        //                 msgId: msgId,
        //                 content: JSON.stringify(cnt)
        //             }
        //
        //             var tuid = users[0] == uid ? users[1] : users[0];
        //             var tsid = channel.getMember(tuid)['sid'];
        //             push(channelService, "onmessage", param, tuid, tsid);
        //         }
        //     }


    }
    cb(null, data);
}