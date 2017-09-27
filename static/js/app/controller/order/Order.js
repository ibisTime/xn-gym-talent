define([
    'app/controller/base',
    'app/interface/CourseCtr',
    'app/interface/GeneralCtr',
    'app/module/showInMap',
    'app/util/dict'
], function(base, CourseCtr, GeneralCtr, showInMap, Dict) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("coachOrderStatus");
    var address, rate1, rate2, rate3, status;

    init();
    function init(){
        addListener();
        base.showLoading();
        $.when(
            getOrder(),
            getConfigs()
        ).then(base.hideLoading);
    }
    // 获取违约金比率
    function getConfigs() {
        return $.when(
            GeneralCtr.getBizSysConfig('MWY'),
            GeneralCtr.getBizSysConfig('QMWY'),
            GeneralCtr.getBizSysConfig('SMWY')
        ).then((data1, data2, data3) => {
            rate1 = +data1.cvalue * 100 + "%";
            rate2 = +data2.cvalue * 100 + "%";
            rate3 = +data3.cvalue * 100 + "%";
        });
    }
    function getOrder(refresh) {
        return CourseCtr.getOrder(code, refresh)
            .then((data) => {
                $("#code").text(data.code);
                $("#applyDatetime").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm"));
                // status: 0 待付款，1 待接单，2 待上课，3 待填表，4 待下课，5 待评价，6 用户取消，7 私教取消, 8 已完成
                $("#status").text(orderStatus[data.status]);
                status = data.status;
                address = data.address;
                $("#address").text(address);
                $("#datetime").text(base.formatDate(data.appointDatetime, "yyyy-MM-dd") + " " + data.skDatetime.substr(0, 5) + "~" + data.xkDatetime.substr(0, 5));
                $("#quantity").text(data.quantity);
                $("#mobile").text(data.mobile);
                $("#amount").text(base.formatMoney(data.amount) + "元");
                if(data.coachPenalty) {
                    $("#penalty").text(base.formatMoney(data.coachPenalty) + "元")
                        .closest(".confirm-item").removeClass("hidden");
                }
                $("#applyNote").text(data.applyNote || "无");
                if(refresh) {
                    $(".confirm-btn").find("button").addClass("hidden");
                }
                if(data.status == "1") {
                    $("#cancelOrder, #takingOrder").removeClass("hidden");
                } else if(data.status == "2") {
                    $("#cancelOrder, #startOrder").removeClass("hidden");
                } else if(data.status == 3) {
                    $("#endOrder").removeClass("hidden");
                }
            });
    }
    function addListener(){
        showInMap.addMap();
        // 接单
        $("#takingOrder").on("click", function() {
            base.confirm("确定接单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("接单中...");
                    CourseCtr.takingOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        // 取消
        $("#cancelOrder").on("click", function() {
            var str = '确定取消订单吗？';
            if (status != '1') {
                str += `<div style="font-size: 12px;color: #999;padding-top: 4px;">
                  上课前两小时外取消扣${rate1}订单金额，两小时内取消扣${rate2}订单金额，过了上课时间取消扣${rate3}订单金额</div>`;
            }
            base.confirm(str, "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    CourseCtr.cancelOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        // 上课
        $("#startOrder").on("click", function() {
            base.confirm("确定上课吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("提交中...");
                    CourseCtr.startOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        // 下课
        $("#endOrder").on("click", function() {
            base.confirm("确定下课吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("提交中...");
                    CourseCtr.endOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        $("#address").on("click", function() {
            showInMap.showMapByName(address);
        });
    }
});
