define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getPageUserSysConfig()
			.then(function(data){
                base.hideLoading();
                data.list.forEach((item) => {
                    if(item.ckey == "aboutus") {
                    	$("#description").html(item.note);
                    } else if(item.ckey == "telephone") {
                        $("#tel").text(item.note);
                    } else if(item.ckey == "serviceTime") {
                        $("#time").text(item.note);
                    }
                });
			});
	}
})
