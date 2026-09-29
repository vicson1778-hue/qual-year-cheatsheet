/**
 * Бэкенд витрины: приём заявок с сайта + Telegram-бот.
 *
 * Что умеет:
 *  - заявки с сайта: строка в листе «Заявки» и сообщение вам в Telegram;
 *  - бот: меню, программы, каталог, подбор за 3 вопроса, заявка в чате;
 *  - напоминания о повторной покупке (лист «Покупки», запуск раз в день);
 *  - рассылки подписчикам с кнопкой «Записаться» (лист «Записи»).
 *
 * Товары, цены и описания бот берёт с сайта (config.js, products.js, details.js),
 * поэтому менять их нужно только на сайте.
 *
 * Установка: shop/README.md, раздел «Telegram-бот».
 * Свойства скрипта (Настройки проекта → Свойства скрипта):
 *   TELEGRAM_TOKEN    токен бота от @BotFather (обязательно)
 *   TELEGRAM_CHAT_ID  ваш chat id: сюда приходят заявки, и только вам доступны команды (обязательно)
 *   SITE_URL          адрес витрины, по умолчанию https://vicson1778-hue.github.io/qual-year-cheatsheet/shop/
 *   WEBAPP_URL        адрес веб-приложения (…/exec), если setup() не определит его сам
 *   WEBHOOK_SECRET    создаётся автоматически функцией setup()
 */

var DEFAULT_SITE = 'https://vicson1778-hue.github.io/qual-year-cheatsheet/shop/';
var SH = { leads: 'Заявки', subs: 'Подписчики', buys: 'Покупки', signups: 'Записи', casts: 'Рассылки' };
var HEADERS = {
  'Заявки': ['Дата', 'Имя', 'Контакт', 'Когда связаться', 'Подборка', 'Сумма, ₽ (примерно)', 'Подбор (квиз)', 'Комментарий', 'Источник', 'Статус'],
  'Подписчики': ['chat_id', 'Username', 'Имя', 'Дата подписки', 'Источник', 'Статус', 'Последняя активность'],
  'Покупки': ['ID', 'Дата покупки', 'Клиент (@username или chat_id)', 'Товар', 'Напомнить через, дней', 'Напомнено', 'chat_id'],
  'Записи': ['Дата', 'chat_id', 'Username', 'Имя', 'Рассылка'],
  'Рассылки': ['ID', 'Дата', 'Текст', 'Кнопка «Записаться»', 'Отправлено']
};
var CAT = { health: 'Здоровье', beauty: 'Красота', home: 'Для дома' };
var DEFAULT_REMIND_DAYS = 28;

// =====================================================================
// Точки входа
// =====================================================================

function doPost(e) {
  var q = (e && e.parameter) || {};
  if (q.tg) {
    // Запрос от Telegram. Секрет в адресе защищает от подделки.
    var c = cfg_();
    if (c.secret && q.tg === c.secret) {
      try { handleUpdate_(JSON.parse(e.postData.contents)); } catch (err) { console.error(err); }
    }
    // HtmlOutput отвечает кодом 200, и Telegram не присылает запрос повторно.
    return HtmlService.createHtmlOutput('ok');
  }
  return handleSiteLead_(e);
}

function doGet() { return HtmlService.createHtmlOutput('ok'); }

// =====================================================================
// Заявки с сайта
// =====================================================================

function handleSiteLead_(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json_({ ok: true }); // скрытое поле: заполняют только спам-боты

    var name = clip_(d.name, 80);
    var contact = clip_(d.contact, 80);
    if (!name || !contact) return json_({ ok: false, error: 'empty' });

    var items = (d.items || []).slice(0, 50).map(function (i) {
      return clip_(i.name, 120) + ' x' + (parseInt(i.qty, 10) || 1);
    }).join('; ');

    sheet_(SH.leads).appendRow([
      new Date(), cell_(name), cell_(contact), cell_(clip_(d.time, 40)), cell_(items),
      Number(d.total) || 0, cell_(clip_(d.quiz, 400)), cell_(clip_(d.comment, 600)),
      cell_(clip_(d.source, 120) || 'сайт'), 'новая'
    ]);
    notifyAdmin_(esc_(clip_(d.text, 3500) || ('Новая заявка: ' + name + ', ' + contact)));
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false });
  }
}

// =====================================================================
// Установка (запустить вручную один раз после развёртывания)
// =====================================================================

