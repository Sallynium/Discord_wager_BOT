# 🎯 Discord 賽事預測機器人

一個功能完整的Discord機器人，專為電競社群和體育賽事討論群設計。支援賽事預測競賽、積分排行榜、跟單功能！

## ✨ 主要功能

### 🏆 賽事預測系統
- **賽事登錄**：管理員可登錄比賽資訊（隊伍、時間、積分）
- **預測功能**：用戶可預測比賽結果
- **跟單系統**：一鍵跟隨其他用戶的預測
- **積分排行榜**：自動計算和顯示用戶積分排名
- **統計分析**：查看各場比賽的預測統計

### 📊 管理功能
- **分數調整**：管理員可手動調整用戶積分
- **資料管理**：完整的比賽資料增刪改查
- **權限控制**：管理員專屬指令保護

---

## 🚀 完全新手安裝教學

### 第一步：建立Discord機器人

#### 1.1 進入Discord開發者頁面
1. 打開瀏覽器，前往 https://discord.com/developers/applications
2. 用你的Discord帳號登入
3. 點擊右上角的「New Application」
4. 輸入機器人名稱（例如：賽事預測機器人）
5. 點擊「Create」

#### 1.2 設定機器人
1. 在左側選單點擊「Bot」
2. 點擊「Add Bot」確認建立
3. 在「Token」區域點擊「Copy」複製Token（**重要：請妥善保存，稍後會用到**）
4. 向下滑動，在「Privileged Gateway Intents」區域：
   - ✅ 勾選「MESSAGE CONTENT INTENT」

#### 1.3 邀請機器人到伺服器
1. 在左側選單點擊「OAuth2」→「URL Generator」
2. 在「SCOPES」勾選：
   - ✅ bot
3. 在「BOT PERMISSIONS」勾選：
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Embed Links
4. 複製底部產生的URL，在瀏覽器開啟
5. 選擇你要加入的伺服器，點擊「授權」

### 第二步：使用Replit部署（推薦新手）

#### 2.1 註冊Replit帳號
1. 前往 https://replit.com
2. 點擊「Sign up」註冊帳號
3. 可以用Google、GitHub或email註冊

#### 2.2 建立新專案
1. 登入後點擊「+ Create Repl」
2. 選擇「Node.js」模板
3. 命名你的專案（例如：discord-prediction-bot）
4. 點擊「Create Repl」

#### 2.3 上傳機器人程式碼
1. 刪除預設的 `index.js` 內容
2. 將本專案的 `bot.js` 內容完整複製貼上到 `index.js`
3. 在左側檔案管理中，點擊「Add file」
4. 建立 `package.json` 檔案，內容如下：

```json
{
  "name": "discord-prediction-bot",
  "version": "1.0.0",
  "description": "Discord賽事預測機器人",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.13.0",
    "express": "^4.18.2"
  }
}
```

#### 2.4 設定環境變數
1. 在左側邊欄找到「Secrets」（鎖頭圖示）
2. 點擊「Add new secret」
3. Key輸入：`TOKEN`
4. Value輸入：你剛才複製的Discord機器人Token
5. 點擊「Add secret」

#### 2.5 安裝套件並啟動
1. 在下方Console（終端機）輸入：`npm install`
2. 等待套件安裝完成
3. 點擊上方綠色的「Run」按鈕
4. 如果看到「🤖 機器人上線」和「🌐 網頁伺服器已啟動」訊息，就成功了！

### 第三步：設定UptimeRobot監控（保持24/7運行）

#### 3.1 註冊UptimeRobot
1. 前往 https://uptimerobot.com
2. 點擊「Sign Up Free」註冊免費帳號
3. 驗證email並登入

#### 3.2 取得Replit專案網址
1. 回到Replit，確認機器人正在運行
2. 在右側會出現一個網頁預覽視窗
3. 複製網址列的URL（格式類似：https://你的專案名稱.你的使用者名稱.repl.co）

#### 3.3 建立監控
1. 在UptimeRobot點擊「Add New Monitor」
2. 設定如下：
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Discord預測機器人
   - **URL**: 貼上剛才複製的Replit網址
   - **Monitoring Interval**: 5 minutes（免費版最短間隔）
3. 點擊「Create Monitor」

#### 3.4 完成設定
- UptimeRobot會每5分鐘ping一次你的Replit專案
- 這樣可以防止Replit因為閒置而自動休眠
- 你的機器人就能24/7不間斷運行了！

