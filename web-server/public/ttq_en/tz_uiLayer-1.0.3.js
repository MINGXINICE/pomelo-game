
var emotionLen = 10;//澶村儚鎬讳釜鏁�
var Msg = {
    emotion:10000,//鍚戞湇鍔″櫒鍙戦€佸ご鍍忕殑娑堟伅ID
    item:1255,//鑾峰彇鑷繁鐐瑰嚮澶村儚ID
}
//琛ㄦ儏娑堟伅Msg
var EmoticonMsg = function(){
    this.msgId = Msg.emotion;
    this.content={
        userId:0,
        emoticonId:0
    }
};

//*************************** 璧勬簮璺緞 *************************************

var res_emotion = {
    emotion_0:"res/emoticon/0.png",
    emotion_1:"res/emoticon/1.png",
    emotion_2:"res/emoticon/2.png",
    emotion_3:"res/emoticon/3.png",
    emotion_4:"res/emoticon/4.png",
    emotion_5:"res/emoticon/5.png",
    emotion_6:"res/emoticon/6.png",
    emotion_7:"res/emoticon/7.png",
    emotion_8:"res/emoticon/8.png",
    emotion_9:"res/emoticon/9.png",
    uiCCB:"res/ccb/UiCCB.ccbi",
    bg2:"res/emoticon/backGround.png",
    bg:"res/emoticon/backGround.png",
    // bg:"https://game-static.new.tongzhuogame.com/tz-sdk/emoticon/backGround.png",
    emotion_button:"res/emoticon/emotion_button.png",
    head_bg:"res/emoticon/head_bg.png",
    left_bg:"res/emoticon/left_bg.png",
    right_1_button:"res/emoticon/right_1_button.png",
    right_2_button:"res/emoticon/right_2_button.png",
    right_bg:"res/emoticon/right_bg.png",
    right_buttonBg:"res/emoticon/right_buttonBg.png",
    uiHead_1:"res/emoticon/uiHead_1.png",
    uiHead_2:"res/emoticon/uiHead_2.png",
    uiHead_3:"res/emoticon/uiHead_3.png",
    uiHead_4:"res/emoticon/uiHead_4.png",
};
var g_resource_emotion = [];
for(var i in res_emotion){
    g_resource_emotion.push(res_emotion[i]);
}

function getSeedRandom (min,max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}


//*************************** Android鍜孖OS鍥炶皟 *****************************

//************************** 鏂板澶村儚琛ㄦ儏灞� *********************************

