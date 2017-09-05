define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/module/validate'
], function(base, UserCtr, Validate) {
    var timer;

    init();

    function init(){
    	addListener();
    }


    function addListener(){
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                loginName: {
                    required: true,
                    mobile: true
                },
                loginPwd: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                }
            },
            onkeyup: false
        });
        $("#loginBtn").on("click", function() {
            if(_formWrapper.valid()){
                login(_formWrapper.serializeObject());
            }
        });
    }

    function login(param) {
        base.showLoading("登录中...");
        UserCtr.login(param)
            .then((data) => {
                base.hideLoading();
                base.setSessionUser(data);
                location.href = "../index.html";
            });
    }
});
