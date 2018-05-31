/**
 * Created by yangyanfei on 15/5/27.
 */


var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;


//全局变量gn
var global_isConnect = false;
var global_debug = false;

var NetWork = function(){
    tz_url.encodeNickname=encodeURIComponent(tz_url.nickname);
    tz_url.encodeIconUrl=encodeURIComponent(tz_url.iconUrl);
    this.url = tz_url.serverUrl+ "?roomId=" + tz_url.roomId+ "&userId=" + tz_url.userId
        + "&nickname=" + tz_url.encodeNickname + "&iconUrl=" + tz_url.encodeIconUrl+ "&skin=" + tz_url.skin;
    this.websocket = null;
    this.target = null;
};

NetWork.prototype = { // 定义Person的prototype域

    //开启连接
     openConnect:function() {   // 定义一个print函数

         var self = this;
         this.websocket = new WebSocket(this.url);

         this.websocket.onopen = function(evt) {
             cc.log("Send Text WS was opened ");
             global_isConnect = true;
             cc.eventManager.dispatchCustomEvent(MsgId.msgId_connect);
         };
         this.websocket.onerror = function(evt) {
             // cc.log("Error was fired ");
         };

        this.websocket.onmessage = function(evt) {
             var jsonObj = JSON.parse(evt.data);
            // cc.log("收到消息 msgId = " + jsonObj.msgId);
             // self.target.receiveMessage(evt.data);
             self.receiveMessage(evt.data);
         };

         this.websocket.onclose = function(evt) {
             if(!global_debug&&!GM_INFO.isEnd)
             {
                 cc.eventManager.dispatchCustomEvent(MsgId.msgId_webSocketClosed);
             }
         };
     },


    //关闭连接
    closeConnect:function(){
        this.websocket.close();
    },

    //发送消息
    sendMessage:function(data){
        if (this.websocket && this.websocket.readyState == WebSocket.OPEN){
            var content  = JSON.stringify(data.content);
            data.content = content;
            var jsonStr = JSON.stringify(data);
            this.websocket.send(jsonStr);
        }
    }

};
