define([
    'app/controller/base'
], function(base) {
    init();

    function init(){
    	addListener();
    }

    function addListener(){
        $("#logout").on("click", function() {
            base.clearSessionUser();
            location.href = './login.html';
        });
    }
});
