define([
    'jquery'
], function ($) {
    var tmpl = __inline("index.html");
    var css = __inline("index.scss");
    var defaultOption = {};

    $("head").append('<style>'+css+'</style>');
    function _hasContent() {
        return !!$("#_amModalWrapper").length;
    }
    const alertModal = {
        addCont: function(){
            if(!_hasContent()){
                var cont = $(tmpl);
                $("body").append(cont);
                cont.find(".am-modal-button").on("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    defaultOption.callback && defaultOption.callback();
                    alertModal.hideCont();
                });
            }
            return this;
        },
        showCont: function(msg, func){
            if(_hasContent()){
                if(func) {
                    defaultOption.callback = func;
                } else {
                    defaultOption.callback = null;
                }
                $("#_amModalWrapper").find(".am-modal-body").html(msg)
                    .end().show();
            }
            return this;
        },
        hideCont: function(){
            $("#_amModalWrapper").hide();
            return this;
        }
    };
    return alertModal;
});
