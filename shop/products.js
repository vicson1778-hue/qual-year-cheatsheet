// Каталог витрины.
// priceKzt: розничная цена из каталога Казахстана в тенге (число без пробелов).
// На сайте цена показывается в рублях: priceKzt × kztToRub (см. config.js), со сноской.
// img: фото товара (из каталога), папка shop/img.
// sku: артикул из каталога. Попадает в заявку, чтобы было проще оформить заказ.
// Цены и артикулы сверены с каталогом РК rukz-katalog-2026 (файл от 16.09.2026).
//
// cat:  health | beauty | home
// tags: energy, immunity, gut, skin, shape, hair, clean, water, air, family
//       (по ним квиз подбирает товары и программы)

window.SHOP_PRODUCTS = [
  // ---------- Здоровье ----------
  { id: "daily", cat: "health", img: "img/daily.webp", brand: "Nutrilite", name: "Дэйли, витамины и минералы",
    size: "45 таблеток", sku: "125166", priceKzt: 9970, tags: ["energy", "immunity", "family"],
    desc: "Витамины и минералы на каждый день для взрослых." },
  { id: "omega", cat: "health", img: "img/omega.webp", brand: "Nutrilite", name: "Омега-3 Комплекс Плюс",
    size: "60 капсул", sku: "126136", priceKzt: 23055, tags: ["energy", "skin", "family"],
    desc: "Дополнительный источник омега-3 (ЭПК и ДГК) из рыбьего жира и масла семян чиа." },
  { id: "vitd", cat: "health", img: "img/vitd.webp", brand: "Nutrilite", name: "Витамин D",
    size: "90 таблеток", sku: "119797", priceKzt: 11450, tags: ["immunity", "family"],
    desc: "Поддержка в сезон, когда солнца мало." },
  { id: "vitc", cat: "health", img: "img/vitc.webp", brand: "Nutrilite", name: "Витамин С плюс",
    size: "60 таблеток", sku: "109741", priceKzt: 11370, tags: ["immunity"],
    desc: "Витамин С с концентратом вишни ацеролы, высвобождается постепенно в течение 8 часов." },
  { id: "calmag", cat: "health", img: "img/calmag.webp", brand: "Nutrilite", name: "Кальций, магний, витамин D комплекс",
    size: "90 таблеток", sku: "110605", priceKzt: 8325, tags: ["family", "energy"],
    desc: "Минералы для ежедневного рациона." },
  { id: "protein", cat: "health", img: "img/protein.webp", brand: "Nutrilite", name: "Протеиновый порошок",
    size: "450 г", sku: "110415", priceKzt: 21800, tags: ["shape", "energy"],
    desc: "Растительный белок. Добавляйте в каши, смузи, выпечку." },
  { id: "probiotic", cat: "health", img: "img/probiotic.webp", brand: "Nutrilite", name: "Balance Within Пробиотик",
    size: "30 саше", sku: "120571", priceKzt: 22200, tags: ["immunity", "shape", "gut"],
    desc: "Полезные бактерии для баланса микрофлоры кишечника." },
  { id: "fiber", cat: "health", img: "img/fiber.webp", brand: "Nutrilite", name: "Жевательные таблетки Смесь пищевых волокон",
    size: "30 таблеток", sku: "104283", priceKzt: 11220, tags: ["shape", "gut"],
    desc: "Растворимые и нерастворимые пищевые волокна из 13 источников. Со вкусом апельсинового крема." },
  { id: "inulin", cat: "health", img: "img/inulin.webp", brand: "Nutrilite", name: "Смесь пищевых волокон с инулином",
    size: "30 пакетиков по 6 г", sku: "102736", priceKzt: 21060, tags: ["gut"],
    desc: "Пищевые волокна и инулин из корня цикория. Напиток: 1 пакетик в день." },
  { id: "liver", cat: "health", img: "img/liver.webp", brand: "Nutrilite", name: "Печень Актив",
    size: "60 таблеток", sku: "100352", priceKzt: 13990, tags: ["gut"],
    desc: "Экстракты расторопши и одуванчика, витамины группы B. 1 таблетка в сутки." },
  { id: "garlic", cat: "health", img: "img/garlic.webp", brand: "Nutrilite", name: "Чеснок",
    size: "120 таблеток", sku: "100566", priceKzt: 14200, tags: ["immunity", "gut"],
    desc: "Концентрат чеснока в таблетках, без запаха." },
  { id: "doublex", cat: "health", img: "img/doublex.webp", brand: "Nutrilite", name: "Double X, витамины, минералы и фитонутриенты",
    size: "упаковка на 31 день", sku: "121576", priceKzt: 29080, tags: ["energy", "immunity"],
    desc: "Комплекс витаминов, минералов и фитонутриентов на месяц." },
  { id: "xsmag", cat: "health", img: "img/xsmag.webp", brand: "XS", name: "Магний, вкус лимона",
    size: "30 стик-пакетиков", sku: "121062", priceKzt: 7775, tags: ["energy"],
    desc: "Магний в удобных стиках для напитка. Без сахара." },
  { id: "appetite", cat: "health", img: "img/appetite.webp", brand: "Nutrilite", name: "Контроль аппетита",
    size: "30 саше", sku: "119792", priceKzt: 20575, tags: ["shape", "gut"],
    desc: "Помощник для тех, кто следит за питанием и перекусами." },
  { id: "bdlight", cat: "health", img: "img/bdlight.webp", brand: "Nutrilite", name: "Набор Body Detox Light",
    size: "3 продукта", sku: "313447", priceKzt: 54008, tags: ["gut", "shape"],
    desc: "Смесь пищевых волокон с инулином, Печень Актив и Протеиновый порошок. Базовый набор на 3 недели." },

  // ---------- Красота ----------
  { id: "cleanser", cat: "beauty", img: "img/cleanser.webp", brand: "Artistry Skin Nutrition", name: "Увлажняющий очищающий мусс для умывания",
    size: "145 мл", sku: "123793", priceKzt: 17920, tags: ["skin"],
    desc: "Мягко очищает, не пересушивает. Для ежедневного ухода утром и вечером." },
  { id: "toner", cat: "beauty", img: "img/toner.webp", brand: "Artistry Skin Nutrition", name: "Увлажняющий смягчающий тоник для лица",
    size: "200 мл", sku: "123795", priceKzt: 14260, tags: ["skin"],
    desc: "Восстанавливает баланс кожи после умывания." },
  { id: "cream", cat: "beauty", img: "img/cream.webp", brand: "Artistry Skin Nutrition", name: "Увлажняющий крем-гель для лица",
    size: "50 г", sku: "123798", priceKzt: 24025, tags: ["skin"],
    desc: "Лёгкая текстура, интенсивное увлажнение." },
  { id: "serum", cat: "beauty", img: "img/serum.webp", brand: "Artistry Skin Nutrition", name: "Сыворотка с витамином C и гиалуроновой кислотой",
    size: "12 мл", sku: "125517", priceKzt: 34955, tags: ["skin"],
    desc: "Для более ровного тона и сияния кожи." },
  { id: "shampoo", cat: "beauty", img: "img/shampoo.webp", brand: "Satinique", name: "Шампунь для гладкости волос",
    size: "280 мл", sku: "126449", priceKzt: 8495, tags: ["hair", "family"],
    desc: "С экстрактами киноа и баобаба. Мягко очищает и облегчает расчёсывание." },
  { id: "conditioner", cat: "beauty", img: "img/conditioner.webp", brand: "Satinique", name: "Кондиционер для гладкости волос",
    size: "280 мл", sku: "126451", priceKzt: 7915, tags: ["hair"],
    desc: "Увлажнение и гладкость без утяжеления." },
  { id: "handcream", cat: "beauty", img: "img/handcream.webp", brand: "g&h", name: "Питательный крем для рук",
    size: "75 мл", sku: "125902", priceKzt: 6155, tags: ["skin", "family"],
    desc: "Питательный крем без липкости." },
  { id: "toothpaste", cat: "beauty", img: "img/toothpaste.webp", brand: "Glister", name: "Многофункциональная зубная паста",
    size: "200 г", sku: "124106", priceKzt: 4200, tags: ["family"],
    desc: "Защищает эмаль, уменьшает налёт, освежает дыхание. Большой тюбик надолго." },

  // ---------- Для дома ----------
  { id: "loc", cat: "home", img: "img/loc.webp", brand: "Amway Home", name: "L.O.C. Многофункциональное чистящее средство",
    size: "1 л", sku: "0001", priceKzt: 5900, tags: ["clean", "family"],
    desc: "Концентрат: из 1 л получается 20 флаконов готового средства." },
  { id: "sa8", cat: "home", img: "img/sa8.webp", brand: "Amway Home", name: "SA8 Premium, стиральный порошок концентрированный",
    size: "3 кг", sku: "109849", priceKzt: 26900, tags: ["clean", "family"],
    desc: "Малая дозировка, эффективен при низких температурах." },
  { id: "dish", cat: "home", img: "img/dish.webp", brand: "Amway Home", name: "Dish Drops, жидкость для мытья посуды",
    size: "1 л", sku: "110488", priceKzt: 6430, tags: ["clean"],
    desc: "Концентрат: из 1 л получается 8 флаконов по 500 мл." },
  { id: "glass", cat: "home", img: "img/glass.webp", brand: "Amway Home", name: "L.O.C. Жидкость для мытья стёкол",
    size: "500 мл", sku: "117080", priceKzt: 4905, tags: ["clean"],
    desc: "Для окон, зеркал и глянцевых поверхностей. Режимы «распыление» и «пена»." },
  { id: "espring", cat: "home", img: "img/espring.webp", brand: "eSpring", name: "Система очистки воды",
    size: "с подключением к основному крану", sku: "122940", priceKzt: 702270, tags: ["water", "family"],
    desc: "Чистая вода прямо из-под крана. Консультант поможет выбрать вариант установки." },
  { id: "atmosphere", cat: "home", img: "img/atmosphere.webp", brand: "Atmosphere", name: "Atmosphere Mini, очиститель воздуха",
    size: "фильтр 3 в 1", sku: "124746", priceKzt: 488540, tags: ["air", "family"],
    desc: "Предфильтр, HEPA и угольный фильтр: задерживает мелкие частицы и запахи." }
];

