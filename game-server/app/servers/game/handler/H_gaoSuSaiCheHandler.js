module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;
var consts = require('../../../consts/consts');
var saver = require('../../../util/GameResultSaver');

var go_ms = {};
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


    if (!channel) {
        cb();
        return;
    }
    var users = channel.getMembers();
    //get current userId from user's session. split by * because uid in session is concat with roomId
    var uid = session.uid;
    var userId = uid.split("*")[0];

    var content = JSON.parse(dt.content);


    /**205消息，一方赢了*/

    if (msgId == consts.gssc.MsgId.msgId_gameOver) {
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var sid = channel.getMember(uid)['sid'];
        var param = {
            msgId: msgId,
            content: JSON.stringify({win: 1})
        }
        push(channelService, "onmessage", param, uid, sid);
        param.content = JSON.stringify({win: 2});

        push(channelService, "onmessage", param, opUid, opSid);
        channel.destroy();
        delete go_ms[rid];
        saver.save(rid, uid, opUid);
    }

    /**106 107 直接发给对手*/

    if (msgId == consts.gssc.MsgId.msgId_direction || msgId == consts.gssc.MsgId.msgId_boom) {
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];


        var param = {
            msgId: msgId,
            content: JSON.stringify(content)
        }
        push(channelService, "onmessage", param, tuid, tsid);

    }
    /**
     * 两方都发送204后，广播一个204
     */

    if (msgId == consts.gssc.MsgId.msgId_readyGo) { // 204
        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.gssc.MsgId.msgId_readyGo, // 204
                content: "{}"
            }
            channel.pushMessage("onmessage", param);
        }
    }


    /**
     * 处理加载进度事件
     */

    if (msgId == consts.gssc.MsgId.msgId_progress) { // 104

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
            var content = {
                seed: 123456789,
                sfTeamId: teamid,
                opTeamId: op_teamid
            }
            var param = {
                route: 'onmessage',
                msgId: consts.gssc.MsgId.msgId_jump,
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);
        }


    }
    cb(null, data);
}