function setup() {
  var p = PropertiesService.getScriptProperties();
  var c = cfg_();
  if (!c.token || !c.admin) throw new Error('Заполните свойства TELEGRAM_TOKEN и TELEGRAM_CHAT_ID.');
  Object.keys(HEADERS).forEach(function (n) { sheet_(n); });

  if (!p.getProperty('WEBHOOK_SECRET')) p.setProperty('WEBHOOK_SECRET', Utilities.getUuid().replace(/-/g, ''));
  var url = p.getProperty('WEBAPP_URL') || ScriptApp.getService().getUrl();
  if (!url || !/\/exec$/.test(url)) throw new Error('Не найден адрес веб-приложения …/exec. Разверните веб-приложение или впишите его в свойство WEBAPP_URL.');

  var hook = tg_('setWebhook', {
    url: url + '?tg=' + p.getProperty('WEBHOOK_SECRET'),
    allowed_updates: ['message', 'callback_query', 'my_chat_member'],
    drop_pending_updates: true
  });
  tg_('setMyCommands', { commands: [
    { command: 'start', description: 'Главное меню' },
    { command: 'programs', description: 'Программы здоровья' },
    { command: 'catalog', description: 'Каталог товаров' },
    { command: 'quiz', description: 'Подбор за 3 вопроса' },
    { command: 'order', description: 'Оставить заявку' },
    { command: 'stop', description: 'Отписаться от рассылок' }
  ] });

  var exists = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'dailyReminders'; });
  if (!exists) ScriptApp.newTrigger('dailyReminders').timeBased().everyDays(1).atHour(10).create();

  var me = tg_('getMe', {});
  var name = me && me.result ? '@' + me.result.username : '(бот)';
  notifyAdmin_('✅ Бот ' + esc_(name) + ' подключён.\nКоманды для вас: /admin');
  console.log('Webhook: ' + JSON.stringify(hook) + '; бот: ' + name);
}

// Проверка связи с вами (можно запустить из редактора).
function testTelegram() { notifyAdmin_('Проверка: заявки и сообщения бота будут приходить сюда.'); }

// =====================================================================
// Обработка сообщений Telegram
// =====================================================================

function handleUpdate_(u) {
  if (u.update_id != null && seen_('u' + u.update_id)) return;
  if (u.message) return onMessage_(u.message);
  if (u.callback_query) return onCallback_(u.callback_query);
  if (u.my_chat_member) return onMember_(u.my_chat_member);
}

function onMember_(m) {
  if (!m.chat || m.chat.type !== 'private') return;
  var st = m.new_chat_member && m.new_chat_member.status;
  if (st === 'kicked') setSubStatus_(m.chat.id, 'заблокировал');
}

function onMessage_(m) {
  if (!m.chat || m.chat.type !== 'private') return;
  var chatId = m.chat.id, from = m.from || {};
  var text = String(m.text || '').trim();
  touchSub_(from, text.indexOf('/start') === 0 ? (text.split(' ')[1] || 'бот') : '');

  var cmd = text.split(/\s+/)[0].toLowerCase().replace(/@\w+$/, '');
  var arg = text.slice(text.indexOf(' ') + 1 || text.length).trim();

  if (isAdmin_(chatId)) {
    if (cmd === '/admin') return adminHelp_(chatId);
    if (cmd === '/broadcast') return adminBroadcastPreview_(chatId, arg);
    if (cmd === '/buy') return adminAddPurchase_(chatId, arg);
    if (cmd === '/stats') return adminStats_(chatId);
    if (cmd === '/remind') { dailyReminders(); return send_(chatId, 'Проверка напоминаний выполнена.'); }
  }

  if (cmd === '/start') {
    clearState_(chatId);
    var payload = arg && arg !== '/start' ? arg : '';
    showMenu_(chatId, from.first_name, true);
    if (/^item_/.test(payload)) showProduct_(chatId, payload.slice(5));
    if (/^prog_/.test(payload)) showProgram_(chatId, payload.slice(5));
    return;
  }
  if (cmd === '/menu') { clearState_(chatId); return showMenu_(chatId, from.first_name, false); }
  if (cmd === '/programs') return showPrograms_(chatId);
  if (cmd === '/catalog') return showCatalog_(chatId);
  if (cmd === '/quiz') return quizStep_(chatId, []);
  if (cmd === '/order') return startLead_(chatId, from, '');
  if (cmd === '/stop') {
    setSubStatus_(chatId, 'отписан');
    return send_(chatId, 'Вы отписались от рассылок. Вернуться можно командой /start.');
  }
  if (cmd === '/help') return showMenu_(chatId, from.first_name, false);

  var st = getState_(chatId);
  if (st && st.step) return leadStep_(chatId, from, st, m);

  if (isAdmin_(chatId)) return send_(chatId, 'Это ваш бот. Команды для вас: /admin, меню клиента: /menu');

  // Свободный текст: пересылаем консультанту.
  if (text || m.photo || m.voice) {
    notifyAdmin_('💬 Сообщение в боте от ' + who_(from) + ':\n' + esc_(text || '[вложение]'));
    if (!text && !isAdmin_(chatId)) tg_('forwardMessage', { chat_id: cfg_().admin, from_chat_id: chatId, message_id: m.message_id });
    send_(chatId, 'Спасибо! Консультант скоро ответит вам лично. А пока можно посмотреть меню:', menuKb_());
  }
}

