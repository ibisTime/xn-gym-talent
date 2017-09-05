define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/interface/CourseCtr',
    'app/util/handlebarsHelpers'
], function(base, UserCtr, CourseCtr, Handlebars) {
    var _tmpl = __inline('../../ui/course-list-item.handlebars');
    var config = {
        start: 1,
        limit: 20
    }, isEnd = false, canScrolling = false;

    init();
    function init() {
        base.showLoading();
        UserCtr.getCoachByUserId(base.getUserId())
            .then((data) => {
                config.coachCode = data.code;
                getPageCourse();
            });
        addListener();
    }
    // 私课
    function getPageCourse(refresh) {
    	CourseCtr.getPageCourse(config, refresh)
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
                    config.start++;
    			} else if(config.start == 1) {
                    $("#content").html('<li class="no-data">暂无课程</li>')
                } else {
                    $("#loadAll").removeClass("hidden");
                }
                canScrolling = true;
        	}, hideLoading);
    }
    function addListener() {
        //下拉加载
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageCourse();
            }
        });
        $("#content").on("click", ".edit", function(){
            location.replace("./add-edit.html?code=" + $(this).attr("data-code"));
        });
        $("#content").on("click", ".delete", function(){
            var _me = $(this),
                code = _me.attr("data-code"),
                _li = _me.closest("li");
            base.confirm("确定删除该课程吗")
                .then(() => {
                    base.showLoading("删除中...");
                    CourseCtr.deleteCourse(code)
                        .then((data) => {
                            base.hideLoading();
                            base.showMsg("删除成功");
                            _li.remove();
                        });
                }, () => {});
        });
        $("#addBtn").on("click", function() {
            location.replace('./add-edit.html');
        })
    }

    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
