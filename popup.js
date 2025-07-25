// 彈出視窗的JavaScript
document.addEventListener('DOMContentLoaded', async function () {
    // 初始化語言系統
    await initializeLanguage();

    // 載入已儲存的設定
    await loadSettings();

    // 載入目前網站資訊
    await loadCurrentSiteInfo();

    // 載入已啟用的網址清單
    await loadEnabledSites();

    // 載入 Overleaf 設定
    await loadOverleafSetting();

    // 綁定事件
    document.getElementById('saveNotificationSettings').addEventListener('click', saveNotificationSettings);
    document.getElementById('saveEmailSettings').addEventListener('click', saveEmailSettings);
    document.getElementById('clearAllSites').addEventListener('click', clearAllSites);
    document.getElementById('enableCurrentSite').addEventListener('change', handleCurrentSiteToggle);
    document.getElementById('enableOverleaf').addEventListener('change', handleOverleafToggle);
    document.getElementById('urlTypeDomain').addEventListener('change', updateWillSaveAs);
    document.getElementById('urlTypeFullUrl').addEventListener('change', updateWillSaveAs);
    document.getElementById('languageSelect').addEventListener('change', handleLanguageChange);
});

async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['notificationSettings', 'emailSettings']);

        // 載入通知設定
        if (result.notificationSettings) {
            const settings = result.notificationSettings;
            document.getElementById('enableNotifications').checked = settings.enabled || false;
            document.getElementById('enableEmail').checked = settings.emailEnabled || false;
            document.getElementById('notifyOwnMessages').checked = settings.notifyOwnMessages !== false; // 預設為true
            document.getElementById('emailAddress').value = settings.emailAddress || '';
        }

        // 載入email設定
        if (result.emailSettings) {
            const emailSettings = result.emailSettings;
            document.getElementById('serviceId').value = emailSettings.serviceId || '';
            document.getElementById('templateId').value = emailSettings.templateId || '';
            document.getElementById('publicKey').value = emailSettings.publicKey || '';
        }
    } catch (error) {
        console.error('載入設定失敗:', error);
    }
}

async function saveNotificationSettings() {
    try {
        const notificationSettings = {
            enabled: document.getElementById('enableNotifications').checked,
            emailEnabled: document.getElementById('enableEmail').checked,
            notifyOwnMessages: document.getElementById('notifyOwnMessages').checked,
            emailAddress: document.getElementById('emailAddress').value
        };

        // 驗證Email地址（如果啟用Email通知）
        if (notificationSettings.emailEnabled && !notificationSettings.emailAddress) {
            showNotificationStatus('請輸入Email地址', 'error');
            return;
        }

        // 如果啟用Email通知，檢查EmailJS設定是否完整
        if (notificationSettings.emailEnabled) {
            const emailResult = await chrome.storage.sync.get(['emailSettings']);
            const emailSettings = emailResult.emailSettings;

            if (!emailSettings || !emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
                showNotificationStatus('請先完整設定EmailJS設定', 'error');
                return;
            }
        }

        // 儲存通知設定
        await chrome.storage.sync.set({
            notificationSettings: notificationSettings
        });

        showNotificationStatus('通知設定已儲存', 'success');

    } catch (error) {
        console.error('儲存通知設定失敗:', error);
        showNotificationStatus('儲存通知設定失敗: ' + error.message, 'error');
    }
}

