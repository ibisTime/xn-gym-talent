define([
    'app/controller/base',
    'app/interface/AccountCtr'
], function(base, AccountCtr) {
    var config = {
        start: 1,
        limit: 20
    }, isEnd = false, canScrolling = false;
    init();
    function init() {
        base.showLoading();
        getAccount();
        addListener();
    }
    // 获取用户账户
    function getAccount() {
        AccountCtr.getAccount()
            .then((data) => {
                data.forEach((account) => {
                    if(account.currency === "CNY"){
                        config.accountNumber = account.accountNumber;
                    }
                });
                getPageFlow();
            });
    }
    function getPageFlow() {
        AccountCtr.getPageFlow(config).then(function(data) {
            base.hideLoading();
            hideLoading();
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            }
            if(data.list.length) {
                $("#content").append(buildHtml(data.list));
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
            } else if(config.start == 1) {
                $("#content").html('<li class="no-data">暂无资金流水</li>')
            } else {
                $("#loadAll").removeClass("hidden");
            }
            canScrolling = true;
        }, hideLoading);
    }
    function buildHtml(data) {
        var html = "";
        data.forEach((item) => {
            var transAmount = +item.transAmount,
                positive = transAmount > 0;
            transAmount = base.formatMoney(transAmount);
            var createDatetime = item.createDatetime,
                day = base.formatDate(createDatetime, "dd日"),
                time = base.formatDate(createDatetime, "hh:mm");

            html += `<div class="flow-item border-bottom-1px">
                <div class="am-flexbox">
                    <div class="flow-datetime">
                        <p class="f-date">${day}</p>
                        <p class="f-time">${time}</p>
                    </div>
                    <div class="flow-icon">
                        <i class="${positive ? 'receive-icon' : 'pay-icon'}"></i>
                    </div>
                    <div class="flow-content am-flexbox-item">
                        ${
                            positive
                                ? `<p class="f-transAmount f-trans-red">+${transAmount}</p>`
                                : `<p class="f-transAmount f-trans-blue">${transAmount}</p>`
                        }
                        <p class="flow-remark">${item.bizNote}</p>
                    </div>
                </div>
            </div>`;
        });
        return html;
    }
    function addListener() {
        //下拉加载
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageFlow();
            }
        });
    }
    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
