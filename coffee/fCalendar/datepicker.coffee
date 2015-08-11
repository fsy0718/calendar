###
* 阳历日历脚本，不包含农历及预览 主要用于日期选择
* view: fixed   表示包含solar 及lunar日历视图混合
* preview:  表示需要右侧显示详情视图
###
define ['./conf'],->
  (opt)->
    target = null
    opt ||= {}
    calBox = $('.input-calendar')
    iptCalendar = $('.text-calendar')
    calView = iptCalendar.on
      focus:(E)->
        target = $(@)
        if calBox.attr('fc-fidx')
          calBox.fsyCalendar('gotoDate',target.val())
          calBox.show()
        else
          calView = calBox.fsyCalendar  #生成日历  返回的是seajs的对象
            weekMode: 'variable'
            date: target.val()
            view: 'solar'
            theme: 'date-picker'
            vacation: 0
            preview: 0
            toolbar: 13
            festival: 0
            dayRefer: 0
            dayClick: (e,cell,view,box,data)->
              console.log e
              console.log data
              return if $.isFunction(opt.beforeIptChange) and opt.beforeIptChange(e,cell,view,box,target,data) is false
              date = cell.data('date')
              target.val(date)
              calBox.hide()
              $.isFunction(opt.afterDayClick) and opt.afterDayClick(e,cell,view,box,target,data)
            beforeShow: (box,view)->
              _pos = target.position()
              return if $.isFunction(opt.beforeCalShow) and opt.beforeCalShow(box,view,target,_pos) is false
              calBox.css
                top: _pos.top
                left: _pos.left + target.width()
              .show()
      click: (e)->
        $.isFunction(opt.afterIptClick) and opt.afterIptClick(e,calBox,calView,$(@))
        e.stopPropagation()
    calBox.click (e)->
      $.isFunction(opt.afterCalClick) and opt.afterCalClick(e,calBox,calView,$(@))
      e.stopPropagation()

    $('body').click (e)->
      e.stopPropagation()
      calBox.hide()