/**
 * Created by yangyanfei on 15/11/2016.
 */


//鐟欙絾鐎絬rl閻ㄥ埊s

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
  //婵″倹鐏夌紒娆忕暰鐎涙顑佹稉鎻掔毈娴滃孩瀵氱€规岸鏆辨惔锔肩礉閸掓瑨绻戦崶鐐寸爱鐎涙顑佹稉璇х幢
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
  this.userId       = null;//閻溾晛顔峣d
  this.nickname     = "";//閻溾晛顔嶉崥宥呯摟
  this.encodeNickname= "";
  this.iconUrl      = null;//閻溾晛顔嶆径鏉戝剼閸︽澘娼�
  this.encodeIconUrl= null;
  this.skin         = 1000;//閻喛鍋�
  this.roomId       = null;//閹村潡妫縤d
  this.serverUrl    = null;//濞撳憡鍨欓張宥呭閸ｃ劌婀撮崸鈧�
  this.gameMode     = "link";//"app","link"
  this.osName       = null;//鐎广垺鍩涚粩顖滈兇缂侊拷

  this.aiNickname   = "";//ai閻ㄥ嫬鎮曠€涳拷
  this.aiIconUrl    = null;//ai閻ㄥ嫬銇旈崓蹇撴勾閸р偓
  this.aiSkin       = 1000;//ai閻ㄥ嫮姣婇懖锟�
  this.aiGrade      = 0;
  this.openMusic    =1;//閹貉冨煑闂婂厖绠伴惃鍕磻閸忥拷


};

Url.prototype = {
  init:function(){
    this.roomId = this.getValueByKey("roomId",null);
    this.userId = this.getValueByKey("userId",null);
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