async function saveEmailSettings() {
    try {
        const emailSettings = {
            serviceId: document.getElementById('serviceId').value.trim(),
            templateId: document.getElementById('templateId').value.trim(),
            publicKey: document.getElementById('publicKey').value.trim()
        };

        // 驗證必要欄位（如果有任一欄位填寫，則全部都必須填寫）
        const hasAnyField = emailSettings.serviceId || emailSettings.templateId || emailSettings.publicKey;
        const hasAllFields = emailSettings.serviceId && emailSettings.templateId && emailSettings.publicKey;

        if (hasAnyField && !hasAllFields) {
            showEmailStatus('請完整填寫所有EmailJS設定欄位', 'error');
            return;
        }

        // 儲存EmailJS設定
        await chrome.storage.sync.set({
            emailSettings: emailSettings
        });

        if (hasAllFields) {
            showEmailStatus('EmailJS設定已儲存', 'success');
        } else {
            showEmailStatus('EmailJS設定已清除', 'success');
        }

    } catch (error) {
        console.error('儲存EmailJS設定失敗:', error);
        showEmailStatus('儲存EmailJS設定失敗: ' + error.message, 'error');
    }
}

async function loadCurrentSiteInfo() {
    try {
        // 獲取目前活躍的標籤頁
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const url = new URL(tab.url);
            const domain = url.hostname;
            const fullUrl = url.hostname + url.pathname;

            document.getElementById('currentSiteDomain').textContent = domain;
            document.getElementById('currentSiteFullUrl').textContent = fullUrl;

            // 載入 URL 類型設定
            const result = await chrome.storage.sync.get(['enabledSites', 'urlType']);
            const enabledSites = result.enabledSites || [];
            const urlType = result.urlType || 'domain';

            // 設定 radio button
            document.getElementById('urlTypeDomain').checked = urlType === 'domain';
            document.getElementById('urlTypeFullUrl').checked = urlType === 'fullUrl';

            // 更新顯示將儲存的內容
            updateWillSaveAs();

            // 檢查目前網站是否已啟用監控
            const targetUrl = urlType === 'domain' ? domain : fullUrl;
            document.getElementById('enableCurrentSite').checked = enabledSites.includes(targetUrl);
        }
    } catch (error) {
        console.error('載入目前網站資訊失敗:', error);
        document.getElementById('currentSiteDomain').textContent = '無法獲取';
        document.getElementById('currentSiteFullUrl').textContent = '無法獲取';
        document.getElementById('willSaveAs').textContent = '無法獲取';
    }
}

async function loadEnabledSites() {
    try {
        const result = await chrome.storage.sync.get(['enabledSites']);
        const enabledSites = result.enabledSites || [];

        const listContainer = document.getElementById('enabledSitesList');

        if (enabledSites.length === 0) {
            const noUrlsText = languageManager.getText('no_enabled_urls', '尚未啟用任何網址監控');
            listContainer.innerHTML = `<div style="color: #999; text-align: center; padding: 20px;">${noUrlsText}</div>`;
            return;
        }

        listContainer.innerHTML = '';
        enabledSites.forEach(site => {
            const siteItem = document.createElement('div');
            siteItem.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;';

            const removeText = languageManager.getText('remove', '移除');
            siteItem.innerHTML = `
        <span style="flex: 1; font-size: 12px;">${site}</span>
        <button onclick="removeSite('${site}')" style="background-color: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 2px; font-size: 10px; cursor: pointer;">
          ${removeText}
        </button>
      `;

            listContainer.appendChild(siteItem);
        });
    } catch (error) {
        console.error('載入已啟用網址清單失敗:', error);
    }
}

function updateWillSaveAs() {
    try {
        const urlType = document.querySelector('input[name="urlType"]:checked').value;
        const domain = document.getElementById('currentSiteDomain').textContent;
        const fullUrl = document.getElementById('currentSiteFullUrl').textContent;

        if (domain === '載入中...' || domain === '無法獲取') {
            document.getElementById('willSaveAs').textContent = '載入中...';
            return;
        }

        const willSave = urlType === 'domain' ? domain : fullUrl;
        document.getElementById('willSaveAs').textContent = willSave;

        // 同時更新勾選狀態
        updateCurrentSiteCheckbox();
    } catch (error) {
        console.error('更新將儲存內容失敗:', error);
    }
}