function onCallback_(q) {
  var chatId = q.message && q.message.chat.id, from = q.from || {};
  var d = String(q.data || '');
  tg_('answerCallbackQuery', { callback_query_id: q.id });
  if (!chatId) return;
  touchSub_(from, '');
  var parts = d.split(':');
  var a = parts[0];

  if (a === 'm') { clearState_(chatId); return showMenu_(chatId, from.first_name, false); }
  if (a === 'pr') return parts[1] ? showProgram_(chatId, parts[1]) : showPrograms_(chatId);
  if (a === 'cat') return parts[1] ? showCategory_(chatId, parts[1]) : showCatalog_(chatId);
  if (a === 'p') return showProduct_(chatId, parts[1]);
  if (a === 'q') return quizStep_(chatId, parts.slice(1));
  if (a === 'lead') return startLead_(chatId, from, parts[1] || '', parts.slice(2).join(':'));
  if (a === 'dl') return showDownloads_(chatId);
  if (a === 'again') return reminderAgain_(chatId, from, parts[1]);
  if (a === 'later') return reminderLater_(chatId, parts[1]);
  if (a === 'su') return signup_(chatId, from, parts[1]);
  if (a === 'bc' && isAdmin_(chatId)) return adminBroadcastSend_(chatId, parts[1], parts[2]);
}

// =====================================================================
// Экраны бота
// =====================================================================

function menuKb_() {
  return kb_([
    [btn_('🌿 Программы здоровья', 'pr')],
    [btn_('🛍 Каталог', 'cat'), btn_('🧭 Подбор за 3 вопроса', 'q')],
    [btn_('📥 Скачать каталог', 'dl'), btn_('✍️ Оставить заявку', 'lead')],
    [url_('🌐 Открыть сайт', site_())].concat(consultantBtn_())
  ]);
}

function consultantBtn_() {
  var u = (data_().cfg || {}).telegramUsername;
  return u ? [url_('💬 Написать консультанту', 'https://t.me/' + u)] : [];
}

function showMenu_(chatId, firstName, greet) {
  var name = (data_().cfg || {}).siteName || 'Магазин здоровья и красоты';
  var t = greet
    ? 'Здравствуйте' + (firstName ? ', ' + esc_(firstName) : '') + '! 👋\nЭто бот «' + esc_(name) + '».\n\n' +
      'Здесь можно подобрать продукты для здоровья, красоты и дома, узнать о программах с сопровождением и оставить заявку на бесплатную консультацию.'
    : 'Главное меню:';
  send_(chatId, t, menuKb_());
}

function showPrograms_(chatId) {
  var D = data_();
  var rows = D.PR.filter(function (p) { return p.coached; }).map(function (p) { return [btn_('🌿 ' + p.name + ' · ' + p.duration, 'pr:' + p.id)]; });
  D.PR.filter(function (p) { return !p.coached; }).forEach(function (p) { rows.push([btn_('📦 ' + p.name + ' · ' + rub_(p.price), 'pr:' + p.id)]); });
  rows.push([btn_('‹ Меню', 'm')]);
  send_(chatId, '<b>Программы здоровья с сопровождением</b>\nПродукты, план, меню и поддержка каждый день.\n\nНиже также готовые наборы 📦', kb_(rows));
}

function showProgram_(chatId, id) {
  var D = data_(), p = byId_(id);
  if (!p || !p.isProgram) return showPrograms_(chatId);
  var pic = p.cover || p.img;
  if (pic) photo_(chatId, jpg_(pic), '<b>' + esc_(p.name) + '</b>');
  var t = '<b>' + esc_(p.name) + '</b> · ' + esc_(p.duration) + (p.sku ? ' · арт. ' + esc_(p.sku) : '') + '\n\n' + esc_(p.desc);
  if (p.benefit) t += '\n\n<b>Чем полезно:</b> ' + esc_(p.benefit);
  if (p.coached) {
    t += '\n\n📍 ' + esc_(p.format) + '\n🗓 ' + esc_(p.start) + (p.note ? '\n⚠️ ' + esc_(p.note) : '');
    t += '\n\n<b>Что входит:</b>\n' + p.features.map(function (f) { return '✔️ ' + esc_(f); }).join('\n');
    if (p.forWhom) t += '\n\n<b>Для кого:</b> ' + esc_(p.forWhom);
  }
  t += '\n\n<b>Что входит:</b>' + (p.items.length ? '\n' + p.items.map(function (i) { var x = byId_(i); return x ? '• ' + esc_(x.name) + ' · ' + rub_(x.price) : ''; }).join('\n') : ' продукты подбираются индивидуально');
  t += '\n<b>' + (p.fixedKzt ? 'Цена программы' : 'Стоимость продуктов') + ':</b> ' + rub_(p.price) +
    (p.fixedKzt && p.sumPrice > p.price ? ' (по отдельности ' + rub_(p.sumPrice) + ')' : '') +
    (p.coached ? '\nСтоимость сопровождения уточняйте у консультанта.' : '');
  t += '\n\n<i>* Цены примерные, уточняйте у консультанта.</i>';
  var itemRows = p.items.slice(0, 6).map(function (i) { var x = byId_(i); return x ? [btn_('ℹ️ ' + x.name.slice(0, 48), 'p:' + x.id)] : null; }).filter(Boolean);
  send_(chatId, t, kb_([
    [btn_(p.coached ? '✅ Хочу в программу' : '✅ Хочу этот набор', 'lead:' + p.id)]].concat(p.coached ? [] : itemRows, [
    [url_('Подробнее на сайте', site_() + (p.coached ? '#solutions' : '#item=' + p.id))],
    [btn_('‹ Все программы', 'pr'), btn_('Меню', 'm')]
  ])));
}

