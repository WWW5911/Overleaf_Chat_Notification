# 訊息監控器 / Message Monitor

一個功能強大的 Chrome 擴充功能，用於監控網頁上的新訊息並發送即時通知。

A powerful Chrome extension for monitoring new messages on web pages and sending real-time notifications.

## 🌟 功能特色 / Features

### 📱 智能訊息監控 / Smart Message Monitoring
- **即時偵測**：自動偵測網頁上的新訊息和內容更新
- **Real-time Detection**: Automatically detect new messages and content updates on web pages
- **智能去重**：避免重複通知，確保每個訊息只通知一次
- **Smart Deduplication**: Prevent duplicate notifications, ensuring each message is notified only once

### 🔔 多種通知方式 / Multiple Notification Methods
- **瀏覽器通知**：即時彈出通知，包含網站圖示
- **Browser Notifications**: Instant popup notifications with website icons
- **Email 通知**：透過 EmailJS 發送詳細的 Email 通知
- **Email Notifications**: Send detailed email notifications via EmailJS

### 🌐 多語言支援 / Multi-language Support
- **中文 / 繁體中文**：完整的繁體中文介面
- **Traditional Chinese**: Complete Traditional Chinese interface
- **English**：Full English interface support
- **English**: Full English interface support
- **可擴充**：未來可輕鬆添加更多語言
- **Extensible**: Easy to add more languages in the future

### 🎯 精確網址控制 / Precise URL Control
- **Overleaf 專用**：預設啟用 Overleaf 監控
- **Overleaf Specific**: Overleaf monitoring enabled by default
- **靈活設定**：支援域名或完整網址監控
- **Flexible Settings**: Support domain or full URL monitoring
- **批量管理**：輕鬆管理多個監控網址
- **Batch Management**: Easy management of multiple monitoring URLs

### ⚙️ 個人化設定 / Personalized Settings
- **自己訊息控制**：選擇是否通知自己發送的訊息
- **Own Message Control**: Choose whether to notify your own messages
- **Email 整合**：完整的 EmailJS 設定支援
- **Email Integration**: Complete EmailJS configuration support

## 🚀 安裝方式 / Installation

### 開發者模式安裝 / Developer Mode Installation

1. **下載擴充功能**
   ```bash
   git clone https://github.com/WWW5911/Overleaf_Chat_Notification.git
   cd Overleaf_Chat_Notification
   ```

2. **開啟 Chrome 擴充功能頁面**
   - 在 Chrome 網址列輸入：`chrome://extensions/`
   - Enter in Chrome address bar: `chrome://extensions/`

3. **啟用開發者模式**
   - 開啟右上角的「開發人員模式」開關
   - Enable "Developer mode" toggle in the top right

4. **載入擴充功能**
   - 點擊「載入未封裝項目」
   - Click "Load unpacked"
   - 選擇擴充功能資料夾
   - Select the extension folder

## 📖 使用說明 / Usage Guide

### 1. 基本設定 / Basic Setup

#### 語言設定 / Language Settings
- 點擊擴充功能圖示開啟設定頁面
- Click the extension icon to open settings
- 在「語言設定」區域選擇您偏好的語言
- Select your preferred language in "Language Settings"

#### 通知設定 / Notification Settings
- ✅ **啟用通知** / Enable Notifications
- ✅ **啟用Email通知** / Enable Email Notifications  
- ✅ **通知自己發送的訊息** / Notify Own Messages
- 📧 **Email地址** / Email Address

### 2. 網址監控設定 / URL Monitoring Settings

#### Overleaf 快速啟用 / Overleaf Quick Enable
- 預設已啟用 Overleaf (www.overleaf.com) 監控
- Overleaf (www.overleaf.com) monitoring is enabled by default
- 可隨時在設定中開啟或關閉
- Can be toggled on/off in settings anytime

#### 監控範圍選擇 / Monitoring Scope Selection
- **整個域名**：監控整個網站 (例：example.com)
- **Entire Domain**: Monitor entire website (e.g., example.com)
- **完整網址**：只監控特定頁面 (例：example.com/chat)
- **Full URL**: Monitor specific pages only (e.g., example.com/chat)

#### 網址管理 / URL Management
- 新增目前網站到監控清單
- Add current site to monitoring list
- 查看已啟用的監控網址
- View enabled monitoring URLs
- 個別移除或批量清除
- Remove individually or clear all

### 3. EmailJS 設定 / EmailJS Configuration

