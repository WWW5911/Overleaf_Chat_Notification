// 語言管理器
class LanguageManager {
  constructor() {
    this.currentLanguage = 'zh-TW'; // 預設語言
    this.languages = {};
    this.loadedLanguages = new Set();
  }

  // 使用 fetch 載入語言包（Service Worker 備用方法）
  async loadLanguageWithFetch(langCode) {
    try {
      const scriptUrl = chrome.runtime.getURL(`languages/${langCode}.js`);
      const response = await fetch(scriptUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch language pack: ${response.status}`);
      }
      
      const scriptText = await response.text();
      
      // 在 Service Worker 中執行腳本
      eval(scriptText);
      
      // 檢查語言包是否載入成功
      const langKey = langCode.replace('-', '_');
      if (typeof self !== 'undefined' && self[langKey]) {
        this.languages[langCode] = self[langKey];
        this.loadedLanguages.add(langCode);
        return this.languages[langCode];
      } else {
        throw new Error(`Language pack ${langCode} not found after fetch`);
      }
    } catch (error) {
      console.error(`Failed to load language with fetch: ${langCode}`, error);
      throw error;
    }
  }

  // 載入語言包
  async loadLanguage(langCode) {
    if (this.loadedLanguages.has(langCode)) {
      return this.languages[langCode];
    }

    try {
      // 檢查是否在 Service Worker 環境中
      const isServiceWorker = typeof importScripts !== 'undefined';
      
      if (isServiceWorker) {
        // Service Worker 環境：使用 importScripts 與絕對路徑
        try {
          // 獲取擴充功能的根 URL
          const extensionUrl = chrome.runtime.getURL('');
          const scriptUrl = `${extensionUrl}languages/${langCode}.js`;
          importScripts(scriptUrl);
          
          // 在 Service Worker 中，語言包會被添加到全域作用域
          const langKey = langCode.replace('-', '_');
          if (typeof self !== 'undefined' && self[langKey]) {
            this.languages[langCode] = self[langKey];
            this.loadedLanguages.add(langCode);
            return this.languages[langCode];
          } else {
            throw new Error(`Language pack ${langCode} not found in service worker`);
          }
        } catch (importError) {
          // 如果 importScripts 失敗，嘗試使用 fetch
          console.warn('importScripts failed, trying fetch method:', importError);
          return await this.loadLanguageWithFetch(langCode);
        }
      } else {
        // 瀏覽器環境：使用動態 script 載入
        const script = document.createElement('script');
        script.src = `languages/${langCode}.js`;
        
        return new Promise((resolve, reject) => {
          script.onload = () => {
            // 語言包載入後，從 window 物件獲取
            const langKey = langCode.replace('-', '_');
            if (window[langKey]) {
              this.languages[langCode] = window[langKey];
              this.loadedLanguages.add(langCode);
              resolve(this.languages[langCode]);
            } else {
              reject(new Error(`Language pack ${langCode} not found`));
            }
          };
          
          script.onerror = () => {
            reject(new Error(`Failed to load language pack ${langCode}`));
          };
          
          document.head.appendChild(script);
        });
      }
    } catch (error) {
      console.error(`Error loading language ${langCode}:`, error);
      throw error;
    }
  }

  // 設定當前語言
  async setLanguage(langCode) {
    try {
      await this.loadLanguage(langCode);
      this.currentLanguage = langCode;
      
      // 儲存語言設定
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ currentLanguage: langCode });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to set language:', error);
      return false;
    }
  }

  // 獲取當前語言設定
  async getCurrentLanguage() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(['currentLanguage']);
        if (result.currentLanguage) {
          this.currentLanguage = result.currentLanguage;
        }
      }
    } catch (error) {
      console.error('Failed to get current language:', error);
    }
    
    return this.currentLanguage;
  }

  // 獲取翻譯文字
  getText(key, defaultText = '') {
    const currentLang = this.languages[this.currentLanguage];
    if (currentLang && currentLang[key]) {
      return currentLang[key];
    }
    
    // 如果找不到翻譯，返回預設文字或 key
    return defaultText || key;
  }

  // 翻譯頁面元素
  translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translatedText = this.getText(key);
      
      if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
        element.placeholder = translatedText;
      } else {
        element.textContent = translatedText;
      }
    });
  }

  // 獲取可用語言清單
  getAvailableLanguages() {
    return [
      { code: 'zh-TW', name: '中文' },
      { code: 'en-US', name: 'English' }
    ];
  }
}

// 創建全域語言管理器實例
const languageManager = new LanguageManager();

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageManager;
} else if (typeof self !== 'undefined') {
  // Service Worker 環境
  self.LanguageManager = LanguageManager;
  self.languageManager = languageManager;
} else if (typeof window !== 'undefined') {
  // 瀏覽器環境
  window.LanguageManager = LanguageManager;
  window.languageManager = languageManager;
}