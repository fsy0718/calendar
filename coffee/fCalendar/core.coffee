###
* 日历核心模块
* month 统一从1开始计数
###
define ['fDateSolar'],(fDateSolar)->
  weekZh = '日一二三四五六'
  weekN = '0123456'
  oDate = fDateSolar()
  today = oDate.format('-')
  #内部状态变量
  SELDAY = null  #表示当前选中的日期
  YEAR = null   #表示需要跳转的年份 便于点击月份切换后年份跟着变动
  FCalendar = (obj,conf) ->
    self = @
    self._HASLIST = []
    idx = 0
    self.conf = conf
    self.fidx = ++idx
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

  _bindEvent = (obj,_c)->
    #日期点击事件
    obj.on 'click.calendar','.fc-day-td',(e,eData)->
      self = $(@)
      #点击上一个月或下一个月，切换到对应的日期视图上
      if self.hasClass('fc-day-other')
        obj.fsyCalendar('gotoDate',self.data('date'))
      else
        obj.find('.fc-day-cur').removeClass('fc-day-cur')
        self.addClass('fc-day-cur')
        $.isFunction(_c.conf.dayClick) and _c.conf.dayClick(e,self,_c,obj,eData)
    listBox = obj.find('.list-box')
    unless _c._HASLIST.length #body只绑定一次事件
      $('body').on 'click.date',->
        listBox.is(':visible') and listBox.hide()
        _c._HASLIST.push(true)
    if +_c.conf.toolbar  #顶部快切换事件
      toolbar = obj.find('.ui-fc-toolbar')
      toolbar.on 'click.date','.J_change-date',(e,eData)->
        e.stopPropagation()
        e.preventDefault()
        listBox.hide()
        self = $(@)
        act = self.attr('action')
        if self.hasClass('J_change-view')  #显示下拉列表
          list = listBox.filter('.list-' + act + '-box').show()
          act is 'year' and list.scrollTop(0).scrollTop(list.find('.dropdown-option-selected').position().top) #先取值，再隐藏
        else if self.hasClass('fc-icon')
          listBox.hide()
          if act is 'vacation'
            listBox.filter('.list-vacation-box').show()
          else
            dirTarget = /^(\w+)-(\w+)$/.exec(act)
            targetObj = obj.find('.list-' + dirTarget[2] + '-cont .dropdown-option-selected')[dirTarget[1]]()
            if targetObj.length
              targetObj.trigger('click.calOpt')
            else if dirTarget[2] is 'month'
              targetObj = obj.find('.list-year-cont .dropdown-option-selected')[dirTarget[1]]()
              if targetObj.length
                YEAR = targetObj.data('value')
                obj.find('.list-month-cont .dropdown-option').eq(if dirTarget[1] is 'next' then 0 else 11).trigger('click.calOpt')
        else if self.hasClass('fc-sel-today')
          obj.fsyCalendar('gotoDate','today')
      toolbar.on 'click.calOpt','.dropdown-option',(e,eData)->
        self = $(@)
        ul = self.parent()
        unless self.hasClass('dropdown-option-selected')
          type = ul.data('type')
          val = self.data('value')
          date = if type is 'vacation' then val else if type is 'year' then val + '-' + _c.month else (YEAR || _c.year) + '-' + val
          if date
            YEAR = null
            SELDAY = if date.length > 9 then null else obj.find('.fc-day-cur .fc-day-solar').text()
            obj.fsyCalendar('gotoDate',date)
        ul.parent().hide()
    _c

  _calShelf = (_c)->
    $('<div class="ui-fc-box f-dn"><div class="ui-fc-body"><div class="ui-fc-cont"><div class="ui-fc-tbox" style="height:100%"><table class="ui-fc-table"><thead><tr class="ui-fc-head"></tr></thead><tbody></tbody></table></div></div></div></div>')

  _rWeekN = (_c)->
    weekN.substring(_c.conf.firstDay,7) + weekN.substring(0,_c.conf.firstDay)

  _calHeader = (_c)->
    _newWeeks = weekZh.substring(_c.conf.firstDay,7) + weekZh.substring(0,_c.conf.firstDay)
    _newWeekN = _rWeekN(_c)
    i = 0
    weeks = ''
    while i < 7
      idx = _newWeekN.charAt(i)
      thClass = 'fc-day-h' + idx
      if ~_c.conf.resetday.indexOf(idx)
        thClass += ' fc-day-reset'
      #TODO 后期再考虑是否需要创建每一个th都加一个回调函数
      weeks += '<th class="fc-day-head ' + thClass + '">' + (_c.conf.dayPrefix || '') + _newWeeks.charAt(i) + '</th>'
      i++
    weeks

  _calSelYear = (conf)->
    str = '<div class="list-year-box list-box f-dn"><ul class="list-year-cont" data-type="year">'
    i = conf.min
    while i <= conf.max
      str += '<li class="dropdown-option" data-value="' + i + '">' + i + '年</li>'
      i++
    str + '</ul></div>'

  _calSelMonth = (conf)->
    str = '<div class="list-month-box list-box f-dn"><ul class="list-month-cont" data-type="month">'
    i = 1
    while i < 13
      str += '<li class="dropdown-option" data-value="' + i + '">' + i + '月</li>'
      i++
    str + '</ul></div>'

  _calSelVacation = (conf)->
    '<div class="list-vacation-box list-box f-dn"><ul class="list-vacation-cont" data-type="vacation"><li class="dropdown-option">假期安排</li></ul>'


  _calToolbar = (_c)->
    str = '<div class="fc-sel-year ui-fc-sel"><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date prev" action="prev-year"></a><button class="year ui-fc-dropdown J_change-date J_change-view " action="year" ></button><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date next" action="next-year"></a></div>'
    str += '<div class="fc-sel-month ui-fc-sel"><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date prev" action="prev-month"></a><button class="month ui-fc-dropdown J_change-date J_change-view " action="month"></button><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date next" action="next-month"></a></div>'
    _c.conf.vacation and str += '<div class="fc-sel-vacation ui-fc-sel"><button class="vacation J_change-view J_change-date  ui-fc-dropdown" action="vacation">假期安排</button><a href="javascript:;" hidefocus="true" class="fc-icon J_change-date down" action="vacation"></a></div>'
    str += '<a href="javascript:;" hidefocus="true" class="fc-sel-today J_change-date">返回今天</a>'
    str + '<div class="fc-toolbar-list">' + _calSelYear(_c.conf) + _calSelMonth(_c.conf) + _calSelVacation(_c.conf) + '</div>'

  _calCells = (date,tableView,week,_c)->
    _newWeekN = _rWeekN(_c)
    i = 0
    lastDay = 0
    tbody = tableView.find('tbody')
    prevDays = _c.daysOfPrevMonth(date[0],date[1])
    nextDays = _c.daysOfNextMonth(date[0],date[1])
    curDays = oDate.daysOfMonth(date[0],date[1])
    _c.month = date[1]
    if prevDays
      _c.prevM = date[1] - 1
    if nextDays
      _c.nextM = +date[1] + 1
    _c.year = date[0]
    _c.idx = 0   #计数  只计算一次农历 其余的进行推导
    if tbody.find('tr').length
      tbody.html('')
    while i < week
      tr = $('<tr></tr>').appendTo(tbody)
      j = 0
      while j < 7
        idx = _newWeekN.charAt(j)
        tdClass = ' day-d' + idx
        mOffset = 0
        if prevDays
          --prevDays
          if date[1] - 1
            prevMonthDays = oDate.daysOfMonth(date[0],date[1]-1)
          else
            prevMonthDays = oDate.daysOfMonth(date[0] - 1,12)
          curday = prevMonthDays - prevDays
          tdClass += ' fc-day-other fc-prev-month'
          mOffset =  - 1
        else if lastDay >= curDays
          curday = ++lastDay - curDays
          tdClass += ' fc-day-other fc-next-month'
          mOffset = 1
        else
          curday = ++lastDay
        _m = +date[1] + mOffset
        _y = +date[0]
        if _m > 12
          _m = _m - 12
          _y = +date[0] + 1
        else if _m < 1
          _m = _m + 12
          _y = +date[0] - 1
        dStr = digit(curday)
        ymd = _y + '-' + digit(_m) + '-' + dStr
        tdClass += ' fc-day-d' + dStr
        if curday is 1
          tdClass += ' fc-day-first'
        _c.conf.resetday and ~_c.conf.resetday.indexOf(idx) and  tdClass += ' fc-day-reset'
        td = $('<td' + (if !_c.conf.showOtherDays and mOffset  then '>' else ' class="fc-day-td' + tdClass + '" data-date="' + ymd + '"><a href="javascript:;" class="fc-day-cell"><span class="fc-day-solar">' + curday + '</span></a>') + '</td>')
        unless i or j
          _c.start = ymd
        else if i is week - 1 and j is 6
          _c.end = ymd
        j++
        $.isFunction(_c.conf.beforeShowDay) and _c.conf.beforeShowDay(ymd,td,tableView,_c)
        td.appendTo(tr)
      i++
    todayStr = fDateSolar().format('-')
    _c.start <= todayStr  and todayStr <= _c.end and  tbody.find('.fc-day-td[data-date="' + todayStr + '"]').addClass('fc-day-today')
    if SELDAY
      tbody.find('.fc-day-d' + (if SELDAY < 10 then '0' + SELDAY else SELDAY) + ':not(".fc-day-other")').addClass('fc-day-cur')
      SELDAY = null  #只用一次后清除
    else
      tbody.find('.fc-day-td[data-date="' + date[0] + '-' + date[1] + '-' + date[2] + '"]').addClass('fc-day-cur')
    if _c.conf.selectDay
      if $.isArray(_c.conf.selectDay) and _c.conf.selectDay.length is 1 and (selectDay = _c.conf.selectDay[0]) or typeof (selectDay = +_c.conf.selectDay) is 'number'
        tbody.find('.fc-day-d' + digit(selectDay) + ':not(".fc-day-other")').addClass('fc-day-sel')
      else if $.isArray _c.conf.selectDay
        if _c.conf.selectDay.length is 2
          selectDay = date[0] + '-' + digit(_c.conf.selectDay[0]) + '-' + digit(_c.conf.selectDay[1])
        else
          selectDay = digit(_c.conf.selectDay[0]) + '-' + digit(_c.conf.selectDay[1]) + '-' + digit(_c.conf.selectDay[2])
        tbody.find('.fc-day-td[data-date="' + selectDay + '"]').addClass('fc-day-sel')
    _c.idx = 0  #重置计数器
    _c


  _calPreview = (conf)->
    '<div class="ui-fc-preview f-fr" style="width:' + conf.preview + '%"><div class="preview-cont"></div></div>'

  _changeView = (_c,tableView,date,first)->
    d = _c.fDateSolar(date || _c.conf.date)
    d = (if d._isLegal then d else oDate)._a
    weekNum = if _c.conf.weekMode is 'fixed' then 6 else _c.weeksOfMonth(d[0],d[1])
    if first
      #头部
      vh = tableView.height()
      tbH = (vh * (100 - (+_c.conf.toolbar || 0)) / 100) * .9545  - weekNum - 1
      tableView.find('.ui-fc-head').append(_calHeader(_c)).find('th').eq(0).css('height',Math.ceil(tbH * .127 ) + 'px')
    if +_c.conf.toolbar
      unless tableView.find('.ui-fc-toolbar').length
        $('<div class="ui-fc-toolbar" style="height:' + _c.conf.toolbar + '%">' + _calToolbar(_c) + '</div>').prependTo(tableView.find('.ui-fc-cont'))
        tableView.find('.ui-fc-tbox').css('height',100 - _c.conf.toolbar  + '%')  #日历日期显示区域的高度
        tableView.find('.list-year-box').css('height',vh * 0.7)
      tableView.find('.J_change-view.year').val(d[0]).text(d[0] + '年')
      tableView.find('.J_change-view.month').val(+d[1]).text(+d[1] + '月')
      tableView.find('.dropdown-option-selected').removeClass('dropdown-option-selected')
      tableView.find('.list-year-cont .dropdown-option[data-value="' + +d[0] + '"],.list-month-cont .dropdown-option[data-value="' + +d[1] + '"]').addClass('dropdown-option-selected')
    _calCells(d,tableView,weekNum,_c)

  digit = (num)->
    if num < 10 then '0' + (num|0) else num + ''

  FCalendar::changeView = (date)->
    self = @
    fcEle = $('.fc-fidx-' + self.fidx)
    _changeView(self,fcEle,date)
    $.isFunction(self.conf.beforeShow) and self.conf.beforeShow(fcEle,self,false)
    $.isFunction(self.conf.afterShow) and self.conf.afterShow(fcEle,self,false)
    self

  FCalendar::fDateSolar = fDateSolar

  #本月有多少天属于上个月
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

  #本月有多少天属于下月
  FCalendar::daysOfNextMonth = (y,m)->
    (if @.conf.weekMode is 'fixed' then 6 else @.weeksOfMonth(y,m))  * 7 - @.daysOfPrevMonth(y,m) - oDate.daysOfMonth(y,m)

  #判断当前视图下月份里中有几个星期
  FCalendar::weeksOfMonth = (y,m,totalDays)->
    overDays = (totalDays || oDate.daysOfMonth(y,m)) - 7 + @.daysOfPrevMonth(y,m)
    Math.ceil(overDays / 7) + 1 || 0

  #将限制条件转换成日期范围  如果起始值都为日期，则参考值失效
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
