define([
    'jquery',
    'app/util/dialog'
], function ($, dialog) {
    var tmpl = __inline("index.html");
    var defaultOpt = {
        title: "地址",
        lng: '120.21937542',
        lat: '30.25924446'
    }
    var css = __inline("index.css");
    var first = true, map;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function _showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, time || 1500);
    }
    return {
        addMap: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasMap()){
                var temp = $(tmpl);
                temp.find(".right-left-cont-title-name").text(defaultOpt.title);
                $("body").append(temp);
            }
            var wrap = $("#J_OnePointMapWrapper");
            wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
            var that = this;
            wrap.find(".right-left-cont-back").on("click", function(){
                that.hideMap();
            });
            wrap.find(".right-left-cont-title").on("touchmove", function(e){
                e.preventDefault();
            })
            return this;
        },
        hasMap: function(){
            var mapCont = $("#J_OnePointMapWrapper");
            if(!mapCont.length)
                return false
            return true;
        },
        showMap: function (){
            if(this.hasMap()){
                var mapCont = $("#J_OnePointMapWrapper");
                // mapCont.fadeIn(100);
                mapCont.css("top", $(window).scrollTop()+"px");
                mapCont.show().animate({
                    left: 0
                }, 200);
                if(first){
                    var map = new BMap.Map("J_OnePointMapCont");
                    var point = new BMap.Point(defaultOpt.lng, defaultOpt.lat);
                    map.centerAndZoom(point, 12);
                    var marker = new BMap.Marker(point);// 创建标注
                    map.addOverlay(marker);             // 将标注添加到地图中
                    //marker.disableDragging();           // 不可拖拽
                    map.enableScrollWheelZoom(true);
                    first = false;
                }

            }
            return this;
        },
        showMapByName: function (name) {
            if(this.hasMap()){
                var mapCont = $("#J_OnePointMapWrapper");
                // mapCont.fadeIn(100);
                mapCont.css("top", $(window).scrollTop()+"px");
                mapCont.show().animate({
                    left: 0
                }, 200);
                if(first){
                    map = new BMap.Map("J_OnePointMapCont");
                    map.enableScrollWheelZoom(true);
                    first = false;
                }
                var that = this;
                map.clearOverlays();
                function myFun() {
                    var result = local.getResults().getPoi(0);
                    if(!result){
                        _showMsg("定位失败");
                        return;
                    }
                    var pp = result.point; //获取第一个智能搜索的结果
                    var point = pp;
                    map.centerAndZoom(pp, 18);
                    map.addOverlay(new BMap.Marker(pp)); //添加标注

                }
                var local = new BMap.LocalSearch(map, { //智能搜索
                    onSearchComplete: myFun
                });
                local.search(name);
            }
            return this;
        },
        hideMap: function (option){
            if(this.hasMap()){
                var mapCont = $("#J_OnePointMapWrapper");
                // mapCont.fadeOut(100);
                mapCont.animate({
                    left: "100%"
                }, 200, function () {
                    mapCont.hide();
                });
            }
            return this;
        }
    }
});
