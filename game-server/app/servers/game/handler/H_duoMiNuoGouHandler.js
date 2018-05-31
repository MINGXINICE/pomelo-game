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
var roundDatas = {};
var win_flag = {};
var teamids = {};
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


/**
 * 处理倒计时逻辑
 *
 */
var times = {};

var trigger = {
    period: 1000
}

var getCurrentSecond = function () {
    return new Date().getTime() / 1000;
}
var timeFunc = function () {
    // console.log("timeFunc execute !");
    for (var rid in times) {
        if (typeof(times[rid]) == "function") {
            continue;
        }
        var time = times[rid];
        var currentSecond = getCurrentSecond();
        var latest = time.latest;
        if (currentSecond - latest >= 20) {
            setTimeoutCheck(rid, time.channelService, time.opUid, time.opSid, time.uid, time.sid);

            //如果这个时间已经超时，对手回合。
            var cnt = {
                round: false
            }
            var param = {
                msgId: consts.dmng.MsgId.msgId_myRoundOver,
                content: JSON.stringify(cnt)
            }

            push(time.channelService, "onmessage", param, time.uid, time.sid);

            cnt.round = true;
            param.content = JSON.stringify(cnt);
            push(time.channelService, "onmessage", param, time.opUid, time.opSid);

        }
    }
};

schedule.scheduleJob(trigger, timeFunc, {})


var setTimeoutCheck = function (rid, channelService, uid, sid, opUid, opSid) {
    times[rid] = {
        channelService: channelService,
        uid: uid,
        sid: sid,
        opUid: opUid,
        opSid: opSid,
        latest: getCurrentSecond()
    }
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
     * 两方都发送204后，广播一个204
     */

    if (msgId == consts.dmng.MsgId.msgId_readyGo) { // 204
        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.dmng.MsgId.msgId_readyGo, // 204
                content: "{}"
            }
            channel.pushMessage("onmessage", param);
        }
    }

    /**
     * 收到207
     */

    if (msgId == consts.dmng.MsgId.msgId_Hit) { //207

        var param = {
            msgId: msgId,
            content: JSON.stringify(content)
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);


        roundDatas[rid] = {
            uid: uid,
            sid: channel.getMember(uid)['sid'],
            tuid: tuid,
            tsid: tsid
        }
    }

    /**
     * 收到208
     */

    if (msgId == consts.dmng.MsgId.msgId_myRoundOver) {


        var roundData = roundDatas[rid];

        var incnt = {
            round: false
        }
        var cnt = {
            msgId: consts.dmng.MsgId.msgId_myRoundOver,
            content: JSON.stringify(incnt)
        }
        if (roundData.uid == uid) {
            push(channelService, "onmessage", cnt, uid, roundData.sid)
        } else {
            incnt.round = true;
            cnt.content = JSON.stringify(incnt);

            push(channelService, "onmessage", cnt, roundData.tuid, roundData.tsid);
            setTimeoutCheck(rid, channelService, roundData.tuid, roundData.tsid, roundData.uid, roundData.sid);
        }

    }

    /**
     * 游戏结束，显示输赢
     */
    if (msgId == consts.dmng.MsgId.msgId_gameOver) { // 205
        var cnt = {
            win: content.win
        }
        var param = {
            msgId: msgId,
            content: JSON.stringify(cnt)
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        var sid = channel.getMember(uid)['sid'];

        push(channelService, "onmessage", param, uid, sid)
        cnt.win = content.win == 0 ? 1 : 0;
        param.content = JSON.stringify(cnt);
        push(channelService, "onmessage", param, tuid, tsid)
        saver.save(rid, content.win == 1 ? uid : tuid);
        delete go_ms[rid];
        delete win_flag[rid];
        delete roundDatas[rid];
        delete times[rid];
        delete seeds[rid];
        channel.destroy();
    }

    /**
     * 处理加载进度事件
     */

    if (msgId == consts.dmng.MsgId.msgId_percent) {

        if (content.percent == 100) {

            var team = teamids[rid];
            if (!team) {
                team = {};
                team[uid] = 1;
                teamids[rid] = team;

            } else {
                if (!team[uid]) {
                    team[uid] = 2;
                    teamids[rid] = team;
                }
            }
            var sid = channel.getMember(uid)['sid'];
            var round = team[uid] == 1;

            var seed = seeds[rid];
            if (!seed) {
                seed = stringUtil.randomSeed();
                seeds[rid] = seed;
            }
            var content = {
                seed: seed,
                teamId: team[uid],
                round: round
            }
            var param = {
                route: 'onmessage',
                msgId: consts.dmng.MsgId.msgId_jump,
                content: JSON.stringify(content)
            }
            push(channelService, "onmessage", param, uid, sid);
            if (users.length == 2) {

                var opUid = users[0] == uid ? users[1] : users[0];
                var opSid = channel.getMember(opUid)['sid'];
                if (round) {
                    setTimeoutCheck(rid, channelService, uid, sid, opUid, opSid);
                } else {
                    setTimeoutCheck(rid, channelService, opUid, opSid, uid, sid);
                }

            }
        }

    }
    cb(null, data);
};