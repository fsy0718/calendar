###
* 日历点击预览日期详情  包含阳历 星期 农历相关信息  宜忌 及天气预报【可能不会有】
* @param {Object} e 点击事件的对象,是经过jquery包装的对象
* @param {Object} cell 当前点击的target 为td
* @param {Object} view 当前日历的实例
* @param {Object} box 当前调用日历函数的元素
* @param {Object} 需要传递给事件的其余参数
###
define ->
  weekZh = '日一二三四五六'
  weekReg = /\bday-d(\d)\b/  #不能加修饰符g 下次点击会从lastIndex寻找  从 day-d5中找出5
  (e,cell,view,box,data)->
    preview = box.find('.preview-cont')
    week = weekReg.exec(cell.attr('class')) #检测出星期几
    _date = cell.data('date')
    #阳历 日期与星期
    date = '<div class="preview-solar f-posr" style="height:' + (view.conf.toolbar || 10) + '%"><div class="preview-date f-posa"><span class="day">' + _date + '</span><span class="week">星期' + weekZh.charAt(week[1]) + '</span></div></div>'
    #阳历日
    day = '<span class="preview-day f-dib">' + cell.find('.fc-day-solar').text() + '</span>'
    if view.conf.view isnt 'solar'
      #农历日期
      thisLunar = cell.data('lunar')
      lunarDate = view.fDateLunar(thisLunar,cell.data('leap'))
      ymd = lunarDate.parseDate(_date)
      lunar = '<div class="preview-lunar"><p class="date">' + lunarDate.lunarMonthText() + '月' + lunarDate.lunarDayText() + '</p>'
      chineseEra = lunarDate.chineseEra(ymd[0],ymd[1],ymd[2])
      lunar += '<p class="year">' + chineseEra[0] + '&nbsp;&nbsp;[' + lunarDate.zodiac() + '年]</p><p class="day">' + chineseEra[1] + '&nbsp;&nbsp;' + chineseEra[2] + '</p></div>'
      #添加宜忌
      lunar += '<div class="preview-refer f-posr f-cb"><div class="preview-refer-all f-posa"><p class="suit-all"></p><p class="avoid-all"></p></div><span class="suit f-fl"></span><span class="avoid f-fr"></span>'
    else
      lunar = ''
    preview.html(date + day + lunar)
    $.isFunction(view.conf.afterShowPreview) and view.conf.afterShowPreview(preview,cell,box,view)
