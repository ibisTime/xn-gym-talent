define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/AccountCtr',
    'app/module/alertModal'
], function(base, GeneralCtr, UserCtr, AccountCtr, alertModal) {
    const PASSING = 0, PASS = 1, UNPASS = 2, UNAPPLY = -1;
    // 审核状态
    var passStatus = UNAPPLY;
    init();
    function init() {
        base.showLoading();
    	$.when(
            getCoachByUserId(),
            getAccount(),
    		getNotice()
    	).then(base.hideLoading);
    	addListener();
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
                // 0待审批，1 审批通过，2 审批不通过
                if(data.status == PASSING) {
                    alertModal.showCont("您的资料还在审批中，请耐心等待");
                } else if(data.status == UNPASS) {
                    alertModal.showCont("非常抱歉，你的资料未通过审核。请修改资料后，重新提交申请", () => {
                        location.href = "./user/edit.html?code=1";
                    });
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
        // 私课管理
        $("#skgl").click(function() {
            if(passStatus == PASS){
                location.href = "./course/list.html";
            } else {
                showConfirm();
            }
        });
        // 形象展示
        $("#xxzs").click(function() {
            if(passStatus == PASS){
                location.href = "./user/edit.html";
            } else {
                showConfirm();
            }
        });
        // 接单管理
        $("#jdgl").click(function() {
            if(passStatus == PASS){
                location.href = "./order/orders.html";
            } else {
                showConfirm();
            }
        });
        // 结算管理
        $("#jsgl").click(function() {
            if(passStatus == PASS){
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
    //公告
    function getNotice() {
    	return GeneralCtr.getPageSysNotice({start: 1, limit: 1})
            .then(function(data) {
    			if(data.list.length){
    				$("#noticeWrap").html(`
                        <a href="../notice/notice.html" class="am-flexbox am-flexbox-justify-between">
                            <div class="am-flexbox am-flexbox-item">
                                <i class="notice-icon"></i>
                                <span class="am-flexbox-item t-3dot">${data.list[0].smsTitle}</span>
                            </div>
                            <i class="right-arrow"></i>
                        </a>`).removeClass("hidden");
    			}
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
