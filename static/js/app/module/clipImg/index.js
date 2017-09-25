define([
  'jquery'
], function ($) {
  var tmpl = __inline("index.html");
  var css = __inline("index.css");
  var defaultOption = {};
  var clipBox, wrapper, canvas, clipImg, innerImg, oriImg;
  var cWidth, cHeight;
  var minTop = 0, maxTop = 0;
  var clipY = 0, clipX = 0;
  var touch = {};
  var imgType, imgUrl;

  $("head").append('<style>'+css+'</style>');

  function _hasContent() {
    return !!$("#clipImgWrapper").length;
  }

  function _getPixelRatio(context) {
    let backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }

  function _calculate() {
    let ratio = 1;
    if (canvas.getContext) {
      let context = canvas.getContext('2d');
      ratio = _getPixelRatio(context);
    }
    cWidth = wrapper.offsetWidth * ratio / 2;
    let top = clipBox.offsetTop;
    let right = clipBox.offsetWidth;
    let bottom = clipBox.offsetHeight + top;
    if (clipImg.offsetHeight < clipBox.offsetHeight) {
      cHeight = clipImg.offsetHeight * ratio / 2;
      maxTop = (wrapper.offsetHeight - clipImg.offsetHeight) / 2;
      minTop = maxTop - (clipBox.offsetHeight - clipImg.offsetHeight);
      top = 0;
      bottom = clipImg.offsetHeight;
    } else {
      cHeight = cWidth;
      minTop = (wrapper.offsetHeight - clipImg.offsetHeight) / 2;
      maxTop = minTop + clipImg.offsetHeight - clipBox.offsetHeight;
      top -= (wrapper.offsetHeight - clipImg.offsetHeight) / 2;
      bottom -= (wrapper.offsetHeight - clipImg.offsetHeight) / 2;
    }
    clipY = top;
    clipImg.style.clip = `rect(${top}px,${right}px,${bottom}px,0)`;
  }

  function _choseImg() {
    let oriImgWidth = oriImg.offsetWidth;
    let oriImgHeight = oriImg.offsetHeight;
    let outerHeight = clipImg.offsetHeight;
    let outerWidth = clipImg.offsetWidth;
    let rateW = oriImgWidth / outerWidth;
    let rateH = oriImgHeight / outerHeight;
    let width = outerWidth;
    let height = clipBox.offsetHeight;
    if (height > outerHeight) {
      height = outerHeight;
    }
    let base64 = '';
    let image = new Image();
    image.onload = function() {
      let canvas = document.createElement('canvas');
      canvas.width = cWidth;
      canvas.height = cHeight;
      let context1 = canvas.getContext('2d');
      context1.drawImage(this, clipX * rateW, clipY * rateH, width * rateW, height * rateH, 0, 0, cWidth, cHeight);
      base64 = canvas.toDataURL(imgType);
      defaultOption.chose && defaultOption.chose(base64);
      CLIPIMG.hideCont();
    };
    image.src = imgUrl;
  }

  function handleTouchStart(e) {
    let firstTouch = e.originalEvent.targetTouches[0];
    touch.y1 = firstTouch.pageY;
  }
  function handleTouchMove(e) {
    let firstTouch = e.originalEvent.changedTouches[0];
    touch.y2 = firstTouch.pageY;
    let delta = (touch.y2 - touch.y1) / 10;
    let origTop = Number.parseFloat(clipBox.style.top);
    let newTop = Math.min(maxTop, Math.max(minTop, origTop + delta));
    if (newTop === minTop || newTop === maxTop) {
      touch.y1 = touch.y2;
    }
    clipBox.style.top = newTop + 'px';
    let top = newTop;
    let right = clipBox.offsetWidth;
    let bottom = clipBox.offsetHeight + top;
    if (clipImg.offsetHeight < clipBox.offsetHeight) {
      top = 0;
      bottom = clipImg.offsetHeight;
    } else {
      top -= (wrapper.offsetHeight - clipImg.offsetHeight) / 2;
      bottom -= (wrapper.offsetHeight - clipImg.offsetHeight) / 2;
    }
    clipY = top;
    clipImg.style.clip = `rect(${top}px,${right}px,${bottom}px,0)`;
  }

  const CLIPIMG = {
    addCont: function (option) {
      if(!_hasContent()){
        option = option || {};
        defaultOption = $.extend(defaultOption, option);
        var cont = $(tmpl);
        $("body").append(cont);
        cont.find('.cancel').on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          defaultOption.cancel && defaultOption.cancel();
          CLIPIMG.hideCont();
        });
        cont.find('.chose').on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          _choseImg();
        });
        $('#clipBox').on('touchstart', handleTouchStart)
          .on('touchmove', handleTouchMove);
        clipBox = $('#clipBox')[0];
        wrapper = $('#clipImgWrapper')[0];
        canvas = $('#canvas')[0];
        clipImg = $('#clipImg')[0];
        innerImg = $('#innerImg')[0];
        oriImg = $('#oriImg')[0];
      }
      return this;
    },
    showCont: function(img_url, img_type){
      if(_hasContent()){
        oriImg.src = innerImg.src = clipImg.src = img_url;
        imgType = img_type;
        imgUrl = img_url;
        $("#clipImgWrapper").show();
        setTimeout(() => {
          clipBox.style.top = (wrapper.offsetHeight - clipBox.offsetHeight) / 2 + 'px';
          setTimeout(_calculate, 20);
        }, 20);
      }
      return this;
    },
    hideCont: function(){
      $("#clipImgWrapper").hide();
      return this;
    }
  };

  return CLIPIMG;
});