async function updateCurrentSiteCheckbox() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const url = new URL(tab.url);
        const domain = url.hostname;
        const fullUrl = url.hostname + url.pathname;
        const urlType = document.querySelector('input[name="urlType"]:checked').value;
        const targetUrl = urlType === 'domain' ? domain : fullUrl;

        const result = await chrome.storage.sync.get(['enabledSites']);
        const enabledSites = result.enabledSites || [];

        document.getElementById('enableCurrentSite').checked = enabledSites.includes(targetUrl);
    } catch (error) {
        console.error('更新勾選狀態失敗:', error);
    }
}

async function handleCurrentSiteToggle() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const url = new URL(tab.url);
        const domain = url.hostname;
        const fullUrl = url.hostname + url.pathname;
        const urlType = document.querySelector('input[name="urlType"]:checked').value;
        const targetUrl = urlType === 'domain' ? domain : fullUrl;
        const isEnabled = document.getElementById('enableCurrentSite').checked;

        const result = await chrome.storage.sync.get(['enabledSites']);
        let enabledSites = result.enabledSites || [];

        if (isEnabled) {
            // 添加到啟用清單
            if (!enabledSites.includes(targetUrl)) {
                enabledSites.push(targetUrl);
                showUrlStatus(`已啟用 ${targetUrl} 的監控`, 'success');
            }
        } else {
            // 從啟用清單移除
            enabledSites = enabledSites.filter(site => site !== targetUrl);
            showUrlStatus(`已停用 ${targetUrl} 的監控`, 'success');
        }

        // 同時儲存 URL 類型設定
        await chrome.storage.sync.set({
            enabledSites: enabledSites,
            urlType: urlType
        });
        await loadEnabledSites(); // 重新載入清單
    } catch (error) {
        console.error('切換網站監控狀態失敗:', error);
        showUrlStatus('操作失敗: ' + error.message, 'error');
    }
}

async function removeSite(domain) {
    try {
        const result = await chrome.storage.sync.get(['enabledSites']);
        let enabledSites = result.enabledSites || [];

        enabledSites = enabledSites.filter(site => site !== domain);

        await chrome.storage.sync.set({ enabledSites });
        await loadEnabledSites(); // 重新載入清單

        // 如果移除的是目前網站，更新勾選狀態
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const currentDomain = new URL(tab.url).hostname;
            if (currentDomain === domain) {
                document.getElementById('enableCurrentSite').checked = false;
            }
        }

        showUrlStatus(`已移除 ${domain} 的監控`, 'success');
    } catch (error) {
        console.error('移除網站失敗:', error);
        showUrlStatus('移除失敗: ' + error.message, 'error');
    }
}

async function clearAllSites() {
    const confirmMessage = languageManager.getText('confirm_clear_all', '確定要清除所有監控網址嗎？此操作無法復原。');
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        await chrome.storage.sync.set({ enabledSites: [] });
        await loadEnabledSites(); // 重新載入清單

        // 更新目前網站的勾選狀態
        document.getElementById('enableCurrentSite').checked = false;

        showUrlStatus('已清除所有監控網址', 'success');
    } catch (error) {
        console.error('清除所有網址失敗:', error);
        showUrlStatus('清除失敗: ' + error.message, 'error');
    }
}

async function loadOverleafSetting() {
    try {
        const result = await chrome.storage.sync.get(['enabledSites', 'overleafEnabled']);
        const enabledSites = result.enabledSites || [];

        // 檢查是否有明確的 overleafEnabled 設定，如果沒有則預設為 true
        let overleafEnabled = result.overleafEnabled;
        if (overleafEnabled === undefined) {
            overleafEnabled = true; // 預設開啟
            // 同時將 www.overleaf.com 添加到啟用清單中（如果還沒有的話）
            if (!enabledSites.includes('www.overleaf.com')) {
                enabledSites.push('www.overleaf.com');
                await chrome.storage.sync.set({
                    enabledSites: enabledSites,
                    overleafEnabled: true
                });
                await loadEnabledSites(); // 重新載入清單
            } else {
                await chrome.storage.sync.set({ overleafEnabled: true });
            }
        }

        document.getElementById('enableOverleaf').checked = overleafEnabled;
    } catch (error) {
        console.error('載入 Overleaf 設定失敗:', error);
        // 發生錯誤時預設為開啟
        document.getElementById('enableOverleaf').checked = true;
    }
}

