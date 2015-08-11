
/*
* 日历
* author: fsy0718@yeah.net
* LICENSE： MIT
 */
define(["./core"], function(FCalendar) {
  var _conf, day, month, oDate, year;
  oDate = new Date();
  year = oDate.getFullYear();
  month = oDate.getMonth() + 1;
  day = oDate.getDate();
  _conf = {
    date: [year, month, day].concat(),
    resetday: '0,6',
    festival: true,
    vacation: true,
    solarTerm: true,
    preview: 30,
    dayRefer: true,
    toolbar: 11.33,
    firstDay: 1,
    showOtherDays: true,
    selectDay: false,
    dayPrefix: '',
    theme: 'intact',
    weekMode: 'fixed',
    view: 'fixed',
    limit: false,
    max: 2050,
    min: 1901
  };
  return $.fn.fsyCalendar = function(opt, date) {
    var _d, _fnlimit, _today, conf, d, fcObj, idx, range, self, solarDate, today;
    self = $(this);
    if ($.isPlainObject(opt)) {
      conf = $.extend(true, {}, _conf, opt);
    } else {
      conf = $.extend(true, {}, _conf);
      if (opt === 'gotoDate') {
        idx = self.attr('fc-fidx');
        if (idx && (fcObj = SX.calendars[idx])) {
          _d = fcObj.fDateSolar(date);
          _today = fcObj.fDateSolar();
          d = _d._isLegal ? _d : _today;
          if (d.format('-') === _today.format('-')) {
            today = self.find('.fc-day-today');
            if (today.length) {
              if (!today.hasClass('fc-day-cur')) {
                date && today.trigger('click.calendar');
                return fcObj;
              }
            }
          }
          return fcObj.changeView(d);
        } else {
          d = FCalendar.prototype.fDateSolar(date);
          conf.date = d._isLegal ? d : FCalendar.prototype.fDateSolar();
        }
      } else {
        solarDate = FCalendar.prototype.fDateSolar(date);
        conf.date = solarDate._isLegal && solarDate._a || conf.date;
      }
    }
    if (conf.limit) {
      range = FCalendar.prototype.limit(conf.limit);
      _fnlimit = conf.beforeShowDay;
      conf.beforeShowDay = function(ymd, td, tableView, view) {
        var ymdSolarDate;
        ymdSolarDate = FCalendar.prototype.fDateSolar(ymd);
        if (ymdSolarDate.diff(range[0]) > 0 || ymdSolarDate.diff(range[1]) < 0) {
          td.addClass('fc-day-other');
        }
        return $.isFunction(_fnlimit) && _fnlimit(ymd, td, tableView, view);
      };
    }
    if (/^lunar|fixed$/.test(conf.view)) {
      return require(['fCalendar/lunarView'], function(lunarConf) {
        var _fnDay, _fnView;
        _fnDay = conf.beforeShowDay;
        _fnView = conf.beforeShow;
        conf.beforeShowDay = function(ymd, td, tableView, view) {
          lunarConf.beforeShowDay(ymd, td, tableView, view);
          return $.isFunction(_fnDay) && _fnDay(ymd, td, tableView, view);
        };
        conf.beforeShow = function(obj, view) {
          lunarConf.beforeShow(obj, view);
          return $.isFunction(_fnView) && _fnView(obj, view);
        };
        return new FCalendar(self, conf);
      });
    } else {
      return new FCalendar(self, conf);
    }
  };
});
