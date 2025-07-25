// 監控訊息的內容腳本
class MessageMonitor {
    constructor() {
        this.lastMessageCount = 0;
        this.observer = null;
        this.isContextValid = true;
        this.intervalId = null;
        this.instanceId = Date.now() + Math.random(); // 唯一實例ID
        this.processedMessages = new Set(); // 追蹤已處理的訊息
        this.recentlyProcessed = new Set(); // 追蹤最近處理的內容更新
        this.notificationQueue = new Map(); // 通知佇列，防止重複通知
        this.isInitialized = false; // 標記是否已完成初始化
        this.waitForPageLoad();
    }

    waitForPageLoad() {
        // 檢查頁面加載狀態
        if (document.readyState === 'complete') {
            // 頁面已經完全加載，直接初始化
            console.log('Page already loaded, starting message monitoring');
            this.init();
        } else if (document.readyState === 'interactive') {
            // DOM已加載但資源可能還在加載，等待完全加載
            console.log('Page interactive, waiting for complete load');
            window.addEventListener('load', () => {
                console.log('Page fully loaded, starting message monitoring');
                this.init();
            });
        } else {
            // 頁面還在加載中，等待DOM和資源都加載完成
            console.log('Page still loading, waiting for complete load');
            window.addEventListener('load', () => {
                console.log('Page fully loaded, starting message monitoring');
                this.init();
            });
        }
    }

    async init() {
        // 額外等待一小段時間確保動態內容也加載完成
        setTimeout(async () => {
            console.log('Initializing message monitor...');

            // 檢查目前網站是否啟用監控
            const isEnabled = await this.checkSiteEnabled();
            if (!isEnabled) {
                console.log('❌ 目前網站未啟用監控，停止初始化');
                this.handleContextInvalidated();
                return;
            }

            console.log('✅ 目前網站已啟用監控，開始初始化');

            // 初始化時計算現有訊息數量
            this.updateMessageCount();
            console.log(`Found ${this.lastMessageCount} existing messages`);

            // 設置MutationObserver監控DOM變化
            this.setupObserver();

            // 每5秒檢查一次
            this.intervalId = setInterval(() => {
                if (this.isContextValid) {
                    this.checkForNewMessages();
                }
            }, 5000);

            // 標記初始化完成，避免將初始訊息當作新訊息
            setTimeout(() => {
                this.isInitialized = true;
                console.log('✅ 初始化完成，開始監控新訊息');
            }, 1000); // 再等待1秒確保所有初始內容都已載入

            console.log('Message monitoring started successfully');
        }, 2000); // 等待2秒讓動態內容加載
    }

    updateMessageCount() {
        const messages = document.querySelectorAll('.message');
        this.lastMessageCount = messages.length;
    }

    checkForNewMessages() {
        // 只有在初始化完成後才檢查新訊息
        if (!this.isInitialized) {
            return;
        }

        const currentMessages = document.querySelectorAll('.message');
        const currentCount = currentMessages.length;

        if (currentCount > this.lastMessageCount) {
            const newMessagesCount = currentCount - this.lastMessageCount;
        //    this.handleNewMessages(newMessagesCount, currentMessages);
            this.lastMessageCount = currentCount;
        }
    }

