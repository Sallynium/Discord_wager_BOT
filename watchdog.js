const puppeteer = require("puppeteer");

const APP_NAME = "Predict_DC_BOT";
const LOGIN_URL = "https://replit.com";
const CHECK_INTERVAL = 3 * 60 * 1000; // 3分鐘

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    protocolTimeout: 120000,
    args: [
      `--user-data-dir=C:/chrome-profile`, // 保留登入狀態
    ],
  });

  const page = await browser.newPage();

  while (true) {
    try {
      console.log("➡️ 前往 Replit 首頁...");
      await page.goto(LOGIN_URL, { waitUntil: "networkidle2", timeout: 0 });

      // 點擊左側 sidebar 的「Apps」選單
      console.log("📂 點擊 App 清單");
      await page.waitForSelector(`a[href='/repls']`, { timeout: 10000 });
      await page.click(`a[href='/repls']`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等載入完成

      // 找到 App 名稱對應的卡片並點擊
      const spans = await page.$$("span");
      let foundApp = false;

      for (const span of spans) {
        const text = await span.evaluate(el => el.textContent.trim());
        if (text === APP_NAME) {
          const cardDiv = await span.evaluateHandle(el =>
            el.closest("div[class*='Surface_surfaceDefault']")
          );
          if (cardDiv) {
            await cardDiv.click();
            foundApp = true;
            console.log(`🚀 找到並點擊 App：「${text}」`);
            break;
          }
        }
      }

      if (!foundApp) {
        console.error("❌ 找不到 App 名稱");
        throw new Error("找不到 App 名稱");
      }

      // 等待頁面載入
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 檢查按鈕文字
      const runButton = await page.$("button.css-ns4t2");
      const stopButton = await page.$("button.css-1t4xyzq");

      if (runButton) {
        console.log("🟠 偵測到程式尚未執行，點擊啟動...");
        await runButton.click();
      } else if (stopButton) {
        console.log("🟢 程式正在執行中，無需操作");
      } else {
        console.log("❓ 無法判斷按鈕狀態：找不到 Run 或 Stop 按鈕");
      }


    } catch (err) {
      console.error("❌ 發生錯誤：", err.message);
    }

    console.log(`🕒 等待 3 分鐘後再次檢查...\n`);
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
  }

})();
