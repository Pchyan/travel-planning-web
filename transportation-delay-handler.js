/**
 * 交通延誤處理模組 - 提供交通延誤通知和替代路線建議的 UI 處理
 */

// 處理交通延誤通知
function handleTransportationDelay(event) {
    const notification = event.detail;
    console.log('收到交通延誤通知:', notification);

    // 取得通知容器
    const alertContainer = document.getElementById('transportation-alerts');
    if (!alertContainer) {
        console.error('找不到交通延誤通知容器');
        return;
    }

    // 顯示通知容器
    alertContainer.classList.remove('hidden');

    // 設置延誤訊息
    const delayMessage = alertContainer.querySelector('.delay-message');
    if (delayMessage) {
        delayMessage.textContent = notification.message;
    }

    // 設置延誤時間
    const delayTime = alertContainer.querySelector('.delay-time');
    if (delayTime) {
        const timestamp = new Date(notification.timestamp);
        delayTime.textContent = `更新時間: ${timestamp.toLocaleTimeString()}`;
    }

    // 顯示替代路線建議
    const alternativesList = alertContainer.querySelector('.alternatives-list');
    if (alternativesList && notification.alternatives && notification.alternatives.alternatives) {
        // 清空現有建議
        alternativesList.innerHTML = '';

        // 添加新建議
        notification.alternatives.alternatives.forEach(route => {
            const routeItem = document.createElement('div');
            routeItem.className = 'alternative-route';

            // 根據交通方式選擇圖標
            let modeIcon = '';
            switch(route.mode) {
                case '步行':
                    modeIcon = '<i class="fas fa-walking"></i>';
                    break;
                case '公車':
                    modeIcon = '<i class="fas fa-bus"></i>';
                    break;
                case '捷運':
                case '地鐵':
                    modeIcon = '<i class="fas fa-subway"></i>';
                    break;
                case '火車':
                    modeIcon = '<i class="fas fa-train"></i>';
                    break;
                case '高鐵':
                case '新幹線':
                    modeIcon = '<i class="fas fa-train"></i>';
                    break;
                case '飛機':
                    modeIcon = '<i class="fas fa-plane"></i>';
                    break;
                case '自行車':
                    modeIcon = '<i class="fas fa-bicycle"></i>';
                    break;
                case '機車':
                    modeIcon = '<i class="fas fa-motorcycle"></i>';
                    break;
                case '汽車':
                    modeIcon = '<i class="fas fa-car"></i>';
                    break;
                default:
                    modeIcon = '<i class="fas fa-route"></i>';
            }

            // 格式化時間
            const departureTime = new Date(route.departureTime);
            const arrivalTime = new Date(route.scheduledArrivalTime);

            // 設置路線內容
            routeItem.innerHTML = `
                <div class="route-info">
                    <div class="route-mode">${modeIcon} ${route.mode}</div>
                    <div class="route-details">
                        <div class="route-time"><i class="far fa-clock"></i> ${departureTime.toLocaleTimeString()} - ${arrivalTime.toLocaleTimeString()}</div>
                        <div class="route-delay"><i class="fas fa-exclamation-triangle"></i> 延誤: ${route.delay} 分鐘</div>
                        <div class="route-crowd"><i class="fas fa-users"></i> 擁擠度: ${route.crowdLevel}/5</div>
                    </div>
                </div>
                <div class="route-actions">
                    <button onclick="openScheduleQuery('${route.mode}', '${route.from}', '${route.to}')">查詢</button>
                </div>
            `;

            alternativesList.appendChild(routeItem);
        });
    }

    // 震動提醒（如果支援）
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }

    // 播放提示音效（如果支援）
    try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alert-quick-chime-766.mp3');
        audio.play();
    } catch (e) {
        console.warn('無法播放提示音:', e);
    }
}

