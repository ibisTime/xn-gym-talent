define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/module/validate',
    'app/module/smsCaptcha'
], function(base, UserCtr, Validate, smsCaptcha) {
    var timer;
    var userReferee = base.getUrlParam("userReferee");

    init();

    function init(){
    	addListener();
    }


    function addListener(){
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                mobile: {
                    required: true,
                    mobile: true
                },
                smsCaptcha: {
                    required: true,
                    "sms": true
                },
                loginPwd: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                rePwd: {
                    required: true,
                    equalTo: "#loginPwd"
                }
            },
            onkeyup: false
        });
        timer = smsCaptcha.init({
            bizType: '805041'
        });
        $("#registerBtn").on("click", function() {
            if(_formWrapper.valid()){
                register(_formWrapper.serializeObject());
            }
        });
    }

    function register(param) {
        base.showLoading("注册中...");
        if(userReferee) {
            param.userReferee = userReferee;
        }
        UserCtr.register(param)
            .then((data) => {
                base.hideLoading();
                base.setSessionUser(data);
                location.href = "../index.html";
            }, () => {
                $("#getVerification").text("获取验证码").prop("disabled", false);
                clearInterval(timer);
            });
    }
});