function showCatalog_(chatId) {
  send_(chatId, '<b>Каталог</b>\nВыберите раздел:', kb_([
    [btn_('💚 Здоровье', 'cat:health')],
    [btn_('✨ Красота', 'cat:beauty')],
    [btn_('🏠 Для дома', 'cat:home')],
    [btn_('📥 Скачать полный каталог', 'dl')],
    [btn_('‹ Меню', 'm')]
  ]));
}

function showCategory_(chatId, cat) {
  var list = data_().P.filter(function (p) { return p.cat === cat; });
  var rows = list.map(function (p) { return [btn_(p.name.slice(0, 42) + ' · ' + rub_(p.price), 'p:' + p.id)]; });
  rows.push([btn_('‹ Разделы', 'cat'), btn_('Меню', 'm')]);
  send_(chatId, '<b>' + esc_(CAT[cat] || 'Каталог') + '</b>\nНажмите на товар, чтобы узнать, чем он полезен:', kb_(rows));
}

function showProduct_(chatId, id) {
  var D = data_(), p = byId_(id);
  if (!p || p.isProgram) return showCatalog_(chatId);
  var d = D.D[p.id] || {};
  var cap = '<b>' + esc_(p.name) + '</b>\n' + esc_(p.brand + ' · ' + p.size + (p.sku ? ' · арт. ' + p.sku : '')) +
    '\n💰 ' + rub_(p.price) + '\n\n' + (d.benefit ? '<b>Чем полезно:</b> ' + esc_(d.benefit) : esc_(p.desc));
  if (d.use) cap += '\n\n<b>Как применять:</b> ' + esc_(d.use);
  if (p.cat === 'health' && !d.notSupplement) cap += '\n\n<i>БАД, не является лекарственным средством.</i>';
  var kb = kb_([
    [btn_('✅ Хочу заказать', 'lead:' + p.id)],
    [url_('Подробнее на сайте', site_() + '#item=' + p.id)],
    [btn_('‹ ' + (CAT[p.cat] || 'Каталог'), 'cat:' + p.cat), btn_('Меню', 'm')]
  ]);
  var r = p.img ? photo_(chatId, jpg_(p.img), cap.slice(0, 1024), kb) : null;
  if (!r || !r.ok) send_(chatId, cap, kb);
}

function showDownloads_(chatId) {
  send_(chatId, '<b>Каталог продукции</b>\n\n📘 Полный каталог 2026: 252 страницы, цены в тенге.\n📗 Краткая подборка: наши программы и товары с ценами в рублях.', kb_([
    [url_('📘 Полный каталог (PDF, 18 МБ)', site_() + 'katalog-2026.pdf')],
    [url_('📗 Краткая подборка (PDF)', site_() + 'catalog.pdf')],
    [btn_('‹ Меню', 'm')]
  ]));
}

// ---------------------------------------------------------------------
// Подбор за 3 вопроса (ответы хранятся прямо в кнопках)
// ---------------------------------------------------------------------

var QUIZ = [
  { title: 'Что для вас сейчас главное?', opts: [
    ['energy', 'Больше энергии'], ['immunity', 'Иммунитет'], ['gut', 'Пищеварение и лёгкость'],
    ['shape', 'Форма и питание'], ['skin', 'Кожа и волосы'], ['clean', 'Чистый дом'], ['water', 'Вода и воздух']] },
  { title: 'Для кого подбираем?', opts: [['me', 'Для себя'], ['family', 'Для всей семьи'], ['gift', 'В подарок']] },
  { title: 'Как удобнее начать?', opts: [['program', 'Готовая программа'], ['single', 'С 1-2 продуктов'], ['talk', 'Сначала поговорить']] }
];

function quizStep_(chatId, ans) {
  ans = ans.filter(function (x) { return x; });
  if (ans.length < QUIZ.length) {
    var q = QUIZ[ans.length];
    var rows = q.opts.map(function (o) { return [btn_(o[1], ['q'].concat(ans, [o[0]]).join(':'))]; });
    rows.push([btn_('‹ Меню', 'm')]);
    return send_(chatId, '🧭 <b>Вопрос ' + (ans.length + 1) + ' из 3</b>\n' + q.title, kb_(rows));
  }
  var D = data_(), goal = ans[0], who = ans[1], start = ans[2];
  var tags = [goal];
  if (goal === 'skin') tags.push('hair');
  if (goal === 'water') tags.push('air');
  if (who === 'family') tags.push('family');
  function score(x) { return (x.tags || []).reduce(function (s, t) { return s + (tags.indexOf(t) >= 0 ? (t === goal ? 3 : 1) : 0); }, 0); }
  var prog = D.PR.slice().sort(function (a, b) { return score(b) - score(a); })[0];
  if (!prog || score(prog) < 3 || start === 'single') prog = null;
  var prods = D.P.filter(function (p) { return score(p) > 0; }).sort(function (a, b) { return score(b) - score(a) || a.price - b.price; }).slice(0, 3);
  var summary = QUIZ.map(function (q, i) { var o = q.opts.filter(function (x) { return x[0] === ans[i]; })[0]; return o ? o[1] : ''; }).join(', ');

  var t = '✨ <b>Ваш старт</b>\n';
  var rows = [];
  if (prog) {
    t += '\n' + (prog.coached ? '🌿 Программа с сопровождением: ' : '📦 Набор: ') + '<b>' + esc_(prog.name) + '</b> (' + esc_(prog.duration) + ', ' + rub_(prog.price) + ')\n' + esc_(prog.desc) + '\n';
    rows.push([btn_('Подробнее: ' + prog.name, 'pr:' + prog.id)]);
  }
  if (prods.length) {
    t += '\n<b>Можно начать с этого:</b>\n' + prods.map(function (p) { return '• ' + esc_(p.name) + ' · ' + rub_(p.price); }).join('\n');
    prods.forEach(function (p) { rows.push([btn_(p.name.slice(0, 50), 'p:' + p.id)]); });
  }
  t += '\n\nКонсультант поможет подобрать точнее и расскажет, как принимать.';
  rows.push([btn_('✍️ Получить консультацию', 'lead:quiz:' + ans.join('-'))]);
  rows.push([btn_('Пройти заново', 'q'), btn_('Меню', 'm')]);
  putState_(chatId + ':quiz', { summary: summary }, 21600);
  send_(chatId, t, kb_(rows));
}

