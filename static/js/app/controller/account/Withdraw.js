define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/AccountCtr',
    'app/module/addOrEditBankCard',
    'app/module/validate'
], function(base, GeneralCtr, AccountCtr, addOrEditBankCard, Validate) {
    var remainAmount = 0, rate;

    init();
    function init() {
        base.showLoading();
        $.when(
            getBankCardList(),
            getRules(),
            getAccount()
        ).then(() => {
            base.hideLoading();
            addListener();
        });
    }
    // 获取提现规则
    function getRules() {
        return GeneralCtr.getPageAccountSysConfig()
            .then((data) => {
                data.list.forEach((rule) => {
                    if(rule.ckey == "BUSERMONTIMES") {
                        $("#rechargeTimes").text(rule.cvalue);
                    } else if(rule.ckey == "BUSERQXBS") {
                        $("#times").text(rule.cvalue);
                    } else if(rule.ckey == "BUSERQXSX") {
                        $("#toAccount").text(rule.cvalue);
                    } else if(rule.ckey == "QXDBZDJE") {
                        $("#maxAmount").text(rule.cvalue);
                    } else if(rule.ckey == "BUSERQXFL") {   // 提现费率
                        rate = +rule.cvalue;
                    }
                });
            });
    }
    // 获取银行卡列表
    function getBankCardList(){
        AccountCtr.getBankCardList()
            .then(function(data){
                base.hideLoading();
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<option data-name="${item.bankName}" value="${item.bankcardNumber}">${item.bankcardNumber}</option>`;
                    });
                    $("#payCardNo").html(html);
                }else{
                    doNoBankCard();
                }
            });
    }
    // 用户还未绑定银行卡的处理方式
    function doNoBankCard() {
        var _payCardNo = $("#payCardNo"),
            _noCard = $("#noCard");
        addOrEditBankCard.addCont({
            userId: base.getUserId(),
            success: function(bankcardNumber, bankName) {
                _payCardNo.html(`<option data-name="${bankName}" value="${bankcardNumber}">${bankcardNumber}</option>`)
                    .valid();
                _noCard.addClass("hidden");
            }
        });
        _noCard.removeClass("hidden").on("click", function() {
            addOrEditBankCard.showCont();
        });
    }
    // 获取用户账户
    function getAccount() {
        AccountCtr.getAccount()
            .then((data) => {
                data.forEach((account) => {
                    if(account.currency === "CNY"){
                        $("#accountNumber").val(account.accountNumber);
                        remainAmount = +account.amount;
                        $("#remainAmount").text(base.formatMoney(account.amount));
                    }
                });
            });
    }
    function addListener() {
        var _withDrawForm = $("#withDrawForm");
        _withDrawForm.validate({
            'rules': {
                amount: {
                    required: true,
                    ltR: true,
                    amount: true
                },
                payCardNo: {
                    required: true
                },
                tradePwd: {
                    required: true,
                    isNotFace: true,
                    minlength: 6,
                    maxlength: 20
                }
            },
            onkeyup: false
        });
        // 提现
        $("#submitBtn").click(function() {
            if (_withDrawForm.valid()) {
                base.showLoading();
                doWithDraw(_withDrawForm.serializeObject());
            }
        });
        // 计算手续费
        $("#amount").on("keyup", function() {
            var value = this.value, amount = 0;
            if($.isNumeric(value)) {
                amount = value * 1000 * rate;
            }
            $("#fee").text(base.formatMoney(amount) + "元");
        });
        $.validator.addMethod("ltR", function(value, element) {
            value = +value;
            if(value * 1000 > remainAmount) {
                return false;
            }
            return true;
        }, '必须小于可用余额');
    }
    // 提现
    function doWithDraw(param) {
        // param.remainAmount = "";
        param.payCardInfo = $("#payCardNo").find("option:selected").attr("data-name");
        param.amount = param.amount * 1000;
        param.applyNote = base.getUserId() + "用户取现";
        AccountCtr.withDraw(param).then(function() {
            base.showMsg("提交成功");
            setTimeout(function() {
                location.replace('./account.html');
            }, 500);
        });
    }
});
