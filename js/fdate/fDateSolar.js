define(function() {
  var FDateSolar, dateReg, days, digit, isLegalDate, oDate, weekZh;
  dateReg = /^(\d{2,4})(?:([-,\/\s+])(1[012]|0?[1-9]))?(?:\2(0?[1-9]|[12]\d|3[01]))?$/;
  days = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  weekZh = ['日', '一', '二', '三', '四', '五', '六'];
  oDate = new Date();
  isLegalDate = function(date) {
    return Object.prototype.toString.call(date) === '[object Date]' && (date - 1) >= 0;
  };
  digit = function(num) {
    if (num < 10) {
      return '0' + (num | 0);
    } else {
      return num + '';
    }
  };
  FDateSolar = function(date, f) {
    return new FDateSolar.prototype.init(date, f);
  };
  FDateSolar.prototype.init = function(date, f) {
    var a;
    if (date instanceof FDateSolar) {
      return date;
    }
    this._isLegal = false;
    if (date >= 0) {
      date = new Date(date);
    } else {
      date || (date = oDate);
    }
    a = this.parseDate(date);
    if (a && a.length) {
      this._isLegal = true;
    }
    this._date = date;
    this._a = a;
    this._isFDate = true;
    this._f = f;
    return this;
  };
  FDateSolar.prototype.init.prototype = FDateSolar.prototype;
  FDateSolar.prototype.format = function(f) {
    f || (f = this._f);
    if (!this._isLegal) {
      return 'Invalid date';
    } else if (f && f !== '__date') {
      return this._a.join(f || this._f);
    } else {
      return new Date(this._a[0], this._a[1] - 1, this._a[2]);
    }
  };
  FDateSolar.prototype.parseDate = function(date) {
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
    return a && [digit(a[0]), digit(a[1]), digit(a[2])];
  };
  FDateSolar.prototype.isLeapYear = function(y) {
    if (!(y || this._isLegal)) {
      return false;
    } else {
      y || (y = this._a[0]);
      return !(y % 4) && y % 100 || !(y % 400);
    }
  };
  FDateSolar.prototype.dayOfWeek = function(date) {
    var a, num;
    date || (date = this._a);
    if (isLegalDate(date)) {
      num = date.getDay();
    } else if ((a = this.parseDate(date)).length) {
      num = new Date(a[0], a[1] - 1, a[2]).getDay();
    }
    return num;
  };
  FDateSolar.prototype.dayOfWeekTxt = function(date) {
    return weekZh[this.dayOfWeek(date)];
  };
  FDateSolar.prototype.daysOfMonth = function(y, m) {
    y || (y = this._a[0]);
    m || (m = this._a[1]);
    --m;
    if (m === 1) {
      if (this.isLeapYear(y)) {
        return 29;
      } else {
        return 28;
      }
    } else {
      return days[m];
    }
  };
  FDateSolar.prototype.startOf = function(item) {
    item || (item = 'month');
    if (this._isLegal) {
      this._a[2] = '01';
    }
    return this;
  };
  $.each(['add', 'subtract'], function(i, j) {
    return FDateSolar.prototype[j] = function(number, item) {
      var _n, date, milliseconds;
      number || (number = 0);
      item || (item = 'day');
      switch (item) {
        case 'month':
          _n = number * 30;
          break;
        case 'week':
          _n = number * 7 * 30;
          break;
        case 'year':
          _n = number * 12 * 30;
          break;
        default:
          _n = number;
      }
      date = this.format();
      milliseconds = i ? date - _n * 24 * 60 * 60 * 1000 : date.getTime() + _n * 24 * 60 * 60 * 1000;
      this._date = new Date(milliseconds);
      this._a = this.parseDate(this._date);
      return this;
    };
  });
  FDateSolar.prototype.diff = function(date, item) {
    var cDate, d1, d2, daysAdjust, diff, output;
    item || (item = 'day');
    cDate = FDateSolar(date);
    if (!(cDate._isLegal && this._isLegal)) {
      return 0;
    }
    d1 = cDate.format('__date');
    d2 = this.format('__date');
    if (item === 'year' || item === 'month') {
      diff = this.daysOfMonth() + cDate.daysOfMonth() * 432e5;
      output = ((cDate._a[0] - this._a[0]) * 12) + (cDate._a[1] - this._a[1]);
      daysAdjust = (d1 - cDate.startOf().format('__date')) - (d2 - this.startOf().format('__date'));
      daysAdjust -= 6e4;
      output += daysAdjust / diff;
      if (item === 'year') {
        output /= 12;
      }
    } else {
      diff = d1 - d2;
      if (item === 'day') {
        output = diff / 864e5;
      } else if (item === 'week') {
        output = diff / 6048e5;
      }
    }
    return Number(output.toFixed(1));
  };
  return FDateSolar;
});