// ---------------------------------------------------------------------
// Заявка в чате: имя → контакт → комментарий
// ---------------------------------------------------------------------

function startLead_(chatId, from, interest, extra) {
  var st = { step: 'name', interest: interest || '' };
  if (interest === 'quiz') { var qz = getStateRaw_(chatId + ':quiz'); st.interest = ''; st.quiz = qz ? qz.summary : String(extra || ''); }
  putState_(chatId, st);
  var what = st.interest && byId_(st.interest) ? ' на «' + esc_(byId_(st.interest).name) + '»' : '';
  var kb = from.first_name ? { keyboard: [[{ text: from.first_name }]], resize_keyboard: true, one_time_keyboard: true } : { remove_keyboard: true };
  send_(chatId, '✍️ Заявка' + what + '\n\nКак к вам обращаться? Напишите имя или нажмите кнопку ниже.\n\n' +
    '<i>Отправляя данные, вы соглашаетесь на их обработку по <a href="' + site_() + 'privacy.html">политике конфиденциальности</a>.</i>', kb);
}

function leadStep_(chatId, from, st, m) {
  var text = String(m.text || '').trim();
  if (st.step === 'name') {
    if (!text) return send_(chatId, 'Напишите, пожалуйста, имя текстом.');
    st.name = text.slice(0, 80); st.step = 'contact'; putState_(chatId, st);
    var rows = [[{ text: '📱 Отправить мой номер', request_contact: true }]];
    if (from.username) rows.push([{ text: 'Пишите мне в Telegram' }]);
    return send_(chatId, 'Приятно познакомиться, ' + esc_(st.name) + '!\nКак с вами связаться? Отправьте номер кнопкой или напишите его.', { keyboard: rows, resize_keyboard: true, one_time_keyboard: true });
  }
  if (st.step === 'contact') {
    var c = m.contact ? '+' + String(m.contact.phone_number).replace(/^\+/, '') : text;
    if (/^Пишите мне в Telegram$/i.test(text)) c = from.username ? '@' + from.username : 'Telegram';
    if (!c) return send_(chatId, 'Отправьте номер кнопкой или напишите его текстом.');
    st.contact = c.slice(0, 80); st.step = 'comment'; putState_(chatId, st);
    return send_(chatId, 'Что вас интересует или когда удобно связаться? Напишите пару слов или нажмите «Пропустить».', { keyboard: [[{ text: 'Пропустить' }]], resize_keyboard: true, one_time_keyboard: true });
  }
  if (st.step === 'comment') {
    st.comment = /^Пропустить$/i.test(text) ? '' : text.slice(0, 600);
    clearState_(chatId);
    saveLead_(from, st, 'Telegram-бот');
    send_(chatId, '✅ Спасибо, ' + esc_(st.name) + '! Заявка принята, консультант свяжется с вами в ближайшее время.', { remove_keyboard: true });
    return send_(chatId, 'Пока можно посмотреть:', menuKb_());
  }
  clearState_(chatId);
}

function saveLead_(from, st, source) {
  var p = st.interest ? byId_(st.interest) : null;
  var contact = st.contact + (from.username && st.contact.indexOf('@') !== 0 ? ' (@' + from.username + ')' : '');
  sheet_(SH.leads).appendRow([
    new Date(), cell_(st.name), cell_(contact), '', cell_(p ? p.name : ''), p ? p.price : 0,
    cell_(st.quiz || ''), cell_(st.comment || ''), source, 'новая'
  ]);
  var t = '🔔 <b>Новая заявка из бота</b>\nИмя: ' + esc_(st.name) + '\nКонтакт: ' + esc_(st.contact) + '\nTelegram: ' + who_(from);
  if (p) t += '\nИнтерес: ' + esc_(p.name) + (p.price ? ' (' + rub_(p.price) + ')' : '');
  if (st.quiz) t += '\nПодбор: ' + esc_(st.quiz);
  if (st.comment) t += '\nКомментарий: ' + esc_(st.comment);
  notifyAdmin_(t);
}

// =====================================================================
// Напоминания о повторной покупке (запускается триггером раз в день)
// =====================================================================

