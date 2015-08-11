
/*
* 阳历日历脚本，不包含农历及预览 主要用于日期选择
* view: fixed   表示包含solar 及lunar日历视图混合
* preview:  表示需要右侧显示详情视图
 */
define(['lib/fsyCalendar/fsyCalendar'], function() {
  return function(opt) {
    var calBox, calView, iptCalendar, target;
    target = null;
    opt || (opt = {});
    calBox = $('.input-calendar');
    iptCalendar = $('.text-calendar');
    calView = iptCalendar.on({
      focus: function(E) {
        target = $(this);
        if (calBox.attr('fc-fidx')) {
          calBox.fsyCalendar('gotoDate', target.val());
          return calBox.show();
        } else {
          return calView = calBox.fsyCalendar({
            weekMode: 'variable',
            date: target.val(),
            view: 'solar',
            theme: 'date-picker',
            vacation: 0,
            preview: 0,
            toolbar: 13,
            festival: 0,
            dayRefer: 0,
            dayClick: function(e, cell, view, box, data) {
              var date;
              console.log(e);
              console.log(data);
              if ($.isFunction(opt.beforeIptChange) && opt.beforeIptChange(e, cell, view, box, target, data) === false) {
                return;
              }
              date = cell.data('date');
              target.val(date);
              calBox.hide();
              return $.isFunction(opt.afterDayClick) && opt.afterDayClick(e, cell, view, box, target, data);
            },
            beforeShow: function(box, view) {
              var _pos;
              _pos = target.position();
              if ($.isFunction(opt.beforeCalShow) && opt.beforeCalShow(box, view, target, _pos) === false) {
                return;
              }
              return calBox.css({
                top: _pos.top,
                left: _pos.left + target.width()
              }).show();
            }
          });
        }
      },
      click: function(e) {
        $.isFunction(opt.afterIptClick) && opt.afterIptClick(e, calBox, calView, $(this));
        return e.stopPropagation();
      }
    });
    calBox.click(function(e) {
      $.isFunction(opt.afterCalClick) && opt.afterCalClick(e, calBox, calView, $(this));
      return e.stopPropagation();
    });
    return $('body').click(function(e) {
      e.stopPropagation();
      return calBox.hide();
    });
  };
});
