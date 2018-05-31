module.exports = function (app) {
    return new moFaShouShiRemote(app);
};

var consts = require('../../../consts/consts');

var moFaShouShiRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.profileManager = app.get('profileManager');
};

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

var push = function (channelService, route, param, tuid, tsid) {
    channelService.pushMessageByUids(route, param, [{
        uid: tuid,
        sid: tsid
    }]);
};


moFaShouShiRemote.prototype.join = function (msg, sid, name, flag, cb) {
    var rid = msg.rid;//roomId;
    var uid = msg.username + "*" + rid;

    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        channel.add(uid, sid);
    }

    this.profileManager.add(msg);

    sleep(1000);
    //给当前用户发送 onopen 消息。
    var param = {
        msgId: 1000,
        content: JSON.stringify({onopen: 999})
    };

    push(this.channelService, "onopen", param, uid, sid);

    var users = channel.getMembers();
    if (users.length == 2) {
        var uid0 = users[0];
        var sid0 = channel.getMember(uid0)['sid'];
        var uid1 = users[1];
        var sid1 = channel.getMember(uid1)['sid'];

        // 发给另外一个用户users[0] －》 发送801消息。
        param = {msgId: consts.mfss.MsgId.msgId_playersInfo};
        param.content = JSON.stringify(this.profileManager.getProfileMessage(uid1));
        push(this.channelService, "onmessage", param, uid0, sid0);

        // 发给另外一个用户users[1] －》 发送801消息。
        param.content = JSON.stringify(this.profileManager.getProfileMessage(uid0));
        push(this.channelService, "onmessage", param, uid1, sid1);
    }
    cb(users);
};

var saver = require('../../../util/GameResultSaver');
moFaShouShiRemote.prototype.kick = function (uid, sid, rid, cb) {
    var channel = this.channelService.getChannel(rid, false);
    if (!!channel) {

        var users = channel.getMembers();
        var opUid = users[0] == uid ? users[1] : users[0];
        saver.save(rid, opUid, uid);

        channel.leave(uid, sid);
        var cnt = {
            win: 1
        };
        var winmsg = {
            msgId: consts.mfss.MsgId.msgId_gameOver,
            content: JSON.stringify(cnt)
        };

        channel.pushMessage("onmessage", winmsg);

        // new handler().cleanData(rid);
        //TODO clean data ,可能需要将 Handler 里面的数据提取出来。 或者想办法，调用到Handler 里面的clean方法。
        channel.destroy();
    }
    this.profileManager.remove(uid);
    cb("success");
};
