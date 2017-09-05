define([
    'jquery',
    'app/interface/GeneralCtr'
], function ($, GeneralCtr) {
    function initSms(opt){
        this.options = $.extend({}, this.defaultOptions, opt);
        var _self = this;
        $("#" + this.options.id).off("click")
            .on("click", function() {
                _self.options.checkInfo() && _self.handleSendVerifiy();
            });
    }
    initSms.prototype.defaultOptions = {
        id: "getVerification",
        mobile: "mobile",
        checkInfo: function () {
            return $("#" + this.mobile).valid();
        },
        sendCode: '805904'
    };
    initSms.prototype.handleSendVerifiy = function() {
        var verification = $("#" + this.options.id);
        verification.prop("disabled", true);
        GeneralCtr.sendCaptcha(this.options.bizType, $("#" + this.options.mobile).val(), this.options.sendCode)
            .then(() => {
                var i = 60;
                this.timer = window.setInterval(() => {
                    if(i > 0){
                        verification.text(i-- + "s");
                    }else {
                        verification.text("获取验证码").prop("disabled", false);
                        clearInterval(this.timer);
                    }
                }, 1000);
            }, function() {
                this.options.errorFn && this.options.errorFn();
                verification.text("获取验证码").prop("disabled", false);
            });
    }
    return {
        init: function (options) {
            new initSms(options);
        }
    }
});
