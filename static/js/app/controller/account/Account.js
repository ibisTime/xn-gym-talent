define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/interface/AccountCtr',
    'app/module/setTradePwd'
], function(base, UserCtr, AccountCtr, setTradePwd) {
    var tradepwdFlag = false;
    init();
    function init() {
        base.showLoading();
        $.when(
            getAccount(),
            getUser()
        ).then(base.hideLoading);
    	addListener();
    }
    function getUser() {
        return UserCtr.getUser()
            .then((data) => {
                if(data.tradepwdFlag != "0"){
                    tradepwdFlag = true;
                } else {
                    setTradePwd.addCont({
                        mobile: data.mobile,
                        success: function() {
                            tradepwdFlag = true;
                        }
                    });
                }
            });
    }
    // 获取用户账户
    function getAccount() {
        AccountCtr.getAccount()
            .then((data) => {
                data.forEach((account) => {
                    if(account.currency === "CNY"){
                        $("#amount").text(base.formatMoney(account.amount));
                        $("#inAmount").text(base.formatMoney(account.inAmount));
                        $("#outAmount").text(base.formatMoney(account.outAmount));
                    }
                });
            });
    }

    function addListener() {
        // 提现
        $("#goBtn").click(function() {
            if(tradepwdFlag) {
                location.replace("./withdraw.html");
            } else {
                base.confirm("您还未设置支付密码，无法提现。<br/>点击确认前往设置")
                    .then(() => {
                        setTradePwd.showCont();
                    }, () => {});
            }
        });
    }
});
