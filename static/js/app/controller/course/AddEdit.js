define([
    'app/controller/base',
    'app/interface/CourseCtr',
    'app/interface/UserCtr',
    'app/module/validate',
    'app/module/searchMap'
], function(base, CourseCtr, UserCtr, Validate, searchMap) {
    var code = base.getUrlParam("code");
    var course, coachCode;

    init();
    function init(){
        base.showLoading();
        if(code) {
            $.when(
                getCoachByUserId(),
                getCourse()
            ).then(() => {
                base.hideLoading();
                addListener();
            });
        } else {
            getCoachByUserId().then(() => {
                base.hideLoading();
                $("#week").text($("#skCycle").find("option:selected").text());
                searchMap.addMap({
                    initInDW: true
                });
                addListener();
            });
        }
    }
    // 根据userId详情查询私教
    function getCoachByUserId(userId, refresh) {
        return UserCtr.getCoachByUserId(base.getUserId())
            .then((data) => {
                coachCode = data.code;
            });
    }
    // 详情查询课程
    function getCourse() {
        return CourseCtr.getCourse(code)
            .then((data) => {
                course = data;
                $("#skCycle").val(data.skCycle);
                $("#week").text($("#skCycle").find("option:selected").text());
                $("#price").val(base.formatMoney(data.price));
                $("#totalNum").val(data.totalNum);
                if (data.address) {
                    $("#address").val(data.address);
                    $("#addrWrap").text(data.address);
                    searchMap.addMap({
                        initAddr: data.address
                    });
                } else {
                    searchMap.addMap({
                        initInDW: true
                    });
                }
            });
    }
    function addListener(){
        // 点击显示地图
        $("#addrWrap").on("click", function() {
            searchMap.showMap({
                success: function(point, address) {
                    $("#address").val(address).valid();
                    $("#addrWrap").text(address);
                }
            });
        });
        var hours = ['00', '01', '02', '03', '04', '05', '06', '07',
            '08', '09', '10', '11', '12', '13', '14', '15', '16',
            '17', '18', '19', '20', '21', '22', '23'],
            minutes = ['00', '01', '02', '03', '04', '05', '06', '07',
                '08', '09', '10', '11', '12', '13', '14', '15', '16',
                '17', '18', '19', '20', '21', '22', '23', '24', '25',
                '26', '27', '28', '29', '30', '31', '32', '33', '34',
                '35', '36', '37', '38', '39', '40', '41', '42', '43',
                '44', '45', '46', '47', '48', '49', '50', '51', '52',
                '53', '54', '55', '56', '57', '58', '59'];

        var skStartDatetime, skEndDatetime;
        if(course) {
            skStartDatetime = course.skStartDatetime.substr(0,5).split(":");
            skEndDatetime = course.skEndDatetime.substr(0,5).split(":");
        } else {
            skStartDatetime = ["00", "00"];
            skEndDatetime = ["00", "00"];
        }

        var _skStartDatetime = $("#skStartDatetime");
        _skStartDatetime.picker({
            title: "请选择上课时间",
            cols: [{
                textAlign: 'center',
                values: hours
            }, {
                textAlign: 'center',
                values: [":"]
            }, {
                textAlign: 'center',
                values: minutes
            }],
            value: [skStartDatetime[0], ":", skStartDatetime[1]],
            onChange: function() {
                _skStartDatetime.valid();
            }
        }).val(`${skStartDatetime[0]} : ${skStartDatetime[1]}`);
        var _skEndDatetime = $("#skEndDatetime");
        _skEndDatetime.picker({
            title: "请选择下课时间",
            cols: [{
                textAlign: 'center',
                values: hours
            }, {
                textAlign: 'center',
                values: [":"]
            }, {
                textAlign: 'center',
                values: minutes
            }],
            value: [skEndDatetime[0], ":", skEndDatetime[1]],
            onChange: function() {
                _skEndDatetime.valid();
            }
        }).val(`${skEndDatetime[0]} : ${skEndDatetime[1]}`);
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                skCycle: {
                    required: true
                },
                skStartDatetime: {
                    required: true
                },
                skEndDatetime: {
                    required: true
                },
                totalNum: {
                    required: true,
                    'Z+': true
                },
                address: {
                    required: true,
                    maxlength: 100,
                    isNotFace: true
                },
                price: {
                    required: true,
                    amount: true
                }
            },
            onkeyup: false
        });
        $("#saveBtn").click(function(){
            if(_formWrapper.valid()){
                beforeSubmit(_formWrapper.serializeObject());
            }
        });
        $("#skCycle").on("change", function() {
            $("#week").text($(this).find("option:selected").text());
        });
    }
    // 提交数据前的校验和拼装
    function beforeSubmit(param) {
        var skStartDatetime = param.skStartDatetime.split(/\s:\s/);
        skStartDatetime.push("00");
        var skEndDatetime = param.skEndDatetime.split(/\s:\s/);
        skEndDatetime.push("00");
        if(!isLegalTime(skStartDatetime, skEndDatetime)) {
            base.showMsg("上课时间不能大于下课时间");
            return;
        }
        base.showLoading("保存中...");
        param.skStartDatetime = skStartDatetime.join(":");
        param.skEndDatetime = skEndDatetime.join(":");
        param.coachCode = coachCode;
        param.price = +param.price * 1000;
        if(code) {
            param.code = code;
            editCourse(param);
        } else {
            addCourse(param);
        }
    }
    // 判断上课和下课时间是否合理
    function isLegalTime(skStartDatetime, skEndDatetime) {
        if(!skEndDatetime || !skStartDatetime) {
            return false;
        }
        if(skStartDatetime[0] > skEndDatetime[0]) {
            return false;
        }
        if(skStartDatetime[0] == skEndDatetime[0] && skStartDatetime[1] >= skEndDatetime[1]) {
            return false;
        }
        return true;
    }
    function addCourse(param) {
        CourseCtr.addCourse(param)
            .then((data) => {
                base.hideLoading();
                base.showMsg("新增成功");
                setTimeout(() => {
                    location.replace("./list.html");
                }, 500);
            });
    }

    function editCourse(param) {
        CourseCtr.editCourse(param)
            .then((data) => {
                base.hideLoading();
                base.showMsg("修改成功");
                setTimeout(() => {
                    location.replace("./list.html");
                }, 500);
            });
    }
});