function dailyReminders() {
  var sh = sheet_(SH.buys), vals = sh.getDataRange().getValues();
  var today = new Date(); today.setHours(23, 59, 59, 0);
  var sent = 0, missing = [];
  for (var r = 1; r < vals.length; r++) {
    var row = vals[r], date = row[1], client = String(row[2] || '').trim(), product = String(row[3] || '').trim();
    if (!date || !product || row[5]) continue;
    if (!row[0]) { row[0] = 'b' + Date.now().toString(36) + r; sh.getRange(r + 1, 1).setValue(row[0]); }
    var days = row[4] === '' || row[4] == null || isNaN(Number(row[4])) ? DEFAULT_REMIND_DAYS : Number(row[4]);
    var due = new Date(date); due.setDate(due.getDate() + days);
    if (due > today) continue;
    var chatId = row[6] || resolveChat_(client);
    if (!chatId) { missing.push(client + ' · ' + product); sh.getRange(r + 1, 6).setValue('нет в боте'); continue; }
    if (!row[6]) sh.getRange(r + 1, 7).setValue(chatId);
    var res = send_(chatId, '👋 Здравствуйте! Как вам «' + esc_(product) + '»?\nЕсли запас заканчивается, можно заказать снова, чтобы не прерывать курс.', kb_([
      [btn_('✅ Да, заказать снова', 'again:' + row[0])],
      [btn_('⏰ Напомнить через неделю', 'later:' + row[0])]
    ]));
    sh.getRange(r + 1, 6).setValue(res && res.ok ? fmtDate_(new Date()) : 'ошибка отправки');
    if (res && res.ok) sent++;
    Utilities.sleep(60);
  }
  if (sent || missing.length) {
    notifyAdmin_('⏰ Напоминания о повторе: отправлено ' + sent + '.' +
      (missing.length ? '\nНе найдены в боте (клиент не нажимал /start или неверный @username):\n' + missing.map(esc_).join('\n') : ''));
  }
}

function findBuyRow_(id) {
  var vals = sheet_(SH.buys).getDataRange().getValues();
  for (var r = 1; r < vals.length; r++) if (String(vals[r][0]) === String(id)) return { r: r + 1, v: vals[r] };
  return null;
}

