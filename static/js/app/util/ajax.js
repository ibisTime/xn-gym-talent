define([
    "jquery",
    'app/util/cookie',
    'app/util/dialog',
    'app/module/loading'
], function($, CookieUtil, dialog, loading) {
    var cache = {};

    function getUrl(code) {
        return "/api";
    }

    function clearSessionUser() {
        CookieUtil.del("userId"); //userId
        CookieUtil.del("token"); //token
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
        return d;
    }
    return {
        get: function(code, json, reload) {
            if (typeof json == "undefined" || typeof json == "boolean") {
                reload = json;
                json = {};
            }
            return this.post(code, json, !!reload);
        },
        post: function(code, json, reload) {
            reload = typeof reload == "undefined" ? true : reload;

            var token = CookieUtil.get("token") || "";

            token && (json["token"] = token);
            json["systemCode"] = SYSTEM_CODE;
            json["companyCode"] = SYSTEM_CODE;

            var sendUrl = getUrl(code);
            var sendParam = {
                code: code,
                json: json
            };
            var cache_url = sendUrl + JSON.stringify(sendParam);
            if (reload) {
                delete cache[code];
            }
            cache[code] = cache[code] || {};
            if (!cache[code][cache_url]) {
                sendParam.json = JSON.stringify(json);
                cache[code][cache_url] = $.ajax({
                    type: 'post',
                    url: sendUrl,
                    data: sendParam
                });
            }
            return cache[code][cache_url].pipe(function(res) {
                if (res.errorCode == "4") {
                    clearSessionUser();
                    sessionStorage.setItem("l-return", location.pathname + location.search);
                    setTimeout(function() {
                        location.replace("../user/login.html");
                    }, 500);
                    var d = showMsg("登录超时");
                    return $.Deferred().reject("登录超时", d);
                }
                if(res.errorCode != "0"){
                    var d = showMsg(res.errorInfo);
                    return $.Deferred().reject(res.errorInfo, d);
                }
                return res.data;
            }).fail(function(error){
                loading.hideLoading();
            });
        }
    };
});
