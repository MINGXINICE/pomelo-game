var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var saver = module.exports;

/**
 * 保存用户玩游戏结果
 *
 * @param rid - 房间号
 * @param winners 获胜者用户id列表
 * @param losers 失败者用户id列表
 *
 * 如果参数winners和losers都为空，则表示平局
 */
saver.save = function (rid, winners, losers) {
    var pool = pomelo.app.get("RedisPool");
    if (!!pool) {
        if (!rid) {
            logger.warn("save play result room id undefined");
            return;
        }
        var r = {};
        r.rid = rid;
        if (!!winners) {
            r.winners = (typeof winners == 'string') ? [winners] : winners;
        }
        if (!!losers) {
            r.losers = (typeof losers == 'string') ? [losers] : losers;
        }
        logger.info("save " + JSON.stringify(r));
        pool.rpush("KG:play:result", JSON.stringify(r));
    }
};