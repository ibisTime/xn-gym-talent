define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询私课
         * @param config {start, limit, coachCode}
         */
        getPageCourse(config, refresh) {
            return Ajax.get("622110", config, refresh);
        },
        // 详情查询私课
        getCourse(code, refresh) {
            return Ajax.get("622111", {code}, refresh);
        },
        /**
         * 新增私课
         * @param config {skCycle, skStartDatetime, skEndDatetime, price, coachCode}
         */
        addCourse(config) {
            return Ajax.post("622100", config);
        },
        /**
         * 新增私课
         * @param config {code, skCycle, skStartDatetime, skEndDatetime, price}
         */
        editCourse(config) {
            return Ajax.post("622102", config);
        },
        // 删除私课
        deleteCourse(code) {
            return Ajax.post("622101", {code});
        },
        // 私教接单
        takingOrder(orderCode) {
            return Ajax.post("622122", {
                orderCode,
                updater: base.getUserId()
            });
        },
        // 开始上课
        startOrder(orderCode) {
            return Ajax.post("622123", {
                orderCode,
                updater: base.getUserId()
            });
        },
        // 下课
        endOrder(orderCode) {
            return Ajax.post("622124", {
                orderCode,
                updater: base.getUserId()
            });
        },
        // 取消订单
        cancelOrder(orderCode) {
            return Ajax.post("622126", {
                orderCode,
                updater: base.getUserId()
            });
        },
        /**
         * 分页查询私课订单
         * @param config {start, limit, status}
         */
        getPageOrders(config, refresh) {
            return Ajax.get("622132", {
                toUser:  base.getUserId(),
                type: 1,
                orderColumn: "apply_datetime",
                orderDir: "desc",
                ...config
            }, refresh);
        },
        // 详情查询私课订单
        getOrder(code, refresh) {
            return Ajax.get("622131", {code}, refresh);
        }
    };
})