// Готовые программы: набор товаров под задачу.
// Цена считается автоматически как сумма товаров из items.
window.SHOP_PROGRAMS = [
  // ---------- Программы здоровья с сопровождением (coached: true) ----------
  // items: товары набора (цена = сумма). Пустой items: набор подбирается индивидуально.
  { id: "c-gut", coached: true, name: "Здоровый кишечник", duration: "5 недель",
    cover: "img/cover-gut.webp", start: "Старт 5 числа каждого месяца", format: "Онлайн, из любой точки мира",
    items: ["probiotic", "protein", "xsmag", "doublex", "liver", "garlic", "omega", "fiber", "appetite"],
    tags: ["gut", "immunity", "shape"],
    desc: "Пошаговая программа для комфортного пищеварения и лёгкости. 5 недель заботы о себе под сопровождением специалистов и врача-эксперта.",
    features: ["Ежедневное сопровождение", "Меню и рекомендации", "Чат поддержки", "Экспертные эфиры", "Разбор анализов", "Рекомендации по нутриентам"],
    forWhom: "При вздутии и дискомфорте, для комфортного пищеварения, для поддержки иммунитета, для тех, кто хочет чувствовать лёгкость каждый день.",
    note: "Количество мест ограничено" },
  { id: "c-detox14", coached: true, name: "Детокс 14 дней", duration: "14 дней",
    cover: "img/cover-detox14.webp", start: "Старт по набору группы", format: "Онлайн, в чате",
    items: [], tags: ["gut", "energy", "shape"],
    desc: "Мягкая программа обновления: больше энергии, лёгкости и баланса. Без строгих диет, без подсчёта калорий, без изнурительных тренировок и без стресса.",
    features: ["14 дней пользы: ежедневные темы и простые объяснения", "Готовое меню на каждый день", "Поддержка и мотивация", "Отчёты в чате и лёгкие задания", "Бонусы: чек-листы, гайды, материалы экспертов"],
    forWhom: "Для тех, кто хочет вернуть энергию, лёгкость и полезные привычки." },
  { id: "c-detox21", coached: true, name: "Детокс 21 день", duration: "21 день",
    cover: "img/cover-detox21.webp", start: "Старт по набору группы", format: "Онлайн, в чате",
    items: ["bdlight"], tags: ["gut", "shape", "energy"],
    desc: "Комплексная программа мягкого очищения и восстановления. Больше энергии, ясности и лёгкости каждый день.",
    features: ["Пошаговый план на 21 день", "Сбалансированное меню и рецепты", "Поддержка и мотивация каждый день", "Чек-листы, гайды и полезные материалы", "Практики для энергии и гармонии", "Рекомендации по образу жизни"],
    forWhom: "Для тех, кто хочет мягко перезагрузиться без стресса для организма." },

  // ---------- Готовые наборы ----------
  { id: "p-energy", name: "Энергия каждый день", duration: "30 дней",
    items: ["daily", "omega", "vitd"], tags: ["energy", "immunity"],
    desc: "Базовый набор для тех, кто устаёт к середине дня. Схема приёма и поддержка консультанта." },
  { id: "p-immunity", name: "Крепкий сезон", duration: "30 дней",
    items: ["vitd", "vitc", "probiotic"], tags: ["immunity", "family"],
    desc: "Поддержка организма в холодное время года." },
  { id: "p-shape", name: "Перезагрузка 21 день", duration: "21 день",
    items: ["protein", "fiber", "daily"], tags: ["shape", "energy"],
    desc: "Питание, привычки и ежедневная связь с консультантом. Без жёстких диет." },
  { id: "p-skin", name: "Сияние кожи", duration: "30 дней",
    items: ["cleanser", "toner", "cream", "omega"], tags: ["skin"],
    desc: "Уход снаружи и поддержка изнутри. Подберём под ваш тип кожи." },
  { id: "p-home", name: "Чистый дом", duration: "3-4 месяца",
    items: ["loc", "sa8", "dish", "glass"], tags: ["clean", "family"],
    desc: "Концентраты на всю уборку и стирку. Меньше бутылок, меньше агрессивной химии." }
];
