

(function() {
    var createStyle = function() {
        return ".cocosLoading{position:absolute;margin:-30px -60px;padding:0;top:50%;left:50%}" + ".cocosLoading ul{margin:0;padding:0;}" + ".cocosLoading span{color:#FF0000;text-align:center;display:block;}" + ".cocosLoading li{list-style:none;float:left;border-radius:15px;width:15px;height:15px;background:#FFF;margin:5px 0 0 10px}" + ".cocosLoading li .ball,.cocosLoading li .unball{background-color:#2187e7;background-image:-moz-linear-gradient(90deg,#2187e7 25%,#a0eaff);background-image:-webkit-linear-gradient(90deg,#2187e7 25%,#a0eaff);width:15px;height:15px;border-radius:50px}" + ".cocosLoading li .ball{transform:scale(0);-moz-transform:scale(0);-webkit-transform:scale(0);animation:showDot 1s linear forwards;-moz-animation:showDot 1s linear forwards;-webkit-animation:showDot 1s linear forwards}" + ".cocosLoading li .unball{transform:scale(0);-moz-transform:scale(0);-webkit-transform:scale(0);animation:hideDot 1s linear forwards;-moz-animation:hideDot 1s linear forwards;-webkit-animation:hideDot 1s linear forwards}" + "@keyframes showDot{0%{transform:scale(0,0)}100%{transform:scale(0,0)}}" + "@-moz-keyframes showDot{0%{-moz-transform:scale(0,0)}100%{-moz-transform:scale(0,0)}}" + "@-webkit-keyframes showDot{0%{-webkit-transform:scale(0,0)}100%{-webkit-transform:scale(0,0)}}" + "@keyframes hideDot{0%{transform:scale(0,0)}100%{transform:scale(0,0)}}" + "@-moz-keyframes hideDot{0%{-moz-transform:scale(0,0)}100%{-moz-transform:scale(0,0)}}" + "@-webkit-keyframes hideDot{0%{-webkit-transform:scale(0,0)}100%{-webkit-transform:scale(0,0)}}"
    };
    var createDom = function() {
        id = "cocosLoading";
        var imageWidth = 310;
        var imageHeight = 303;


        var div = document.createElement("div");
        div.id = id;

        var width = document.body.scrollWidth;
        var height = document.body.scrollHeight;


        var img = document.createElement("img");
        img.setAttribute("src", "res/p_f_00.png");
        img.style.position = "absolute";

        div.appendChild(img);

        var realLeft = (width-imageWidth)/2;
        var realTop = (height-imageHeight)/2;
        img.style.paddingLeft = realLeft+'px';
        img.style.paddingTop = realTop+'px';
        document.getElementById("cocosLoading").appendChild(div);

    };

    (function() {

        createDom();

    })()
})();