const org = (id, uz, en, ru = en) => ({
  id,
  name: { uz, en, ru },
});

const city = (id, uz, en, ru, organizationTypes) => ({
  id,
  name: { uz, en, ru },
  organizationTypes,
});

const type = (id, organizations) => ({ id, organizations });

export const uzbekistanRegions = [
  {
    id: 'tashkent',
    name: { uz: 'Toshkent', en: 'Tashkent', ru: 'Ташкент' },
    cities: [
      city('tashkent-city', 'Toshkent shahri', 'Tashkent City', 'Ташкент', [
        type('university', [
          org('tuit', 'TATU', 'TUIT', 'ТУИТ'),
          org('inha', 'INHA University in Tashkent', 'INHA University in Tashkent', 'INHA в Ташкенте'),
        ]),
        type('government-office', [
          org('yakkasaray-tax', 'Yakkasaroy soliq inspeksiyasi', 'Yakkasaray Tax Inspectorate', 'Налоговая инспекция Яккасарая'),
          org('tashkent-cadastre', 'Toshkent kadastr boshqarmasi', 'Tashkent Cadastre Office', 'Ташкентское кадастровое управление'),
        ]),
        type('hospital', [
          org('republic-clinic', 'Respublika klinik shifoxonasi', 'Republic Clinical Hospital', 'Республиканская клиническая больница'),
          org('tashmi-clinic', 'Toshkent tibbiyot akademiyasi klinikasi', 'Tashkent Medical Academy Clinic', 'Клиника ТМА'),
        ]),
      ]),
      city('angren', 'Angren', 'Angren', 'Ангрен', [
        type('university', [
          org('angren-tech', 'Angren texnika instituti', 'Angren Technical Institute', 'Ангренский технический институт'),
          org('angren-pedagogical', 'Angren pedagogika kolleji', 'Angren Pedagogical College', 'Ангренский педагогический колледж'),
        ]),
        type('government-office', [
          org('angren-hokimiyat', 'Angren hokimligi', 'Angren City Administration', 'Хокимият Ангрена'),
          org('angren-land', 'Angren yer resurslari bo‘limi', 'Angren Land Resources Department', 'Отдел земельных ресурсов Ангрена'),
        ]),
        type('hospital', [
          org('angren-central-hospital', 'Angren markaziy shifoxonasi', 'Angren Central Hospital', 'Центральная больница Ангрена'),
          org('angren-maternity', 'Angren tug‘ruq majmuasi', 'Angren Maternity Complex', 'Родильный комплекс Ангрена'),
        ]),
      ]),
    ],
  },
  {
    id: 'samarkand',
    name: { uz: 'Samarqand', en: 'Samarkand', ru: 'Самарканд' },
    cities: [
      city('samarkand-city', 'Samarqand shahri', 'Samarkand City', 'Самарканд', [
        type('university', [
          org('samdu', 'Samarqand davlat universiteti', 'Samarkand State University', 'Самаркандский государственный университет'),
          org('sammi', 'Samarqand tibbiyot universiteti', 'Samarkand Medical University', 'Самаркандский медицинский университет'),
        ]),
        type('government-office', [
          org('samarkand-hokimiyat', 'Samarqand hokimligi', 'Samarkand City Administration', 'Хокимият Самарканда'),
          org('samarkand-procurement', 'Samarqand davlat xaridlari bo‘limi', 'Samarkand Procurement Office', 'Отдел госзакупок Самарканда'),
        ]),
        type('hospital', [
          org('samarkand-emergency', 'Samarqand shoshilinch tibbiyot markazi', 'Samarkand Emergency Medical Center', 'Самаркандский центр экстренной медицины'),
          org('samarkand-regional-hospital', 'Samarqand viloyat ko‘p tarmoqli shifoxonasi', 'Samarkand Regional Multidisciplinary Hospital', 'Самаркандская областная многопрофильная больница'),
        ]),
      ]),
      city('kattaqurgan', 'Kattaqo‘rg‘on', 'Kattaqurgan', 'Каттакурган', [
        type('university', [
          org('kattaqurgan-agro', 'Kattaqo‘rg‘on agrotexnikumi', 'Kattaqurgan Agro College', 'Каттакурганский агроколледж'),
          org('kattaqurgan-ped', 'Kattaqo‘rg‘on pedagogika instituti filiali', 'Kattaqurgan Pedagogical Branch', 'Каттакурганский педагогический филиал'),
        ]),
        type('government-office', [
          org('kattaqurgan-municipal', 'Kattaqo‘rg‘on hokimligi', 'Kattaqurgan Municipality', 'Хокимият Каттакургана'),
          org('kattaqurgan-utilities', 'Kattaqo‘rg‘on kommunal xizmatlar bo‘limi', 'Kattaqurgan Utilities Office', 'Управление коммунальных услуг Каттакургана'),
        ]),
        type('hospital', [
          org('kattaqurgan-hospital', 'Kattaqo‘rg‘on tuman shifoxonasi', 'Kattaqurgan District Hospital', 'Районная больница Каттакургана'),
          org('kattaqurgan-maternity', 'Kattaqo‘rg‘on ona va bola markazi', 'Kattaqurgan Mother and Child Center', 'Центр матери и ребенка Каттакургана'),
        ]),
      ]),
    ],
  },
  {
    id: 'bukhara',
    name: { uz: 'Buxoro', en: 'Bukhara', ru: 'Бухара' },
    cities: [
      city('bukhara-city', 'Buxoro shahri', 'Bukhara City', 'Бухара', [
        type('university', [
          org('buxdu', 'Buxoro davlat universiteti', 'Bukhara State University', 'Бухарский государственный университет'),
          org('bmi', 'Buxoro muhandislik instituti', 'Bukhara Engineering Institute', 'Бухарский инженерный институт'),
        ]),
        type('government-office', [
          org('bukhara-hokimiyat', 'Buxoro hokimligi', 'Bukhara City Administration', 'Хокимият Бухары'),
          org('bukhara-education', 'Buxoro xalq ta’limi bo‘limi', 'Bukhara Public Education Office', 'Управление народного образования Бухары'),
        ]),
        type('hospital', [
          org('bukhara-clinic', 'Buxoro viloyat klinik shifoxonasi', 'Bukhara Regional Clinic', 'Бухарская областная клиника'),
          org('bukhara-cancer', 'Buxoro onkologiya markazi', 'Bukhara Oncology Center', 'Бухарский онкологический центр'),
        ]),
      ]),
      city('gijduvon', 'G‘ijduvon', 'Gijduvon', 'Гиждуван', [
        type('university', [
          org('gijduvon-college', 'G‘ijduvon turizm kolleji', 'Gijduvon Tourism College', 'Гиждуванский туристический колледж'),
          org('gijduvon-med', 'G‘ijduvon tibbiyot texnikumi', 'Gijduvon Medical College', 'Гиждуванский медколледж'),
        ]),
        type('government-office', [
          org('gijduvon-hokimiyat', 'G‘ijduvon hokimligi', 'Gijduvon District Administration', 'Хокимият Гиждувана'),
          org('gijduvon-social', 'G‘ijduvon ijtimoiy himoya bo‘limi', 'Gijduvon Social Protection Office', 'Отдел соцзащиты Гиждувана'),
        ]),
        type('hospital', [
          org('gijduvon-hospital', 'G‘ijduvon markaziy shifoxonasi', 'Gijduvon Central Hospital', 'Центральная больница Гиждувана'),
          org('gijduvon-maternity', 'G‘ijduvon tug‘ruq markazi', 'Gijduvon Maternity Center', 'Родильный центр Гиждувана'),
        ]),
      ]),
    ],
  },
  {
    id: 'fergana',
    name: { uz: 'Farg‘ona', en: 'Fergana', ru: 'Фергана' },
    cities: [
      city('fergana-city', 'Farg‘ona shahri', 'Fergana City', 'Фергана', [
        type('university', [
          org('ferpi', 'Farg‘ona politexnika instituti', 'Fergana Polytechnic Institute', 'Ферганский политехнический институт'),
          org('ferstate', 'Farg‘ona davlat universiteti', 'Fergana State University', 'Ферганский государственный университет'),
        ]),
        type('government-office', [
          org('fergana-hokimiyat', 'Farg‘ona hokimligi', 'Fergana City Administration', 'Хокимият Ферганы'),
          org('fergana-transport', 'Farg‘ona transport boshqarmasi', 'Fergana Transport Office', 'Управление транспорта Ферганы'),
        ]),
        type('hospital', [
          org('fergana-regional-hospital', 'Farg‘ona viloyat shifoxonasi', 'Fergana Regional Hospital', 'Ферганская областная больница'),
          org('fergana-cardiology', 'Farg‘ona kardiologiya markazi', 'Fergana Cardiology Center', 'Кардиологический центр Ферганы'),
        ]),
      ]),
      city('kokand', 'Qo‘qon', 'Kokand', 'Коканд', [
        type('university', [
          org('kokand-uni', 'Qo‘qon universiteti', 'Kokand University', 'Кокандский университет'),
          org('kokand-ped', 'Qo‘qon pedagogika instituti', 'Kokand Pedagogical Institute', 'Кокандский педагогический институт'),
        ]),
        type('government-office', [
          org('kokand-hokimiyat', 'Qo‘qon hokimligi', 'Kokand City Administration', 'Хокимият Коканда'),
          org('kokand-migration', 'Qo‘qon migratsiya bo‘limi', 'Kokand Migration Office', 'Миграционная служба Коканда'),
        ]),
        type('hospital', [
          org('kokand-hospital', 'Qo‘qon markaziy shifoxonasi', 'Kokand Central Hospital', 'Центральная больница Коканда'),
          org('kokand-women', 'Qo‘qon ayollar salomatligi markazi', 'Kokand Women Health Center', 'Центр женского здоровья Коканда'),
        ]),
      ]),
    ],
  },
  {
    id: 'andijan',
    name: { uz: 'Andijon', en: 'Andijan', ru: 'Андижан' },
    cities: [
      city('andijan-city', 'Andijon shahri', 'Andijan City', 'Андижан', [
        type('university', [
          org('andijan-state', 'Andijon davlat universiteti', 'Andijan State University', 'Андижанский государственный университет'),
          org('andijan-med', 'Andijon tibbiyot instituti', 'Andijan Medical Institute', 'Андижанский медицинский институт'),
        ]),
        type('government-office', [
          org('andijan-hokimiyat', 'Andijon hokimligi', 'Andijan City Administration', 'Хокимият Андижана'),
          org('andijan-licensing', 'Andijon litsenziyalash markazi', 'Andijan Licensing Center', 'Лицензионный центр Андижана'),
        ]),
        type('hospital', [
          org('andijan-clinic', 'Andijon viloyat klinik shifoxonasi', 'Andijan Regional Clinic', 'Андижанская областная клиника'),
          org('andijan-emergency', 'Andijon shoshilinch tibbiyot markazi', 'Andijan Emergency Center', 'Центр экстренной медицины Андижана'),
        ]),
      ]),
      city('asaka', 'Asaka', 'Asaka', 'Асака', [
        type('university', [
          org('asaka-tech', 'Asaka texnologiya kolleji', 'Asaka Technology College', 'Технологический колледж Асаки'),
          org('asaka-ped', 'Asaka pedagogika markazi', 'Asaka Pedagogical Center', 'Педагогический центр Асаки'),
        ]),
        type('government-office', [
          org('asaka-hokimiyat', 'Asaka hokimligi', 'Asaka Municipality', 'Хокимият Асаки'),
          org('asaka-industry', 'Asaka sanoat bo‘limi', 'Asaka Industry Office', 'Промышленное управление Асаки'),
        ]),
        type('hospital', [
          org('asaka-hospital', 'Asaka tuman shifoxonasi', 'Asaka District Hospital', 'Районная больница Асаки'),
          org('asaka-family', 'Asaka oilaviy poliklinikasi', 'Asaka Family Clinic', 'Семейная поликлиника Асаки'),
        ]),
      ]),
    ],
  },
  {
    id: 'namangan',
    name: { uz: 'Namangan', en: 'Namangan', ru: 'Наманган' },
    cities: [
      city('namangan-city', 'Namangan shahri', 'Namangan City', 'Наманган', [
        type('university', [
          org('namdu', 'Namangan davlat universiteti', 'Namangan State University', 'Наманганский государственный университет'),
          org('nammti', 'Namangan muhandislik-texnologiya instituti', 'Namangan Engineering Technology Institute', 'Наманганский инженерно-технологический институт'),
        ]),
        type('government-office', [
          org('namangan-hokimiyat', 'Namangan hokimligi', 'Namangan City Administration', 'Хокимият Намангана'),
          org('namangan-health-office', 'Namangan sog‘liqni saqlash bo‘limi', 'Namangan Health Office', 'Управление здравоохранения Намангана'),
        ]),
        type('hospital', [
          org('namangan-hospital', 'Namangan viloyat shifoxonasi', 'Namangan Regional Hospital', 'Наманганская областная больница'),
          org('namangan-children', 'Namangan bolalar klinikasi', 'Namangan Children Clinic', 'Детская клиника Намангана'),
        ]),
      ]),
      city('chortoq', 'Chortoq', 'Chortoq', 'Чартак', [
        type('university', [
          org('chortoq-college', 'Chortoq servis kolleji', 'Chortoq Service College', 'Чартакский сервисный колледж'),
          org('chortoq-med', 'Chortoq tibbiyot texnikumi', 'Chortoq Medical College', 'Чартакский медколледж'),
        ]),
        type('government-office', [
          org('chortoq-hokimiyat', 'Chortoq hokimligi', 'Chortoq District Administration', 'Хокимият Чартака'),
          org('chortoq-water', 'Chortoq suv xo‘jaligi bo‘limi', 'Chortoq Water Resources Office', 'Управление водных ресурсов Чартака'),
        ]),
        type('hospital', [
          org('chortoq-hospital', 'Chortoq markaziy shifoxonasi', 'Chortoq Central Hospital', 'Центральная больница Чартака'),
          org('chortoq-rehab', 'Chortoq reabilitatsiya markazi', 'Chortoq Rehabilitation Center', 'Реабилитационный центр Чартака'),
        ]),
      ]),
    ],
  },
  {
    id: 'navoi',
    name: { uz: 'Navoiy', en: 'Navoi', ru: 'Навои' },
    cities: [
      city('navoi-city', 'Navoiy shahri', 'Navoi City', 'Навои', [
        type('university', [
          org('navoi-mining', 'Navoiy konchilik instituti', 'Navoi Mining Institute', 'Навоийский горный институт'),
          org('navoi-innovation', 'Navoiy innovatsiya universiteti', 'Navoi Innovation University', 'Инновационный университет Навои'),
        ]),
        type('government-office', [
          org('navoi-hokimiyat', 'Navoiy hokimligi', 'Navoi City Administration', 'Хокимият Навои'),
          org('navoi-procurement', 'Navoiy davlat xaridlari markazi', 'Navoi State Procurement Center', 'Центр госзакупок Навои'),
        ]),
        type('hospital', [
          org('navoi-hospital', 'Navoiy ko‘p tarmoqli tibbiyot markazi', 'Navoi Multidisciplinary Medical Center', 'Навоийский многопрофильный медцентр'),
          org('navoi-cancer', 'Navoiy onkologiya dispanseri', 'Navoi Oncology Dispensary', 'Онкодиспансер Навои'),
        ]),
      ]),
      city('zarafshan', 'Zarafshon', 'Zarafshan', 'Зарафшан', [
        type('university', [
          org('zarafshan-tech', 'Zarafshon texnologiya kolleji', 'Zarafshan Technology College', 'Технологический колледж Зарафшана'),
          org('zarafshan-geology', 'Zarafshon geologiya texnikumi', 'Zarafshan Geology College', 'Геологический техникум Зарафшана'),
        ]),
        type('government-office', [
          org('zarafshan-hokimiyat', 'Zarafshon hokimligi', 'Zarafshan Municipality', 'Хокимият Зарафшана'),
          org('zarafshan-mining-office', 'Zarafshon sanoat nazorati bo‘limi', 'Zarafshan Industry Oversight Office', 'Инспекция промышленного надзора Зарафшана'),
        ]),
        type('hospital', [
          org('zarafshan-hospital', 'Zarafshon shahar shifoxonasi', 'Zarafshan City Hospital', 'Городская больница Зарафшана'),
          org('zarafshan-clinic', 'Zarafshon oilaviy poliklinikasi', 'Zarafshan Family Clinic', 'Семейная клиника Зарафшана'),
        ]),
      ]),
    ],
  },
  {
    id: 'kashkadarya',
    name: { uz: 'Qashqadaryo', en: 'Kashkadarya', ru: 'Кашкадарья' },
    cities: [
      city('qarshi', 'Qarshi', 'Qarshi', 'Карши', [
        type('university', [
          org('qarshi-state', 'Qarshi davlat universiteti', 'Qarshi State University', 'Каршинский государственный университет'),
          org('qarshi-engineering', 'Qarshi muhandislik-iqtisodiyot instituti', 'Qarshi Engineering Economics Institute', 'Каршинский инженерно-экономический институт'),
        ]),
        type('government-office', [
          org('qarshi-hokimiyat', 'Qarshi hokimligi', 'Qarshi City Administration', 'Хокимият Карши'),
          org('qarshi-agency', 'Qarshi subsidiya agentligi', 'Qarshi Subsidy Agency', 'Агентство субсидий Карши'),
        ]),
        type('hospital', [
          org('qarshi-hospital', 'Qarshi viloyat shifoxonasi', 'Qarshi Regional Hospital', 'Каршинская областная больница'),
          org('qarshi-maternity', 'Qarshi perinatal markazi', 'Qarshi Perinatal Center', 'Перинатальный центр Карши'),
        ]),
      ]),
      city('shahrisabz', 'Shahrisabz', 'Shahrisabz', 'Шахрисабз', [
        type('university', [
          org('shahrisabz-ped', 'Shahrisabz pedagogika instituti', 'Shahrisabz Pedagogical Institute', 'Педагогический институт Шахрисабза'),
          org('shahrisabz-college', 'Shahrisabz xizmat ko‘rsatish kolleji', 'Shahrisabz Service College', 'Сервисный колледж Шахрисабза'),
        ]),
        type('government-office', [
          org('shahrisabz-hokimiyat', 'Shahrisabz hokimligi', 'Shahrisabz Administration', 'Хокимият Шахрисабза'),
          org('shahrisabz-land', 'Shahrisabz yer ajratish bo‘limi', 'Shahrisabz Land Allocation Office', 'Отдел земельного распределения Шахрисабза'),
        ]),
        type('hospital', [
          org('shahrisabz-hospital', 'Shahrisabz shahar shifoxonasi', 'Shahrisabz City Hospital', 'Городская больница Шахрисабза'),
          org('shahrisabz-trauma', 'Shahrisabz travmatologiya markazi', 'Shahrisabz Trauma Center', 'Травматологический центр Шахрисабза'),
        ]),
      ]),
    ],
  },
  {
    id: 'surkhandarya',
    name: { uz: 'Surxondaryo', en: 'Surkhandarya', ru: 'Сурхандарья' },
    cities: [
      city('termez', 'Termiz', 'Termez', 'Термез', [
        type('university', [
          org('termez-state', 'Termiz davlat universiteti', 'Termez State University', 'Термезский государственный университет'),
          org('termez-ped', 'Termiz pedagogika instituti', 'Termez Pedagogical Institute', 'Термезский педагогический институт'),
        ]),
        type('government-office', [
          org('termez-hokimiyat', 'Termiz hokimligi', 'Termez City Administration', 'Хокимият Термеза'),
          org('termez-customs', 'Termiz bojxona bo‘limi', 'Termez Customs Office', 'Таможенное управление Термеза'),
        ]),
        type('hospital', [
          org('termez-hospital', 'Termiz viloyat shifoxonasi', 'Termez Regional Hospital', 'Термезская областная больница'),
          org('termez-border-clinic', 'Termiz chegara tibbiyot punkti', 'Termez Border Medical Unit', 'Пограничный медпункт Термеза'),
        ]),
      ]),
      city('denov', 'Denov', 'Denov', 'Денау', [
        type('university', [
          org('denov-entrepreneurship', 'Denov tadbirkorlik instituti', 'Denov Institute of Entrepreneurship', 'Институт предпринимательства Денау'),
          org('denov-agro', 'Denov agrotexnologiya kolleji', 'Denov Agro Technology College', 'Агротехнологический колледж Денау'),
        ]),
        type('government-office', [
          org('denov-hokimiyat', 'Denov hokimligi', 'Denov District Administration', 'Хокимият Денау'),
          org('denov-education', 'Denov maktabgacha ta’lim bo‘limi', 'Denov Preschool Education Office', 'Отдел дошкольного образования Денау'),
        ]),
        type('hospital', [
          org('denov-hospital', 'Denov markaziy shifoxonasi', 'Denov Central Hospital', 'Центральная больница Денау'),
          org('denov-women', 'Denov ayollar poliklinikasi', 'Denov Women Clinic', 'Женская клиника Денау'),
        ]),
      ]),
    ],
  },
  {
    id: 'jizzakh',
    name: { uz: 'Jizzax', en: 'Jizzakh', ru: 'Джизак' },
    cities: [
      city('jizzakh-city', 'Jizzax shahri', 'Jizzakh City', 'Джизак', [
        type('university', [
          org('jizzakh-polytechnic', 'Jizzax politexnika instituti', 'Jizzakh Polytechnic Institute', 'Джизакский политехнический институт'),
          org('jizzakh-ped', 'Jizzax pedagogika universiteti', 'Jizzakh Pedagogical University', 'Джизакский педагогический университет'),
        ]),
        type('government-office', [
          org('jizzakh-hokimiyat', 'Jizzax hokimligi', 'Jizzakh City Administration', 'Хокимият Джизака'),
          org('jizzakh-roads', 'Jizzax yo‘l qurilishi boshqarmasi', 'Jizzakh Roads Office', 'Управление дорожного строительства Джизака'),
        ]),
        type('hospital', [
          org('jizzakh-hospital', 'Jizzax viloyat shifoxonasi', 'Jizzakh Regional Hospital', 'Джизакская областная больница'),
          org('jizzakh-children', 'Jizzax bolalar shifoxonasi', 'Jizzakh Children Hospital', 'Детская больница Джизака'),
        ]),
      ]),
      city('guliston-jizzakh', 'G‘allaorol', 'Gallaorol', 'Галляарал', [
        type('university', [
          org('gallaorol-college', 'G‘allaorol kasb-hunar kolleji', 'Gallaorol Vocational College', 'Профессиональный колледж Галляарала'),
          org('gallaorol-med', 'G‘allaorol tibbiyot kolleji', 'Gallaorol Medical College', 'Медколледж Галляарала'),
        ]),
        type('government-office', [
          org('gallaorol-hokimiyat', 'G‘allaorol hokimligi', 'Gallaorol Administration', 'Хокимият Галляарала'),
          org('gallaorol-subsidy', 'G‘allaorol subsidiyalar markazi', 'Gallaorol Subsidy Center', 'Центр субсидий Галляарала'),
        ]),
        type('hospital', [
          org('gallaorol-hospital', 'G‘allaorol tuman shifoxonasi', 'Gallaorol District Hospital', 'Районная больница Галляарала'),
          org('gallaorol-clinic', 'G‘allaorol oilaviy poliklinikasi', 'Gallaorol Family Clinic', 'Семейная поликлиника Галляарала'),
        ]),
      ]),
    ],
  },
  {
    id: 'syrdarya',
    name: { uz: 'Sirdaryo', en: 'Syrdarya', ru: 'Сырдарья' },
    cities: [
      city('gulistan', 'Guliston', 'Gulistan', 'Гулистан', [
        type('university', [
          org('gulistan-state', 'Guliston davlat universiteti', 'Gulistan State University', 'Гулистанский государственный университет'),
          org('gulistan-college', 'Guliston servis kolleji', 'Gulistan Service College', 'Сервисный колледж Гулистана'),
        ]),
        type('government-office', [
          org('gulistan-hokimiyat', 'Guliston hokimligi', 'Gulistan City Administration', 'Хокимият Гулистана'),
          org('gulistan-water', 'Guliston irrigatsiya bo‘limi', 'Gulistan Irrigation Office', 'Управление ирригации Гулистана'),
        ]),
        type('hospital', [
          org('gulistan-hospital', 'Guliston viloyat shifoxonasi', 'Gulistan Regional Hospital', 'Гулистанская областная больница'),
          org('gulistan-trauma', 'Guliston travmatologiya markazi', 'Gulistan Trauma Center', 'Травматологический центр Гулистана'),
        ]),
      ]),
      city('yangiyer', 'Yangiyer', 'Yangiyer', 'Янгиер', [
        type('university', [
          org('yangiyer-tech', 'Yangiyer texnologiya kolleji', 'Yangiyer Technology College', 'Технологический колледж Янгиера'),
          org('yangiyer-ped', 'Yangiyer pedagogika markazi', 'Yangiyer Pedagogical Center', 'Педагогический центр Янгиера'),
        ]),
        type('government-office', [
          org('yangiyer-hokimiyat', 'Yangiyer hokimligi', 'Yangiyer Administration', 'Хокимият Янгиера'),
          org('yangiyer-housing', 'Yangiyer uy-joy bo‘limi', 'Yangiyer Housing Office', 'Жилищное управление Янгиера'),
        ]),
        type('hospital', [
          org('yangiyer-hospital', 'Yangiyer shahar shifoxonasi', 'Yangiyer City Hospital', 'Городская больница Янгиера'),
          org('yangiyer-maternity', 'Yangiyer tug‘ruq bo‘limi', 'Yangiyer Maternity Unit', 'Родильное отделение Янгиера'),
        ]),
      ]),
    ],
  },
  {
    id: 'khorezm',
    name: { uz: 'Xorazm', en: 'Khorezm', ru: 'Хорезм' },
    cities: [
      city('urgench', 'Urganch', 'Urgench', 'Ургенч', [
        type('university', [
          org('urgench-state', 'Urganch davlat universiteti', 'Urgench State University', 'Ургенчский государственный университет'),
          org('urgench-tech', 'Urganch texnologiya instituti', 'Urgench Technology Institute', 'Технологический институт Ургенча'),
        ]),
        type('government-office', [
          org('urgench-hokimiyat', 'Urganch hokimligi', 'Urgench City Administration', 'Хокимият Ургенча'),
          org('urgench-tourism', 'Urganch turizm boshqarmasi', 'Urgench Tourism Office', 'Управление туризма Ургенча'),
        ]),
        type('hospital', [
          org('urgench-hospital', 'Urganch viloyat shifoxonasi', 'Urgench Regional Hospital', 'Ургенчская областная больница'),
          org('urgench-children', 'Urganch bolalar klinikasi', 'Urgench Children Clinic', 'Детская клиника Ургенча'),
        ]),
      ]),
      city('khiva', 'Xiva', 'Khiva', 'Хива', [
        type('university', [
          org('khiva-tourism', 'Xiva turizm kolleji', 'Khiva Tourism College', 'Туристический колледж Хивы'),
          org('khiva-art', 'Xiva san’at maktabi', 'Khiva Arts School', 'Школа искусств Хивы'),
        ]),
        type('government-office', [
          org('khiva-hokimiyat', 'Xiva hokimligi', 'Khiva Administration', 'Хокимият Хивы'),
          org('khiva-heritage', 'Xiva merosni saqlash boshqarmasi', 'Khiva Heritage Preservation Office', 'Управление охраны наследия Хивы'),
        ]),
        type('hospital', [
          org('khiva-hospital', 'Xiva shahar shifoxonasi', 'Khiva City Hospital', 'Городская больница Хивы'),
          org('khiva-clinic', 'Xiva oilaviy poliklinikasi', 'Khiva Family Clinic', 'Семейная поликлиника Хивы'),
        ]),
      ]),
    ],
  },
];

