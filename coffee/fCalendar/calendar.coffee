###
* 混合日历脚本
* view: fixed   表示包含solar 及lunar日历视图混合
* preview:  表示需要右侧显示详情视图
* beforeShow函数要被调用 显示出节假日安排,将节假日放到节假日安排的选择框中 由三部分组成 0101月日【必选】  *|# 节假日图标【可选】  *表示节假日上班图标 无表示休息图标 #表示无节假日图标 xxxx节假日名称，表示必须加入到快速切换中【可选】 如0101*元旦 表示0101元旦上班 0102#元旦 表示必须加入到快捷切换且无vacation按钮
###
define ['./conf','./preview'],(calendar,preview)->
  dReg = /(\d{2})(\d{2})(\*|\#)?(.+)?/
  yReg = /\d{4}/
  y = null
  nowYear = new Date().getFullYear()
  (obj)->
    loading = obj.siblings('.J_loading-box')
    cal = obj.fsyCalendar  #生成日历  返回的是seajs的对象
      weekMode: 'variable'
      dayClick: (e,cell,view,box,data)->
        preview(e,cell,view,box,data)
      beforeShow:(obj,view)->
        loading.show()
        if view.conf.vacation
          vacationList = obj.find('.list-vacation-cont')
          str = '<li class="dropdown-option">假期安排</li>'
          renderVacation = (vacations,year)->
            $.each vacations,(i,j)->
              dArr = j.match(dReg)
              if dArr
                s = year + '-' + dArr[1] + '-' + dArr[2]
                y isnt year and dArr[4] and str += '<li class="dropdown-option" data-value="' + s + '">' + dArr[4] + '</li>'
                if dArr[3] isnt '#' and s >= view.start and s <= view.end
                  icon = '<span class="fc-day-vacation ' + (if dArr[3] then 'vacation-work">班' else 'vacation-rest">休') + '</span>'
                  obj.find('.fc-day-td[data-date="' + s + '"] .fc-day-cell').append(icon)
              true
          vacation = (year)->
            vacations = SX.vacations[year]
            if vacations
              renderVacation(vacations,year)
            else
              return if year < nowYear - 1 or year > nowYear + 1
              $.get '/aq/sc?f=getHoliday&c=cals&year=' + year
              .done (json)->
                d = $.parseJSON json
                !d.status and renderVacation(d.data.holiday,year)
          vacation(view.year)
          y isnt view.year and  vacationList.html(str) and y = view.year #年份变后切换显示假期安排
          startYear = yReg.exec(view.start)[1]
          endYear = yReg.exec(view.end)[1]
          if startYear isnt endYear
            vacation(if startYear is view.year then endYear else startYear)
      afterShow: (obj,view,isFirst)->
        loading.hide()
        td = obj.find('.fc-day-cur')
        !td.length and td = obj.find('.fc-day-today')
        !td.length and  td = obj.find('.fc-day-first:not(".fc-day-other")')
        td.trigger('click.calendar')
      beforeShowPreview: (_preview,obj,self)->
        cont = _preview.find('.preview-cont')
        cont.on 'mouseenter','.preview-refer',->
          self = $(@)
          if self.find('br').length
            $('.preview-refer-all').show()
        cont.on 'mouseleave','.preview-refer',->
          $('.preview-refer-all').hide()
      afterShowPreview: (_preview,cell,box,view)->
        date = cell.data('date').replace(/-/g,'')
        suit = _preview.find('.suit')
        suitAll = _preview.find('.suit-all')
        avoid = _preview.find('.avoid')
        avoidAll = _preview.find('.avoid-all')
        suitAvoid = (yi,ji)->
          suitAll.html('<i>宜</i>' + yi)
          suit.html '<i>宜</i>' + yi.replace /\s+/g,'<br/>'
          avoidAll.html('<i>忌</i>' + ji)
          avoid.html '<i>忌</i>' + ji.replace /\s+/g,'<br/>'
        unless (refer = SX.lunarYJ[date])
          return if date < 20141231 or date > 20251231
          $.get '/aq/sc?f=getCalYj&c=cals&date=' + date
          .done (json)->
            d = $.parseJSON(json)
            unless d.status
              refer = d.data.list[date]
              refer and suitAvoid(refer.yi,refer.ji)
              $.extend true,SX.lunarYJ,d.data.list
        else
          suitAvoid(refer.yi,refer.ji)

