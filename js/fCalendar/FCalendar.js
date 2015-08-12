define(function() {

  /**
   * @constructor FCalendar
   * @desc 日历插件构造函数
   * @param { JqueryDOM} obj  渲染日历依赖的 jquery DOM 元素
   * @param {Object} [conf]  配置参数@see {@link conf}
   *
   */
  var FCalendar;
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

  /**
   * 日历视图刷新方法
   * @param  {Date|fDateSolar|string|Array} date      需要渲染的日期
   * @return {FCalendar}      FCalendar实例对象
   */
  FCalendar.prototype.changeView = function(date) {
    var fcEle, self;
    self = this;
    fcEle = $('.fc-fidx-' + self.fidx);
    _changeView(self, fcEle, date);
    $.isFunction(self.conf.beforeShow) && self.conf.beforeShow(fcEle, self, false);
    $.isFunction(self.conf.afterShow) && self.conf.afterShow(fcEle, self, false);
    return self;
  };

  /**
   * 日期处理函数
   * @extends {fDateSolar}
   */
  FCalendar.prototype.fDateSolar = fDateSolar;

  /**
   * 本月有多少天属于上个月
   * @param  {number|string} y 四位数的年份
   * @param  {number|string} m 月份
   * @return {number}   属于上月的天数
   */
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

  /**
   * 本月有多少天属于下月
   * @param  {number|string} y 四位数的年份
   * @param  {number|string} m 月份
   * @return {number}   属于下月的天数
   */
  FCalendar.prototype.daysOfNextMonth = function(y, m) {
    return (this.conf.weekMode === 'fixed' ? 6 : this.weeksOfMonth(y, m)) * 7 - this.daysOfPrevMonth(y, m) - oDate.daysOfMonth(y, m);
  };

  /**
   * 判断当前视图中月包含几个星期
   * @param  {number|string} y         四位数年份
   * @param  {number|string} m         月份
   * @param  {number|string} [totalDays] 月份一共包含多少天
   * @return {number}
   */
  FCalendar.prototype.weeksOfMonth = function(y, m, totalDays) {
    var overDays;
    overDays = (totalDays || oDate.daysOfMonth(y, m)) - 7 + this.daysOfPrevMonth(y, m);
    return Math.ceil(overDays / 7) + 1 || 0;
  };

  /**
   * 根据条件返回一个日期范围
   * @param
   * @return {Array} 日期范围
   */
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
