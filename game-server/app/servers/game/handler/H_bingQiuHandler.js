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
var percents = {};
var go_ms = {}
var play_datas = {};

//

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

    // 收到206 返回给对方206 转盘同步
    if (msgId == consts.bingqiu.MsgId.msgId_move) {
        var param = {
            msgId: consts.bingqiu.MsgId.msgId_move,
            content: JSON.stringify(content)
        };
        var uid = users[0] == uid ? users[1] : users[0];
        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid);
    }


    // 收到207 返回 207 {"msgId":210,"content":"[]"}"
    if (msgId == consts.bingqiu.MsgId.msgId_strike) {
        var param = {
            msgId: consts.bingqiu.MsgId.msgId_strike,
            content: JSON.stringify(content)
        };
        var uid = users[0] == uid ? users[1] : users[0];
        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid);
    }


    /**收到 209 消息说明发消息的人，输了一个球。给对方加上分数，发送 211 给双方队员。需要拼上teamid*/
    if (msgId == consts.bingqiu.MsgId.msgId_goal) {

        var uid = users[0] == uid ? users[0] : users[1];
        var opUid = users[0] == uid ? users[1] : users[0];
        var sid = channel.getMember(uid)['sid'];
        var opSid = channel.getMember(opUid)['sid'];

        var play_data = play_datas[rid];
        play_data[opUid].score = play_data[opUid].score + 1;

        if (play_data[opUid].score == 3) {

            var text1 = {
                msgId: consts.bingqiu.MsgId.msgId_gameOver,
                content: JSON.stringify({win: 1})
            }
            push(channelService, "onmessage", text1, opUid, opSid);

            var text2 = {
                msgId: consts.bingqiu.MsgId.msgId_gameOver,
                content: JSON.stringify({win: 0})
            }
            push(channelService, "onmessage", text2, uid, sid);
            delete percents[rid];
            delete go_ms[rid];
            delete play_datas[rid];
            saver.save(rid, opUid, uid);
        }

        play_datas[rid] = play_data;

        var content = {
            team: play_data[uid].team,
            sfScore: play_data[opUid].score,
            opScore: play_data[uid].score
        };
        var param = {
            msgId: consts.bingqiu.MsgId.msgId_round,
            content: JSON.stringify(content)
        };
        push(channelService, "onmessage", param, opUid, opSid);


        content = {
            team: play_data[uid].team,
            sfScore: play_data[uid].score,
            opScore: play_data[opUid].score
        };
        param = {
            msgId: consts.bingqiu.MsgId.msgId_round,
            content: JSON.stringify(content)

        };
        push(channelService, "onmessage", param, uid, sid);

    }


    /**
     * 收到204
     */

    if (msgId == consts.bingqiu.MsgId.msgId_readyGo) {

        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: consts.bingqiu.MsgId.msgId_readyGo,
                content: "{}"
            }
            channel.pushMessage("onmessage", param);

            var data = {}
            data[uid] = {
                score: 0,
                team: 1
            };

            var opUid = users[0] == uid ? users[1] : users[0];
            data[opUid] = {
                score: 0,
                team: 2
            };
            play_datas[rid] = data;


            var con1 = {
                team: 1,
                sfScore: 0,
                opScore: 0
            }
            var param1 = {
                msgId: consts.bingqiu.MsgId.msgId_round,
                content: JSON.stringify(con1)
            }
            var sid = channel.getMember(uid)['sid'];

            push(channelService, "onmessage", param1, uid, sid);


            var con2 = {
                team: 1,
                sfScore: 0,
                opScore: 0
            }
            var param2 = {
                msgId: consts.bingqiu.MsgId.msgId_round,
                content: JSON.stringify(con2)
            }
            var opSid = channel.getMember(opUid)['sid'];


            push(channelService, "onmessage", param2, opUid, opSid);


        }
    }

    /**
     * 游戏结束，显示输赢
     */
    if (msgId == consts.bingqiu.MsgId.msgId_gameOver) {

        var content = {
            win: -1
        }
        var param = {
            msgId: msgId,
            content: JSON.stringify(content)
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];


        push(channelService, "onmessage", param, tuid, tsid);

        // var winner = users[0] == uid ? 0 : 1;
        var cnt = {
            win: 1
        }
        param = {
            msgId: msgId,
            content: JSON.stringify(cnt)
        }

        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid);

        saver.save(rid, wuid, tuid);

        channel.destroy();

    }


    /**
     * 处理加载进度事件
     */
    if (msgId == consts.bingqiu.MsgId.msgid_loading) {

        var roomPercent = percents[rid];
        if (roomPercent == undefined) {
            roomPercent = {};
            roomPercent[uid] = content.percent;
            percents[rid] = roomPercent;
        } else {
            roomPercent[uid] = content.percent;
            percents[rid] = roomPercent;
        }
        //给自己发消息说明进度。
        var cnt = {
            percent: content.percent
        };
        var param = {
            msgId: msgId,
            content: JSON.stringify(cnt)
        }
        var uid = uid;
        var sid = channel.getMember(uid)['sid'];

        if (users.length == 2) {
            var opUid = users[0] == uid ? users[1] : users[0];
            var opSid = channel.getMember(opUid)['sid'];
            console.log(" roomPercent[uid] =" + uid + " : " + roomPercent[uid] + ", roomPercent[opUid] =" + opUid + " : " + roomPercent[opUid]);
            if (roomPercent[uid] != undefined && roomPercent[uid] == 100 && roomPercent[opUid] != undefined && roomPercent[opUid] == 100) {
                var seed = seeds[rid];
                if (!seed) {
                    seed = stringUtil.randomSeed();
                    seeds[rid] = seed;
                }
                var content = {
                    seed: seed,
                    sfTeamId: 1,
                    opTeamId: 2
                }

                var param = {
                    route: 'onmessage',
                    msgId: consts.bingqiu.MsgId.msgId_jump,
                    content: JSON.stringify(content)
                };

                push(channelService, "onmessage", param, uid, sid);


                var opcContent = {
                    seed: 123456789,
                    sfTeamId: 2,
                    opTeamId: 1
                }

                var opParam = {
                    route: 'onmessage',
                    msgId: consts.bingqiu.MsgId.msgId_jump,
                    content: JSON.stringify(opcContent)
                };

                push(channelService, "onmessage", opParam, opUid, opSid);

                cb(data);
            } else {

                var cnt = {
                    percent: content.percent
                };
                var param = {
                    msgId: msgId,
                    content: JSON.stringify(cnt)
                }
                push(channelService, "onmessage", param, opUid, opSid);
            }
        }
    }


    cb(null, data);
}