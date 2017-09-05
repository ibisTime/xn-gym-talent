define([
    'app/controller/base'
], function(base) {
    var dict = {
        // 私课订单状态
        coachOrderStatus: {
            "0": "待付款",
            "1": "待接单",
            "2": "待上课",
            "3": "待下课",
            "4": "待下课",
            "5": "待评价",
            "6": "用户取消",
            "7": "私教取消",
            "8": "已完成"
        }
    };

    var changeToObj = function(data) {
        var data = data || [],
            obj = {};
        data.forEach(function(item) {
            obj[item.dkey] = item.dvalue;
        });
        return obj;
    };

    return {
        get: function(code) {
            return dict[code];
        }
    }
});
