// 載入語言管理器到 background script
importScripts('languages/language-manager.js');

// 背景腳本處理訊息和email發送
class EmailService {
  constructor() {
    this.emailEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
  }

  async sendEmail(to, subject, content) {
    try {
      // 獲取儲存的email設定
      const settings = await chrome.storage.sync.get(['emailSettings']);
      const emailSettings = settings.emailSettings;

      if (!emailSettings || !emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
        console.error('Email設定不完整');
        return false;
      }

      const fromName = getBackgroundText('message_monitor', '訊息監控器');
      const emailData = {
        service_id: emailSettings.serviceId,
        template_id: emailSettings.templateId,
        user_id: emailSettings.publicKey,
        template_params: {
          to_email: to,
          subject: subject,
          message: content,
          from_name: fromName
        }
      };

      const response = await fetch(this.emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      return response.ok;
    } catch (error) {
      console.error('發送email失敗:', error);
      return false;
    }
  }
}

const emailService = new EmailService();

// 創建背景腳本的語言管理器實例
const backgroundLanguageManager = new LanguageManager();

// 初始化語言設定
async function initializeBackgroundLanguage() {
  try {
    const currentLang = await backgroundLanguageManager.getCurrentLanguage();
    await backgroundLanguageManager.loadLanguage(currentLang);
    console.log(`Background language initialized: ${currentLang}`);
  } catch (error) {
    console.error('Failed to initialize background language:', error);
    // 回退到預設語言
    try {
      await backgroundLanguageManager.loadLanguage('zh-TW');
    } catch (fallbackError) {
      console.error('Failed to load fallback language:', fallbackError);
    }
  }
}

// 獲取翻譯文字的輔助函數
function getBackgroundText(key, defaultText = '') {
  return backgroundLanguageManager.getText(key, defaultText);
}

// 獲取網頁favicon的函數
async function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

    // 嘗試常見的favicon路徑
    const faviconPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png'
    ];

    // 嘗試每個路徑，找到第一個可用的
    for (const path of faviconPaths) {
      const faviconUrl = baseUrl + path;
      try {
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        if (response.ok) {
          return faviconUrl;
        }
      } catch (error) {
        // 繼續嘗試下一個路徑
        continue;
      }
    }

    // 如果都找不到，使用Google的favicon服務
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;

  } catch (error) {
    console.error('獲取favicon失敗:', error);
    // 返回一個預設的圖示URL
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

// 初始化背景語言設定
initializeBackgroundLanguage();

// 監聽來自content script的訊息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'CONNECTION_TEST') {
    // 簡單的連接測試，直接回應成功
    sendResponse({ status: 'connected' });
    return true;
  } else if (message.type === 'NEW_MESSAGE') {
    await handleNewMessage(message);
  } else if (message.type === 'NEW_MESSAGES') {
    await handleNewMessages(message);
  } else if (message.type === 'MESSAGE_CONTENT_UPDATE') {
    await handleMessageContentUpdate(message);
  }
});

async function handleNewMessage(data) {
  // 獲取用戶設定
  const settings = await chrome.storage.sync.get(['notificationSettings']);
  const notificationSettings = settings.notificationSettings;

  if (!notificationSettings || !notificationSettings.enabled) {
    return;
  }

  // 顯示瀏覽器通知
  const iconUrl = await getFaviconUrl(data.url);
  const senderName = data.isOwnMessage ? getBackgroundText('you', '您') : data.content.name;
  const notificationTitle = getBackgroundText('new_message_notification', '新訊息');
  const fromText = getBackgroundText('from', '來自');

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: notificationTitle,
    message: `${fromText} ${senderName}: ${data.content.content.substring(0, 100)}...`
  });

  // 發送email通知
  if (notificationSettings.emailEnabled && notificationSettings.emailAddress) {
    const emailSubjectTemplate = getBackgroundText('email_new_message_subject', '新訊息通知');
    const subject = `${emailSubjectTemplate} - ${new URL(data.url).hostname}`;

    const websiteText = getBackgroundText('website', '網站');
    const timeText = getBackgroundText('time', '時間');
    const senderText = getBackgroundText('sender', '發送者');
    const contentText = getBackgroundText('content', '內容');

    const emailContent = `
${websiteText}: ${data.url}
${timeText}: ${new Date(data.timestamp).toLocaleString()}
${senderText}: ${senderName}
${contentText}: ${data.content.content}
    `;

    await emailService.sendEmail(
      notificationSettings.emailAddress,
      subject,
      emailContent
    );
  }
}

