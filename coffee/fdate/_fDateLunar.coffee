###算法来自 https://github.com/StuPig/calendar-converter###
define ->
  lunarInfo = [19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970, 19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343, 18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800, 25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536, 54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423, 27808, 46416, 86869, 19872, 42448, 83315, 21200, 43432, 59728, 27296, 44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176, 38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46496, 103846, 38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256, 19189, 18800, 25776, 29859, 59984, 27480, 21952, 43872, 38613, 37600, 51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893, 43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312, 31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576, 23200, 30371, 38608, 19415, 19152, 42192, 118966, 53840, 54560, 56645, 46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448]
  gan = "甲乙丙丁戊己庚辛壬癸"
  zhi = "子丑寅卯辰巳午未申酉戌亥"
  zodiac = "鼠牛虎兔龙蛇马羊猴鸡狗猪"
  sTermInfo = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758]
  nStr1 = "十一二三四五六七八九"
  nStr2 = "初十廿卅"
  monthName = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"]
  dateReg = /^(\d{2,4})(?:([-,\/\s+])(1[012]|0?[1-9]))?(?:\2(0?[1-9]|[12]\d|3[01]))?$/
  baseDate = new Date(1900,0,31)
  oDate = new Date()

  #TODO IE6 7中 zodiac[0] 为undefined 所以需要额外进行兼容操作
  #传入offset 返回干支 0=甲子
  cyclical = (num)->
    if gan[0]
      gan[num % 10] + zhi[num%12]
    else
      gan.charAt(num%10) + zhi.charAt(num%12)

  isLegalDate = (date)->
    Object::toString.call(date) is '[object Date]' and (date - 1) >= 0 #new Date('aaaa') =>  IE8- 为NaN  toString 返回为Date对象 其余浏览器为Invalid Date

  FDateLunar = (date,isLeapMonth)->
    return new FDateLunar::init(date,isLeapMonth)

  FDateLunar::init = (date,isLeapMonth)->
    this.isLegal = false
    date ||= oDate
    a = @.parseDate(date)
    if a.length
      this.isLegal = true
    this._date = date
    this._a = a
    this._isLeapMonth = isLeapMonth
    this._isFDateLunar = true
    this
  FDateLunar::init:: = FDateLunar::

  FDateLunar::digit =  (num)->
    if num < 10 then '0' + (num|0) else num + ''

  FDateLunar::parseDate = (date)->
    a = []
    if isLegalDate(date)
      a = [date.getFullYear(),date.getMonth() + 1,date.getDate()]
    else if $.isArray(date)
      a = date
    else if date and a = dateReg.exec(String(date))
      a.shift()
      a.length > 1 and a.splice(1,1)  #清除间隔符
    a and [@.digit(a[0]),@.digit(a[1]),@.digit(a[2])]


  # 年份农历的总天数
  FDateLunar::daysOfLunarYear = (y)->
    y ||= @._a[0]
    i = 0x8000
    sum = 348
    while i > 0x8
      sum += (if (lunarInfo[y - 1900] & i) then 1 else 0)
      i >>= 1
    sum + @.daysOfLeapMonth(y)

  #农历闰月的天数
  FDateLunar::daysOfLeapMonth = (y)->
    if @.hasLeapMonth(y)
      days = if lunarInfo[y - 1900] & 0x10000 then 30 else 29
    days || 0

  #农历指定年份是否有闰月 传回0-12  0为没闰
  FDateLunar::hasLeapMonth = (y)->
    y ||= @._a[0]
    lunarInfo[y - 1900] & 0xf

  #农历指定月份的天数
  FDateLunar::daysOfLunarMonth = (y,m)->
    y ||= @._a[0]
    m ||= @._a[1]
    if (lunarInfo[y - 1900] & (0x10000 >> m)) then 30 else 29

  #指定公历的农历日期  返回的日 是从0开始计算  意味着 9  => 农历初八
  FDateLunar::solar2lunar = (date)->
    self = @
    dateArr = self.parseDate(date)
    date = new Date(+dateArr[0],+dateArr[1]-1,+dateArr[2]) #统一从00:00:00开始
    offset = Math.round((date - baseDate) / 86400000) # Mac和linux平台的firefox在此处会产生浮点数错误
    lunarDate = {}
    lunarDate.dayCyl = offset + 40
    lunarDate.monCyl = 14
    leapMonth = 0
    temp = 0
    i = 1900
    while i < 2050 and offset > 0
      temp = self.daysOfLunarYear(i)
      offset -= temp
      lunarDate.monCyl += 12
      i++
    if offset < 0
      offset += temp
      i--
      lunarDate.monCyl -= 12
    lunarDate.year = self.digit(i)
    lunarDate.yearCyl = i - 1864
    #闰哪个月
    leapMonth = self.hasLeapMonth(i)
    lunarDate.isLeap = false
    i = 1
    while i < 13 and offset > 0
      #闰月
      if leapMonth > 0 and i is (leapMonth + 1) and !lunarDate.isLeap
        --i
        lunarDate.isLeap = true
        temp = self.daysOfLeapMonth(lunarDate.year)
      else
        temp = self.daysOfLunarMonth(lunarDate.year,i)
      #解除闰月
      lunarDate.isLeap = false if lunarDate.isLeap and i is (leapMonth + 1)
      offset -= temp
      lunarDate.monCyl++ unless lunarDate.isLeap
      i++
    if offset is 0 and leapMonth > 0 and i is leapMonth + 1
      if lunarDate.isLeap
        lunarDate.isLeap = false
      else
        lunarDate.isLeap = true
        --i
        --lunarDate.monCyl
    if offset < 0
      offset += temp
      --i
      --lunarDate.monCyl
    lunarDate.month = self.digit(i)
    lunarDate.day = self.digit(offset + 1)
    lunarDate

  FDateLunar::lunar2solar = (date,isLeapMonth)->
    date ||= @._a
    isLeapMonth ||= @._isLeapMonth
    a = @.parseDate(date)
    if a.length
      ly =+a[0]
      lm = +a[1]
      ld = +a[2]
      i = 1900
      offset = 0
      leap = !(ly % 4) and ly % 100 or !(ly % 400)
      while i < ly
        offset += @.daysOfLunarYear(i)
        i++
      i = 1
      while i < lm
        offset += @.daysOfLeapMonth(ly) if i is @.hasLeapMonth(ly)
        offset += @.daysOfLunarMonth(ly,i)
        i++
      if isLeapMonth and @.hasLeapMonth(ly) is +lm
        offset += @.daysOfLunarMonth(ly,i)
      offset += parseInt(ld) - 1
      _solarDate = new Date(baseDate.valueOf() + offset * 86400000)
      year : @.digit(_solarDate.getFullYear())
      month : @.digit(_solarDate.getMonth() + 1)
      day : @.digit(_solarDate.getDate())
      isleapYear : leap
    else
      null

  #指定年份的第几个节气在多少天  0表示小寒
  FDateLunar::solarTerm = (y,n)->
    offDate = new Date (31556925974.7*(y-1900) + sTermInfo[n]*60000) + Date.UTC(1900,0,6,2,5)
    offDate.getUTCDate()

  #天干地支与节气有关 传入的是公历
  FDateLunar::chineseEra = (y,m,d)->
    --m
    if m < 2
      ly = cyclical(y-1900+36-1)
    else
      ly = cyclical(y-1900+36)
    #立春日期
    spring = @.solarTerm(y,2)
    #月柱 1900年1月小寒以前为 丙子月(60进制12)
    firstNode = @.solarTerm(y,m*2) #返回当月「节」为几日开始
    lm = cyclical((y-1900) * 12 + m + 12)
    #依节气调整二月分的年柱, 以立春为界
    ly = cyclical(y-1900+36) if m is 1 and d >= spring
    #依节气月柱, 以「节」为界
    lm = cyclical((y - 1900) * 12 + m + 13) if d >= firstNode
    #当月一日与 1900/1/1 相差天数
    #1900/1/1与 1970/1/1 相差25567日, 1900/1/1 日柱为甲戌日(60进制10)
    dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10
    #日柱
    ld = cyclical(dayCyclical + +d - 1)
    [ly + '年',lm + '月',ld + '日']

  #生肖年份是农历算法，因此传入年份应该为农历年份
  FDateLunar::zodiac = (y)->
    y ||= @._a[0]
    if zodiac[0]
      zodiac[(y - 4) % 12]
    else
      zodiac.charAt((y-4)%12)

  #转换成农历月
  FDateLunar::lunarMonthText = (num,isLeap)->
    num ||= @._a[1]
    isLeap ||= @._isLeapMonth
    (if isLeap then '闰' else '') + monthName[num-1]

  #转换成农历日
  FDateLunar::lunarDayText = (num)->
    num ||= @._a[2]
    switch +num
      when 10
        str = '00'
      else
        str = @.digit(parseInt(num))
    if nStr1[0]
      nStr2[str.charAt(0)] + nStr1[str.charAt(1)]
    else
      nStr2.charAt(str.charAt(0)) + nStr1.charAt(str.charAt(1))


  return FDateLunar
