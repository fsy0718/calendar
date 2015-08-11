###*
 * @module  fDateSolar
###

#日期超类
define ->
  dateReg = /^(\d{2,4})(?:([-,\/\s+])(1[012]|0?[1-9]))?(?:\2(0?[1-9]|[12]\d|3[01]))?$/
  days = [31,null,31,30,31,30,31,31,30,31,30,31]
  weekZh = ['日','一','二','三','四','五','六']
  oDate = new Date()
  isLegalDate = (date)->
    Object::toString.call(date) is '[object Date]' and (date - 1) >= 0 #new Date('aaaa') =>  IE8- 为NaN  toString 返回为Date对象 其余浏览器为Invalid Date

  digit = (num)->
    if num < 10 then '0' + (num|0) else num + ''

  #日期超类  date  合法日期  format  规则   object  表示返回一个日历对象  array  表示返回一个数组   其余表示分隔符，返回分隔符连接的字符串
  FDateSolar = (date,f)->
    new FDateSolar::init(date,f)

  FDateSolar::init = (date,f)->
    if date instanceof FDateSolar
      return date
    this._isLegal = false
    if date >= 0
      date = new Date(date)
    else
      date ||= oDate
    a = @.parseDate(date)
    if a and a.length
      this._isLegal = true
    this._date = date
    this._a = a
    this._isFDate = true
    this._f = f
    this

  FDateSolar::init:: = FDateSolar::

  FDateSolar::format = (f)->
    f ||= @._f
    unless @._isLegal
      return 'Invalid date'
    else if f and f isnt '__date'
      return @._a.join(f || @._f)
    else
      return new Date(@._a[0],@._a[1] - 1, @._a[2])

  FDateSolar::parseDate = (date)->
    a = []
    if isLegalDate(date)
      a = [date.getFullYear(),date.getMonth() + 1,date.getDate()]
    else if $.isArray(date)
      a = date
    else if date and a = dateReg.exec(String(date))
      a.shift()
      a.length > 1 and a.splice(1,1)  #清除间隔符
    a and [digit(a[0]),digit(a[1]),digit(a[2])]

  FDateSolar::isLeapYear = (y)->
    unless y or @._isLegal
      return false
    else
      y ||= @._a[0]
      !(y % 4) and y % 100 or !(y % 400)

  FDateSolar::dayOfWeek = (date)->
    date ||= @._a
    if isLegalDate(date)
      num = date.getDay()
    else if (a = @.parseDate(date)).length
      num = new Date(a[0],a[1] - 1, a[2]).getDay()
    num

  FDateSolar::dayOfWeekTxt = (date)->
    weekZh[@.dayOfWeek(date)]

  FDateSolar::daysOfMonth = (y,m)->
    y ||= @._a[0]
    m ||= @._a[1]
    --m
    if m is 1 then (if @.isLeapYear(y) then 29 else 28) else days[m]

  FDateSolar::startOf =(item)->
    item ||= 'month'
    if @._isLegal
      @._a[2] = '01'
    @

  $.each ['add','subtract'],(i,j)->
    FDateSolar::[j] = (number,item)->
      number ||= 0
      item ||= 'day'
      switch item
        when 'month'
          _n = number * 30
        when 'week'
          _n = number * 7 * 30
        when 'year'
          _n = number * 12 * 30
        else
          _n = number
      date = @.format()
      milliseconds = if i then date - _n * 24 * 60 * 60 * 1000 else date.getTime() + _n * 24 * 60 * 60 * 1000
      @._date = new Date(milliseconds)
      @._a = @.parseDate(@._date)
      @
  FDateSolar::diff = (date,item)->
    item ||= 'day'
    cDate = FDateSolar(date)
    unless  cDate._isLegal  and @._isLegal
      return 0
    #开始比较  算法来自 https://github.com/moment/moment/blob/develop/moment.js 的diff  [2158行]
    d1 = cDate.format('__date')
    d2 = @.format('__date')
    if item is 'year' or item is 'month'
      diff = @.daysOfMonth() + cDate.daysOfMonth() *  432e5 # 24 * 60 * 60 * 1000 / 2
      output = ((cDate._a[0] - @._a[0]) * 12) + (cDate._a[1] - @._a[1])
      daysAdjust = (d1  - cDate.startOf().format('__date'))  - (d2 - @.startOf().format('__date'))
      daysAdjust -= 6e4
      output += daysAdjust / diff
      if item is 'year'
        output /= 12
    else
      diff = d1 - d2
      if item is 'day'
        output = diff / 864e5
      else if item is 'week'
        output = diff / 6048e5
    Number(output.toFixed(1)) #保留一位有效数字，如果是.0则去掉

  return FDateSolar