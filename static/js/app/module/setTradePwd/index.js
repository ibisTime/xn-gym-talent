define([
  'jquery',
  'app/module/validate',
  'app/module/loading',
  'app/interface/userCtr',
  'app/module/smsCaptcha',
  'app/util/dialog'
], function($, Validate, loading, userCtr, smsCaptcha, dialog) {
  var tmpl = __inline("index.html");
  var defaultOpt = {};
  var first = true;

  function _setTradePwd() {
    loading.createLoading("设置中...");
    userCtr.setTradePwd($("#set-trade-pwd-password").val(), $("#set-trade-pwd-smsCaptcha").val())
      .then(function() {
        loading.hideLoading();
        TradePwd.hideCont(defaultOpt.success);
      }, function(msg) {
        defaultOpt.error && defaultOpt.error(msg || "手机号修改失败");
      });
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
  var TradePwd = {
    addCont: function(option) {
      option = option || {};
      defaultOpt = $.extend(defaultOpt, option);
      if (!this.hasCont()) {
        var temp = $(tmpl);
        $("body").append(tmpl);
      }
      var wrap = $("#setTradePwdWrap");
      defaultOpt.title && wrap.find(".right-left-cont-title-name").text(defaultOpt.title);
      var that = this;
      $("#setTradePwdMobile").val(defaultOpt.mobile);
      if (first) {
        $("#set-trade-pwd-back")
          .on("click", function() {
            TradePwd.hideCont(defaultOpt.hideFn);
          });
        wrap.find(".right-left-cont-title")
          .on("touchmove", function(e) {
            e.preventDefault();
          });
        $("#set-trade-pwd-btn")
          .on("click", function() {
            if ($("#set-trade-pwd-form").valid()) {
              _setTradePwd();
            }
          });
        $("#set-trade-pwd-form").validate({
          'rules': {
            "set-trade-pwd-smsCaptcha": {
              sms: true,
              required: true
            },
            "set-trade-pwd-password": {
              required: true,
              maxlength: 16,
              minlength: 6,
              isNotFace: true
            }
          },
          onkeyup: false
        });
        smsCaptcha.init({
          checkInfo: function() {
            if (defaultOpt.mobile) {
              return true;
            }
            _showMsg("还未绑定手机号");
            return false;
          },
          bizType: "805045",
          id: "set-trade-pwd-getVerification",
          mobile: "setTradePwdMobile"
        });
      }

      first = false;
      return this;
    },
    hasCont: function() {
      if (!$("#setTradePwdWrap").length)
        return false
      return true;
    },
    showCont: function(mobile) {
      if (this.hasCont()) {
        defaultOpt.mobile = mobile || defaultOpt.mobile;
        $("#setTradePwdMobile").val(defaultOpt.mobile);
        $("#modelMobile").val(defaultOpt.mobile);
        var wrap = $("#setTradePwdWrap");
        wrap.css("top", $(window).scrollTop() + "px");
        wrap.show().animate({
          left: 0
        }, 200, function() {
          defaultOpt.showFun && defaultOpt.showFun();
        });
      }
      return this;
    },
    hideCont: function(func) {
      if (this.hasCont()) {
        var wrap = $("#setTradePwdWrap");
        wrap.animate({
          left: "100%"
        }, 200, function() {
          wrap.hide();
          func && func();
          $("#set-trade-pwd-smsCaptcha").val("");
          $("#set-trade-pwd-password").val("");
          wrap.find("label.error").remove();
        });
      }
      return this;
    }
  }
  return TradePwd;
});
