module.exports = function (app) {
    return new ChatRemote(app);
};

var consts = require('../../../consts/consts');

var ChatRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.profileManager = app.get('profileManager');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function (uid, sid, name, flag, cb) {
    var channel = this.channelService.getChannel(name, flag);
    var username = uid.split('*')[0];
    var param = {
        route: 'onAdd',
        user: username
    };
    channel.pushMessage(param);
    if (!!channel) {
        channel.add(uid, sid);
    }

    cb(this.get(name, flag));
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

//name room id
ChatRemote.prototype.join = function (msg, sid, name, flag, cb) {
    // profiles[msg.username] = msg;
    var userId = msg.username;
    var rid = msg.rid;
    var uid = userId + "*" + rid;
    var route = "onmessage";

    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        channel.add(uid, sid);
    }

    this.profileManager.add(msg);

    var users = channel.getMembers();
    var username = uid.split("*")[0];

    sleep(1000);

    /**
     * 发送 onopen 消息给连进来的用户。
     * @type {{teamid: number}}
     */

    var param = {
        msgId: 1000,
        content: JSON.stringify({onopen: 999})
    };
    push(this.channelService, "onopen", param, uid, sid);

    if (users.length == 2) {
        var uid0 = users[0];
        var sid0 = channel.getMember(uid0)['sid'];
        var uid1 = users[1];
        var sid1 = channel.getMember(uid1)['sid'];

        //给第一个用户发送400 teamid
        var obj = {teamid: 1};
        var param = {
            msgId: 400,
            content: JSON.stringify(obj)
        };
        push(this.channelService, "onmessage", param, uid0, sid0);

        // 给第2个用户发送teamid 信息
        var obj = {teamid: 2};
        param = {
            msgId: 400,
            content: JSON.stringify(obj)
        };
        push(this.channelService, "onmessage", param, uid1, sid1);

        // 给第一个用户发送801 ， 告诉他第二个用户的id 和 头像等信息。
        param = { msgId: consts.double.msgId.response_playersInfo };
        param.content = JSON.stringify(this.profileManager.getProfileMessage(uid1));
        push(this.channelService, "onmessage", param, uid0, sid0);

        // 给第2个用户发送 801 信息
        param.content = JSON.stringify(this.profileManager.getProfileMessage(uid0));
        push(this.channelService, "onmessage", param, uid1, sid1);
    }
    cb(this.get(name, flag));
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function (name, flag) {
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        users = channel.getMembers();
    }
    for (var i = 0; i < users.length; i++) {
        users[i] = users[i].split('*')[0];
    }
    return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
var saver = require('../../../util/GameResultSaver');
ChatRemote.prototype.kick = function (uid, sid, name, cb) {
    var channel = this.channelService.getChannel(name, false);
    if (!channel) {//如果 channel 是 undefined 直接返回。没啥可做的。
        return;
    }
    var users = channel.getMembers();
    if (users.length == 1) {
        cb();
        return;
    }
    // leave channel
    if (!!channel) {
        var users = channel.getMembers();
        var opUid = users[0] == uid ? users[1] : users[0];
        saver.save(rid, opUid, uid);
        channel.leave(uid, sid);
    }

    var stayUser = users[0] == uid ? users[1].split('*')[0] : users[0].split('*')[0];
    var param = {
        route: "onmessage",
        msgId: 153,
        content: JSON.stringify({"userId": stayUser})
    };
    channel.pushMessage(param);
    channel.destroy();
    this.profileManager.remove(uid);
    cb(stayUser);
};
