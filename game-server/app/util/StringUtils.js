var logger = require('pomelo-logger').getLogger(__filename);

var stringUtil = module.exports;

stringUtil.randomSeed = function () {
    var rand1 = Math.floor(Math.random() * 100000000 + 1);
    return rand1;
}