// 測試交通延誤通知
function testTransportationDelay() {
    if (typeof TransportationService === 'undefined') {
        console.error('交通服務模組未找到');
        alert('交通服務模組未找到，請確保 transportation-service.js 已正確載入');
        return;
    }

    console.log('測試交通延誤通知...');

    // 模擬交通路線
    const mockRouteId = 'ROUTE_捷運_台北車站_松山機場_0';

    // 直接創建一個模擬的延誤通知
    const mockStatus = {
        routeId: mockRouteId,
        delay: 15, // 15 分鐘延誤
        crowdLevel: 4, // 擠擠的
        status: '延誤',
        timestamp: new Date().toISOString()
    };

    const mockNotification = {
        routeId: mockRouteId,
        status: mockStatus,
        timestamp: new Date().toISOString(),
        message: `捷運延誤通知: 台北車站到松山機場的班次延誤了 ${mockStatus.delay} 分鐘`
    };

    // 立即獲取替代路線建議
    TransportationService.suggestAlternativeRoutes(mockRouteId, '延誤')
        .then(alternatives => {
            // 將替代路線添加到通知中
            mockNotification.alternatives = alternatives;

            // 觸發延誤通知事件
            const event = new CustomEvent('transportation-delay', { detail: mockNotification });
            window.dispatchEvent(event);

            console.log('已發送模擬交通延誤通知，包含替代路線建議');
        })
        .catch(error => {
            console.error('獲取替代路線時發生錯誤:', error);

            // 即使沒有替代路線，也發送延誤通知
            const event = new CustomEvent('transportation-delay', { detail: mockNotification });
            window.dispatchEvent(event);

            console.log('已發送模擬交通延誤通知，無替代路線建議');
        });

    console.log('已啟動交通延誤測試');
}

// 開啟交通時刻表查詢
function openScheduleQuery(mode, from, to) {
    console.log(`查詢交通時刻表: ${mode} 從 ${from} 到 ${to}`);

    // 根據交通方式選擇適當的查詢網站
    let queryUrl = '';

    switch(mode) {
        case '捷運':
            queryUrl = `https://web.metro.taipei/pages/tw/ticketroutetime`;
            break;
        case '高鐵':
            queryUrl = `https://www.thsrc.com.tw/ArticleContent/a3b630bb-1066-4352-a1ef-58c7b4e8ef7c`;
            break;
        case '火車':
            queryUrl = `https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/gobytime`;
            break;
        case '公車':
            queryUrl = `https://ebus.gov.taipei/`;
            break;
        case '飛機':
            queryUrl = `https://www.skyscanner.com.tw/`;
            break;
        default:
            queryUrl = `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
    }

    // 在新視窗中開啟查詢網站
    window.open(queryUrl, '_blank');
}

// 初始化交通延誤通知功能
function initTransportationDelayNotification() {
    if (typeof TransportationService === 'undefined') {
        console.warn('交通服務模組未找到');
        return;
    }

    // 初始化交通服務模組
    TransportationService.init();

    // 註冊交通延誤事件監聽器
    window.addEventListener('transportation-delay', handleTransportationDelay);

    // 設置關閉交通延誤通知的事件
    const closeAlertBtn = document.getElementById('close-transportation-alert');
    if (closeAlertBtn) {
        closeAlertBtn.addEventListener('click', function() {
            const alertContainer = document.getElementById('transportation-alerts');
            if (alertContainer) {
                alertContainer.classList.add('hidden');
            }
        });
    }

    // 設置測試交通延誤按鈕的事件
    const testDelayBtn = document.getElementById('test-transportation-delay');
    if (testDelayBtn) {
        testDelayBtn.addEventListener('click', function() {
            console.log('測試交通延誤按鈕被點擊');
            testTransportationDelay();
        });
    }

    console.log('交通延誤通知功能已初始化');
}

// 如果在 Node.js 環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleTransportationDelay,
        testTransportationDelay,
        openScheduleQuery,
        initTransportationDelayNotification
    };
}
