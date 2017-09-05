define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/module/qiniu',
    'app/module/validate'
], function(base, GeneralCtr, UserCtr, qiniu, Validate) {
    var code, coachLabel, status;
    var SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";
    init();
    function init(){
        base.showLoading();
        $.when(
            initUpload(),
            getLabelList(),
            getCoachByUserId()
        ).then(base.hideLoading);
    	addListener();
    }
    var count = 2;
    // 获取标签数据字典
    function getLabelList() {
        return GeneralCtr.getDictList("label_kind")
            .then((data) => {
                var html = "";
                data.forEach((label) => {
                    html += `<div class="check-item" data-label="${label.dkey}">
                                <i class="chose-icon"></i><label>${label.dvalue}</label>
                            </div>`
                });
                $("#labelWrapper").html(html);
                if(!--count) {
                    addLabelData();
                }
            });
    }
    // 当label的数据字典 和 coach 的数据都获取到了之后，再把值添加到页面中
    function addLabelData() {
        var _labelWrapper = $("#labelWrapper");
        var labels = coachLabel.split("||");
        labels.forEach((label) => {
            _labelWrapper.find("[data-label=" + label + "]").addClass("active");
        });
    }
    // 初始化upload
    function initUpload() {
        return qiniu.getQiniuToken()
            .then((data) => {
                initBanner(data.uploadToken);
                initDesc(data.uploadToken);
                initAvatar(data.uploadToken);
            });
    }
    // 根据userId查询教练
    function getCoachByUserId() {
        return UserCtr.getCoachByUserId(base.getUserId())
            .then((data) => {
                code = data.code;
                status = data.status;
                if(status == "2" && data.remark) {
                    $("#remark").text(data.remark).parent().removeClass("hidden");
                }
                $("#realName").val(data.realName);
                $("#avatar").data("pic", data.pic)
                $("#avatarImg").attr("src", base.getImg(data.pic, SUFFIX));
                $("#bannerFile").data("pic", data.advPic);
                buildAdvImgs(data.advPic);
                $("#age").val(data.age);
                $("#gender").val(data.gender);
                $("#duration").val(data.duration);
                var description = data.description;
                var descPics = [];
                description = description.replace(/<img\s+src="([^"]+)"\s*\/>/ig, function(img, pic){
                    pic = pic.substr(pic.lastIndexOf("/") + 1);
                    buildDescImg(pic);
                    descPics.push(pic);
                    return "";
                }).replace(/&nbsp;/ig, " ");
                description = base.decode(description);
                descPics = descPics.length ? descPics.join("||") : "";
                $("#descFile").data("pic", descPics);
                $("#description").val(description);
                coachLabel = data.label;
                if(!--count) {
                    addLabelData();
                }
            }, (error, d) => {
                d && d.close();
                base.confirm("您需要先完善个人资料并在通过审核后，<br/>才可以使用本系统")
                    .then(() => {
                        location.replace("./apply.html");
                    }, () => {
                        location.replace("../index.html");
                    });
            });
    }
    // 生成广告图
    function buildAdvImgs(pics) {
        var html = "",
            _bannerFile = $("#bannerFile");
        pics = pics.split("||");
        pics.forEach((pic) => {
            var _img = $(`<div class="img" id="${pic}">
                        <div class="img-content"><img src="${base.getImg(pic, SUFFIX)}"></div>
                        <i class="close-icon"></i>
                    </div>`);
            (function(_img, pic){
                _img.find('.close-icon').on('click', function (e) {
                    _img.remove();
                    var pics = _bannerFile.data("pic").split("||");
                    pics.splice(pics.indexOf(pic), 1);
                    pics = pics.length ? pics.join("||") : "";
                    _bannerFile.data("pic", pics);
                });
            })(_img, pic)
            _img.insertBefore("#bannerWrapper");
        });
    }
    // 生成店铺的图片
    function buildDescImg(pic) {
        var _descFile = $("#descFile");
        var _img = $(`<div class="img" id="${pic}">
                    <div class="img-content"><img src="${base.getImg(pic, SUFFIX)}"></div>
                    <i class="close-icon"></i>
                </div>`);
        _img.find('.close-icon').on('click', function (e) {
            _img.remove();
            var pics = _descFile.data("pic").split("||");
            pics.splice(pics.indexOf(pic), 1);
            pics = pics.length ? pics.join("||") : "";
            _descFile.data("pic", pics);
        });
        _img.insertBefore("#descWrapper");
    }
    // 初始化广告图的图片上传控件
    function initBanner(token) {
        var _bannerFile = $("#bannerFile");
        qiniu.uploadInit({
            token: token,
            btnId: "bannerFile",
            containerId: "bannerWrapper",
            multi_selection: true,
            showUploadProgress: function(up, file){
                $("#" + file.id)
                    .find(".progress-text").text(parseInt(file.percent, 10) + "%");
            },
            fileAdd: function(file, up){
                var _img = $(getInitImgHtml(file));
                (function(_img, file){
                    _img.find('.close-icon').on('click', function (e) {
                        up.removeFile(file);
                        _img.remove();
                        var pics = _bannerFile.data("pic").split("||");
                        pics.splice(pics.indexOf(file.id), 1);
                        pics = pics.length ? pics.join("||") : "";
                        _bannerFile.data("pic", pics);
                    });
                })(_img, file)
                _img.insertBefore("#bannerWrapper");
            },
            fileUploaded: function(up, url, key, file){
                $("#" + file.id).find(".img-content")
                    .html(`<img src="${url + SUFFIX}"/>`);

                var pic = _bannerFile.data("pic");
                pic = pic ? pic + '||' + key : key;
                _bannerFile.data("pic", pic);
            }
        });
    }
    // 初始化店铺详述的图片上传控件
    function initDesc(token) {
        var _descFile = $("#descFile");
        qiniu.uploadInit({
            token: token,
            btnId: "descFile",
            containerId: "descWrapper",
            multi_selection: true,
            showUploadProgress: function(up, file){
                $("#" + file.id)
                    .find(".progress-text").text(parseInt(file.percent, 10) + "%");
            },
            fileAdd: function(file, up){
                var _img = $(getInitImgHtml(file));
                (function(_img, file){
                    _img.find('.close-icon').on('click', function (e) {
                        up.removeFile(file);
                        _img.remove();
                        var pics = _descFile.data("pic").split("||");
                        pics.splice(pics.indexOf(file.id), 1);
                        pics = pics.length ? pics.join("||") : "";
                        _descFile.data("pic", pics);
                    });
                })(_img, file)
                _img.insertBefore("#descWrapper");
            },
            fileUploaded: function(up, url, key, file){
                $("#" + file.id).find(".img-content")
                    .html(`<img src="${url + SUFFIX}"/>`);

                var pic = _descFile.data("pic");
                pic = pic ? pic + '||' + key : key;
                _descFile.data("pic", pic);
            }
        });
    }
    // 初始化头像的上传控件
    function initAvatar(token) {
        var _progressBar = $("#progressBar");
        var _avatarImg = $("#avatarImg");
        qiniu.uploadInit({
            token: token,
            btnId: "avatar",
            containerId: "avatarWrapper",
            multi_selection: false,
            showUploadProgress: function(up, file){
                _progressBar.css("width", parseInt(file.percent, 10) + "%");
            },
            fileAdd: function(file, up){},
            fileUploaded: function(up, url, key, file){
                _progressBar.css("width", "0");
                _avatarImg.attr("src", url + SUFFIX);
                $("#avatar").data("pic", key);
            }
        });
    }
    function getInitImgHtml(file) {
        return `<div class="img" id="${file.id}">
                    <div class="img-content">
                        <div class="progress-infos">
                            <h2>上传中...</h2>
                            <div class="progress-text">0%</div>
                        </div>
                    </div>
                    <i class="close-icon"></i>
                </div>`;
    }
    function addListener(){
        // 标签
        $("#labelWrapper").on("click", ".check-item", function() {
            var _this = $(this);
            _this[_this.hasClass("active") ? "removeClass" : "addClass"]("active");
        });
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                realName: {
                    required: true,
                    isNotFace: true,
                    maxlength: 20
                },
                age: {
                    required: true,
                    "Z+": true
                },
                gender: {
                    required: true
                },
                duration: {
                    required: true,
                    "Z+": true
                },
                description: {
                    required: true,
                    isNotFace: true
                }
            },
            onkeyup: false
        });
        $("#submitBtn").on("click", function() {
            if(_formWrapper.valid()){
                beforeSubmit(_formWrapper.serializeObject());
            }
        });
    }
    // 校验表单
    function beforeSubmit(param) {
        var pic = $("#avatar").data("pic");
        if(!pic) {
            base.showMsg("头像不能为空");
            return;
        }
        param.pic = pic;
        var advPic = $("#bannerFile").data("pic");
        if(!advPic) {
            base.showMsg("广告图不能为空");
            return;
        }
        param.advPic = advPic;
        var label = "";
        $("#labelWrapper").find(".check-item.active")
            .each(function() {
                label = label + $(this).attr("data-label") + "||";
            });
        label = label ? label.substr(0, label.length - 2) : "";
        if(!label) {
            base.showMsg("标签不能为空");
            return;
        }
        param.label = label;
        var descPics = $("#descFile").data("pic");
        descPics = descPics && descPics.split("||") || [];
        param.description = base.getDescription(param.description, descPics);
        param.code = code;
        submit(param);
    }

    // 修改资料
    function submit(param) {
        if(status == "2") {
            base.showLoading("提交中...");
        } else {
            base.showLoading("保存中...");
        }
        UserCtr.editCoach(param)
            .then((data) => {
                base.hideLoading();
                if(status == "2") {
                    base.showMsg("申请提交成功");
                } else {
                    base.showMsg("保存成功");
                }
                setTimeout(() => {
                    location.href = "../index.html";
                }, 500);
            });
    }
});
