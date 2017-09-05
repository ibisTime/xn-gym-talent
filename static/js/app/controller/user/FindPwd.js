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
                newLoginPwd: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                rePwd: {
                    required: true,
                    equalTo: "#newLoginPwd"
                }
            },
            onkeyup: false
        });
        timer = smsCaptcha.init({
            bizType: '805048'
        });
        $("#findBtn").on("click", function() {
            if(_formWrapper.valid()){
                findPwd(_formWrapper.serializeObject());
            }
        });
    }

    function findPwd(param) {
        base.showLoading("修改中...");
        UserCtr.findPwd(param)
            .then((data) => {
                base.hideLoading();
                base.showMsg("密码修改成功");
                setTimeout(() => {
                    location.replace('./login.html');
                }, 500);
            }, () => {
                $("#getVerification").text("获取验证码").prop("disabled", false);
                clearInterval(timer);
            });
    }
});