function reminderAgain_(chatId, from, id) {
  var b = findBuyRow_(id);
  var product = b ? String(b.v[3]) : 'повтор заказа';
  var name = [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Клиент';
  saveLead_(from, { name: name, contact: from.username ? '@' + from.username : 'Telegram id ' + chatId, comment: 'Повторный заказ: ' + product }, 'Напоминание в боте');
  send_(chatId, '✅ Отлично! Консультант свяжется с вами, чтобы оформить заказ «' + esc_(product) + '».');
}

function reminderLater_(chatId, id) {
  var b = findBuyRow_(id);
  if (b) {
    var sh = sheet_(SH.buys);
    sh.getRange(b.r, 2).setValue(new Date());
    sh.getRange(b.r, 5).setValue(7);
    sh.getRange(b.r, 6).setValue('');
  }
  send_(chatId, 'Хорошо, напомню через неделю 🙂');
}

// =====================================================================
// Рассылки и запись
// =====================================================================

function adminBroadcastPreview_(chatId, text) {
  if (!text || text === '/broadcast') return send_(chatId, 'Напишите текст после команды, например:\n<code>/broadcast 5 октября старт программы «Здоровый кишечник». Осталось 5 мест!</code>');
  var id = 'c' + Date.now().toString(36);
  sheet_(SH.casts).appendRow([id, new Date(), cell_(text.slice(0, 3500)), '', '']);
  var n = activeSubs_().length;
  send_(chatId, '<b>Предпросмотр рассылки</b> (получат ' + n + ' подписч.):\n\n' + esc_(text), kb_([
    [btn_('📣 Отправить с кнопкой «Записаться»', 'bc:s:' + id)],
    [btn_('📨 Отправить без кнопки', 'bc:p:' + id)],
    [btn_('Отмена', 'm')]
  ]));
}

function adminBroadcastSend_(chatId, mode, id) {
  var sh = sheet_(SH.casts), vals = sh.getDataRange().getValues(), row = -1;
  for (var r = 1; r < vals.length; r++) if (vals[r][0] === id) row = r;
  if (row < 0) return send_(chatId, 'Рассылка не найдена.');
  if (vals[row][4]) return send_(chatId, 'Эта рассылка уже отправлена.');
  var text = String(vals[row][2]).replace(/^'/, '');
  sh.getRange(row + 1, 5).setValue('отправляется…');
  var kb = mode === 's' ? kb_([[btn_('✅ Записаться', 'su:' + id)]]) : null;
  var ok = 0, fail = 0, started = Date.now();
  activeSubs_().forEach(function (s) {
    if (Date.now() - started > 300000) { fail++; return; } // запас до лимита Apps Script в 6 минут
    var res = send_(s.chatId, esc_(text), kb);
    if (res && res.ok) ok++; else { fail++; if (res && res.error_code === 403) setSubStatus_(s.chatId, 'заблокировал'); }
    Utilities.sleep(40);
  });
  sh.getRange(row + 1, 4).setValue(mode === 's' ? 'да' : 'нет');
  sh.getRange(row + 1, 5).setValue(ok);
  send_(chatId, '📣 Рассылка отправлена: ' + ok + (fail ? ', не доставлено: ' + fail : '') + '.');
}

function signup_(chatId, from, id) {
  var vals = sheet_(SH.signups).getDataRange().getValues();
  for (var r = 1; r < vals.length; r++) if (String(vals[r][1]) === String(chatId) && vals[r][4] === id) return send_(chatId, 'Вы уже записаны 👍 Консультант свяжется с вами.');
  var cast = '';
  var cv = sheet_(SH.casts).getDataRange().getValues();
  for (var i = 1; i < cv.length; i++) if (cv[i][0] === id) cast = String(cv[i][2]).replace(/^'/, '');
  sheet_(SH.signups).appendRow([new Date(), chatId, from.username ? '@' + from.username : '', cell_(from.first_name || ''), id]);
  notifyAdmin_('📝 Новая запись по рассылке от ' + who_(from) + ':\n«' + esc_(cast.slice(0, 120)) + '»');
  send_(chatId, '✅ Вы записаны! Консультант свяжется с вами и расскажет подробности.');
}

// =====================================================================
// Команды администратора
// =====================================================================

function adminHelp_(chatId) {
  send_(chatId, '<b>Команды для вас</b>\n\n' +
    '/broadcast <i>текст</i>: рассылка всем подписчикам (сначала покажу предпросмотр)\n' +
    '/buy <i>@username товар; дней</i>: добавить покупку для напоминания, например:\n<code>/buy @anna Дэйли; 30</code>\n' +
    '/remind: проверить напоминания прямо сейчас\n' +
    '/stats: статистика\n\n' +
    'Напоминания также можно вносить прямо в лист «Покупки» Google Таблицы.');
}

function adminAddPurchase_(chatId, arg) {
  var m = /^(\S+)\s+(.+?)(?:;\s*(\d+))?$/.exec(arg || '');
  if (!m) return send_(chatId, 'Формат: <code>/buy @username Товар; 30</code>');
  var chat = resolveChat_(m[1]);
  var days = m[3] != null ? Number(m[3]) : DEFAULT_REMIND_DAYS;
  sheet_(SH.buys).appendRow(['b' + Date.now().toString(36), new Date(), cell_(m[1]), cell_(m[2].trim()), days, '', chat || '']);
  send_(chatId, '✅ Покупка добавлена: ' + esc_(m[1]) + ' · ' + esc_(m[2].trim()) + '. Напомню через ' + days + ' дн.' +
    (chat ? '' : '\n⚠️ Этого клиента пока нет среди подписчиков бота. Попросите его нажать /start в боте, иначе напоминание не дойдёт.'));
}

function adminStats_(chatId) {
  var subs = sheet_(SH.subs).getDataRange().getValues().slice(1);
  var leads = sheet_(SH.leads).getDataRange().getValues().slice(1);
  var buys = sheet_(SH.buys).getDataRange().getValues().slice(1);
  var since = new Date(); since.setDate(since.getDate() - 7);
  send_(chatId, '<b>Статистика</b>\n' +
    'Подписчиков активных: ' + subs.filter(function (s) { return s[5] === 'активен'; }).length + ' из ' + subs.length + '\n' +
    'Заявок всего: ' + leads.length + ', за 7 дней: ' + leads.filter(function (l) { return l[0] && new Date(l[0]) >= since; }).length + '\n' +
    'Покупок ждут напоминания: ' + buys.filter(function (b) { return b[1] && !b[5]; }).length);
}

// =====================================================================
// Подписчики
// =====================================================================

function touchSub_(from, source) {
  if (!from || !from.id) return;
  var sh = sheet_(SH.subs), vals = sh.getDataRange().getValues();
  var name = [from.first_name, from.last_name].filter(Boolean).join(' ');
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][0]) === String(from.id)) {
      if (source && vals[r][5] !== 'активен') sh.getRange(r + 1, 6).setValue('активен');
      sh.getRange(r + 1, 7).setValue(new Date());
      if (from.username && vals[r][1] !== '@' + from.username) sh.getRange(r + 1, 2).setValue('@' + from.username);
      return;
    }
  }
  sh.appendRow([from.id, from.username ? '@' + from.username : '', cell_(name), new Date(), cell_(source || 'бот'), 'активен', new Date()]);
}

function setSubStatus_(chatId, status) {
  var sh = sheet_(SH.subs), vals = sh.getDataRange().getValues();
  for (var r = 1; r < vals.length; r++) if (String(vals[r][0]) === String(chatId)) return sh.getRange(r + 1, 6).setValue(status);
}

function activeSubs_() {
  return sheet_(SH.subs).getDataRange().getValues().slice(1)
    .filter(function (v) { return v[0] && v[5] === 'активен'; })
    .map(function (v) { return { chatId: v[0] }; });
}

