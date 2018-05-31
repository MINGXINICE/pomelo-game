module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;


handler.join = function (msg, session, next) {
    var self = this;
    var rid = msg.rid;//roomId;
    var uid = msg.username + "*" + rid;//uid in channel and session
    var gid = msg.gid;//game id  , sent by the web page; to mark what game is it

    var sessionService = self.app.get("sessionService");

    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);

    //将客户端传过来的 game ID 和 room Id 进行拼接.组成新的channel Name。
    rid = gid + ":" + rid;
    session.set('rid', rid);

    //set game id into session
    session.set("gid", gid);
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));
    self.app.rpc.game.R_duoMiNuoGouRemote.join(session, msg, self.app.get('serverId'), rid, true, function (users) {
        if (users.length == 3) {
            // session.closeConnect();
        }
        next(null, {
            users: users
        });
    });
}

var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    app.rpc.game.R_duoMiNuoGouRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), function (data) {
        console.log(data);
    });
};