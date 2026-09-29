// Собирает shop/catalog.pdf из shop/catalog.html.
// Запуск из корня репозитория (нужен установленный playwright и Chromium):
//   node shop/tools/make-catalog-pdf.js
// Пересобирайте после изменения цен, товаров или программ.
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const shop = path.resolve(__dirname, "..");
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.goto("file://" + path.join(shop, "catalog.html"), { waitUntil: "load" });
  await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.pdf({
    path: path.join(shop, "catalog.pdf"),
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "16mm", left: "12mm", right: "12mm" },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#888">Каталог продукции · стр. <span class="pageNumber"></span> из <span class="totalPages"></span></div>'
  });
  await browser.close();
  console.log("Готово: shop/catalog.pdf");
})();
