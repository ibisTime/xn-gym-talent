define(['app/interface/generalCtr'], function(generalCtr) {
    return {
        getQiniuToken: function() {
            return generalCtr.getQiniuToken();
        },
        uploadInit: function(option) {
            // this 即 editor 对象
            // 触发选择文件的按钮的id
            var btnId = option.btnId;
            var token = option.token;
            //触发上传的按钮id
            var starBtnId = option.starBtnId;
            // 触发选择文件的按钮的父容器的id
            var containerId = option.containerId;
            var multi_selection = option.multi_selection || false;

            // 创建上传对象
            var uploader = Qiniu.uploader({
                runtimes: 'html5,flash,html4', //上传模式,依次退化
                browse_button: btnId, //上传选择的点选按钮，**必需**
                //uptoken_url: '/uptoken',
                //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                uptoken: token,
                //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                unique_names: false,
                // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
                save_key: false,
                // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
                domain: PIC_PREFIX,
                //bucket 域名，下载资源时用到，**必需**
                container: containerId, //上传区域DOM ID，默认是browser_button的父元素，
                max_file_size: '100mb', //最大文件体积限制
                flash_swf_url: __uri("../../lib/qiniu/Moxie.swf"), //引入flash,相对路径
                multi_selection: multi_selection,
                max_retries: 3, //上传失败最大重试次数
                chunk_size: '4mb', //分块上传时，每片的体积
                auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                init: {
                    'FilesAdded': function(up, files) {
                        plupload.each(files, function(file) {
                            option.fileAdd && option.fileAdd(file, up);
                        });
                    },
                    'BeforeUpload': function(up, file) {
                        // 每个文件上传前,处理相关的事情
                        //printLog('on BeforeUpload');
                    },
                    'UploadProgress': function(up, file) {
                        // 显示进度条
                        option.showUploadProgress && option.showUploadProgress(up, file);
                    },
                    'FileUploaded': function(up, file, info) {
                        var domain = up.getOption('domain');
                        var res = JSON.parse(info);
                        var sourceLink = domain + res.key; //获取上传成功后的文件的Url

                        //上传后的图片显示
                        option.fileUploaded && option.fileUploaded(up, sourceLink, res.key, file);
                    },
                    'Error': function(up, err, errTip) {
                        //上传出错时,处理相关的事情
                    },
                    'UploadComplete': function() {
                        // 隐藏进度条
                        option.hideUploadProgress && option.hideUploadProgress();
                    },
                    'Key': function(up, file) {
                        console.log(up, file);
                        // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                        // 该配置必须要在 unique_names: false , save_key: false 时才生效
                        var sourceLink = file.name;
                        var suffix = sourceLink.slice(0, sourceLink.lastIndexOf('.'));
                        var suffix1 = sourceLink.slice(sourceLink.lastIndexOf('.') + 1);
                        suffix = suffix + "_" + (new Date().getTime());
                        return suffix + "." + suffix1;
                    }
                }
            });
        }
    }
});
