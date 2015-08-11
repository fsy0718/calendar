
/**
 * @module core
 * @desc 日历核心模块
 * @requires  fDateSolar 公历日期相关扩展方法
 */
define(['./fdate-solar'], function(fDateSolar) {

  /**
   * @inner 星期相关参数
   * @type {string}
   */
  var FCalendar, SELDAY, YEAR, _bindEvent, _calCells, _calHeader, _calPreview, _calSelMonth, _calSelVacation, _calSelYear, _calShelf, _calToolbar, _changeView, _rWeekN, digit, oDate, today, weekN, weekZh;
  weekZh = '日一二三四五六';
  weekN = '0123456';

  /**
   * @inner 当前日期对象
   * @type {fDateSolar}
   */
  oDate = fDateSolar();
  today = oDate.format('-');
  SELDAY = null;
  YEAR = null;

  /**
   * @class FCalendar
   * @desc 日历插件构造函数
   * @param { JqueryDOM} obj  渲染日历依赖的 jquery DOM 元素
   * @param {Object} [conf]  配置参数@see {@link conf}
   *
   */
  FCalendar = function(obj, conf) {
    var fcBody, idx, preview, self, shelf;
    self = this;
    self._HASLIST = [];
    idx = 0;
    self.conf = conf;
    self.fidx = ++idx;
    if (!obj.length) {
      return;
    }
    obj.attr('fc-fidx', idx).addClass('fc-fidx-' + idx + ' ' + (self.conf.theme || 'intact'));
    if (!$('#fsycalendar-' + self.conf.theme).length) {
      $('<link rel="stylesheet" type="text/css" href="' + SX.eve + '/css/calendar-' + self.conf.theme + '.css" id="fsycalendar-' + self.conf.theme + '"/>').appendTo('head');
    }
    shelf = _calShelf(self).appendTo(obj);
    _changeView(self, obj, null, true);
    _bindEvent(obj, self);
    if (+self.conf.preview) {
      fcBody = shelf.find('.ui-fc-body');
      preview = $(_calPreview(self.conf));
      $.isFunction(self.conf.beforeShowPreview) && self.conf.beforeShowPreview(preview, obj, self, true);
      preview.insertAfter(fcBody);
      fcBody.addClass('f-fl br2').css('width', 100 - self.conf.preview + '%');
    }
    $.isFunction(self.conf.beforeShow) && self.conf.beforeShow(obj, self, true);
    shelf.show();
    $.isFunction(self.conf.afterShow) && self.conf.afterShow(obj, self, true);
    SX.calendars[idx] = self;
    return self;
  };
  _bindEvent = function(obj, _c) {
    var listBox, toolbar;
    obj.on('click.calendar', '.fc-day-td', function(e, eData) {
      var self;
      self = $(this);
      if (self.hasClass('fc-day-other')) {
        return obj.fsyCalendar('gotoDate', self.data('date'));
      } else {
        obj.find('.fc-day-cur').removeClass('fc-day-cur');
        self.addClass('fc-day-cur');
        return $.isFunction(_c.conf.dayClick) && _c.conf.dayClick(e, self, _c, obj, eData);
      }
    });
    listBox = obj.find('.list-box');
    if (!_c._HASLIST.length) {
      $('body').on('click.date', function() {
        listBox.is(':visible') && listBox.hide();
        return _c._HASLIST.push(true);
      });
    }
    if (+_c.conf.toolbar) {
      toolbar = obj.find('.ui-fc-toolbar');
      toolbar.on('click.date', '.J_change-date', function(e, eData) {
        var act, dirTarget, list, self, targetObj;
        e.stopPropagation();
        e.preventDefault();
        listBox.hide();
        self = $(this);
        act = self.attr('action');
        if (self.hasClass('J_change-view')) {
          list = listBox.filter('.list-' + act + '-box').show();
          return act === 'year' && list.scrollTop(0).scrollTop(list.find('.dropdown-option-selected').position().top);
        } else if (self.hasClass('fc-icon')) {
          listBox.hide();
          if (act === 'vacation') {
            return listBox.filter('.list-vacation-box').show();
          } else {
            dirTarget = /^(\w+)-(\w+)$/.exec(act);
            targetObj = obj.find('.list-' + dirTarget[2] + '-cont .dropdown-option-selected')[dirTarget[1]]();
            if (targetObj.length) {
              return targetObj.trigger('click.calOpt');
            } else if (dirTarget[2] === 'month') {
              targetObj = obj.find('.list-year-cont .dropdown-option-selected')[dirTarget[1]]();
              if (targetObj.length) {
                YEAR = targetObj.data('value');
                return obj.find('.list-month-cont .dropdown-option').eq(dirTarget[1] === 'next' ? 0 : 11).trigger('click.calOpt');
              }
            }
          }
        } else if (self.hasClass('fc-sel-today')) {
          return obj.fsyCalendar('gotoDate', 'today');
        }
      });
      toolbar.on('click.calOpt', '.dropdown-option', function(e, eData) {
        var date, self, type, ul, val;
        self = $(this);
        ul = self.parent();
        if (!self.hasClass('dropdown-option-selected')) {
          type = ul.data('type');
          val = self.data('value');
          date = type === 'vacation' ? val : type === 'year' ? val + '-' + _c.month : (YEAR || _c.year) + '-' + val;
          if (date) {
            YEAR = null;
            SELDAY = date.length > 9 ? null : obj.find('.fc-day-cur .fc-day-solar').text();
            obj.fsyCalendar('gotoDate', date);
          }
        }
        return ul.parent().hide();
      });
    }
    return _c;
  };
  _calShelf = function(_c) {
    return $('<div class="ui-fc-box f-dn"><div class="ui-fc-body"><div class="ui-fc-cont"><div class="ui-fc-tbox" style="height:100%"><table class="ui-fc-table"><thead><tr class="ui-fc-head"></tr></thead><tbody></tbody></table></div></div></div></div>');
  };
  _rWeekN = function(_c) {
    return weekN.substring(_c.conf.firstDay, 7) + weekN.substring(0, _c.conf.firstDay);
  };
  _calHeader = function(_c) {
    var _newWeekN, _newWeeks, i, idx, thClass, weeks;
    _newWeeks = weekZh.substring(_c.conf.firstDay, 7) + weekZh.substring(0, _c.conf.firstDay);
    _newWeekN = _rWeekN(_c);
    i = 0;
    weeks = '';
    while (i < 7) {
      idx = _newWeekN.charAt(i);
      thClass = 'fc-day-h' + idx;
      if (~_c.conf.resetday.indexOf(idx)) {
        thClass += ' fc-day-reset';
      }
      weeks += '<th class="fc-day-head ' + thClass + '">' + (_c.conf.dayPrefix || '') + _newWeeks.charAt(i) + '</th>';
      i++;
    }
    return weeks;
  };
  _calSelYear = function(conf) {
    var i, str;
    str = '<div class="list-year-box list-box f-dn"><ul class="list-year-cont" data-type="year">';
    i = conf.min;
    while (i <= conf.max) {
      str += '<li class="dropdown-option" data-value="' + i + '">' + i + '年</li>';
      i++;
    }
    return str + '</ul></div>';
  };
  _calSelMonth = function(conf) {
    var i, str;
    str = '<div class="list-month-box list-box f-dn"><ul class="list-month-cont" data-type="month">';
    i = 1;
    while (i < 13) {
      str += '<li class="dropdown-option" data-value="' + i + '">' + i + '月</li>';
      i++;
    }
    return str + '</ul></div>';
  };
  _calSelVacation = function(conf) {
    return '<div class="list-vacation-box list-box f-dn"><ul class="list-vacation-cont" data-type="vacation"><li class="dropdown-option">假期安排</li></ul>';
  };
  _calToolbar = function(_c) {
    var str;
    str = '<div class="fc-sel-year ui-fc-sel"><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date prev" action="prev-year"></a><button class="year ui-fc-dropdown J_change-date J_change-view " action="year" ></button><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date next" action="next-year"></a></div>';
    str += '<div class="fc-sel-month ui-fc-sel"><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date prev" action="prev-month"></a><button class="month ui-fc-dropdown J_change-date J_change-view " action="month"></button><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date next" action="next-month"></a></div>';
    _c.conf.vacation && (str += '<div class="fc-sel-vacation ui-fc-sel"><button class="vacation J_change-view J_change-date  ui-fc-dropdown" action="vacation">假期安排</button><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date down" action="vacation"></a></div>');
    str += '<a href="javascript:;" hidefocus="true" class="fc-sel-today J_change-date">返回今天</a>';
    return str + '<div class="fc-toolbar-list">' + _calSelYear(_c.conf) + _calSelMonth(_c.conf) + _calSelVacation(_c.conf) + '</div>';
  };
  _calCells = function(date, tableView, week, _c) {
    var _m, _newWeekN, _y, curDays, curday, dStr, i, idx, j, lastDay, mOffset, nextDays, prevDays, prevMonthDays, selectDay, tbody, td, tdClass, todayStr, tr, ymd;
    _newWeekN = _rWeekN(_c);
    i = 0;
    lastDay = 0;
    tbody = tableView.find('tbody');
    prevDays = _c.daysOfPrevMonth(date[0], date[1]);
    nextDays = _c.daysOfNextMonth(date[0], date[1]);
    curDays = oDate.daysOfMonth(date[0], date[1]);
    _c.month = date[1];
    if (prevDays) {
      _c.prevM = date[1] - 1;
    }
    if (nextDays) {
      _c.nextM = +date[1] + 1;
    }
    _c.year = date[0];
    _c.idx = 0;
    if (tbody.find('tr').length) {
      tbody.html('');
    }
    while (i < week) {
      tr = $('<tr></tr>').appendTo(tbody);
      j = 0;
      while (j < 7) {
        idx = _newWeekN.charAt(j);
        tdClass = ' day-d' + idx;
        mOffset = 0;
        if (prevDays) {
          --prevDays;
          if (date[1] - 1) {
            prevMonthDays = oDate.daysOfMonth(date[0], date[1] - 1);
          } else {
            prevMonthDays = oDate.daysOfMonth(date[0] - 1, 12);
          }
          curday = prevMonthDays - prevDays;
          tdClass += ' fc-day-other fc-prev-month';
          mOffset = -1;
        } else if (lastDay >= curDays) {
          curday = ++lastDay - curDays;
          tdClass += ' fc-day-other fc-next-month';
          mOffset = 1;
        } else {
          curday = ++lastDay;
        }
        _m = +date[1] + mOffset;
        _y = +date[0];
        if (_m > 12) {
          _m = _m - 12;
          _y = +date[0] + 1;
        } else if (_m < 1) {
          _m = _m + 12;
          _y = +date[0] - 1;
        }
        dStr = digit(curday);
        ymd = _y + '-' + digit(_m) + '-' + dStr;
        tdClass += ' fc-day-d' + dStr;
        if (curday === 1) {
          tdClass += ' fc-day-first';
        }
        _c.conf.resetday && ~_c.conf.resetday.indexOf(idx) && (tdClass += ' fc-day-reset');
        td = $('<td' + (!_c.conf.showOtherDays && mOffset ? '>' : ' class="fc-day-td' + tdClass + '" data-date="' + ymd + '"><a href="javascript:;" class="fc-day-cell"><span class="fc-day-solar">' + curday + '</span></a>') + '</td>');
        if (!(i || j)) {
          _c.start = ymd;
        } else if (i === week - 1 && j === 6) {
          _c.end = ymd;
        }
        j++;
        $.isFunction(_c.conf.beforeShowDay) && _c.conf.beforeShowDay(ymd, td, tableView, _c);
        td.appendTo(tr);
      }
      i++;
    }
    todayStr = fDateSolar().format('-');
    _c.start <= todayStr && todayStr <= _c.end && tbody.find('.fc-day-td[data-date="' + todayStr + '"]').addClass('fc-day-today');
    if (SELDAY) {
      tbody.find('.fc-day-d' + (SELDAY < 10 ? '0' + SELDAY : SELDAY) + ':not(".fc-day-other")').addClass('fc-day-cur');
      SELDAY = null;
    } else {
      tbody.find('.fc-day-td[data-date="' + date[0] + '-' + date[1] + '-' + date[2] + '"]').addClass('fc-day-cur');
    }
    if (_c.conf.selectDay) {
      if ($.isArray(_c.conf.selectDay) && _c.conf.selectDay.length === 1 && (selectDay = _c.conf.selectDay[0]) || typeof (selectDay = +_c.conf.selectDay) === 'number') {
        tbody.find('.fc-day-d' + digit(selectDay) + ':not(".fc-day-other")').addClass('fc-day-sel');
      } else if ($.isArray(_c.conf.selectDay)) {
        if (_c.conf.selectDay.length === 2) {
          selectDay = date[0] + '-' + digit(_c.conf.selectDay[0]) + '-' + digit(_c.conf.selectDay[1]);
        } else {
          selectDay = digit(_c.conf.selectDay[0]) + '-' + digit(_c.conf.selectDay[1]) + '-' + digit(_c.conf.selectDay[2]);
        }
        tbody.find('.fc-day-td[data-date="' + selectDay + '"]').addClass('fc-day-sel');
      }
    }
    _c.idx = 0;
    return _c;
  };
  _calPreview = function(conf) {
    return '<div class="ui-fc-preview f-fr" style="width:' + conf.preview + '%"><div class="preview-cont"></div></div>';
  };
  _changeView = function(_c, tableView, date, first) {
    var d, tbH, vh, weekNum;
    d = _c.fDateSolar(date || _c.conf.date);
    d = (d._isLegal ? d : oDate)._a;
    weekNum = _c.conf.weekMode === 'fixed' ? 6 : _c.weeksOfMonth(d[0], d[1]);
    if (first) {
      vh = tableView.height();
      tbH = (vh * (100 - (+_c.conf.toolbar || 0)) / 100) * .9545 - weekNum - 1;
      tableView.find('.ui-fc-head').append(_calHeader(_c)).find('th').eq(0).css('height', Math.ceil(tbH * .127) + 'px');
    }
    if (+_c.conf.toolbar) {
      if (!tableView.find('.ui-fc-toolbar').length) {
        $('<div class="ui-fc-toolbar" style="height:' + _c.conf.toolbar + '%">' + _calToolbar(_c) + '</div>').prependTo(tableView.find('.ui-fc-cont'));
        tableView.find('.ui-fc-tbox').css('height', 100 - _c.conf.toolbar + '%');
        tableView.find('.list-year-box').css('height', vh * 0.7);
      }
      tableView.find('.J_change-view.year').val(d[0]).text(d[0] + '年');
      tableView.find('.J_change-view.month').val(+d[1]).text(+d[1] + '月');
      tableView.find('.dropdown-option-selected').removeClass('dropdown-option-selected');
      tableView.find('.list-year-cont .dropdown-option[data-value="' + +d[0] + '"],.list-month-cont .dropdown-option[data-value="' + +d[1] + '"]').addClass('dropdown-option-selected');
    }
    return _calCells(d, tableView, weekNum, _c);
  };
  digit = function(num) {
    if (num < 10) {
      return '0' + (num | 0);
    } else {
      return num + '';
    }
  };
  FCalendar.prototype.changeView = function(date) {
    var fcEle, self;
    self = this;
    fcEle = $('.fc-fidx-' + self.fidx);
    _changeView(self, fcEle, date);
    $.isFunction(self.conf.beforeShow) && self.conf.beforeShow(fcEle, self, false);
    $.isFunction(self.conf.afterShow) && self.conf.afterShow(fcEle, self, false);
    return self;
  };
  FCalendar.prototype.fDateSolar = fDateSolar;
  FCalendar.prototype.daysOfPrevMonth = function(y, m) {
    var _days, _weekNum;
    _weekNum = oDate.dayOfWeek([y, m, 1]);
    if (~_weekNum) {
      if (_weekNum > this.conf.firstDay) {
        _days = _weekNum - this.conf.firstDay;
      } else if (_weekNum === +this.conf.firstDay) {
        _days = 0;
      } else {
        _days = 6 - this.conf.firstDay + 1 + _weekNum;
      }
    }
    return _days || 0;
  };
  FCalendar.prototype.daysOfNextMonth = function(y, m) {
    return (this.conf.weekMode === 'fixed' ? 6 : this.weeksOfMonth(y, m)) * 7 - this.daysOfPrevMonth(y, m) - oDate.daysOfMonth(y, m);
  };
  FCalendar.prototype.weeksOfMonth = function(y, m, totalDays) {
    var overDays;
    overDays = (totalDays || oDate.daysOfMonth(y, m)) - 7 + this.daysOfPrevMonth(y, m);
    return Math.ceil(overDays / 7) + 1 || 0;
  };
  FCalendar.prototype.limit = function() {
    var _arg, _date, _referDate, hasNum, i, range;
    _arg = arguments;
    if ($.isArray(arguments[0])) {
      _arg = arguments[0];
    }
    range = [];
    _referDate = fDateSolar(_arg[2]);
    _referDate = _referDate._isLegal && _referDate || fDateSolar();
    i = 0;
    hasNum = false;
    while (i < 2) {
      if (_arg[i]) {
        if ($.isNumeric(_arg[i])) {
          range[i] = _referDate.add(_arg[i]);
          hasNum = true;
        } else if ((_date = fDateSolar(_arg[i])) && _date._isLegal) {
          range[i] = _date;
        }
      } else {
        range[i] = oDate;
      }
      ++i;
    }
    if (range[0].diff(range[1]) < 0) {
      range = [range[1], range[0]];
    }
    if (_referDate.diff(range[0]) < 0 && _referDate.diff(range[1]) > 0) {
      range = [oDate, oDate];
    }
    return range;
  };
  return FCalendar;
});
