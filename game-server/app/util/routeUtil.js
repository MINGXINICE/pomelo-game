var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function (session, msg, app, cb) {
    route(session, msg, app, cb, 'chat');
};

exp.game = function (session, msg, app, cb) {
    route(session, msg, app, cb, 'game');
};

function route(session, msg, app, cb, type) {
    var sid = session.get("bk_sid");
    if (!!sid) {
        var server = app.getServerById(sid);
        if (!!server) {
            cb(null, sid);
            return;
        }
    }

    var servers = app.getServersByType(type);
    if (!servers || servers.length === 0) {
        cb(new Error('can not find game servers.'));
        return;
    }

    // filter oversea or china
    var select = servers.filter(function (item, index) {
        return !!item.env && this == item.env;
    }, app.settings.env);

    if (select.length == 0) {
        select = servers;
    }

    var res = dispatcher.dispatch(session.get('rid'), select);
    session.set("bk_sid", res.id);
    session.push("bk_sid");
    cb(null, res.id);
}