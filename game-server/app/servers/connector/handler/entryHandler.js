module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function (msg, session, next) {
    var self = this;
    var rid = msg.rid;
    var uid = msg.username + '*' + rid
    var sessionService = self.app.get('sessionService');
    //duplicate log in
    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);
    session.set('rid', rid);
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));

    //put user into channel
    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function (users) {
        next(null, {
            users: users
        });
    });
};
handler.join = function (msg, session, next) {
    var self = this;
    var rid = msg.rid;
    var uid = msg.username + '*' + rid;
    var gid = msg.gid;
    var sessionService = self.app.get('sessionService');
    //duplicate log in
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
    session.set("gid",gid);
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));

    //put user into channel
    self.app.rpc.chat.chatRemote.join(session, msg, self.app.get('serverId'), rid, true, function (users) {
        if (users.length == 3) {
            session.closeConnect();
        }
        next(null, {
            users: users
        });
    });

}

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), function (winUser) {
        console.log("entryHandler onUserLeavev kick callback winUser:"+winUser);
        //TODO 断开胜利者与服务器的连接。此时 backend 的channel已经 销毁了。
        // app.get('backendSessionService').kickByUid(winUser);
    });
};