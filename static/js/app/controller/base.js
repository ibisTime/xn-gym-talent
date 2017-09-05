define([
    'app/util/dialog',
    'app/util/cookie',
    'app/module/loading'
], function(dialog, CookieUtil, loading) {

    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function() {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };
    var Base = {
        // simple encrypt information with ***
        encodeInfo: function(info, headCount, tailCount, space) {
            headCount = headCount || 0;
            tailCount = tailCount || 0;
            info = info.trim();
            var header = info.slice(0, headCount),
                len = info.length,
                tailer = info.slice(len - tailCount),
                mask = '**************************************************', // allow this length
                maskLen = len - headCount - tailCount;
            if (space) {
                mask = '**** **** **** **** **** **** **** **** **** **** **** ****';
            }
            return maskLen > 0
                ? (header + mask.substring(0, maskLen + (space
                    ? maskLen / 4
                    : 0)) + (space
                    ? ' '
                    : '') + tailer)
                : info;
        },
        formatDate: function(date, format) {
            if (!date)
                return "--";

            return new Date(date).format(format);
        },
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        showMsg: function(msg, time) {
            var d = dialog({content: msg, quickClose: true});
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 1500);
        },

        //判断密码强度
        calculateSecurityLevel: function(password) {
            var strength_L = 0;
            var strength_M = 0;
            var strength_H = 0;

            for (var i = 0; i < password.length; i++) {
                var code = password.charCodeAt(i);
                // 数字
                if (code >= 48 && code <= 57) {
                    strength_L++;
                    // 小写字母 大写字母
                } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                    strength_M++;
                    // 特殊符号
                } else if ((code >= 32 && code <= 47) || (code >= 58 && code <= 64) || (code >= 94 && code <= 96) || (code >= 123 && code <= 126)) {
                    strength_H++;
                }
            }
            // 弱
            if ((strength_L == 0 && strength_M == 0) || (strength_L == 0 && strength_H == 0) || (strength_M == 0 && strength_H == 0)) {
                return "1";
            }
            // 强
            if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
                return "3";
            }
            // 中
            return "2";
        },
        getUserId: function() {
            return CookieUtil.get("userId") || "";
        },
        setSessionUser: function(data) {
            CookieUtil.set("userId", data.userId);
            CookieUtil.set("token", data.token);
        },
        clearSessionUser: function() {
            CookieUtil.del("userId"); //userId
            CookieUtil.del("token"); //token
        },
        isLogin: function() {
            return !!Base.getUserId();
        },
        getDomain: function() {
            return location.origin;
        },
        goLogin: function() {
            location.href = "../user/login.html";
        },
        throttle: function(method, context, t) {
            var tt = t || 100;
            clearTimeout(method.tId);
            method.tId = setTimeout(function() {
                method.call(context);
            }, tt)
        },
        // 获取图片
        getImg: function(pic, suffix) {
            if (!pic) {
                return "";
            }
            if (pic) {
                pic = pic.split(/\|\|/)[0];
            }
            if (!/^http/i.test(pic)) {
                suffix = suffix || '?imageMogr2/auto-orient';
                pic = PIC_PREFIX + pic + suffix;
            }
            return pic
        },
        getAvatar: function(pic) {
            if(!pic) {
                return "/static/images/avatar@2x.png";
            }
            return Base.getImg(pic, "?imageMogr2/auto-orient/thumbnail/!200x200r");
        },
        formatMoney: function(s, t) {
            if (!$.isNumeric(s))
                return "--";
            s = (s / 1000).toString();
            s = s.replace(/(\.\d\d)\d+/ig, "$1");
            return parseFloat(s).toFixed(t || 2);
        },
        // 模糊银行卡
        getBankCard: function(card) {
            if (!card)
                return "";
            if (card.length == 16) {
                card = "**** **** **** " + card.substr(12);
            } else if (card.length == 19) {
                card = "**** **** **** **** " + card.substr(16);
            }
            return card;
        },
        getDictListValue: function(dkey, arrayData) { //类型
            for (var i = 0; i < arrayData.length; i++) {
                if (dkey == arrayData[i].dkey) {
                    return arrayData[i].dvalue;
                }
            }
        },
        //判断终端
        getUserBrowser: function() {
            var browser = {
                versions: function() {
                    var u = navigator.userAgent,
                        app = navigator.appVersion;
                    return { //移动终端浏览器版本信息
                        trident: u.indexOf('Trident') > -1, //IE内核
                        presto: u.indexOf('Presto') > -1, //opera内核
                        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                        mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                        iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                        iPad: u.indexOf('iPad') > -1, //是否iPad
                        webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                    };
                }(),
                language: (navigator.browserLanguage || navigator.language).toLowerCase()
            }

            if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) { //ios
                return true;
            } else if (browser.versions.android) { //android
                return false;
            }
        },
        // 确认框
        confirm: function(msg, cancelValue = "取消", okValue = "确认") {
            return (new Promise(function(resolve, reject) {
                var d = dialog({
                    content: msg,
                    ok: function() {
                        var that = this;
                        setTimeout(function() {
                            that.close().remove();
                        }, 1000);
                        resolve();
                        return true;
                    },
                    cancel: function() {
                        reject();
                        return true;
                    },
                    cancelValue: cancelValue,
                    okValue: okValue
                });
                d.showModal();
            }));

        },
        // 显示loading
        showLoading: function(msg, hasBottom) {
            loading.createLoading(msg, hasBottom);
        },
        // 隐藏loading
        hideLoading: function() {
            loading.hideLoading();
        },
        // 根据文本和图片生成html
        getDescription: function(description, descPics) {
            var pic_html = "";
            descPics.forEach(function(pic) {
                pic_html += `<img src="${PIC_PREFIX + pic}"/>`;
            });
            description = description.replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
            description = Base.encode(description);
            description += pic_html;
            return description;
        },
        encode: function(str) {
            if (!str || str.length === 0) {
                return '';
            }
            var s = '';
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/<(?=[^o][^)])/g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/\"/g, "&quot;");
            s = s.replace(/\n/g, "<br/>");
            return s;
        },
        decode: function(str) {
            if (!str || str.length === 0) {
                return '';
            }
            var s = '';
            s = str.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&quot;/g, "\"");
            s = s.replace(/<br\/>/g, "\n");
            return s;
        }
    };

    return Base;
});
