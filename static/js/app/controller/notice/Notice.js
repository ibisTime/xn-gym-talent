define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/util/handlebarsHelpers'
], function(base, GeneralCtr, Handlebars) {
    var _tmpl = __inline('../../ui/notice-item.handlebars');
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;

    init();
    function init() {
		getPageNotice();
        addListener();
    }
    //公告
    function getPageNotice(refresh) {
        base.showLoading();
    	GeneralCtr.getPageSysNotice(config, refresh)
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
                    let ids = [];
                    data.list.forEach((item) => {
                        item.isRead === '0' && ids.push(item.id);
                    });
                    if (ids.length) {
                        GeneralCtr.readNotices(ids);
                    }
                    isEnd && $("#loadAll").removeClass("hidden");
                } else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无公告</li>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, hideLoading);
    }
    function addListener() {
        //下拉加载
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageNotice();
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
