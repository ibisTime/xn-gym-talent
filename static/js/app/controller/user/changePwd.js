define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/UserCtr'
], function(base, Validate, UserCtr) {
    init();
    function init() {
        addListeners();
    }
    function addListeners() {
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                "oldLoginPwd": {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                "newLoginPwd": {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                "rePwd": {
                    required: true,
                    equalTo: "#newLoginPwd"
                }
            },
            onkeyup: false
        });
        $("#setPwd").on("click", function() {
            if(_formWrapper.valid()){
                changePwd(_formWrapper.serializeObject());
            }
        });
    }
    // 修改密码
    function changePwd(param) {
        base.showLoading("设置中...");
        UserCtr.changePwd(param)
            .then(() => {
                base.hideLoading();
                base.showMsg("密码修改成功！");
                setTimeout(function() {
                    history.back();
                }, 500);
            });
    }
});
