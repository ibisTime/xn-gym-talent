define([
    'jquery',
    'app/util/dialog'
], function($, dialog) {
    var tmpl = __inline("index.html");
    var defaultOpt = {
        title: "选择地点",
        lng: '',
        lat: ''
    };
    var css = __inline("index.css");
    var myValue, point, map, transit;
    var isShow = false;

    init();

    function init() {
        $("head").append('<style>' + css + '</style>');
    }

    function addListener() {
        var wrap = $("#J_SearchMapWrapper");
        wrap.find(".show-one-point-map-title-name").text(defaultOpt.title);
        var that = this;
        $("#search-map-back").on("click", function() {
            that.hideMap();
        });
        wrap.find(".show-one-point-map-title").on("touchmove", function(e) {
            e.preventDefault();
        });
        $("#J_SearchMapBtn").on("click", function(e) {
            if (!point) {
                showMsg("未选择地点");
                return;
            }
            Map.hideMap(defaultOpt.success);
        });
        $("#search-map-icon").on("click", function(e) {
            var _input = $("#J_SearchMapInput");
            var val = _input.val() || _input.attr('placeholder');
            if (!val || val.trim() == "") {
                return;
            }
            myValue = val;
            setPlace();
        })
    }

    function showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, time || 1500);
    }

    function setPlace() {
        map.clearOverlays(); //清除地图上所有覆盖物
        function myFun() {
            var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
            point = pp;
            map.centerAndZoom(pp, 18);
            map.addOverlay(new BMap.Marker(pp)); //添加标注

        }
        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(myValue);
    }

    function setShowPlace() {
        if(point){
            map.clearOverlays();
            map.centerAndZoom(point, 18);
            map.addOverlay(new BMap.Marker(point)); //添加标注
            $("#J_SearchMapInput").val(myValue);
        }
    }

    function searchComplete(results) {
        if (transit.getStatus() != BMAP_STATUS_SUCCESS) {
            if (defaultOpt.calcError) {
                defaultOpt.calcError(transit.getStatus());
            }
            return;
        }
        var plan = results.getPlan(0);
        defaultOpt.calcSuccess && defaultOpt.calcSuccess(plan.dg);
    }
    var Map = {
        addMap: function(option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if (!this.hasMap()) {
                var temp = $(tmpl);
                temp.find(".show-one-point-map-title-name").text(defaultOpt.title);
                $("body").append(tmpl);
                addListener.call(this);

                map = new BMap.Map("J_SearchMapCont");
                if (defaultOpt.initInDW) {
                    var _loading = $('#moduleLoadingWrapper');
                    _loading.show();
                    var geolocation = new BMap.Geolocation();
                    geolocation.getCurrentPosition(function(r) {
                        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                            var geoc = new BMap.Geocoder();
                            geoc.getLocation(r.point, function(rs){
                                _loading.hide();
                                var po = new BMap.Point(r.point);
                                map.centerAndZoom(po, 12);
                                var mk = new BMap.Marker(r.point);
                                map.addOverlay(mk);
                                map.panTo(r.point);
                                point = r.point;
                                myValue = rs.address;
                                isShow && $("#J_SearchMapInput").val(myValue);
                            });
                        } else {}
                    },{enableHighAccuracy: true})
                }

                map.enableScrollWheelZoom(true);


                var ac = new BMap.Autocomplete({ //建立一个自动完成的对象
                    "input": "J_SearchMapInput",
                    "location": map
                });
                ac.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
                    var _value = e.item.value;
                    myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                    setPlace();
                });

                if (defaultOpt.initAddr) {
                    myValue = defaultOpt.initAddr;
                    isShow && $("#J_SearchMapInput").val(myValue);
                    setPlace();
                }
            }
            return this;
        },
        hasMap: function() {
            if (!$("#J_SearchMapWrapper").length)
                return false
            return true;
        },
        showMap: function(option) {
            if (this.hasMap()) {
                isShow = true;
                option = option || {};
                defaultOpt.success = option.success;
                if (option.text) {
                    point = new BMap.Point(option.point.lng, option.point.lat);
                    myValue = option.text;
                    setShowPlace();
                } else {
                    if (myValue && !$("#J_SearchMapInput").val()) {
                        $("#J_SearchMapInput").val(myValue);
                    }
                }
                var mapCont = $("#J_SearchMapWrapper");
                mapCont.css("top", $(window).scrollTop() + "px");
                mapCont.show().animate({
                    left: 0
                }, 200);
            }
            return this;
        },
        hideMap: function(fnc) {
            if (this.hasMap()) {
                isShow = false;
                var mapCont = $("#J_SearchMapWrapper");
                // mapCont.fadeOut(100);
                mapCont.animate({
                    left: "100%"
                }, 200, function() {
                    mapCont.hide();
                    fnc && fnc(point, myValue);
                });
            }
            return this;
        },
        calculatePointDistance: function(point1, point2, mid, success, error) { //start,end,mid:array
            defaultOpt.calcError = error;
            defaultOpt.calcSuccess = success;
            var p1 = new BMap.Point(point1.lng, point1.lat);
            var p2 = new BMap.Point(point2.lng, point2.lat);
            var p3 = [];
            $.each(mid, function(i, m) {
                p3.push(new BMap.Point(m.lng, m.lat));
            });
            transit = new BMap.DrivingRoute(map, {
                onSearchComplete: searchComplete
            });
            transit.search(p1, p2, {
                waypoints: p3
            });
        }
    }
    return Map;
});