async function handleNewMessages(data) {
  const settings = await chrome.storage.sync.get(['notificationSettings']);
  const notificationSettings = settings.notificationSettings;

  if (!notificationSettings || !notificationSettings.enabled) {
    return;
  }

  // 顯示瀏覽器通知
  const iconUrl = await getFaviconUrl(data.url);
  const notificationTitle = getBackgroundText('multiple_messages_notification', '新訊息');
  const receivedText = getBackgroundText('received_messages', '收到');
  const messagesCountText = getBackgroundText('messages_count', '條新訊息');

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: notificationTitle,
    message: `${receivedText} ${data.count} ${messagesCountText}`
  });

  // 發送email通知
  if (notificationSettings.emailEnabled && notificationSettings.emailAddress) {
    const emailSubjectTemplate = getBackgroundText('email_multiple_messages_subject', '新訊息通知');
    const subject = `${emailSubjectTemplate} (${data.count}條) - ${new URL(data.url).hostname}`;

    const websiteText = getBackgroundText('website', '網站');
    const timeText = getBackgroundText('time', '時間');
    const messageCountText = getBackgroundText('message_count', '新訊息數量');
    const messageListText = getBackgroundText('message_list', '訊息內容');
    const senderText = getBackgroundText('sender', '發送者');
    const contentText = getBackgroundText('content', '內容');

    let emailContent = `
${websiteText}: ${data.url}
${timeText}: ${new Date(data.timestamp).toLocaleString()}
${messageCountText}: ${data.count}

${messageListText}:
`;

    data.messages.forEach((msg, index) => {
      const senderName = msg.name === '未知用戶' ? getBackgroundText('you', '您') : msg.name;
      emailContent += `
${index + 1}. ${senderText}: ${senderName}
   ${contentText}: ${msg.content}
`;
    });

    await emailService.sendEmail(
      notificationSettings.emailAddress,
      subject,
      emailContent
    );
  }
}
async function handleMessageContentUpdate(data) {
  const settings = await chrome.storage.sync.get(['notificationSettings']);
  const notificationSettings = settings.notificationSettings;

  if (!notificationSettings || !notificationSettings.enabled) {
    return;
  }

  // 顯示瀏覽器通知
  const iconUrl = await getFaviconUrl(data.url);
  const senderName = data.isOwnMessage ? getBackgroundText('you', '您') : data.content.name;
  const notificationTitle = getBackgroundText('message_update_notification', '訊息更新');
  const addedContentText = getBackgroundText('added_content', '新增內容');

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: notificationTitle,
    message: `${senderName} ${addedContentText}: ${data.newContent.substring(0, 50)}...`
  });

  // 發送email通知
  if (notificationSettings.emailEnabled && notificationSettings.emailAddress) {
    const emailSubjectTemplate = getBackgroundText('email_content_update_subject', '訊息內容更新通知');
    const subject = `${emailSubjectTemplate} - ${new URL(data.url).hostname}`;

    const websiteText = getBackgroundText('website', '網站');
    const timeText = getBackgroundText('time', '時間');
    const senderText = getBackgroundText('sender', '發送者');
    const newContentText = getBackgroundText('new_content', '新增內容');
    const fullContentText = getBackgroundText('full_content', '完整訊息內容');

    const emailContent = `
${websiteText}: ${data.url}
${timeText}: ${new Date(data.timestamp).toLocaleString()}
${senderText}: ${senderName}
${newContentText}: ${data.newContent}
${fullContentText}: ${data.content.content}
    `;

    await emailService.sendEmail(
      notificationSettings.emailAddress,
      subject,
      emailContent
    );
  }
}