module.exports = function (app) {
    return new ShuidiRemote(app);
};
var consts = require('../../../consts/consts');

var ShuidiRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
};
var push = function (channelService, route, param, tuid, tsid) {
    channelService.pushMessageByUids(route, param, [{
        uid: tuid,
        sid: tsid
    }]);
};

var profiles = {};

ShuidiRemote.prototype.join = function (msg, sid, name, flag, cb) {
    var rid = msg.body.rid;//roomId;
    var uid = msg.body.uid + "*" + rid;
    profiles[uid] = msg;

    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        channel.add(uid, sid);
    }
    sleep(1000);

    console.log(rid + "-----------" + uid)
    //给当前用户发送 onopen 消息。
    var param = {
        msgId: 1000,
        content: JSON.stringify({onopen: 999})
    }

    push(this.channelService, "onopen", param, uid, sid);

    var users = channel.getMembers();
    if (users.length == 2) {


        var uid0 = users[0];
        var sid0 = channel.getMember(uid0)['sid'];
        var userId0 = uid0.split("*")[0];
        var level0 = profiles[uid0].body.maxLevel;

        var uid1 = users[1];
        var sid1 = channel.getMember(uid1)['sid'];
        var userId1 = uid1.split("*")[0];
        var level1 = profiles[uid1].body.maxLevel;

        var mapLe = Math.min(level0, level1);
        var indexArr = [];
        var levelNum = 3;
        for (var m = 0; m < 3; m++) {
            var k = Math.floor((Math.random() + m) * (mapLe / levelNum));
            while (indexArr.indexOf(k) > 0) {
                k = Math.floor((Math.random() + m) * (mapLe / levelNum));

            }
            indexArr.push(k);

        }
        indexArr.sort(function (a, b) {
            return a - b;
        });


        console.log("userId0:" + userId0 + "-----------userId1:" + userId1)

        //发给user[0]
        var cont = {
            uid: userId1,
            username: profiles[uid1].body.username,
            iconUrl: profiles[uid1].body.iconUrl,
            levelInfo: indexArr
        }
        param = {
            type: consts.shuidi.MsgId.msgId_info,
            body: JSON.stringify(cont)
        }

        push(this.channelService, "onmessage", param, uid0, sid0);

        // 发给另外一个用户users[1] －》 发送801消息。
        cont.uid = userId0;
        cont.username = profiles[uid0].body.username;
        cont.iconUrl = profiles[uid0].body.iconUrl;

        param.body = JSON.stringify(cont);
        push(this.channelService, "onmessage", param, uid1, sid1);

    }
    cb(users);

};
var saver = require('../../../util/GameResultSaver');
ShuidiRemote.prototype.kick = function (uid, sid, rid, cb) {

    var channel = this.channelService.getChannel(rid, false);
    if (!!channel) {
        var users = channel.getMembers();
        var opUid = users[0] == uid ? users[1] : users[0];
        saver.save(rid, opUid, uid);
        channel.leave(uid, sid);

        var winmsg = {
            type: consts.shuidi.MsgId.msgId_exit,
            body: JSON.stringify({})
        }

        channel.pushMessage("onmessage", winmsg);

        // new handler().cleanData(rid);
        //TODO clean data ,可能需要将 Handler 里面的数据提取出来。 或者想办法，调用到Handler 里面的clean方法。
        channel.destroy();
    }
    cb("success");
};
