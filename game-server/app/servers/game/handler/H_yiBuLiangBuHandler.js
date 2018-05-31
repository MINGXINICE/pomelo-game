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
     *  收到206把步数传给对方实现步数同步
     */
    if (msgId == consts.yblb.MsgId.msgId_step) {
        var param = {
            msgId: consts.yblb.MsgId.msgId_step,
            content: JSON.stringify(content)
        };
        var opUid = users[0] == uid ? users[1] : users[0];
        var sid = channel.getMember(opUid)['sid'];
        push(channelService, "onmessage", param, opUid, sid);
    }


    /**
     * 收到204 返回204
     */
    if (msgId == consts.yblb.MsgId.msgId_readyGo) {
        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.yblb.MsgId.msgId_readyGo,
                content: "{}"
            }
            channel.pushMessage("onmessage", param);
        }
    }


    /**
     *  判断输赢
     */
    if (msgId == consts.yblb.MsgId.msgId_gameOver) { // 205

        var param = {
            msgId: consts.yblb.MsgId.msgId_gameOver,
            content: JSON.stringify({'win': 1})
        }
        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid);

        var opParam = {
            msgId: consts.yblb.MsgId.msgId_gameOver,
            content: JSON.stringify({'win': 2})
        }
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        push(channelService, "onmessage", opParam, opUid, opSid);
        saver.save(rid, uid, opUid);
        channel.destroy();
        delete go_ms[rid];
        delete seeds[rid];
        delete teamids[rid];

    }


    /**
     * 处理加载进度事件
     */
    if (msgId == consts.yblb.MsgId.msgId_progress) {


        if (content.percent == 100) {

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
                msgId: consts.yblb.MsgId.msgId_jump,
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);

        }

    }

    cb(null, data);

};