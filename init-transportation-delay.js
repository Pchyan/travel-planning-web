/**
 * 初始化交通延誤通知功能
 * 
 * 這個檔案會在 DOMContentLoaded 事件中被載入，
 * 並自動初始化交通延誤通知功能。
 */

// 當文檔載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化交通延誤通知功能
    if (typeof initTransportationDelayNotification === 'function') {
        console.log('初始化交通延誤通知功能...');
        initTransportationDelayNotification();
    } else {
        console.warn('找不到交通延誤通知初始化函數');
    }
});
