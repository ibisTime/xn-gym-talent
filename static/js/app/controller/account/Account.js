define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/interface/AccountCtr',
    'app/module/setTradePwd'
], function(base, UserCtr, AccountCtr, setTradePwd) {
    var tradepwdFlag = false;
    var count = 3;

    init();
    function init() {
        base.showLoading();
        getAccount();
        getUser();
        addListener();
    }
    function getUser() {
        return UserCtr.getUser()
            .then((data) => {
                if (!--count) {
                    base.hideLoading();
                }
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
                if (!--count) {
                    base.hideLoading();
                }
                data.forEach((account) => {
                    if(account.currency === "CNY"){
                        $("#amount").text(base.formatMoney(account.amount));
                        getInOutAmount(account.accountNumber);
                    }
                });
            });
    }

    function getInOutAmount(accountNumber) {
        return AccountCtr.getInOutAmount(accountNumber).then((data) => {
            if (!--count) {
                base.hideLoading();
            }
            $("#inAmount").text(base.formatMoney(data.inAmount));
            $("#outAmount").text(base.formatMoney(data.withdrawAmount));
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
