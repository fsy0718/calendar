
/*
* 混合日历脚本
* view: fixed   表示包含solar 及lunar日历视图混合
* preview:  表示需要右侧显示详情视图
* beforeShow函数要被调用 显示出节假日安排,将节假日放到节假日安排的选择框中 由三部分组成 0101月日【必选】  *|# 节假日图标【可选】  *表示节假日上班图标 无表示休息图标 #表示无节假日图标 xxxx节假日名称，表示必须加入到快速切换中【可选】 如0101*元旦 表示0101元旦上班 0102#元旦 表示必须加入到快捷切换且无vacation按钮
 */
define(['./conf', './preview'], function(calendar, preview) {
  var dReg, nowYear, y, yReg;
  dReg = /(\d{2})(\d{2})(\*|\#)?(.+)?/;
  yReg = /\d{4}/;
  y = null;
  nowYear = new Date().getFullYear();
  return function(obj) {
    var cal, loading;
    loading = obj.siblings('.J_loading-box');
    return cal = obj.fsyCalendar({
      weekMode: 'variable',
      dayClick: function(e, cell, view, box, data) {
        return preview(e, cell, view, box, data);
      },
      beforeShow: function(obj, view) {
        var endYear, renderVacation, startYear, str, vacation, vacationList;
        loading.show();
        if (view.conf.vacation) {
          vacationList = obj.find('.list-vacation-cont');
          str = '<li class="dropdown-option">假期安排</li>';
          renderVacation = function(vacations, year) {
            return $.each(vacations, function(i, j) {
              var dArr, icon, s;
              dArr = j.match(dReg);
              if (dArr) {
                s = year + '-' + dArr[1] + '-' + dArr[2];
                y !== year && dArr[4] && (str += '<li class="dropdown-option" data-value="' + s + '">' + dArr[4] + '</li>');
                if (dArr[3] !== '#' && s >= view.start && s <= view.end) {
                  icon = '<span class="fc-day-vacation ' + (dArr[3] ? 'vacation-work">班' : 'vacation-rest">休') + '</span>';
                  obj.find('.fc-day-td[data-date="' + s + '"] .fc-day-cell').append(icon);
                }
              }
              return true;
            });
          };
          vacation = function(year) {
            var vacations;
            vacations = SX.vacations[year];
            if (vacations) {
              return renderVacation(vacations, year);
            } else {
              if (year < nowYear - 1 || year > nowYear + 1) {
                return;
              }
              return $.get('/aq/sc?f=getHoliday&c=cals&year=' + year).done(function(json) {
                var d;
                d = $.parseJSON(json);
                return !d.status && renderVacation(d.data.holiday, year);
              });
            }
          };
          vacation(view.year);
          y !== view.year && vacationList.html(str) && (y = view.year);
          startYear = yReg.exec(view.start)[1];
          endYear = yReg.exec(view.end)[1];
          if (startYear !== endYear) {
            return vacation(startYear === view.year ? endYear : startYear);
          }
        }
      },
      afterShow: function(obj, view, isFirst) {
        var td;
        loading.hide();
        td = obj.find('.fc-day-cur');
        !td.length && (td = obj.find('.fc-day-today'));
        !td.length && (td = obj.find('.fc-day-first:not(".fc-day-other")'));
        return td.trigger('click.calendar');
      },
      beforeShowPreview: function(_preview, obj, self) {
        var cont;
        cont = _preview.find('.preview-cont');
        cont.on('mouseenter', '.preview-refer', function() {
          self = $(this);
          if (self.find('br').length) {
            return $('.preview-refer-all').show();
          }
        });
        return cont.on('mouseleave', '.preview-refer', function() {
          return $('.preview-refer-all').hide();
        });
      },
      afterShowPreview: function(_preview, cell, box, view) {
        var avoid, avoidAll, date, refer, suit, suitAll, suitAvoid;
        date = cell.data('date').replace(/-/g, '');
        suit = _preview.find('.suit');
        suitAll = _preview.find('.suit-all');
        avoid = _preview.find('.avoid');
        avoidAll = _preview.find('.avoid-all');
        suitAvoid = function(yi, ji) {
          suitAll.html('<i>宜</i>' + yi);
          suit.html('<i>宜</i>' + yi.replace(/\s+/g, '<br/>'));
          avoidAll.html('<i>忌</i>' + ji);
          return avoid.html('<i>忌</i>' + ji.replace(/\s+/g, '<br/>'));
        };
        if (!(refer = SX.lunarYJ[date])) {
          if (date < 20141231 || date > 20251231) {
            return;
          }
          return $.get('/aq/sc?f=getCalYj&c=cals&date=' + date).done(function(json) {
            var d;
            d = $.parseJSON(json);
            if (!d.status) {
              refer = d.data.list[date];
              refer && suitAvoid(refer.yi, refer.ji);
              return $.extend(true, SX.lunarYJ, d.data.list);
            }
          });
        } else {
          return suitAvoid(refer.yi, refer.ji);
        }
      }
    });
  };
});
