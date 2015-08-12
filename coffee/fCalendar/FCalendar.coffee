
define ->
  ###*
   * @constructor FCalendar
   * @desc 日历插件构造函数
   * @param { JqueryDOM} obj  渲染日历依赖的 jquery DOM 元素
   * @param {Object} [conf]  配置参数@see {@link conf}
   *
  ###
  FCalendar = (obj,conf) ->
    self = @
    self._HASLIST = []
    idx = 0
    self.conf = conf
    self.fidx = ++idx
    return unless obj.length
    obj.attr('fc-fidx',idx).addClass('fc-fidx-' + idx + ' ' + (self.conf.theme || 'intact'))
    unless $('#fsycalendar-' + self.conf.theme).length
      $('<link rel="stylesheet" type="text/css" href="' + SX.eve + '/css/calendar-' + self.conf.theme + '.css" id="fsycalendar-' + self.conf.theme + '"/>').appendTo('head')
    #骨架
    shelf = _calShelf(self).appendTo(obj)
    _changeView(self,obj,null,true)
    _bindEvent(obj,self)
    if +self.conf.preview
      fcBody = shelf.find('.ui-fc-body')
      preview = $(_calPreview(self.conf))
      $.isFunction(self.conf.beforeShowPreview) and self.conf.beforeShowPreview(preview,obj,self,true)
      preview.insertAfter(fcBody)
      fcBody.addClass('f-fl br2').css('width',100 - self.conf.preview + '%')
    $.isFunction(self.conf.beforeShow) and self.conf.beforeShow(obj,self,true)
    shelf.show()
    $.isFunction(self.conf.afterShow) and self.conf.afterShow(obj,self,true)
    SX.calendars[idx] = self
    self


  ###*
   * 日历视图刷新方法
   * @param  {Date|fDateSolar|string|Array} date      需要渲染的日期
   * @return {FCalendar}      FCalendar实例对象
  ###
  FCalendar::changeView = (date)->
    self = @
    fcEle = $('.fc-fidx-' + self.fidx)
    _changeView(self,fcEle,date)
    $.isFunction(self.conf.beforeShow) and self.conf.beforeShow(fcEle,self,false)
    $.isFunction(self.conf.afterShow) and self.conf.afterShow(fcEle,self,false)
    self

  ###*
   * 日期处理函数
   * @extends {fDateSolar}
  ###
  FCalendar::fDateSolar = fDateSolar


  ###*
   * 本月有多少天属于上个月
   * @param  {number|string} y 四位数的年份
   * @param  {number|string} m 月份
   * @return {number}   属于上月的天数
  ###
  FCalendar::daysOfPrevMonth = (y,m)->
    _weekNum = oDate.dayOfWeek([y,m,1])
    if ~_weekNum
      if _weekNum > @.conf.firstDay  #如果当前星期几大于第一天  直接减
        _days = _weekNum - @.conf.firstDay
      else if _weekNum is +@.conf.firstDay
        _days = 0
      else
        _days = 6 - @.conf.firstDay + 1 + _weekNum
    _days || 0


  ###*
   * 本月有多少天属于下月
   * @param  {number|string} y 四位数的年份
   * @param  {number|string} m 月份
   * @return {number}   属于下月的天数
  ###
  FCalendar::daysOfNextMonth = (y,m)->
    (if @.conf.weekMode is 'fixed' then 6 else @.weeksOfMonth(y,m))  * 7 - @.daysOfPrevMonth(y,m) - oDate.daysOfMonth(y,m)


  #判断当前视图下月份里中有几个星期
  ###*
   * 判断当前视图中月包含几个星期
   * @param  {number|string} y         四位数年份
   * @param  {number|string} m         月份
   * @param  {number|string} [totalDays] 月份一共包含多少天
   * @return {number}
  ###
  FCalendar::weeksOfMonth = (y,m,totalDays)->
    overDays = (totalDays || oDate.daysOfMonth(y,m)) - 7 + @.daysOfPrevMonth(y,m)
    Math.ceil(overDays / 7) + 1 || 0


  ###*
   * 根据条件返回一个日期范围
   * @param
   * @return {Array} 日期范围
  ###
  FCalendar::limit = ->
    _arg = arguments
    if $.isArray(arguments[0])
      _arg = arguments[0]
    range = []
    _referDate = fDateSolar(_arg[2])
    _referDate = _referDate._isLegal and _referDate || fDateSolar()
    i = 0
    hasNum = false
    while i < 2
      if _arg[i] #参考日期
        if $.isNumeric(_arg[i])
          range[i] = _referDate.add(_arg[i])
          hasNum = true
        else if (_date = fDateSolar(_arg[i])) and _date._isLegal
          range[i] = _date
      else
        range[i] = oDate
      ++i
    if range[0].diff(range[1]) < 0
      range = [range[1],range[0]]
    if _referDate.diff(range[0]) < 0  and _referDate.diff(range[1]) > 0
      range = [oDate,oDate]
    range

  FCalendar