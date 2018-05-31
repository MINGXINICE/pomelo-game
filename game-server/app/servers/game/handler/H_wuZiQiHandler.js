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

var percents = {};//保存两个人加载进度的消息。以房间名为key 作为房间之间的区别
var readyGos = {}; // 保存准备好的数据，如果两个readyGO ，开始游戏。以房间名为key 作为房间之间的区别
var arrays = {};//棋盘信息列表。以房间名为key 作为房间之间的区别。等判断完输赢之后将数据删除。
var pieces = {};//保存房间内的棋子颜色和userId的对应关系。

cleanData = function (rid) {
    //清理percent数据
    delete percents[rid];
    //清理棋盘数据
    delete arrays[rid];
    //清理readyGo数据
    delete readyGos[rid];
    //清理 pices颜色记录数据
    delete pieces[rid];
}

/**
 //记录房间内落子倒计时时间。
 {
 "wuziqi:10":{
   "latest":192183283,
   "uid":1000*10,
   "sid":""
   "opUid":2000*10,
   "opSid":""
   "channelService":channelService
 },
 "wuziqi:11":{
    "latest":192183283,
    "uid":1000*10,
    "opUid":2000*10,
    "channelService":channelService
  }
 }

 */
var times = {};

/**
 * 处理倒计时逻辑
 *
 */
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
        // console.log("currentSecond - latest" + (currentSecond - latest));
        if (currentSecond - latest > 60) {

            //如果这个时间已经超时，则盘定胜负。
            var cnt = {
                result: 2,
                outTime: true
            };
            var param = {
                msgId: consts.wuziqi.ResponseMsgId.msgId_result,
                content: JSON.stringify(cnt)
            };
            console.log("begin push message to uid ! uid=" + time.uid + " sid=" + time.sid);
            push(time.channelService, "onmessage", param, time.uid, time.sid);
            console.log("pushed message to uid ! uid=" + time.uid + " sid=" + time.sid);

            cnt.result = 1;
            param.content = JSON.stringify(cnt);
            console.log("begin push message to op-uid ! op-uid=" + time.opUid + " opsid=" + time.opSid);
            push(time.channelService, "onmessage", param, time.opUid, time.opSid);
            console.log("pushed message to op-uid ! op-uid=" + time.opUid + " opsid=" + time.opSid);

            saver.save(rid, time.opUid, time.uid);

            delete times[rid];
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

var judge = function judge(arr, num, x, y) {
    var n1 = 0,
        //左右方向
        n2 = 0,
        //上下方向
        n3 = 0,
        //左上到右下方向
        n4 = 0; // 右上到左下方向
    var n1_arr = new Array(5);
    var n2_arr = new Array(5);
    var n3_arr = new Array(5);
    var n4_arr = new Array(5);
    //***************左右方向**********************************
    //先从点击的位置向左寻找，相同颜色的棋子n1自加，直到不是相同颜色的棋子，则跳出循环
    for (var i = x; i >= 0; i--) {
        if (arr[i][y] != num) {
            break;
        }
        n1_arr[n1] = {
            x: i,
            y: y
        };
        n1++;

    }
    //然后从点击的位置向右 下一个位置寻找，相同颜色的棋子n1自加，直到不是相同颜色的棋子，则跳出循环
    for (var i = x + 1; i < 15; i++) {
        if (arr[i][y] != num) {
            break;
        }
        n1_arr[n1] = {
            x: i,
            y: y
        };
        n1++;

    }
    //****************上下方向******************************
    for (var i = y; i >= 0; i--) {
        if (arr[x][i] != num) {
            break;
        }
        n2_arr[n2] = {x: x, y: i};
        n2++;

    }
    for (var i = y + 1; i < 15; i++) {
        if (arr[x][i] != num) {
            break;
        }
        n2_arr[n2] = {x: x, y: i};
        n2++;
    }
    //****************左上到右下斜方向******************************
    for (var i = x,
             j = y; i >= 0, j >= 0; i--, j--) {
        if (i < 0 || j < 0 || arr[i][j] != num) {
            break;
        }
        n3_arr[n3] = {x: i, y: j};
        n3++;
    }
    for (var i = x + 1,
             j = y + 1; i < 15, j < 15; i++, j++) {
        if (i >= 15 || j >= 15 || arr[i][j] != num) {
            break;
        }
        n3_arr[n3] = {x: i, y: j};
        n3++;
    }
    //****************右上到左下斜方向******************************
    for (var i = x,
             j = y; i >= 0, j < 15; i--, j++) {
        if (i < 0 || j >= 15 || arr[i][j] != num) {
            break;
        }
        n4_arr[n4] = {x: i, y: j};
        n4++;
    }
    for (var i = x + 1,
             j = y - 1; i < 15, j >= 0; i++, j--) {
        if (i >= 15 || j < 0 || arr[i][j] != num) {
            break;
        }
        n4_arr[n4] = {x: i, y: j};
        n4++;
    }
    if (n1 >= 5) {
        return n1_arr;
    }
    if (n2 >= 5) {
        return n2_arr;
    }
    if (n3 >= 5) {
        return n3_arr;
    }
    if (n4 >= 5) {
        return n4_arr;
    }
    return null;
};

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
     * 收到用户发送表情消息，转换messageID 发送给对方。
     */
    if (msgId == consts.wuziqi.RequestMsgId.msgId_emoji) {
        //给当前悔棋用户的对手发一个 212消息。
        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_emoji,
            content: JSON.stringify(content)
        }

        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        push(channelService, "onmessage", param, opUid, opSid);
    }

    /**
     * 收到 105 retract 悔棋 消息。给当前悔棋用户的对手发一个 212消息。
     */
    if (msgId == consts.wuziqi.RequestMsgId.msgId_retract) {
        //给当前悔棋用户的对手发一个 212消息。
        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_retract,
            content: "{}"
        }

        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);
    }

    /**
     * 收到108消息。来自被悔棋用户，是否同意对方悔棋。原封不动返回消息给另外一方。
     */
    if (msgId == consts.wuziqi.RequestMsgId.msgId_RetractEnsure) {

        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_retractEnsure,
            content: JSON.stringify(content)
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);
    }

    /**
     * 收到106 求和消息，给当前用户的对手发送一个 213消息
     */
    if (msgId == consts.wuziqi.RequestMsgId.msgId_draw) {
        //给当前求和用户的对手发一个 213消息。
        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_draw,
            content: "{}"
        }

        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);
    }

    /**
     * 收到109 求和确认消息，给求和那人发送214 消息。
     * 如果是拒绝原封不动返回消息。
     * 如果是统一求和，则返回平局信息。
     */

    if (msgId == consts.wuziqi.RequestMsgId.msgId_drawEnsure) {

        var draw_result = content.sure;
        if (draw_result) {
            var cnt = {
                result: 3,
                outTime: false
            };
            var param = {
                msgId: consts.wuziqi.ResponseMsgId.msgId_result,
                content: JSON.stringify(cnt)
            }
            channel.pushMessage("onmessage", param);

            saver.save(rid);
            //如果同意求和，那么清理房间数据。
            cleanData(rid);
        } else {
            var param = {
                msgId: consts.wuziqi.ResponseMsgId.msgId_drawEnsure,
                content: JSON.stringify(content)
            }
            var tuid = users[0] == uid ? users[1] : users[0];
            var tsid = channel.getMember(tuid)['sid'];
            push(channelService, "onmessage", param, tuid, tsid);
        }

    }

    /**
     * 收到 107认输消息  ，直接给对手发送对方认输的 215消息。然后双放都要收到208 结果消息（内容不一样的结果消息，result 一个是1（赢） 一个是2（输））。
     *
     */
    if (msgId == consts.wuziqi.RequestMsgId.msgId_giveup) {
        //给对方发215
        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_giveup,
            content: "{}"
        }
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);

        //双方发送 208消息

        // 给输的人发
        var cnt = {
            result: 2,
            outTime: false
        }
        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_result,
            content: JSON.stringify(cnt)
        }
        tuid = uid;
        tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);

        //给赢的人发
        cnt.result = 1;
        param.content = JSON.stringify(cnt);
        var tuid = users[0] == uid ? users[1] : users[0];
        var tsid = channel.getMember(tuid)['sid'];
        push(channelService, "onmessage", param, tuid, tsid);

        saver.save(rid, tuid, uid);

        //如果一方认输成功。那么清理房间数据。
        cleanData(rid);

    }

    /**
     * 处理 ready go 也就是两个人都加载到100 ，而且收到 服务器发的 205消息之后，客户端发给服务一个readygo
     * 当两个用户都给服务器发送了reaygo 之后，服务器给客户端发送  GO！
     */

    if (msgId == consts.wuziqi.RequestMsgId.msgId_readyGo) {
        //TODO 判断同房间两个人的101消息个数
        var record = readyGos[rid];
        if (record == undefined) {
            readyGos[rid] = {count: 1}
        } else {
            var param = {
                route: 'onmessage',
                msgId: consts.wuziqi.ResponseMsgId.msgId_go,
                content: JSON.stringify({})
            };

            channel.pushMessage(param);
            var sid = channel.getMember(uid)['sid'];
            var opUid = users[0] == uid ? users[1] : users[0];
            var opSid = channel.getMember(opUid)['sid'];
            setTimeoutCheck(rid, channelService, uid, sid, opUid, opSid);
        }
    }
    /**
     * 处理加载进度事件
     */

    else if (msgId == consts.wuziqi.MsgId.msgId_loading) {

        if (content.percent == 100) {
            //保存房间内用户的黑子白子信息。 2：黑子  1:白子
            var piece = pieces[rid];
            if (!piece) {
                piece = {};
                piece[uid] = 2;
            } else {
                if (!piece[uid]) {
                    piece[uid] = 1;
                }
            }
            pieces[rid] = piece;

            //发送消息  205
            var content = {
                myTurn: piece[uid] == 2,
                black: piece[uid] == 2
            };
            var param = {
                route: 'onmessage',
                msgId: consts.wuziqi.ResponseMsgId.msgId_start,
                content: JSON.stringify(content)
            };
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);


        }

        // var roomPercent = percents[rid];
        // if (roomPercent == undefined) {
        //     roomPercent = {};
        //     roomPercent[uid] = content.percent;
        //     percents[rid] = roomPercent;
        // } else {
        //     roomPercent[uid] = content.percent;
        //     percents[rid] = roomPercent;
        // }
        // console.log(JSON.stringify(percents[rid]));
        // //给自己发消息说明进度。
        // var cnt = {
        //     percent: content.percent,
        //     belong: true
        // };
        // var param = {
        //     msgId: msgId,
        //     content: JSON.stringify(cnt)
        // }
        // var uid = uid;
        // var sid = channel.getMember(uid)['sid'];
        // push(channelService, "onmessage", param, uid, sid);
        // channelService.pushMessageByUids("onmessage", param, [{
        //     uid: uid,
        //     sid: sid
        // }]);
        //
        //
        // if (users.length == 2) {
        //     var opUid = users[0] == uid ? users[1] : users[0];
        //     var opSid = channel.getMember(opUid)['sid'];
        //     console.log(" roomPercent[uid] ="+ uid+" : "+ roomPercent[uid] + ", roomPercent[opUid] =" + opUid + " : "+roomPercent[opUid] );
        //     if (roomPercent[uid] != undefined && roomPercent[uid] == 100 && roomPercent[opUid] != undefined && roomPercent[opUid] == 100) {
        //
        //         var content = {
        //             myTurn: true,
        //             black: true
        //         };
        //         var param = {
        //             route: 'onmessage',
        //             msgId: consts.wuziqi.ResponseMsgId.msgId_start,
        //             content: JSON.stringify(content)
        //         };
        //         push(channelService, "onmessage", param, uid, sid);
        //
        //         content.myTurn = false;
        //         content.black = false;
        //         param.content = JSON.stringify(content);
        //
        //
        //         push(channelService, "onmessage", param, opUid, opSid);
        //
        //         //保存房间内用户的黑子白子信息。 2：黑子  1:白子
        //         var piece = {};
        //         piece[uid] = 2;
        //         piece[opUid] = 1;
        //         pieces[rid] = piece;
        //
        //         //设置第一个人（黑子的人）的倒计时
        //
        //         setTimeoutCheck(rid, channelService, uid, sid, opUid, opSid);
        //
        //         cb(data);
        //     } else {
        //         // 当房间里有两个人时，给另外一个人发送自己的加载进度。
        //
        //         var cnt = {
        //             percent: content.percent,
        //             belong: false
        //         };
        //         var param = {
        //             msgId: msgId,
        //             content: JSON.stringify(cnt)
        //         };
        //         push(channelService, "onmessage", param, opUid, opSid);
        //
        //     }
        //
        // }
    }

    /**
     * 处理下棋落子 逻辑
     */
    else if (msgId == consts.wuziqi.RequestMsgId.msgId_addPiece) {
        //收到101 下子的消息，将数据保存在棋盘中，并判断输赢。
        var arr = arrays[rid];
        if (arr == undefined) {
            //用二维数组来保存棋盘，0代表没有走过，1为白棋走过，2为黑棋走过
            arr = new Array(15); //声明一个一维数组
            for (var i = 0; i < 15; i++) {
                arr[i] = new Array(15); //每个值再声明一个一维数组，这样就组成了一个二维数组
                for (var j = 0; j < 15; j++) {
                    arr[i][j] = 0;
                }
            }
        }
        //记录当前走过的棋子。
        var x = content.position.x;
        var y = content.position.y;
        var num = pieces[rid][uid]
        arr[x][y] = num;
        arrays[rid] = arr;

        //收到 101 下子 消息，给对方回复一个 206 告诉他下在了哪里
        var param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_addPiece,
            content: JSON.stringify(content)
        }
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];
        push(channelService, "onmessage", param, opUid, opSid);

        //判断输赢
        var result = judge(arr, num, x, y);
        if (result == null) {// 如果没有赢
            //判断是否所有棋子都下满了，如果判定输赢，给平局。


        } else { // num对应的用户赢了，发送消息，结束游戏。
            //发送赢的消息给赢得人。

            var content = {
                result: 1,
                winPieces: result
            }
            var param = {
                msgId: consts.wuziqi.ResponseMsgId.msgId_result,
                content: JSON.stringify(content),
                outTime: false
            }
            var sid = channel.getMember(uid)['sid'];
            push(channelService, "onmessage", param, uid, sid);

            //发给输的人输的消息

            content.result = 2;
            param.content = JSON.stringify(content);
            var opUid = users[0] == uid ? users[1] : users[0];
            var opSid = channel.getMember(opUid)['sid'];
            push(channelService, "onmessage", param, opUid, opSid);

            saver.save(rid, uid, opUid);

            //清理房间数据。
            cleanData(rid);
            cb();
            return;

        }
        //并且立马给发一个 211 ，开始倒计时。
        param = {
            msgId: consts.wuziqi.ResponseMsgId.msgId_startRound,
            content: JSON.stringify({})
        }
        push(channelService, "onmessage", param, opUid, opSid);
        //设置倒计时时间。
        var sid = channel.getMember(uid)['sid'];
        setTimeoutCheck(rid, channelService, opUid, opSid, uid, sid);

    }
    cb(null, data);

}