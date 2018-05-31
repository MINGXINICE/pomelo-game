/**
 * {
            username: username,
            rid: roomId,
            gid: gameId,
            iconUrl: iconUrl,
            nickname: nickname
        }
 * @param opts
 * @constructor
 */

var Profile = function (opts) {
    this.username = opts.username;
    this.nickname = opts.nickname;
    this.gid = opts.gid;
    this.iconUrl = opts.iconUrl;
    this.rid = opts.rid;
};

module.exports = Profile;