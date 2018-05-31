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
    console.log(dt);
    var type = dt.type;

    if (!channel) {
        cb();
        return;
    }

    var users = channel.getMembers();
    //get current userId from user's session. split by * because uid in session is concat with roomId
    var uid = session.uid;
    var body = JSON.parse(dt.body);

    /**
     * 两方都发送200后，广播一个200
     */

    if (msgId == consts.shuidi.MsgId.msgId_info) { // 200
        var sid = channel.getMember(uid)['sid'];
        var opUid = users[0] == uid ? users[1] : users[0];
        var opSid = channel.getMember(opUid)['sid'];


        var param = {
            type: type, // 200
            body: JSON.stringify(body)
        }
        push(channelService, "onmessage", param, opUid, opSid);


    }

   
    cb(null, data);
}