async function handleOverleafToggle() {
    try {
        const isEnabled = document.getElementById('enableOverleaf').checked;
        const overleafDomain = 'www.overleaf.com';

        const result = await chrome.storage.sync.get(['enabledSites']);
        let enabledSites = result.enabledSites || [];

        if (isEnabled) {
            // 啟用 Overleaf 監控
            if (!enabledSites.includes(overleafDomain)) {
                enabledSites.push(overleafDomain);
                showUrlStatus(`已啟用 ${overleafDomain} 的監控`, 'success');
            } else {
                showUrlStatus(`${overleafDomain} 監控已經啟用`, 'success');
            }
        } else {
            // 停用 Overleaf 監控
            enabledSites = enabledSites.filter(site => site !== overleafDomain);
            showUrlStatus(`已停用 ${overleafDomain} 的監控`, 'success');
        }

        // 儲存設定
        await chrome.storage.sync.set({
            enabledSites: enabledSites,
            overleafEnabled: isEnabled
        });

        await loadEnabledSites(); // 重新載入清單

        // 如果目前正在 Overleaf 網站，更新目前網站的勾選狀態
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const currentDomain = new URL(tab.url).hostname;
            if (currentDomain === overleafDomain) {
                document.getElementById('enableCurrentSite').checked = isEnabled;
            }
        }

    } catch (error) {
        console.error('切換 Overleaf 監控狀態失敗:', error);
        showUrlStatus('操作失敗: ' + error.message, 'error');
    }
}

// 語言相關函數
async function initializeLanguage() {
    try {
        // 獲取當前語言設定
        const currentLang = await languageManager.getCurrentLanguage();
        
        // 載入當前語言包
        await languageManager.loadLanguage(currentLang);
        
        // 設定語言選擇器
        document.getElementById('languageSelect').value = currentLang;
        
        // 翻譯頁面
        languageManager.translatePage();
        
        console.log(`Language initialized: ${currentLang}`);
    } catch (error) {
        console.error('Failed to initialize language:', error);
        // 如果初始化失敗，使用預設語言
        try {
            await languageManager.loadLanguage('zh-TW');
            languageManager.translatePage();
        } catch (fallbackError) {
            console.error('Failed to load fallback language:', fallbackError);
        }
    }
}

async function handleLanguageChange() {
    try {
        const selectedLang = document.getElementById('languageSelect').value;
        
        // 設定新語言
        const success = await languageManager.setLanguage(selectedLang);
        
        if (success) {
            // 翻譯頁面
            languageManager.translatePage();
            
            // 重新載入動態內容的翻譯
            await updateDynamicTranslations();
            
            console.log(`Language changed to: ${selectedLang}`);
        } else {
            console.error('Failed to change language');
        }
    } catch (error) {
        console.error('Error changing language:', error);
    }
}

async function updateDynamicTranslations() {
    try {
        // 更新動態載入的內容翻譯
        const currentSiteDomain = document.getElementById('currentSiteDomain');
        const currentSiteFullUrl = document.getElementById('currentSiteFullUrl');
        const willSaveAs = document.getElementById('willSaveAs');
        
        // 如果內容是預設的載入文字，更新翻譯
        if (currentSiteDomain.textContent === '載入中...' || currentSiteDomain.textContent === 'Loading...') {
            currentSiteDomain.textContent = languageManager.getText('loading', '載入中...');
        }
        if (currentSiteFullUrl.textContent === '載入中...' || currentSiteFullUrl.textContent === 'Loading...') {
            currentSiteFullUrl.textContent = languageManager.getText('loading', '載入中...');
        }
        if (willSaveAs.textContent === '載入中...' || willSaveAs.textContent === 'Loading...') {
            willSaveAs.textContent = languageManager.getText('loading', '載入中...');
        }
        
        // 更新已啟用網址清單
        await loadEnabledSites();
        
    } catch (error) {
        console.error('Error updating dynamic translations:', error);
    }
}

