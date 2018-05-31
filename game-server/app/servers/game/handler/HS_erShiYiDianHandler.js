module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;
var saver = require('../../../util/GameResultSaver');

var go_ms = {};
var round_ms = {};
var cards = {};
var cards_user = {};
var results = {};
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


function initCard() {
    var card = new Array(52);
    for (var i = 0; i < card.length; i++) {
        card[i] = i + 1;
    }
    return card;
}

function getRandomCard(card, rid) {
    var index = parseInt(Math.random() * card.length, 10);
    var c = card[index];
    card.splice(index, 1);
    console.log("gerRandomCard , index= " + index + " c =" + c);
    return c;
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

    /**后停牌的人，发送回合结束，并开始新的回合,如果整体结束，给用户发送输赢消息*/

    if (msgId == 107) {
        var winUid = content.winUid;

        var sid = channel.getMember(uid)['sid'];
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        //记录当前房间回合结果。
        var result = results[rid];
        if (!result) {
            result = []
        }
        result.push(winUid + "*" + rid);
        results[rid] = result;

        if (result.length == 3) {

            var loseUid = users[0] == winUid ? users[1] : users[0];
            var param = {
                msgId: 207,
                content: {
                    win: winUid,
                    lose: loseUid
                }
            }
            channel.pushMessage("onmessage", param);

            var uidCount = 0;
            var opUidCount = 0;
            for (var i = 0; i < result.length; i++) {
                if (result[i] == uid) {
                    uidCount++;
                } else {
                    opUidCount++;
                }
            }
            if (uidCount > opUidCount) {
                var param = {
                    msgId: 210,
                    content: {win: 1}
                };
                push(channelService, "onmessage", param, uid, sid);
                param.content.win = 0;
                push(channelService, "onmessage", param, opUid, opSid);
            } else if (uidCount < opUidCount) {
                var param = {
                    msgId: 210,
                    content: {win: 0}
                };
                push(channelService, "onmessage", param, uid, sid);
                param.content.win = 1;
                push(channelService, "onmessage", param, opUid, opSid);

            } else {
                var param = {
                    msgId: 210,
                    content: {win: 1024}
                };
                channel.pushMessage(param, "onmessage");
            }

        } else {
            var loseUid = users[0] == winUid ? users[1] : users[0];
            var param = {
                msgId: 207,
                content: {
                    win: winUid,
                    lose: loseUid
                }
            }
            channel.pushMessage("onmessage", param);
        }

    }
    /**收到 105 停牌消息，告诉对手，当前用户停牌*/

    if (msgId == 105) {
        var sid = channel.getMember(uid)['sid'];
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var param = {
            msgId: 205,
            content: {
                belong: true
            }
        }
        push(channelService, "onmessage", param, uid, sid);

        param = {
            msgId: 205,
            content: {
                belong: false
            }
        }
        push(channelService, "onmessage", param, opUid, opSid);
    }

    /**收到103 拿牌请求，从card 中取一张牌给他,并告知对方*/
    if (msgId == 103) {
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        var round = content.round;
        var card = cards[rid][round];
        var c = getRandomCard(card, rid);
        var c_user = cards_user[rid][round];

        c_user[uid].push(c);

        var param = {
            msgId: 203,
            content: {belong: true, card: c}
        }
        var sid = channel.getMember(uid)['sid'];
        push(channelService, "onmessage", param, uid, sid);
        param.content.belong = false;
        push(channelService, "onmessage", param, opUid, opSid);
        /**发给双方，通知拿牌turn*/
        param = {
            msgId: 208,
            content: {turn: false}
        }
        push(channelService, "onmessage", param, uid, sid);
        param.content.turn = true;
        push(channelService, "onmessage", param, opUid, opSid);
    }

    /**收到 101， 回合开始， 回合开始，并且发牌*/

    if (msgId == 101) {
        var round = content.round;
        console.log("msgId ==1   and round = " + round);
        var rd = round_ms[rid];
        if (!rd) {
            rd = {};
            round_ms[rid] = rd;
        }
        var rd_round = rd[round];
        if (!rd_round) {
            round_ms[rid][round] = round;
        } else {
            var sid = channel.getMember(uid)['sid'];
            var opUid = users[0] == uid ? users[1] : users[0];
            var opSid = channel.getMember(opUid)['sid'];


            /**发牌*/
            var card = cards[rid];
            if (!card) {
                card = {};
            }

            if (!card[round]) {
                card[round] = initCard();
            }
            var c_user = cards_user[rid];
            if (!c_user) {
                c_user = {};
            }

            if (!c_user[round]) {
                c_user[round] = {};
            }
            c_user[round][uid] = new Array();
            console.log(" before round = " + round + " cards = " + JSON.stringify(card[round]));
            for (var i = 0; i < 2; i++) {
                c_user[round][uid].push(getRandomCard(card[round], rid));
            }


            c_user[round][opUid] = new Array();
            for (var i = 0; i < 2; i++) {
                c_user[round][opUid].push(getRandomCard(card[round], rid));
            }
            console.log(" after round = " + round + " cards = " + JSON.stringify(card[round]));

            var cnt = {
                self: c_user[round][uid],
                op: c_user[round][opUid],
                turn: false
            }
            var param = {
                msgId: 201,
                content: JSON.stringify(cnt)
            }
            push(channelService, "onmessage", param, uid, sid);

            cnt = {
                self: c_user[round][opUid],
                op: c_user[round][uid],
                turn: true
            }
            var param = {
                msgId: 201,
                content: JSON.stringify(cnt)
            }
            push(channelService, "onmessage", param, opUid, opSid);
            cards_user[rid] = c_user;
            cards[rid] = card;
        }

    }
    /**
     * 收到两个 204 开始游戏。
     */

    if (msgId == 104) {

        var go = go_ms[rid];
        if (go == undefined) {
            go = {count: 1};
            go_ms[rid] = go
        } else {
            var param = {
                msgId: 204,
                content: {round: 1}
            }
            channel.pushMessage("onmessage", param);

        }
    }

    cb(null, data);
}
