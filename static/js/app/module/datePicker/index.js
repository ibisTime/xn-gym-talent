define([
    'jquery',
    'picker'
], function ($, Picker) {

  var first = []; /*  */
	var second = []; /*  */
	var third = []; /*  */
	var selectedIndex = [0, 0, 0]; /* 默认选中的 */
	var checked = [0, 0, 0]; /* 已选选项 */
  var defaultOpt = {};
  var _nameEl;
  var now = new Date();  

  var css = __inline("calendar.css");

  $("head").append('<style>'+css+'</style>');

  const _DAYS1 = (function(){
    return Array.apply(null, { length: 28 }).map((item, index) => {
      var _index = (index + 1) + '';
      _index = '00'.substr(_index.length) + _index;
      return {
        text: `${index + 1}日`,
        value: _index
      };
    });
  })();

  const _DAYS2 = (function(){
    return Array.apply(null, { length: 29 }).map((item, index) => {
      var _index = (index + 1) + '';
      _index = '00'.substr(_index.length) + _index;
      return {
        text: `${index + 1}日`,
        value: _index
      };
    });
  })();

  const _DAYS3 = (function(){
    return Array.apply(null, { length: 30 }).map((item, index) => {
      var _index = (index + 1) + '';
      _index = '00'.substr(_index.length) + _index;
      return {
        text: `${index + 1}日`,
        value: _index
      };
    });
  })();

  const _DAYS4 = (function(){
    return Array.apply(null, { length: 31 }).map((item, index) => {
      var _index = (index + 1) + '';
      _index = '00'.substr(_index.length) + _index;
      return {
        text: `${index + 1}日`,
        value: _index
      };
    });
  })();

  // 获取年份的列表
  function getYears() {
    var current = now.getFullYear();
    var min = current - 100;
    var max = current + 100;
    var years = [];
    for(var i = min; i <= max; i++) {
      years.push({
        text: `${i}年`,
        value: i
      });
    }
    return years;
  }

  function getMonths() {
    var result = [];
    for(var i = 1; i <= 12; i++) {
      var index = i + '';
      index = '00'.substr(index.length) + index;
      result.push({
        text: `${i}月`,
        value: index
      });
    }
    return result;
  }
  var _MONTH2DAYS = {
    '01': _DAYS4,
    '02': _DAYS1,
    '03': _DAYS4,
    '04': _DAYS3,
    '05': _DAYS4,
    '06': _DAYS3,
    '07': _DAYS4,
    '08': _DAYS4,
    '09': _DAYS3,
    '10': _DAYS4,
    '11': _DAYS3,
    '12': _DAYS4
  };
  function getDays(year, month) {
    if (month !== '02') {
      return _MONTH2DAYS[month];
    } else {
      if (_isLeapYear(year)) {
        return _DAYS2;
      } else {
        return _DAYS1;
      }
    }
  }

  // 获取当天的数据
  function getCurDatas() {
    var _month = (now.getMonth() + 1) + '';
    _month = '00'.substr(_month.length) + _month;
    return {
      selectedIndex: [100, now.getMonth(), now.getDate() - 1],
      datas: [getYears(), getMonths(), getDays(now.getFullYear(), _month)]
    };
  }

  function _isLeapYear(year) {
    return !!(!(year % 400) || (!(year % 4) && year % 100));
  }

  function firstChange(selectedIndex, picker) {
    checked[0] = selectedIndex;
    // 如果月份选择了2月
    if (checked[1] === 1) {
      let _days = getDays(first[checked[0]].value, '02');
      if (_days.length !== third.length) {
        let scrollIndex = checked[2];
        if(scrollIndex + 1 > _days.length) {
          scrollIndex = _days.length - 1;
        }
        checked[2] = scrollIndex;
        third = _days;
        picker.refillColumn(2, third);
        picker.scrollColumn(2, scrollIndex);
      }
    }
  }

  function secondChange(selectedIndex, picker) {
    checked[1] = selectedIndex;
    let _month = (checked[1] + 1) + '';
    _month = '00'.substr(_month.length) + _month;
    let _days = getDays(first[checked[0]].value, _month);
    if (_days.length !== third.length) {
      let scrollIndex = checked[2];
      if(scrollIndex + 1 > _days.length) {
        scrollIndex = _days.length - 1;
      }
      checked[2] = scrollIndex;
      third = _days;
      picker.refillColumn(2, third);
      picker.scrollColumn(2, scrollIndex);
    }
  }

  function thirdChange(selectedIndex) {
    checked[2] = selectedIndex;
  }

  function _initSelectIndex() {
    var index0 = 0;
    var index1 = 0;
    var index2 = 0;
    if (defaultOpt.year) {
        first = getYears();
        second = getMonths();
        index0 = first.findIndex((item) => {
          return +item.value === +defaultOpt.year;
        });
        index1 = +defaultOpt.month - 1;
        index2 = +defaultOpt.day - 1;
        defaultOpt.third = getDays(defaultOpt.year, defaultOpt.month);
    } else {
        var result = getCurDatas();
        index0 = result.selectedIndex[0];
        index1 = result.selectedIndex[1];
        index2 = result.selectedIndex[2];
        first = result.datas[0];
        second = result.datas[1];
        third = result.datas[2];
    }
    selectedIndex[0] = checked[0] = index0;
    selectedIndex[1] = checked[1] = index1;
    selectedIndex[2] = checked[2] = index2;
  }

  function _addListener(picker) {
    picker.on('picker.select', function (selectedVal, selectedIndex) {
  	  var text1 = first[selectedIndex[0]].text;
  	  var text2 = second[selectedIndex[1]].text;
  	  var text3 = third[selectedIndex[2]] ? third[selectedIndex[2]].text: '';
      defaultOpt.select && defaultOpt.select(text1, text2, text3);
  	});

  	picker.on('picker.change', function (index, selectedIndex) {
  	  if (index === 0){
  	    firstChange(selectedIndex, picker);
  	  } else if (index === 1) {
  	    secondChange(selectedIndex, picker);
  	  } else {
        thirdChange(selectedIndex);
      }
  	});

  	_nameEl.on('click', function (e) {
      e.preventDefault();
      blur();
  		picker.show();
  	});
  }

  const DATE_PICKER = {
    init: function(option) {
      option = option || {};
      defaultOpt = $.extend(defaultOpt, option);
      _nameEl = $(defaultOpt.id);
      _initSelectIndex();
        var picker = new Picker({
          data: [first,second,third],
          selectedIndex: selectedIndex,
          title: '日期选择'
        });
      _addListener(picker);
    }
  };

  return DATE_PICKER;
});
