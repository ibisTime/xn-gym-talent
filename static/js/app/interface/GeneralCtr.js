define([
    'app/util/ajax'
], function(Ajax) {
    return {
        // 加载七牛token
        getQiniuToken() {
            return Ajax.get("807900");
        },
        // 获取微信sdk初始化的参数
        getInitWXSDKConfig() {
            return Ajax.get("807910", {
                url: location.href.split('#')[0]
            }, true);
        },
        // 获取appId
        getAppId() {
            return Ajax.get("806031", {
                account: "ACCESS_KEY",
                type: "3"
            }, true);
        },
        // 发送短信
        sendCaptcha(bizType, mobile, sendCode = '805904') {
            return Ajax.post(sendCode, {
                bizType,
                mobile,
                "kind": "f3"
            });
        },
        /**
         * 分页查询系统公告
         * @param config {start, limit}
         */
        getPageSysNotice(config, refresh) {
            return Ajax.get("804040", {
                "pushType": 41,
                "toKind": 3,
                "channelType": 4,
                "status": 1,
                "fromSystemCode": SYSTEM_CODE,
                ...config
            }, refresh);
        },
        // 查询数据字典列表
        getDictList(parentKey, code = "807706"){
            return Ajax.get(code, {parentKey});
        },
        // 查询user系统参数
        getUserSysConfig(ckey){
            return Ajax.get("807717", {ckey});
        },
        // 分页查询user系统参数
        getPageUserSysConfig(config = {start: 1, limit: 100}, refresh) {
            return Ajax.get("807715", config, refresh);
        },
        // 查询account系统参数
        getAccountSysConfig(key){
            return Ajax.get("802027", {key});
        },
        // 分页查询account系统参数
        getPageAccountSysConfig(config = {start: 1, limit: 100}, refresh) {
            return Ajax.get("802025", config, refresh);
        },
        // 查询业务系统参数
        getBizSysConfig(ckey){
            return Ajax.get("622917", {ckey});
        },
    };
})
