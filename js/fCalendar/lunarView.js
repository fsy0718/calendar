define(['./core', 'fdate/fDateLunar'], function(FCalendar, fDateLunar) {
  var dReg1, dReg2, lFtv, lObj, leapMonth, lunarMonthDay, oDate, sFtv, solarTerm, wFtv;
  solarTerm = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
  sFtv = ['0101*元旦', '0214情人节', '0308妇女节', '0312植树节', '0422地球日', '0431无烟日', '0501劳动节', '0504青年节', '0601儿童节', '0606爱眼日', '0701建党日', '0801建军节', '0903抗日战争胜利纪念日', '0910教师节', '0918九·一八事变纪念日', '1001*国庆节', '1031万圣节', '1111光棍节', '1201艾滋病日', '1213南京大屠杀纪念日', '1224平安夜', '1225圣诞节'];
  wFtv = ['0527母亲节', '0637父亲节', '1144感恩节'];
  lFtv = ['0101*春节', '0115元宵节', '0202龙抬头', '0505*端午节', '0707七夕', '0715中元节', '0815*中秋节', '0909重阳节', '1208腊八节'];
  lunarMonthDay = 0;
  lObj = {};
  leapMonth = 0;
  oDate = fDateLunar();
  dReg1 = /\d{4}|\-/g;
  dReg2 = /(\d{2})(\d{2})(\*)?(.+)/;
  FCalendar.prototype.fDateLunar = fDateLunar;
  return {
    beforeShowDay: function(ymd, td, tableView, view) {
      var lDayText, ymdArr;
      if (!view.idx) {
        ymdArr = oDate.parseDate(ymd);
        leapMonth = oDate.hasLeapMonth(ymdArr[0]);
        lObj = oDate.solar2lunar(ymdArr);
        lunarMonthDay = oDate.daysOfLunarMonth(lObj.year, lObj.month);
        view.idx = 1;
      }
      if (lObj.day > lunarMonthDay) {
        if (!leapMonth || lObj.month !== leapMonth) {
          lObj.month = +lObj.month + 1;
        } else if (lObj.month === leapMonth && lObj.isLeap) {
          lObj.month = +lObj.month + 1;
          lObj.isLeap = false;
        } else {
          lObj.isLeap = true;
        }
        if (lObj.month > 12) {
          lObj.month = 1;
          lObj.year = +lObj.year + 1;
        } else if (lObj.month < 1) {
          lObj.month = 12;
          lObj.year -= 1;
        }
        lObj.day = 1;
      }
      if (lObj.day === 1) {
        lDayText = oDate.lunarMonthText(lObj.month, lObj.isLeap) + '月';
      } else {
        lDayText = oDate.lunarDayText(lObj.day);
      }
      td.attr('data-lunar', lObj.year + '-' + oDate.digit(lObj.month) + '-' + oDate.digit(lObj.day));
      if (lObj.isLeap) {
        td.attr('data-leap', true);
      }
      $('<span class="fc-day-lunar">' + lDayText + '</span>').appendTo(td.find('.fc-day-cell'));
      return lObj.day = +lObj.day + 1;
    },
    beforeShow: function(obj, view) {
      var arr, lEnd, lFtvClone, lStart, lStartStr, sEnd, sStart, tdDay, tdFirst, tdLast;
      if (view.conf.solarTerm) {
        arr = [[view.year, view.month], [view.year, view.month]];
        view.nextM && (arr[2] = [+view.year + (view.nextM === 1 ? 1 : 0), view.nextM]);
        view.prevM && (arr[3] = [+view.year - (view.prevM === 12 ? 1 : 0), view.prevM]);
        $.each(arr, function(i, j) {
          var t;
          if (arr[i]) {
            t = (arr[i][1] - 1) * 2 + i % 2;
            return obj.find('.fc-day-td[data-date="' + arr[i][0] + '-' + arr[i][1] + '-' + oDate.digit(oDate.solarTerm(arr[i][0], t)) + '"]').addClass('fc-day-holiday').find('.fc-day-lunar').text(solarTerm[t]);
          }
        });
        arr = null;
      }
      if (view.conf.festival) {
        tdDay = obj.find('.fc-day-td');
        tdFirst = tdDay.eq(0);
        tdLast = tdDay.filter(':last');
        sStart = tdFirst.data('date').replace(dReg1, '');
        lStartStr = tdFirst.data('lunar');
        lStart = lStartStr.replace(dReg1, '');
        sEnd = tdLast.data('date').replace(dReg1, '');
        lEnd = tdLast.data('lunar').replace(dReg1, '');
        $.each(sFtv, function(i, j) {
          var str;
          arr = j.match(dReg2) || [];
          str = arr[1] + arr[2];
          if ((sStart > sEnd && (str >= sStart || str <= sEnd)) || (sStart < sEnd && str >= sStart && str <= sEnd)) {
            obj.find('.fc-day-td[data-date$="' + arr[1] + '-' + arr[2] + '"]').addClass('fc-day-holiday').find('.fc-day-lunar').text(arr[4]);
          }
          arr = null;
          return true;
        });
        if (lStart > lEnd) {
          lFtvClone = lFtv.concat();
          lFtvClone.push('12' + view.fDateLunar(lStartStr).daysOfLunarMonth(null, 12) + '除夕');
        } else {
          lFtvClone = lFtv;
        }
        $.each(lFtvClone, function(i, j) {
          var str;
          arr = j.match(dReg2) || [];
          str = arr[1] + arr[2];
          if ((lStart > lEnd && (str >= lStart || str <= lEnd)) || (lStart < lEnd && str >= lStart && str <= lEnd)) {
            return obj.find('.fc-day-td[data-lunar$="' + arr[1] + '-' + arr[2] + '"]').addClass('fc-day-holiday').find('.fc-day-lunar').text(arr[4]);
          }
        });
        return lFtvClone = null;
      }
    }
  };
});
