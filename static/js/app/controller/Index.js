define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr',
    'app/module/alertModal'
], function(base, UserCtr, AccountCtr, GeneralCtr, alertModal) {
    const PASSING = 0, PASS = 1, UNPASS = 2, UNAPPLY = -1, ON_SHELF = 3, OFF_SHELF = 4;
    // 审核状态
    var passStatus = UNAPPLY;
    init();
    function init() {
        base.showLoading();
      	$.when(
            getCoachByUserId(),
            getAccount()
      	).then(base.hideLoading);
        getUnReadCount();
        addListener();
    }
    function getUnReadCount() {
        GeneralCtr.getUnReadNoticeCount().then((data) => {
            if (+data > 0) {
                $("#noRead").html(`<span class="am-badge am-badge-not-a-wrapper"><sup class="am-badge-text">${data}</sup></span>`);
            } else {
                $("#noRead").empty();
            }
            setTimeout(getUnReadCount, 3000);
        });
    }
    // 获取用户账户
    function getAccount() {
        return AccountCtr.getAccount()
            .then((data) => {
                data.forEach((account) => {
                    if(account.currency === "CNY") {
                        $("#amount").text(base.formatMoney(account.amount));
                    }
                });
            });
    }
    // 根据userId查询教练
    function getCoachByUserId() {
        return UserCtr.getCoachByUserId(base.getUserId())
            .then((data) => {
                $("#avatar").attr("src", base.getAvatar(data.pic));
                passStatus = data.status;
                // 0待审批，1 审批通过，2 审批不通过, 3 已上架, 4 已下架
                if(data.status == PASSING) {
                    alertModal.showCont("您的资料还在审批中，请耐心等待");
                } else if(data.status == UNPASS) {
                    alertModal.showCont("非常抱歉，你的资料未通过审核。请修改资料后，重新提交申请", () => {
                        location.href = "./user/edit.html?code=1";
                    });
                } else if (data.status == OFF_SHELF) {
                    alertModal.showCont("您已经被平台下架");
                }
            }, (error, d) => {
                d && d.close();
                $("#avatar").attr("src", base.getAvatar());
                base.confirm("您需要先完善个人资料并在通过审核后，<br/>才可以使用本系统")
                    .then(() => {
                        location.href = "./user/apply.html";
                    }, () => {});
            });
    }

    function addListener() {
        alertModal.addCont();
        $("#goNotice").click(function() {
            location.href = './notice/notice.html';
        });
        $("#goActivity").click(function() {
            location.href = C_URL + '/activity/activities.html';
        });
        // 私课管理
        $("#skgl").click(function() {
            if(passStatus == PASS || passStatus == ON_SHELF || passStatus == OFF_SHELF){
                location.href = "./course/list.html";
            } else {
                showConfirm();
            }
        });
        // 形象展示
        $("#xxzs").click(function() {
            if(passStatus == PASS || passStatus == ON_SHELF || passStatus == OFF_SHELF){
                location.href = "./user/edit.html";
            } else {
                showConfirm();
            }
        });
        // 接单管理
        $("#jdgl").click(function() {
            if(passStatus == PASS || passStatus == ON_SHELF || passStatus == OFF_SHELF){
                location.href = "./order/orders.html";
            } else {
                showConfirm();
            }
        });
        // 结算管理
        $("#jsgl").click(function() {
            if(passStatus == PASS || passStatus == ON_SHELF || passStatus == OFF_SHELF){
                location.href = "./account/account.html";
            } else {
                showConfirm();
            }
        });
        // 获客
        $("#hkbtn").click(function(e) {
            e.stopPropagation();
            location.href = "./invitation/invitation.html";
        });
        // 用户中心
        $("#goSet").click(function() {
            location.href = "./user/set.html";
        });
        // 资金流水
        $("#amount").click(function() {
            location.href = "./account/flow.html";
        });
    }

    // 根据状态显示提示信息
    function showConfirm() {
        // 未申请
        if(passStatus == UNAPPLY) {
            base.confirm("您需要先完善个人资料并在通过审核后，<br/>才可以使用本系统")
                .then(() => {
                    location.href = "./user/apply.html";
                }, () => {});
        // 审核中
        }else if(passStatus == PASSING) {
            alertModal.showCont("您的资料还在审批中，请耐心等待");
        // 未通过审核
        }else if(passStatus == UNPASS) {
            alertModal.showCont("非常抱歉，你的资料未通过审核。请修改资料后，重新提交申请", () => {
                location.href = "./user/edit.html?code=1";
            });
        }
    }
});
