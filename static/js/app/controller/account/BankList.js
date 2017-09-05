define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/module/addOrEditBankCard',
    'app/util/handlebarsHelpers'
], function(base, UserCtr, addOrEditBankCard, Handlebars) {
    var _tmpl = __inline('../../ui/bank-item.handlebars');
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;

    init();
    function init() {
		getPageBankCard();
        addListener();
    }
    //公告
    function getPageBankCard(refresh) {
        base.showLoading();
    	UserCtr.getPageBankCard(config, refresh)
            .then(function(data) {
                base.hideLoading();
                hideLoading();
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(data.list.length) {
                    $("#content")[refresh ? "html" : "append"](_tmpl({items: data.list}));
                    isEnd && $("#loadAll").removeClass("hidden");
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无银行卡</li>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, hideLoading);
    }
    function addListener() {
        addOrEditBankCard.addCont({
            userId: base.getUserId(),
            success: function() {
                config.start = 1;
                getPageBankCard(true);
            }
        });
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageBankCard();
            }
        });
        $("#content").on("click", "li", function() {
            addOrEditBankCard.showCont({
                code: $(this).attr("data-code")
            });
        });
    }
    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