export function getLocalizedText(name, language) {
  if (!name) {
    return '';
  }

  return name[language] || name.uz || name.en || '';
}

export function findRegion(regionId) {
  return uzbekistanRegions.find((region) => region.id === regionId) || null;
}

export function findCity(regionId, cityId) {
  return findRegion(regionId)?.cities.find((cityItem) => cityItem.id === cityId) || null;
}

export function findOrganizationType(regionId, cityId, organizationTypeId) {
  return (
    findCity(regionId, cityId)?.organizationTypes.find((item) => item.id === organizationTypeId) ||
    null
  );
}

export function findOrganization(regionId, cityId, organizationTypeId, organizationId) {
  return (
    findOrganizationType(regionId, cityId, organizationTypeId)?.organizations.find(
      (item) => item.id === organizationId,
    ) || null
  );
}

export function getLocationLabel(report, language) {
  const region = findRegion(report.regionId);
  const cityItem = findCity(report.regionId, report.cityId);
  const organizationType = findOrganizationType(
    report.regionId,
    report.cityId,
    report.organizationTypeId,
  );
  const organization = findOrganization(
    report.regionId,
    report.cityId,
    report.organizationTypeId,
    report.organizationId,
  );

  return {
    region: getLocalizedText(region?.name, language),
    city: getLocalizedText(cityItem?.name, language),
    organizationType: organizationType?.id || '',
    organization: getLocalizedText(organization?.name, language),
  };
}
