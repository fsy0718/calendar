
/*算法来自 https://github.com/StuPig/calendar-converter */
define(function() {
  var FDateLunar, baseDate, cyclical, dateReg, gan, isLegalDate, lunarInfo, monthName, nStr1, nStr2, oDate, sTermInfo, zhi, zodiac;
  lunarInfo = [19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970, 19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343, 18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800, 25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536, 54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423, 27808, 46416, 86869, 19872, 42448, 83315, 21200, 43432, 59728, 27296, 44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176, 38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46496, 103846, 38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256, 19189, 18800, 25776, 29859, 59984, 27480, 21952, 43872, 38613, 37600, 51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893, 43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312, 31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576, 23200, 30371, 38608, 19415, 19152, 42192, 118966, 53840, 54560, 56645, 46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448];
  gan = "甲乙丙丁戊己庚辛壬癸";
  zhi = "子丑寅卯辰巳午未申酉戌亥";
  zodiac = "鼠牛虎兔龙蛇马羊猴鸡狗猪";
  sTermInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];
  nStr1 = "十一二三四五六七八九";
  nStr2 = "初十廿卅";
  monthName = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"];
  dateReg = /^(\d{2,4})(?:([-,\/\s+])(1[012]|0?[1-9]))?(?:\2(0?[1-9]|[12]\d|3[01]))?$/;
  baseDate = new Date(1900, 0, 31);
  oDate = new Date();
  cyclical = function(num) {
    if (gan[0]) {
      return gan[num % 10] + zhi[num % 12];
    } else {
      return gan.charAt(num % 10) + zhi.charAt(num % 12);
    }
  };
  isLegalDate = function(date) {
    return Object.prototype.toString.call(date) === '[object Date]' && (date - 1) >= 0;
  };
  FDateLunar = function(date, isLeapMonth) {
    return new FDateLunar.prototype.init(date, isLeapMonth);
  };
  FDateLunar.prototype.init = function(date, isLeapMonth) {
    var a;
    this.isLegal = false;
    date || (date = oDate);
    a = this.parseDate(date);
    if (a.length) {
      this.isLegal = true;
    }
    this._date = date;
    this._a = a;
    this._isLeapMonth = isLeapMonth;
    this._isFDateLunar = true;
    return this;
  };
  FDateLunar.prototype.init.prototype = FDateLunar.prototype;
  FDateLunar.prototype.digit = function(num) {
    if (num < 10) {
      return '0' + (num | 0);
    } else {
      return num + '';
    }
  };
  FDateLunar.prototype.parseDate = function(date) {
    var a;
    a = [];
    if (isLegalDate(date)) {
      a = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    } else if ($.isArray(date)) {
      a = date;
    } else if (date && (a = dateReg.exec(String(date)))) {
      a.shift();
      a.length > 1 && a.splice(1, 1);
    }
    return a && [this.digit(a[0]), this.digit(a[1]), this.digit(a[2])];
  };
  FDateLunar.prototype.daysOfLunarYear = function(y) {
    var i, sum;
    y || (y = this._a[0]);
    i = 0x8000;
    sum = 348;
    while (i > 0x8) {
      sum += (lunarInfo[y - 1900] & i ? 1 : 0);
      i >>= 1;
    }
    return sum + this.daysOfLeapMonth(y);
  };
  FDateLunar.prototype.daysOfLeapMonth = function(y) {
    var days;
    if (this.hasLeapMonth(y)) {
      days = lunarInfo[y - 1900] & 0x10000 ? 30 : 29;
    }
    return days || 0;
  };
  FDateLunar.prototype.hasLeapMonth = function(y) {
    y || (y = this._a[0]);
    return lunarInfo[y - 1900] & 0xf;
  };
  FDateLunar.prototype.daysOfLunarMonth = function(y, m) {
    y || (y = this._a[0]);
    m || (m = this._a[1]);
    if (lunarInfo[y - 1900] & (0x10000 >> m)) {
      return 30;
    } else {
      return 29;
    }
  };
  FDateLunar.prototype.solar2lunar = function(date) {
    var dateArr, i, leapMonth, lunarDate, offset, self, temp;
    self = this;
    dateArr = self.parseDate(date);
    date = new Date(+dateArr[0], +dateArr[1] - 1, +dateArr[2]);
    offset = Math.round((date - baseDate) / 86400000);
    lunarDate = {};
    lunarDate.dayCyl = offset + 40;
    lunarDate.monCyl = 14;
    leapMonth = 0;
    temp = 0;
    i = 1900;
    while (i < 2050 && offset > 0) {
      temp = self.daysOfLunarYear(i);
      offset -= temp;
      lunarDate.monCyl += 12;
      i++;
    }
    if (offset < 0) {
      offset += temp;
      i--;
      lunarDate.monCyl -= 12;
    }
    lunarDate.year = self.digit(i);
    lunarDate.yearCyl = i - 1864;
    leapMonth = self.hasLeapMonth(i);
    lunarDate.isLeap = false;
    i = 1;
    while (i < 13 && offset > 0) {
      if (leapMonth > 0 && i === (leapMonth + 1) && !lunarDate.isLeap) {
        --i;
        lunarDate.isLeap = true;
        temp = self.daysOfLeapMonth(lunarDate.year);
      } else {
        temp = self.daysOfLunarMonth(lunarDate.year, i);
      }
      if (lunarDate.isLeap && i === (leapMonth + 1)) {
        lunarDate.isLeap = false;
      }
      offset -= temp;
      if (!lunarDate.isLeap) {
        lunarDate.monCyl++;
      }
      i++;
    }
    if (offset === 0 && leapMonth > 0 && i === leapMonth + 1) {
      if (lunarDate.isLeap) {
        lunarDate.isLeap = false;
      } else {
        lunarDate.isLeap = true;
        --i;
        --lunarDate.monCyl;
      }
    }
    if (offset < 0) {
      offset += temp;
      --i;
      --lunarDate.monCyl;
    }
    lunarDate.month = self.digit(i);
    lunarDate.day = self.digit(offset + 1);
    return lunarDate;
  };
  FDateLunar.prototype.lunar2solar = function(date, isLeapMonth) {
    var _solarDate, a, i, ld, leap, lm, ly, offset;
    date || (date = this._a);
    isLeapMonth || (isLeapMonth = this._isLeapMonth);
    a = this.parseDate(date);
    if (a.length) {
      ly = +a[0];
      lm = +a[1];
      ld = +a[2];
      i = 1900;
      offset = 0;
      leap = !(ly % 4) && ly % 100 || !(ly % 400);
      while (i < ly) {
        offset += this.daysOfLunarYear(i);
        i++;
      }
      i = 1;
      while (i < lm) {
        if (i === this.hasLeapMonth(ly)) {
          offset += this.daysOfLeapMonth(ly);
        }
        offset += this.daysOfLunarMonth(ly, i);
        i++;
      }
      if (isLeapMonth && this.hasLeapMonth(ly) === +lm) {
        offset += this.daysOfLunarMonth(ly, i);
      }
      offset += parseInt(ld) - 1;
      _solarDate = new Date(baseDate.valueOf() + offset * 86400000);
      return {
        year: this.digit(_solarDate.getFullYear()),
        month: this.digit(_solarDate.getMonth() + 1),
        day: this.digit(_solarDate.getDate()),
        isleapYear: leap
      };
    } else {
      return null;
    }
  };
  FDateLunar.prototype.solarTerm = function(y, n) {
    var offDate;
    offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
    return offDate.getUTCDate();
  };
  FDateLunar.prototype.chineseEra = function(y, m, d) {
    var dayCyclical, firstNode, ld, lm, ly, spring;
    --m;
    if (m < 2) {
      ly = cyclical(y - 1900 + 36 - 1);
    } else {
      ly = cyclical(y - 1900 + 36);
    }
    spring = this.solarTerm(y, 2);
    firstNode = this.solarTerm(y, m * 2);
    lm = cyclical((y - 1900) * 12 + m + 12);
    if (m === 1 && d >= spring) {
      ly = cyclical(y - 1900 + 36);
    }
    if (d >= firstNode) {
      lm = cyclical((y - 1900) * 12 + m + 13);
    }
    dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
    ld = cyclical(dayCyclical + +d - 1);
    return [ly + '年', lm + '月', ld + '日'];
  };
  FDateLunar.prototype.zodiac = function(y) {
    y || (y = this._a[0]);
    if (zodiac[0]) {
      return zodiac[(y - 4) % 12];
    } else {
      return zodiac.charAt((y - 4) % 12);
    }
  };
  FDateLunar.prototype.lunarMonthText = function(num, isLeap) {
    num || (num = this._a[1]);
    isLeap || (isLeap = this._isLeapMonth);
    return (isLeap ? '闰' : '') + monthName[num - 1];
  };
  FDateLunar.prototype.lunarDayText = function(num) {
    var str;
    num || (num = this._a[2]);
    switch (+num) {
      case 10:
        str = '00';
        break;
      default:
        str = this.digit(parseInt(num));
    }
    if (nStr1[0]) {
      return nStr2[str.charAt(0)] + nStr1[str.charAt(1)];
    } else {
      return nStr2.charAt(str.charAt(0)) + nStr1.charAt(str.charAt(1));
    }
  };
  return FDateLunar;
});