//UiCtrl鏂囦欢
cc.BuilderReader.registerController("UiCtrl",{
    onDidLoadFromCCB:function(){
        this.initPlayerInfo();
    },
    completedAnimationSequenceNamed:function(animationName){

    },
    //鍒濆鍖栫帺瀹剁殑澶村儚 鍜� 鍚嶅瓧
    initPlayerInfo: function () {
        //璁剧疆澶村儚
        // tz_url.iconUrl = "http://7xjxba.com1.z0.glb.clouddn.com/14358229262529?e=1751182930&token=bz2giEcTM9os8itpIhHdGYMjBQHeaS1dkxEqLWu4:BbZGTXWyJ4GyCetpt28UbymZ384=";
        // OP_INFO.iconUrl = "http://7xjxba.com1.z0.glb.clouddn.com/14358229262529?e=1751182930&token=bz2giEcTM9os8itpIhHdGYMjBQHeaS1dkxEqLWu4:BbZGTXWyJ4GyCetpt28UbymZ384=";
        if(tz_url.iconUrl != null && tz_url.iconUrl != ""){
            cc.loader.loadImg(tz_url.iconUrl, function(err,img){
                var sprite  = new cc.Sprite(img);
                if(sprite){
                    var sfHeadBg = this['head_'+SF_INFO.teamId];
                    var headBgSize = sfHeadBg.getContentSize();
                    var headSp = GameTool.getHead(sprite);
                    headSp.setPosition(cc.p(headBgSize.width * 0.5,headBgSize.height * 0.5));
                    sfHeadBg.addChild(headSp);
                }
            }.bind(this));
        }
        if(OP_INFO.iconUrl!="" && OP_INFO.iconUrl!=null ){
            cc.loader.loadImg(OP_INFO.iconUrl, function(err,img){
                var sprite  = new cc.Sprite(img);
                if(sprite){
                    var opHeadBg = this['head_'+OP_INFO.teamId];
                    var headBgSize = opHeadBg.getContentSize();
                    var headSp = GameTool.getHead(sprite);
                    headSp.setPosition(cc.p(headBgSize.width * 0.5,headBgSize.height * 0.5));
                    opHeadBg.addChild(headSp);
                }
            }.bind(this));
        }
    },
    //璁剧疆鏃堕棿
    setTimeLabel:function (time) {
        this.timeLabel.setString(time);
    },
    //璁剧疆鍒嗘暟
    setScore:function (teamId,score) {
        this['score_'+teamId].setString(score);
    },
    //鑾峰彇鍒嗘暟
    getScore:function(teamId){
        var score = this['score_'+teamId].getString();
        return score;
    },

    //灞曞紑琛ㄦ儏鎸夐挳鍥炶皟
    'emoticonSelector': function(sender,type){
        switch(type){
            case cc.CONTROL_EVENT_TOUCH_UP_INSIDE:
                this.emoticon_button.setVisible(false);
                this.right_button.setVisible(true);
                cc.director.getRunningScene()._uiLayer._listView.setVisible(true);
                cc.director.getRunningScene()._uiLayer._listViewBg.setVisible(true);
                break;
        }
    },
    //鏀惰捣琛ㄦ儏鎸夐挳鍥炶皟
    'rightSelector': function(sender,type){
        switch(type){
            case cc.CONTROL_EVENT_TOUCH_UP_INSIDE:
                this.right_button.setVisible(false);
                this.emoticon_button.setVisible(true);
                cc.director.getRunningScene()._uiLayer._listView.setVisible(false);
                cc.director.getRunningScene()._uiLayer._listViewBg.setVisible(false);
                break;
        }
    },
    playAction:function (name) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed(name);
    },
});
//琛ㄦ儏绫�
var Emoticon = cc.Sprite.extend({
    _bg:null,
    ctor: function (type,tempId) {
        var str = "res/emoticon/"+type+".png";
        this._super(str);
        var bg = null;
        if(tempId == 1)
            bg = new cc.Sprite(res_emotion.left_bg);
        else
            bg = new cc.Sprite(res_emotion.right_bg);
        bg.setAnchorPoint(0.15,0.08);
        bg.setPosition(this.getPosition());
        this._bg = bg;
        this.addChild(bg,-1);

    },
    playActrions:function (x,y) {
        var moveTo = cc.moveTo(0.5,cc.p(x,y));
        var fadeTo = cc.fadeTo(1,0);
        var fadeTo2 = cc.fadeTo(1,0);
        var callFun = cc.callFunc(function () {
            this.removeFromParent(true);
        }.bind(this));
        var delayTime = cc.delayTime(1.2);
        var delayTimee2 = cc.delayTime(0.2);
        this._bg.runAction(cc.sequence(delayTime,fadeTo2));
        this.runAction(cc.sequence(moveTo,delayTimee2,fadeTo,callFun));
    }
});
//澶村儚琛ㄦ儏灞�
var UiLayer = cc.Layer.extend({
    _uiCtrlCCB:null,
    _listView:null,
    _listViewBg:null,
    _listener:null,
    ctor:function(type,isVertical,isVisible){
        this._super();
        if(isVisible == null){
            isVisible = false;
        }
        this.addListView(isVertical,isVisible);
        this._uiCtrlCCB = this.addCCBI(res_emotion.uiCCB);
        var str = "UiType_"+type;
        this._uiCtrlCCB.playAction(str);
        this.setEmoticonBtnViseble(false);
    },
    onEnterTransitionDidFinish: function () {
        this._super();
        this.addListeners();
        var self = this;
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                // 鑾峰彇褰撳墠瑙︽懜鐐圭浉瀵逛簬鎸夐挳鎵€鍦ㄧ殑鍧愭爣
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var headBox1 = self._uiCtrlCCB.head_1.getBoundingBox();
                var headBox2 = self._uiCtrlCCB.head_2.getBoundingBox();
                if (cc.rectContainsPoint(headBox1, locationInNode)) {
                    if(SF_INFO.teamId == 1){
                        getUserCard(tz_url.userId);
                    }else {
                        getUserCard(OP_INFO.userId);
                    }
                    return true;
                }

                if (cc.rectContainsPoint(headBox2, locationInNode)) {
                    if(SF_INFO.teamId == 1){
                        getUserCard(OP_INFO.userId);
                    }else {
                        getUserCard(tz_url.userId);
                    }
                    return true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {

            }
        });
        cc.eventManager.addListener(this._listener, this);
    },
    addCCBI:function(ccbiResource,zOrder){
        cc.BuilderReader.setResourcePath("res/");
        zOrder = zOrder || 0;
        var node = cc.BuilderReader.load(ccbiResource,this);
        this.addChild(node,zOrder);
        return node.controller;

    },
    addListeners:function(){
        cc.eventManager.addCustomListener(Msg.item,this.receiveItemIndex.bind(this));
        cc.eventManager.addCustomListener(Msg.emotion,this.receiveEmoticonMsg.bind(this));
    },
    sendEmotionMsg:function (id) {
        var emoticonMsg = new EmoticonMsg();
        emoticonMsg.content.userId = tz_url.userId;
        emoticonMsg.content.emoticonId = id;
        tz_network.sendMessage(emoticonMsg);
    },
    receiveItemIndex:function (event) {
        var index = event.getUserData();
        this.createEmotion(index,SF_INFO.teamId);
        this.sendEmotionMsg(index);
    },
    receiveEmoticonMsg:function (event) {
        var data = event.getUserData();
        var id = data.emoticonId;
        var userId = data.userId;
        this.createEmotion(id,OP_INFO.teamId);
    },
    addListView:function (isVertical,isVisible) {
        var width = cc.winSize.width;
        var height = cc.winSize.height;


        if(isVertical){
            var bg = this._listViewBg = new cc.Sprite(res_emotion.bg);
            bg.setAnchorPoint(0,0);
            bg.setPosition(width*0.245+60,height*0.02);
            this.addChild(bg);
            bg.setVisible(false);
        }else {
            var bg = this._listViewBg = new cc.Sprite(res_emotion.bg2);
            bg.setAnchorPoint(0,0);
            bg.setPosition(width*0.57,height*0.02);
            this.addChild(bg);
            bg.setVisible(false);
        }

        var listView = this._listView = new ccui.ListView();
        if(!isVisible){
            listView.setScrollBarEnabled(false);
        }

        this.addChild(listView,9999);
        listView.setTouchEnabled(true);
        if(isVertical){
            listView.setContentSize(cc.size(241, 75));
        }else {
            listView.setContentSize(cc.size(290, 75));
        }

        listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        if(isVertical){
            listView.x = width*0.3+60;
            listView.y = height*0.0165;
        }else {
            listView.x = width*0.625;
            listView.y = height*0.0165;
        }

        for(var i = 0; i < emotionLen; i ++){
            var custom_button = new ccui.Button();
            custom_button.setTouchEnabled(true);
            custom_button.setScale9Enabled(true);
            var tempRes = "res/emoticon/"+i+".png";
            custom_button.loadTextures(tempRes,tempRes, "");
            if(i ==1){
                custom_button.setContentSize(cc.size(56,52));
            }else if(i == 7){
                custom_button.setContentSize(cc.size(54,52));
            } else{
                custom_button.setContentSize(cc.size(49,52));
            }
            var custom_item = new ccui.Layout();
            custom_item.setContentSize(custom_button.getContentSize());
            custom_button.x = custom_item.width / 2;
            custom_button.y = custom_item.height / 2;
            custom_item.addChild(custom_button);
            listView.pushBackCustomItem(custom_item);
        }
        listView.setItemsMargin(5);
        listView.setGravity(ccui.ListView.GRAVITY_CENTER_VERTICAL);
        listView.addEventListener(this.selectedItemEvent)
        listView.setVisible(false);
    },
    selectedItemEvent: function (sender, type) {
        switch (type) {
            case ccui.ListView.ON_SELECTED_ITEM_END:
                // listViewEx.jumpToPercentHorizontal(55.5);//璺宠浆鍒版寚瀹氫綅缃�
                var index  = sender.getCurSelectedIndex();
                cc.eventManager.dispatchCustomEvent(Msg.item,index);
                break;
            default:
                break;
        }
    },
    //鍒涘缓琛ㄦ儏
    createEmotion:function (index,teamId) {
        var emoticon = new Emoticon(index,teamId);
        this.addChild(emoticon);
        if(teamId == 1){
            emoticon.setAnchorPoint(0,1);
            emoticon.setPosition(this._uiCtrlCCB.head_1.getPosition());
            var maxX = emoticon.getPositionX()+emoticon.getContentSize().width;
            var minX = emoticon.getPositionX()-emoticon.getContentSize().width;
        }else {
            emoticon.setAnchorPoint(1,1);
            emoticon.setPosition(this._uiCtrlCCB.head_2.getPosition());
            var maxX = emoticon.getPositionX()-emoticon.getContentSize().width;
            var minX = emoticon.getPositionX()+emoticon.getContentSize().width;
        }
        var x = getSeedRandom(minX,maxX);
        var y = emoticon.getPositionY()-emoticon.getContentSize().height/2 - 10;
        emoticon.playActrions(x,y);
    },

    setEmoticonBtnViseble:function (isViseble) {
        this._uiCtrlCCB.emoticon_button.setVisible(isViseble);
    }
});