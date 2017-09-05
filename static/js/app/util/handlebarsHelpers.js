define([
    'Handlebars'
], function(Handlebars) {
    Handlebars.registerHelper('formatMoney', function(num, options) {
        if (!num && num !== 0)
            return "--";
        num = +num / 1000;
        num = (num + "").replace(/^(\d+\.\d\d)\d*/i, "$1");
        return (+ num).toFixed(2);
    });
    Handlebars.registerHelper('formatImage', function(pic, options) {
        if (!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic;
    });
    Handlebars.registerHelper('formatAvatar', function(pic, options) {
        if (!pic) {
            return '/static/images/avatar@2x.png';
        }
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic + "?imageMogr2/auto-orient/thumbnail/!200x200r";
    });
    Handlebars.registerHelper('formatDateTime', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd hh:mm:ss");
    });
    Handlebars.registerHelper('formatDateTime1', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd hh:mm");
    });
    Handlebars.registerHelper('formatDate', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd");
    });
    Handlebars.registerHelper('formatTime', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("hh:mm");
    });
    Handlebars.registerHelper('formatWeek', function(date, options) {
        if (!date)
            return "--";
        var week = {
            1: "周日",
            2: "周一",
            3: "周二",
            4: "周三",
            5: "周四",
            6: "周五",
            7: "周六"
        };
        return week[date];
    });
    Handlebars.registerHelper('formatDayTime', function(date, options) {
        if (!date)
            return "--";
        return date.substr(0, 5);
    });
    Handlebars.registerHelper('clearTag', function(des, options) {
        return des && des.replace(/(\<[^\>]+\>)|(\<\/[^\>]+\>)|(\<[^\/\>]+\/\>)/ig, "") || "";
    });

    Handlebars.registerHelper('safeString', function(text, options) {
        return new Handlebars.SafeString(text);
    });

    return Handlebars;
});
