module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;
var schedule = require('pomelo-scheduler');
var consts = require('../../../consts/consts');
var saver = require('../../../util/GameResultSaver');
var stringUtil = require('../../../util/StringUtils');

var go_ms = {};
var seeds = {};
var teamids = {};

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

    //
    // console.log("channel-- :" + channel);
    //
    // console.log("channelService.channels[] :" + channelService.channels[0]);
    //
    // console.log("rid:" + rid + "channelService.channels[rid]-- :" + channelService.channels[rid]);

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
     * 收到204，再广播回去一个204
     */

    if (msgId == consts.ttq.MsgId.msgId_readyGo) {
        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.ttq.MsgId.msgId_readyGo,
                content: "{}"
            }
            channel.pushMessage("onmessage", param);
        }

    }

    /**
     * 收到206，207，208，原封不动给对方
     */

    if (msgId == consts.ttq.MsgId.msgId_press || msgId == consts.ttq.MsgId.msgId_catapult || msgId == consts.ttq.MsgId.msgId_reset) {

        var param = {
            msgId: msgId,
            content: JSON.stringify(content)
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid)

    }

    /**
     * 游戏结束，显示输赢
     */
    if (msgId == consts.ttq.MsgId.msgId_gameOver) {
        var cnt = {
            win: 1
        }

        var param = {
            msgId: msgId,
            content: JSON.stringify(cnt)
        }

        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid)


        // var winner = users[0] == uid ? 0 : 1;

        cnt.win = 0;
        var winmsg = {
            msgId: msgId,
            content: JSON.stringify(cnt)
        }

        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];

        push(channelService, "onmessage", winmsg, tuid, tsid);

        saver.save(rid, uid, tuid);
        channel.destroy();
        delete go_ms[rid];
        delete teamids[rid];
        delete seeds[rid];
    }

    /**
     * 处理加载进度事件
     */

    if (msgId == consts.ttq.MsgId.msgid_loading) {

        // var roomPercent = percents[rid];
        // if (roomPercent == undefined) {
        //     roomPercent = {};
        //     roomPercent[uid] = content.percent;
        //     percents[rid] = roomPercent;
        // } else {
        //     roomPercent[uid] = content.percent;
        //     percents[rid] = roomPercent;
        // }
        // console.log("rid = " + rid + " , " + JSON.stringify(percents[rid]));

        var teams = teamids[rid];

        if (teams == undefined) {
            teams = {};
            teams[uid] = 1;
            teamids[rid] = teams;
        } else {
            if (!teams[uid]) {
                teams[uid] = 2;
                teamids[rid] = teams;
            }

        }
        if (content.percent == 100) {
            var teamid = teams[uid];
            var op_teamid = teams[uid] == 1 ? 2 : 1;

            var seed = seeds[rid];
            if (!seed) {
                seed = stringUtil.randomSeed();
                seeds[rid] = seed;
            }
            var content = {
                seed: seed,
                sfTeamId: teamid,
                opTeamId: op_teamid
            }
            var param = {
                route: 'onmessage',
                msgId: consts.ttq.MsgId.msgId_jump,
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);
        }


        //给自己发消息说明进度。
        // var cnt = {
        //     percent: content.percent
        // };
        // var param = {
        //     msgId: msgId,
        //     content: JSON.stringify(cnt)
        // }
        // var uid = uid;
        // var sid = channel.getMember(uid)['sid'];
        // push(channelService, "onmessage", param, uid, sid);
        // channelService.pushMessageByUids("onmessage", param, [{
        //     uid: tuid,
        //     sid: tsid
        // }]);

        // console.log("users.length =" + users.length)
        // if (users.length == 2) {
        //     var opUid = users[0] == uid ? users[1] : users[0];
        //     var opSid = channel.getMember(opUid)['sid'];
        //     console.log(" roomPercent[uid] =" + uid + " : " + roomPercent[uid] + ", roomPercent[opUid] =" + opUid + " : " + roomPercent[opUid]);
        //     if (roomPercent[uid] != undefined && roomPercent[uid] == 100 && roomPercent[opUid] != undefined && roomPercent[opUid] == 100) {
        //
        //         var content = {
        //             seed: 123456789,
        //             sfTeamId: 2,
        //             opTeamId: 1
        //         }
        //         var param = {
        //             route: 'onmessage',
        //             msgId: consts.ttq.MsgId.msgId_jump,
        //             content: JSON.stringify(content)
        //         };
        //         push(channelService, "onmessage", param, uid, sid);
        //
        //         content.sfTeamId = 1;
        //         content.opTeamId = 2;
        //         param.content = JSON.stringify(content);
        //
        //
        //         push(channelService, "onmessage", param, opUid, opSid);
        //
        //
        //         cb(data);
        //     } else {
        //         // 当房间里有两个人时，给另外一个人发送自己的加载进度。
        //         if (users.length == 2) {
        //
        //             var cnt = {
        //                 percent: content.percent,
        //                 belong: false
        //             };
        //             var param = {
        //                 msgId: msgId,
        //                 content: JSON.stringify(cnt)
        //             }
        //
        //             var tuid = users[0] == uid ? users[1] : users[0];
        //             var tsid = channel.getMember(tuid)['sid'];
        //             push(channelService, "onmessage", param, tuid, tsid);
        //
        //         }
        //     }
        // }
    }
    cb(null, data);
};

