/*
    处理用户的send请求
 */
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


var seeds = {};
var go_ms = {};
var teamsId = {};
var heart_cnt = {};
var shoot_cnt = {};
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
     * 两方都发送204后，广播一个204
     */

    if (msgId == consts.bang.MsgId.msgId_readyGo) { // 204
        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var cnt = {
                opDelay: 0
            }
            var param = {
                msgId: consts.bang.MsgId.msgId_readyGo, // 204
                content: JSON.stringify(cnt)
            }
            channel.pushMessage("onmessage", param);
        }
    }

    /**
     * 收到206 射击
     */

    if (msgId == consts.bang.MsgId.msgId_shoot) { //206
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var sid = channel.getMember(uid)['sid'];
        var cnt = {
            sfShoot: true,
            roundJudge: true
        }
        var param = {
            msgId: consts.bang.MsgId.msgId_shoot, //206
            content: JSON.stringify(cnt)
        }
        var round = content.round;
        var shoot = shoot_cnt[rid];
        if (shoot == undefined) {

            /*创建数组记录命中回合*/
            shoot = [];
            shoot.push(round);
            shoot_cnt[rid] = shoot;

            /*更新生命值*/
            heart_cnt[rid][opUid] = heart_cnt[rid][opUid] - 1;
            push(channelService, "onmessage", param, uid, sid);
            cnt.sfShoot = false;
            cnt.roundJudge = false;
            param.content = JSON.stringify(cnt);
            push(channelService, "onmessage", param, opUid, opSid);
        } else {
            if (shoot_cnt[rid].indexOf(round) == -1) {
                /*记录命中回合*/
                shoot_cnt[rid].push(round);
                console.log(shoot_cnt[rid]);

                /*更新生命值*/
                heart_cnt[rid][opUid] = heart_cnt[rid][opUid] - 1;
                push(channelService, "onmessage", param, uid, sid);
                cnt.sfShoot = false;
                param.content = JSON.stringify(cnt);
                push(channelService, "onmessage", param, opUid, opSid);
            }
        }
    }

    /**
     * 收到207 丢失
     */

    if (msgId == consts.bang.MsgId.msgId_miss) { //207

        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var sid = channel.getMember(uid)['sid'];

        var cnt = {
            sfShoot: true,
            roundJudge: false
        }
        var param = {
            msgId: consts.bang.MsgId.msgId_miss, //207
            content: JSON.stringify(cnt)
        }
        push(channelService, "onmessage", param, uid, sid);
        cnt.sfShoot = false;
        param.content = JSON.stringify(cnt);
        push(channelService, "onmessage", param, opUid, opSid);
    }

    /**
     * 收到208 下一轮
     */

    if (msgId == consts.bang.MsgId.msgId_turn) { //208
        /*更新round*/
        heart_cnt[rid]['round'] = content.round + 1;

        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var sid = channel.getMember(uid)['sid'];

        /*判断生命值*/
        if (heart_cnt[rid][uid] == 0 || heart_cnt[rid][opUid] == 0) {
            var lose_uid, win_uid, lose_sid, win_sid;

            if (heart_cnt[rid][uid] == 0) {
                lose_uid = uid;
                lose_sid = sid;
                win_uid = opUid;
                win_sid = opSid
            } else if (heart_cnt[rid][opUid] == 0) {
                lose_uid = opUid;
                lose_sid = opSid;
                win_uid = uid;
                win_sid = sid;
            }

            var wincnt = {
                win: 1
            }
            var winner = {
                msgId: consts.bang.MsgId.msgId_gameOver, //206
                content: JSON.stringify(wincnt)
            }
            push(channelService, "onmessage", winner, win_uid, win_sid);
            wincnt.win = 2;
            winner.content = JSON.stringify(wincnt);
            push(channelService, "onmessage", winner, lose_uid, lose_sid);
            saver.save(rid, win_uid, lose_uid);

            delete go_ms[rid];
            delete teamsId[rid];
            delete heart_cnt[rid];
            delete shoot_cnt[rid];
            channel.destroy();

        } else { // 广播生命值
            var content = {
                round: heart_cnt[rid]['round'],
                sfScore: heart_cnt[rid][uid],
                opScore: heart_cnt[rid][opUid]
            }
            var param = {
                msgId: consts.bang.MsgId.msgId_turn, //208
                content: JSON.stringify(content)
            }
            push(channelService, "onmessage", param, uid, sid);
        }
    }

    /**
     * 处理加载进度事件
     */

    if (msgId == consts.bang.MsgId.msgId_progress) { // 200

        var teams = teamsId[rid];
        var hearts = heart_cnt[rid];
        if (!teams) {
            teams = {};
            teams[uid] = 1;
            teamsId[rid] = teams;
            /*生命值初始化*/
            hearts = {};
            hearts[uid] = 5;
            hearts['round'] = 0;
            heart_cnt[rid] = hearts;
            console.log(hearts);
        } else {
            if (!teams[uid]) {
                teams[uid] = 2;
                teamsId[rid] = teams;
                hearts[uid] = 5;
                heart_cnt[rid] = hearts;
            }
        }

        if (content.percent == 100) {
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
                msgId: consts.bang.MsgId.msgId_jump, //201
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);
        }

    }
    cb(null, data);
}