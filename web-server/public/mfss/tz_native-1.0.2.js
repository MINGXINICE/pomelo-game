
function isAndroid() {
    var ua = navigator.userAgent;
    var isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
    return isAndroid;
}
function isIOS() {
    var ua = navigator.userAgent;
    var isIOS = ua.indexOf('iPhone') > -1 || ua.indexOf('Mac') > -1
    return isIOS;
}
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}
//ios监听获取分数回调
if (isIOS()) {
    setupWebViewJavascriptBridge(function(bridge) {
        bridge.registerHandler('TzGame.getScore', function(data) {
            TzGame.getScore();
        });
    });
};
//安卓分数回调
var TzGame = {
    getScore:function () {
        hideGame(SF_INFO.bestScore);
    }
}
//获取个人名片
function getUserCard(userId) {
    if (isAndroid()) {
        window.TzAndroid.userCard(userId);
    }else if (isIOS()) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler('TziOS.userCard',userId);
        })
    }
}
//开始加载时调用
function startLoading(){
    if (isAndroid() && typeof window.TzAndroid.startLoading =="function" ){
        window.TzAndroid.startLoading();
    }else if (isIOS()) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler('TziOS.startLoading');
        })
    }
}