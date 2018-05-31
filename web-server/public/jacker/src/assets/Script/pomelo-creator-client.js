(function(){function e(n){if(n)return function(n){for(var t in e.prototype)n[t]=e.prototype[t];return n}(n)}e.prototype.on=e.prototype.addEventListener=function(e,n){return this._callbacks=this._callbacks||{},(this._callbacks[e]=this._callbacks[e]||[]).push(n),this},e.prototype.once=function(e,n){var t=this;function o(){t.off(e,o),n.apply(this,arguments)}return this._callbacks=this._callbacks||{},o.fn=n,this.on(e,o),this},e.prototype.off=e.prototype.removeListener=e.prototype.removeAllListeners=e.prototype.removeEventListener=function(e,n){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var t,o=this._callbacks[e];if(!o)return this;if(1==arguments.length)return delete this._callbacks[e],this;for(var r=0;r<o.length;r++)if((t=o[r])===n||t.fn===n){o.splice(r,1);break}return this},e.prototype.emit=function(e){this._callbacks=this._callbacks||{};var n=[].slice.call(arguments,1),t=this._callbacks[e];if(t)for(var o=0,r=(t=t.slice(0)).length;o<r;++o)t[o].apply(this,n);return this},e.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks[e]||[]},e.prototype.hasListeners=function(e){return!!this.listeners(e).length},"undefined"!=typeof window&&(window.EventEmitter=e)})(),function(e,n,t){var o=e,r=o.Package={},i=o.Message={};r.TYPE_HANDSHAKE=1,r.TYPE_HANDSHAKE_ACK=2,r.TYPE_HEARTBEAT=3,r.TYPE_DATA=4,r.TYPE_KICK=5,i.TYPE_REQUEST=0,i.TYPE_NOTIFY=1,i.TYPE_RESPONSE=2,i.TYPE_PUSH=3,o.strencode=function(e){for(var t=new n(3*e.length),o=0,r=0;r<e.length;r++){var i=e.charCodeAt(r),s=null;s=i<=127?[i]:i<=2047?[192|i>>6,128|63&i]:[224|i>>12,128|(4032&i)>>6,128|63&i];for(var a=0;a<s.length;a++)t[o]=s[a],++o}var u=new n(o);return c(u,0,t,0,o),u},o.strdecode=function(e){for(var t=new n(e),o=[],r=0,i=0,c=t.length;r<c;)t[r]<128?(i=t[r],r+=1):t[r]<224?(i=((63&t[r])<<6)+(63&t[r+1]),r+=2):(i=((15&t[r])<<12)+((63&t[r+1])<<6)+(63&t[r+2]),r+=3),o.push(i);return String.fromCharCode.apply(null,o)},r.encode=function(e,t){var o=t?t.length:0,r=new n(4+o),i=0;return r[i++]=255&e,r[i++]=o>>16&255,r[i++]=o>>8&255,r[i++]=255&o,t&&c(r,4,t,0,o),r},r.decode=function(e){for(var t=0,o=new n(e),r=0,i=[];t<o.length;){var s=o[t++],a=(r=(o[t++]<<16|o[t++]<<8|o[t++])>>>0)?new n(r):null;c(a,0,o,t,r),t+=r,i.push({type:s,body:a})}return 1===i.length?i[0]:i},i.encode=function(e,t,r,i,c){var h=1+(s(t)?u(e):0);if(a(t))if(r){if("number"!=typeof i)throw new Error("error flag for number route!");h+=2}else if(h+=1,i){if((i=o.strencode(i)).length>255)throw new Error("route maxlength is overflow");h+=i.length}c&&(h+=c.length);var y=new n(h),v=0;return v=l(t,r,y,v),s(t)&&(v=f(e,y,v)),a(t)&&(v=d(r,i,y,v)),c&&(v=p(c,y,v)),y},i.decode=function(e){var t=new n(e),r=t.length||t.byteLength,i=0,u=0,l=null,f=t[i++],d=1&f,p=f>>1&7;if(s(p)){var h=parseInt(t[i]),y=0;do{u+=(127&(h=parseInt(t[i])))*Math.pow(2,7*y),i++,y++}while(h>=128)}if(a(p))if(d)l=t[i++]<<8|t[i++];else{var v=t[i++];v?(l=new n(v),c(l,0,t,i,v),l=o.strdecode(l)):l="",i+=v}var g=r-i,w=new n(g);return c(w,0,t,i,g),{id:u,type:p,compressRoute:d,route:l,body:w}};var c=function(e,n,t,o,r){if("function"==typeof t.copy)t.copy(e,n,o,o+r);else for(var i=0;i<r;i++)e[n++]=t[o++]},s=function(e){return e===i.TYPE_REQUEST||e===i.TYPE_RESPONSE},a=function(e){return e===i.TYPE_REQUEST||e===i.TYPE_NOTIFY||e===i.TYPE_PUSH},u=function(e){for(var n=0;n+=1,(e>>=7)>0;);return n},l=function(e,n,t,o){if(e!==i.TYPE_REQUEST&&e!==i.TYPE_NOTIFY&&e!==i.TYPE_RESPONSE&&e!==i.TYPE_PUSH)throw new Error("unkonw message type: "+e);return t[o]=e<<1|(n?1:0),o+1},f=function(e,n,t){do{var o=e%128,r=Math.floor(e/128);0!==r&&(o+=128),n[t++]=o,e=r}while(0!==e);return t},d=function(e,n,t,o){if(e){if(n>65535)throw new Error("route number is overflow");t[o++]=n>>8&255,t[o++]=255&n}else n?(t[o++]=255&n.length,c(t,o,n,0,n.length),o+=n.length):t[o++]=0;return o},p=function(e,n,t){return c(n,t,e,0,e.length),t+e.length};"undefined"!=typeof window&&(window.Protocol=o)}("undefined"==typeof window?module.exports:{},"undefined"==typeof window?Buffer:Uint8Array),function(e,n){var t=typeof window=="undefined"?module.exports:{};t.init=function(e){t.encoder.init(e.encoderProtos),t.decoder.init(e.decoderProtos)},t.encode=function(e,n){return t.encoder.encode(e,n)},t.decode=function(e,n){return t.decoder.decode(e,n)},"undefined"!=typeof window&&(window.protobuf=t)}(),(("undefined"!=typeof protobuf?protobuf:module.exports).constants={}).TYPES={uInt32:0,sInt32:0,int32:0,double:1,string:2,message:2,float:5},(("undefined"!=typeof protobuf?protobuf:module.exports).util={}).isSimpleType=function(e){return"uInt32"===e||"sInt32"===e||"int32"===e||"uInt64"===e||"sInt64"===e||"float"===e||"double"===e},function(e,n){var t=("undefined"!==typeof protobuf?protobuf:module.exports).codec={},o=new ArrayBuffer(8),r=new Float32Array(o),i=new Float64Array(o),c=new Uint8Array(o);function s(e){return e<=127?[e]:e<=2047?[192|e>>6,128|63&e]:[224|e>>12,128|(4032&e)>>6,128|63&e]}function a(e){return e<=127?1:e<=2047?2:3}t.encodeUInt32=function(e){e=parseInt(e);if(isNaN(e)||e<0)return null;var n=[];do{var t=e%128,o=Math.floor(e/128);0!==o&&(t+=128),n.push(t),e=o}while(0!==e);return n},t.encodeSInt32=function(e){e=parseInt(e);return isNaN(e)?null:(e=e<0?2*Math.abs(e)-1:2*e,t.encodeUInt32(e))},t.decodeUInt32=function(e){for(var n=0,t=0;t<e.length;t++){var o=parseInt(e[t]);if(n+=(127&o)*Math.pow(2,7*t),o<128)return n}return n},t.decodeSInt32=function(e){var n=this.decodeUInt32(e);return n=(n%2+n)/2*(n%2==1?-1:1)},t.encodeFloat=function(e){return r[0]=e,c},t.decodeFloat=function(e,n){if(!e||e.length<n+4)return null;for(var t=0;t<4;t++)c[t]=e[n+t];return r[0]},t.encodeDouble=function(e){return i[0]=e,c.subarray(0,8)},t.decodeDouble=function(e,n){if(!e||e.length<n+8)return null;for(var t=0;t<8;t++)c[t]=e[n+t];return i[0]},t.encodeStr=function(e,n,t){for(var o=0;o<t.length;o++)for(var r=s(t.charCodeAt(o)),i=0;i<r.length;i++)e[n]=r[i],n++;return n},t.decodeStr=function(e,n,t){for(var o=[],r=n+t;n<r;){var i=0;e[n]<128?(i=e[n],n+=1):e[n]<224?(i=((63&e[n])<<6)+(63&e[n+1]),n+=2):(i=((15&e[n])<<12)+((63&e[n+1])<<6)+(63&e[n+2]),n+=3),o.push(i)}for(var c="",s=0;s<o.length;)c+=String.fromCharCode.apply(null,o.slice(s,s+1e4)),s+=1e4;return c},t.byteLength=function(e){if("string"!=typeof e)return-1;for(var n=0,t=0;t<e.length;t++){n+=a(e.charCodeAt(t))}return n}}(),function(e,n){var t=e,o=e.encoder={},r=t.codec,i=t.constants,c=t.util;function s(e,n,t,o){for(var r in o)if(t[r]){var i=t[r];switch(i.option){case"required":case"optional":n=l(e,n,f(i.type,i.tag)),n=a(o[r],i.type,n,e,t);break;case"repeated":o[r].length>0&&(n=u(o[r],i,n,e,t))}}return n}function a(e,n,t,i,c){switch(n){case"uInt32":t=l(i,t,r.encodeUInt32(e));break;case"int32":case"sInt32":t=l(i,t,r.encodeSInt32(e));break;case"float":l(i,t,r.encodeFloat(e)),t+=4;break;case"double":l(i,t,r.encodeDouble(e)),t+=8;break;case"string":var a=r.byteLength(e);t=l(i,t,r.encodeUInt32(a)),r.encodeStr(i,t,e),t+=a;break;default:var u=c.__messages[n]||o.protos["message "+n];if(u){var f=new ArrayBuffer(2*r.byteLength(JSON.stringify(e)));a=s(f,a=0,u,e),t=l(i,t,r.encodeUInt32(a));for(var d=0;d<a;d++)i[t]=f[d],t++}}return t}function u(e,n,t,o,i){var s=0;if(c.isSimpleType(n.type))for(t=l(o,t=l(o,t,f(n.type,n.tag)),r.encodeUInt32(e.length)),s=0;s<e.length;s++)t=a(e[s],n.type,t,o);else for(s=0;s<e.length;s++)t=l(o,t,f(n.type,n.tag)),t=a(e[s],n.type,t,o,i);return t}function l(e,n,t){for(var o=0;o<t.length;o++,n++)e[n]=t[o];return n}function f(e,n){var t=i.TYPES[e]||2;return r.encodeUInt32(n<<3|t)}o.init=function(e){this.protos=e||{}},o.encode=function(e,n){var t=this.protos[e];if(!function e(n,t){if(!t)return!1;for(var r in t){var i=t[r];switch(i.option){case"required":if(void 0===n[r])return console.warn("no property exist for required! name: %j, proto: %j, msg: %j",r,i,n),!1;case"optional":if(void 0!==n[r]){var c=t.__messages[i.type]||o.protos["message "+i.type];if(c&&!e(n[r],c))return console.warn("inner proto error! name: %j, proto: %j, msg: %j",r,i,n),!1}break;case"repeated":var c=t.__messages[i.type]||o.protos["message "+i.type];if(n[r]&&c)for(var s=0;s<n[r].length;s++)if(!e(n[r][s],c))return!1}}return!0}(n,t))return null;var i=r.byteLength(JSON.stringify(n)),c=new ArrayBuffer(i),a=new Uint8Array(c),u=0;return t&&(u=s(a,u,t,n))>0?a.subarray(0,u):null}}("undefined"!=typeof protobuf?protobuf:module.exports),function(e,n){var t,o=e,r=e.decoder={},i=o.codec,c=o.util,s=0;function a(e,n,t){for(;s<t;){var o=(void 0,{type:7&(a=i.decodeUInt32(f())),tag:a>>3}),r=o.tag,c=n.__tags[r];switch(n[c].option){case"optional":case"required":e[c]=u(n[c].type,n);break;case"repeated":e[c]||(e[c]=[]),l(e[c],n[c].type,n)}}var a;return e}function u(e,n){switch(e){case"uInt32":return i.decodeUInt32(f());case"int32":case"sInt32":return i.decodeSInt32(f());case"float":var o=i.decodeFloat(t,s);return s+=4,o;case"double":var c=i.decodeDouble(t,s);return s+=8,c;case"string":var u=i.decodeUInt32(f()),l=i.decodeStr(t,s,u);return s+=u,l;default:var d=n&&(n.__messages[e]||r.protos["message "+e]);if(d){u=i.decodeUInt32(f());var p={};return a(p,d,s+u),p}}}function l(e,n,t){if(c.isSimpleType(n))for(var o=i.decodeUInt32(f()),r=0;r<o;r++)e.push(u(n));else e.push(u(n,t))}function f(e){var n,o=[],r=s;for(e=e||!1;n=t[r],o.push(n),r++,n>=128;);return e||(s=r),o}r.init=function(e){this.protos=e||{}},r.setProtos=function(e){e&&(this.protos=e)},r.decode=function(e,n){var o=this.protos[e];return t=n,s=0,o?a({},o,t.length):null}}("undefined"!=typeof protobuf?protobuf:module.exports),cc.Pomelo=function(){var e=window.Protocol,n=window.protobuf,t=window.decodeIO_protobuf,o=null,r=null,i=e.Package,c=e.Message,s=window.EventEmitter,a=window.rsa,u=null;"undefined"!=typeof window&&"undefined"!=typeof sys&&sys.localStorage&&(window.localStorage=sys.localStorage);"function"!=typeof Object.create&&(Object.create=function(e){function n(){}return n.prototype=e,new n});window;var l,f=Object.create(s.prototype),d=null,p=0,h={},y={},v={},g={},w={},b={},E={},m=0,_=0,T=0,S=0,P=null,I=null,k=null,A=null,Y=null,N=!1,U=null,O=null,H=0,J=5e3,D={sys:{type:"js-websocket",version:"0.0.1",rsa:{}},user:{}},R=null;f.init=function(e,n){R=n;var t=e.host,o=e.port;Y=e.encode||K,A=e.decode||C;var r="ws://"+t;if(o&&(r+=":"+o),D.user=e.user,e.encrypt){l=!0,a.generate(1024,"10001");var i={rsa_n:a.n.toString(16),rsa_e:a.e};D.sys.rsa=i}k=e.handshakeCallback,j(e,r,n)};var C=f.decode=function(e){var n=c.decode(e);if(!(n.id>0)||(n.route=v[n.id],delete v[n.id],n.route))return n.body=Q(n),n},K=f.encode=function(t,r,i){var s=t?c.TYPE_REQUEST:c.TYPE_NOTIFY;if(n&&E[r])i=n.encode(r,i);else if(o&&o.lookup(r)){i=new(o.build(r))(i).encodeNB()}else i=e.strencode(JSON.stringify(i));var a=0;return g&&g[r]&&(r=g[r],a=1),c.encode(t,s,a,r,i)},j=function(c,s,a){console.log("connect to "+s);var l=(c=c||{}).maxReconnectAttempts||10;if(O=s,window.localStorage&&window.localStorage.getItem("protos")&&0===m){var p=JSON.parse(window.localStorage.getItem("protos"));m=p.version||0,b=p.server||{},E=p.client||{},n&&n.init({encoderProtos:E,decoderProtos:b}),t&&(o=t.loadJson(E),r=t.loadJson(b))}D.sys.protoVersion=m;(d=new WebSocket(s)).binaryType="arraybuffer",d.onopen=function(n){N&&f.emit("reconnect"),x();var t=i.encode(i.TYPE_HANDSHAKE,e.strencode(JSON.stringify(D)));L(t)},d.onmessage=function(e){M(i.decode(e.data),a),T&&(S=Date.now()+T)},d.onerror=function(e){f.emit("io-error",e),console.error("socket error: ",e)},d.onclose=function(e){f.emit("close",e),f.emit("disconnect",e),console.error("socket close: ",JSON.stringify(e)),c.reconnect&&H<l&&(N=!0,H++,U=setTimeout(function(){j(c,O,a)},J),J*=2),d=null,u&&u(),u=null}};f.disconnect=function(e){u=e,d&&(d.disconnect&&d.disconnect(),d.close&&d.close(),console.log("disconnect"),d=null),P&&(clearTimeout(P),P=null),I&&(clearTimeout(I),I=null)};var x=function(){N=!1,J=5e3,H=0,clearTimeout(U)};f.request=function(e,n,t){2===arguments.length&&"function"==typeof n?(t=n,n={}):n=n||{},(e=e||n.route)&&(F(++p,e,n),h[p]=t,v[p]=e)},f.notify=function(e,n){F(0,e,n=n||{})};var F=function(e,n,t){if(l){t=JSON.stringify(t);var o=a.signString(t,"sha256");(t=JSON.parse(t)).__crypto__=o}Y&&(t=Y(e,n,t));var r=i.encode(i.TYPE_DATA,t);L(r)},L=function(e){null!==d&&d.send(e.buffer)},B=function(){var e=S-Date.now();e>100?I=setTimeout(B,e):(console.error("server heartbeat timeout"),f.emit("heartbeat timeout"),f.disconnect())};y[i.TYPE_HANDSHAKE]=function(n){if(501!==(n=JSON.parse(e.strdecode(n))).code)if(200===n.code){V(n);var t=i.encode(i.TYPE_HANDSHAKE_ACK);L(t),R&&R(d)}else f.emit("error","handshake fail");else f.emit("error","client version not fullfill")},y[i.TYPE_HEARTBEAT]=function(e){if(_){var n=i.encode(i.TYPE_HEARTBEAT);I&&(clearTimeout(I),I=null),P||(P=setTimeout(function(){P=null,L(n),S=Date.now()+T,I=setTimeout(B,T)},_))}},y[i.TYPE_DATA]=function(e){var n=e;A&&(n=A(n)),q(f,n)},y[i.TYPE_KICK]=function(n){n=JSON.parse(e.strdecode(n)),f.emit("onKick",n)};var M=function(e){if(Array.isArray(e))for(var n=0;n<e.length;n++){var t=e[n];y[t.type](t.body)}else y[e.type](e.body)},q=function(e,n){if(n.id){var t=h[n.id];delete h[n.id],"function"==typeof t&&t(n.body)}else e.emit(n.route,n.body)},Q=function(t){var o=t.route;if(t.compressRoute){if(!w[o])return{};o=t.route=w[o]}return n&&b[o]?n.decode(o,t.body):r&&r.lookup(o)?r.build(o).decode(t.body):JSON.parse(e.strdecode(t.body))},V=function(e){e.sys&&e.sys.heartbeat?(_=1e3*e.sys.heartbeat,T=2*_):(_=0,T=0),W(e),"function"==typeof k&&k(e.user)},W=function(e){if(e&&e.sys){g=e.sys.dict;var i=e.sys.protos;if(g)for(var c in w={},g=g)w[g[c]]=c;i&&(m=i.version||0,b=i.server||{},E=i.client||{},window.localStorage.setItem("protos",JSON.stringify(i)),n&&n.init({encoderProtos:i.client,decoderProtos:i.server}),t&&(o=t.loadJson(E),r=t.loadJson(b)))}};return f},window.pomelo=new cc.Pomelo;