// 多語言狀態顯示函數
function showNotificationStatus(message, type) {
    // 嘗試翻譯狀態訊息
    const translatedMessage = getTranslatedStatusMessage(message);
    showStatus(translatedMessage, type, 'notificationStatus');
}

function showUrlStatus(message, type) {
    // 嘗試翻譯狀態訊息
    const translatedMessage = getTranslatedStatusMessage(message);
    showStatus(translatedMessage, type, 'urlStatus');
}

function showEmailStatus(message, type) {
    // 嘗試翻譯狀態訊息
    const translatedMessage = getTranslatedStatusMessage(message);
    showStatus(translatedMessage, type, 'emailStatus');
}

function getTranslatedStatusMessage(message) {
    // 狀態訊息翻譯映射
    const statusTranslations = {
        '通知設定已儲存': 'notification_settings_saved',
        '請輸入Email地址': 'please_enter_email',
        '請先完整設定EmailJS設定': 'please_setup_emailjs_first',
        'EmailJS設定已儲存': 'emailjs_settings_saved',
        'EmailJS設定已清除': 'emailjs_settings_cleared',
        '請完整填寫所有EmailJS設定欄位': 'please_fill_all_emailjs_fields',
        '已清除所有監控網址': 'all_monitoring_cleared',
        '操作失敗': 'operation_failed',
        '移除失敗': 'remove_failed',
        '清除失敗': 'clear_failed'
    };
    
    // 處理包含變數的訊息
    if (message.includes('已啟用') && message.includes('的監控')) {
        const domain = message.replace('已啟用 ', '').replace(' 的監控', '');
        return domain + languageManager.getText('monitoring_enabled', ' monitoring enabled');
    }
    
    if (message.includes('已停用') && message.includes('的監控')) {
        const domain = message.replace('已停用 ', '').replace(' 的監控', '');
        return domain + languageManager.getText('monitoring_disabled', ' monitoring disabled');
    }
    
    if (message.includes('已移除') && message.includes('的監控')) {
        const domain = message.replace('已移除 ', '').replace(' 的監控', '');
        return domain + languageManager.getText('monitoring_removed', ' monitoring removed');
    }
    
    if (message.includes('監控已經啟用')) {
        const domain = message.replace(' 監控已經啟用', '');
        return domain + languageManager.getText('monitoring_already_enabled', ' monitoring already enabled');
    }
    
    // 處理包含錯誤訊息的情況
    if (message.includes('失敗: ')) {
        const parts = message.split('失敗: ');
        const prefix = statusTranslations[parts[0] + '失敗'] || parts[0];
        return languageManager.getText(prefix, parts[0]) + ': ' + parts[1];
    }
    
    // 直接翻譯
    const translationKey = statusTranslations[message];
    if (translationKey) {
        return languageManager.getText(translationKey, message);
    }
    
    return message; // 如果找不到翻譯，返回原文
}

// 將 removeSite 函數設為全域，讓 HTML 中的 onclick 可以使用
window.removeSite = removeSite;

function showStatus(message, type, statusId = 'notificationStatus') {
    const statusDiv = document.getElementById(statusId);

    // 檢查元素是否存在
    if (!statusDiv) {
        console.error(`Status element with id '${statusId}' not found`);
        return;
    }

    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    // 3秒後隱藏狀態訊息
    setTimeout(() => {
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }, 3000);
}

