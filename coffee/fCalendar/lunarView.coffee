define ['lib/fsyCalendar/core','fDateLunar'],(FCalendar,fDateLunar)->
  solarTerm = ["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
  sFtv = ['0101*元旦','0214情人节','0308妇女节','0312植树节','0422地球日','0431无烟日','0501劳动节','0504青年节','0601儿童节','0606爱眼日','0701建党日','0801建军节','0903抗日战争胜利纪念日','0910教师节','0918九·一八事变纪念日','1001*国庆节','1031万圣节','1111光棍节','1201艾滋病日','1213南京大屠杀纪念日','1224平安夜','1225圣诞节']
  wFtv = ['0527母亲节','0637父亲节','1144感恩节']
  lFtv = ['0101*春节','0115元宵节','0202龙抬头','0505*端午节','0707七夕','0715中元节','0815*中秋节','0909重阳节','1208腊八节']
  lunarMonthDay = 0
  lObj = {}
  leapMonth = 0
  oDate = fDateLunar()
  dReg1 = /\d{4}|\-/g
  dReg2 = /(\d{2})(\d{2})(\*)?(.+)/

  FCalendar::fDateLunar = fDateLunar
  beforeShowDay : (ymd,td,tableView,view)->
    #第一次算出农历 后面不用计算
    unless view.idx
      ymdArr = oDate.parseDate(ymd)
      leapMonth = oDate.hasLeapMonth(ymdArr[0]) #算出闰几月  便于后面加农历
      lObj = oDate.solar2lunar(ymdArr) #当前日期农历信息
      lunarMonthDay = oDate.daysOfLunarMonth(lObj.year,lObj.month) #农历有几个月
      view.idx = 1  #修正计数器
    if lObj.day > lunarMonthDay
      if !leapMonth or lObj.month isnt leapMonth
        lObj.month = +lObj.month + 1
      else if lObj.month is leapMonth and lObj.isLeap
        lObj.month = +lObj.month + 1
        lObj.isLeap = false
      else
        lObj.isLeap = true
      if lObj.month > 12
        lObj.month = 1
        lObj.year = +lObj.year + 1
      else if lObj.month < 1
        lObj.month = 12
        lObj.year -= 1
      lObj.day = 1
    if lObj.day is 1
      lDayText = oDate.lunarMonthText(lObj.month,lObj.isLeap) + '月'
    else
      lDayText = oDate.lunarDayText(lObj.day)
    td.attr('data-lunar',lObj.year + '-' + oDate.digit(lObj.month) + '-' + oDate.digit(lObj.day))
    if lObj.isLeap
      td.attr('data-leap',true)
    $('<span class="fc-day-lunar">' + lDayText  + '</span>').appendTo(td.find('.fc-day-cell'))
    lObj.day = +lObj.day + 1


  beforeShow : (obj,view)->
    #计算出当前月份中的节气是哪天
    if view.conf.solarTerm
      arr = [[view.year,view.month],[view.year,view.month]]
      view.nextM and arr[2] = [+view.year + (if view.nextM is 1 then 1 else 0),view.nextM]
      view.prevM and arr[3] = [+view.year - (if view.prevM is 12 then 1 else 0),view.prevM]
      $.each arr,(i,j)->
        if arr[i]
          t = (arr[i][1] - 1) * 2 + i % 2
          obj.find('.fc-day-td[data-date="' + arr[i][0] + '-' + arr[i][1] + '-' + oDate.digit(oDate.solarTerm(arr[i][0],t)) + '"]').addClass('fc-day-holiday').find('.fc-day-lunar').text(solarTerm[t])
      arr = null
    if view.conf.festival
      tdDay = obj.find('.fc-day-td')
      tdFirst = tdDay.eq(0)
      tdLast = tdDay.filter(':last')
      sStart = tdFirst.data('date').replace(dReg1,'')
      lStartStr = tdFirst.data('lunar')
      lStart = lStartStr.replace(dReg1,'')
      sEnd = tdLast.data('date').replace(dReg1,'')
      lEnd = tdLast.data('lunar').replace(dReg1,'')
      #公历假日
      $.each sFtv,(i,j)->
        arr = j.match(dReg2) || []
        str = arr[1] + arr[2]
        if (sStart > sEnd  and (str >= sStart or str <= sEnd)) or (sStart < sEnd and str >=  sStart and str <= sEnd)
          obj.find('.fc-day-td[data-date$="' + arr[1] + '-' + arr[2] + '"]').addClass('fc-day-holiday').find('.fc-day-lunar').text(arr[4])
        arr = null
        true
      #将除夕加入农历节日中
      if lStart > lEnd
        lFtvClone = lFtv.concat()
        lFtvClone.push('12' + view.fDateLunar(lStartStr).daysOfLunarMonth(null,12) + '除夕')
      else
        lFtvClone = lFtv
      $.each lFtvClone,(i,j)->
        arr = j.match(dReg2) || []
        str = arr[1] + arr[2]
        if (lStart > lEnd and (str >= lStart or str <= lEnd)) or (lStart < lEnd and str >= lStart and str <= lEnd)
          obj.find('.fc-day-td[data-lunar$="' + arr[1] + '-' + arr[2] + '"]').addClass('fc-day-holiday').find('.fc-day-lunar').text(arr[4])
      lFtvClone = null