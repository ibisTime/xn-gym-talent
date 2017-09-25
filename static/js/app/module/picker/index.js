define([
    'jquery',
    'picker'
], function ($, Picker) {

  var first = []; /* 省，直辖市 */
	var second = []; /* 市 */
	var third = []; /* 镇 */
	var selectedIndex = [0, 0, 0]; /* 默认选中的地区 */
	var checked = [0, 0, 0]; /* 已选选项 */
  var defaultOpt = {};
  var _nameEl;

  var css = __inline("calendar.css");

  $("head").append('<style>'+css+'</style>');

  function creatList(obj, list) {
	  obj.forEach(function(item, index, arr) {
  	  var temp = new Object();
  	  temp.text = item.name;
  	  temp.value = index;
  	  list.push(temp);
	  });
	}

  function firstChange(selectedIndex, picker) {
    second = [];
    third = [];
    checked[0] = selectedIndex;
    var firstCity = city[selectedIndex];
    if (firstCity.hasOwnProperty('sub')) {
      creatList(firstCity.sub, second);

      var secondCity = city[selectedIndex].sub[0]
      if (secondCity.hasOwnProperty('sub')) {
        creatList(secondCity.sub, third);
      } else {
        third = [{text: '', value: 0}];
        checked[2] = 0;
      }
    } else {
      second = [{text: '', value: 0}];
      third = [{text: '', value: 0}];
      checked[1] = 0;
      checked[2] = 0;
    }

    picker.refillColumn(1, second);
    picker.refillColumn(2, third);
    picker.scrollColumn(1, 0);
    picker.scrollColumn(2, 0);
  }

  function secondChange(selectedIndex, picker) {
    third = [];
    checked[1] = selectedIndex;
    var first_index = checked[0];
    if (city[first_index].sub[selectedIndex].hasOwnProperty('sub')) {
      var secondCity = city[first_index].sub[selectedIndex];
      creatList(secondCity.sub, third);
      picker.refillColumn(2, third);
      picker.scrollColumn(2, 0)
    } else {
      third = [{text: '', value: 0}];
      checked[2] = 0;
      picker.refillColumn(2, third);
      picker.scrollColumn(2, 0)
    }
  }

  function _initSelectIndex() {
    let index0 = 0;
    let index1 = 0;
    let index2 = 0;
    if (defaultOpt.prov) {
      index0 = city.findIndex((item) => {
        return item.name === defaultOpt.prov;
      });
      if (index0 !== -1) {
        checked[0] = selectedIndex[0] = index0;
        index1 = city[index0].sub.findIndex((item) => {
          return item.name === defaultOpt.city;
        });
        checked[1] = selectedIndex[1] = index1;
        index2 = city[index0].sub[index1].sub.findIndex((item) => {
          return item.name === defaultOpt.area;
        });
        checked[2] = selectedIndex[2] = index2;
      } else {
        index0 = 0;
      }
    }
    creatList(city, first);
    creatList(city[selectedIndex[0]].sub, second);
    creatList(city[selectedIndex[0]].sub[selectedIndex[1]].sub, third);
  }

  function _addListener(picker) {
    picker.on('picker.select', function (selectedVal, selectedIndex) {
  	  var text1 = first[selectedIndex[0]].text;
  	  var text2 = second[selectedIndex[1]].text;
  	  var text3 = third[selectedIndex[2]] ? third[selectedIndex[2]].text : '';
      defaultOpt.select && defaultOpt.select(text1, text2, text3);
  	});

  	picker.on('picker.change', function (index, selectedIndex) {
  	  if (index === 0){
  	    firstChange(selectedIndex, picker);
  	  } else if (index === 1) {
  	    secondChange(selectedIndex, picker);
  	  }
  	});

  	_nameEl.on('click', function (e) {
      e.preventDefault();
  		picker.show();
  	});
  }

  const CITY_PICKER = {
    init: function(option) {
      option = option || {};
      defaultOpt = $.extend(defaultOpt, option);
      _nameEl = $(defaultOpt.id);
      _initSelectIndex();
      var picker = new Picker({
    		data: [first, second, third],
    		selectedIndex: selectedIndex,
    		title: '地址选择'
    	});
      _addListener(picker);
    }
  };

  return CITY_PICKER;
});
