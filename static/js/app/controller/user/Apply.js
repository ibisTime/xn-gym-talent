define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/module/qiniu',
    'app/module/validate',
    'app/module/alertModal',
    'app/module/clipImg',
    'node_modules/exif-js/exif',
    'app/module/picker'
], function(base, GeneralCtr, UserCtr, qiniu, Validate, alertModal, clipImg, EXIF, picker) {
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";
    const PDF = 'PDF', ADV_PIC = 'ADV_PIC', DESC = 'DESC', AVATAR = 'AVATAR';
    var token;
    var currentItem;

    init();
    function init(){
        $.when(
            initUpload(),
            getLabelList()
        ).then(base.hideLoading);
      	addListener();
    }
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
            });
    }
    // 初始化upload
    function initUpload() {
        return qiniu.getQiniuToken()
            .then((data) => {
                token = data.uploadToken;
                initImgUpload(PDF);
                initImgUpload(ADV_PIC);
                initImgUpload(DESC);
            });
    }
    function initImgUpload(type) {
        var _fileInput, btnId, containerId, count = 0;
        if (type === ADV_PIC) {
           btnId = 'advPicFile';
           containerId = 'advPicWrapper';
        } else if (type === PDF) {
            btnId = 'pdfFile';
            containerId = 'pdfWrapper';
        } else if (type === DESC) {
            btnId = 'descFile';
            containerId = 'descWrapper';
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
                count++;
                if (type !== AVATAR) {
                  var _img = $(getInitImgHtml(file));
                  (function(_img){
                      _img.find('.close-icon').on('click', function (e) {
                          count--;
                          up.removeFile(file);
                          _img.remove();
                          var pics = _fileInput.data("pic").split("||");
                          pics.splice(pics.indexOf(file.id), 1);
                          pics = pics.length ? pics.join("||") : "";
                          _fileInput.data("pic", pics);
                          hideOrShowContainer(type, count, containerId);
                      });
                  })(_img)
                  _img.insertBefore('#' + containerId);
                  hideOrShowContainer(type, count, containerId);
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
    function hideOrShowContainer(type, count, containerId) {
        var _container = $('#' + containerId);
        if (type === AVATAR) {
            return;
        }
        if (type === PDF) {
            if (count >= 2) {
                _container.css({
                  'visibility': 'hidden',
                  'position': 'absolute'
                });
            } else {
                _container.css({
                  'visibility': 'visible',
                  'position': 'relative'
                });
            }
        } else if (type === ADV_PIC) {
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
        alertModal.addCont();
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
          }
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
                address: {
                    isNotFace: true,
                    maxlength: 100
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
        $("#applyBtn").on("click", function() {
            if(_formWrapper.valid()){
                beforeApply(_formWrapper.serializeObject());
            }
        });
    }
    // 校验表单
    function beforeApply(param) {
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
        var pic = $("#avatar").data("pic");
        if(!pic) {
            base.showMsg("头像不能为空");
            return;
        }
        param.pic = pic;
        var pdf = $("#pdfFile").data("pic");
        if(!pdf) {
            base.showMsg("身份证照不能为空");
            return;
        }
        param.pdf = pdf;
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
        apply(param);
    }

    // 申请成为达人
    function apply(param) {
        base.showLoading("提交中...");
        UserCtr.apply(param)
            .then((data) => {
                base.hideLoading();
                alertModal.showCont("申请提交成功，请耐心等待审批结果", () => {
                    location.href = "../index.html";
                });
            });
    }
});
