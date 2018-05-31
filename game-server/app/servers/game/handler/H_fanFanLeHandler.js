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

var teamsId = {};
var delay_cnt = {};
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
    var content = JSON.parse(dt.content);

    /**
     * 两方都发送203后，广播一个203
     */

    if (msgId == consts.ffl.MsgId.msgId_delay) { // 203
        var delay = delay_cnt[rid];
        if (delay == undefined) {
            delay = {count: 1};
            delay_cnt[rid] = delay;
        } else {
            var param = {
                msgId: consts.ffl.MsgId.msgId_delay, // 203
                content: JSON.stringify({})
            }
            channel.pushMessage("onmessage", param);
        }
    }

    /**
     * 收到204后，给对方一个204
     */

    if (msgId == consts.ffl.MsgId.msgId_readyGo) { // 204
        var opUid = uid == users[0] ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var param = {
            msgId: consts.ffl.MsgId.msgId_readyGo, // 204
            content: JSON.stringify(content)
        }
        push(channelService, "onmessage", param, opUid, opSid);
    }

    /**
     * 收到205后，给对方一个205
     */

    if (msgId == consts.ffl.MsgId.msgId_pair) { // 205
        var opUid = uid == users[0] ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var param = {
            msgId: consts.ffl.MsgId.msgId_pair, // 205
            content: JSON.stringify(content)
        }
        push(channelService, "onmessage", param, opUid, opSid);
    }

    /**
     * 输赢判断 206
     */

    if (msgId == consts.ffl.MsgId.msgId_result) {
        var sid = channel.getMember(uid)['sid'];
        var opUid = uid == users[0] ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var cnt = {
            win: true,
            totalTime: content.totalTime
        }
        var param = {
            msgId: consts.ffl.MsgId.msgId_result, // 205
            content: JSON.stringify(cnt)
        }
        push(channelService, "onmessage", param, uid, sid);
        cnt.win = false;
        param.content = JSON.stringify(cnt);
        push(channelService, "onmessage", param, opUid, opSid);
        saver.save(rid, uid, opUid);
        delete teamsId[rid];
        delete delay_cnt[rid];
        delete seeds[rid];
        channel.destroy();
    }

    /**
     * 处理加载进度事件
     */

    if (msgId == consts.ffl.MsgId.msgId_progress) { // 201
        var teams = teamsId[rid];
        if (!teams) {
            teams = {};
            teams[uid] = 1;
            teamsId[rid] = teams;
        } else {
            if (!teams[uid]) {
                teams[uid] = 2;
                teamsId[rid] = teams;
            }
        }

        if (content.progress == 100) {
            var sfTeamId = teamsId[rid][uid];
            var opTeamId = sfTeamId == 1 ? 2 : 1;
            var seed = seeds[rid];
            if (!seed) {
                seed = stringUtil.randomSeed();
                seeds[rid] = seed;
            }

            var content = {
                seed: seed,
                sfTeamId: sfTeamId,
                opTeamId: opTeamId
            }
            var param = {
                route: 'onmessage',
                msgId: consts.ffl.MsgId.msgId_jump, //201
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);
        }


    }
    cb(null, data);
}