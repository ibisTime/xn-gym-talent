define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/util/handlebarsHelpers'
], function(base, UserCtr, Handlebars) {
    var _tmpl = __inline('../../ui/child-member.handlebars');
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;

    init();
    function init() {
		getPageChildren();
        addListener();
    }
    //公告
    function getPageChildren(refresh) {
        base.showLoading();
    	UserCtr.getPageChildren(config, refresh)
            .then(function(data) {
                base.hideLoading();
                hideLoading();
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                }
    			if(data.list.length) {
                    $("#content").append(_tmpl({items: data.list}));
                    isEnd && $("#loadAll").removeClass("hidden");
    			} else if(config.start == 1) {
                    $("#content").html('<div class="no-data">暂无获客</div>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, hideLoading);
    }
    function addListener() {
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageChildren();
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
