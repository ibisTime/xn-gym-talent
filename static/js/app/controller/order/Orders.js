define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/CourseCtr',
    'app/interface/GeneralCtr',
    'app/module/scroll'
], function(base, Dict, CourseCtr, GeneralCtr, scroll) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var orderStatus = Dict.get("coachOrderStatus");
    var currentType = 0,
        // status: 0 待付款，1 待接单，2 待上课，3 待填表，4 待下课，5 待评价，6 用户取消，7 私教取消, 8 已完成
        type2Status = {
            "0": "",
            "1": "0",
            "2": "1",
            "3": "2",
            "4": "3",
            "5": "5",
            "6": "8"
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!150x113r";
    var myScroll, rate1, rate2, rate3;

    init();
    function init(){
        initScroll();
        addListener();
        base.showLoading();
        $.when(
            getPageOrders(),
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
    function initScroll() {
        var width = 0;
        var _wrap = $("#am-tabs-bar");
        _wrap.find('.am-tabs-tab').each(function () {
            width += this.clientWidth;
        });
        _wrap.find('.scroll-content').css('width', width + 'px');
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'am-tabs-bar',
            param: {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
    }
    // 分页查询课程
    function getPageOrders(refresh) {
        return CourseCtr.getPageOrders({
            status: type2Status[currentType],
            ...config
        }, refresh)
            .then((data) => {
                hideLoading(currentType);
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtml(item);
                    });
                    $("#content" + currentType)[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll" + currentType).removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content" + currentType).html('<div class="no-data">暂无订单</div>');
                    $("#loadAll" + currentType).addClass("hidden");
                } else {
                    $("#loadAll" + currentType).removeClass("hidden");
                }
                !isEnd && $("#loadAll" + currentType).addClass("hidden");
                canScrolling = true;
            }, () => hideLoading(currentType));
    }
    function buildHtml(item) {
        return `<div class="order-item">
                    <div class="order-item-header">
                        <span>${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <a href="./order.html?code=${item.code}" class="order-item-cont">
                        <div class="am-flexbox am-flexbox-align-top">
                            <div class="order-img">
                                <img src="${base.getAvatar(item.photo, SUFFIX)}"/>
                            </div>
                            <div class="order-name-infos am-flexbox-item">
                                <div class="am-flexbox am-flexbox-dir-column am-flexbox-justify-between am-flexbox-align-top">
                                    <div class="order-inner-content">
                                        <div class="title-cont">
                                            <span class="title">${item.realName}</span>
                                            <div class="order-status">${orderStatus[item.status]}</div>
                                        </div>
                                        <div class="order-infos">
                                            <span class="pdr">${base.formatDate(item.appointDatetime, "MM-dd")} ${item.skDatetime.substr(0, 5)}~${item.xkDatetime.substr(0, 5)}</span><span class="pdr pdl">${item.quantity}人</span><span class="pdl">¥${base.formatMoney(item.amount)}</span>
                                        </div>
                                    </div>
                                    <div class="order-addr">
                                        <span class="t-3dot">${item.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                    ${
                        item.status == "1" || item.status == "2" || item.status == "3"
                            ? `<div class="order-item-footer">
                                    ${
                                        item.status == "1"
                                            ? `<button class="am-button am-button-small taking-order" data-code="${item.code}">接单</button>
                                                <button class="am-button am-button-small cancel-order" data-status="${item.status}" data-code="${item.code}">取消订单</button>`
                                            : item.status == "2"
                                                ? `<button class="am-button am-button-small start-order" data-code="${item.code}">上课</button>
                                                    <button class="am-button am-button-small cancel-order" data-status="${item.status}" data-code="${item.code}">取消订单</button>`
                                                : `<button class="am-button am-button-small end-order" data-code="${item.code}">下课</button>`
                                    }
                                </div>`
                            : ''
                    }
                </div>`;
        // status: 0 待付款，1 待接单，2 待上课，3 待填表，4 待下课，5 待评价，6 用户取消，7 私教取消, 8 已完成
    }

    function addListener(){
        // tabs切换事件
        var _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index();
            if(!_this.hasClass("am-tabs-tab-active")) {
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
                myScroll.myScroll.scrollToElement(_this[0], 200, true);
                // 当前选择查看的订单tab的index
                currentType = index;
                config.start = 1;
                base.showLoading();
                getPageOrders().then(base.hideLoading);
            }
        });
        // 接单
        $("#orderWrapper").on("click", ".taking-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定接单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("接单中...");
                    CourseCtr.takingOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        // 取消订单
        $("#orderWrapper").on("click", ".cancel-order", function() {
            var orderCode = $(this).attr("data-code");
            var _orderStatus = $(this).attr('data-status');
            var str = '确定取消订单吗？';
            if (status != '1') {
                str += `<div style="font-size: 12px;color: #999;padding-top: 4px;">
                  上课前两小时外取消扣${rate1}订单金额，两小时内取消扣${rate2}订单金额，过了上课时间取消扣${rate3}订单金额</div>`;
            }
            base.confirm(str, "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    CourseCtr.cancelOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        // 上课
        $("#orderWrapper").on("click", ".start-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定上课吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("提交中...");
                    CourseCtr.startOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        // 下课
        $("#orderWrapper").on("click", ".end-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定下课吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("提交中...");
                    CourseCtr.endOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true).then(base.hideLoading);
                        });
                }, () => {});
        });

        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageOrders();
            }
        });
    }
    function showLoading() {
        $("#loadingWrap" + currentType).removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap" + currentType).addClass("hidden");
    }
});