#### 註冊 EmailJS 服務 / Register EmailJS Service
1. 前往 [EmailJS](https://www.emailjs.com/) 註冊帳號
   Visit [EmailJS](https://www.emailjs.com/) to register
2. 建立 Email 服務和模板
   Create email service and template
3. 取得必要的設定資訊
   Obtain required configuration info

#### 設定參數 / Configuration Parameters
- **Service ID**：EmailJS 服務 ID
- **Service ID**: EmailJS service identifier
- **Template ID**：Email 模板 ID  
- **Template ID**: Email template identifier
- **Public Key**：EmailJS 公開金鑰
- **Public Key**: EmailJS public key

## 🔧 技術架構 / Technical Architecture

### 檔案結構 / File Structure
```
Overleaf_Chat_Notification/
├── manifest.json              # 擴充功能配置 / Extension manifest
├── background.js              # 背景腳本 / Background script
├── content.js                 # 內容腳本 / Content script
├── popup.html                 # 設定介面 / Settings interface
├── popup.js                   # 設定邏輯 / Settings logic
├── languages/                 # 語言包 / Language packs
│   ├── language-manager.js    # 語言管理器 / Language manager
│   ├── zh-TW.js              # 繁體中文 / Traditional Chinese
│   └── en-US.js              # 英文 / English
└── README.md                  # 說明文件 / Documentation
```

### 核心技術 / Core Technologies
- **Manifest V3**：最新的 Chrome 擴充功能標準
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**：高效的背景處理
- **Service Worker**: Efficient background processing
- **MutationObserver**：即時 DOM 變化監控
- **MutationObserver**: Real-time DOM change monitoring
- **Chrome Storage API**：設定同步儲存
- **Chrome Storage API**: Synchronized settings storage

### 監控機制 / Monitoring Mechanism
1. **頁面載入檢測**：等待頁面完全載入後開始監控
   **Page Load Detection**: Start monitoring after page fully loads
2. **雙重監控**：MutationObserver + 定時檢查
   **Dual Monitoring**: MutationObserver + Periodic checks
3. **智能去重**：避免重複通知相同訊息
   **Smart Deduplication**: Prevent duplicate notifications
4. **通知合併**：合併相關通知，減少干擾
   **Notification Merging**: Merge related notifications

## 🎨 自訂與擴充 / Customization & Extension

### 新增語言支援 / Adding Language Support

1. **建立語言檔案** / Create Language File
   ```javascript
   // languages/ja-JP.js
   const ja_JP = {
     title: "メッセージモニター設定",
     // ... 其他翻譯 / other translations
   };
   ```

2. **更新語言管理器** / Update Language Manager
   ```javascript
   getAvailableLanguages() {
     return [
       { code: 'zh-TW', name: '中文' },
       { code: 'en-US', name: 'English' },
       { code: 'ja-JP', name: '日本語' }  // 新增 / Add new
     ];
   }
   ```

3. **更新設定介面** / Update Settings Interface
   ```html
   <option value="ja-JP">日本語</option>
   ```

### 自訂訊息結構 / Custom Message Structure

如果您的網站使用不同的訊息結構，可以修改 `content.js` 中的選擇器：
If your website uses different message structure, modify selectors in `content.js`:

```javascript
// 修改這些選擇器以符合您的網站結構
// Modify these selectors to match your website structure
const messages = document.querySelectorAll('.your-message-class');
const nameElement = messageElement.querySelector('.your-name-class');
const contentElement = messageElement.querySelector('.your-content-class');
```

## 🐛 疑難排解 / Troubleshooting

### 常見問題 / Common Issues

#### 1. 擴充功能無法載入 / Extension Won't Load
- **檢查 manifest.json 語法**
- **Check manifest.json syntax**
- **確認所有檔案都存在**
- **Ensure all files exist**
- **查看 Chrome 開發者工具的錯誤訊息**
- **Check Chrome DevTools for error messages**

#### 2. 無法偵測到訊息 / Messages Not Detected
- **檢查網站是否在監控清單中**
- **Check if website is in monitoring list**
- **確認訊息結構是否符合預期**
- **Verify message structure matches expectations**
- **查看控制台是否有錯誤**
- **Check console for errors**

#### 3. Email 通知無法發送 / Email Notifications Not Working
- **驗證 EmailJS 設定是否正確**
- **Verify EmailJS configuration is correct**
- **檢查 Email 地址格式**
- **Check email address format**
- **確認 EmailJS 服務狀態**
- **Confirm EmailJS service status**

#### 4. 語言切換無效 / Language Switch Not Working
- **重新整理設定頁面**
- **Refresh settings page**
- **檢查語言檔案是否載入**
- **Check if language files are loaded**
- **清除瀏覽器快取**
- **Clear browser cache**

### 除錯模式 / Debug Mode

開啟 Chrome 開發者工具查看詳細日誌：
Open Chrome DevTools to view detailed logs:

```javascript
// 在控制台中啟用詳細日誌
// Enable verbose logging in console
localStorage.setItem('messageMonitorDebug', 'true');
```

## 📝 更新日誌 / Changelog

### v1.0.0
- 🎉 初始版本發布
- 🎉 Initial release
- 📱 基本訊息監控功能
- 📱 Basic message monitoring functionality

## 🤝 貢獻 / Contributing

歡迎提交 Issue 和 Pull Request！
Issues and Pull Requests are welcome!

### 開發環境設定 / Development Setup
1. Fork 此專案 / Fork this repository
2. 建立功能分支 / Create feature branch
3. 提交變更 / Commit changes
4. 推送到分支 / Push to branch
5. 建立 Pull Request / Create Pull Request

## 📄 授權 / License

MIT License - 詳見 LICENSE 檔案
MIT License - See LICENSE file for details


**享受無干擾的訊息監控體驗！**
**Enjoy distraction-free message monitoring!**