    setupObserver() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 檢查是否有新的訊息元素被添加
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 檢查是否是完整的message元素
                            if (node.classList && node.classList.contains('message')) {
                                this.handleNewMessage(node);
                            }
                            // 檢查是否是message-content內的新p元素
                            else if (node.tagName === 'P' && mutation.target.classList && mutation.target.classList.contains('message-content')) {
                                // 找到包含這個message-content的message元素
                                const messageElement = mutation.target.closest('.message');
                                if (messageElement) {
                                    this.handleMessageContentUpdate(messageElement, node);
                                }
                            }
                            // 檢查子元素中的message（用於容器元素）
                            else {
                                const newMessages = node.querySelectorAll && node.querySelectorAll('.message');
                                if (newMessages && newMessages.length > 0) {
                                    newMessages.forEach(msg => this.handleNewMessage(msg));
                                }
                                // 檢查子元素中的p標籤（在message-content內）
                                const newParagraphs = node.querySelectorAll && node.querySelectorAll('.message-content p');
                                if (newParagraphs && newParagraphs.length > 0) {
                                    newParagraphs.forEach(p => {
                                        const messageElement = p.closest('.message');
                                        if (messageElement) {
                                            this.handleMessageContentUpdate(messageElement, p);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });

        // 開始觀察整個文檔的變化
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async handleNewMessage(messageElement) {
        if (!this.isContextValid) return;

        const messageContent = this.extractMessageContent(messageElement);

        // 使用更精確的訊息ID
        const messageId = this.generateMessageId(messageElement, messageContent);

        // 檢查是否已經處理過這個訊息
        if (this.processedMessages.has(messageId)) {
            console.log('🔄 跳過已處理的訊息');
            return;
        }

        // 標記為已處理
        this.processedMessages.add(messageId);

        // 清理舊的記錄
        if (this.processedMessages.size > 100) {
            const oldEntries = Array.from(this.processedMessages).slice(0, 50);
            oldEntries.forEach(id => this.processedMessages.delete(id));
        }

        const isOwnMessage = messageContent.name === '未知用戶';

        // 在控制台顯示新訊息
        console.log('🆕 偵測到新訊息:');
        console.log(`� 發送者 : ${isOwnMessage ? '自己' : messageContent.name}`);
        console.log(`💬 內容: ${messageContent.content}`);
        console.log(`⏰ 時間: ${new Date().toLocaleString('zh-TW')}`);

        // 檢查是否應該通知自己的訊息
        if (isOwnMessage) {
            const shouldNotify = await this.shouldNotifyOwnMessages();
            if (!shouldNotify) {
                console.log('⚠️ 跳過自己的訊息通知');
                console.log('---');
                return;
            }
        }
        console.log('---');

        // 使用統一的通知機制
        this.queueNotification(messageId, {
            type: 'NEW_MESSAGE',
            content: messageContent,
            isOwnMessage: isOwnMessage,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
    }

    async handleMessageContentUpdate(messageElement, newParagraph) {
        if (!this.isContextValid) return;

        // 當message-content內有新的p元素被添加時觸發
        const messageContent = this.extractMessageContent(messageElement);
        const newContent = newParagraph.textContent.trim();

        // 創建唯一的更新ID來防止重複處理
        const updateId = `${messageContent.element.substring(0, 50)}_${newContent}`;
        if (this.recentlyProcessed.has(updateId)) {
            return;
        }

        // 標記為已處理
        this.recentlyProcessed.add(updateId);

        // 清理舊的記錄（保持集合大小合理）
        if (this.recentlyProcessed.size > 50) {
            const oldEntries = Array.from(this.recentlyProcessed).slice(0, 25);
            oldEntries.forEach(id => this.recentlyProcessed.delete(id));
        }

        const isOwnMessage = messageContent.name === '未知用戶';

        // 在控制台顯示訊息內容更新
        console.log('� 發偵測到訊息內容更新:');
        console.log(`👤 發送者: ${isOwnMessage ? '自己' : messageContent.name}`);
        console.log(`➕ 新增內容: ${newContent}`);
        console.log(`📝 完整內容: ${messageContent.content}`);
        console.log(`⏰ 時間: ${new Date().toLocaleString('zh-TW')}`);

        // 檢查是否應該通知自己的訊息
        if (isOwnMessage) {
            const shouldNotify = await this.shouldNotifyOwnMessages();
            if (!shouldNotify) {
                console.log('⚠️ 跳過自己的訊息更新通知');
                console.log('---');
                return;
            }
        }
        console.log('---');

        // 使用統一的通知機制，基於訊息ID來避免重複通知
        const messageId = this.generateMessageId(messageElement, messageContent);
        this.queueNotification(messageId, {
            type: 'MESSAGE_CONTENT_UPDATE',
            content: messageContent,
            newContent: newContent,
            isOwnMessage: isOwnMessage,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
    }

    async handleNewMessages(count, allMessages) {
        if (!this.isContextValid) return;

        // 獲取最新的幾條訊息
        const latestMessages = Array.from(allMessages).slice(-count);

        // 過濾掉已經處理過的訊息
        const unprocessedMessages = [];
        const messageContents = [];

        for (const messageElement of latestMessages) {
            const messageContent = this.extractMessageContent(messageElement);
            const messageId = this.generateMessageId(messageElement, messageContent);

            // 只處理未處理過的訊息
            if (!this.processedMessages.has(messageId)) {
                unprocessedMessages.push(messageElement);
                messageContents.push(messageContent);
                // 標記為已處理
                this.processedMessages.add(messageId);
            }
        }

        // 如果沒有真正的新訊息，直接返回
        if (unprocessedMessages.length === 0) {
            console.log('🔄 定時檢查：所有訊息都已處理過，跳過');
            return;
        }

        // 檢查是否應該通知自己的訊息
        const shouldNotifyOwn = await this.shouldNotifyOwnMessages();
        const filteredMessages = shouldNotifyOwn ? messageContents :
            messageContents.filter(msg => msg.name !== '未知用戶');

        // 在控制台顯示真正的新訊息
        console.log(`📢 定時檢查偵測到 ${unprocessedMessages.length} 條新訊息:`);
        messageContents.forEach((msg, index) => {
            const isOwn = msg.name === '未知用戶';
            const displayName = isOwn ? '自己' : msg.name;
            const skipIndicator = (isOwn && !shouldNotifyOwn) ? ' (跳過通知)' : '';
            console.log(`${index + 1}. 👤 ${displayName}: 💬 ${msg.content}${skipIndicator}`);
        });
        console.log(`⏰ 時間: ${new Date().toLocaleString('zh-TW')}`);

        if (filteredMessages.length === 0) {
            console.log('⚠️ 所有訊息都是自己發送的，跳過通知');
        }
        console.log('---');

        // 只發送需要通知的訊息
        if (filteredMessages.length > 0) {
            this.sendMessageSafely({
                type: 'NEW_MESSAGES',
                count: filteredMessages.length,
                messages: filteredMessages,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        }
    }

    async testConnection() {
        return new Promise((resolve) => {
            try {
                if (typeof chrome === 'undefined' ||
                    !chrome.runtime ||
                    !chrome.runtime.sendMessage) {
                    resolve(false);
                    return;
                }

                // 發送一個測試訊息
                chrome.runtime.sendMessage({ type: 'CONNECTION_TEST' }, () => {
                    if (chrome.runtime.lastError) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            } catch (error) {
                resolve(false);
            }
        });
    }

    async sendMessageSafely(message) {
        // 如果context已經無效，直接返回
        if (!this.isContextValid) {
            return;
        }

        // 檢查是否為當前活躍實例
        if (window.messageMonitorInstance !== this) {
            return;
        }

        // 測試連接是否有效
        const isConnected = await this.testConnection();
        if (!isConnected) {
            // 靜默處理連接失效，不顯示錯誤訊息
            this.handleContextInvalidated();
            return;
        }

        try {
            chrome.runtime.sendMessage(message);
        } catch (error) {
            // 靜默處理錯誤
            this.handleContextInvalidated();
        }
    }

    queueNotification(messageId, notificationData) {
        // 檢查是否已經有相同訊息的通知在佇列中
        if (this.notificationQueue.has(messageId)) {
            const existingNotification = this.notificationQueue.get(messageId);

            // 如果現有的是新訊息通知，而新的是內容更新，則保持新訊息通知
            if (existingNotification.type === 'NEW_MESSAGE' && notificationData.type === 'MESSAGE_CONTENT_UPDATE') {
                console.log('📝 合併通知：新訊息已包含內容更新，跳過重複通知');
                return;
            }

            // 如果現有的是內容更新，而新的是新訊息，則更新為新訊息通知
            if (existingNotification.type === 'MESSAGE_CONTENT_UPDATE' && notificationData.type === 'NEW_MESSAGE') {
                console.log('📝 合併通知：將內容更新升級為新訊息通知');
                this.notificationQueue.set(messageId, notificationData);
                return;
            }

            // 其他情況跳過重複通知
            console.log('📝 跳過重複通知：相同訊息已在佇列中');
            return;
        }

        // 添加到通知佇列
        this.notificationQueue.set(messageId, notificationData);

        // 延遲發送通知，給其他相關事件一些時間來合併
        setTimeout(() => {
            this.processNotificationQueue(messageId);
        }, 100); // 100ms 延遲，減少延遲時間
    }

    processNotificationQueue(messageId) {
        if (!this.notificationQueue.has(messageId)) {
            return; // 通知已被處理或取消
        }

        const notificationData = this.notificationQueue.get(messageId);
        this.notificationQueue.delete(messageId);

        // 發送通知
        console.log('📤 發送統一通知');
        this.sendMessageSafely(notificationData);
    }

    async checkSiteEnabled() {
        try {
            if (typeof chrome === 'undefined' || !chrome.storage) {
                return true; // 如果無法存取 Chrome API，預設啟用
            }

            const result = await chrome.storage.sync.get(['enabledSites', 'urlType']);
            const enabledSites = result.enabledSites || [];
            const urlType = result.urlType || 'domain';

            // 如果沒有設定任何網址，預設啟用所有網址
            if (enabledSites.length === 0) {
                console.log('🔧 尚未設定監控網址，預設啟用所有網址');
                return true;
            }

            const currentDomain = window.location.hostname;
            const currentFullUrl = window.location.hostname + window.location.pathname;

            // 同時檢查域名和完整URL，任一匹配即啟用監控
            const domainEnabled = enabledSites.includes(currentDomain);
            const fullUrlEnabled = enabledSites.includes(currentFullUrl);
            const isEnabled = domainEnabled || fullUrlEnabled;

            console.log(`🔍 檢查網址監控狀態:`);
            console.log(`🌐 域名檢查: ${currentDomain} - ${domainEnabled ? '已啟用' : '未啟用'}`);
            console.log(`🔗 完整網址檢查: ${currentFullUrl} - ${fullUrlEnabled ? '已啟用' : '未啟用'}`);
            console.log(`✅ 最終結果: ${isEnabled ? '啟用監控' : '停用監控'} (${domainEnabled && fullUrlEnabled ? '域名+完整網址都匹配' : domainEnabled ? '域名匹配' : fullUrlEnabled ? '完整網址匹配' : '無匹配'})`);
            console.log(`📋 已啟用的網址清單: ${enabledSites.join(', ')}`);

            return isEnabled;
        } catch (error) {
            console.log('Failed to check site enabled status:', error);
            return true; // 發生錯誤時預設啟用
        }
    }

    async shouldNotifyOwnMessages() {
        try {
            if (typeof chrome === 'undefined' || !chrome.storage) {
                return true; // 預設通知
            }

            const result = await chrome.storage.sync.get(['notificationSettings']);
            const settings = result.notificationSettings;

            // 如果沒有設定或設定為undefined，預設為true（通知自己的訊息）
            return settings ? (settings.notifyOwnMessages !== false) : true;
        } catch (error) {
            console.log('Failed to get notification settings:', error);
            return true; // 發生錯誤時預設通知
        }
    }

    handleContextInvalidated() {
        // 當擴充功能context被invalidated時的處理
        console.log('Extension context invalidated, stopping message monitoring');

        // 設置context為無效
        this.isContextValid = false;

        // 停止observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // 清理interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // 可以選擇顯示一個提示給用戶
        console.log('Please refresh the page to restart message monitoring');
    }

    generateMessageId(messageElement, messageContent) {
        // 生成穩定的訊息ID，用於去重
        const position = Array.from(document.querySelectorAll('.message')).indexOf(messageElement);
        const contentHash = messageContent.content.substring(0, 100);
        const nameHash = messageContent.name;
        const elementHash = messageContent.element.substring(0, 200);
        return `${position}_${nameHash}_${contentHash}_${elementHash}`.replace(/\s+/g, '_');
    }

    extractMessageContent(messageElement) {
        // 提取訊息內容
        const nameElement = messageElement.querySelector('.name');
        const contentElement = messageElement.querySelector('.message-content');

        let content = '';
        if (contentElement) {
            // 如果message-content內有多個p元素，將它們合併
            const paragraphs = contentElement.querySelectorAll('p');
            if (paragraphs.length > 0) {
                content = Array.from(paragraphs).map(p => p.textContent.trim()).join(' ');
            } else {
                content = contentElement.textContent.trim();
            }
        } else {
            content = messageElement.textContent.trim();
        }

        return {
            name: nameElement ? nameElement.textContent.trim() : '未知用戶',
            content: content,
            element: messageElement.outerHTML
        };
    }
}

// 防止多個實例同時運行
if (window.messageMonitorInstance) {
    console.log('Message monitor already exists, cleaning up old instance');
    window.messageMonitorInstance.handleContextInvalidated();
}

// 初始化監控器
window.messageMonitorInstance = new MessageMonitor();
const monitor = window.messageMonitorInstance;