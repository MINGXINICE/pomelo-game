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
var numData = {};
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
     *  收到206说明发消息的人+1分，给对方-1分,并且分别把双方的分数发出去
     */
    if (msgId == consts.dtxt.MsgId.msgId_speed) {

        var opUid = users[0] == uid ? users[1] : users[0];
        var sid = channel.getMember(uid)['sid'];
        var opSid = channel.getMember(opUid)['sid'];


        numData[rid][uid].num++;
        if (numData[rid][uid].num == 36) {
            numData[rid][uid].score++;
            // if (numData[rid][uid].score == 2) {
            //     var score1 = {
            //         msgId: consts.dtxt.MsgId.msgId_gameOver,
            //         content: JSON.stringify({win: -1})
            //     }
            //     push(channelService, "onmessage", score1, opUid, opSid);
            //
            //     var score2 = {
            //         msgId: consts.dtxt.MsgId.msgId_gameOver,
            //         content: JSON.stringify({win: 1})
            //     }
            //     push(channelService, "onmessage", score2, uid, sid);
            //     return;
            // }
            numData[rid][uid].num = 0;
            numData[rid][opUid].num = 0;
            var text1 = {
                msgId: consts.dtxt.MsgId.msgId_again,
                content: JSON.stringify({win: -1})
            }
            push(channelService, "onmessage", text1, opUid, opSid);

            var text2 = {
                msgId: consts.dtxt.MsgId.msgId_again,
                content: JSON.stringify({win: 1})
            }
            push(channelService, "onmessage", text2, uid, sid);

            if (numData[rid][uid].score == 2) {
                var score1 = {
                    msgId: consts.dtxt.MsgId.msgId_gameOver,
                    content: JSON.stringify({win: -1})
                }
                push(channelService, "onmessage", score1, opUid, opSid);

                var score2 = {
                    msgId: consts.dtxt.MsgId.msgId_gameOver,
                    content: JSON.stringify({win: 1})
                }
                push(channelService, "onmessage", score2, uid, sid);
                saver.save(rid, uid, opUid);
                channel.destroy();
                delete go_ms[rid];
                delete teamids[rid];
                delete numData[rid];
                delete seeds[rid];
                return;
            }
        }

        numData[rid][opUid].num--;
        var param = {
            msgId: consts.dtxt.MsgId.msgId_speed,
            content: JSON.stringify({'gap': numData[rid][uid].num})
        };
        push(channelService, "onmessage", param, uid, sid);


        var opParam = {
            msgId: consts.dtxt.MsgId.msgId_speed,
            content: JSON.stringify({'gap': numData[rid][opUid].num})
        };

        push(channelService, "onmessage", opParam, opUid, opSid);


    }


    /**
     * 收到204
     */
    if (msgId == consts.dtxt.MsgId.msgId_readyGo) {

        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.dtxt.MsgId.msgId_readyGo,
                content: JSON.stringify({'opDelay': 0})
            }
            channel.pushMessage("onmessage", param);
        }
    }


    /**
     * 处理加载进度事件
     */
    if (msgId == consts.dtxt.MsgId.msgId_progress) {


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


            var rData =
                numData[rid];
            if (!rData) {
                rData = {};
                var uData = rData[uid];
                if (!uData) {
                    rData[uid] = {
                        num: 0,
                        score: 0
                    }
                    numData[rid] = rData;

                }

            } else {
                var uData = rData[uid];
                if (!uData) {
                    rData[uid] = {
                        num: 0,
                        score: 0
                    }
                    numData[rid] = rData;

                }
            }

            console.log("numDatanumData" + JSON.stringify(numData));
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
                msgId: consts.dtxt.MsgId.msgId_jump,
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);

        }

    }


    cb(null, data);

};