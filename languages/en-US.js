// English language pack
const en_US = {
    // Titles and main sections
    title: "Message Monitor Settings",

    // Notification settings
    notification_settings: "Notification Settings",
    enable_notifications: "Enable Notifications",
    enable_email_notifications: "Enable Email Notifications",
    notify_own_messages: "Notify Own Messages",
    email_address: "Email Address",
    save_notification_settings: "Save Notification Settings",

    // URL monitoring settings
    url_monitoring_settings: "URL Monitoring Settings",
    enable_overleaf_monitoring: "Enable Overleaf Monitoring",
    overleaf_description: "Quick enable message monitoring for Overleaf, enabled by default",
    monitoring_scope: "Monitoring Scope",
    entire_domain: "Entire Domain",
    entire_domain_example: "e.g.: example.com",
    full_url: "Full URL",
    full_url_example: "e.g.: example.com/page",
    monitor_current_site: "Monitor Current Site",
    domain: "Domain",
    full_url_text: "Full URL",
    will_save: "Will Save",
    loading: "Loading...",
    enabled_monitoring_urls: "Enabled Monitoring URLs",
    no_enabled_urls: "No monitoring URLs enabled yet",
    remove: "Remove",
    clear_all_sites: "Clear All Monitoring URLs",

    // EmailJS settings
    emailjs_settings: "EmailJS Settings",
    emailjs_description: "Please register and configure service at EmailJS first",
    service_id: "Service ID",
    template_id: "Template ID",
    public_key: "Public Key",
    save_emailjs_settings: "Save EmailJS Settings",

    // Language settings
    language_settings: "Language Settings",
    select_language: "Select Language",
    chinese: "中文",
    english: "English",

    // Status messages
    notification_settings_saved: "Notification settings saved",
    please_enter_email: "Please enter email address",
    please_setup_emailjs_first: "Please setup EmailJS settings first",
    save_notification_failed: "Failed to save notification settings",

    emailjs_settings_saved: "EmailJS settings saved",
    emailjs_settings_cleared: "EmailJS settings cleared",
    please_fill_all_emailjs_fields: "Please fill in all EmailJS fields",
    save_emailjs_failed: "Failed to save EmailJS settings",

    monitoring_enabled: " monitoring enabled",
    monitoring_disabled: " monitoring disabled",
    monitoring_removed: " monitoring removed",
    all_monitoring_cleared: "All monitoring URLs cleared",
    monitoring_already_enabled: " monitoring already enabled",
    operation_failed: "Operation failed",
    remove_failed: "Remove failed",
    clear_failed: "Clear failed",

    // Confirmation dialogs
    confirm_clear_all: "Are you sure you want to clear all monitoring URLs? This action cannot be undone.",

    // Console messages
    console_new_message: "New message detected",
    console_content_update: "Message content update detected",
    console_multiple_messages: "New messages detected",
    console_sender: "Sender",
    console_content: "Content",
    console_new_content: "New Content",
    console_full_content: "Full Content",
    console_time: "Time",
    console_self: "Self",
    console_skip_own_notification: "Skip own message notification",
    console_skip_own_update_notification: "Skip own message update notification",
    console_skip_notification: "Skip notification",
    console_all_own_messages: "All messages are own messages, skip notification",
    console_merge_notification: "Merge notification: New message already includes content update, skip duplicate notification",
    console_upgrade_notification: "Merge notification: Upgrade content update to new message notification",
    console_skip_duplicate: "Skip duplicate notification: Same message already in queue",
    console_send_unified: "Send unified notification",
  
  // Notification related translations
  new_message_notification: "New Message",
  message_update_notification: "Message Update",
  multiple_messages_notification: "New Messages",
  you: "You",
  from: "From",
  added_content: "added content",
  received_messages: "Received",
  messages_count: "new messages",
  
  // Email related translations
  email_new_message_subject: "New Message Notification",
  email_multiple_messages_subject: "New Messages Notification",
  email_content_update_subject: "Message Content Update Notification",
  website: "Website",
  time: "Time",
  sender: "Sender",
  content: "Content",
  new_content: "New Content",
  full_content: "Full Message Content",
  message_count: "New Message Count",
  message_list: "Message Content",
  
  // EmailJS from_name
  message_monitor: "Message Monitor"
};

// Export language pack
if (typeof module !== 'undefined' && module.exports) {
    module.exports = en_US;
} else if (typeof self !== 'undefined') {
    // Service Worker environment
    self.en_US = en_US;
} else if (typeof window !== 'undefined') {
    // Browser environment
    window.en_US = en_US;
}