---

## 📖 使用說明

### 🎯 賽事預測功能

#### 管理員指令：
```
!register <比賽ID> <隊伍A> <隊伍B> <日期> <時間> [分數] [--force]
```
**範例**：`!register MSI_FINAL T1 BLG 2024-12-25 20:00 3`
- 登錄一場比賽，預測正確可得3分
- 時間格式：YYYY-MM-DD HH:MM（台北時間）
- 使用 `--force` 可覆蓋已存在的比賽

```
!result <比賽ID> <勝隊名稱>
```
**範例**：`!result MSI_FINAL T1`
- 公佈比賽結果，自動計算積分

```
!delete <比賽ID>
```
**範例**：`!delete MSI_FINAL`
- 刪除比賽的所有相關資料

#### 用戶指令：
```
!predict <比賽ID> <隊伍名稱>
```
**範例**：`!predict MSI_FINAL T1`
- 預測比賽結果

```
!follow @用戶名稱
```
**範例**：`!follow @小明`
- 跟隨其他用戶的所有預測

```
!myscore
```
- 查看自己目前的總積分

```
!leaderboard
```
- 查看積分排行榜

```
!matches
```
- 查看所有已登錄的比賽

```
!history <比賽ID>
```
**範例**：`!history MSI_FINAL`
- 查看特定比賽的預測統計

### 🔧 監控系統設定

#### UptimeRobot + Watchdog 雙重保障

**方案1：UptimeRobot（推薦）**
- 透過網路ping保持專案運行
- 設定簡單，適合大多數情況

**方案2：Watchdog.js（進階）**
- 本地監控腳本，自動化瀏覽器操作
- 適合需要更精確控制的情況
- 可以處理Replit介面更新導致的問題

**同時使用（最佳方案）**
```bash
# 啟動watchdog監控
node watchdog.js &

# 同時設定UptimeRobot監控你的Replit網址
```

### 📊 其他功能

```
!help
```
- 顯示完整的指令說明

```
!ping
```
- 測試機器人是否正常運作

---

## 💡 使用範例

### 建立一場比賽預測
```
管理員：!register WORLDS_FINAL T1 WBG 2024-11-02 21:00 5
機器人：✅ 登錄比賽 WORLDS_FINAL：T1 vs WBG，時間：2024/11/2 下午9:00:00（預測正確得 5 分）

用戶A：!predict WORLDS_FINAL T1
機器人：✅ 你預測 WORLDS_FINAL 比賽的贏家為：T1

用戶B：!predict WORLDS_FINAL WBG
機器人：✅ 你預測 WORLDS_FINAL 比賽的贏家為：WBG

用戶C：!follow @用戶A
機器人：📋 成功跟單 @用戶A 的預測如下：
✅ WORLDS_FINAL：T1

管理員：!result WORLDS_FINAL T1
機器人：✅ 比賽 WORLDS_FINAL 的勝隊是 T1，積分已更新！
```

### 🤖 Watchdog 監控系統

#### 功能說明：
`watchdog.js` 是一個自動化監控腳本，專門用來確保Replit上的Discord機器人持續運行。

#### 運作原理：
- 每3分鐘自動檢查一次指定的Replit專案
- 如果發現專案停止運行，會自動點擊「Run」按鈕重新啟動
- 使用Chrome瀏覽器自動化，保持登入狀態

#### 使用前準備：
1. **安裝Node.js**（v14以上版本）
2. **安裝Puppeteer**：
   ```bash
   cd wagerBOT
   npm install puppeteer
   ```

#### 設定步驟：

**步驟1：修改目標應用程式名稱**
```javascript
// 在watchdog.js第3行修改為你的Replit專案名稱
const APP_NAME = "你的機器人專案名稱"; // 例如："Predict_DC_BOT"
```

**步驟2：設定Chrome用戶資料路徑**
```javascript
// 在watchdog.js第13行修改路徑（Windows系統）
`--user-data-dir=C:/chrome-profile`

// Linux/Mac系統改為：
`--user-data-dir=/tmp/chrome-profile`
```

**步驟3：首次登入設定**
1. 第一次執行watchdog.js時會開啟Chrome瀏覽器
2. 手動登入你的Replit帳號
3. 確保能看到你的專案列表
4. 關閉瀏覽器，watchdog會記住登入狀態

