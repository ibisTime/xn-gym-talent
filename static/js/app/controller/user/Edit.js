define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/module/qiniu',
    'app/module/validate',
    'app/module/clipImg',
    'app/module/picker'
], function(base, GeneralCtr, UserCtr, qiniu, Validate, clipImg, picker) {
    var code, coachLabel, status, token;
    const PDF = 'PDF', ADV_PIC = 'ADV_PIC', DESC = 'DESC', AVATAR = 'AVATAR';
    var SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";
    var advCount = 0, descCount = 0, avatarCount = 0, pdfCount = 0;
    var currentItem, _addr;
    var rules = {
        age: {
            required: true,
            "Z+": true
        },
        address: {
            isNotFace: true,
            maxlength: 100
        },
        duration: {
            required: true,
            "Z+": true
        },
        description: {
            required: true,
            isNotFace: true
        }
    };

    init();
    function init(){
        base.showLoading();
        $.when(
            initUpload(),
            getLabelList(),
            getCoachByUserId()
        ).then(base.hideLoading);
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
        if (coachLabel) {
            var _labelWrapper = $("#labelWrapper");
            var labels = coachLabel.split("||");
            labels.forEach((label) => {
                _labelWrapper.find("[data-label=" + label + "]").addClass("active");
            });
        }
    }
    // 初始化upload
    function initUpload() {
        return qiniu.getQiniuToken()
            .then((data) => {
                token = data.uploadToken;
                initImgUpload(ADV_PIC);
                initImgUpload(DESC);
            });
    }
    function initImgUpload(type) {
        var _fileInput, btnId, containerId;
        if (type === ADV_PIC) {
            btnId = 'advPicFile';
            containerId = 'advPicWrapper';
        } else if (type === DESC) {
            btnId = 'descFile';
            containerId = 'descWrapper';
        } else if (type === PDF) {
            btnId = 'pdfFile';
            containerId = 'pdfWrapper';
        } else {
            btnId = 'avatar';
            containerId = 'avatarWrapper';
        }
        _fileInput = $('#' + btnId);
        qiniu.uploadInit({
            token,
            btnId,
            containerId,
            multi_selection: false,
            showUploadProgress: function(up, file){
                if (type === AVATAR) {
                    $("#progressBar").css("width", parseInt(file.percent, 10) + "%");
                } else {
                    $("#" + file.id).find(".progress-text").text(parseInt(file.percent, 10) + "%");
                }
            },
            fileAdd: function(file, up){
                if (type === AVATAR) {
                    avatarCount++;
                } else if (type === ADV_PIC) {
                    advCount++;
                } else if (type === PDF) {
                    pdfCount++;
                } else {
                    descCount++;
                }
                if (type !== AVATAR) {
                  var _img = $(getInitImgHtml(file));
                  (function(_img){
                      _img.find('.close-icon').on('click', function (e) {
                          if (type === AVATAR) {
                              avatarCount--;
                          } else if (type === ADV_PIC) {
                              advCount--;
                          } else if (type === PDF) {
                              pdfCount--;
                          } else {
                              descCount--;
                          }
                          up.removeFile(file);
                          _img.remove();
                          var pics = _fileInput.data("pic").split("||");
                          pics.splice(pics.indexOf(file.id), 1);
                          pics = pics.length ? pics.join("||") : "";
                          _fileInput.data("pic", pics);
                          hideOrShowContainer(type, containerId);
                      });
                  })(_img)
                  _img.insertBefore('#' + containerId);
                  hideOrShowContainer(type, containerId);
                }
            },
            fileUploaded: function(up, url, key, file){
                if (type === AVATAR) {
                    $("#progressBar").css("width", "0");
                    $("#avatarImg").attr("src", url + SUFFIX);
                    _fileInput.data("pic", key);
                } else {
                    $("#" + file.id).find(".img-content").html(`<img src="${url + SUFFIX}"/>`);
                    var pic = _fileInput.data("pic");
                    pic = pic ? pic + '||' + key : key;
                    _fileInput.data("pic", pic);
                }
            }
        });
    }
    function hideOrShowContainer(type, containerId) {
        var _container = $('#' + containerId);
        if (type === AVATAR) {
            return;
        }
        var count = 0;
        if (type === AVATAR) {
            count = avatarCount;
        } else if (type === ADV_PIC) {
            count = advCount;
        } else if (type === PDF) {
            count = pdfCount;
        } else {
            count = descCount;
        }
        if (type === ADV_PIC) {
            if (count >= 5) {
                $('#' + containerId).css({
                  'visibility': 'hidden',
                  'position': 'absolute'
                });
            } else {
                _container.css({
                  'visibility': 'visible',
                  'position': 'relative'
                });
            }
        } else if (type === PDF) {
            if (count >= 2) {
                $('#' + containerId).css({
                  'visibility': 'hidden',
                  'position': 'absolute'
                });
            } else {
                _container.css({
                  'visibility': 'visible',
                  'position': 'relative'
                });
            }
        } else {
            if (count >= 9) {
                $('#' + containerId).css({
                  'visibility': 'hidden',
                  'position': 'absolute'
                });
            } else {
                _container.css({
                  'visibility': 'visible',
                  'position': 'relative'
                });
            }
        }
    }
    // 根据userId查询教练
    function getCoachByUserId() {
        return UserCtr.getCoachByUserId(base.getUserId())
            .then((data) => {
                code = data.code;
                status = data.status;
                if(status == "2") {
                    $("#realName1").addClass('hidden');
                    $("#realName").val(data.realName).removeClass('hidden');
                    rules.realName = {
                        required: true,
                        isNotFace: true,
                        maxlength: 20
                    };
                    $("#gender1").addClass('hidden');
                    $("#gender").val(data.gender).removeClass('hidden')
                        .siblings('.right-arrow').removeClass('hidden');
                    rules.gender = {
                        required: true
                    };
                    $("#pdfWrapper").removeClass('hidden');
                    initImgUpload(PDF);
                    $("#pdfFile").data("pic", data.pdf);
                    buildPDFImgs(data.pdf);
                    if (data.remark) {
                      $("#remark").text(data.remark).parent().removeClass("hidden");
                    }
                } else {
                    if (data.pdf) {
                        buildPDFImgs(data.pdf, true);
                    } else {
                        $('#pdfOutWrapper').addClass('hidden');
                    }
                    $("#realName").remove();
                    $("#realName1").text(data.realName);
                    $("#gender").remove();
                    $("#gender1").text(({'0': '女', '1': '男'})[data.gender]);
                }
                if (data.province) {
                  $("#province").val(data.province + ' ' + data.city + ' ' + data.area || '')
                    .attr("data-prv", data.province)
                    .attr("data-city", data.city)
                    .attr("data-area", data.area);
                };
                _addr = {
                    prov: data.province || '',
                    city: data.city || '',
                    area: data.area || ''
                };
                addListener();
                if (data.pic) {
                    avatarCount = 1;
                    $("#avatar").data("pic", data.pic);
                    $("#avatarImg").attr("src", base.getImg(data.pic, SUFFIX));
                }
                $("#advPicFile").data("pic", data.advPic);
                buildAdvImgs(data.advPic);
                $("#age").val(data.age);
                $("#gender").val(data.gender);
                $("#duration").val(data.duration);
                $('#address').val(data.address);
                var description = data.description;
                if (description) {
                    var descPics = [];
                    description = description.replace(/<img\s+src="([^"]+)"\s*\/>/ig, function(img, pic){
                        var index = pic.indexOf('?imageMogr2/auto-orient');
                        if (~index) {
                            pic = pic.substr(0, index);
                        }
                        pic = pic.substr(pic.lastIndexOf("/") + 1);
                        descCount++;
                        buildDescImg(pic);
                        descPics.push(pic);
                        return "";
                    }).replace(/&nbsp;/ig, " ");
                    description = base.decode(description);
                    descPics = descPics.length ? descPics.join("||") : "";
                    $("#descFile").data("pic", descPics);
                    $("#description").val(description);
                }
                coachLabel = data.label;
                if(!--count) {
                    addLabelData();
                }
                hideOrShowContainer(ADV_PIC, 'advPicWrapper');
                hideOrShowContainer(DESC, 'descWrapper');
                hideOrShowContainer(AVATAR, 'avatarWrapper');
                hideOrShowContainer(PDF, 'pdfWrapper');
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
    // 生成健身照
    function buildAdvImgs(pics) {
        var html = "",
            _advPicFile = $("#advPicFile");
        pics = pics.split("||");
        advCount = pics.length;
        pics.forEach((pic) => {
            var _img = $(`<div class="img" id="${pic}">
                        <div class="img-content"><img src="${base.getImg(pic, SUFFIX)}"></div>
                        <i class="close-icon"></i>
                    </div>`);
            (function(_img, pic){
                _img.find('.close-icon').on('click', function (e) {
                    _img.remove();
                    var pics = _advPicFile.data("pic").split("||");
                    pics.splice(pics.indexOf(pic), 1);
                    pics = pics.length ? pics.join("||") : "";
                    _advPicFile.data("pic", pics);
                    advCount--;
                    hideOrShowContainer(ADV_PIC, 'advPicWrapper');
                });
            })(_img, pic)
            _img.insertBefore("#advPicWrapper");
        });
    }
    // 生成身份证
    function buildPDFImgs(pics, noClose) {
        if (pics) {
            var html = "",
                _pdfFile = $("#pdfFile");
            pics = pics.split("||");
            pdfCount = pics.length;
            pics.forEach((pic) => {
                var _img = $(`<div class="img" id="${pic}">
                            <div class="img-content"><img src="${base.getImg(pic, SUFFIX)}"></div>
                            ${noClose?'':'<i class="close-icon"></i>'}
                        </div>`);
                if (!noClose) {
                    (function(_img, pic){
                        _img.find('.close-icon').on('click', function (e) {
                            _img.remove();
                            var pics = _pdfFile.data("pic").split("||");
                            pics.splice(pics.indexOf(pic), 1);
                            pics = pics.length ? pics.join("||") : "";
                            _pdfFile.data("pic", pics);
                            pdfCount--;
                            hideOrShowContainer(PDF, 'pdfWrapper');
                        });
                    })(_img, pic)
                }
                _img.insertBefore("#pdfWrapper");
            });
        }
    }
    // 生成个人详述的图片
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
            descCount--;
            hideOrShowContainer(DESC, 'descWrapper');
        });
        _img.insertBefore("#descWrapper");
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

    function getImgData(fileType, img, dir, next) {
        let image = new Image();
        image.onload = function() {
            let degree = 0;
            let drawWidth;
            let drawHeight;
            let width;
            let height;
            drawWidth = this.naturalWidth;
            drawHeight = this.naturalHeight;
            let canvas = document.createElement('canvas');
            canvas.width = width = drawWidth;
            canvas.height = height = drawHeight;
            let context = canvas.getContext('2d');
            // 判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
            switch(dir) {
                // iphone横屏拍摄，此时home键在左侧
                case 3:
                    degree = 180;
                    drawWidth = -width;
                    drawHeight = -height;
                    break;
                // iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
                case 6:
                    canvas.width = height;
                    canvas.height = width;
                    degree = 90;
                    drawWidth = width;
                    drawHeight = -height;
                    break;
                // iphone竖屏拍摄，此时home键在上方
                case 8:
                    canvas.width = height;
                    canvas.height = width;
                    degree = 270;
                    drawWidth = -width;
                    drawHeight = height;
                    break;
            }
            // 使用canvas旋转校正
            context.rotate(degree * Math.PI / 180);
            context.drawImage(this, 0, 0, drawWidth, drawHeight);
            // 返回校正图片
            next(canvas.toDataURL(fileType, 0.8));
        };
        image.src = img;
    }

    function uploadAvatar(base64) {
        base64 = base64.substr(base64.indexOf('base64,') + 7);
        let key = Base64.encode(currentItem.key);
        return $.ajax({
            type: 'post',
            data: base64,
            url: 'http://up-z2.qiniu.com/putb64/-1/key/' + key,
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener('progress', function (e) {
                    let percent = Math.floor(e.loaded / e.total) * 100;
                    if (percent == 100) {
                        percent = 0;
                    }
                    $("#progressBar").css("width", percent + "%");
                }, false);
                return xhr;
            },
            contentType: 'application/octet-stream',
            headers: {
                Authorization: `UpToken ${token}`
            }
        });
    }

    function addListener(){
        clipImg.addCont({
            cancel: function () {
                $("#userInfoWrapper").show();
            },
            chose: function (result) {
                $("#userInfoWrapper").show();
                $("#avatarImg").attr('src', result);
                uploadAvatar(result).then((data) => {
                    $("#avatar").data("pic", data.key);
                });
            }
        });
        picker.init({
          id: '#province',
          select: function(prov, city, area) {
            var _nameEl = $("#province");
            _nameEl.val(prov + ' ' + city + ' ' + area);
            _nameEl.attr("data-prv", prov);
            _nameEl.attr("data-city", city);
            _nameEl.attr("data-area", area);
          },
          ..._addr
        });
        $('#avatar').on('change', function (e) {
            let files;
            let self = this;
            if (e.dataTransfer) {
                files = e.dataTransfer.files;
            } else if (e.target) {
                files = e.target.files;
            }
            files = Array.prototype.slice.call(files, 0, 1);
            let file = files[0];
            let orientation;
            EXIF.getData(file, function() {
                orientation = EXIF.getTag(this, 'Orientation');
            });
            let _url = URL.createObjectURL(file);
            let reader = new FileReader();
            reader.onload = function() {
                getImgData(file.type, this.result, orientation, function(data) {
                    let item = {
                        preview: data,
                        ok: false,
                        type: file.type,
                        key: _url.split('/').pop() + '.' + file.name.split('.').pop()
                    };
                    currentItem = item;
                    clipImg.showCont(data, file.type);
                    $("#userInfoWrapper").hide();
                    self.value = null;
                });
            };
            reader.readAsDataURL(file);
        });
        // 标签
        $("#labelWrapper").on("click", ".check-item", function() {
            var _this = $(this);
            _this[_this.hasClass("active") ? "removeClass" : "addClass"]("active");
        });
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': rules,
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
        var province = $("#province");
        var prov = province.attr('data-prv');
        if (!prov) {
            base.showMsg('授课区域不能为空');
            return;
        }
        var city = province.attr('data-city');
        var area = province.attr('data-area');
        param.province = prov;
        param.city = city;
        param.area = area;
        if (status == '2') {
            var pdfPics = $("#pdfFile").data("pic");
            if (!pdfPics) {
                base.showMsg("教练资格证书不能为空");
                return;
            }
            param.pdf = pdfPics;
        }
        var pic = $("#avatar").data("pic");
        if(!pic) {
            base.showMsg("头像不能为空");
            return;
        }
        param.pic = pic;
        var advPic = $("#advPicFile").data("pic");
        if(!advPic) {
            base.showMsg("健身照不能为空");
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
