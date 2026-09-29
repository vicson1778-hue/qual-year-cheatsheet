// Каталог витрины.
// priceKzt: розничная цена из каталога Казахстана в тенге (число без пробелов).
// На сайте цена показывается в рублях: priceKzt × kztToRub (см. config.js), со сноской.
// ВАЖНО: сейчас стоят временные цены. Замените их ценами из актуального каталога.
//
// cat:  health | beauty | home
// tags: energy, immunity, skin, shape, hair, clean, water, air, family
//       (по ним квиз подбирает товары и программы)

window.SHOP_PRODUCTS = [
  // ---------- Здоровье ----------
  { id: "daily", cat: "health", brand: "Nutrilite", name: "Дейли, мультивитамины",
    size: "60 таблеток", priceKzt: 10450, tags: ["energy", "immunity", "family"],
    desc: "Витамины и минералы на каждый день. Удобно: одна таблетка в день." },
  { id: "omega", cat: "health", brand: "Nutrilite", name: "Омега-3 комплекс",
    size: "90 капсул", priceKzt: 12450, tags: ["energy", "skin", "family"],
    desc: "Дополнительный источник омега-3 жирных кислот из рыбьего жира." },
  { id: "vitd", cat: "health", brand: "Nutrilite", name: "Витамин D",
    size: "90 таблеток", priceKzt: 5950, tags: ["immunity", "family"],
    desc: "Поддержка в сезон, когда солнца мало." },
  { id: "vitc", cat: "health", brand: "Nutrilite", name: "Витамин C плюс",
    size: "60 таблеток", priceKzt: 6950, tags: ["immunity"],
    desc: "Витамин C с растительными концентратами." },
  { id: "calmag", cat: "health", brand: "Nutrilite", name: "Кальций, магний, витамин D",
    size: "180 таблеток", priceKzt: 8950, tags: ["family", "energy"],
    desc: "Минералы для ежедневного рациона всей семьи." },
  { id: "protein", cat: "health", brand: "Nutrilite", name: "Протеин растительный",
    size: "450 г", priceKzt: 14950, tags: ["shape", "energy"],
    desc: "Белок из сои, пшеницы и гороха. Добавляйте в каши, смузи, выпечку." },
  { id: "probiotic", cat: "health", brand: "Nutrilite", name: "Пробиотик",
    size: "30 саше", priceKzt: 13450, tags: ["immunity", "shape"],
    desc: "Полезные бактерии для баланса микрофлоры." },
  { id: "fiber", cat: "health", brand: "Nutrilite", name: "Клетчатка, порошок",
    size: "30 саше", priceKzt: 7950, tags: ["shape"],
    desc: "Помогает сделать рацион сбалансированнее и дольше сохранять сытость." },

  // ---------- Красота ----------
  { id: "cleanser", cat: "beauty", brand: "Artistry Skin Nutrition", name: "Очищающая пенка",
    size: "125 мл", priceKzt: 9950, tags: ["skin"],
    desc: "Мягко очищает, не пересушивает. Для ежедневного ухода утром и вечером." },
  { id: "toner", cat: "beauty", brand: "Artistry Skin Nutrition", name: "Увлажняющий тоник",
    size: "200 мл", priceKzt: 10950, tags: ["skin"],
    desc: "Восстанавливает баланс кожи после умывания." },
  { id: "cream", cat: "beauty", brand: "Artistry Skin Nutrition", name: "Увлажняющий гель-крем",
    size: "50 мл", priceKzt: 17950, tags: ["skin"],
    desc: "Лёгкая текстура, глубокое увлажнение на весь день." },
  { id: "serum", cat: "beauty", brand: "Artistry Skin Nutrition", name: "Сыворотка с витамином C",
    size: "30 мл", priceKzt: 21450, tags: ["skin"],
    desc: "Для ровного тона и сияния кожи." },
  { id: "shampoo", cat: "beauty", brand: "Satinique", name: "Шампунь для гладкости волос",
    size: "280 мл", priceKzt: 5450, tags: ["hair", "family"],
    desc: "Мягко очищает и облегчает расчёсывание." },
  { id: "conditioner", cat: "beauty", brand: "Satinique", name: "Кондиционер",
    size: "250 мл", priceKzt: 5950, tags: ["hair"],
    desc: "Питает и защищает волосы по всей длине." },
  { id: "handcream", cat: "beauty", brand: "G&H", name: "Крем для рук",
    size: "100 мл", priceKzt: 3950, tags: ["skin", "family"],
    desc: "Питательный крем без липкости." },
  { id: "toothpaste", cat: "beauty", brand: "Glister", name: "Зубная паста многофункциональная",
    size: "200 мл", priceKzt: 3450, tags: ["family"],
    desc: "Большой тюбик надолго хватает всей семье." },

  // ---------- Для дома ----------
  { id: "loc", cat: "home", brand: "Amway Home", name: "L.O.C. универсальное чистящее средство",
    size: "1 л", priceKzt: 6450, tags: ["clean", "family"],
    desc: "Концентрат: одной бутылки хватает на много разведений." },
  { id: "sa8", cat: "home", brand: "Amway Home", name: "SA8 концентрированный стиральный порошок",
    size: "3 кг", priceKzt: 14950, tags: ["clean", "family"],
    desc: "Малая дозировка, хорошо отстирывает даже в прохладной воде." },
  { id: "dish", cat: "home", brand: "Amway Home", name: "Dish Drops средство для посуды",
    size: "1 л", priceKzt: 4950, tags: ["clean"],
    desc: "Концентрат, легко смывается, бережно к рукам." },
  { id: "zoom", cat: "home", brand: "Amway Home", name: "Средство для мытья стёкол",
    size: "500 мл", priceKzt: 3950, tags: ["clean"],
    desc: "Без разводов на окнах, зеркалах и глянцевых поверхностях." },
  { id: "espring", cat: "home", brand: "eSpring", name: "Система очистки воды",
    size: "настольная / под мойку", priceKzt: 449500, tags: ["water", "family"],
    desc: "Чистая вода прямо из-под крана. Консультант поможет выбрать вариант установки." },
  { id: "atmosphere", cat: "home", brand: "Atmosphere", name: "Очиститель воздуха",
    size: "для комнат до 40 м²", priceKzt: 599500, tags: ["air", "family"],
    desc: "Для тех, у кого аллергия, дети или город за окном." }
];

// Готовые программы: набор товаров под задачу.
// Цена считается автоматически как сумма товаров из items.
window.SHOP_PROGRAMS = [
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
    items: ["loc", "sa8", "dish", "zoom"], tags: ["clean", "family"],
    desc: "Концентраты на всю уборку и стирку. Меньше бутылок, меньше агрессивной химии." }
];
