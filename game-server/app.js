var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var routeUtil = require('./app/util/routeUtil');
var redisPool = require('redis-connection-pool');
var ProfileManager = require('./app/service/profileManager');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'kuaiya-game');

logger.info("Environment=%s", app.settings.env);

// app configure
app.configure('production|development|staging|oversea', function() {
    // route configures
    app.route('chat', routeUtil.chat);
    app.route('game', routeUtil.game);

    // filter configures
    // app.filter(pomelo.filters.timeout());

    // config and init redis pool
    app.loadConfig('redis', app.getBase() + '/config/redisPool.json');
    var poll = redisPool('RedisPool', app.get("redis"));
    app.set('RedisPool', poll);

    // init profile manager
    app.set('profileManager', new ProfileManager(app));
});

// config zookeeper
app.configure("production|staging|oversea", function () {
    var zookeeper = require('pomelo-zookeeper-plugin');
    app.loadConfig("zookeeper", app.getBase() + '/config/zookeeper.json');
    app.use(zookeeper, app.get('zookeeper'));
});



// app configuration
app.configure('production|development|staging|oversea', 'connector', function(){
	app.set('connectorConfig', {
        connector : pomelo.connectors.hybridconnector,
        heartbeat : 3,
        useDict : true,
        useProtobuf : true
    });
});

app.configure('production|development|staging|oversea', 'gate', function(){
	app.set('connectorConfig', {
        connector : pomelo.connectors.hybridconnector,
        useProtobuf : true
    });
});

// start app
app.start();

process.on('uncaughtException', function(err) {
    logger.error('Caught exception: ' + err.stack);
});