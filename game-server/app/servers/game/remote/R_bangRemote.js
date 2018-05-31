/*
    接受客户端的请求，维护与客户端的连接，路由客户端的请求到chat服务器
 */
module.exports = function (app) {
    return new bangRemote(app);
};
var consts = require('../../../consts/consts');

var bangRemote = function (app) {
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

bangRemote.prototype.join = function (msg, sid, name, flag, cb) {
    var rid = msg.rid;//roomId;
    var uid = msg.username + "*" + rid;
    profiles[msg.username] = msg;

    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        channel.add(uid, sid);
    }
    sleep(1000);
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

        var uid1 = users[1];
        var sid1 = channel.getMember(uid1)['sid'];
        var userId1 = uid1.split("*")[0];

        //发给user[0]
        var cont = {
            "opPlayer": {
                userId: userId1,
                nickname: profiles[userId1].nickname,
                iconUrl: profiles[userId1].iconUrl,
                progress: 100,
                skin: 1000
            }
        }
        param = {
            msgId: consts.xzk.MsgId.msgId_playerInfo,
            content: JSON.stringify(cont)
        }

        push(this.channelService, "onmessage", param, uid0, sid0);

        // 发给另外一个用户users[1] －》 发送801消息。
        cont.opPlayer.userId = userId0;
        cont.opPlayer.nickname = profiles[userId0].nickname;
        cont.opPlayer.iconUrl = profiles[userId0].iconUrl;

        param.content = JSON.stringify(cont);
        push(this.channelService, "onmessage", param, uid1, sid1);

    }
    cb(users);

};
var saver = require('../../../util/GameResultSaver');
bangRemote.prototype.kick = function (uid, sid, rid, cb) {

    var channel = this.channelService.getChannel(rid, false);
    if (!!channel) {
        var users = channel.getMembers();
        var opUid = users[0] == uid ? users[1] : users[0];
        saver.save(rid, opUid, uid);
        channel.leave(uid, sid);

        var winmsg = {
            msgId:consts.bang.MsgId.msgId_exit,
            content: JSON.stringify({})
        }

        channel.pushMessage("onmessage", winmsg);

        // new handler().cleanData(rid);
        //TODO clean data ,可能需要将 Handler 里面的数据提取出来。 或者想办法，调用到Handler 里面的clean方法。
        channel.destroy();
    }
    cb("success");
};