#### 啟動監控：
```bash
# 在wagerBOT目錄下執行
node watchdog.js
```

#### 監控流程：
```
➡️ 前往 Replit 首頁...
📂 點擊 App 清單
🚀 找到並點擊 App：「你的專案名稱」
🟠 偵測到程式尚未執行，點擊啟動...
🟢 程式正在執行中，無需操作
🕒 等待 3 分鐘後再次檢查...
```

#### 重要說明：
- **持續運行**：watchdog.js需要保持運行才能監控
- **本地執行**：建議在本地電腦運行，不要在Replit上執行
- **備援方案**：配合UptimeRobot使用，雙重保障
- **安全性**：只會點擊Run按鈕，不會修改任何程式碼

#### 故障排除：
- 如果找不到專案：檢查`APP_NAME`是否設定正確
- 如果無法登入：刪除chrome-profile資料夾重新登入
- 如果按鈕點擊失效：Replit可能更新了介面，需要更新選擇器

---

## ❓ 常見問題解答

### Q: Replit專案突然停止運行？
A: 這是正常現象，免費版Replit會在閒置時休眠。使用UptimeRobot監控可以解決這個問題。

### Q: 機器人沒有回應指令？
A: 檢查：
1. 機器人是否在線（顯示綠色狀態）
2. 指令是否以`!`開頭
3. 機器人是否有發送訊息的權限

### Q: 如何備份資料？
A: 所有資料儲存在`predictions_data.json`檔案中，定期下載備份即可。

### Q: 想要修改指令前綴？
A: 在程式碼第7行修改`PREFIX`變數：
```javascript
const PREFIX = "?"; // 改成你想要的前綴
```

### Q: 如何增加新的功能？
A: 在`messageCreate`事件中的`switch`語句添加新的`case`分支即可。

### Q: UptimeRobot顯示網站離線？
A: 確認Replit專案正在運行，並且Express伺服器有正常啟動（port 3000）。

### Q: Watchdog監控失效怎麼辦？
A: 檢查以下項目：
1. 確認Chrome瀏覽器已安裝且可正常啟動
2. 檢查Replit帳號是否正常登入
3. 確認APP_NAME設定與實際專案名稱完全一致
4. 如果Replit更新介面，可能需要更新CSS選擇器

### Q: 可以同時使用UptimeRobot和Watchdog嗎？
A: 可以！建議同時使用以獲得最佳保障：
- UptimeRobot處理基本的ping監控
- Watchdog處理更複雜的瀏覽器操作
- 兩者互相補強，確保99%的運行時間

---

## 🔧 進階設定

### 自訂機器人狀態
在`client.once('ready')`事件中添加：
```javascript
client.user.setActivity('正在預測比賽', { type: 'WATCHING' });
```

### 修改積分計算規則
在`result`指令的處理中，你可以修改積分計算邏輯。

---

## 🛡️ 安全注意事項

1. **Token保護**：絕對不要在程式碼中直接寫入Token
2. **權限管理**：管理員指令都有權限檢查，確保安全
3. **資料備份**：定期備份`predictions_data.json`檔案
4. **監控日誌**：留意Replit的日誌輸出，及時發現問題

---

## 📈 功能擴展建議

- 添加更多體育項目支援
- 整合即時比賽API
- 添加圖表統計功能
- 支援更複雜的預測類型（比分預測等）
- 添加用戶等級系統
- 整合虛擬貨幣獎勵

---

## 📞 技術支援

如果在使用過程中遇到問題：

1. **檢查Replit日誌**：在Console中查看錯誤訊息
2. **確認Token**：檢查Secrets中的TOKEN是否正確
3. **重啟專案**：點擊「Stop」再點擊「Run」
4. **檢查UptimeRobot**：確認監控正常運作

---

## 🎉 開始使用

現在你已經擁有一個功能完整的Discord賽事預測機器人了！快邀請你的朋友們一起來預測比賽，看誰是真正的預言帝吧！

**記住**：
- ✅ 機器人需要持續運行才能工作
- ✅ UptimeRobot監控能確保24/7運行
- ✅ 定期備份資料以防丟失
- ✅ 享受預測的樂趣！

---

**最後更新：2024年8月**  
**版本：1.0.0**  
**狀態：已完成開發，可直接使用** 🟢