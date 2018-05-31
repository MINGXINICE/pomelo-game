/**
 * Created by yangyanfei on 15/11/2016.
 */


//閻熸瑱绲鹃悗绲瑀l闁汇劌鍩妔

var cutStr = function(str, len) {

    if(str==null)return null;
    var str_length = 0;
    var str_len = 0;
    var str_cut = new String();
    str_len = str.length;
    var emoji=false;
    var aa=str.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g);

    if(str_len<=len&&aa==null||str_len-1<=len&&aa)return str;
    for (var i = 0; i < str_len; i++) {
        var hs = str.charCodeAt(i);
        emoji=false;
        if (0xd800 <= hs && hs <= 0xdbff) {
            if (str_len > 1) {
                var ls = str.charCodeAt(i + 1);
                var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                if (0x1d000 <= uc && uc <= 0x1f77f) {
                    str_length++;
                    emoji=true;
                }else
                {
                    str_length++;
                }
            }
        }else
        {
            str_length++;
        }

        if(emoji)
        {
            var aa=escape(str[i]+str[i+1]);
            aa=unescape(aa);
            i++;
            str_cut=str_cut.concat(aa);
        }else
        {
            str_cut = str_cut.concat(str.charAt(i));

        }

        if (str_length == len-1) {
            str_cut = str_cut.concat("...");
            return str_cut;
        }


    }
    //濠碘€冲€归悘澶岀磼濞嗗繒鏆伴悗娑欘殘椤戜焦绋夐幓鎺旀瘓濞存粌瀛╃€垫氨鈧宀搁弳杈ㄦ償閿旇偐绀夐柛鎺撶懆缁绘垿宕堕悙瀵哥埍閻庢稒顨堥浣圭▔鐠囇呭耿
    if (str_length < len) {
        return str;
    }
};

var js = 0;
var hideGame=function(resultStr)
{
    js++;
    if(js>1)return;
    if(resultStr)
    {
        prompt("hideGame",resultStr);
    }else
    {
        prompt("hideGame");
    }
}

var Url = function(){
    this.userId       = null;//闁绘壕鏅涢宄
    this.nickname     = "";//闁绘壕鏅涢宥夊触瀹ュ懐鎽�
    this.encodeNickname= "";
    this.iconUrl      = null;//闁绘壕鏅涢宥嗗緞閺夋垵鍓奸柛锔芥緲濞硷拷
    this.encodeIconUrl= null;
    this.skin         = 1000;//闁活煈鍠涢崑锟�
    this.roomId       = null;//闁规潙娼″Λ绺
    this.serverUrl    = null;//婵炴挸鎲￠崹娆撳嫉瀹ュ懎顫ら柛锝冨妼濠€鎾锤閳э拷
    this.gameMode     = "link";//"app","link"
    this.osName       = null;//閻庡箍鍨洪崺娑氱博椤栨粓鍏囩紓渚婃嫹

    this.aiNickname   = "";//ai闁汇劌瀚幃鏇犫偓娑虫嫹
    this.aiIconUrl    = null;//ai闁汇劌瀚妵鏃堝磽韫囨挻鍕鹃柛褉鍋�
    this.aiSkin       = 1000;//ai闁汇劌瀚В濠囨嚃閿燂拷
    this.aiGrade      = 0;
    this.openMusic    =1;//闁硅矇鍐ㄧ厬闂傚﹤鍘栫粻浼存儍閸曨偆纾婚柛蹇ユ嫹


};

Url.prototype = {
    init:function(){
        this.roomId = this.getValueByKey("rid",null);
        this.userId = this.getValueByKey("uid",null);
        this.nickname = this.getValueByKey("nickname","");
        this.nickname=cutStr(this.nickname,7);
        this.iconUrl = this.getValueByKey("iconUrl",null);
        this.skin = this.getValueByKey("skin",1000);
        this.serverUrl = this.getValueByKey("serverUrl",null);
        this.gameMode = this.getValueByKey("gameMode","link");
        this.osName = this.getValueByKey("osName",null);
        this.aiNickname = this.getValueByKey("targetNickname","");
        this.aiNickname=cutStr(this.aiNickname,7);
        this.aiIconUrl = this.getValueByKey("targetUserIcon",null);
        this.aiSkin = this.getValueByKey("aiSkin",1000);
        this.aiGrade = this.getValueByKey("aiGrade",0);
        this.openMusic = this.getValueByKey("openMusic",1);

    },
    getValueByKey:function (key,defaultValue) {

        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
        var strArray = window.location.href.split("?");
        var str = strArray[strArray.length - 1];
        var r = str.match(reg);
        if (r != null)return unescape(decodeURIComponent(r[2]));
        return defaultValue;
    },
};
tz_url = new Url();
tz_url.init();

var Configure= {
    stopAllMusic:function () {
        if(tz_url.openMusic=='0'||tz_url.openMusic==0)
        {
            cc.audioEngine.setMusicVolume(0);
            cc.audioEngine.setEffectsVolume(0);
        }
    },
    include:function(path){
        var a=document.createElement("script");
        a.type = "text/javascript";
        a.src=path;
        var head=document.getElementsByTagName("head")[0];
        head.appendChild(a);
    }
};