function resolveChat_(client) {
  client = String(client || '').trim().replace(/^'/, '');
  if (/^-?\d{5,}$/.test(client)) return client;
  var u = client.replace(/^@/, '').toLowerCase();
  if (!u) return '';
  var vals = sheet_(SH.subs).getDataRange().getValues();
  for (var r = 1; r < vals.length; r++) if (String(vals[r][1]).replace(/^@/, '').toLowerCase() === u) return String(vals[r][0]);
  return '';
}

// =====================================================================
// Данные витрины (читаются с сайта и кешируются на час)
// =====================================================================

var DATA_ = null;
function data_() {
  if (DATA_) return DATA_;
  var cache = CacheService.getScriptCache(), s = cache.get('shopdata');
  if (s) return (DATA_ = JSON.parse(s));
  var w = {};
  ['config.js', 'products.js', 'details.js'].forEach(function (f) {
    var res = UrlFetchApp.fetch(site_() + f + '?t=' + Date.now(), { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) new Function('window', res.getContentText())(w);
  });
  var cfg = w.SHOP_CONFIG || {}, rate = Number(cfg.kztToRub) || 0.2, byId = {};
  var P = (w.SHOP_PRODUCTS || []).map(function (p) { p.price = Math.round(p.priceKzt * rate / 10) * 10; byId[p.id] = p; return p; });
  var PR = (w.SHOP_PROGRAMS || []).map(function (p) {
    p.isProgram = true;
    p.sumPrice = p.items.reduce(function (sum, id) { return sum + (byId[id] ? byId[id].price : 0); }, 0);
    p.price = p.fixedKzt ? Math.round(p.fixedKzt * rate / 10) * 10 : p.sumPrice;
    return p;
  });
  DATA_ = { cfg: cfg, P: P, PR: PR, D: w.SHOP_DETAILS || {} };
  var js = JSON.stringify(DATA_);
  if (js.length < 95000) cache.put('shopdata', js, 3600);
  return DATA_;
}

// Сбросить кеш после изменения товаров на сайте (или подождать час).
function refreshData() { CacheService.getScriptCache().remove('shopdata'); DATA_ = null; data_(); }

function byId_(id) {
  var D = data_();
  for (var i = 0; i < D.P.length; i++) if (D.P[i].id === id) return D.P[i];
  for (var j = 0; j < D.PR.length; j++) if (D.PR[j].id === id) return D.PR[j];
  return null;
}

function jpg_(img) { return site_() + 'img/tg/' + String(img).replace(/^img\//, '').replace(/\.webp$/, '.jpg'); }

// =====================================================================
// Вспомогательное
// =====================================================================

function cfg_() {
  var p = PropertiesService.getScriptProperties();
  return {
    token: p.getProperty('TELEGRAM_TOKEN'),
    admin: String(p.getProperty('TELEGRAM_CHAT_ID') || ''),
    secret: p.getProperty('WEBHOOK_SECRET') || ''
  };
}

function site_() {
  var s = PropertiesService.getScriptProperties().getProperty('SITE_URL') || DEFAULT_SITE;
  return /\/$/.test(s) ? s : s + '/';
}

function isAdmin_(chatId) { return String(chatId) === cfg_().admin; }

function tg_(method, payload) {
  var c = cfg_();
  if (!c.token) return { ok: false };
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + c.token + '/' + method, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  try { return JSON.parse(res.getContentText()); } catch (e) { return { ok: false }; }
}

function send_(chatId, text, markup) {
  var p = { chat_id: chatId, text: String(text).slice(0, 4096), parse_mode: 'HTML', disable_web_page_preview: true };
  if (markup) p.reply_markup = markup;
  return tg_('sendMessage', p);
}

function photo_(chatId, url, caption, markup) {
  var p = { chat_id: chatId, photo: url, caption: caption || '', parse_mode: 'HTML' };
  if (markup) p.reply_markup = markup;
  return tg_('sendPhoto', p);
}

function notifyAdmin_(text) { var a = cfg_().admin; if (a) send_(a, text); }

function kb_(rows) { return { inline_keyboard: rows }; }
function btn_(text, data) { return { text: text, callback_data: String(data).slice(0, 64) }; }
function url_(text, url) { return { text: text, url: url }; }

function rub_(n) { return n ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽*' : 'по запросу'; }
function esc_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function who_(from) {
  var name = esc_([from.first_name, from.last_name].filter(Boolean).join(' ') || 'клиент');
  return '<a href="tg://user?id=' + from.id + '">' + name + '</a>' + (from.username ? ' (@' + esc_(from.username) + ')' : '');
}
function fmtDate_(d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }

function seen_(key) {
  var c = CacheService.getScriptCache();
  if (c.get(key)) return true;
  c.put(key, '1', 21600);
  return false;
}

function putState_(key, st, ttl) { CacheService.getScriptCache().put('st' + key, JSON.stringify(st), ttl || 3600); }
function getStateRaw_(key) { var s = CacheService.getScriptCache().get('st' + key); return s ? JSON.parse(s) : null; }
function getState_(chatId) { return getStateRaw_(chatId); }
function clearState_(chatId) { CacheService.getScriptCache().remove('st' + chatId); }

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0 && HEADERS[name]) {
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
  }
  return sh;
}

function clip_(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }

// Защита от формул в таблице: значение, начинающееся с = + - @, пишем как текст.
function cell_(v) { v = String(v == null ? '' : v); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
