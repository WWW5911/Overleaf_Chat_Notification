// 繁體中文語言包
const zh_TW = {
  // 標題和主要區塊
  title: "訊息監控設定",
  
  // 通知設定
  notification_settings: "通知設定",
  enable_notifications: "啟用通知",
  enable_email_notifications: "啟用Email通知",
  notify_own_messages: "通知自己發送的訊息",
  email_address: "Email地址",
  save_notification_settings: "儲存通知設定",
  
  // 網址監控設定
  url_monitoring_settings: "網址監控設定",
  enable_overleaf_monitoring: "啟用 Overleaf 監控",
  overleaf_description: "快速啟用對 Overleaf 的訊息監控，預設開啟",
  monitoring_scope: "監控範圍",
  entire_domain: "整個域名",
  entire_domain_example: "例: example.com",
  full_url: "完整網址",
  full_url_example: "例: example.com/page",
  monitor_current_site: "監控目前網站",
  domain: "域名",
  full_url_text: "完整網址",
  will_save: "將儲存",
  loading: "載入中...",
  enabled_monitoring_urls: "已啟用監控的網址",
  no_enabled_urls: "尚未啟用任何網址監控",
  remove: "移除",
  clear_all_sites: "清除所有監控網址",
  
  // EmailJS設定
  emailjs_settings: "EmailJS設定",
  emailjs_description: "請先到 EmailJS 註冊並設定服務",
  service_id: "Service ID",
  template_id: "Template ID",
  public_key: "Public Key",
  save_emailjs_settings: "儲存EmailJS設定",
  
  // 語言設定
  language_settings: "語言設定",
  select_language: "選擇語言",
  chinese: "中文",
  english: "English",
  
  // 狀態訊息
  notification_settings_saved: "通知設定已儲存",
  please_enter_email: "請輸入Email地址",
  please_setup_emailjs_first: "請先完整設定EmailJS設定",
  save_notification_failed: "儲存通知設定失敗",
  
  emailjs_settings_saved: "EmailJS設定已儲存",
  emailjs_settings_cleared: "EmailJS設定已清除",
  please_fill_all_emailjs_fields: "請完整填寫所有EmailJS設定欄位",
  save_emailjs_failed: "儲存EmailJS設定失敗",
  
  monitoring_enabled: "的監控已啟用",
  monitoring_disabled: "的監控已停用",
  monitoring_removed: "的監控已移除",
  all_monitoring_cleared: "已清除所有監控網址",
  monitoring_already_enabled: "監控已經啟用",
  operation_failed: "操作失敗",
  remove_failed: "移除失敗",
  clear_failed: "清除失敗",
  
  // 確認對話框
  confirm_clear_all: "確定要清除所有監控網址嗎？此操作無法復原。",
  
  // 控制台訊息
  console_new_message: "偵測到新訊息",
  console_content_update: "偵測到訊息內容更新",
  console_multiple_messages: "偵測到新訊息",
  console_sender: "發送者",
  console_content: "內容",
  console_new_content: "新增內容",
  console_full_content: "完整內容",
  console_time: "時間",
  console_self: "自己",
  console_skip_own_notification: "跳過自己的訊息通知",
  console_skip_own_update_notification: "跳過自己的訊息更新通知",
  console_skip_notification: "跳過通知",
  console_all_own_messages: "所有訊息都是自己發送的，跳過通知",
  console_merge_notification: "合併通知：新訊息已包含內容更新，跳過重複通知",
  console_upgrade_notification: "合併通知：將內容更新升級為新訊息通知",
  console_skip_duplicate: "跳過重複通知：相同訊息已在佇列中",
  console_send_unified: "發送統一通知",
  
  // 通知相關翻譯
  new_message_notification: "新訊息",
  message_update_notification: "訊息更新",
  multiple_messages_notification: "新訊息",
  you: "您",
  from: "來自",
  added_content: "新增內容",
  received_messages: "收到",
  messages_count: "條新訊息",
  
  // Email 相關翻譯
  email_new_message_subject: "新訊息通知",
  email_multiple_messages_subject: "新訊息通知",
  email_content_update_subject: "訊息內容更新通知",
  website: "網站",
  time: "時間",
  sender: "發送者",
  content: "內容",
  new_content: "新增內容",
  full_content: "完整訊息內容",
  message_count: "新訊息數量",
  message_list: "訊息內容",
  
  // EmailJS from_name
  message_monitor: "訊息監控器"
};

// 導出語言包
if (typeof module !== 'undefined' && module.exports) {
  module.exports = zh_TW;
} else if (typeof self !== 'undefined') {
  // Service Worker 環境
  self.zh_TW = zh_TW;
} else if (typeof window !== 'undefined') {
  // 瀏覽器環境
  window.zh_TW = zh_TW;
}