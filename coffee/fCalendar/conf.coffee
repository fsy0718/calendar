###
* 日历
* author: fsy0718@yeah.net
* LICENSE： MIT
###
define ["lib/fsyCalendar/core"],(FCalendar)->
  oDate = new Date()
  year = oDate.getFullYear()
  month = oDate.getMonth() + 1
  day = oDate.getDate()
  _conf =
    date: [ year, month, day ].concat() #默认显示日期
    resetday: '0,6' #星期日  星期六休息
    festival: true #显示节日
    vacation: true #显示假期安排
    solarTerm: true #显示节气
    preview: 30 #预览日的事件的比例，如果不需要显示显设置为0或者false
    dayRefer: true #显示宜忌
    toolbar: 11.33 # 显示工具栏的比例
    firstDay: 1 #第一天 默认为星期一
    showOtherDays: true   #显示其他月的天数
    selectDay: false  #初始化选中的天数
    dayPrefix: ''
    theme: 'intact'
    weekMode: 'fixed' #日历视图的高度  如果为fixed  则固定为6周  如果为 'variable' 高度则变化
    view: 'fixed' #主视图是阳历还是农历  可选值为solar  lunar fixed
    limit: false  #日期的限定范围
    max: 2050
    min: 1901  #TODO 1900年日历出问题

  $.fn.fsyCalendar = (opt,date)->
    self = $(@)
    if $.isPlainObject(opt)
      conf = $.extend true,{},_conf,opt
    else
      conf = $.extend true,{},_conf
      if opt is 'gotoDate'  #重用以前的实例
        idx = self.attr('fc-fidx')
        if idx and fcObj = SX.calendars[idx]
          _d = fcObj.fDateSolar(date)
          _today = fcObj.fDateSolar()
          d = if _d._isLegal then _d else _today
          if d.format('-') is _today.format('-')
            today = self.find('.fc-day-today')
            if today.length
              unless today.hasClass('fc-day-cur')
                #如果gotoDate不存在的date不存在，返回到当前日期，但不触发dayClick事件，这样可以减少datepicker中的点击自动选择日历的bug
                date and today.trigger('click.calendar')
                return fcObj
          return fcObj.changeView(d)
        else
          d = FCalendar::fDateSolar(date)
          conf.date = if d._isLegal then d else FCalendar::fDateSolar()
      else
        solarDate = FCalendar::fDateSolar(date)
        conf.date = solarDate._isLegal and solarDate._a || conf.date
    if conf.limit
      range = FCalendar::limit(conf.limit)
      _fnlimit = conf.beforeShowDay
      conf.beforeShowDay = (ymd,td,tableView,view)->
        ymdSolarDate = FCalendar::fDateSolar(ymd)
        if ymdSolarDate.diff(range[0]) > 0  or ymdSolarDate.diff(range[1]) < 0 #不在范围内
          td.addClass('fc-day-other')
        $.isFunction(_fnlimit) and _fnlimit(ymd,td,tableView,view)
    if /^lunar|fixed$/.test conf.view
      require ['lib/fsyCalendar/lunarView'],(lunarConf)->
        _fnDay = conf.beforeShowDay
        _fnView = conf.beforeShow
        conf.beforeShowDay =  (ymd,td,tableView,view)->
          lunarConf.beforeShowDay(ymd,td,tableView,view)
          $.isFunction(_fnDay) and _fnDay(ymd,td,tableView,view)
        conf.beforeShow = (obj,view)->
          lunarConf.beforeShow(obj,view)
          $.isFunction(_fnView) and _fnView(obj,view)
        new FCalendar(self,conf)
    else
      new FCalendar(self,conf)

