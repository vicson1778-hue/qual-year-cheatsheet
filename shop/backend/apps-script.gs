/**
 * Приёмник заявок с сайта-витрины.
 * Каждая заявка записывается в лист «Заявки» и приходит сообщением в Telegram.
 *
 * Установка: см. shop/README.md, шаг 3.
 * Токен бота и chat id хранятся в «Свойствах скрипта», а не в коде сайта:
 *   TELEGRAM_TOKEN   токен от @BotFather
 *   TELEGRAM_CHAT_ID ваш id (или id группы, куда слать заявки)
 */

var SHEET_NAME = 'Заявки';
var HEADERS = ['Дата', 'Имя', 'Контакт', 'Когда связаться', 'Подборка', 'Сумма, ₽', 'Подбор (квиз)', 'Комментарий', 'Источник', 'Статус'];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json_({ ok: true }); // скрытое поле: заполняют только боты

    var name = clip_(d.name, 80);
    var contact = clip_(d.contact, 80);
    if (!name || !contact) return json_({ ok: false, error: 'empty' });

    var items = (d.items || []).slice(0, 50).map(function (i) {
      return clip_(i.name, 120) + ' x' + (parseInt(i.qty, 10) || 1);
    }).join('; ');

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    sh.appendRow([
      new Date(), cell_(name), cell_(contact), cell_(clip_(d.time, 40)), cell_(items),
      Number(d.total) || 0, cell_(clip_(d.quiz, 400)), cell_(clip_(d.comment, 600)),
      cell_(clip_(d.source, 120)), 'новая'
    ]);

    sendTelegram_(clip_(d.text, 3500) || ('Новая заявка: ' + name + ', ' + contact));
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false });
  }
}

// Запустите вручную из редактора, чтобы проверить, что бот пишет вам.
function testTelegram() {
  sendTelegram_('Проверка: заявки с сайта будут приходить сюда.');
}

function sendTelegram_(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return;
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true }),
    muteHttpExceptions: true
  });
}

function clip_(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }

// Защита от формул в таблице: значение, начинающееся с = + - @, пишем как текст.
function cell_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
